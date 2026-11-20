import { describe, it, expect, vi, afterEach } from 'vitest';
import { createStudyClock, splitByDay, minutesOn, IDLE_MS } from './study-clock.js';
import { createProgress } from './progress.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
afterEach(() => vi.useRealTimers());

function setup(start = new Date(2026, 10, 18, 9, 0)) {
  vi.useFakeTimers();
  vi.setSystemTime(start);
  const store = createProgress({ storage: memoryStorage(), now: () => new Date(), events: new EventTarget() });
  const doc = new EventTarget();
  doc.visibilityState = 'visible';
  const clock = createStudyClock({ progress: store, doc });
  return { store, clock, doc };
}
/** Tương tác mỗi 10 giây trong `ms`. */
function studyFor(clock, ms) {
  for (let t = 0; t < ms; t += 10_000) {
    clock.activity();
    vi.advanceTimersByTime(10_000);
  }
  clock.activity();
}
const total = (store) => Object.values(store.get().hocGiay).reduce((a, b) => a + b, 0);

describe('study clock', () => {
  it('học 5 phút, nghỉ 3 phút, học 2 phút → khoảng 7 phút (±60 giây)', () => {
    const { store, clock } = setup();
    studyFor(clock, 5 * 60_000);
    vi.advanceTimersByTime(3 * 60_000);
    studyFor(clock, 2 * 60_000);
    vi.advanceTimersByTime(2 * 60_000); // để đồng hồ tự dừng và ghi
    expect(Math.abs(total(store) - 7 * 60)).toBeLessThanOrEqual(60);
    expect(clock.isRunning()).toBe(false);
  });

  it('quá 60 giây không tương tác thì dừng, không tính phần chờ', () => {
    const { store, clock } = setup();
    studyFor(clock, 60_000);
    vi.advanceTimersByTime(10 * 60_000);
    expect(clock.isRunning()).toBe(false);
    expect(total(store)).toBeLessThanOrEqual(61);
    expect(total(store)).toBeGreaterThanOrEqual(59);
  });

  it('ghi ít nhất mỗi 15 giây khi đang học', () => {
    const { store, clock } = setup();
    studyFor(clock, 30_000);
    vi.advanceTimersByTime(5_000);
    expect(total(store)).toBeGreaterThanOrEqual(15);
  });

  it('ẩn app thì dừng ngay và ghi tới lúc ẩn', () => {
    const { store, clock, doc } = setup();
    studyFor(clock, 20_000);
    vi.advanceTimersByTime(20_000);
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(clock.isRunning()).toBe(false);
    expect(total(store)).toBe(40);
  });

  it('qua nửa đêm: chia đúng ngày', () => {
    const { store, clock } = setup(new Date(2026, 10, 18, 23, 59, 0));
    studyFor(clock, 120_000);
    clock.flush();
    const d = store.get().hocGiay;
    expect(d['2026-11-18']).toBe(60);
    expect(d['2026-11-19']).toBe(60);
  });

  it('ghi lỗi thì giữ số giây, lần sau ghi lại', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 18, 9, 0));
    const real = createProgress({ storage: memoryStorage(), now: () => new Date(), events: new EventTarget() });
    let fail = true;
    const store = { get: real.get, update: (fn) => (fail ? { ok: false, error: 'x' } : real.update(fn)) };
    const clock = createStudyClock({ progress: store, doc: null });
    studyFor(clock, 30_000);
    clock.flush();
    expect(real.get().hocGiay).toEqual({});
    fail = false;
    clock.activity();
    vi.advanceTimersByTime(10_000);
    clock.activity();
    clock.flush();
    expect(real.get().hocGiay['2026-11-18']).toBe(40);
  });

  it('tương tác lại sau khi đã rảnh: đợt mới, không tính khoảng rảnh', () => {
    const { store, clock } = setup();
    studyFor(clock, 30_000);
    vi.advanceTimersByTime(IDLE_MS + 5_000); // tick sẽ dừng
    clock.activity();
    vi.advanceTimersByTime(20_000);
    clock.activity();
    clock.flush();
    expect(total(store)).toBe(50);
  });
});

describe('splitByDay và minutesOn', () => {
  it('chia qua nửa đêm', () => {
    const a = new Date(2026, 10, 18, 23, 59, 30).getTime();
    expect(splitByDay(a, a + 60_000)).toEqual({ '2026-11-18': 30, '2026-11-19': 30 });
    expect(splitByDay(a, a)).toEqual({});
  });
  it('minutesOn', () => {
    expect(minutesOn({ hocGiay: { '2026-11-18': 125 } }, '2026-11-18')).toBe(2);
    expect(minutesOn({}, '2026-11-18')).toBe(0);
  });
});

describe('study clock: máy ngủ, đồng hồ lùi, pagehide, dữ liệu cũ', () => {
  /** Đồng hồ có bộ đếm 15 giây không bao giờ chạy (máy ngủ / bị bóp nền). */
  function starved(start = new Date(2026, 10, 18, 9, 0)) {
    vi.useFakeTimers();
    vi.setSystemTime(start);
    const storage = memoryStorage();
    const store = createProgress({ storage, now: () => new Date(), events: new EventTarget() });
    const doc = new EventTarget();
    doc.visibilityState = 'visible';
    const win = new EventTarget();
    const clock = createStudyClock({ progress: store, doc, win, setInterval: () => 1, clearInterval: () => {} });
    return { store, clock, doc, win, storage };
  }
  const step = (ms) => vi.setSystemTime(new Date(Date.now() + ms));

  it('bộ đếm không chạy: tương tác sau 10 phút vẫn là đợt mới, không tính khoảng ngủ', () => {
    const { store, clock } = starved();
    clock.activity();
    step(20_000);
    clock.activity();
    step(10 * 60_000);
    clock.activity();
    clock.flush();
    expect(total(store)).toBe(20);
  });

  it('ẩn app khi đã rảnh quá 60 giây: chỉ tính tới lần tương tác cuối', () => {
    const { store, clock, doc } = starved();
    clock.activity();
    step(30_000);
    clock.activity();
    step(5 * 60_000);
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(total(store)).toBe(30);
  });

  it('pagehide cũng kết thúc đợt và ghi', () => {
    const { store, clock, win } = starved();
    clock.activity();
    step(25_000);
    clock.activity();
    win.dispatchEvent(new Event('pagehide'));
    expect(clock.isRunning()).toBe(false);
    expect(total(store)).toBe(25);
  });

  it('đồng hồ máy bị chỉnh lùi: không mất đợt mới, không treo', () => {
    const { store, clock } = starved();
    clock.activity();
    step(30_000);
    clock.activity();
    step(-10 * 60_000);
    clock.activity();
    step(20_000);
    clock.activity();
    clock.flush();
    expect(total(store)).toBe(50);
  });

  it('kết thúc đợt thì làm tròn phần lẻ thay vì bỏ', () => {
    const { store, clock, win } = starved();
    clock.activity();
    step(10_700);
    clock.activity();
    win.dispatchEvent(new Event('pagehide'));
    expect(total(store)).toBe(11);
  });

  it('dữ liệu cũ không có hocGiay vẫn ghi được', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 18, 9, 0));
    const storage = memoryStorage();
    storage.setItem('kotoba:v1', JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00Z', lastBackupAt: null, settings: {}, kanji: {}, srs: {} }));
    const store = createProgress({ storage, now: () => new Date(), events: new EventTarget() });
    const clock = createStudyClock({ progress: store, doc: null, win: null });
    clock.activity();
    vi.advanceTimersByTime(20_000);
    clock.activity();
    clock.flush();
    expect(store.get().hocGiay['2026-11-18']).toBe(20);
  });

  it('flush khi đã dừng vẫn thử ghi lại phần còn treo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 18, 9, 0));
    const real = createProgress({ storage: memoryStorage(), now: () => new Date(), events: new EventTarget() });
    let fail = true;
    const store = { get: real.get, update: (fn) => (fail ? { ok: false, error: 'x' } : real.update(fn)) };
    const clock = createStudyClock({ progress: store, doc: null, win: null });
    clock.activity();
    vi.advanceTimersByTime(20_000);
    clock.activity();
    clock.dispose();
    expect(real.get().hocGiay).toEqual({});
    fail = false;
    clock.flush();
    expect(real.get().hocGiay['2026-11-18']).toBe(20);
  });
});
