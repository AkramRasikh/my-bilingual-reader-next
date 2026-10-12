import { describe, expect, it } from '@jest/globals';
import {
  isEasyIntervalScheduledForDeletion,
  srsRetentionKeyTypes,
} from './srs-algo';

const timeNow = new Date('2026-01-01T00:00:00.000Z');

const daysFromNow = (days: number) =>
  new Date(timeNow.getTime() + days * 24 * 60 * 60 * 1000);

describe('isEasyIntervalScheduledForDeletion', () => {
  it('deletes a word when Easy is 45 days or further out', () => {
    expect(
      isEasyIntervalScheduledForDeletion({
        contentType: srsRetentionKeyTypes.vocab,
        easyDue: daysFromNow(45),
        timeNow,
      }),
    ).toBe(true);
    expect(
      isEasyIntervalScheduledForDeletion({
        contentType: srsRetentionKeyTypes.vocab,
        easyDue: daysFromNow(44.9),
        timeNow,
      }),
    ).toBe(false);
  });

  it('deletes a sentence when Easy is 30 days or further out', () => {
    expect(
      isEasyIntervalScheduledForDeletion({
        contentType: srsRetentionKeyTypes.sentences,
        easyDue: daysFromNow(30),
        timeNow,
      }),
    ).toBe(true);
    expect(
      isEasyIntervalScheduledForDeletion({
        contentType: srsRetentionKeyTypes.sentences,
        easyDue: daysFromNow(29.9),
        timeNow,
      }),
    ).toBe(false);
  });

  it('leaves snippets on the normal Easy schedule', () => {
    expect(
      isEasyIntervalScheduledForDeletion({
        contentType: srsRetentionKeyTypes.snippet,
        easyDue: daysFromNow(100),
        timeNow,
      }),
    ).toBe(false);
  });
});
