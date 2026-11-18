import { describe, it, expect, vi } from 'vitest';
import { renderVocabCard } from './vocab.js';
import { vocabById, vocab } from '../../core/content.js';

describe('ui/cards/vocab', () => {
  it('行く: kana phía trên, nghĩa, chip chủ đề + loại, cách đọc khác', () => {
    const w = vocabById('n5-0049');
    const c = renderVocabCard(w, { onPlay: vi.fn() });
    expect(c.querySelector('.kt-flash__kana').textContent).toBe('いく');
    expect(c.querySelector('.kt-flash__glyph').textContent).toBe('行く');
    expect(c.querySelector('.kt-flash__meaning').textContent).toBe(w.nghia);
    expect(c.querySelector('.kt-flash__ex .kt-chip--vocab').textContent).toBe(w.chuDe);
    expect(c.querySelector('.kt-flash__ex').textContent).toContain('ゆく');
    expect(c.querySelector('[data-role=play]').getAttribute('aria-label')).toBe('Phát âm');
  });
  it('いい: không lặp kana, "Cũng viết/đọc" không trùng', () => {
    const c = renderVocabCard(vocabById('n5-0044'));
    expect(c.querySelector('.kt-flash__kana').textContent).toBe('');
    expect(c.querySelector('.kt-flash__ex small').textContent).toBe('Cũng viết/đọc: よい');
    expect(c.querySelector('[data-role=play]')).toBeNull();
  });
  it('từ dài thì thu cỡ chữ', () => {
    const long = vocab().find((w) => [...w.tu].length > 4);
    expect(renderVocabCard(long).querySelector('.kt-flash__glyph').classList.contains('app-flash__glyph--long')).toBe(true);
  });
});
