import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useGamepad } from '../experimental/useGamePad';
import { BUTTONS_STANDARD as B } from '../experimental/gamepadButtonMap';
import type { InputAction } from '../experimental/useInputActions';
import { useGamePadSRSShortcut } from '@/components/custom/useGamePadSRSShortcut';
import { sentenceSnippetGamepadBridge } from './sentence-snippet-gamepad-bridge';

/**
 * `left`/`right` drive the stick axes; `dpadLeft`/`dpadRight` press the
 * physical D-pad (standard-mapping buttons, decoded into `hat`).
 */
type Frame = {
  buttons?: number[];
  left?: boolean;
  right?: boolean;
  dpadLeft?: boolean;
  dpadRight?: boolean;
};

let pad: Gamepad | null = null;
let rafQueue: FrameRequestCallback[] = [];

const makePad = ({
  buttons: held = [],
  left,
  right,
  dpadLeft,
  dpadRight,
}: Frame): Gamepad => {
  const buttons = [
    ...held,
    ...(dpadLeft ? [B.DPAD_LEFT_BTN] : []),
    ...(dpadRight ? [B.DPAD_RIGHT_BTN] : []),
  ];
  const axes = new Array(10).fill(0);
  if (left) axes[6] = -1;
  if (right) axes[6] = 1;
  return {
    id: 'test-pad',
    index: 0,
    connected: true,
    mapping: 'standard',
    timestamp: 0,
    axes,
    buttons: Array.from({ length: 17 }, (_, index) => ({
      pressed: buttons.includes(index),
      touched: buttons.includes(index),
      value: buttons.includes(index) ? 1 : 0,
    })),
    hapticActuators: [],
    vibrationActuator: null,
  } as unknown as Gamepad;
};

/** Show `frame` to the pad and run one animation frame. */
const frame = (next: Frame = {}) => {
  pad = makePad(next);
  const queued = rafQueue;
  rafQueue = [];
  queued.forEach((callback) => callback(0));
};

beforeEach(() => {
  sentenceSnippetGamepadBridge.reset();
  pad = makePad({});
  rafQueue = [];
  Object.defineProperty(navigator, 'getGamepads', {
    configurable: true,
    value: () => [pad],
  });
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback: FrameRequestCallback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderPad = (
  state: { canCreate: boolean; hasClips: boolean; isClipFocused: boolean },
  threeSecondLoopState: number | null = null,
) => {
  const actions: InputAction[] = [];
  const events: string[] = [];
  const record = (event: Event) => events.push(event.type);
  ['snippet-loop-save', 'snippet-loop-shift-start', 'snippet-loop-adjust-length'].forEach(
    (name) => window.addEventListener(name, record),
  );
  const hook = renderHook(
    (props: typeof state) =>
      useGamepad(
        (action) => actions.push(action),
        threeSecondLoopState,
        true,
        false,
        props,
      ),
    { initialProps: state },
  );
  return { actions, events, hook };
};

const FOCUSED = { canCreate: true, hasClips: true, isClipFocused: true };
const REVIEWING = { canCreate: true, hasClips: false, isClipFocused: false };

describe('useGamepad: sentence snippet mapping', () => {
  it('L1+R2 hold starts on press and ends on release', () => {
    const { actions } = renderPad(REVIEWING);
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN, B.R2_BTN] });
    frame({ buttons: [B.L1_BTN, B.R2_BTN] });
    frame({ buttons: [B.L1_BTN] });
    expect(actions).toEqual([
      'SENTENCE_SNIPPET_HOLD_START',
      'SENTENCE_SNIPPET_HOLD_END',
    ]);
  });

  it('holding R2 for a clip never toggles slow audio', () => {
    const { actions } = renderPad(REVIEWING);
    frame({ buttons: [B.L1_BTN, B.R2_BTN] });
    frame({ buttons: [B.L1_BTN, B.R2_BTN, B.X_BTN] });
    expect(actions).not.toContain('TOGGLE_SLOW_AUDIO');
  });

  it('L1+R2 does nothing when no YouTube sentence is under review', () => {
    const { actions } = renderPad({
      canCreate: false,
      hasClips: false,
      isClipFocused: false,
    });
    frame({ buttons: [B.L1_BTN, B.R2_BTN] });
    frame({});
    expect(actions).toEqual([]);
  });

  it('plain Left/Right still jump sentences when no clip is focused', () => {
    const { actions } = renderPad(REVIEWING);
    frame({ left: true });
    frame({});
    frame({ right: true });
    expect(actions).toEqual(['JUMP_PREV', 'JUMP_NEXT']);
  });

  it('L1+D-pad Right selects the last clip when none is focused', () => {
    const { actions } = renderPad({ ...REVIEWING, hasClips: true });
    frame({ buttons: [B.L1_BTN], dpadRight: true });
    expect(actions).toEqual(['SENTENCE_SNIPPET_SELECT_LAST']);
  });

  it('L1+D-pad Right does nothing when the sentence has no clips', () => {
    const { actions } = renderPad(REVIEWING);
    frame({ buttons: [B.L1_BTN], dpadRight: true });
    expect(actions).toEqual([]);
  });

  it('the stick never enters a clip: L1+stick Right still slices the loop', () => {
    const { actions } = renderPad({ ...REVIEWING, hasClips: true });
    frame({ buttons: [B.L1_BTN], right: true });
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN], left: true });
    expect(actions).not.toContain('SENTENCE_SNIPPET_SELECT_LAST');
    expect(actions).toContain('SLICE_LOOP');
  });

  it('L1+D-pad Left does not select a clip', () => {
    const { actions } = renderPad({ ...REVIEWING, hasClips: true });
    frame({ buttons: [B.L1_BTN], dpadLeft: true });
    expect(actions).toEqual([]);
  });

  it('with a clip focused, the stick does nothing on left/right', () => {
    const { actions } = renderPad(FOCUSED);
    frame({ left: true });
    frame({});
    frame({ right: true });
    frame({});
    frame({ buttons: [B.L1_BTN], right: true });
    expect(actions).toEqual([]);
  });

  it('with a clip focused, the D-pad steps clips and nudges one edge', () => {
    const { actions } = renderPad(FOCUSED);
    frame({ dpadLeft: true });
    frame({});
    frame({ dpadRight: true });
    frame({});
    frame({ buttons: [B.R1_BTN], dpadLeft: true });
    frame({ buttons: [B.R1_BTN] });
    frame({ buttons: [B.R1_BTN], dpadRight: true });
    frame({});
    frame({ buttons: [B.L2_BTN], dpadLeft: true });
    frame({ buttons: [B.L2_BTN] });
    frame({ buttons: [B.L2_BTN], dpadRight: true });
    expect(actions).toEqual([
      'SENTENCE_SNIPPET_PREV',
      'SENTENCE_SNIPPET_NEXT',
      'SENTENCE_SNIPPET_START_EARLIER',
      'SENTENCE_SNIPPET_START_LATER',
      'SENTENCE_SNIPPET_END_EARLIER',
      'SENTENCE_SNIPPET_END_LATER',
    ]);
  });

  it('with a clip focused, Y/A and L1+Y/A move the focus, L1+X saves', () => {
    const { actions, events } = renderPad(FOCUSED);
    frame({ buttons: [B.Y_BTN] });
    frame({});
    frame({ buttons: [B.A_BTN] });
    frame({});
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN, B.Y_BTN] });
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN, B.A_BTN] });
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN, B.X_BTN] });
    expect(actions).toEqual([
      'SENTENCE_SNIPPET_FOCUS_LEFT',
      'SENTENCE_SNIPPET_FOCUS_RIGHT',
      'SENTENCE_SNIPPET_FOCUS_SHRINK',
      'SENTENCE_SNIPPET_FOCUS_GROW',
      'SENTENCE_SNIPPET_SAVE',
    ]);
    expect(actions).not.toContain('ADD_MASTER_TO_REVIEW');
    expect(actions).not.toContain('QUICK_SAVE_SNIPPET');
    expect(events).toEqual([]);
  });

  it('L2+Y while a clip is focused grades instead of moving the focus', () => {
    const { actions } = renderPad(FOCUSED);
    frame({ buttons: [B.L2_BTN] });
    frame({ buttons: [B.L2_BTN, B.Y_BTN] });
    expect(actions).toEqual([]);
  });

  it('B in a clip loop ends the loop and other B pollers ignore it until release', () => {
    const { actions, hook } = renderPad(FOCUSED);
    sentenceSnippetGamepadBridge.setClipLoopActive(true);
    frame({ buttons: [B.B_BTN] });
    expect(actions).toEqual(['SENTENCE_SNIPPET_END_LOOP']);

    // The loop is gone, but B is still down: pollers must still ignore it.
    sentenceSnippetGamepadBridge.setClipLoopActive(false);
    hook.rerender(REVIEWING);
    frame({ buttons: [B.B_BTN] });
    expect(sentenceSnippetGamepadBridge.shouldIgnoreB()).toBe(true);

    frame({});
    expect(sentenceSnippetGamepadBridge.shouldIgnoreB()).toBe(false);
    expect(actions).toEqual(['SENTENCE_SNIPPET_END_LOOP']);
  });

  it('without a clip, L1+X and Y keep their 3 s loop meaning', () => {
    const { actions, events } = renderPad(REVIEWING, 5);
    frame({ buttons: [B.Y_BTN] });
    frame({ buttons: [B.L1_BTN] });
    frame({ buttons: [B.L1_BTN, B.X_BTN] });
    expect(events).toEqual(['snippet-loop-shift-start', 'snippet-loop-save']);
    expect(actions.some((action) => action.startsWith('SENTENCE_SNIPPET'))).toBe(
      false,
    );
  });
});

describe('useGamePadSRSShortcut: L2+R2 with a focused clip', () => {
  it('deletes the clip, never removes the sentence while held, and removes it on a fresh press', () => {
    const handleRemoveReview = jest.fn();
    const handleNextReview = jest.fn();
    const deleteClip = jest.fn(() => {
      // A deleted draft drops the clip loop right away.
      sentenceSnippetGamepadBridge.setClipLoopActive(false);
    });
    sentenceSnippetGamepadBridge.setDeleteHandler(deleteClip);
    sentenceSnippetGamepadBridge.setClipLoopActive(true);

    renderHook(() =>
      useGamePadSRSShortcut({
        isReadyForQuickReview: true,
        isLoadingSRSState: false,
        handleNextReview,
        handleRemoveReview,
      }),
    );

    frame({});
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    expect(deleteClip).toHaveBeenCalledTimes(1);
    expect(handleRemoveReview).not.toHaveBeenCalled();

    frame({});
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    expect(handleRemoveReview).toHaveBeenCalledTimes(1);
    expect(deleteClip).toHaveBeenCalledTimes(1);
  });

  it('a saved clip needs two presses, both used by the clip', () => {
    const handleRemoveReview = jest.fn();
    const deleteClip = jest.fn();
    sentenceSnippetGamepadBridge.setDeleteHandler(deleteClip);
    sentenceSnippetGamepadBridge.setClipLoopActive(true);

    renderHook(() =>
      useGamePadSRSShortcut({
        isReadyForQuickReview: true,
        isLoadingSRSState: false,
        handleNextReview: jest.fn(),
        handleRemoveReview,
      }),
    );

    frame({});
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    frame({});
    frame({ buttons: [B.L2_BTN, B.R2_BTN] });
    expect(deleteClip).toHaveBeenCalledTimes(2);
    expect(handleRemoveReview).not.toHaveBeenCalled();
  });
});
