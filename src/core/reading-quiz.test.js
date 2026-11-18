import { describe, it, expect } from 'vitest';
import { wrongReadings, buildReadingSession } from './reading-quiz.js';
import { seededRng } from './kana-quiz.js';
import { kanaRules } from './content.js';

describe('wrongReadings', () => {
  it('きって: có cách đọc bỏ っ', () => {
    expect(wrongReadings('kitte', ['am-ngat'], seededRng(1))).toContain('kite');
  });
  it('matcha → macha', () => {
    expect(wrongReadings('matcha', ['am-ngat'], seededRng(1))).toContain('macha');
  });
  it('おかあさん: có cách đọc ngắn', () => {
    expect(wrongReadings('okaasan', ['truong-am'], seededRng(2))).toContain('okasan');
  });
  it('コーヒー: có cách đọc rút ngắn ー', () => {
    const w = wrongReadings('koohii', ['ke-dai'], seededRng(3));
    expect(w.some((x) => x === 'kohii' || x === 'koohi')).toBe(true);
  });
  it('mọi từ luyện, nhiều seed: tối đa 3, khác nhau, khác đáp án đúng; đa số đủ 3', () => {
    const words = kanaRules().tuLuyen;
    let full = 0;
    for (const w of words) {
      for (let seed = 1; seed <= 3; seed++) {
        const sai = wrongReadings(w.romaji, w.loai, seededRng(seed));
        expect(sai.length).toBeLessThanOrEqual(3);
        expect(new Set([w.romaji, ...sai]).size).toBe(sai.length + 1);
        if (seed === 1 && sai.length === 3) full += 1;
      }
    }
    expect(full).toBeGreaterThan(words.length * 0.8);
  });
  it('ưu tiên lỗi đúng quy tắc của từ (mọi từ luyện, 10 seed)', () => {
    const degem = (r) => r.replace(/([bcdfghjkmprstvwz])\1/, '$1').replace('tch', 'ch');
    for (const w of kanaRules().tuLuyen) {
      for (let seed = 1; seed <= 10; seed++) {
        const sai = wrongReadings(w.romaji, w.loai, seededRng(seed));
        if (w.loai[0] === 'am-ngat') expect(sai).toContain(degem(w.romaji));
        else expect(sai.some((x) => x.length === w.romaji.length - 1 && !/(.)\1\1/.test(x))).toBe(true);
      }
    }
  });
  it('không sinh chữ vô nghĩa kiểu "douu", "kyuuu"', () => {
    for (const w of kanaRules().tuLuyen)
      for (const x of wrongReadings(w.romaji, w.loai, seededRng(1))) expect(x).not.toMatch(/ouu|eii|([aiueo])\1\1/);
  });
  it('rỗng thì không có đáp án sai', () => {
    expect(wrongReadings('', [])).toEqual([]);
  });
});

describe('buildReadingSession', () => {
  it('10 câu, có 3 câu trợ từ, đáp án đúng ở answer, 4 đáp án khác nhau', () => {
    const s = buildReadingSession(kanaRules(), { rng: seededRng(5) });
    expect(s).toHaveLength(10);
    expect(s.filter((q) => q.troTu)).toHaveLength(3);
    for (const q of s) {
      expect(q.options[q.answer]).toBe(q.romaji);
      expect(new Set(q.options).size).toBe(4);
    }
  });
  it('có đủ từ âm ngắt, trường âm và ー (nhiều seed)', () => {
    const words = kanaRules().tuLuyen;
    for (let seed = 1; seed <= 20; seed++) {
      const s = buildReadingSession(kanaRules(), { rng: seededRng(seed) });
      expect(s).toHaveLength(10);
      const kinds = new Set(s.filter((q) => !q.troTu).map((q) => words.find((w) => w.doc === q.doc).loai[0]));
      expect(kinds).toEqual(new Set(['am-ngat', 'truong-am', 'ke-dai']));
    }
  });
  it('ít câu trợ từ thì dùng hết số có', () => {
    const r = kanaRules();
    const s = buildReadingSession({ tuLuyen: r.tuLuyen, cauTroTu: r.cauTroTu.slice(0, 2) }, { rng: seededRng(1) });
    expect(s.filter((q) => q.troTu)).toHaveLength(2);
    for (const q of s) expect(new Set(q.options).size).toBe(4);
  });
});
