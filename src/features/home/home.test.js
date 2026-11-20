import { describe, it, expect } from 'vitest';
import { mount } from './index.js';
import { createProgress, STORAGE_KEY } from '../../core/progress.js';

function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}

function setup({ platform = { isIos: true, isStandalone: false }, now = new Date('2026-11-18T10:00:00Z'), storage, data } = {}) {
  const store = createProgress({ storage: storage || memoryStorage(), now: () => now, events: new EventTarget() });
  if (data) store.update((d) => Object.assign(d, data));
  const win = { location: { hash: '' } };
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  mount(root, {}, { progress: store, now: () => now, win, platform });
  return { root, store, win };
}
const notice = (root, kind) => root.querySelector(`[data-notice="${kind}"]`);

describe('trang chủ: hướng dẫn thêm vào màn hình chính', () => {
  it('iPhone trong tab Safari thì hiện 3 bước và lý do 7 ngày', () => {
    const { root } = setup();
    const guide = notice(root, 'install');
    expect(guide).not.toBeNull();
    expect(guide.querySelectorAll('li')).toHaveLength(3);
    expect(guide.textContent).toContain('7 ngày');
  });

  it('đã mở từ màn hình chính hoặc không phải iOS thì không hiện', () => {
    expect(notice(setup({ platform: { isIos: true, isStandalone: true } }).root, 'install')).toBeNull();
    expect(notice(setup({ platform: { isIos: false, isStandalone: false } }).root, 'install')).toBeNull();
  });

  it('bấm Để sau thì ẩn ngay và lưu mốc thời gian', () => {
    const { root, store } = setup();
    [...root.querySelectorAll('button')].find((b) => b.textContent === 'Để sau').click();
    expect(notice(root, 'install')).toBeNull();
    expect(store.get().settings.anHuongDanCaiDatLuc).toBe('2026-11-18T10:00:00.000Z');
  });
});

describe('trang chủ: đọc mốc "Để sau"', () => {
  it('đã bấm Để sau cách đây 3 ngày thì không hiện, 8 ngày thì hiện lại', () => {
    expect(notice(setup({ data: { settings: { anHuongDanCaiDatLuc: '2026-11-15T10:00:00Z' } } }).root, 'install')).toBeNull();
    expect(notice(setup({ data: { settings: { anHuongDanCaiDatLuc: '2026-11-10T10:00:00Z' } } }).root, 'install')).not.toBeNull();
  });
  it('trình duyệt iOS không phải Safari thì hướng dẫn mở bằng Safari', () => {
    const { root } = setup({ platform: { isIos: true, isIosSafari: false, isStandalone: false } });
    expect(notice(root, 'install').textContent).toContain('Mở Safari');
  });
});

describe('trang chủ: nhắc sao lưu', () => {
  it('quá 7 ngày chưa sao lưu thì nhắc, bấm nút thì sang Cài đặt', () => {
    const { root, win } = setup({ data: { createdAt: '2026-11-01T00:00:00Z', lastBackupAt: null } });
    const n = notice(root, 'backup');
    expect(n).not.toBeNull();
    n.querySelector('button').click();
    expect(win.location.hash).toBe('#/cai-dat');
  });

  it('mới sao lưu thì không nhắc', () => {
    const { root } = setup({ data: { lastBackupAt: '2026-11-17T00:00:00Z' } });
    expect(notice(root, 'backup')).toBeNull();
  });
});

describe('trang chủ: thông báo dữ liệu', () => {
  it('dữ liệu hỏng thì báo đã đặt lại', () => {
    const { root } = setup({ storage: memoryStorage({ [STORAGE_KEY]: '{hỏng' }) });
    expect(notice(root, 'corrupt').textContent).toContain('bị hỏng');
  });

  it('dữ liệu của bản mới hơn thì báo tạm ngừng lưu', () => {
    const { root } = setup({ storage: memoryStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99 }) }) });
    expect(notice(root, 'blocked').textContent).toContain('phiên bản Kotoba mới hơn');
  });

});

import { kanji, vocab } from '../../core/content.js';

const NOW = new Date(2026, 10, 20, 9, 0); // sáng T6
function homeWith(mutate = () => {}, extra = {}) {
  const store = createProgress({ storage: memoryStorage(), now: () => NOW, events: new EventTarget() });
  store.update((d) => {
    d.createdAt = '2026-11-01T00:00:00Z';
    d.lastBackupAt = '2026-11-19T00:00:00Z';
    mutate(d);
  });
  const win = { location: { hash: '' } };
  const events = new EventTarget();
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  const cleanup = mount(root, {}, { progress: store, now: () => NOW, win, events, platform: { isIos: false, isStandalone: true }, ...extra });
  return { root, store, win, events, cleanup };
}
/** Dữ liệu đã làm xong mọi việc hôm nay. */
function allDone(d) {
  for (const k of kanji()) d.kanji[k.id] = { gioiThieu: '2026-11-01' };
  for (const w of vocab()) d.tuVung[w.id] = { gioiThieu: '2026-11-01' };
  for (const k of kanji()) for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${kind}:${k.id}`] = { dueAt: '2030-01-01T00:00:00Z', state: 2 };
}

describe('trang chủ: việc hôm nay (Story 2.4)', () => {
  it('thứ tự: Greeting, ActiveLessonCard, cặp StatCard, StreakTracker, CourseProgressCard', () => {
    const { root } = homeWith();
    const order = ['.kt-greeting', '.kt-lesson', '.kt-grid-2', '.kt-streak', '.kt-course'].map((s) => root.querySelector(s));
    expect(order.every(Boolean)).toBe(true);
    for (let i = 1; i < order.length; i++) expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(root.querySelector('.kt-greeting h1').textContent).toBe('Chào buổi sáng, Hannah!');
    expect(root.querySelector('.kt-greeting b').textContent).toBe('Hannah!');
  });

  it('người mới: "Hôm nay: 5 kanji mới · 10 từ mới"; chỉ một khối kt-lesson, không có Pyon', () => {
    const { root } = homeWith();
    expect(root.querySelectorAll('.kt-lesson')).toHaveLength(1);
    expect(root.querySelector('.kt-lesson h3').textContent).toBe('Hôm nay: 5 kanji mới · 10 từ mới');
    expect(root.querySelectorAll('.kt-mascot')).toHaveLength(0);
  });

  it('bấm nút bắt đầu vào #/hoc-ngay', () => {
    const { root, win } = homeWith();
    root.querySelector('[aria-label="Bắt đầu việc hôm nay"]').click();
    expect(win.location.hash).toBe('#/hoc-ngay');
  });

  it('xong hết: "Xong việc hôm nay!" + đúng một Pyon celebrate', () => {
    const { root } = homeWith(allDone);
    expect(root.querySelector('.kt-lesson h3').textContent).toBe('Xong việc hôm nay!');
    const pyons = root.querySelectorAll('.kt-mascot');
    expect(pyons).toHaveLength(1);
    expect(pyons[0].dataset.mascot).toBe('celebrate');
  });

  it('StatCard: phút học hôm nay và kanji đã học / 106', () => {
    const { root } = homeWith((d) => {
      d.hocGiay['2026-11-20'] = 7 * 60 + 30;
      d.kanji['一'] = { gioiThieu: '2026-11-19' };
    });
    const stats = [...root.querySelectorAll('.kt-stat')];
    expect(stats).toHaveLength(2);
    expect(stats[0].querySelector('.kt-stat__value').textContent).toBe('7phút');
    expect(stats[0].getAttribute('aria-label')).toBe('Học hôm nay: 7 phút');
    expect(stats[1].getAttribute('aria-label')).toBe('Kanji đã học: 1 trên 106');
    expect(stats[1].querySelector('.kt-stat__value').textContent).toBe('1/106');
    expect(stats[1].querySelector('.kt-stat__icon--blue')).not.toBeNull();
  });

  it('StreakTracker: số ngày, 7 ô T2–CN, hôm nay aria-current, ghi chú được nghỉ', () => {
    const { root } = homeWith((d) => {
      d.hocGiay['2026-11-18'] = 120;
      d.hocGiay['2026-11-19'] = 120;
    });
    expect(root.querySelector('.kt-streak .kt-num').textContent).toBe('2');
    const days = [...root.querySelectorAll('.kt-day')];
    expect(days.map((d) => d.querySelector('.kt-day__label').textContent)).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
    expect(days[2].classList.contains('is-done')).toBe(true);
    expect(days[4].getAttribute('aria-current')).toBe('date');
    expect(days[5].classList.contains('is-future')).toBe(true);
    expect(root.textContent).toContain('được nghỉ 1 ngày');
  });

  it('CourseProgressCard: kanji và từ vựng đã thuộc', () => {
    const { root } = homeWith((d) => {
      for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${kind}:一`] = { dueAt: '2030-01-01T00:00:00Z', state: 2 };
      d.kanji['一'] = { gioiThieu: '2026-11-01' };
    });
    const c = root.querySelector('.kt-course');
    expect(c.querySelector('.kt-course__count').textContent).toBe('1/106 chữ');
    expect(c.querySelector('.kt-seg').getAttribute('aria-valuenow')).toBe('1');
  });

  it('tiến độ đổi thì dựng lại và giữ focus; không đổi gì thì không dựng lại; rời trang thì thôi', () => {
    const { root, store, events, cleanup } = homeWith();
    document.body.append(root);
    const start = root.querySelector('[aria-label="Bắt đầu việc hôm nay"]');
    start.focus();
    events.dispatchEvent(new Event('progress:changed'));
    expect(root.querySelector('[aria-label="Bắt đầu việc hôm nay"]')).toBe(start); // nội dung như cũ: giữ nguyên DOM
    store.update((d) => {
      d.hocGiay['2026-11-20'] = 600;
    });
    events.dispatchEvent(new Event('progress:changed'));
    expect(root.querySelector('.kt-stat__value').textContent).toBe('10phút');
    expect(document.activeElement.getAttribute('aria-label')).toBe('Bắt đầu việc hôm nay');
    cleanup();
    root.replaceChildren(Object.assign(document.createElement('p'), { textContent: 'trang khác' }));
    events.dispatchEvent(new Event('progress:changed'));
    expect(root.textContent).toBe('trang khác');
  });

  it('lời chào đổi theo giờ', async () => {
    const { greetingWord } = await import('./index.js');
    expect(greetingWord(new Date(2026, 10, 20, 14))).toBe('Chào buổi chiều,');
    expect(greetingWord(new Date(2026, 10, 20, 20))).toBe('Chào buổi tối,');
  });
});

describe('trang chủ: chi tiết (review 2.4)', () => {
  it('thông báo nằm trên Greeting; chỉ một khối surface-tint', () => {
    const store = createProgress({ storage: memoryStorage(), now: () => NOW, events: new EventTarget() });
    store.update((d) => {
      d.createdAt = '2026-11-01T00:00:00Z';
    });
    const root = document.createElement('div');
    mount(root, {}, { progress: store, now: () => NOW, win: { location: { hash: '' } }, events: new EventTarget(), platform: { isIos: false, isStandalone: true } });
    const notice = root.querySelector('[data-notice="backup"]');
    expect(notice.compareDocumentPosition(root.querySelector('.kt-greeting')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(root.querySelectorAll('.kt-lesson, .kt-hero, .kt-card--tinted')).toHaveLength(1);
  });
  it('dòng phụ Greeting: còn việc / xong và đã học / xong mà chưa học', () => {
    expect(homeWith().root.querySelector('.kt-greeting p').textContent).toContain('Bấm nút ↗ ở thẻ bên dưới');
    expect(
      homeWith((d) => {
        allDone(d);
        d.hocGiay['2026-11-20'] = 1500;
      }).root.querySelector('.kt-greeting p').textContent,
    ).toContain('Bạn đã học 25 phút hôm nay');
    expect(homeWith(allDone).root.querySelector('.kt-greeting p').textContent).toContain('Nghỉ ngơi nhé');
  });
  it('hôm nay đã học: ô hôm nay vừa is-done vừa is-today; 717/718 không hiện 100%', () => {
    const { root } = homeWith((d) => {
      d.hocGiay['2026-11-20'] = 120;
      for (const w of vocab().slice(0, 717)) d.srs[`vocab:${w.id}`] = { dueAt: '2030-01-01T00:00:00Z', state: 2 };
    });
    const today = root.querySelector('.kt-day[aria-current="date"]');
    expect(today.classList.contains('is-done')).toBe(true);
    expect(today.classList.contains('is-today')).toBe(true);
    expect(today.getAttribute('role')).toBe('img');
    const vocabCourse = root.querySelectorAll('.kt-course')[1];
    expect(vocabCourse.querySelector('.kt-pct').textContent).toBe('99%');
    expect(vocabCourse.querySelectorAll('.kt-seg i.on')).toHaveLength(19);
  });
  it('mở lại app (visibilitychange) thì dựng lại theo giờ mới', () => {
    let t = new Date(2026, 10, 20, 23, 59);
    const store = createProgress({ storage: memoryStorage(), now: () => t, events: new EventTarget() });
    store.update((d) => {
      d.createdAt = '2026-11-01T00:00:00Z';
      d.lastBackupAt = '2026-11-20T00:00:00Z';
    });
    const doc = new EventTarget();
    doc.visibilityState = 'visible';
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    mount(root, {}, { progress: store, now: () => t, win: { location: { hash: '' } }, events: new EventTarget(), doc, platform: { isIos: false, isStandalone: true } });
    expect(root.querySelector('.kt-greeting h1').textContent).toContain('buổi tối');
    t = new Date(2026, 10, 21, 8, 0);
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(root.querySelector('.kt-greeting h1').textContent).toContain('buổi sáng');
  });
});
