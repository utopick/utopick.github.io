// node --test tests/lab.test.js : the lab's mouth-to-MIDI and jam logic (script#mouth-dsp in test/latency-lab/index.html), on synthetic signals
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");
const src = fs.readFileSync(require.resolve("../test/latency-lab/index.html"), "utf8").match(/<script id="mouth-dsp">([\s\S]*?)<\/script>/)[1];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + ";this.M=MouthDSP", ctx);
const M = ctx.M, SR = 44100;
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (x, t, sig) => sig.forEach((v, i) => { const j = Math.round(t * SR) + i; if (j < x.length) x[j] += v; });
const gen = (n, f) => Float32Array.from({ length: n }, (_, i) => f(i / SR, i));
const lp = (a, k) => { let y = 0; return a.map((v) => (y += k * (v - y))); };

test("humming becomes notes on a 16th grid", () => {
  const bpm = 120, step = 60 / bpm / 4, x = new Float32Array(SR * 4);
  [[57, 0], [60, 4], [64, 8], [60, 12]].forEach(([m, s]) => {
    const f = 440 * 2 ** ((m - 69) / 12), t0 = 0.5 + s * step, n = Math.round(step * 3.6 * SR);
    add(x, t0, gen(n, (t) => 0.4 * Math.sin(2 * Math.PI * f * t + 0.3 * Math.sin(2 * Math.PI * 5 * t)))); // with vibrato
  });
  const r = M.humToEvents(x, SR, { bpm, t0: 0.5 });
  assert.deepEqual(Array.from(r.events, (e) => [e.step, e.midi]), [[0, 57], [4, 60], [8, 64], [12, 60]]);
  assert.ok(r.events.every((e) => e.len >= 3 && e.len <= 4));
});

test("snap to key moves a wrong note into the scale", () => {
  const step = 0.125, x = new Float32Array(SR * 4);
  [60, 62, 64, 61, 64, 67, 60, 72].forEach((m, i) => { const f = 440 * 2 ** ((m - 69) / 12); add(x, 0.3 + i * 4 * step, gen(Math.round(0.4 * SR), (t) => 0.4 * Math.sin(2 * Math.PI * f * t))); });
  const r = M.humToEvents(x, SR, { bpm: 120, t0: 0.3, snap: true });
  assert.equal(M.keyName(r.key), "C major");
  assert.deepEqual(Array.from(r.events, (e) => e.midi), [60, 62, 64, 60, 64, 67, 60, 72]);
});

test("silence and noise give no notes", () => {
  assert.equal(M.humToEvents(new Float32Array(SR), SR, { bpm: 100, t0: 0 }).events.length, 0);
  assert.equal(M.humToEvents(gen(SR, () => 0.3 * rnd()), SR, { bpm: 100, t0: 0 }).events.length, 0);
});

// kick: low thump, snare: tone + band noise, hat: high-passed noise
const kick = () => gen(SR * 0.18, (t) => 0.8 * Math.sin(2 * Math.PI * (45 + 90 * Math.exp(-t * 40)) * t) * Math.exp(-t * 18));
const snare = () => { const n = lp(gen(SR * 0.15, () => rnd()), 0.5); return gen(SR * 0.15, (t, i) => (0.5 * n[i] + 0.3 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 25)); };
const hat = (len = 0.05) => { const n = gen(SR * len, () => rnd()); return gen(SR * len, (t, i) => 0.5 * (n[i] - (n[i - 1] || 0)) * Math.exp(-t / (len / 4))); };
const pattern = (types, step) => { const x = new Float32Array(SR * 4), v = { kick, snare, hat, ohat: () => hat(0.3) };
  types.forEach((k, i) => { if (k) add(x, 0.5 + i * step, v[k]()); }); return x; };

test("mouth drums are told apart and put on the grid", () => {
  const bpm = 120, step = 0.125, want = ["kick", null, "hat", null, "snare", null, "hat", "ohat", "kick", null, "hat", null, "snare", null, "hat", null];
  const r = M.drumsToEvents(pattern(want, step), SR, { bpm, t0: 0.5 });
  const got = Array(16).fill(null); r.events.forEach((e) => (got[e.step] = e.type));
  assert.deepEqual(got, want);
});

test("calibration learns a mouth (kick x4, snare x4, hat x4)", () => {
  const step = 0.25, x = new Float32Array(SR * 7);
  ["kick", "snare", "hat"].forEach((k, b) => { for (let i = 0; i < 4; i++) add(x, 0.3 + (b * 4 + i) * step * 2, { kick, snare, hat }[k]()); });
  const cal = M.calibrate(M.drumsToEvents(x, SR, { bpm: 120, t0: 0.3, steps: 99 }).feats);
  assert.ok(cal);
  const r = M.drumsToEvents(pattern(["snare", "kick", "hat", "snare"], 0.25), SR, { bpm: 120, t0: 0.5, cal });
  assert.deepEqual(Array.from(r.events, (e) => e.type), ["snare", "kick", "hat", "snare"]);
  assert.equal(M.calibrate([]), null);
});

test("MIDI file has a header, a melody track and a drum track", () => {
  const b = M.toMidi({ bpm: 100, melody: [{ step: 0, len: 4, midi: 60 }], drums: [{ step: 0, type: "kick" }] });
  assert.equal(String.fromCharCode(...b.slice(0, 4)), "MThd");
  assert.equal(b[11], 3); // meta + melody + drums
  assert.ok(b.includes(0x99)); // note on, channel 10
});

const feed = (b, bar, pcs) => pcs.forEach((p) => b.note(p, 1, bar));
test("jam: finds the key, follows the chords a bar behind, ignores one stray note", () => {
  const b = M.jamBrain();
  feed(b, 0, [0, 4, 7, 4]); let s = b.endBar(0, 1);
  assert.equal(M.keyName(s.key), "C major"); assert.equal(s.chord.name, "C");
  feed(b, 1, [7, 11, 2, 7]); s = b.endBar(1, 1); assert.equal(s.chord.name, "G");
  feed(b, 2, [9, 0, 4, 9, 6]); s = b.endBar(2, 1); assert.equal(M.keyName(s.key), "C major"); // the F# did not flip the key
  assert.equal(s.chord.name, "Am");
});
test("jam: a minor melody gives a minor key, silence holds the chord", () => {
  const b = M.jamBrain();
  for (let bar = 0; bar < 3; bar++) feed(b, bar, [9, 0, 4, 9, 11, 4]), b.endBar(bar, 1);
  assert.equal(M.keyName(b.st.key), "A minor");
  const before = b.st.chord.name, s = b.endBar(9, 1);
  assert.equal(s.chord.name, before); assert.equal(s.conf, 0);
});
test("jam: low follow sticks to the progression", () => {
  const b = M.jamBrain(); feed(b, 0, [0, 4, 7]); b.endBar(0, 0);
  feed(b, 1, [0, 7, 4]); assert.equal(b.endBar(1, 0).chord.name, "G"); // ambiguous notes, the progression (I V vi IV) decides
});
