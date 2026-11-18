import { describe, it, expect, vi } from 'vitest';
import { mount } from './index.js';
import { createProgress } from '../../core/progress.js';

function memoryStorage(initial = {}, { failSet = false } = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      if (failSet) throw new Error('quota');
      m.set(k, String(v));
    },
  };
}
const now = () => new Date(2026, 10, 18, 9, 30);
const flush = () => new Promise((r) => setTimeout(r, 0));

function setup({ confirm = vi.fn(() => Promise.resolve(true)), storage = memoryStorage(), download = vi.fn() } = {}) {
  const store = createProgress({ storage, now, events: new EventTarget() });
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  const cleanup = mount(root, {}, { progress: store, confirm, download, now });
  return { root, store, download, confirm, cleanup };
}

function pickFile(root, text) {
  const input = root.querySelector('input[type=file]');
  const file = new File([text], 'sao-luu.json', { type: 'application/json' });
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change'));
}

describe('màn Cài đặt', () => {
  it('chỉ có một nút chính, chưa sao lưu lần nào', () => {
    const { root } = setup();
    expect(root.querySelectorAll('.kt-btn--primary')).toHaveLength(1);
    expect(root.textContent).toContain('Bạn chưa sao lưu lần nào.');
  });

  it('xuất sao lưu tải file đúng tên và ghi ngày', () => {
    const { root, download, store } = setup();
    root.querySelector('.kt-btn--primary').click();
    expect(download).toHaveBeenCalledTimes(1);
    const [name, json] = download.mock.calls[0];
    expect(name).toBe('kotoba-sao-luu-2026-11-18.json');
    expect(JSON.parse(json).lastBackupAt).toBe(now().toISOString());
    expect(store.get().lastBackupAt).toBe(now().toISOString());
    expect(root.textContent).toContain('Lần sao lưu gần nhất: 18/11/2026');
  });

  it('nhập file hợp lệ sau khi xác nhận thì thay dữ liệu', async () => {
    const { root, store, confirm } = setup();
    const other = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    other.update((d) => { d.settings.n = 7; });
    pickFile(root, other.exportJson());
    await vi.waitFor(() => expect(root.querySelector('[role=status]').textContent).toBe('Đã nhập sao lưu.'));
    expect(confirm).toHaveBeenCalled();
    expect(store.get().settings.n).toBe(7);
  });

  it('huỷ nhập thì không đổi gì', async () => {
    const { root, store } = setup({ confirm: vi.fn(() => Promise.resolve(false)) });
    store.update((d) => { d.settings.keep = 1; });
    pickFile(root, JSON.stringify({ schemaVersion: 1, settings: {}, kanji: {} }));
    await vi.waitFor(() => expect(root.querySelector('[role=status]').textContent).toBe('Đã huỷ nhập sao lưu.'));
    expect(store.get().settings.keep).toBe(1);
  });

  it('file không hợp lệ thì báo lỗi, không hỏi xác nhận, giữ dữ liệu cũ', async () => {
    const { root, store, confirm } = setup();
    store.update((d) => { d.settings.keep = 1; });
    pickFile(root, 'rác');
    await vi.waitFor(() => expect(root.querySelector('[role=status]').textContent).toContain('không hợp lệ'));
    expect(confirm).not.toHaveBeenCalled();
    expect(store.get().settings.keep).toBe(1);
  });
});

describe('màn Cài đặt: lỗi và dữ liệu hỏng', () => {
  it('dữ liệu trên máy hỏng thì báo cho Hannah', () => {
    const { root } = setup({ storage: memoryStorage({ 'kotoba:v1': 'không phải json' }) });
    expect(root.textContent).toContain('Dữ liệu tiến độ trên máy bị hỏng');
  });

  it('không ghi được bộ nhớ khi xuất thì vẫn tải file nhưng báo không ghi được ngày', () => {
    const { root, download } = setup({ storage: memoryStorage({}, { failSet: true }) });
    root.querySelector('.kt-btn--primary').click();
    expect(download).toHaveBeenCalled();
    expect(root.querySelector('[role=status]').textContent).toContain('không ghi được ngày sao lưu');
    expect(root.textContent).toContain('Bạn chưa sao lưu lần nào.');
  });

  it('tải file lỗi thì không ghi ngày sao lưu', () => {
    const { root, store } = setup({ download: () => { throw new Error('chặn'); } });
    root.querySelector('.kt-btn--primary').click();
    expect(root.querySelector('[role=status]').textContent).toContain('Không tải được file');
    expect(store.get().lastBackupAt).toBeNull();
  });

  it('không ghi được bộ nhớ khi nhập thì báo lỗi', async () => {
    const { root } = setup({ storage: memoryStorage({}, { failSet: true }) });
    pickFile(root, JSON.stringify({ schemaVersion: 1 }));
    await vi.waitFor(() => expect(root.querySelector('[role=status]').textContent).toContain('Không lưu được tiến độ'));
  });

  it('file sao lưu sai hình dạng bị từ chối', async () => {
    const { root, confirm } = setup();
    pickFile(root, JSON.stringify({ schemaVersion: 1, kanji: [] }));
    await vi.waitFor(() => expect(root.querySelector('[role=status]').textContent).toContain('"kanji" sai kiểu'));
    expect(confirm).not.toHaveBeenCalled();
  });

  it('input file không vào thứ tự Tab', () => {
    const input = setup().root.querySelector('input[type=file]');
    expect(input.tabIndex).toBe(-1);
    expect(input.getAttribute('aria-hidden')).toBe('true');
  });

  it('rời màn hình khi hộp thoại đang mở thì đóng hộp thoại và không nhập', async () => {
    const close = vi.fn();
    let resolveConfirm;
    const confirm = vi.fn(() => {
      const p = new Promise((r) => (resolveConfirm = r));
      p.close = () => { close(); resolveConfirm(false); };
      return p;
    });
    const { root, store, cleanup } = setup({ confirm });
    pickFile(root, JSON.stringify({ schemaVersion: 1, settings: { moi: 1 } }));
    await vi.waitFor(() => expect(confirm).toHaveBeenCalled());
    cleanup();
    expect(close).toHaveBeenCalled();
    await Promise.resolve();
    expect(store.get().settings.moi).toBeUndefined();
  });
});

describe('hạn mức kanji mới', () => {
  it('chọn 8 thì lưu settings.kanjiMoiMoiNgay = 8', () => {
    const { root, store } = setup();
    const select = root.querySelector('select');
    expect(select.value).toBe('5');
    expect(select.options).toHaveLength(10);
    select.value = '8';
    select.dispatchEvent(new Event('change'));
    expect(store.get().settings.kanjiMoiMoiNgay).toBe(8);
    expect(root.textContent).toContain('Đã lưu: 8 kanji mới mỗi ngày.');
  });
});

describe('hạn mức kanji mới: đồng bộ và lỗi', () => {
  it('nhập sao lưu có hạn mức 3 thì ô chọn hiện 3 (nghe progress:changed trên window)', async () => {
    const store = createProgress({ storage: memoryStorage(), now, events: window });
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    const cleanup = mount(root, {}, { progress: store, confirm: () => Promise.resolve(true), download: vi.fn(), now });
    pickFile(root, JSON.stringify({ schemaVersion: 1, settings: { kanjiMoiMoiNgay: 3 } }));
    await vi.waitFor(() => expect(root.querySelector('select').value).toBe('3'));
    cleanup();
  });

  it('lưu hạn mức lỗi thì báo lỗi, không báo đã lưu', () => {
    const { root } = setup({ storage: memoryStorage({}, { failSet: true }) });
    const select = root.querySelector('select');
    select.value = '8';
    select.dispatchEvent(new Event('change'));
    const statuses = [...root.querySelectorAll('[role=status]')].map((s) => s.textContent).join(' ');
    expect(statuses).toContain('Không lưu được');
    expect(statuses).not.toContain('Đã lưu');
    expect(select.value).toBe('5');
  });
});

describe('downloadText', () => {
  it('tạo link tải đúng tên file từ blob', async () => {
    const { downloadText } = await import('./index.js');
    const create = vi.fn(() => 'blob:x');
    URL.createObjectURL = create;
    URL.revokeObjectURL = vi.fn();
    const clicked = [];
    const spy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked.push({ href: this.getAttribute('href'), download: this.download });
    });
    downloadText('a.json', '{}');
    expect(create).toHaveBeenCalled();
    expect(clicked).toEqual([{ href: 'blob:x', download: 'a.json' }]);
    spy.mockRestore();
  });
});

describe('hộp thoại xác nhận', () => {
  it('Esc thì trả false, bấm Nhập thì trả true', async () => {
    const { confirmDialog } = await import('../../ui/confirm-dialog.js');
    document.body.replaceChildren();
    const p1 = confirmDialog({ title: 'T', text: 'x', confirmLabel: 'Nhập' });
    expect(document.querySelector('[role=dialog][aria-modal=true]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(await p1).toBe(false);
    expect(document.querySelector('[role=dialog]')).toBeNull();

    const p2 = confirmDialog({ title: 'T', text: 'x', confirmLabel: 'Nhập' });
    [...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent === 'Nhập').click();
    expect(await p2).toBe(true);

    const bg = document.createElement('main');
    document.body.replaceChildren(bg);
    const p3 = confirmDialog({ title: 'T', text: 'x', confirmLabel: 'Nhập' });
    expect(bg.hasAttribute('inert')).toBe(true);
    expect(document.getElementById(document.querySelector('[role=dialog]').getAttribute('aria-labelledby')).textContent).toBe('T');
    [...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent === 'Huỷ').click();
    expect(await p3).toBe(false);
    expect(bg.hasAttribute('inert')).toBe(false);

    const p4 = confirmDialog({ title: 'T', text: 'x' });
    p4.close();
    expect(await p4).toBe(false);
    expect(document.querySelector('[role=dialog]')).toBeNull();
  });
});
