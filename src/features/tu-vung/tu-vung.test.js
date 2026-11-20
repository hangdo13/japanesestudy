import { describe, it, expect, vi } from 'vitest';
import { mount, renderTopic } from './index.js';
import { createProgress } from '../../core/progress.js';
import { vocab } from '../../core/content.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const NOW = new Date(2026, 10, 20, 9, 0);
const now = () => NOW;
const store = (mutate = () => {}) => {
  const s = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
  s.update((d) => {
    mutate(d);
  });
  return s;
};
const topic1 = vocab()
  .filter((w) => w.chuDeThuTu === 1)
  .sort((a, b) => a.id.localeCompare(b.id));
const key = (node, k) => node.querySelector('.kt-deck').dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const btn = (node, label) => [...node.querySelectorAll('button')].find((b) => b.textContent === label);
const deps = (s, extra = {}) => ({ progress: s, now, win: { location: { hash: '' } }, canSpeak: () => false, speak: vi.fn(), activity: vi.fn(), ...extra });

describe('#/tu-vung', () => {
  it('21 chủ đề theo thứ tự lộ trình, mỗi chủ đề một CourseProgressCard màu vocab có link', () => {
    const el = document.createElement('div');
    mount(el, {}, { progress: store((d) => (d.tuVung[topic1[0].id] = { gioiThieu: '2026-11-19' })) });
    const cards = [...el.querySelectorAll('.kt-course')];
    expect(cards).toHaveLength(21);
    expect(cards[0].querySelector('h3').textContent).toBe('Chào hỏi, giao tiếp');
    expect(cards[0].getAttribute('href')).toBe('#/tu-vung/1');
    expect(cards[0].querySelector('.kt-course__count').textContent).toBe(`1/${topic1.length} từ`);
    expect(cards[0].querySelector('.kt-seg--vocab')).not.toBeNull();
    expect(cards[1].querySelector('h3').textContent).toBe('Gia đình, con người');
  });
  it('param lạ → không tìm thấy chủ đề', () => {
    const el = document.createElement('div');
    mount(el, { param: '99' }, { win: { location: { hash: '' } } });
    expect(el.textContent).toContain('Không tìm thấy chủ đề');
  });
});

describe('#/tu-vung/<n>', () => {
  it('chi tiết: nút "Học 10 từ mới", danh sách từ, nhãn Đã học', () => {
    const s = store((d) => (d.tuVung[topic1[0].id] = { gioiThieu: '2026-11-19' }));
    const v = renderTopic(1, deps(s));
    expect(btn(v.node, 'Học 10 từ mới')).toBeTruthy();
    const items = [...v.node.querySelectorAll('.tu-vung__item')];
    expect(items).toHaveLength(topic1.length);
    expect(items[0].querySelector('.kt-chip--success').textContent).toBe('Đã học');
    expect(items[1].querySelector('.kt-chip--success')).toBeNull();
  });

  it('học gói: xem hết thì ghi ngày học + thẻ Good/Again; GoalComplete; về chủ đề thấy tiến độ mới', async () => {
    const s = store((d) => (d.settings.tuMoiMoiNgay = 5));
    const v = renderTopic(1, deps(s));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 5 từ mới').click();
    expect(v.node.querySelector('.kt-seg--vocab')).not.toBeNull();
    expect(v.node.querySelector('.kt-flash .kt-chip').textContent).toBe('Từ mới');
    for (let i = 0; i < 5; i++) key(v.node, i === 0 ? 'ArrowLeft' : 'ArrowRight');
    expect(v.node.textContent).toContain('Xong gói từ mới!');
    await v.idle();
    const d = s.get();
    const ids = topic1.slice(0, 5).map((w) => w.id);
    for (const id of ids) {
      expect(d.tuVung[id].gioiThieu).toBe('2026-11-20');
      expect(typeof d.srs[`vocab:${id}`].dueAt).toBe('string');
    }
    expect(Date.parse(d.srs[`vocab:${ids[0]}`].dueAt)).toBeLessThan(Date.parse(d.srs[`vocab:${ids[1]}`].dueAt));
    expect(v.node.textContent).toContain('Đã lưu: các từ này đã vào lịch ôn.');
    btn(v.node, 'Về chủ đề').click();
    await v.idle();
    await Promise.resolve();
    expect(v.node.querySelector('.kt-course__count').textContent).toBe(`5/${topic1.length} từ`);
    expect(v.node.querySelectorAll('.tu-vung__item .kt-chip--success')).toHaveLength(5);
  });

  it('thoát giữa chừng không ghi gì', () => {
    const s = store();
    const v = renderTopic(1, deps(s));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 10 từ mới').click();
    key(v.node, 'ArrowRight');
    v.node.querySelector('.kt-session__head [aria-label="Đóng"]').click();
    expect(Object.keys(s.get().tuVung)).toHaveLength(0);
    expect(Object.keys(s.get().srs)).toHaveLength(0);
    expect(btn(v.node, 'Học 10 từ mới')).toBeTruthy();
  });

  it('học hết chủ đề: nút khoá, gợi ý ôn', () => {
    const s = store((d) => {
      for (const w of topic1) d.tuVung[w.id] = { gioiThieu: '2026-11-01' };
    });
    const v = renderTopic(1, deps(s));
    expect(btn(v.node, 'Đã học hết chủ đề này').disabled).toBe(true);
    expect(v.node.querySelector('a[href="#/on-tap/tu-vung"]')).not.toBeNull();
  });

  it('ghi lỗi thì báo, giữ GoalComplete và kết quả; "Thử lưu lại" lưu được khi hết lỗi', async () => {
    const real = store((d) => (d.settings.tuMoiMoiNgay = 5));
    let fail = true;
    const s = { get: real.get, update: (fn) => (fail ? { ok: false, error: 'Bộ nhớ đầy' } : real.update(fn)) };
    const v = renderTopic(1, deps(s));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 5 từ mới').click();
    for (let i = 0; i < 5; i++) key(v.node, 'ArrowRight');
    await v.idle();
    expect(v.node.textContent).toContain('Xong gói từ mới!');
    expect(v.node.textContent).toContain('Chưa lưu được: Bộ nhớ đầy');
    expect(Object.keys(real.get().tuVung)).toHaveLength(0);
    fail = false;
    btn(v.node, 'Thử lưu lại').click();
    await v.idle();
    expect(Object.keys(real.get().tuVung)).toHaveLength(5);
    expect(v.node.textContent).toContain('Đã lưu');
  });

  it('lịch ôn ném lỗi thì báo, không ghi gì', async () => {
    const s = store((d) => (d.settings.tuMoiMoiNgay = 5));
    const v = renderTopic(1, deps(s, { scheduleReview: () => Promise.reject(new Error('hỏng')) }));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 5 từ mới').click();
    for (let i = 0; i < 5; i++) key(v.node, 'ArrowRight');
    await v.idle();
    expect(v.node.textContent).toContain('Chưa lưu được: hỏng');
    expect(Object.keys(s.get().srs)).toHaveLength(0);
  });

  it('lật thẻ: báo đồng hồ học và tự đọc khi có giọng', async () => {
    const speak = vi.fn(() => true);
    const activity = vi.fn();
    const v = renderTopic(1, deps(store(), { canSpeak: () => true, speak, activity }));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 10 từ mới').click();
    key(v.node, ' ');
    await Promise.resolve();
    expect(activity).toHaveBeenCalled();
    expect(speak).toHaveBeenCalled();
  });
});

describe('#/tu-vung: chi tiết (review 2.6)', () => {
  it('hạn mức chung: đã học đủ từ mới hôm nay ở nơi khác thì khoá, nói rõ', () => {
    const other = vocab().filter((w) => w.chuDeThuTu === 2).slice(0, 10);
    const s = store((d) => {
      for (const w of other) d.tuVung[w.id] = { gioiThieu: '2026-11-20' };
    });
    const v = renderTopic(1, deps(s));
    expect(btn(v.node, 'Đã đủ từ mới hôm nay').disabled).toBe(true);
    expect(v.node.textContent).toContain('Mai học tiếp chủ đề này');
  });

  it('giữ tiến độ có sẵn: từ đã có thẻ/ngày học (vd. vừa học ở tab khác) không bị ghi đè', async () => {
    const s = store((d) => (d.settings.tuMoiMoiNgay = 5));
    const v = renderTopic(1, deps(s));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 5 từ mới').click();
    const id0 = topic1[0].id;
    const existing = { dueAt: '2030-01-01T00:00:00.000Z', reps: 9 };
    s.update((d) => {
      d.srs[`vocab:${id0}`] = existing;
      d.tuVung[id0] = { gioiThieu: '2026-11-01', ghiChu: 'x' };
    });
    for (let i = 0; i < 5; i++) key(v.node, 'ArrowRight');
    await v.idle();
    expect(s.get().srs[`vocab:${id0}`]).toEqual(existing);
    expect(s.get().tuVung[id0]).toEqual({ gioiThieu: '2026-11-01', ghiChu: 'x' });
  });

  it('tiêu đề trang chi tiết là h2; danh sách chủ đề là list, link có tên gọn', () => {
    const v = renderTopic(1, deps(store()));
    expect(v.node.querySelector('.kt-course h2').textContent).toBe('Chào hỏi, giao tiếp');
    const el = document.createElement('div');
    mount(el, {}, { progress: store() });
    expect(el.querySelectorAll('ul.tu-vung__topics > li')).toHaveLength(21);
    expect(el.querySelector('a.kt-course').getAttribute('aria-label')).toMatch(/^Chủ đề 1: Chào hỏi, giao tiếp, đã học 0 trên \d+ từ$/);
  });

  it.each(['0', '22', '1.5', '1e0', 'abc', ' 1'])('param "%s" → không tìm thấy chủ đề', (param) => {
    const el = document.createElement('div');
    mount(el, { param }, { win: { location: { hash: '' } } });
    expect(el.textContent).toContain('Không tìm thấy chủ đề');
  });

  it('param 21 → trang chủ đề cuối; mount trả cleanup dừng đọc', () => {
    const cancel = vi.fn();
    const old = globalThis.speechSynthesis;
    globalThis.speechSynthesis = { cancel };
    try {
      const el = document.createElement('div');
      const cleanup = mount(el, { param: '21' }, deps(store()));
      expect(el.querySelector('.kt-course h2').textContent).toBe('Động vật');
      cleanup();
      expect(cancel).toHaveBeenCalled();
    } finally {
      globalThis.speechSynthesis = old;
    }
  });

  it('tắt tự đọc: lật thẻ không đọc, nút phát âm vẫn đọc', async () => {
    const speak = vi.fn(() => true);
    const s = store((d) => (d.settings.tuDocKhiLat = false));
    const v = renderTopic(1, deps(s, { canSpeak: () => true, speak }));
    document.body.replaceChildren(v.node);
    btn(v.node, 'Học 10 từ mới').click();
    key(v.node, ' ');
    await Promise.resolve();
    expect(speak).not.toHaveBeenCalled();
    v.node.querySelector('[data-role=play]').click();
    expect(speak).toHaveBeenCalledTimes(1);
  });
});

it('lần lưu của màn trước xong muộn không vẽ đè lên phiên đang học', async () => {
  let release;
  const gate = new Promise((r) => (release = r));
  const slow = () => gate.then(() => ({ dueAt: '2027-01-01T00:00:00.000Z' }));
  const s = store((d) => (d.settings.tuMoiMoiNgay = 5));
  const v1 = renderTopic(1, deps(s, { scheduleReview: slow }));
  document.body.replaceChildren(v1.node);
  btn(v1.node, 'Học 5 từ mới').click();
  for (let i = 0; i < 5; i++) key(v1.node, 'ArrowRight'); // xong gói, đang lưu (chờ slow)
  v1.cleanup();
  const v2 = renderTopic(2, deps(s));
  document.body.replaceChildren(v2.node);
  btn(v2.node, 'Học 5 từ mới').click();
  release();
  await v2.idle();
  await Promise.resolve();
  expect(v2.node.querySelector('.kt-deck')).not.toBeNull();
});
