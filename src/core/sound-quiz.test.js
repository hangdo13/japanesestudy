import { describe, it, expect } from 'vitest';
import { buildMoraSession, buildPairSession, isInterestingForMora, hasLongVowel } from './sound-quiz.js';
import { splitMora } from './mora.js';
import { seededRng } from './kana-quiz.js';
import { kanaRules, kanaSounds } from './content.js';
import { countMora } from './mora.js';

const words = [...kanaRules().tuLuyen, ...kanaSounds().capAm.flatMap((c) => [c.a, c.b])];

describe('buildMoraSession', () => {
  it('10 câu, 4 số liền nhau ≥1 có số phách đúng ở answer (nhiều seed)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = buildMoraSession(words, { rng: seededRng(seed) });
      expect(s).toHaveLength(10);
      expect(new Set(s.map((q) => q.doc)).size).toBe(10);
      for (const q of s) {
        expect(q.options[q.answer]).toBe(countMora(q.doc));
        expect(q.options.every((o, i) => o >= 1 && (i === 0 || o === q.options[i - 1] + 1))).toBe(true);
      }
    }
  });
  it('đáp án đúng không luôn ở cùng vị trí', () => {
    const pos = new Set();
    for (let seed = 1; seed <= 20; seed++) buildMoraSession(words, { rng: seededRng(seed) }).forEach((q) => pos.add(q.answer));
    expect(pos.size).toBeGreaterThanOrEqual(3);
  });
  it('vị trí đáp án đều với từ ngắn (2 phách: A/B, 3 phách: A/B/C)', () => {
    const pos = { 2: new Map(), 3: new Map() };
    for (let seed = 1; seed <= 400; seed++)
      for (const q of buildMoraSession(words, { rng: seededRng(seed) })) {
        const n = q.phach.length;
        if (pos[n]) pos[n].set(q.answer, (pos[n].get(q.answer) || 0) + 1);
      }
    expect([...pos[2].keys()].sort()).toEqual([0, 1]);
    expect([...pos[3].keys()].sort()).toEqual([0, 1, 2]);
    for (const m of Object.values(pos)) {
      const counts = [...m.values()];
      expect(Math.min(...counts) / Math.max(...counts)).toBeGreaterThan(0.6);
    }
  });
  it('hasLongVowel: trường âm hiragana', () => {
    for (const w of ['きのう', 'とけい', 'おばあさん', 'とおい', 'きゅう']) expect(hasLongVowel(splitMora(w))).toBe(true);
    for (const w of ['さくら', 'いえ', 'あおい']) expect(hasLongVowel(splitMora(w))).toBe(false);
  });
  it('isInterestingForMora', () => {
    expect(isInterestingForMora('きのう')).toBe(true);
    expect(isInterestingForMora('とけい')).toBe(true);
    expect(isInterestingForMora('とうきょう')).toBe(true);
    expect(isInterestingForMora('きって')).toBe(true);
    expect(isInterestingForMora('さくら')).toBe(false);
    expect(isInterestingForMora('学校')).toBe(false);
  });
});

describe('buildPairSession', () => {
  it('10 câu, 2 đáp án là hai từ của cặp, đáp án đúng là từ được đọc', () => {
    const pairs = kanaSounds().capAm;
    const s = buildPairSession(pairs, { rng: seededRng(4) });
    expect(s).toHaveLength(10);
    for (const q of s) {
      expect(q.options).toHaveLength(2);
      expect(q.options[q.answer]).toBe(q.target);
      expect(q.options).toContain(q.other);
      expect(pairs.some((p) => (p.a === q.target && p.b === q.other) || (p.b === q.target && p.a === q.other))).toBe(true);
    }
  });
  it('cả hai từ của cặp đều được đọc, đáp án đúng ở cả hai vị trí', () => {
    const pairs = kanaSounds().capAm;
    const targets = new Set();
    const answers = new Set();
    for (let seed = 1; seed <= 20; seed++)
      for (const q of buildPairSession(pairs, { rng: seededRng(seed) })) {
        targets.add(q.target);
        answers.add(q.answer);
      }
    expect(pairs.every((p) => targets.has(p.a) && targets.has(p.b))).toBe(true);
    expect(answers).toEqual(new Set([0, 1]));
  });
  it('ít cặp thì lặp lại cho đủ', () => {
    expect(buildPairSession(kanaSounds().capAm.slice(0, 3), { rng: seededRng(1) })).toHaveLength(10);
    expect(buildPairSession([], {})).toEqual([]);
  });
});
