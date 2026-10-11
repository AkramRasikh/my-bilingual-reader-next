import { describe, expect, it } from '@jest/globals';
import { windowTranscriptAroundPlayhead } from './window-transcript-around-playhead';

const items = Array.from({ length: 40 }, (_, index) => ({ id: `s${index}` }));

function ids(result: { items: { id: string }[] }) {
  return result.items.map((item) => item.id);
}

describe('windowTranscriptAroundPlayhead', () => {
  it('returns 10 sentences behind the active sentence and 10 ahead', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's20',
      previousStart: 0,
    });

    expect(result.startIndex).toBe(10);
    expect(ids(result)).toEqual(
      Array.from({ length: 21 }, (_, index) => `s${index + 10}`),
    );
    expect(result.heldCenterId).toBeNull();
  });

  it('clamps the window to the start of the list', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's2',
      previousStart: 0,
    });

    expect(result.startIndex).toBe(0);
    expect(result.items).toHaveLength(21);
    expect(result.items[0].id).toBe('s0');
    expect(result.items.at(-1)?.id).toBe('s20');
  });

  it('clamps the window to the end of the list', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's38',
      previousStart: 0,
    });

    expect(result.startIndex).toBe(19);
    expect(result.items[0].id).toBe('s19');
    expect(result.items.at(-1)?.id).toBe('s39');
  });

  it('keeps the previous window while the playhead stays away from either edge', () => {
    const first = windowTranscriptAroundPlayhead({
      items,
      activeId: 's20',
      previousStart: 0,
    });
    const next = windowTranscriptAroundPlayhead({
      items,
      activeId: 's23',
      previousStart: first.startIndex,
    });

    expect(next.startIndex).toBe(10);
    expect(next.items[0].id).toBe('s10');
    expect(next.items.at(-1)?.id).toBe('s30');
  });

  it('recenters when the playhead comes within 4 rows of the trailing edge', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's27',
      previousStart: 10,
    });

    expect(result.startIndex).toBe(17);
    expect(ids(result)).toEqual(
      Array.from({ length: 21 }, (_, index) => `s${index + 17}`),
    );
  });

  it('recenters when the playhead comes within 4 rows of the leading edge', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's13',
      previousStart: 10,
    });

    expect(result.startIndex).toBe(3);
  });

  it('recenters when the playhead is outside the previous window', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's35',
      previousStart: 0,
    });

    expect(result.startIndex).toBe(19);
    expect(result.items).toHaveLength(21);
    expect(result.items[0].id).toBe('s19');
    expect(result.items.some((item) => item.id === 's35')).toBe(true);
  });

  it('shows the first window when the playhead is not in the list', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 'missing',
      previousStart: 15,
    });

    expect(result.startIndex).toBe(0);
    expect(ids(result)).toEqual(ids({ items: items.slice(0, 21) }));
  });

  it('returns the whole list when it is shorter than the window', () => {
    const short = items.slice(0, 8);
    const result = windowTranscriptAroundPlayhead({
      items: short,
      activeId: 's4',
      previousStart: 3,
      heldCenterId: 's4',
      activeIdWhenHeld: 's4',
    });

    expect(result.items).toEqual(short);
    expect(result.startIndex).toBe(0);
    expect(result.heldCenterId).toBeNull();
  });

  it('returns an empty list when there are no sentences', () => {
    const result = windowTranscriptAroundPlayhead({
      items: [],
      activeId: 's0',
      previousStart: 4,
    });

    expect(result.items).toEqual([]);
    expect(result.startIndex).toBe(0);
  });

  it('recenters on a scroll target outside the window and holds that window', () => {
    const jumped = windowTranscriptAroundPlayhead({
      items,
      activeId: 's5',
      scrollTargetId: 's30',
      previousStart: 0,
    });

    expect(jumped.startIndex).toBe(19);
    expect(jumped.items).toHaveLength(21);
    expect(jumped.items.some((item) => item.id === 's30')).toBe(true);
    expect(jumped.heldCenterId).toBe('s30');
    expect(jumped.activeIdWhenHeld).toBe('s5');

    const held = windowTranscriptAroundPlayhead({
      items,
      activeId: 's5',
      scrollTargetId: '',
      previousStart: jumped.startIndex,
      heldCenterId: jumped.heldCenterId,
      activeIdWhenHeld: jumped.activeIdWhenHeld,
    });

    expect(held.startIndex).toBe(19);
    expect(held.heldCenterId).toBe('s30');
    expect(held.items[0].id).toBe('s19');
  });

  it('follows the playhead again after the active sentence changes', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's8',
      previousStart: 20,
      heldCenterId: 's30',
      activeIdWhenHeld: 's5',
    });

    expect(result.heldCenterId).toBeNull();
    expect(result.activeIdWhenHeld).toBeNull();
    expect(result.startIndex).toBe(0);
    expect(result.items.some((item) => item.id === 's8')).toBe(true);
  });

  it('leaves the window in place when the scroll target is already visible', () => {
    const result = windowTranscriptAroundPlayhead({
      items,
      activeId: 's20',
      scrollTargetId: 's18',
      previousStart: 10,
    });

    expect(result.startIndex).toBe(10);
    expect(result.heldCenterId).toBeNull();
  });
});
