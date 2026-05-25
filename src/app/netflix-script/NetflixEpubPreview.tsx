'use client';

import { useMemo } from 'react';
import { LanguageEnum } from '../languages';
import {
  buildEpubPreviewSrcDoc,
  EPUB_PREVIEW_ENTRY_LIMIT,
  languageEnumToEpubLang,
} from './build-netflix-epub';
import { NetflixScriptEntry } from './parse-netflix-script';

interface NetflixEpubPreviewProps {
  entries: NetflixScriptEntry[];
  language: LanguageEnum;
}

export default function NetflixEpubPreview({
  entries,
  language,
}: NetflixEpubPreviewProps) {
  const epubLang = languageEnumToEpubLang(language);
  const truncated = entries.length > EPUB_PREVIEW_ENTRY_LIMIT;

  const srcDoc = useMemo(
    () => buildEpubPreviewSrcDoc(entries, epubLang),
    [entries, epubLang],
  );

  return (
    <div className='flex flex-col gap-1'>
      <p className='text-sm font-medium'>EPUB preview (approximate)</p>
      <p className='text-xs text-muted-foreground'>
        Same order and styling as the download; Kindle fonts and margins will
        differ.
        {truncated &&
          ` Showing first ${EPUB_PREVIEW_ENTRY_LIMIT} of ${entries.length} lines.`}
      </p>
      <iframe
        title='EPUB preview'
        srcDoc={srcDoc}
        className='h-80 w-full rounded-md border bg-white'
        sandbox=''
      />
    </div>
  );
}
