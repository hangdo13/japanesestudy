import { describe, it, expect, vi } from 'vitest';
import { createProgress, migrate, STORAGE_KEY, CORRUPT_KEY, CHANGED_EVENT, CURRENT_VERSION, localDate } from './progress.js';

function memoryStorage(initial = {}, { failSet = false } = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      if (failSet) throw new DOMException('quota', 'QuotaExceededError');
      m.set(k, String(v));
    },
    removeItem: (k) => m.delete(k),
    map: m,
  };
}
const fixedNow = () => new Date(2026, 10, 18, 9, 30);

describe('core/progress', () => {
  it('lần đầu tạo dữ liệu mới có schemaVersion 1', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    expect(p.get().schemaVersion).toBe(1);
    expect(p.get().lastBackupAt).toBeNull();
  });

  it('ghi thì lưu vào kotoba:v1 và phát progress:changed', () => {
    const storage = memoryStorage();
    const events = new EventTarget();
    const heard = vi.fn();
    events.addEventListener(CHANGED_EVENT, heard);
    const p = createProgress({ storage, now: fixedNow, events });
    expect(p.update((d) => { d.settings.x = 1; })).toEqual({ ok: true });
    expect(JSON.parse(storage.map.get(STORAGE_KEY)).settings.x).toBe(1);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard.mock.calls[0][0].detail.settings.x).toBe(1);
  });

  it('get() trả bản sao, sửa bản sao không ảnh hưởng kho', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    p.get().settings.x = 1;
    expect(p.get().settings.x).toBeUndefined();
  });

  it('lỗi quota thì trả lỗi tiếng Việt và giữ nguyên dữ liệu', () => {
    const events = new EventTarget();
    const heard = vi.fn();
    events.addEventListener(CHANGED_EVENT, heard);
    const p = createProgress({ storage: memoryStorage({}, { failSet: true }), now: fixedNow, events });
    const res = p.update((d) => { d.settings.x = 1; });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('Không lưu được tiến độ');
    expect(p.get().settings.x).toBeUndefined();
    expect(heard).not.toHaveBeenCalled();
  });

  it('không có localStorage (bị chặn) thì vẫn chạy, ghi trả lỗi', () => {
    const p = createProgress({ storage: null, now: fixedNow, events: new EventTarget() });
    expect(p.get().schemaVersion).toBe(1);
    expect(p.update(() => {}).ok).toBe(false);
  });

  it('dữ liệu hỏng thì bắt đầu lại và giữ bản hỏng', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{hỏng' });
    const p = createProgress({ storage, now: fixedNow, events: new EventTarget() });
    expect(p.recoveredFromCorrupt).toBe(true);
    expect(p.get().schemaVersion).toBe(1);
    expect(storage.map.get(`${CORRUPT_KEY}:${fixedNow().toISOString()}`)).toBe('{hỏng');
  });

  it('đọc lại dữ liệu đã lưu', () => {
    const storage = memoryStorage();
    createProgress({ storage, now: fixedNow, events: new EventTarget() }).update((d) => { d.settings.n = 5; });
    expect(createProgress({ storage, now: fixedNow, events: new EventTarget() }).get().settings.n).toBe(5);
  });

  it('tên file sao lưu theo ngày trên máy và ghi ngày sao lưu', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    expect(p.backupFileName()).toBe('kotoba-sao-luu-2026-11-18.json');
    p.markBackup();
    expect(p.get().lastBackupAt).toBe(fixedNow().toISOString());
    expect(localDate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });

  it('xuất rồi nhập lại được', () => {
    const a = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    a.update((d) => { d.kanji['日'] = { gioiThieu: '2026-11-18' }; });
    const b = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    expect(b.importJson(a.exportJson())).toEqual({ ok: true });
    expect(b.get().kanji['日'].gioiThieu).toBe('2026-11-18');
  });

  it('nhập file không hợp lệ thì báo lỗi và giữ dữ liệu cũ', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    p.update((d) => { d.settings.keep = true; });
    for (const bad of ['không phải json', '{"a":1}', JSON.stringify({ schemaVersion: CURRENT_VERSION + 1 })]) {
      const res = p.importJson(bad);
      expect(res.ok).toBe(false);
      expect(res.error.length).toBeGreaterThan(10);
    }
    expect(p.get().settings.keep).toBe(true);
  });

  it('migrate chạy chuỗi chuyển đổi tới bản hiện tại', () => {
    const migrations = { 1: (d) => ({ ...d, schemaVersion: 2, them: true }), 2: (d) => ({ ...d, schemaVersion: 3 }) };
    expect(migrate({ schemaVersion: 1 }, migrations, 3)).toMatchObject({ schemaVersion: 3, them: true });
    expect(() => migrate({ schemaVersion: 1 }, {}, 2)).toThrow('Không chuyển đổi được');
  });

  it('update: hàm ném lỗi hoặc trả giá trị không phải object thì không ghi', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    expect(p.update(() => { throw new Error('x'); }).ok).toBe(false);
    expect(p.update((d) => (d.settings.x = 1)).ok).toBe(false);
    expect(p.get().settings.x).toBeUndefined();
  });

  it('dữ liệu trên máy của bản mới hơn: không coi là hỏng, không ghi đè', () => {
    const raw = JSON.stringify({ schemaVersion: CURRENT_VERSION + 1, gi: 'đó' });
    const storage = memoryStorage({ [STORAGE_KEY]: raw });
    const p = createProgress({ storage, now: fixedNow, events: new EventTarget() });
    expect(p.recoveredFromCorrupt).toBe(false);
    expect(p.writeBlocked).toContain('phiên bản Kotoba mới hơn');
    expect(p.update((d) => { d.settings.x = 1; }).ok).toBe(false);
    expect(storage.map.get(STORAGE_KEY)).toBe(raw);
  });

  it('dữ liệu hỏng nhiều lần thì không ghi đè bản hỏng trước', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{hỏng 1' });
    createProgress({ storage, now: () => new Date(2026, 10, 18), events: new EventTarget() });
    storage.map.set(STORAGE_KEY, '{hỏng 2');
    createProgress({ storage, now: () => new Date(2026, 10, 19), events: new EventTarget() });
    const copies = [...storage.map.keys()].filter((k) => k.startsWith(`${CORRUPT_KEY}:`));
    expect(copies).toHaveLength(2);
  });

  it('không giữ được bản hỏng thì tạm ngừng ghi', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{hỏng' }, { failSet: true });
    const p = createProgress({ storage, now: fixedNow, events: new EventTarget() });
    expect(p.writeBlocked).toContain('tạm ngừng ghi');
  });

  it('migrate: hàm chuyển đổi trả sai phiên bản thì báo lỗi, không lặp vô hạn', () => {
    expect(() => migrate({ schemaVersion: 1 }, { 1: (d) => d }, 2)).toThrow('trả kết quả sai');
  });

  it('migrate: điền phần thiếu và từ chối sai kiểu', () => {
    expect(migrate({ schemaVersion: 1 })).toMatchObject({ settings: {}, kanji: {}, srs: {}, lastBackupAt: null });
    expect(() => migrate({ schemaVersion: 1, srs: [] })).toThrow('"srs" sai kiểu');
    expect(() => migrate({ schemaVersion: 1, settings: null })).toThrow('"settings" sai kiểu');
  });

  it('markBackup gọi tách rời vẫn chạy', () => {
    const p = createProgress({ storage: memoryStorage(), now: fixedNow, events: new EventTarget() });
    const { markBackup } = p;
    expect(markBackup().ok).toBe(true);
  });

  it('mặc định dùng window.localStorage và phát sự kiện trên window', () => {
    localStorage.clear();
    const heard = vi.fn();
    window.addEventListener(CHANGED_EVENT, heard);
    const p = createProgress();
    p.update((d) => { d.settings.w = 1; });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).settings.w).toBe(1);
    expect(heard).toHaveBeenCalled();
    window.removeEventListener(CHANGED_EVENT, heard);
    localStorage.clear();
  });
});
