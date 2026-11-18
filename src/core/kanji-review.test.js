import { describe, it, expect } from 'vitest';
import { parseKey, missingKanjiCards, ensureKanjiCards, dueKanjiCards, nextKanjiDue, buildKanjiQuestion, readingOf, readingTarget, normKana, onePerKanji } from './kanji-review.js';
import { createProgress } from './progress.js';
import { kanji, kanjiById } from './content.js';
import { seededRng } from './kana-quiz.js';

const T0 = new Date('2026-11-18T10:00:00Z');
const known = new Set(kanji().map((k) => k.id));
function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const store = () => createProgress({ storage: memoryStorage(), now: () => T0, events: new EventTarget() });

describe('khoá và thẻ thiếu', () => {
  it('parseKey', () => {
    expect(parseKey('kanji-doc:日')).toEqual({ kind: 'kanji-doc', id: '日' });
    expect(parseKey('kana:あ')).toBeNull();
    expect(parseKey('xx')).toBeNull();
  });
  it('mỗi kanji đã giới thiệu thiếu 3 thẻ; bỏ chữ lạ và chữ chưa giới thiệu', () => {
    const data = { kanji: { 日: { gioiThieu: '2026-11-18' }, 月: {}, 龍: { gioiThieu: '2026-11-18' } }, srs: { 'kanji-nghia:日': {} } };
    expect(missingKanjiCards(data, known).sort()).toEqual(['kanji-chu:日', 'kanji-doc:日']);
  });
  it('ensureKanjiCards tạo 3 thẻ giãn ngày (nghĩa hôm nay, đọc +1, chữ +2), chạy lại không tạo thêm', async () => {
    const s = store();
    s.update((d) => {
      d.kanji['日'] = { gioiThieu: '2026-11-17' };
      d.kanji['月'] = { gioiThieu: '2026-11-17' };
    });
    expect(await ensureKanjiCards(s, known, T0)).toEqual({ ok: true, created: 6 });
    expect(await ensureKanjiCards(s, known, T0)).toEqual({ ok: true, created: 0 });
    expect(dueKanjiCards(s.get(), known, T0).map((x) => x.kind)).toEqual(['kanji-nghia', 'kanji-nghia']);
    const day = (k) => (Date.parse(s.get().srs[k].dueAt) - T0.getTime()) / 86400000;
    expect([day('kanji-nghia:日'), day('kanji-doc:日'), day('kanji-chu:日')]).toEqual([0, 1, 2]);
    expect(dueKanjiCards(s.get(), known, new Date(T0.getTime() + 2 * 86400000))).toHaveLength(6);
  });
  it('ensureKanjiCards báo lỗi ghi', async () => {
    const s = store();
    s.update((d) => {
      d.kanji['日'] = { gioiThieu: '2026-11-17' };
    });
    const broken = { get: s.get, update: () => ({ ok: false, error: 'đầy' }) };
    expect(await ensureKanjiCards(broken, known, T0)).toEqual({ ok: false, created: 0, error: 'đầy' });
  });
});

describe('thẻ đến hạn', () => {
  const data = {
    srs: {
      'kanji-doc:日': { dueAt: '2026-11-18T09:00:00Z' },
      'kanji-nghia:日': { dueAt: '2026-11-18T08:00:00Z' },
      'kanji-chu:月': { dueAt: '2026-11-19T08:00:00Z' },
      'kanji-chu:龍': { dueAt: '2026-11-18T07:00:00Z' },
      'kana:あ': { dueAt: '2026-11-18T07:00:00Z' },
      'kanji-chu:火': { dueAt: 'hỏng' },
    },
  };
  it('sớm nhất trước, thẻ hỏng coi như đến hạn, bỏ chữ lạ và thẻ kana', () => {
    expect(dueKanjiCards(data, known, T0).map((x) => x.key)).toEqual(['kanji-chu:火', 'kanji-nghia:日', 'kanji-doc:日']);
  });
  it('nextKanjiDue', () => {
    expect(nextKanjiDue(data, known, T0).toISOString()).toBe('2026-11-19T08:00:00.000Z');
    expect(nextKanjiDue({ srs: {} }, known, T0)).toBeNull();
  });
});

describe('câu trắc nghiệm', () => {
  const mine = (k) => new Set([...k.kun, ...k.on].map((r) => normKana(r.kana)).concat(k.viDu.map((v) => normKana(v.doc))));
  it('thẻ đọc: hỏi cách đọc từ ví dụ; 4 đáp án khác nhau; không đáp án sai nào là một cách đọc của chữ đó (mọi kanji, 10 seed)', () => {
    for (const k of kanji()) {
      for (let seed = 1; seed <= 10; seed++) {
        const q = buildKanjiQuestion('kanji-doc', k, kanji(), seededRng(seed));
        expect(q).not.toBeNull();
        expect(new Set(q.options.map(normKana)).size).toBe(4);
        expect(q.options[q.answer]).toBe(readingOf(k));
        for (const o of q.options) if (o !== q.options[q.answer]) expect(mine(k).has(normKana(o))).toBe(false);
      }
    }
  });
  it('readingTarget: từ ví dụ (食 → 食べる/たべる), không có thì âm on', () => {
    const shoku = readingTarget(kanjiById('食'));
    expect(shoku.kind).toBe('tu');
    expect(shoku.word).toContain('食');
    expect(readingTarget(kanjiById('田'))).toMatchObject({ kind: 'on', word: '田' });
    const q = buildKanjiQuestion('kanji-doc', kanjiById('田'), kanji(), seededRng(1));
    expect(q.options.every((o) => /^[\u30a0-\u30ff]+$/.test(o))).toBe(true);
  });
  it('normKana và onePerKanji', () => {
    expect(normKana('ショク')).toBe('しょく');
    expect(normKana('た.べる')).toBe('たべる');
    expect(onePerKanji([{ id: '日', kind: 'a' }, { id: '月' }, { id: '日', kind: 'b' }])).toEqual([{ id: '日', kind: 'a' }, { id: '月' }]);
  });
  it('thẻ chữ: không lấy chữ trùng nghĩa', () => {
    const k = { id: 'A', hanViet: 'X', nghia: 'n', deNham: [] };
    const all = [k, { id: 'B', hanViet: 'Y', nghia: 'n' }, { id: 'C', hanViet: 'Z', nghia: 'c' }, { id: 'D', hanViet: 'W', nghia: 'd' }, { id: 'E', hanViet: 'V', nghia: 'e' }];
    for (let seed = 1; seed < 10; seed++) expect(buildKanjiQuestion('kanji-chu', k, all, seededRng(seed)).options).not.toContain('B');
  });
  it('thẻ chữ: 4 chữ khác nhau, không trùng Hán Việt/nghĩa, ưu tiên chữ dễ nhầm (mọi kanji)', () => {
    for (const k of kanji()) {
      const q = buildKanjiQuestion('kanji-chu', k, kanji(), seededRng(2));
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBe(k.id);
      for (const id of q.options.filter((x) => x !== k.id)) {
        expect(kanjiById(id).hanViet).not.toBe(k.hanViet);
      }
      const near = (k.deNham || []).filter((id) => kanjiById(id));
      if (near.length) expect(q.options).toContain(near.find((id) => q.options.includes(id)) ?? '__');
    }
  });
  it('loại lạ / thiếu dữ liệu → null', () => {
    expect(buildKanjiQuestion('kanji-nghia', kanji()[0], kanji())).toBeNull();
    expect(buildKanjiQuestion('kanji-doc', { id: 'x', kun: [], on: [] }, kanji())).toBeNull();
    expect(buildKanjiQuestion('kanji-chu', kanji()[0], kanji().slice(0, 2))).toBeNull();
  });
});
