import { describe, it, expect } from 'vitest';
import { renderCard, registerCard, hasCard } from './registry.js';
import { kanjiById, vocabById } from '../../core/content.js';

describe('bảng đăng ký thẻ', () => {
  it('kanji và vocab đã đăng ký; loại lạ trả null', () => {
    expect(renderCard('kanji', kanjiById('日')).dataset.id).toBe('日');
    expect(renderCard('vocab', vocabById('n5-0001')).dataset.id).toBe('n5-0001');
    expect(renderCard('cau-sai', {})).toBeNull();
    expect(hasCard('cau-sai')).toBe(false);
  });
  it('đăng ký thêm loại mới', () => {
    registerCard('thu', (x) => Object.assign(document.createElement('article'), { textContent: x.t }));
    expect(renderCard('thu', { t: 'a' }).textContent).toBe('a');
  });
});
