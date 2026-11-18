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

  it('chỉ có một Pyon trên trang chủ', () => {
    const { root } = setup({ data: { createdAt: '2026-11-01T00:00:00Z' } });
    expect(root.querySelectorAll('.kt-mascot')).toHaveLength(1);
  });
});
