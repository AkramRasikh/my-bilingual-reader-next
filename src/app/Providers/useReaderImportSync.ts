import {useEffect, useRef} from 'react';
import type {Dispatch} from 'react';
import type {ContentAction, ContentStateTypes} from '../reducers/content-reducer';
import {mergeReaderImport, normalizeReaderImport} from './reader-import-cache';

type Pending = {key: string; origin: string; language: string; content: unknown};
export function useReaderImportSync({language, ready, content, dispatch}: {
  language: string; ready: boolean; content: ContentStateTypes[]; dispatch: Dispatch<ContentAction>;
}) {
  const latest = useRef({language, ready, content});
  latest.current = {language, ready, content};
  const pending = useRef(new Map<string, Pending>());
  const processing = useRef(false);
  const drain = useRef<() => Promise<void>>(async () => {});
  drain.current = async () => {
    if (processing.current) return;
    processing.current = true;
    try {
      for (const [key, entry] of pending.current) {
        if (entry.language === latest.current.language && !latest.current.ready) continue;
        try {
          const incoming = normalizeReaderImport(entry.content);
          const cacheKey = `${entry.language}-contentState`;
          const raw = localStorage.getItem(cacheKey);
          let cached = raw ? JSON.parse(raw) : null;
          if (!Array.isArray(cached) && entry.language === latest.current.language && latest.current.ready) cached = latest.current.content;
          if (!Array.isArray(cached)) {
            // Do not seed a partial language cache with just the new upload.
            const response = await fetch('/api/getOnLoadData', {method: 'POST', headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({language: entry.language, refs: ['content', 'words', 'sentences']})});
            if (!response.ok) throw new Error('Could not load the complete reader cache');
            const data = await response.json();
            if (!Array.isArray(data.contentData)) throw new Error('Invalid reader cache response');
            cached = data.contentData;
          }
          // Recheck readiness if the user changed languages during the fetch.
          if (entry.language === latest.current.language && !latest.current.ready) continue;
          const active = entry.language === latest.current.language;
          let base: ContentStateTypes[] = active ? latest.current.content : cached;
          if (active) for (const item of cached) base = mergeReaderImport(base, item);
          const merged = mergeReaderImport(base, incoming);
          localStorage.setItem(cacheKey, JSON.stringify(merged));
          if (active) {
            // Keep the ref current between multiple events in one React render.
            latest.current.content = merged;
            dispatch({type: 'mergeImportedContent', items: merged});
          }
          pending.current.delete(key);
          window.postMessage({type: 'll-reader-import-applied', key}, location.origin);
        } catch (error) {
          console.warn('Reader import cached in extension for retry:', error);
          // Keep this entry queued; it must not be acknowledged before persistence.
        }
      }
    } finally {processing.current = false;}
  };
  useEffect(() => {
    if (!['localhost', '127.0.0.1'].includes(location.hostname)) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== location.origin) return;
      if (event.data?.type === 'll-reader-bridge-ready') window.postMessage({type: 'll-reader-ready'}, location.origin);
      const entry = event.data?.entry;
      if(entry?.kind==='word' || entry?.kind==='review')return; // Word-only updates have their own cache/state hook.
      if (event.data?.type !== 'll-reader-import' || entry?.origin !== location.origin ||
          typeof entry.key !== 'string' || !['arabic', 'chinese', 'french', 'japanese'].includes(entry.language)) return;
      pending.current.set(entry.key, entry);
      void drain.current();
    };
    const storageChanged = (event: StorageEvent) => {
      if (!latest.current.ready || event.key !== `${latest.current.language}-contentState` || !event.newValue) return;
      try {
        const items = JSON.parse(event.newValue);
        if (!Array.isArray(items)) return;
        const merged = items.reduce((current, item) => mergeReaderImport(current, normalizeReaderImport(item)), latest.current.content);
        if (merged !== latest.current.content) {
          latest.current.content = merged;
          dispatch({type: 'mergeImportedContent', items: merged});
        }
      } catch { /* Preserve current state if another tab writes invalid data. */ }
    };
    window.addEventListener('storage', storageChanged);
    const retry = () => {window.postMessage({type: 'll-reader-ready'}, location.origin); void drain.current();};
    window.addEventListener('message', receive);
    window.addEventListener('focus', retry);
    window.postMessage({type: 'll-reader-ready'}, location.origin);
    return () => {window.removeEventListener('storage', storageChanged); window.removeEventListener('message', receive); window.removeEventListener('focus', retry);};
  }, [dispatch]);
  useEffect(() => {void drain.current();}, [ready, language, content]);
}
