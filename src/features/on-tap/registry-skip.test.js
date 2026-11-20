// Loại thẻ chưa đăng ký thì màn ôn bỏ qua, không lỗi (Story 2.4, AD-8).
import { describe, it, expect, vi } from 'vitest';
vi.mock('../../ui/cards/registry.js', () => ({ hasCard: () => false, renderCard: () => null }));
const { renderKanjiReview } = await import('./index.js');
const { renderVocabReview } = await import('./vocab.js');
const { createProgress } = await import('../../core/progress.js');

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const now = () => new Date(2026, 10, 20, 9, 0);

describe('bảng đăng ký không có loại thẻ', () => {
  it('ôn kanji: bỏ thẻ nghĩa, không vỡ', async () => {
    const s = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    s.update((d) => {
      d.kanji['日'] = { gioiThieu: '2026-11-19' };
    });
    const v = renderKanjiReview({ progress: s, now, win: { location: { hash: '' } } });
    await v.ready;
    expect(v.node.querySelector('.kt-deck')).toBeNull();
    expect(v.node.textContent).toContain('Chưa có thẻ kanji nào đến hạn');
  });
  it('ôn từ vựng: không có bước nào, hiện EmptyState', () => {
    const s = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    const v = renderVocabReview({ progress: s, now, win: { location: { hash: '' } }, canSpeak: () => false });
    expect(v.node.querySelector('.kt-session')).toBeNull();
    expect(v.node.textContent).toContain('Xong từ vựng hôm nay');
  });
});
