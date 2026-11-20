// Các màn học/ôn đều báo tương tác cho đồng hồ học (Story 2.3, AD-5).
import { describe, it, expect, vi } from 'vitest';
import { createProgress } from '../core/progress.js';
import { newCard } from '../core/srs.js';
import { seededRng } from '../core/kana-quiz.js';
import { renderKanjiReview } from './on-tap/index.js';
import { renderVocabReview } from './on-tap/vocab.js';
import { renderLearn } from './kanji/learn.js';
import { renderPractice } from './kana/practice.js';
import { renderRules } from './kana/rules.js';
import { renderSounds } from './kana/sounds.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const T0 = new Date(2026, 10, 18, 10, 0);
const now = () => T0;
const store = () => createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
const win = () => ({ location: { hash: '' } });
const key = (node, k) => node.querySelector('.kt-deck').dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const btn = (node, label) => [...node.querySelectorAll('button')].find((b) => b.textContent === label);

describe('activity() được gọi khi học', () => {
  it('ôn kanji: lật thẻ và trả lời', async () => {
    const s = store();
    const card = await newCard(new Date(T0.getTime() - 60000));
    s.update((d) => {
      d.kanji['日'] = { gioiThieu: '2026-11-17' };
      for (const k of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${k}:日`] = { ...card, dueAt: k === 'kanji-nghia' ? card.dueAt : '2030-01-01T00:00:00Z' };
    });
    const activity = vi.fn();
    const v = renderKanjiReview({ progress: s, now, win: win(), activity });
    document.body.replaceChildren(v.node);
    await v.ready;
    key(v.node, ' ');
    await Promise.resolve();
    expect(activity).toHaveBeenCalledTimes(1);
    key(v.node, 'ArrowRight');
    expect(activity).toHaveBeenCalledTimes(2);
  });

  it('ôn từ vựng: lật, phát âm, trả lời — mỗi thao tác một lần', async () => {
    const activity = vi.fn();
    const v = renderVocabReview({ progress: store(), now, win: win(), activity, canSpeak: () => true, speak: () => true });
    document.body.replaceChildren(v.node);
    key(v.node, ' ');
    await Promise.resolve();
    expect(activity).toHaveBeenCalledTimes(1);
    v.node.querySelector('[data-role=play]').click();
    expect(activity).toHaveBeenCalledTimes(2);
    key(v.node, 'ArrowRight');
    expect(activity).toHaveBeenCalledTimes(3);
  });

  it('học kanji mới: lật thẻ và vuốt thẻ', async () => {
    const activity = vi.fn();
    const v = renderLearn({ progress: store(), now, win: { location: { hash: '' } }, activity, Audio: class { play() { return Promise.resolve(); } pause() {} } });
    document.body.replaceChildren(v.node);
    v.node.querySelector('.kt-flash').classList.add('is-revealed');
    await Promise.resolve();
    expect(activity).toHaveBeenCalledTimes(1);
    v.swipe('right');
    expect(activity).toHaveBeenCalledTimes(2);
  });

  it('luyện kana, quy tắc, phát âm: trả lời câu hỏi', () => {
    for (const make of [
      (activity) => renderPractice({ progress: store(), now, rng: seededRng(1), canSpeak: () => false, speak: vi.fn(), activity }),
      (activity) => renderRules({ canSpeak: () => false, speak: vi.fn(), onVoicesChanged: () => () => {}, rng: seededRng(1), activity }),
      (activity) => renderSounds({ canSpeak: () => false, speak: vi.fn(), onVoicesChanged: () => () => {}, rng: seededRng(1), activity }),
    ]) {
      const activity = vi.fn();
      const v = make(activity);
      document.body.replaceChildren(v.node);
      const start = v.node.querySelector('.kana-set') || btn(v.node, 'Luyện đọc từ') || btn(v.node, 'Đếm phách');
      start.click();
      v.node.querySelector('.kt-option').click();
      expect(activity).toHaveBeenCalledTimes(1);
      v.node.querySelector('.kt-feedback .kt-btn--primary').click();
      expect(activity).toHaveBeenCalledTimes(2); // bấm Tiếp tục cũng tính
    }
  });

  it('nút nghe (quy tắc, phát âm, Nghe lại trong bài nghe) tính là tương tác; tự phát âm thì không', async () => {
    const activity = vi.fn();
    const r = renderRules({ canSpeak: () => true, speak: vi.fn(), onVoicesChanged: () => () => {}, activity });
    document.body.replaceChildren(r.node);
    r.node.querySelector('[aria-label^="Nghe ví dụ"]').click();
    expect(activity).toHaveBeenCalledTimes(1);

    const a2 = vi.fn();
    const s = renderSounds({ canSpeak: () => true, speak: vi.fn(() => true), onVoicesChanged: () => () => {}, rng: seededRng(1), activity: a2 });
    document.body.replaceChildren(s.node);
    s.node.querySelector('[aria-label^="Nghe ví dụ"]').click();
    expect(a2).toHaveBeenCalledTimes(1);
    btn(s.node, 'Nghe cặp âm').click();
    await Promise.resolve(); // câu đầu tự phát âm: không tính
    expect(a2).toHaveBeenCalledTimes(1);
    btn(s.node, 'Nghe lại').click();
    expect(a2).toHaveBeenCalledTimes(2);
  });
});
