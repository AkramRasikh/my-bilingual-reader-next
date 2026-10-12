const slashHPattern = () => /[\\/]h/gi;

export const countSlashH = (text: string) =>
  text.match(slashHPattern())?.length ?? 0;

export const removeAllSlashH = (text: string) =>
  text.replace(slashHPattern(), '').replace(/[ \t]{2,}/g, ' ').trim();

export const removeFirstSlashH = (text: string) => {
  const match = text.match(/[\\/]h/i);
  if (!match || match.index == null) return text;
  const next =
    text.slice(0, match.index) + text.slice(match.index + match[0].length);
  return next.replace(/[ \t]{2,}/g, ' ').trim();
};

export const slashHIn = (text: string) => text.match(/[\\/]h/i);
