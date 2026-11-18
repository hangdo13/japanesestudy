import { describe, it, expect } from 'vitest';
import { splitMora, countMora } from './mora.js';

describe('splitMora', () => {
  it.each([
    ['とうきょう', ['と', 'う', 'きょ', 'う']],
    ['きって', ['き', 'っ', 'て']],
    ['ジュース', ['ジュ', 'ー', 'ス']],
    ['しんぶん', ['し', 'ん', 'ぶ', 'ん']],
    ['パーティー', ['パ', 'ー', 'ティ', 'ー']],
    ['おばあさん', ['お', 'ば', 'あ', 'さ', 'ん']],
  ])('%s', (w, m) => expect(splitMora(w)).toEqual(m));
  it.each(['', 'abc', 'ゃき', 'っゃ', '学校', 'きゃゃ', 'き て', 'ーあ', 'っ', 'ーー', 'きっ', 'んだ', 'かっー'])('không hợp lệ: "%s"', (w) => expect(splitMora(w)).toBeNull());
  it('countMora', () => {
    expect(countMora('おばさん')).toBe(4);
    expect(countMora('おばあさん')).toBe(5);
    expect(countMora('x')).toBeNull();
  });
});
