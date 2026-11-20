import { describe, it, expect } from 'vitest';
import { dueToday, nextTask, summarize, studyStreak, weekDays, learnedCounts } from './today.js';
import { kanji, vocab } from './content.js';

const NOW = new Date(2026, 10, 20, 11, 0); // T6 20/11
const ctx = { kanji: kanji(), vocab: vocab(), now: NOW };
const empty = () => ({ settings: {}, kanji: {}, srs: {}, tuVung: {}, hocGiay: {} });

describe('dueToday', () => {
  it('người mới: 5 kanji mới, 10 từ mới, không có thẻ', () => {
    expect(dueToday(empty(), ctx)).toEqual({ kanjiDue: 0, vocabDue: 0, kanjiMoi: 5, tuMoi: 10, cards: 0, total: 15 });
  });
  it('đếm thẻ kanji mỗi chữ một lần (gồm chữ học rồi mà chưa có thẻ), thẻ từ vựng; tối đa 20', () => {
    const d = empty();
    d.kanji['一'] = { gioiThieu: '2026-11-19' };
    d.kanji['二'] = { gioiThieu: '2026-11-19' };
    d.srs['kanji-nghia:二'] = { dueAt: '2026-11-19T00:00:00Z', state: 1 };
    d.srs['kanji-doc:二'] = { dueAt: '2026-11-19T00:00:00Z', state: 1 };
    d.srs['kanji-chu:二'] = { dueAt: '2030-01-01T00:00:00Z', state: 1 };
    for (const w of vocab().slice(0, 25)) d.srs[`vocab:${w.id}`] = { dueAt: '2026-11-19T00:00:00Z', state: 2 };
    const r = dueToday(d, ctx);
    expect(r.kanjiDue).toBe(2);
    expect(r.vocabDue).toBe(20);
    expect(r.cards).toBe(22);
  });
});

describe('dueToday: giới hạn và loại thẻ', () => {
  it('tối đa 20 thẻ kanji', () => {
    const d = empty();
    for (const k of kanji().slice(0, 25)) d.kanji[k.id] = { gioiThieu: '2026-11-19' };
    expect(dueToday(d, ctx).kanjiDue).toBe(20);
  });
  it('loại thẻ chưa đăng ký: không đếm (tránh vòng lặp Học ngay)', () => {
    const d = empty();
    d.kanji['一'] = { gioiThieu: '2026-11-19' };
    const r = dueToday(d, { ...ctx, canShow: () => false });
    expect(r.kanjiDue).toBe(0);
    expect(r.vocabDue + r.tuMoi).toBe(0);
    expect(nextTask(r)).toEqual(['kanji', 'hoc-moi']);
  });
  it('afterSession: còn việc → Việc tiếp theo, hết → Về trang chủ', async () => {
    const { afterSession } = await import('./today.js');
    const toHash = (r) => `#/${r}`;
    expect(afterSession(empty(), ctx, toHash)).toEqual({ label: 'Việc tiếp theo', hash: '#/hoc-ngay' });
    const done = empty();
    for (const k of kanji()) done.kanji[k.id] = { gioiThieu: '2026-11-01' };
    for (const w of vocab()) done.tuVung[w.id] = { gioiThieu: '2026-11-01' };
    for (const k of kanji()) for (const t of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) done.srs[`${t}:${k.id}`] = { dueAt: '2030-01-01T00:00:00Z' };
    expect(afterSession(done, ctx, toHash)).toEqual({ label: 'Về trang chủ', hash: '#/' });
  });
});

describe('nextTask và summarize', () => {
  it('thứ tự ôn kanji → từ vựng → kanji mới', () => {
    expect(nextTask({ kanjiDue: 1, vocabDue: 1, tuMoi: 1, kanjiMoi: 1 })).toEqual(['on-tap', 'kanji']);
    expect(nextTask({ kanjiDue: 0, vocabDue: 0, tuMoi: 3, kanjiMoi: 1 })).toEqual(['on-tap', 'tu-vung']);
    expect(nextTask({ kanjiDue: 0, vocabDue: 0, tuMoi: 0, kanjiMoi: 1 })).toEqual(['kanji', 'hoc-moi']);
    expect(nextTask({ kanjiDue: 0, vocabDue: 0, tuMoi: 0, kanjiMoi: 0 })).toBeNull();
  });
  it('summarize', () => {
    expect(summarize({ cards: 12, kanjiMoi: 3, tuMoi: 0 })).toBe('12 thẻ cần ôn · 3 kanji mới');
    expect(summarize({ cards: 0, kanjiMoi: 0, tuMoi: 0 })).toBe('');
  });
});

describe('chuỗi ngày học', () => {
  const withDays = (...days) => ({ ...empty(), hocGiay: Object.fromEntries(days.map((d) => [d, 120])) });
  it('T2, T3 học, T4 nghỉ, T5 học, hôm nay (T6) học → chuỗi 4, có dùng ngày nghỉ', () => {
    expect(studyStreak(withDays('2026-11-16', '2026-11-17', '2026-11-19', '2026-11-20'), NOW)).toEqual({ days: 4, freezeUsed: true });
  });
  it('đúng kịch bản spec: T2, T3 học, T4 nghỉ, T5 (hôm nay) học → 3', () => {
    expect(studyStreak(withDays('2026-11-16', '2026-11-17', '2026-11-19'), new Date(2026, 10, 19, 11))).toEqual({ days: 3, freezeUsed: true });
  });
  it('sáng hôm sau ngày nghỉ, chưa học: chuỗi vẫn giữ (không về 0)', () => {
    expect(studyStreak(withDays('2026-11-16', '2026-11-17', '2026-11-18'), NOW).days).toBe(3);
  });
  it('hôm nay chưa học không làm mất chuỗi', () => {
    expect(studyStreak(withDays('2026-11-18', '2026-11-19'), NOW).days).toBe(2);
  });
  it('nghỉ 2 ngày liền thì mất chuỗi', () => {
    expect(studyStreak(withDays('2026-11-16', '2026-11-19', '2026-11-20'), NOW).days).toBe(2);
  });
  it('dưới 60 giây không tính là ngày học', () => {
    expect(studyStreak({ ...empty(), hocGiay: { '2026-11-20': 30 } }, NOW).days).toBe(0);
  });
  it('chỉ tha 1 ngày nghỉ mỗi 7 ngày', () => {
    // học 20,19, nghỉ 18, học 17, nghỉ 16, học 15 → ngày nghỉ thứ hai quá gần: chuỗi 3
    expect(studyStreak(withDays('2026-11-20', '2026-11-19', '2026-11-17', '2026-11-15'), NOW).days).toBe(3);
  });
});

describe('tuần và số đã học', () => {
  it('weekDays: T2–CN, hôm nay là T6', () => {
    const w = weekDays({ ...empty(), hocGiay: { '2026-11-16': 300 } }, NOW);
    expect(w.map((d) => d.label)).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
    expect(w[0]).toMatchObject({ day: '2026-11-16', done: true });
    expect(w[4]).toMatchObject({ today: true, future: false });
    expect(w[5].future).toBe(true);
  });
  it('learnedCounts', () => {
    const d = empty();
    d.kanji['一'] = { gioiThieu: '2026-11-01' };
    for (const k of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) d.srs[`${k}:一`] = { state: 2 };
    d.kanji['二'] = { gioiThieu: '2026-11-01' };
    d.srs['vocab:n5-0001'] = { state: 2 };
    d.tuVung['n5-0002'] = { gioiThieu: '2026-11-20' };
    expect(learnedCounts(d, ctx)).toEqual({ kanjiHoc: 2, kanjiThuoc: 1, kanjiTong: 110, tuHoc: 2, tuThuoc: 1, tuTong: 718 });
  });
});
