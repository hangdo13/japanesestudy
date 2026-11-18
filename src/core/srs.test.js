import { describe, it, expect } from 'vitest';
import { reviewCard, newCard, dueIds, fromStored, toStored } from './srs.js';

const T0 = new Date('2026-11-18T10:00:00Z');

describe('core/srs', () => {
  it('trả lời đúng thì hạn ôn lùi xa hơn trả lời sai', async () => {
    const good = await reviewCard(null, true, T0);
    const again = await reviewCard(null, false, T0);
    expect(Date.parse(good.dueAt)).toBeGreaterThan(Date.parse(again.dueAt));
    expect(typeof good.dueAt).toBe('string');
  });

  it('ôn lại từ JSON đã lưu (đổi chuỗi ngày về Date)', async () => {
    const first = await reviewCard(null, false, T0);
    const stored = JSON.parse(JSON.stringify(first));
    const second = await reviewCard(stored, true, new Date('2026-11-18T10:05:00Z'));
    expect(second.reps).toBe(2);
    expect(fromStored(stored).dueAt).toBeInstanceOf(Date);
    expect(toStored({ dueAt: T0 }).dueAt).toBe(T0.toISOString());
  });

  it('thẻ mới đến hạn ngay', async () => {
    const c = await newCard(T0);
    expect(dueIds({ 'kana:あ': c }, 'kana:', T0)).toEqual(['kana:あ']);
  });

  it('thẻ hỏng: coi như đến hạn và ôn lại thì làm thẻ mới', async () => {
    const srs = { 'kana:あ': { dueAt: 'hỏng' }, 'kana:い': { dueAt: '2026-11-18T08:00:00Z' } };
    expect(dueIds(srs, 'kana:', T0)).toEqual(['kana:あ', 'kana:い']);
    const c = await reviewCard({ dueAt: 'hỏng' }, true, T0);
    expect(Number.isFinite(Date.parse(c.dueAt))).toBe(true);
    expect(c.reps).toBe(1);
  });

  it('thẻ thiếu trường ts-fsrs cần (vd. stabilityFast) thì làm lại thẻ mới, không ném lỗi', async () => {
    const c = await reviewCard({ dueAt: '2026-01-01T00:00:00Z', stability: 0, difficulty: 0, state: 0, reps: 3 }, true, T0);
    expect(c.reps).toBe(1);
    expect(Date.parse(c.dueAt)).toBeGreaterThan(T0.getTime());
  });

  it('dueIds lọc theo tiền tố và sắp sớm nhất trước', () => {
    const srs = {
      'kana:い': { dueAt: '2026-11-18T09:00:00Z' },
      'kana:あ': { dueAt: '2026-11-18T08:00:00Z' },
      'kana:う': { dueAt: '2026-11-19T08:00:00Z' },
      'kanji-nghia:日': { dueAt: '2026-11-18T07:00:00Z' },
    };
    expect(dueIds(srs, 'kana:', T0)).toEqual(['kana:あ', 'kana:い']);
    expect(dueIds(undefined, 'kana:', T0)).toEqual([]);
  });
});
