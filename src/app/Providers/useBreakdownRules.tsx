'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiRequestWrapper } from '@/lib/api-request-wrapper';
import { isE2EMode } from '@/utils/is-e2e-mode';
import {
  MAX_BREAKDOWN_RULES,
  RuleCatalogCategory,
} from '../types/breakdown-rules-types';
import { LanguageEnum } from '../languages';

const SAVE_DEBOUNCE_MS = 800;

const enabledRulesStorageKey = (language: string) =>
  `${language}-breakdownRules`;
const catalogStorageKey = (language: string) => `${language}-ruleCatalog`;

const readStorage = <T,>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable/full: state still works in memory
  }
};

export interface RuleLabel {
  name: string;
  groupName: string;
  categoryTitle: string;
  description?: string;
}

export type CatalogStatus = 'loading' | 'loaded' | 'error';

export interface BreakdownRulesContextTypes {
  catalog: RuleCatalogCategory[];
  catalogStatus: CatalogStatus;
  reloadCatalog: () => void;
  enabledRuleKeys: string[];
  isEnabled: (key: string) => boolean;
  toggleRule: (key: string) => void;
  setRules: (keys: string[]) => void;
  getRuleLabel: (key: string) => RuleLabel | undefined;
  maxRules: number;
}

export const BreakdownRulesContext = createContext<BreakdownRulesContextTypes>(
  {
    catalog: [],
    catalogStatus: 'loading',
    reloadCatalog: () => {},
    enabledRuleKeys: [],
    isEnabled: () => false,
    toggleRule: () => {},
    setRules: () => {},
    getRuleLabel: () => undefined,
    maxRules: MAX_BREAKDOWN_RULES,
  },
);

export const useBreakdownRules = () => useContext(BreakdownRulesContext);

// Enabled rules are persisted per language: localStorage for instant load,
// RTDB `${language}/settings/breakdownRules` as the source of truth.
export const useBreakdownRulesState = (
  language: LanguageEnum,
): BreakdownRulesContextTypes => {
  const [catalog, setCatalog] = useState<RuleCatalogCategory[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>('loading');
  const [catalogRequestId, setCatalogRequestId] = useState(0);
  const [enabledRuleKeys, setEnabledRuleKeys] = useState<string[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingSaveRef = useRef(false);

  useEffect(() => {
    if (!language) return;
    const cachedKeys = readStorage<string[]>(enabledRulesStorageKey(language));
    setEnabledRuleKeys(cachedKeys ?? []);

    // localStorage is the source of truth once populated (even with []);
    // the DB is only read after localStorage has been cleared.
    if (cachedKeys || isE2EMode()) return;
    let isCancelled = false;

    apiRequestWrapper<{ breakdownRules: string[] }>({
      url: '/api/breakdownRules',
      body: { language },
    })
      .then((res) => {
        if (isCancelled || hasPendingSaveRef.current) return;
        const keys = res?.breakdownRules ?? [];
        setEnabledRuleKeys(keys);
        writeStorage(enabledRulesStorageKey(language), keys);
      })
      .catch((error) => console.error('## breakdownRules load', error));

    return () => {
      isCancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (!language) return;
    const cachedCatalog =
      readStorage<RuleCatalogCategory[]>(catalogStorageKey(language)) ?? [];
    setCatalog(cachedCatalog);
    setCatalogStatus(cachedCatalog.length > 0 ? 'loaded' : 'loading');

    // Only fetched when localStorage has no catalog (or on manual retry).
    if (cachedCatalog.length > 0 || isE2EMode()) return;
    let isCancelled = false;

    apiRequestWrapper<RuleCatalogCategory[]>({
      url: '/api/ruleCatalog',
      body: { language },
    })
      .then((res) => {
        if (isCancelled) return;
        if (!Array.isArray(res)) throw new Error('Invalid rule catalog');
        setCatalog(res);
        setCatalogStatus('loaded');
        writeStorage(catalogStorageKey(language), res);
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error('## ruleCatalog load', error);
        setCatalogStatus('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [language, catalogRequestId]);

  const reloadCatalog = useCallback(
    () => setCatalogRequestId((id) => id + 1),
    [],
  );

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    },
    [],
  );

  const setRules = useCallback(
    (keys: string[]) => {
      const nextKeys = [...new Set(keys)].slice(0, MAX_BREAKDOWN_RULES);
      setEnabledRuleKeys(nextKeys);
      writeStorage(enabledRulesStorageKey(language), nextKeys);

      hasPendingSaveRef.current = true;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        apiRequestWrapper({
          url: '/api/updateBreakdownRules',
          body: { language, ruleKeys: nextKeys },
        })
          .catch((error) => console.error('## updateBreakdownRules', error))
          .finally(() => {
            hasPendingSaveRef.current = false;
          });
      }, SAVE_DEBOUNCE_MS);
    },
    [language],
  );

  const toggleRule = useCallback(
    (key: string) => {
      setRules(
        enabledRuleKeys.includes(key)
          ? enabledRuleKeys.filter((k) => k !== key)
          : [...enabledRuleKeys, key],
      );
    },
    [enabledRuleKeys, setRules],
  );

  const labelMap = useMemo(() => {
    const map = new Map<string, RuleLabel>();
    for (const category of catalog) {
      for (const group of category.groups) {
        for (const option of group.options) {
          map.set(option.key, {
            name: option.name,
            groupName: group.name,
            categoryTitle: category.title,
            description: option.description,
          });
        }
      }
    }
    return map;
  }, [catalog]);

  const enabledSet = useMemo(() => new Set(enabledRuleKeys), [enabledRuleKeys]);

  return useMemo(
    () => ({
      catalog,
      catalogStatus,
      reloadCatalog,
      enabledRuleKeys,
      isEnabled: (key: string) => enabledSet.has(key),
      toggleRule,
      setRules,
      getRuleLabel: (key: string) => labelMap.get(key),
      maxRules: MAX_BREAKDOWN_RULES,
    }),
    [
      catalog,
      catalogStatus,
      reloadCatalog,
      enabledRuleKeys,
      enabledSet,
      labelMap,
      setRules,
      toggleRule,
    ],
  );
};
