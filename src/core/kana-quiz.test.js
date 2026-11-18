import { describe, it, expect } from 'vitest';
import { buildSession, pickDistractors, seededRng, shuffle, soundKey } from './kana-quiz.js';
import { kana, kanaPairs } from './content.js';

const basic = kana().filter((k) => k.script === 'hiragana' && k.nhom === 'co-ban');

describe('buildSession', () => {
  it('10 câu, mỗi câu 4 đáp án khác romaji, có đáp án đúng ở vị trí answer', () => {
    const s = buildSession(basic, { rng: seededRng(7) });
    expect(s).toHaveLength(10);
    for (const q of s) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.romaji)).size).toBe(4);
      expect(q.options[q.answer]).toBe(q.target);
    }
  });

  it('không có giọng thì không có câu nghe', () => {
    const kinds = new Set(buildSession(basic, { canSpeak: false, rng: seededRng(1) }).map((q) => q.kind));
    expect(kinds).toEqual(new Set(['chu-romaji', 'romaji-chu']));
    const kinds2 = new Set(buildSession(basic, { canSpeak: true, rng: seededRng(1) }).map((q) => q.kind));
    expect(kinds2.has('nghe-chu')).toBe(true);
  });

  it('bộ ít hơn 10 chữ vẫn đủ 10 câu (lặp lại)', () => {
    expect(buildSession(basic.slice(0, 5), { rng: seededRng(2) })).toHaveLength(10);
  });
});

describe('pickDistractors', () => {
  it('không lấy đáp án trùng romaji (じ/ぢ)', () => {
    const all = kana().filter((k) => k.script === 'hiragana');
    const ji = all.find((k) => k.id === 'じ');
    for (let seed = 1; seed < 30; seed++) {
      const d = pickDistractors(ji, all, seededRng(seed), ['ぢ']);
      expect(d.map((k) => k.id)).not.toContain('ぢ');
    }
  });

  it('không để hai đáp án cùng tiếng (を/お)', () => {
    const all = kana().filter((k) => k.script === 'hiragana');
    const wo = all.find((k) => k.id === 'を');
    for (let seed = 1; seed < 40; seed++) {
      expect(pickDistractors(wo, all, seededRng(seed)).map((k) => k.id)).not.toContain('お');
    }
    expect(soundKey('wo')).toBe('o');
  });

  it('ưu tiên chữ dễ nhầm', () => {
    const all = kana().filter((k) => k.script === 'katakana');
    const shi = all.find((k) => k.id === 'シ');
    const d = pickDistractors(shi, all, seededRng(3), kanaPairs('シ'));
    expect(d.map((k) => k.id)).toEqual(expect.arrayContaining(['ツ', 'ミ']));
  });
});

it('shuffle giữ đủ phần tử', () => {
  expect(shuffle([1, 2, 3, 4], seededRng(5)).sort()).toEqual([1, 2, 3, 4]);
});
