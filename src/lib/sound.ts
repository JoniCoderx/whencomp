"use client";

// Subtle premium UI sounds via the Web Audio API — no asset files needed.
// Respects a user mute preference stored in localStorage.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("wc.muted") !== "1";
}

export function setMuted(muted: boolean) {
  if (typeof window !== "undefined")
    localStorage.setItem("wc.muted", muted ? "1" : "0");
}

function tone(freq: number, duration = 0.08, type: OscillatorType = "sine", gain = 0.04) {
  if (!soundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

export const sfx = {
  click: () => tone(520, 0.05, "triangle", 0.03),
  soft: () => tone(320, 0.06, "sine", 0.025),
  success: () => {
    tone(523, 0.09, "sine", 0.04);
    setTimeout(() => tone(784, 0.12, "sine", 0.04), 90);
  },
  join: () => {
    tone(440, 0.07, "triangle", 0.04);
    setTimeout(() => tone(660, 0.1, "triangle", 0.04), 70);
  },
  matchStart: () => {
    tone(392, 0.1, "sawtooth", 0.035);
    setTimeout(() => tone(587, 0.1, "sawtooth", 0.035), 100);
    setTimeout(() => tone(784, 0.18, "sawtooth", 0.04), 200);
  },
};
