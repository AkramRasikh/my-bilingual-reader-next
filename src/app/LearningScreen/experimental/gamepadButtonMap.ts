/**
 * Indices captured from Chrome on macOS with an 8BitDo Lite 2 in
 * non-standard mapping. The D-pad on this pad does not surface via
 * `gp.buttons` at all on desktop — it comes through axes (handled by
 * `getDpadState` for axes 6/7 and the axis-9 hat decoder elsewhere). The
 * indices 13 and 14 are actually L3 / R3 (stick clicks) on this layout, so
 * the `DPAD_*_BTN` entries are intentionally set to `-1`: a sentinel that
 * `isGamepadButtonHeld` short-circuits to `false`. This prevents the stick
 * clicks at indices 13/14 from being read as D-pad down/left.
 */
export const BUTTONS_DESKTOP = {
  L1_BTN: 6,
  L2_BTN: 8,
  R1_BTN: 7,
  R2_BTN: 9,
  MINUS_BTN: 10,
  PLUS_BTN: 11,
  /** Home button on the Lite 2 (verified). Capture does not fire. */
  CHECKER_BTN: 2,
  Y_BTN: 4,
  X_BTN: 3,
  B_BTN: 1,
  A_BTN: 0,
  /** D-pad does not fire as buttons on desktop non-standard mapping. */
  DPAD_UP_BTN: -1,
  DPAD_DOWN_BTN: -1,
  DPAD_LEFT_BTN: -1,
  DPAD_RIGHT_BTN: -1,
  L_STICK_CLICK_BTN: 13,
  R_STICK_CLICK_BTN: 14,
  /**
   * Right-stick axes on the Lite 2 in non-standard mapping (verified).
   * Trigger pulls steal axes 3 and 4 on this layout, so the right-stick Y
   * lands on `axes[5]` rather than the W3C-standard `axes[3]`.
   */
  R_STICK_X_AXIS: 2,
  R_STICK_Y_AXIS: 5,
} as const;

/**
 * W3C "standard" layout — iPadOS browsers (Safari, Chrome, Edge, etc.) all use
 * WebKit, so they typically expose the same standard indices as Safari. Desktop
 * Chrome over Bluetooth may still use the vendor map above.
 * https://w3c.github.io/gamepad/#dfn-standard-gamepad
 */
export const BUTTONS_STANDARD = {
  L1_BTN: 4,
  L2_BTN: 6,
  R1_BTN: 5,
  R2_BTN: 7,
  MINUS_BTN: 8,
  PLUS_BTN: 9,
  /** Capture / touchpad / vendor; tweak if your pad uses another index. */
  CHECKER_BTN: 16,
  Y_BTN: 3,
  X_BTN: 2,
  B_BTN: 1,
  A_BTN: 0,
  DPAD_UP_BTN: 12,
  DPAD_DOWN_BTN: 13,
  DPAD_LEFT_BTN: 14,
  DPAD_RIGHT_BTN: 15,
  L_STICK_CLICK_BTN: 10,
  R_STICK_CLICK_BTN: 11,
  /** W3C standard right-stick axes. */
  R_STICK_X_AXIS: 2,
  R_STICK_Y_AXIS: 3,
} as const;

export type ButtonMap = typeof BUTTONS_DESKTOP | typeof BUTTONS_STANDARD;

/**
 * Face / shoulder buttons use `pressed` only. L2/R2 triggers on iPadOS WebKit
 * often report pull via `value` while `pressed` stays false until fully down —
 * use this for triggers (and any button) when you need parity with desktop.
 */
export function isGamepadButtonHeld(
  buttons: readonly GamepadButton[] | undefined,
  index: number,
  analogValueThreshold = 0.35,
): boolean {
  if (!buttons) return false;
  const b = buttons[index];
  if (!b) return false;
  return Boolean(b.pressed) || b.value > analogValueThreshold;
}

/** W3C standard D-pad as discrete buttons 12–15 (typical on iPadOS / standard mapping). */
export function getDpadButtonState(
  buttons: readonly GamepadButton[],
  map: ButtonMap,
): { up: boolean; down: boolean; left: boolean; right: boolean } {
  return {
    up: isGamepadButtonHeld(buttons, map.DPAD_UP_BTN),
    down: isGamepadButtonHeld(buttons, map.DPAD_DOWN_BTN),
    left: isGamepadButtonHeld(buttons, map.DPAD_LEFT_BTN),
    right: isGamepadButtonHeld(buttons, map.DPAD_RIGHT_BTN),
  };
}

function isIOSLike(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS “desktop” / “request desktop site” (Safari, Chrome, etc.): Mac UA + touch
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

export function getButtonMap(gp: Gamepad): ButtonMap {
  if (gp.mapping === 'standard') {
    return BUTTONS_STANDARD;
  }
  // WebKit on iOS/iPadOS sometimes leaves mapping empty while still using standard indices.
  if (isIOSLike() && gp.buttons.length >= 17) {
    return BUTTONS_STANDARD;
  }
  return BUTTONS_DESKTOP;
}
