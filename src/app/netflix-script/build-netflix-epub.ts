import JSZip from 'jszip';
import { LanguageEnum } from '../languages';
import { NetflixScriptEntry } from './parse-netflix-script';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

export const EPUB_STYLE_CSS = `.entry {
  margin: 0.4em 0;
}
.target-lang {
  margin: 0 0 0.15em 0;
  text-align: left;
}
.transliteration {
  margin: 0 0 0.12em 0;
  font-size: 0.72em;
  color: #666;
  text-align: left;
}
.base-lang {
  margin: 0;
  font-style: italic;
  color: #444;
  text-align: right;
}`;

const NAV_XHTML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Contents</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Contents</h1>
    <ol>
      <li><a href="chapter.xhtml">Script</a></li>
    </ol>
  </nav>
</body>
</html>`;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function languageEnumToEpubLang(lang: LanguageEnum): string {
  const map: Partial<Record<LanguageEnum, string>> = {
    [LanguageEnum.Japanese]: 'ja',
    [LanguageEnum.Chinese]: 'zh',
    [LanguageEnum.Arabic]: 'ar',
    [LanguageEnum.French]: 'fr',
  };
  return map[lang] ?? 'en';
}

export const EPUB_PREVIEW_ENTRY_LIMIT = 50;

export function buildEpubEntryBlocksHtml(
  entries: NetflixScriptEntry[],
): string {
  return [...entries]
    .sort((a, b) => a.time - b.time)
    .map((entry) => {
      const transliterationLine = entry.transliteration
        ? `<p class="transliteration">${escapeHtml(entry.transliteration)}</p>`
        : '';

      return `<div class="entry">
    <p class="target-lang">${escapeHtml(entry.targetLang)}</p>
    ${transliterationLine}
    <p class="base-lang">${escapeHtml(entry.baseLang)}</p>
  </div>`;
    })
    .join('\n');
}

export function buildEpubPreviewSrcDoc(
  entries: NetflixScriptEntry[],
  epubLang: string,
  { limit = EPUB_PREVIEW_ENTRY_LIMIT }: { limit?: number } = {},
): string {
  const sorted = [...entries].sort((a, b) => a.time - b.time);
  const slice = limit > 0 ? sorted.slice(0, limit) : sorted;
  const blocks = buildEpubEntryBlocksHtml(slice);

  return `<!DOCTYPE html>
<html lang="${epubLang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>${EPUB_STYLE_CSS}
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.1rem;
    line-height: 1.35;
    margin: 1rem;
    max-width: 40em;
  }
  </style>
</head>
<body>
${blocks}
</body>
</html>`;
}

export function buildChapterXhtml(
  entries: NetflixScriptEntry[],
  epubLang: string,
): string {
  const blocks = buildEpubEntryBlocksHtml(entries);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${epubLang}" lang="${epubLang}">
<head>
  <meta charset="UTF-8"/>
  <title>Bilingual script</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${blocks}
</body>
</html>`;
}

function buildContentOpf({
  bookId,
  title,
  epubLang,
  modified,
}: {
  bookId: string;
  title: string;
  epubLang: string;
  modified: string;
}): string {
  const safeTitle = escapeHtml(title);
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="${epubLang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${safeTitle}</dc:title>
    <dc:language>${epubLang}</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>`;
}

export async function buildNetflixEpub({
  entries,
  title,
  language,
}: {
  entries: NetflixScriptEntry[];
  title: string;
  language: LanguageEnum;
}): Promise<Blob> {
  const epubLang = languageEnumToEpubLang(language);
  const bookId = `urn:uuid:${crypto.randomUUID()}`;
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const chapter = buildChapterXhtml(entries, epubLang);
  const opf = buildContentOpf({ bookId, title, epubLang, modified });

  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.folder('META-INF')?.file('container.xml', CONTAINER_XML);
  const oebps = zip.folder('OEBPS');
  oebps?.file('content.opf', opf);
  oebps?.file('nav.xhtml', NAV_XHTML);
  oebps?.file('chapter.xhtml', chapter);
  oebps?.file('style.css', EPUB_STYLE_CSS);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
  });
}
