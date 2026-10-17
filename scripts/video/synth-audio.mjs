// Synthesises the promo soundtrack offline: an electronic bed at 120 BPM plus the sound effects
// cued to the picture (word ticks, whooshes, riser, impact, click, reveal chime). No samples, no
// licensed music, no generation service: every sample is computed here.
//
//   node scripts/video/synth-audio.mjs out.wav
import { writeFileSync } from "node:fs";
import { CUES, DURATION } from "./timeline.mjs";

const RATE = 48000;
const N = Math.ceil(DURATION * RATE);
const L = new Float32Array(N);
const R = new Float32Array(N);
const send = new Float32Array(N); // reverb bus (mono in)

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const BEAT = 0.5;

function add(buf, i, v) { if (i >= 0 && i < N) buf[i] += v; }
function put(i, v, pan = 0, wet = 0) {
  add(L, i, v * (1 - Math.max(0, pan)));
  add(R, i, v * (1 + Math.min(0, pan)));
  if (wet) add(send, i, v * wet);
}
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const gainAt = (t, points) => {
  // points: [[time, gain], ...] linear between
  if (t <= points[0][0]) return points[0][1];
  for (let k = 1; k < points.length; k++) {
    if (t <= points[k][0]) {
      const [t0, g0] = points[k - 1]; const [t1, g1] = points[k];
      return g0 + (g1 - g0) * ((t - t0) / (t1 - t0));
    }
  }
  return points[points.length - 1][1];
};

// ---- Kick
function kick(at, amp = 1) {
  const len = 0.42 * RATE; let ph = 0;
  for (let n = 0; n < len; n++) {
    const t = n / RATE;
    const f = 45 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / RATE;
    const env = Math.exp(-t * 7.5) * (n < 48 ? n / 48 : 1);
    const click = n < 240 ? rand() * Math.exp(-n / 40) * 0.25 : 0;
    put(Math.round(at * RATE) + n, (Math.sin(ph) * env + click) * amp * 0.9);
  }
}
// ---- Hat (highpassed noise)
function hat(at, amp = 0.12, decay = 45) {
  let prev = 0; const len = 0.09 * RATE;
  for (let n = 0; n < len; n++) {
    const x = rand(); const hp = x - prev; prev = x;
    put(Math.round(at * RATE) + n, hp * Math.exp(-(n / RATE) * decay) * amp, ((at * 7) % 2) - 1 > 0 ? 0.3 : -0.3, 0.1);
  }
}
// ---- Clap/snare
function clap(at, amp = 0.35) {
  let lp = 0; const len = 0.25 * RATE;
  for (let n = 0; n < len; n++) {
    const t = n / RATE; const x = rand(); lp += (x - lp) * 0.35;
    const bursts = t < 0.03 ? (Math.floor(t / 0.01) % 2 ? 0.6 : 1) : 1;
    put(Math.round(at * RATE) + n, (x - lp) * Math.exp(-t * 18) * amp * bursts, 0, 0.35);
  }
}
// ---- Sub bass note
function bass(at, midi, dur, amp = 0.32) {
  const len = dur * RATE; let ph = 0; const f = hz(midi);
  for (let n = 0; n < len; n++) {
    const t = n / RATE; ph += (2 * Math.PI * f) / RATE;
    const env = Math.min(1, n / 200) * Math.exp(-t * 2.2) * Math.min(1, (len - n) / 400);
    put(Math.round(at * RATE) + n, (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * env * amp);
  }
}
// ---- Pad: detuned saw stack through a one-pole lowpass whose cutoff follows `cutoff(t)`
function pad(start, end, chords, cutoff, level) {
  const s0 = Math.round(start * RATE), s1 = Math.round(end * RATE);
  const phases = new Array(24).fill(0).map(() => (rand() + 1) / 2);
  let lpL = 0, lpR = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / RATE;
    const chord = chords[Math.floor((t - start) / 4) % chords.length];
    let vl = 0, vr = 0;
    chord.forEach((m, k) => {
      [-0.09, 0.0, 0.08].forEach((d, j) => {
        const idx = k * 3 + j;
        phases[idx] = (phases[idx] + hz(m + d) / RATE) % 1;
        const saw = phases[idx] * 2 - 1;
        if (j === 0) vl += saw; else if (j === 2) vr += saw; else { vl += saw * 0.6; vr += saw * 0.6; }
      });
    });
    const a = Math.min(0.5, (2 * Math.PI * cutoff(t)) / RATE);
    lpL += (vl - lpL) * a; lpR += (vr - lpR) * a;
    const g = level(t) * 0.05;
    add(L, i, lpL * g); add(R, i, lpR * g); add(send, i, (lpL + lpR) * g * 0.4);
  }
}
// ---- Arp pluck
function pluck(at, midi, amp = 0.1, pan = 0) {
  const len = 0.35 * RATE; let ph = 0; const f = hz(midi);
  for (let n = 0; n < len; n++) {
    const t = n / RATE; ph += (2 * Math.PI * f) / RATE;
    const v = (Math.sin(ph) + 0.4 * Math.sin(3 * ph) * Math.exp(-t * 30)) * Math.exp(-t * 11);
    put(Math.round(at * RATE) + n, v * amp, pan, 0.45);
  }
}
// ---- Noise sweep (whoosh / riser): bandpass with moving centre
function sweep(at, dur, f0, f1, amp, shape = "whoosh") {
  const len = dur * RATE; let lp1 = 0, lp2 = 0;
  for (let n = 0; n < len; n++) {
    const p = n / len;
    const f = f0 * Math.pow(f1 / f0, p);
    const a = Math.min(0.9, (2 * Math.PI * f) / RATE);
    const x = rand(); lp1 += (x - lp1) * a; lp2 += (lp1 - lp2) * a;
    const band = lp1 - lp2;
    const env = shape === "riser" ? Math.pow(p, 2.2) : Math.sin(Math.PI * Math.pow(p, 0.7));
    put(Math.round(at * RATE) + n, band * env * amp * 3, (p - 0.5) * 0.8, 0.3);
  }
}
function tone(at, dur, f0, f1, amp, decay = 3, pan = 0, wet = 0.3) {
  const len = dur * RATE; let ph = 0;
  for (let n = 0; n < len; n++) {
    const t = n / RATE; const p = n / len;
    ph += (2 * Math.PI * (f0 * Math.pow(f1 / f0, p))) / RATE;
    put(Math.round(at * RATE) + n, Math.sin(ph) * Math.exp(-t * decay) * Math.min(1, n / 100) * amp, pan, wet);
  }
}
function tick(at, amp = 0.16) { tone(at, 0.05, 2600, 2200, amp, 60, 0, 0.15); tone(at, 0.03, 900, 700, amp * 0.6, 80, 0, 0); }
function impact(at) {
  kick(at, 1.4);
  tone(at, 2.6, 62, 34, 0.55, 1.4, 0, 0.2);
  let lp = 0;
  for (let n = 0; n < 1.8 * RATE; n++) {
    const t = n / RATE; lp += (rand() - lp) * 0.08;
    put(Math.round(at * RATE) + n, lp * Math.exp(-t * 2.5) * 0.9, 0, 0.6);
  }
}
function bell(at, midi, amp = 0.12, pan = 0) {
  [[1, 1], [2.0, 0.4], [3.01, 0.22], [4.2, 0.1]].forEach(([r, a]) => tone(at, 3.5, hz(midi) * r, hz(midi) * r, amp * a, 1.3 + r * 0.4, pan, 0.6));
}

// ---------------- Arrangement (cues shared with the picture)
// Key: A minor. Chords: Am - F - C - G (as MIDI voicings)
const CH = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]];
const ROOT = [45, 41, 48, 43];

// Hook: dark drone + ticks
pad(0, DURATION, CH, (t) => (t < 9 ? 300 + t * 60 : t < 24 ? 900 + (t - 9) * 90 : t < 36 ? 3200 : 3200 - (t - 36) * 250),
  (t) => gainAt(t, [[0, 0.35], [3, 0.55], [9, 0.8], [21, 0.95], [23.9, 0.4], [24, 1.1], [36, 1.0], [40, 0.8], [44.2, 0.5], [45, 0]]));
CUES.words.forEach((w) => tick(w));

// Problem: heartbeat kick + glitchy ticks
for (let t = 3; t < 9; t += BEAT * 2) kick(t, 0.55);
for (let t = 3.25; t < 9; t += BEAT) hat(t, 0.05, 70);
CUES.chips.forEach((c, i) => tone(c, 0.12, 400 + i * 90, 300 + i * 70, 0.07, 25, i % 2 ? 0.4 : -0.4, 0.2));

// Magic: full groove 9–21, thin out, riser to 24
for (let t = 9; t < 21; t += BEAT) {
  kick(t, 0.85);
  hat(t + BEAT / 2, 0.12);
  if (Math.round((t - 9) / BEAT) % 2 === 1) clap(t, 0.25);
  const bar = Math.floor((t - 9) / 4) % 4;
  bass(t + BEAT / 2, ROOT[bar], BEAT * 0.9);
}
for (let t = 9; t < 24; t += BEAT / 2) {
  const bar = Math.floor((t - 9) / 4) % 4; const step = Math.round((t - 9) / (BEAT / 2)) % 8;
  pluck(t, CH[bar][[0, 2, 1, 3, 2, 1, 3, 2][step]] + 12, t > 21 ? 0.06 : 0.08, step % 2 ? 0.35 : -0.35);
}
for (let t = 21; t < 24; t += BEAT / (t > 23 ? 4 : 2)) clap(t, 0.08 + (t - 21) * 0.06);
sweep(21, 3, 300, 9000, 0.35, "riser");
tone(21, 3, 110, 880, 0.08, 0, 0, 0.3);

// Wow: impact, double-time groove 24–36
impact(CUES.impact);
for (let t = 24.5; t < 35.5; t += BEAT) {
  kick(t, 0.95);
  hat(t + BEAT / 2, 0.14); hat(t + BEAT / 4, 0.06); hat(t + (3 * BEAT) / 4, 0.06);
  if (Math.round((t - 24) / BEAT) % 2 === 1) clap(t, 0.32);
  const bar = Math.floor((t - 24) / 4) % 4;
  bass(t, ROOT[bar], BEAT * 0.45, 0.3); bass(t + BEAT / 2, ROOT[bar] + 12, BEAT * 0.4, 0.18);
}
for (let t = 24; t < 36; t += BEAT / 2) {
  const bar = Math.floor((t - 24) / 4) % 4; const step = Math.round((t - 24) / (BEAT / 2)) % 8;
  pluck(t, CH[bar][[0, 1, 2, 3, 3, 2, 1, 2][step]] + 24, 0.07, step % 2 ? 0.45 : -0.45);
}
CUES.beats.forEach((b) => tone(b, 0.5, 1320, 1320, 0.06, 6, 0, 0.5));
tick(CUES.click, 0.3);

// Reveal: last hit, chime, tail
impact(CUES.reveal);
[69, 76, 81, 84].forEach((m, i) => bell(CUES.reveal + 0.15 + i * 0.12, m, 0.09, [-0.4, 0.4, -0.2, 0.2][i]));
bell(CUES.cta, 88, 0.07);

// Transitions
CUES.whooshes.forEach((w) => sweep(w - 0.25, 0.6, 400, 6000, 0.32));

// ---------------- Reverb: 4 combs + 2 allpasses (Schroeder), stereo spread
function reverb(input) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round(d * RATE / 44100), buf: null, i: 0, fb: 0.82 }));
  const outL = new Float32Array(N), outR = new Float32Array(N);
  combs.forEach((c) => { c.buf = new Float32Array(c.d); });
  for (let n = 0; n < N; n++) {
    let s = 0;
    combs.forEach((c, k) => { const y = c.buf[c.i]; c.buf[c.i] = input[n] + y * c.fb; c.i = (c.i + 1) % c.d; s += k % 2 ? -y : y; });
    outL[n] = s * 0.18; outR[n] = (n > 480 ? outL[n - 480] : 0);
  }
  return [outL, outR];
}
const [rl, rr] = reverb(send);
let peak = 0;
for (let n = 0; n < N; n++) {
  const t = n / RATE;
  const fade = Math.min(1, t / 0.08) * Math.min(1, (DURATION - t) / 1.2);
  L[n] = Math.tanh((L[n] + rl[n]) * 1.1) * fade;
  R[n] = Math.tanh((R[n] + rr[n]) * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
const norm = 0.89 / peak;
const data = Buffer.alloc(44 + N * 4);
data.write("RIFF", 0); data.writeUInt32LE(36 + N * 4, 4); data.write("WAVE", 8);
data.write("fmt ", 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(RATE, 24); data.writeUInt32LE(RATE * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write("data", 36); data.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(Math.round(L[n] * norm * 32767), 44 + n * 4);
  data.writeInt16LE(Math.round(R[n] * norm * 32767), 46 + n * 4);
}
writeFileSync(process.argv[2] ?? "promo-audio.wav", data);
console.log("audio written", DURATION + "s");
