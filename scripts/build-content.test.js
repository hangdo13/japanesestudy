// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildKanji, buildKana, toHiragana, main } from './build-content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const real = () => ({
  jlpt: read('vendor/jlptsuccess/kanji.json'),
  vi: read('content-vi/kanji.json'),
  vocab: read('n5_vocab.json'),
});
const allFiles = () => true;

describe('buildKanji', () => {
  it('gom đủ 106 kanji theo thứ tự bài học, không lỗi, kể cả khi vendor bị xáo trộn', () => {
    const src = real();
    src.jlpt.entries.reverse();
    const { items, errors } = buildKanji(src, allFiles);
    expect(errors).toEqual([]);
    expect(items).toHaveLength(106);
    expect(items.map((k) => k.thuTu)).toEqual(Array.from({ length: 106 }, (_, i) => i + 1));
    for (const k of items) {
      expect(k.hanViet && k.nghia && k.cauGoiNho).toBeTruthy();
      expect(['draft', 'approved']).toContain(k.reviewStatus);
    }
  });

  it('ánh xạ đúng các trường của 日', () => {
    const nhat = buildKanji(real(), allFiles).items.find((k) => k.id === '日');
    expect(nhat.hanViet).toBe('NHẬT');
    expect(nhat.on[0]).toEqual({ kana: 'ニチ', audio: 'audio/kanji/日-on-にち.mp3' });
    expect(nhat.boPhan).toEqual(['日']);
    expect(nhat.soNet).toBe(4);
    expect(nhat.svg).toBe('kanji/svg/日.svg');
    // ví dụ của JLPTSuccess được ưu tiên trước từ n5_vocab khác
    expect(nhat.viDu.map((v) => v.tu)).toEqual(['今日', '日曜日', '一日']);
    expect(nhat.deNham).toEqual(['口', '月', '白', '目', '曜']);
  });

  it('chọn đúng từ đồng tự theo cách đọc của ví dụ (一日 = ついたち)', () => {
    const ichi = buildKanji(real(), allFiles).items.find((k) => k.id === '一');
    const ichinichi = ichi.viDu.find((v) => v.tu === '一日');
    if (ichinichi) expect(ichinichi.doc).toBe('ついたち');
  });

  it('deNham bỏ chữ trùng, chính nó và chữ ngoài N5', () => {
    const src = real();
    const e = src.jlpt.entries.find((x) => x.glyph === '日');
    e.lookalikes = ['日', '目', '目', '猫'];
    expect(buildKanji(src, allFiles).items.find((k) => k.id === '日').deNham).toEqual(['目']);
  });

  it('báo lỗi khi một chữ thiếu câu gợi nhớ', () => {
    const src = real();
    delete src.vi['日'].cauGoiNho;
    expect(buildKanji(src, allFiles).errors).toContain('日: thiếu "cauGoiNho" trong content-vi/kanji.json');
  });

  it('báo lỗi khi thiếu file audio hoặc SVG', () => {
    const { errors } = buildKanji(real(), (p) => p !== 'audio/kanji/日-on-にち.mp3' && p !== 'kanji/svg/月.svg');
    expect(errors).toContain('日: thiếu file audio audio/kanji/日-on-にち.mp3');
    expect(errors).toContain('月: thiếu file SVG kanji/svg/月.svg');
  });

  it('báo lỗi khi content-vi có chữ lạ hoặc reviewStatus sai', () => {
    const src = real();
    src.vi['猫'] = { hanViet: 'MIÊU', nghia: 'mèo', cauGoiNho: 'x' };
    src.vi['月'].reviewStatus = 'ok';
    const { errors } = buildKanji(src, allFiles);
    expect(errors).toContain('content-vi/kanji.json có chữ lạ không thuộc N5: 猫');
    expect(errors).toContain('月: reviewStatus không hợp lệ "ok"');
  });

  it('báo lỗi khi dữ liệu vendor hỏng', () => {
    const src = real();
    src.jlpt.entries.pop();
    src.jlpt.entries[0].stroke_count = undefined;
    src.jlpt.entries[1].lesson_order = src.jlpt.entries[2].lesson_order;
    const { errors } = buildKanji(src, allFiles);
    expect(errors).toContain('vendor: cần 106 kanji, có 105');
    expect(errors.some((e) => e.includes('thiếu stroke_count'))).toBe(true);
    expect(errors).toContain('vendor: lesson_order thiếu, không phải số nguyên hoặc bị trùng');
  });

  it('lấy ví dụ từ n5_vocab qua trường kanji khi ví dụ JLPTSuccess không khớp', () => {
    const en = buildKanji(real(), allFiles).items.find((k) => k.id === '円');
    expect(en.viDu.length).toBeGreaterThan(0);
    for (const v of en.viDu) expect(v.tu).toContain('円');
  });

  it('không có từ nào thì viDu rỗng', () => {
    const src = real();
    src.vocab = { words: [] };
    expect(buildKanji(src, allFiles).items.every((k) => k.viDu.length === 0)).toBe(true);
  });

  it('chuyển katakana sang hiragana', () => {
    expect(toHiragana('ニチ')).toBe('にち');
    expect(toHiragana('-び')).toBe('-び');
  });
});

describe('buildKana', () => {
  const vi = () => read('content-vi/kana.json');
  it('gom đủ 230 kana, chữ đơn có SVG, chữ ghép không có', () => {
    const r = buildKana(vi(), () => true);
    expect(r.errors).toEqual([]);
    expect(r.items).toHaveLength(230);
    expect(r.items.filter((k) => k.script === 'hiragana' && k.nhom === 'co-ban')).toHaveLength(46);
    expect(r.items.find((k) => k.id === 'し')).toMatchObject({ romaji: 'shi', svg: 'kana/svg/し.svg' });
    expect(r.items.find((k) => k.id === 'きゃ')).toMatchObject({ romaji: 'kya', svg: null });
    expect(r.items.find((k) => k.id === 'ティ').nhom).toBe('mo-rong');
  });
  it('báo lỗi khi thiếu SVG, thiếu romaji hoặc cặp dễ nhầm có chữ lạ', () => {
    const src = vi();
    src.items.find((k) => k.id === 'あ').romaji = '';
    src.capDeNham.push(['あ', '猫']);
    const r = buildKana(src, (p) => p !== 'kana/svg/い.svg');
    expect(r.errors).toContain('あ: thiếu romaji');
    expect(r.errors).toContain('い: thiếu file SVG kana/svg/い.svg');
    expect(r.errors).toContain('capDeNham có chữ lạ: 猫');
  });
  it('báo lỗi cấu trúc: thiếu id, trùng chữ, sai cột, nhóm dễ nhầm hỏng, reviewStatus sai', () => {
    const src = vi();
    src.items.push(null, { ...src.items[0] });
    src.items.find((k) => k.id === 'か').cot = 'x';
    src.capDeNham.push(['あ'], 'あい');
    src.reviewStatus = 'ok';
    const r = buildKana(src, () => true);
    expect(r.errors).toContain('kana: có mục thiếu id');
    expect(r.errors.some((e) => e.startsWith('kana bị trùng: あ'))).toBe(true);
    expect(r.errors).toContain('か: hang/cot không hợp lệ để dựng bảng');
    expect(r.errors.filter((e) => e.startsWith('nhóm capDeNham không hợp lệ'))).toHaveLength(2);
    expect(r.errors).toContain('kana: reviewStatus không hợp lệ "ok"');
  });
});

describe('main', () => {
  function fixtureRoot() {
    const dir = mkdtempSync(join(tmpdir(), 'kotoba-content-'));
    for (const p of ['vendor/jlptsuccess', 'content-vi']) mkdirSync(join(dir, p), { recursive: true });
    cpSync(join(ROOT, 'vendor/jlptsuccess/kanji.json'), join(dir, 'vendor/jlptsuccess/kanji.json'));
    cpSync(join(ROOT, 'n5_vocab.json'), join(dir, 'n5_vocab.json'));
    cpSync(join(ROOT, 'content-vi/kana.json'), join(dir, 'content-vi/kana.json'));
    cpSync(join(ROOT, 'public'), join(dir, 'public'), { recursive: true });
    return dir;
  }

  it('có lỗi thì trả mã 1 và không ghi content/kanji.json', () => {
    const dir = fixtureRoot();
    const vi = read('content-vi/kanji.json');
    delete vi['日'].cauGoiNho;
    writeFileSync(join(dir, 'content-vi/kanji.json'), JSON.stringify(vi));
    expect(main(dir)).toBe(1);
    expect(existsSync(join(dir, 'content/kanji.json'))).toBe(false);
  });

  it('dữ liệu đúng thì trả mã 0 và ghi file', () => {
    const dir = fixtureRoot();
    cpSync(join(ROOT, 'content-vi/kanji.json'), join(dir, 'content-vi/kanji.json'));
    expect(main(dir)).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, 'content/kanji.json'), 'utf8')).items).toHaveLength(106);
  });
});
