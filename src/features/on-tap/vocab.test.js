import { describe, it, expect, vi } from 'vitest';
import { renderVocabReview } from './vocab.js';
import { mount } from './index.js';
import { createProgress } from '../../core/progress.js';
import { newCard } from '../../core/srs.js';
import { vocab } from '../../core/content.js';
import { learningOrder } from '../../core/vocab-review.js';
import { mount as mountHub, vocabTodayCount } from '../luyen-tap/index.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const T0 = new Date(2026, 10, 18, 17, 0);
const now = () => T0;
const order = learningOrder(vocab());

async function makeStore({ dueIds = [], settings = {}, introducedToday = [] } = {}) {
  const s = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
  const fresh = await newCard(new Date(T0.getTime() - 3600000));
  s.update((d) => {
    Object.assign(d.settings, settings);
    for (const id of dueIds) {
      d.srs[`vocab:${id}`] = { ...fresh };
      d.tuVung[id] = { gioiThieu: '2026-11-10' };
    }
    for (const id of introducedToday) d.tuVung[id] = { gioiThieu: '2026-11-18' };
  });
  return s;
}
function setup(store, extra = {}) {
  const win = { location: { hash: '' } };
  const view = renderVocabReview({ progress: store, now, win, canSpeak: () => true, speak: vi.fn(() => true), ...extra });
  document.body.replaceChildren(view.node);
  return { view, node: view.node, win };
}
const key = (node, k) => node.querySelector('.kt-deck').dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('ôn từ vựng', () => {
  it('3 thẻ đến hạn + 10 từ mới (hạn mức mặc định) theo thứ tự chủ đề; màu vocab', async () => {
    const due = ['n5-0500', 'n5-0501', 'n5-0502'];
    const { node } = setup(await makeStore({ dueIds: due }));
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 13');
    expect(node.querySelector('.kt-seg--vocab')).not.toBeNull();
    expect(node.querySelector('.kt-chip--vocab').textContent).toBe('Từ vựng N5');
    for (let i = 0; i < 3; i++) key(node, 'ArrowRight');
    expect(node.querySelector('.kt-flash').dataset.id).toBe(order[0].id);
    expect(node.querySelector('.kt-flash .kt-chip').textContent).toBe('Từ mới');
  });

  it('đã học 4 từ mới hôm nay thì còn 6; từ mới vuốt thì tạo thẻ và ghi ngày giới thiệu', async () => {
    const store = await makeStore({ introducedToday: order.slice(0, 4).map((w) => w.id) });
    const { node, view } = setup(store);
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 6');
    const first = node.querySelector('.kt-flash').dataset.id;
    key(node, 'ArrowLeft');
    const second = node.querySelector('.kt-flash').dataset.id;
    key(node, 'ArrowRight');
    await view.idle();
    const d = store.get();
    expect(d.tuVung[first].gioiThieu).toBe('2026-11-18');
    expect(d.tuVung[second].gioiThieu).toBe('2026-11-18');
    expect(Date.parse(d.srs[`vocab:${second}`].dueAt)).toBeGreaterThan(Date.parse(d.srs[`vocab:${first}`].dueAt));
  });

  it('lật thẻ thì tự đọc (bỏ ～); tắt trong cài đặt thì không tự đọc; nút phát âm vẫn đọc', async () => {
    const speak = vi.fn(() => true);
    const { node } = setup(await makeStore(), { speak });
    key(node, ' ');
    await Promise.resolve(); // MutationObserver báo lật thẻ sau microtask
    expect(speak).toHaveBeenCalledWith(order[0].doc.replace(/～/g, ''));
    const speak2 = vi.fn(() => true);
    const v2 = setup(await makeStore({ settings: { tuDocKhiLat: false } }), { speak: speak2 });
    key(v2.node, ' ');
    await Promise.resolve();
    expect(speak2).not.toHaveBeenCalled();
    v2.node.querySelector('[data-role=play]').click();
    expect(speak2).toHaveBeenCalledTimes(1);
  });

  it('không có giọng: ẩn nút phát âm, ghi chú hiện một lần', async () => {
    const { node } = setup(await makeStore(), { canSpeak: () => false });
    expect(node.querySelector('[data-role=play]').hidden).toBe(true);
    const notes = [...node.querySelectorAll('p')].filter((p) => p.textContent.includes('chưa có giọng đọc'));
    expect(notes).toHaveLength(1);
    key(node, 'ArrowRight');
    expect([...node.querySelectorAll('p')].filter((p) => p.textContent.includes('chưa có giọng đọc'))).toHaveLength(1);
  });

  it('xong phiên: GoalComplete; mở lại khi hết hạn mức: EmptyState dẫn tới Cài đặt', async () => {
    const store = await makeStore({ settings: { tuMoiMoiNgay: 5 } });
    const { node, view } = setup(store);
    for (let i = 0; i < 5; i++) key(node, 'ArrowRight');
    expect(node.textContent).toContain('Ôn từ vựng xong!');
    expect(node.textContent).toContain('5 từ mới');
    await view.idle();
    const again = setup(store);
    expect(again.node.textContent).toContain('Xong từ vựng hôm nay');
    expect(again.node.textContent).toMatch(/đến hạn lúc \d\d:\d\d/);
    [...again.node.querySelectorAll('button')].find((b) => b.textContent === 'Đổi số từ mới mỗi ngày').click();
    expect(again.win.location.hash).toBe('#/cai-dat');
  });

  it('ghi lỗi thì báo nhưng vẫn làm tiếp', async () => {
    const store = await makeStore();
    const { node } = setup(store, { scheduleReview: () => Promise.reject(new Error('x')) });
    key(node, 'ArrowRight');
    await vi.waitFor(() => expect(node.textContent).toContain('Không lưu được lịch ôn cho từ này.'));
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 10');
  });

  it('route #/on-tap/tu-vung; hub hiện số từ hôm nay', async () => {
    const store = await makeStore({ dueIds: ['n5-0500'] });
    const el = document.createElement('div');
    mount(el, { param: 'tu-vung' }, { progress: store, now, canSpeak: () => false });
    expect(el.querySelector('.kt-count').textContent).toBe('1 / 11');
    expect(vocabTodayCount(store.get(), T0)).toEqual({ due: 1, moi: 10 });
    const hub = document.createElement('div');
    mountHub(hub, {}, { progress: store, now });
    const a = [...hub.querySelectorAll('a')].find((x) => x.getAttribute('href') === '#/on-tap/tu-vung');
    expect(a.textContent).toContain('1 từ cần ôn · 10 từ mới');
    const topics = [...hub.querySelectorAll('a')].find((x) => x.getAttribute('href') === '#/tu-vung');
    expect(topics.textContent).toContain('718 từ, 21 chủ đề');
  });
});

describe('ôn từ vựng: các trường hợp biên', () => {
  it('tối đa 20 thẻ ôn mỗi phiên; hub ghi tổng và "mỗi phiên 20"', async () => {
    const ids = vocab().slice(100, 125).map((w) => w.id);
    const store = await makeStore({ dueIds: ids });
    const { node } = setup(store);
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 30');
    expect(vocabTodayCount(store.get(), T0).due).toBe(25);
    const hub = document.createElement('div');
    mountHub(hub, {}, { progress: store, now });
    expect(hub.textContent).toContain('25 từ cần ôn, mỗi phiên 20');
  });

  it('thẻ đến hạn giữ lịch sử (reps tăng), không đổi ngày giới thiệu', async () => {
    const store = await makeStore({ dueIds: ['n5-0500'] });
    const reps0 = store.get().srs['vocab:n5-0500'].reps;
    const { node, view } = setup(store);
    key(node, 'ArrowRight');
    await view.idle();
    expect(store.get().srs['vocab:n5-0500'].reps).toBe(reps0 + 1);
    expect(store.get().tuVung['n5-0500'].gioiThieu).toBe('2026-11-10');
  });

  it('dữ liệu cũ không có khoá tuVung vẫn ghi được từ mới', async () => {
    const storage = memoryStorage();
    storage.setItem('kotoba:v1', JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00Z', lastBackupAt: null, settings: {}, kanji: {}, srs: {} }));
    const store = createProgress({ storage, now, events: new EventTarget() });
    const { node, view } = setup(store);
    key(node, 'ArrowRight');
    await view.idle();
    expect(Object.values(store.get().tuVung)[0].gioiThieu).toBe('2026-11-18');
  });

  it('phiên qua nửa đêm: từ mới vẫn tính cho ngày bắt đầu phiên', async () => {
    let t = new Date(2026, 10, 18, 23, 59);
    const store = createProgress({ storage: memoryStorage(), now: () => t, events: new EventTarget() });
    const view = renderVocabReview({ progress: store, now: () => t, win: { location: { hash: '' } }, canSpeak: () => false });
    document.body.replaceChildren(view.node);
    t = new Date(2026, 10, 19, 0, 1);
    key(view.node, 'ArrowRight');
    await view.idle();
    expect(Object.values(store.get().tuVung)[0].gioiThieu).toBe('2026-11-18');
  });

  it('lật một lần chỉ tự đọc một lần (đổi class khác không đọc lại)', async () => {
    const speak = vi.fn(() => true);
    const { node } = setup(await makeStore(), { speak });
    key(node, ' ');
    await Promise.resolve();
    node.querySelector('.kt-flash').classList.add('is-dragging');
    await Promise.resolve();
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it('Enter trên nút phát âm là bấm nút, không lật thẻ', async () => {
    const speak = vi.fn(() => true);
    const { node } = setup(await makeStore({ settings: { tuDocKhiLat: false } }), { speak });
    const btn = node.querySelector('[data-role=play]');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(node.querySelector('.kt-flash').classList.contains('is-revealed')).toBe(false);
  });

  it('có giọng nhưng speak báo lỗi thì hiện ghi chú một lần', async () => {
    const { node } = setup(await makeStore(), { speak: () => false });
    node.querySelector('[data-role=play]').click();
    node.querySelector('[data-role=play]').click();
    expect([...node.querySelectorAll('p')].filter((p) => p.textContent.includes('chưa có giọng đọc'))).toHaveLength(1);
  });

  it('giọng nạp muộn: hiện nút phát âm, ẩn ghi chú', async () => {
    let ready = false;
    let notify;
    const { node } = setup(await makeStore(), { canSpeak: () => ready, onVoicesChanged: (cb) => ((notify = cb), () => {}) });
    expect(node.querySelector('[data-role=play]').hidden).toBe(true);
    ready = true;
    notify();
    expect(node.querySelector('[data-role=play]').hidden).toBe(false);
    expect([...node.querySelectorAll('p')].find((p) => p.textContent.includes('chưa có giọng đọc')).hidden).toBe(true);
  });

  it('học hết 718 từ: EmptyState ghi đã học hết; hub "Xong từ vựng hôm nay"', async () => {
    const store = await makeStore({ introducedToday: [] });
    store.update((d) => {
      for (const w of vocab()) d.tuVung[w.id] = { gioiThieu: '2026-11-01' };
    });
    const { node } = setup(store);
    expect(node.textContent).toContain('Bạn đã học hết 718 từ N5');
    const hub = document.createElement('div');
    mountHub(hub, {}, { progress: store, now });
    expect(hub.textContent).toContain('Xong từ vựng hôm nay');
  });

  it('ghi bộ nhớ lỗi thì báo, làm tiếp; lần ghi sau thành công thì xoá báo lỗi', async () => {
    const real = await makeStore();
    let fail = true;
    const store = { get: real.get, update: (fn) => (fail ? { ok: false, error: 'Bộ nhớ đầy' } : real.update(fn)) };
    const { node, view } = setup(store);
    key(node, 'ArrowRight');
    await view.idle();
    expect(node.textContent).toContain('Bộ nhớ đầy');
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 10');
    fail = false;
    key(node, 'ArrowRight');
    await view.idle();
    expect(node.textContent).not.toContain('Bộ nhớ đầy');
  });

  it('rời màn thì dừng đọc và huỷ đăng ký giọng', async () => {
    const cancel = vi.fn();
    const off = vi.fn();
    const old = globalThis.speechSynthesis;
    globalThis.speechSynthesis = { cancel };
    try {
      const el = document.createElement('div');
      const cleanup = mount(el, { param: 'tu-vung' }, { progress: await makeStore(), now, canSpeak: () => false, onVoicesChanged: () => off });
      cleanup();
      expect(cancel).toHaveBeenCalled();
      expect(off).toHaveBeenCalled();
    } finally {
      globalThis.speechSynthesis = old;
    }
  });
});

describe('nối việc hôm nay (Story 2.4)', () => {
  it('xong phiên từ vựng: nút "Việc tiếp theo" sang #/hoc-ngay sau khi lưu xong', async () => {
    const store = await makeStore({ settings: { tuMoiMoiNgay: 5 } });
    const { node, win, view } = setup(store);
    for (let i = 0; i < 5; i++) key(node, 'ArrowRight');
    [...node.querySelectorAll('button')].find((b) => b.textContent === 'Việc tiếp theo').click();
    await view.idle();
    await Promise.resolve();
    expect(win.location.hash).toBe('#/hoc-ngay');
  });
});
