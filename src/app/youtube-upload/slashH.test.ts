import { countSlashH, removeAllSlashH, removeFirstSlashH } from './slashH';

const line =
  "Qu'est-ce que c'est que Qu'est-ce que c'est\\h que ça ? Qu'est-ce que vous faites chez moi,\\h\\h";

describe('slashH', () => {
  it('counts every backslash-h and forward-slash-h', () => {
    expect(countSlashH(line)).toBe(3);
    expect(countSlashH('word/h and word/H')).toBe(2);
  });

  it('removes every mark and leaves the surrounding words', () => {
    expect(removeAllSlashH(line)).toBe(
      "Qu'est-ce que c'est que Qu'est-ce que c'est que ça ? Qu'est-ce que vous faites chez moi,",
    );
  });

  it('removes one mark at a time', () => {
    const once = removeFirstSlashH(line);
    expect(countSlashH(once)).toBe(2);
    expect(once).toContain('chez moi,\\h\\h');
  });
});
