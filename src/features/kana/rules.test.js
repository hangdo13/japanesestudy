import { describe, it, expect, vi } from 'vitest';
import { renderRules } from './rules.js';
import { mount } from './index.js';
import { seededRng } from '../../core/kana-quiz.js';
import { buildReadingSession } from '../../core/reading-quiz.js';
import { kanaRules } from '../../core/content.js';

function setup(extra = {}) {
  const view = renderRules({ canSpeak: () => true, speak: vi.fn(() => true), onVoicesChanged: () => () => {}, rng: seededRng(3), ...extra });
  document.body.replaceChildren(view.node);
  return view;
}
const btn = (node, label) => [...node.querySelectorAll('button')].find((b) => b.textContent === label);

describe('quy tắc đọc', () => {
  it('5 mục có ví dụ và nhãn chưa duyệt', () => {
    const { node } = setup();
    expect(node.querySelectorAll('.kana-rule')).toHaveLength(5);
    expect(node.textContent).toContain('chưa duyệt');
    expect(node.querySelector('#quy-tac-am-ngat').textContent).toContain('kitte');
    expect(node.querySelector('#quy-tac-tro-tu').textContent).toContain('wa');
  });

  it('nút nghe đọc đúng từ; không có giọng thì ẩn', () => {
    const speak = vi.fn(() => true);
    const { node } = setup({ speak });
    node.querySelector('#quy-tac-am-ngat [aria-label^="Nghe"]').click();
    expect(node.querySelector('#quy-tac-am-ngat [aria-label^="Nghe"]').getAttribute('aria-label')).toBe('Nghe ví dụ 1: kitte');
    expect(speak).toHaveBeenCalledWith('きって');
    const silent = setup({ canSpeak: () => false });
    expect([...silent.node.querySelectorAll('[aria-label^="Nghe"]')].every((b) => b.hidden)).toBe(true);
  });

  it('giọng nạp muộn thì hiện nút nghe', () => {
    let ready = false;
    let notify;
    const { node } = setup({ canSpeak: () => ready, onVoicesChanged: (cb) => ((notify = cb), () => {}) });
    expect(node.querySelector('[aria-label^="Nghe"]').hidden).toBe(true);
    ready = true;
    notify();
    expect(node.querySelector('[aria-label^="Nghe"]').hidden).toBe(false);
  });

  it('luyện đọc 10 câu → kết quả → luyện lại / xem quy tắc', () => {
    const { node } = setup();
    btn(node, 'Luyện đọc từ').click();
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 10');
    for (let i = 0; i < 10; i++) {
      const opts = [...node.querySelectorAll('.kt-option')];
      expect(opts).toHaveLength(4);
      opts[0].click();
      node.querySelector('.kt-feedback .kt-btn--primary').click();
    }
    expect(node.textContent).toMatch(/Kết quả: \d+ \/ 10/);
    btn(node, 'Luyện lại').click();
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 10');
    node.querySelector('.kt-session__head [aria-label="Đóng"]').click();
    expect(node.querySelectorAll('.kana-rule')).toHaveLength(5);
    expect(document.activeElement.textContent).toBe('Luyện đọc từ');
  });

  it('chọn sai thì từ đó có trong danh sách đọc lại', () => {
    const { node } = setup();
    const expected = buildReadingSession(kanaRules(), { rng: seededRng(3) }); // cùng seed với màn
    btn(node, 'Luyện đọc từ').click();
    for (let i = 0; i < 10; i++) {
      expect(node.querySelector('.kana-read__doc').textContent).toBe(expected[i].doc);
      const opts = [...node.querySelectorAll('.kt-option')];
      opts[i === 0 ? (expected[i].answer + 1) % 4 : expected[i].answer].click();
      node.querySelector('.kt-feedback .kt-btn--primary').click();
    }
    expect(node.textContent).toContain('Kết quả: 9 / 10');
    expect(node.querySelector('.kana-examples').textContent).toContain(expected[0].doc);
    expect(node.querySelector('.kana-examples').textContent).toContain(expected[0].romaji);
  });

  it('route #/kana/quy-tac và liên kết từ bảng chữ', () => {
    const el = document.createElement('div');
    mount(el, {}, {});
    expect([...el.querySelectorAll('a')].some((a) => a.getAttribute('href') === '#/kana/quy-tac')).toBe(true);
    const el2 = document.createElement('div');
    const cleanup = mount(el2, { param: 'quy-tac' }, { onVoicesChanged: () => () => {}, canSpeak: () => false });
    expect(el2.querySelectorAll('.kana-rule')).toHaveLength(5);
    cleanup();
  });
});
