export const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const sign = (v: number): -1 | 0 | 1 => (v < 0 ? -1 : v > 0 ? 1 : 0);
