import { playbackCaptionBreakdownToggle } from './playbackCaptionBreakdown';

describe('playbackCaptionBreakdownToggle', () => {
  it('asks for a breakdown when the sentence does not have one yet', () => {
    expect(playbackCaptionBreakdownToggle(null, 'sentence-1', false, false)).toEqual({
      nextId: null,
      requestBreakdown: true,
    });
  });

  it('opens the caption breakdown for a sentence that already has one', () => {
    expect(playbackCaptionBreakdownToggle(null, 'sentence-1', true, false)).toEqual({
      nextId: 'sentence-1',
      requestBreakdown: false,
    });
  });

  it('closes the caption breakdown on the next press', () => {
    expect(
      playbackCaptionBreakdownToggle('sentence-1', 'sentence-1', true, false),
    ).toEqual({
      nextId: null,
      requestBreakdown: false,
    });
  });

  it('leaves an already broken down sentence alone during review', () => {
    expect(playbackCaptionBreakdownToggle(null, 'sentence-1', true, true)).toEqual({
      nextId: null,
      requestBreakdown: false,
    });
  });
});
