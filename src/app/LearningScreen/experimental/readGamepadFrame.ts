import {
  type ButtonMap,
  getDpadButtonState,
  isGamepadButtonHeld,
} from './gamepadButtonMap';

export const rising = (now: boolean, was: boolean) => now && !was;
export const falling = (now: boolean, was: boolean) => !now && was;

export type Cardinal = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type PhysicalButtons = {
  face: { a: boolean; b: boolean; x: boolean; y: boolean };
  shoulders: { l1: boolean; r1: boolean; l2: boolean; r2: boolean };
  menu: { minus: boolean; plus: boolean; checker: boolean };
  sticks: { l3: boolean; r3: boolean };
};

export type HatAxis9DecoderState = {
  neutral: number | null;
  maxAbsSeen: number;
};

const emptyCardinal = (): Cardinal => ({
  up: false,
  down: false,
  left: false,
  right: false,
});

export const getDpadStateFromAxes = (axes: readonly number[]) => {
  const axis7 = axes[7] || 0;
  const axis9 = axes[9] || 0;
  const axis1 = axes[1] || 0;
  const axis6 = axes[6] || 0;
  const axis8 = axes[8] || 0;
  const axis0 = axes[0] || 0;

  const up = axis7 < -0.5 || axis1 < -0.5;
  const down = axis7 > 0.5 || axis1 > 0.5;
  const right = axis6 > 0.5 || axis8 > 0.5 || axis0 > 0.5;
  const left = axis6 < -0.5 || axis8 < -0.5 || axis0 < -0.5;

  const upAxis = axis7 < -0.5 ? 7 : axis9 < -0.5 ? 9 : 1;
  const downAxis = axis7 > 0.5 ? 7 : axis9 > 0.5 ? 9 : 1;
  const rightAxis = axis6 > 0.5 ? 6 : axis8 > 0.5 ? 8 : 0;
  const leftAxis = axis6 < -0.5 ? 6 : axis8 < -0.5 ? 8 : 0;

  return {
    up,
    down,
    left,
    right,
    axis: {
      up: upAxis,
      down: downAxis,
      left: leftAxis,
      right: rightAxis,
    },
  };
};

export type DpadAxesState = ReturnType<typeof getDpadStateFromAxes>;

const decodeHatAxis9Direction = (axis9Value: number, maxAbsAxis9: number) => {
  if (!maxAbsAxis9) {
    return emptyCardinal();
  }

  const normalized = axis9Value / maxAbsAxis9;
  const positions = [-1, -0.714, -0.428, -0.143, 0.143, 0.428, 0.714, 1];
  const closestIdx = positions.reduce(
    (bestIdx, target, idx) =>
      Math.abs(normalized - target) < Math.abs(normalized - positions[bestIdx])
        ? idx
        : bestIdx,
    0,
  );

  const dirMap: Cardinal[] = [
    { up: true, down: false, left: false, right: false },
    { up: true, down: false, left: false, right: true },
    { up: false, down: false, left: false, right: true },
    { up: false, down: true, left: false, right: true },
    { up: false, down: true, left: false, right: false },
    { up: false, down: true, left: true, right: false },
    { up: false, down: false, left: true, right: false },
    { up: true, down: false, left: true, right: false },
  ];

  return dirMap[closestIdx];
};

export function readPhysicalButtons(
  gp: Gamepad,
  map: ButtonMap,
): PhysicalButtons {
  const b = gp.buttons;
  const pressed = (idx: number) => Boolean(b[idx]?.pressed);

  return {
    face: {
      a: pressed(map.A_BTN),
      b: pressed(map.B_BTN),
      x: pressed(map.X_BTN),
      y: pressed(map.Y_BTN),
    },
    shoulders: {
      l1: pressed(map.L1_BTN),
      r1: pressed(map.R1_BTN),
      l2: isGamepadButtonHeld(b, map.L2_BTN),
      r2: isGamepadButtonHeld(b, map.R2_BTN),
    },
    menu: {
      minus: pressed(map.MINUS_BTN),
      plus: pressed(map.PLUS_BTN),
      checker: pressed(map.CHECKER_BTN),
    },
    sticks: {
      l3: isGamepadButtonHeld(b, map.L_STICK_CLICK_BTN),
      r3: isGamepadButtonHeld(b, map.R_STICK_CLICK_BTN),
    },
  };
}

const R_STICK_DEAD_ZONE = 0.5;

export function readRightStickCardinals(
  gp: Gamepad,
  map: ButtonMap,
): Cardinal {
  const rsX = gp.axes[map.R_STICK_X_AXIS] ?? 0;
  const rsY = gp.axes[map.R_STICK_Y_AXIS] ?? 0;
  return {
    up: rsY < -R_STICK_DEAD_ZONE,
    down: rsY > R_STICK_DEAD_ZONE,
    left: rsX < -R_STICK_DEAD_ZONE,
    right: rsX > R_STICK_DEAD_ZONE,
  };
}
// D-pad hat axis 9 decoder - directional buttons (nn joystick)
export function stepHatAxis9(
  prev: HatAxis9DecoderState,
  gp: Gamepad,
  map: ButtonMap,
): {
  next: HatAxis9DecoderState;
  axis9LooksActive: boolean;
  dpadBtn: Cardinal;
  hat: Cardinal;
} {
  const dpadBtn = getDpadButtonState(gp.buttons, map);
  const axis9Value = gp.axes[9] ?? 0;
  const neutral = prev.neutral === null ? axis9Value : prev.neutral;
  const axis9Delta = Math.abs(axis9Value - neutral);
  const stickClickHeld =
    isGamepadButtonHeld(gp.buttons, map.L_STICK_CLICK_BTN) ||
    isGamepadButtonHeld(gp.buttons, map.R_STICK_CLICK_BTN);

  const axis9LooksActive = axis9Delta > 0.25 && !stickClickHeld;

  let maxAbsSeen = prev.maxAbsSeen;
  if (axis9LooksActive) {
    maxAbsSeen = Math.max(maxAbsSeen, Math.abs(axis9Value));
  }

  const fromAxis9 = axis9LooksActive
    ? decodeHatAxis9Direction(axis9Value, maxAbsSeen)
    : emptyCardinal();

  const hat: Cardinal = {
    up: fromAxis9.up || dpadBtn.up,
    down: fromAxis9.down || dpadBtn.down,
    left: fromAxis9.left || dpadBtn.left,
    right: fromAxis9.right || dpadBtn.right,
  };

  return {
    next: { neutral, maxAbsSeen },
    axis9LooksActive,
    dpadBtn,
    hat,
  };
}
