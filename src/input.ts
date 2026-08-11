/* Keyboard + touch input. Movement plus exactly three combat buttons
   (attack / strong / special) and pause. Edge detection for
   pressed/released; the 6-frame attack buffer lives in player.ts. */

export type Key =
  | "left" | "right" | "up" | "down"
  | "attack" | "strong" | "special" | "pause";

const KEYMAP: Record<string, Key> = {
  arrowleft: "left", arrowright: "right", arrowup: "up", arrowdown: "down",
  a: "left", d: "right", w: "up", s: "down",
  j: "attack", z: "attack",
  k: "strong", x: "strong",
  l: "special", c: "special",
  escape: "pause", p: "pause"
};

const down: Record<Key, boolean> = {
  left: false, right: false, up: false, down: false,
  attack: false, strong: false, special: false, pause: false
};
const pressedNow: Record<Key, boolean> = { ...down };
const releasedNow: Record<Key, boolean> = { ...down };

let unlockCb: (() => void) | null = null;
export function onFirstInteraction(cb: () => void): void { unlockCb = cb; }
function fireUnlock(): void {
  if (unlockCb) { const cb = unlockCb; unlockCb = null; cb(); }
}

export const isTouch = matchMedia("(pointer: coarse)").matches;

export function initInput(): void {
  addEventListener("keydown", (e) => {
    const k = KEYMAP[e.key.toLowerCase()];
    fireUnlock();
    if (!k) return;
    e.preventDefault();
    if (!e.repeat) pressedNow[k] = true;
    down[k] = true;
  });
  addEventListener("keyup", (e) => {
    const k = KEYMAP[e.key.toLowerCase()];
    if (!k) return;
    if (down[k]) releasedNow[k] = true;
    down[k] = false;
  });

  if (isTouch) document.body.classList.add("touch");
  document.querySelectorAll<HTMLElement>("[data-k]").forEach((b) => {
    const k = b.dataset.k as Key;
    const on = (e: Event) => {
      e.preventDefault(); fireUnlock();
      if (!down[k]) pressedNow[k] = true;
      down[k] = true; b.classList.add("on");
    };
    const off = (e: Event) => {
      e.preventDefault();
      if (down[k]) releasedNow[k] = true;
      down[k] = false; b.classList.remove("on");
    };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });
}

export const held = (k: Key): boolean => down[k];
export const pressed = (k: Key): boolean => pressedNow[k];
export const released = (k: Key): boolean => releasedNow[k];

/* call at the END of each fixed update step */
export function tickInput(): void {
  for (const k of Object.keys(pressedNow) as Key[]) {
    pressedNow[k] = false;
    releasedNow[k] = false;
  }
}
