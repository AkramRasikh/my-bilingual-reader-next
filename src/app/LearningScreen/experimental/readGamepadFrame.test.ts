import { describe, expect, it } from '@jest/globals';
import { BUTTONS_DESKTOP } from './gamepadButtonMap';
import {
  type HatAxis9DecoderState,
  stepHatAxis9,
} from './readGamepadFrame';

/** Chromium hat-switch null: logical 8 scaled across 0..7 → 9/7. */
const HAT_RELEASED = 9 / 7;

const initial: HatAxis9DecoderState = { neutral: null, maxAbsSeen: 1 };

const padWithAxis9 = (axis9: number): Gamepad =>
  ({
    axes: Array.from({ length: 10 }, (_, index) => (index === 9 ? axis9 : 0)),
    buttons: [],
  }) as unknown as Gamepad;

const step = (prev: HatAxis9DecoderState, axis9: number) =>
  stepHatAxis9(prev, padWithAxis9(axis9), BUTTONS_DESKTOP);

describe('stepHatAxis9', () => {
  it('does not turn a released hat into left after Chrome’s zeroed startup sample', () => {
    const startup = step(initial, 0);
    expect(startup.hat).toEqual({
      up: false,
      down: false,
      left: false,
      right: false,
    });

    const resting = step(startup.next, HAT_RELEASED);
    expect(resting.axis9LooksActive).toBe(false);
    expect(resting.hat.left).toBe(false);

    const pressedRight = step(resting.next, -0.42857142857142855);
    expect(pressedRight.hat).toMatchObject({ right: true, left: false });

    const released = step(pressedRight.next, HAT_RELEASED);
    expect(released.hat).toEqual({
      up: false,
      down: false,
      left: false,
      right: false,
    });
    expect(released.next.maxAbsSeen).toBeLessThanOrEqual(1);
  });

  it('still reads an in-range left and up-left after the hat has been released', () => {
    const resting = step(step(initial, 0).next, HAT_RELEASED);

    expect(step(resting.next, 0.7142857142857143).hat).toMatchObject({
      left: true,
      right: false,
      up: false,
      down: false,
    });

    expect(step(resting.next, 1).hat).toMatchObject({
      left: true,
      up: true,
      right: false,
      down: false,
    });
  });
});
