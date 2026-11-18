import { describe, it, expect, vi } from 'vitest';
import { renderSounds } from './sounds.js';
import { mount } from './index.js';
import { seededRng } from '../../core/kana-quiz.js';
import { buildMoraSession, buildPairSession } from '../../core/sound-quiz.js';
import { kanaRules, kanaSounds } from '../../core/content.js';

function setup(extra = {}) {
  const view = renderSounds({ canSpeak: () => true, speak: vi.fn(() => true), onVoicesChanged: () => () => {}, rng: seededRng(7), ...extra });
  document.body.replaceChildren(view.node);
  return view;
}
const btn = (node, label) => [...node.querySelectorAll('button')].find((b) => b.textContent === label);
const next = (node) => node.querySelector('.kt-feedback .kt-btn--primary').click();

describe('màn phát âm', () => {
  it('5 mục giải thích, ví dụ tách phách, nhãn chưa duyệt', () => {
    const { node } = setup();
    expect(node.querySelectorAll('.kana-rule')).toHaveLength(5);
    expect(node.querySelector('#phat-am-phach').textContent).toContain('と・う・きょ・う');
    expect(node.querySelector('#phat-am-phach').textContent).toContain('4 phách');
    expect(node.textContent).toContain('chưa duyệt');
  });

  it('không có giọng: khoá bài nghe, hiện hướng dẫn, ẩn nút nghe; giọng nạp muộn thì mở', () => {
    let ready = false;
    let notify;
    const { node } = setup({ canSpeak: () => ready, onVoicesChanged: (cb) => ((notify = cb), () => {}) });
    expect(btn(node, 'Nghe cặp âm').disabled).toBe(true);
    expect(node.textContent).toContain('Trợ năng');
    expect(node.querySelector('[aria-label^="Nghe ví dụ"]').hidden).toBe(true);
    ready = true;
    notify();
    expect(btn(node, 'Nghe cặp âm').disabled).toBe(false);
    expect(node.querySelector('[aria-label^="Nghe ví dụ"]').hidden).toBe(false);
  });

  it('đếm phách: 10 câu theo đúng session, sai 1 → 9/10, có tách phách ở phản hồi và danh sách xem lại', () => {
    const { node } = setup();
    const words = [...kanaRules().tuLuyen, ...kanaSounds().capAm.flatMap((c) => [c.a, c.b])];
    const expected = buildMoraSession(words, { rng: seededRng(7) });
    btn(node, 'Đếm phách').click();
    for (let i = 0; i < 10; i++) {
      expect(node.querySelector('.kana-read__doc').textContent).toBe(expected[i].doc);
      const opts = [...node.querySelectorAll('.kt-option')];
      expect(opts.map((o) => o.querySelector('.kt-option__text').textContent)).toEqual(expected[i].options.map(String));
      opts[i === 0 ? (expected[i].answer + 1) % 4 : expected[i].answer].click();
      expect(node.querySelector('.kt-feedback').textContent).toContain(expected[i].phach.join('・'));
      next(node);
    }
    expect(node.textContent).toContain('Kết quả: 9 / 10');
    expect(node.querySelector('.kana-examples').textContent).toContain(expected[0].phach.join('・'));
    btn(node, 'Về trang phát âm').click();
    expect(document.activeElement.textContent).toBe('Đếm phách');
  });

  it('nghe cặp âm: tự đọc từ đích sau khi gắn, focus Nghe lại, 2 đáp án; sai thì phản hồi và xem lại có từ đích', async () => {
    const speak = vi.fn(() => true);
    const { node } = setup({ speak });
    const expected = buildPairSession(kanaSounds().capAm, { rng: seededRng(7) });
    btn(node, 'Nghe cặp âm').click();
    await Promise.resolve();
    expect(speak).toHaveBeenLastCalledWith(expected[0].target.doc, expect.objectContaining({ onError: expect.any(Function) }));
    expect(document.activeElement.textContent).toBe('Nghe lại');
    btn(node, 'Nghe lại').click();
    expect(speak).toHaveBeenCalledTimes(2);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
      const opts = [...node.querySelectorAll('.kt-option')];
      expect(opts).toHaveLength(2);
      const pick = i === 0 ? 1 - expected[i].answer : expected[i].answer;
      opts[pick].click();
      if (i === 0) {
        const fb = node.querySelector('.kt-feedback');
        expect(fb.textContent).toContain(`Máy đọc: ${expected[0].target.doc}`);
        expect(fb.querySelector('[lang=ja]').textContent).toBe(expected[0].target.doc);
      }
      next(node);
    }
    expect(node.textContent).toContain('Kết quả: 9 / 10');
    const review = node.querySelector('.kana-examples').textContent;
    expect(review).toContain(expected[0].target.phach.join('・'));
    expect(review).toContain(`khác ${expected[0].other.doc}`);
  });

  it('speak trả false, hoặc trình duyệt báo lỗi khi đọc, thì báo không phát được nhưng vẫn chọn được', async () => {
    const { node } = setup({ speak: () => false });
    btn(node, 'Nghe cặp âm').click();
    await Promise.resolve();
    expect(node.querySelector('.kt-session [role=status]').textContent).toContain('Không phát được');
    node.querySelector('.kt-option').click();
    expect(node.querySelector('.kt-feedback')).not.toBeNull();

    let onError;
    const view2 = setup({ speak: (t, o) => ((onError = o.onError), true) });
    btn(view2.node, 'Nghe cặp âm').click();
    await Promise.resolve();
    expect(view2.node.querySelector('.kt-session [role=status]').textContent).toBe('');
    onError({ error: 'audio-busy' });
    expect(view2.node.querySelector('.kt-session [role=status]').textContent).toContain('Không phát được');
  });

  it('nút nghe ví dụ đọc đúng từ', () => {
    const speak = vi.fn(() => true);
    const { node } = setup({ speak });
    node.querySelector('#phat-am-phach [aria-label^="Nghe ví dụ"]').click();
    expect(speak).toHaveBeenCalledWith('とうきょう');
  });

  it('đóng phiên quay về trang và focus nút bài vừa làm; mất giọng thì focus chuyển sang Đếm phách', async () => {
    let ready = true;
    let notify;
    const { node } = setup({ canSpeak: () => ready, onVoicesChanged: (cb) => ((notify = cb), () => {}) });
    btn(node, 'Nghe cặp âm').click();
    await Promise.resolve();
    node.querySelector('.kt-session__head [aria-label="Đóng"]').click();
    expect(document.activeElement.textContent).toBe('Nghe cặp âm');
    ready = false;
    notify();
    expect(btn(node, 'Nghe cặp âm').disabled).toBe(true);
    expect(document.activeElement.textContent).toBe('Đếm phách');
    expect(node.querySelector('[aria-label^="Nghe ví dụ"]').hidden).toBe(true);
  });

  it('cleanup huỷ đăng ký giọng và dừng đọc', () => {
    const off = vi.fn();
    const cancel = vi.fn();
    const old = globalThis.speechSynthesis;
    globalThis.speechSynthesis = { cancel };
    try {
      const view = setup({ onVoicesChanged: () => off });
      view.cleanup();
      expect(off).toHaveBeenCalled();
      expect(cancel).toHaveBeenCalled();
    } finally {
      globalThis.speechSynthesis = old;
    }
  });

  it('route #/kana/phat-am và liên kết từ bảng chữ', () => {
    const el = document.createElement('div');
    mount(el, {}, {});
    expect([...el.querySelectorAll('a')].some((a) => a.getAttribute('href') === '#/kana/phat-am')).toBe(true);
    const el2 = document.createElement('div');
    const cleanup = mount(el2, { param: 'phat-am' }, { onVoicesChanged: () => () => {}, canSpeak: () => false });
    expect(el2.querySelectorAll('.kana-rule')).toHaveLength(5);
    cleanup();
  });
});
