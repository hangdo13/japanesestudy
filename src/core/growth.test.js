import { describe, it, expect } from 'vitest';
import { newKanjiToday, kanjiMoiLimit, clampInt } from './growth.js';

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
