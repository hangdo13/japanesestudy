import { describe, it, expect } from 'vitest';
import { learningOrder, dueVocab, newVocabToday, nextVocabDue, speakText, canSpeakWord } from './vocab-review.js';
import { tuMoiLimit, autoSpeakOnFlip } from './growth.js';
import { vocab, vocabById, vocabTopics } from './content.js';

const T0 = new Date('2026-11-18T10:00:00Z');
const known = new Set(vocab().map((w) => w.id));

describe('nội dung từ vựng', () => {
  it('718 từ, 21 chủ đề, id giữ nguyên, cách đọc chính/phụ', () => {
    expect(vocab()).toHaveLength(718);
    expect(vocabTopics()).toHaveLength(21);
    expect(vocabTopics()[0]).toBe('Chào hỏi, giao tiếp');
    expect(vocabById('n5-0044')).toMatchObject({ tu: 'いい', doc: 'いい', docKhac: ['よい'], nghia: 'tốt, được' });
    expect(vocab().every((w) => w.chuDeThuTu >= 1 && w.chuDeThuTu <= 21)).toBe(true);
  });
});

describe('hạn mức và cài đặt', () => {
  it('tuMoiLimit: mặc định 10, chỉ nhận giá trị trong danh sách', () => {
    expect(tuMoiLimit({})).toBe(10);
    expect(tuMoiLimit({ tuMoiMoiNgay: 20 })).toBe(20);
    expect(tuMoiLimit({ tuMoiMoiNgay: '15' })).toBe(15);
    expect(tuMoiLimit({ tuMoiMoiNgay: 7 })).toBe(10);
  });
  it('autoSpeakOnFlip: mặc định bật', () => {
    expect(autoSpeakOnFlip({})).toBe(true);
    expect(autoSpeakOnFlip({ tuDocKhiLat: false })).toBe(false);
  });
});

describe('từ mới hôm nay', () => {
  it('thứ tự học: chủ đề không giảm, chủ đề đầu đi hết trước', () => {
    const order = learningOrder(vocab());
    const t = order.map((w) => w.chuDeThuTu);
    expect(t.every((x, i) => i === 0 || x >= t[i - 1])).toBe(true);
    expect(order[1].chuDe).toBe('Chào hỏi, giao tiếp');
    expect(vocabById('n5-0110').tu).toBe('叔父さん');
  });
  it('theo thứ tự chủ đề lộ trình; trừ số đã học hôm nay; bỏ từ đã có thẻ', () => {
    const order = learningOrder(vocab());
    expect(order[0].chuDe).toBe('Chào hỏi, giao tiếp');
    const data = {
      settings: {},
      tuVung: { [order[0].id]: { gioiThieu: '2026-11-18' }, [order[1].id]: { gioiThieu: '2026-11-17' } },
      srs: { [`vocab:${order[2].id}`]: { dueAt: '2027-01-01T00:00:00Z' } },
    };
    const r = newVocabToday(data, vocab(), '2026-11-18');
    expect(r.introducedToday).toBe(1);
    expect(r.pack).toHaveLength(9);
    expect(r.pack[0].id).toBe(order[3].id);
    expect(r.remainingTotal).toBe(715);
  });
  it('hết hạn mức thì gói rỗng', () => {
    const order = learningOrder(vocab());
    const tuVung = Object.fromEntries(order.slice(0, 5).map((w) => [w.id, { gioiThieu: '2026-11-18' }]));
    expect(newVocabToday({ settings: { tuMoiMoiNgay: 5 }, tuVung }, vocab(), '2026-11-18').pack).toHaveLength(0);
  });
});

describe('thẻ đến hạn', () => {
  const data = {
    srs: {
      'vocab:n5-0002': { dueAt: '2026-11-18T09:00:00Z' },
      'vocab:n5-0001': { dueAt: '2026-11-18T08:00:00Z' },
      'vocab:n5-0003': { dueAt: '2026-11-19T08:00:00Z' },
      'vocab:n5-9999': { dueAt: '2026-11-18T07:00:00Z' },
      'vocab:n5-0004': { dueAt: 'hỏng' },
      'kanji-doc:日': { dueAt: '2026-11-18T07:00:00Z' },
    },
  };
  it('sớm nhất trước, thẻ hỏng đến hạn, bỏ id lạ và thẻ khác loại', () => {
    expect(dueVocab(data, known, T0)).toEqual(['n5-0004', 'n5-0001', 'n5-0002']);
  });
  it('nextVocabDue', () => {
    expect(nextVocabDue(data, known, T0).toISOString()).toBe('2026-11-19T08:00:00.000Z');
  });
  it('speakText bỏ ～; phụ tố một chữ thì không đọc', () => {
    expect(speakText({ doc: '～えん' })).toBe('えん');
    expect(canSpeakWord({ doc: '～えん' })).toBe(true);
    expect(canSpeakWord({ doc: 'お～' })).toBe(false);
  });
});

import { topicStats, topicPack, isLearned } from './vocab-review.js';

describe('từ vựng theo chủ đề', () => {
  it('21 chủ đề theo thứ tự lộ trình, tổng 718, đếm đã học', () => {
    const data = { tuVung: { 'n5-0001': { gioiThieu: '2026-11-20' } }, srs: {} };
    const s = topicStats(data, vocab(), vocabTopics());
    expect(s).toHaveLength(21);
    expect(s[0]).toMatchObject({ thuTu: 1, chuDe: 'Chào hỏi, giao tiếp', daHoc: 1 });
    expect(s.reduce((a, t) => a + t.tong, 0)).toBe(718);
  });
  it('gói học: từ chưa học của chủ đề, theo id, tối đa hạn mức', () => {
    const first = vocab().filter((w) => w.chuDeThuTu === 1).sort((a, b) => a.id.localeCompare(b.id));
    const data = { settings: { tuMoiMoiNgay: 5 }, tuVung: { [first[0].id]: { gioiThieu: '2026-11-01' } }, srs: { [`vocab:${first[1].id}`]: {} } };
    const { pack, left } = topicPack(data, vocab(), 1, '2026-11-20');
    expect(pack.map((w) => w.id)).toEqual(first.slice(2, 7).map((w) => w.id));
    expect(left).toBe(first.length - 2);
    expect(isLearned(data, first[1].id)).toBe(true);
    expect(topicPack(data, vocab(), 99, '2026-11-20').pack).toEqual([]);
  });
  it('hạn mức chung trong ngày: từ đã học hôm nay (ở đâu cũng tính) trừ vào gói', () => {
    const other = vocab().filter((w) => w.chuDeThuTu === 2).slice(0, 3);
    const data = { settings: { tuMoiMoiNgay: 5 }, tuVung: Object.fromEntries(other.map((w) => [w.id, { gioiThieu: '2026-11-20' }])), srs: {} };
    expect(topicPack(data, vocab(), 1, '2026-11-20').pack).toHaveLength(2);
    expect(topicPack(data, vocab(), 1, '2026-11-21').pack).toHaveLength(5);
  });
});
