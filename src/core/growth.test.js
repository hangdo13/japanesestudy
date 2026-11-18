import { describe, it, expect } from 'vitest';
import { newKanjiToday, kanjiMoiLimit, clampInt, backupDue, shouldShowInstallGuide } from './growth.js';

const ALL = ['一', '二', '三', '四', '五', '六', '七', '八'].map((id) => ({ id }));
const TODAY = '2026-11-18';

describe('newKanjiToday', () => {
  it('gói đầu tiên lấy 5 chữ đầu theo thứ tự', () => {
    const r = newKanjiToday({ settings: {}, kanji: {} }, ALL, TODAY);
    expect(r.pack.map((k) => k.id)).toEqual(['一', '二', '三', '四', '五']);
    expect(r.limit).toBe(5);
    expect(r.introducedToday).toBe(0);
  });

  it('đã học đủ hạn mức hôm nay thì gói rỗng', () => {
    const kanji = Object.fromEntries(['一', '二', '三', '四', '五'].map((id) => [id, { gioiThieu: TODAY }]));
    const r = newKanjiToday({ settings: {}, kanji }, ALL, TODAY);
    expect(r.pack).toEqual([]);
    expect(r.introducedToday).toBe(5);
    expect(r.remainingTotal).toBe(3);
  });

  it('đã học 3 chữ hôm nay thì còn 2 chữ tiếp theo', () => {
    const kanji = { 一: { gioiThieu: TODAY }, 二: { gioiThieu: TODAY }, 三: { gioiThieu: TODAY } };
    expect(newKanjiToday({ settings: {}, kanji }, ALL, TODAY).pack.map((k) => k.id)).toEqual(['四', '五']);
  });

  it('chữ học hôm trước không tính vào hạn mức hôm nay', () => {
    const kanji = { 一: { gioiThieu: '2026-11-17' } };
    expect(newKanjiToday({ settings: {}, kanji }, ALL, TODAY).pack.map((k) => k.id)).toEqual(['二', '三', '四', '五', '六']);
  });

  it('hết chữ thì remainingTotal = 0', () => {
    const kanji = Object.fromEntries(ALL.map((k) => [k.id, { gioiThieu: '2026-11-01' }]));
    const r = newKanjiToday({ settings: {}, kanji }, ALL, TODAY);
    expect(r.pack).toEqual([]);
    expect(r.remainingTotal).toBe(0);
  });

  it('dùng hạn mức trong cài đặt', () => {
    expect(newKanjiToday({ settings: { kanjiMoiMoiNgay: 8 }, kanji: {} }, ALL, TODAY).pack).toHaveLength(8);
  });

  it('chịu được dữ liệu thiếu', () => {
    expect(newKanjiToday(undefined, ALL, TODAY).pack).toHaveLength(5);
  });
});

describe('kanjiMoiLimit', () => {
  it('kẹp về 1–10 và mặc định 5', () => {
    expect(kanjiMoiLimit({})).toBe(5);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: 0 })).toBe(1);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: 99 })).toBe(10);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: 'abc' })).toBe(5);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: '7' })).toBe(7);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: null })).toBe(5);
    expect(kanjiMoiLimit({ kanjiMoiMoiNgay: '' })).toBe(5);
    expect(clampInt(3.6, 1, 10, 5)).toBe(4);
  });
});


describe('backupDue', () => {
  const now = new Date('2026-11-25T10:00:00Z');
  it('sao lưu cách đây 7 ngày trở lên thì đến hạn', () => {
    expect(backupDue({ lastBackupAt: '2026-11-18T10:00:00Z' }, now)).toBe(true);
    expect(backupDue({ lastBackupAt: '2026-11-19T10:00:00Z' }, now)).toBe(false);
  });
  it('chưa sao lưu: tính từ ngày bắt đầu dùng app', () => {
    expect(backupDue({ lastBackupAt: null, createdAt: '2026-11-18T09:00:00Z' }, now)).toBe(true);
    expect(backupDue({ lastBackupAt: null, createdAt: '2026-11-24T09:00:00Z' }, now)).toBe(false);
  });
  it('thiếu cả hai mốc thì nhắc luôn cho an toàn', () => {
    expect(backupDue({}, now)).toBe(true);
    expect(backupDue(undefined, now)).toBe(true);
  });
  it('mốc ở tương lai hoặc không phải chuỗi', () => {
    expect(backupDue({ lastBackupAt: '2027-01-01T00:00:00Z' }, now)).toBe(true);
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: false, dismissedAt: '2027-01-01T00:00:00Z', now })).toBe(true);
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: false, dismissedAt: 2026, now })).toBe(true);
  });
});

describe('shouldShowInstallGuide', () => {
  const now = new Date('2026-11-25T10:00:00Z');
  it('chỉ hiện trên iOS khi chưa mở từ màn hình chính', () => {
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: false, now })).toBe(true);
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: true, now })).toBe(false);
    expect(shouldShowInstallGuide({ isIos: false, isStandalone: false, now })).toBe(false);
  });
  it('bấm Để sau thì 7 ngày sau mới hiện lại', () => {
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: false, dismissedAt: '2026-11-20T10:00:00Z', now })).toBe(false);
    expect(shouldShowInstallGuide({ isIos: true, isStandalone: false, dismissedAt: '2026-11-18T10:00:00Z', now })).toBe(true);
  });
});
