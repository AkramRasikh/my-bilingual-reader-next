export function sanitizeFilename(name: string) {
  // Remove path separators and unsafe chars; keep letters, numbers, dash, underscore, and spaces
  const cleaned = name
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '') // remove reserved chars
    .replace(/[:]/g, '-'); // avoid colon in filenames
  // further strip any remaining problematic characters
  return cleaned.replace(/[^\w\- .()]/g, '');
}
