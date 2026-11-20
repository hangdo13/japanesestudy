import { describe, it, expect, vi } from 'vitest';
import { mount } from './index.js';
import { createProgress } from '../../core/progress.js';
import { kanji, vocab } from '../../core/content.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const NOW = new Date(2026, 10, 20, 9, 0);
function run(mutate = () => {}) {
  const store = createProgress({ storage: memoryStorage(), now: () => NOW, events: new EventTarget() });
  store.update(mutate);
  const replace = vi.fn();
  const win = { location: { hash: '', href: 'https://x/japanesestudy/#/hoc-ngay', replace } };
  const el = document.createElement('div');
  mount(el, {}, { progress: store, now: () => NOW, win });
  return { el, replace, win };
}

describe('#/hoc-ngay', () => {
  it('có thẻ kanji đến hạn → ôn kanji (thay mục lịch sử)', () => {
    const { replace } = run((d) => {
      d.kanji['一'] = { gioiThieu: '2026-11-19' };
    });
    expect(replace).toHaveBeenCalledWith('https://x/japanesestudy/#/on-tap/kanji');
  });
  it('hết thẻ kanji, còn từ mới → ôn từ vựng', () => {
    const { replace } = run((d) => {
      for (const k of kanji()) d.kanji[k.id] = { gioiThieu: '2026-11-01' };
      for (const k of kanji()) for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${kind}:${k.id}`] = { dueAt: '2030-01-01T00:00:00Z' };
    });
    expect(replace).toHaveBeenCalledWith('https://x/japanesestudy/#/on-tap/tu-vung');
  });
  it('chỉ còn kanji mới → học kanji mới', () => {
    const { replace } = run((d) => {
      for (const w of vocab()) d.tuVung[w.id] = { gioiThieu: '2026-11-01' };
    });
    expect(replace).toHaveBeenCalledWith('https://x/japanesestudy/#/kanji/hoc-moi');
  });
  it('xong hết: "Xong việc hôm nay!", nút về trang chủ', () => {
    const { el, replace, win } = run((d) => {
      for (const k of kanji()) d.kanji[k.id] = { gioiThieu: '2026-11-01' };
      for (const w of vocab()) d.tuVung[w.id] = { gioiThieu: '2026-11-01' };
      for (const k of kanji()) for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${kind}:${k.id}`] = { dueAt: '2030-01-01T00:00:00Z' };
    });
    expect(replace).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Xong việc hôm nay!');
    [...el.querySelectorAll('button')].find((b) => b.textContent === 'Về trang chủ').click();
    expect(win.location.hash).toBe('#/');
  });
});

it('không có location.replace: dùng history.replaceState + hashchange, không thêm mục lịch sử', () => {
  const store = createProgress({ storage: memoryStorage(), now: () => NOW, events: new EventTarget() });
  const replaceState = vi.fn();
  const win = Object.assign(new EventTarget(), { location: { hash: '' }, history: { replaceState } });
  const fired = vi.fn();
  win.addEventListener('hashchange', fired);
  mount(document.createElement('div'), {}, { progress: store, now: () => NOW, win });
  expect(replaceState).toHaveBeenCalledWith(null, '', '#/on-tap/tu-vung');
  expect(fired).toHaveBeenCalled();
});
