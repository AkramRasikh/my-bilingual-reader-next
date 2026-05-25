'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpenIcon, ClipboardCopyIcon, DownloadIcon } from 'lucide-react';
import { buildNetflixEpub } from './build-netflix-epub';
import NetflixEpubPreview from './NetflixEpubPreview';
import LanguageSelector from '@/components/custom/LanguageSelector';
import { isTrimmedLang, LanguageEnum } from '../languages';
import {
  applyLanguageFormatting,
  NetflixScriptEntry,
  parseNetflixScript,
} from './parse-netflix-script';

export default function NetflixScript() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState(LanguageEnum.Japanese);
  const [rawEntries, setRawEntries] = useState<NetflixScriptEntry[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [epubLoading, setEpubLoading] = useState(false);

  const entries = useMemo(
    () => applyLanguageFormatting(rawEntries, language),
    [rawEntries, language],
  );

  const jsonOutput = entries.length > 0 ? JSON.stringify(entries, null, 2) : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setParseError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseNetflixScript(text);
      if (parsed.length === 0) {
        setParseError(
          'No subtitle lines found. Expected tab-separated Time, Subtitle, and Translation columns.',
        );
        setRawEntries([]);
        return;
      }
      setRawEntries(parsed);
    } catch {
      setParseError('Failed to read the file.');
      setRawEntries([]);
    }
  };

  const handleCopy = async () => {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const baseName = fileName?.replace(/\.txt$/i, '') ?? 'netflix-script';

  const handleDownload = () => {
    if (!jsonOutput || !fileName) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${baseName}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadEpub = async () => {
    if (entries.length === 0) return;
    setEpubLoading(true);
    try {
      const blob = await buildNetflixEpub({
        entries,
        title: baseName,
        language,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${baseName}.epub`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to build EPUB:', err);
      setParseError('Failed to build EPUB file.');
    } finally {
      setEpubLoading(false);
    }
  };

  return (
    <Card className='mx-auto max-w-3xl'>
      <CardHeader>
        <CardTitle>Netflix Script Converter</CardTitle>
        <CardDescription>
          Upload a tab-separated Netflix script, then export JSON or a bilingual
          EPUB (target language, then English) for Kindle.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Label>Target language</Label>
          <LanguageSelector
            defaultValue={language}
            onChange={(value) => setLanguage(value)}
          />
          {isTrimmedLang(language) && (
            <span className='text-xs text-muted-foreground'>
              Spaces removed from subtitles
            </span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='netflix-script-file'>Script file (.txt)</Label>
          <input
            ref={fileInputRef}
            id='netflix-script-file'
            type='file'
            accept='.txt,text/plain'
            onChange={handleFileChange}
            className='text-sm file:mr-4 file:rounded-md file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:text-white hover:file:bg-amber-800'
          />
        </div>

        {parseError && (
          <p className='text-sm text-red-600' role='alert'>
            {parseError}
          </p>
        )}

        {entries.length > 0 && (
          <>
            <p className='text-sm text-muted-foreground'>
              Parsed {entries.length} line{entries.length === 1 ? '' : 's'}
              {fileName ? ` from ${fileName}` : ''}.
            </p>
            <div className='flex flex-wrap gap-2'>
              <Button type='button' variant='outline' onClick={handleCopy}>
                <ClipboardCopyIcon className='size-4' />
                Copy JSON
              </Button>
              <Button type='button' variant='outline' onClick={handleDownload}>
                <DownloadIcon className='size-4' />
                Download JSON
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleDownloadEpub}
                disabled={epubLoading}
              >
                <BookOpenIcon className='size-4' />
                {epubLoading ? 'Building EPUB…' : 'Download EPUB'}
              </Button>
            </div>
            <NetflixEpubPreview entries={entries} language={language} />
            <pre className='max-h-96 overflow-auto rounded-md border bg-white p-4 text-xs'>
              {jsonOutput}
            </pre>
          </>
        )}
      </CardContent>
    </Card>
  );
}
