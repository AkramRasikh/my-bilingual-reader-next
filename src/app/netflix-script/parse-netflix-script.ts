import { isTrimmedLang, LanguageEnum } from '../languages';

export interface NetflixScriptEntry {
  time: number;
  targetLang: string;
  baseLang: string;
  transliteration?: string;
}

export function applyLanguageFormatting(
  entries: NetflixScriptEntry[],
  lang: LanguageEnum,
): NetflixScriptEntry[] {
  if (!isTrimmedLang(lang)) {
    return entries;
  }
  return entries.map((entry) => ({
    ...entry,
    targetLang: entry.targetLang.replace(/\s+/g, ''),
  }));
}

const TIME_PATTERN = /^\d{2}:\d{2}:\d{2}$/;

export function timeStringToSeconds(time: string): number {
  const [h, m, s] = time.trim().split(':');
  return (
    parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10)
  );
}

export function parseNetflixScript(text: string): NetflixScriptEntry[] {
  const lines = text.split(/\r?\n/);
  const entries: NetflixScriptEntry[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('Time')) {
      continue;
    }

    const parts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) {
      continue;
    }

    const [timeStr, ...rest] = parts;
    if (!TIME_PATTERN.test(timeStr)) {
      continue;
    }

    const baseLang = rest[rest.length - 1];
    const targetLang = rest.slice(0, -1).join(' ').trim();

    entries.push({
      time: timeStringToSeconds(timeStr),
      targetLang,
      baseLang,
    });
  }

  return entries;
}
