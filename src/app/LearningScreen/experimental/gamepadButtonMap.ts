/** Xbox-style indices from Chrome on desktop (non-standard mapping). */
export const BUTTONS_DESKTOP = {
  L1_BTN: 6,
  L2_BTN: 8,
  R1_BTN: 7,
  R2_BTN: 9,
  MINUS_BTN: 10,
  PLUS_BTN: 11,
  CHECKER_BTN: 12,
  Y_BTN: 4,
  X_BTN: 3,
  B_BTN: 1,
  A_BTN: 0,
  DPAD_UP_BTN: 12,
  DPAD_DOWN_BTN: 13,
  DPAD_LEFT_BTN: 14,
  DPAD_RIGHT_BTN: 15,
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
} as const;

export type ButtonMap = typeof BUTTONS_DESKTOP | typeof BUTTONS_STANDARD;

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
