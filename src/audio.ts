/* WebAudio synth SFX + a tiny 3-voice chiptune pattern player.
   No assets: everything is oscillators. */

let AC: AudioContext | null = null;
let unlocked = false;

export function unlockAudio(): void {
  if (unlocked) return;
  try {
    AC = new AudioContext();
    unlocked = true;
  } catch { /* audio unavailable */ }
}

type OscType = "square" | "sawtooth" | "triangle" | "sine";

function beep(freq: number, dur = 0.07, type: OscType = "square", vol = 0.12, slide = 0): void {
  if (!AC) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq;
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(20, freq + slide), AC.currentTime + dur);
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + dur);
    o.connect(g).connect(AC.destination);
    o.start(); o.stop(AC.currentTime + dur);
  } catch { /* ignore */ }
}

function noise(dur = 0.06, vol = 0.08): void {
  if (!AC) return;
  try {
    const n = Math.floor(AC.sampleRate * dur);
    const buf = AC.createBuffer(1, n, AC.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = AC.createBufferSource(), g = AC.createGain();
    src.buffer = buf; g.gain.value = vol;
    src.connect(g).connect(AC.destination);
    src.start();
  } catch { /* ignore */ }
}

export const SFX = {
  punch: () => beep(160, 0.06, "square", 0.10, -40),
  hit: () => beep(90, 0.09, "sawtooth", 0.14, -30),
  heavy: () => { beep(70, 0.12, "sawtooth", 0.16, -30); noise(0.08, 0.1); },
  hurt: () => beep(70, 0.14, "sawtooth", 0.15, -20),
  block: () => beep(1200, 0.04, "square", 0.08, -400),
  pickup: () => { beep(520, 0.07, "square", 0.10); setTimeout(() => beep(780, 0.09, "square", 0.10), 70); },
  ko: () => beep(200, 0.1, "square", 0.12, -120),
  boss: () => beep(60, 0.4, "sawtooth", 0.16, 20),
  win: () => [440, 554, 659, 880].forEach((f, i) => setTimeout(() => beep(f, 0.16, "square", 0.12), i * 130)),
  special: () => beep(300, 0.25, "sawtooth", 0.14, 300),
  dash: () => beep(500, 0.06, "square", 0.06, 250),
  launch: () => beep(220, 0.12, "square", 0.12, 300),
  grab: () => beep(140, 0.08, "square", 0.10, -60),
  throwSfx: () => beep(320, 0.1, "square", 0.1, -180),
  smash: () => { noise(0.14, 0.14); beep(2000, 0.1, "square", 0.06, -1500); },
  gas: () => noise(0.3, 0.06),
  goo: () => beep(180, 0.16, "sine", 0.14, -120),
  bat: () => { beep(100, 0.14, "sawtooth", 0.18, -60); noise(0.1, 0.12); },
  firework: () => { setTimeout(() => { noise(0.2, 0.12); beep(900, 0.2, "square", 0.05, -500); }, 350); },
  freeze: () => beep(1046, 0.2, "triangle", 0.09),
  sting: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, "square", 0.1), i * 90)),
  chip: () => beep(700, 0.05, "square", 0.06, -200),
  boom: () => { beep(55, 0.2, "sawtooth", 0.18, -20); noise(0.12, 0.12); },
  msg: () => beep(1400, 0.05, "square", 0.05, 300),
  trade: () => beep(880, 0.12, "square", 0.1, -440),
  paper: () => noise(0.05, 0.05)
};

/* ---------------- chiptune pattern player ----------------
   16-step patterns; step every 8 frames (~112 BPM 16ths).
   note numbers are semitones above A1 (55 Hz); 0 = rest. */

interface Song { bass: number[]; lead: number[]; drums: string; leadType: OscType; }
const F = (n: number): number => 55 * Math.pow(2, n / 12);

const SONGS: Record<string, Song> = {
  // Stage 1: fluorescent panic in A minor
  stage1: {
    bass: [12, 0, 12, 0, 15, 0, 12, 0, 10, 0, 10, 0, 8, 0, 8, 10],
    lead: [24, 0, 27, 0, 31, 27, 24, 0, 22, 0, 24, 0, 27, 0, 22, 0],
    drums: "K.h.S.h.K.h.S.hh", leadType: "square"
  },
  // Stage 2: night drive
  stage2: {
    bass: [5, 0, 5, 5, 0, 5, 0, 3, 3, 0, 3, 3, 0, 8, 0, 10],
    lead: [17, 0, 20, 22, 0, 20, 17, 0, 15, 0, 17, 0, 20, 22, 24, 0],
    drums: "K.h.S.hhK.h.S.h.", leadType: "square"
  },
  // Stage 3: velvet money
  stage3: {
    bass: [7, 0, 14, 0, 7, 0, 14, 0, 5, 0, 12, 0, 10, 0, 14, 0],
    lead: [19, 22, 26, 0, 0, 26, 22, 19, 17, 20, 24, 0, 0, 24, 20, 17],
    drums: "K..hS..hK..hS.hh", leadType: "triangle"
  },
  // Stage 4: dawn
  stage4: {
    bass: [12, 0, 8, 0, 10, 0, 5, 0, 12, 0, 8, 0, 10, 0, 15, 0],
    lead: [24, 0, 20, 0, 22, 24, 27, 0, 24, 0, 20, 0, 31, 0, 27, 24],
    drums: "K.h.S.h.K.h.S.h.", leadType: "square"
  },
  boss: {
    bass: [3, 3, 0, 3, 6, 0, 3, 0, 2, 2, 0, 2, 5, 0, 2, 0],
    lead: [15, 0, 18, 0, 15, 18, 21, 0, 14, 0, 17, 0, 14, 17, 20, 0],
    drums: "K.hhS.h.KKh.S.hh", leadType: "sawtooth"
  }
};

let current: Song | null = null;
let step = 0, frameCount = 0;
let muted = false;

export function musicSet(name: "stage1" | "stage2" | "stage3" | "stage4" | "boss" | "none"): void {
  current = name === "none" ? null : SONGS[name];
  step = 0; frameCount = 0;
}
export function musicToggleMute(): void { muted = !muted; }

export function musicTick(): void {
  if (!AC || !current || muted) return;
  frameCount++;
  if (frameCount % 8 !== 0) return;
  const s = step % 16;
  const b = current.bass[s];
  if (b > 0) beep(F(b), 0.12, "triangle", 0.07);
  const l = current.lead[s];
  if (l > 0) beep(F(l), 0.09, current.leadType, 0.028);
  const d = current.drums[s];
  if (d === "K") beep(50, 0.09, "sawtooth", 0.12, -25);
  else if (d === "S") noise(0.05, 0.06);
  else if (d === "h") noise(0.018, 0.022);
  step++;
}
