export const japanese = 'japanese';
export const arabic = 'arabic';
export const chinese = 'chinese';

export enum LanguageEnum {
  Chinese = 'chinese',
  Japanese = 'japanese',
  Arabic = 'arabic',
  French = 'french',
  None = '',
}

export const isTrimmedLang = (lang: LanguageEnum) =>
  [chinese, japanese].includes(lang.toLowerCase() as LanguageEnum);
