// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildKanji, buildKana, toHiragana, main, romanize, romanizeSentence, buildKanaRules, readingKinds } from './build-content.mjs';

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
    cpSync(join(ROOT, 'content-vi/kana-quy-tac.json'), join(dir, 'content-vi/kana-quy-tac.json'));
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
    expect(JSON.parse(readFileSync(join(dir, 'content/kana-quy-tac.json'), 'utf8')).muc).toHaveLength(5);
  });

  it('quy tắc sai (romaji ví dụ không khớp) thì trả mã 1', () => {
    const dir = fixtureRoot();
    cpSync(join(ROOT, 'content-vi/kanji.json'), join(dir, 'content-vi/kanji.json'));
    const r = read('content-vi/kana-quy-tac.json');
    r.muc[0].viDu[0].romaji = 'kite';
    writeFileSync(join(dir, 'content-vi/kana-quy-tac.json'), JSON.stringify(r));
    expect(main(dir)).toBe(1);
    expect(existsSync(join(dir, 'content/kana-quy-tac.json'))).toBe(false);
  });
});

describe('romanize', () => {
  const map = new Map(read('content-vi/kana.json').items.map((k) => [k.id, k.romaji]));
  it.each([
    ['きって', 'kitte'],
    ['まっちゃ', 'matcha'],
    ['おかあさん', 'okaasan'],
    ['がっこう', 'gakkou'],
    ['とけい', 'tokei'],
    ['コーヒー', 'koohii'],
    ['パーティー', 'paatii'],
    ['きんえん', "kin'en"],
    ['ほんや', "hon'ya"],
    ['しんぶん', 'shinbun'],
    ['わたしは がくせい', 'watashiha gakusei'],
    ['ジュース', 'juusu'],
    ['ちょっと', 'chotto'],
    ['ニュース', 'nyuusu'],
  ])('%s → %s', (kana, r) => expect(romanize(kana, map)).toBe(r));
  it.each(['～えん', 'っ', 'ーあ', 'きっ', 'abc', 'っあ', 'きっ え', 'きっん', 'カッー'])('không đọc được: %s', (x) => expect(romanize(x, map)).toBeNull());
});

describe('buildKanaRules', () => {
  const kanaItems = read('content-vi/kana.json').items;
  const rules = () => read('content-vi/kana-quy-tac.json');
  const vocab = read('n5_vocab.json');
  it('dữ liệu thật: không lỗi, đủ 5 mục, có từ luyện cho cả 3 loại, bỏ từ có ～ / ;', () => {
    const r = buildKanaRules(rules(), vocab, kanaItems);
    expect(r.errors).toEqual([]);
    expect(r.muc.map((m) => m.id)).toEqual(['am-ngat', 'truong-am', 'ke-dai', 'tro-tu', 'kata-mo-rong']);
    for (const k of ['am-ngat', 'truong-am', 'ke-dai']) expect(r.tuLuyen.some((w) => w.loai.includes(k))).toBe(true);
    expect(r.tuLuyen.every((w) => !/[;～]/.test(w.doc))).toBe(true);
    expect(r.tuLuyen.find((w) => w.doc === 'きって').romaji).toBe('kitte');
    expect(new Set(r.tuLuyen.map((w) => w.doc)).size).toBe(r.tuLuyen.length);
  });
  it('thiếu mục / câu trợ từ sai thì báo lỗi', () => {
    const r = rules();
    r.muc = r.muc.filter((m) => m.id !== 'ke-dai');
    r.cauTroTu[0].sai = ['x'];
    const { errors } = buildKanaRules(r, vocab, kanaItems);
    expect(errors.join('\n')).toMatch(/thiếu mục ke-dai/);
    expect(errors.join('\n')).toMatch(/câu trợ từ không hợp lệ/);
  });
  it('romanizeSentence: trợ từ cuối cụm đọc wa/e/o, trong từ vẫn đọc ha/he', () => {
    expect(romanizeSentence('はなは きれい', map)).toBe('hana wa kirei');
    expect(romanizeSentence('へやへ いく', map)).toBe('heya e iku');
    expect(romanizeSentence('みずを のむ', map)).toBe('mizu o nomu');
  });
  const map = new Map(kanaItems.map((k) => [k.id, k.romaji]));
  const err = (mut) => {
    const r = rules();
    mut(r);
    return buildKanaRules(r, vocab, kanaItems).errors.join('\n');
  };
  it('romaji câu trợ từ sai (ha thay wa) thì báo lỗi', () => {
    expect(err((r) => (r.cauTroTu[0].romaji = 'watashi wa gakusee desu'))).toMatch(/câu trợ từ: romaji/);
    expect(err((r) => (r.muc.find((m) => m.id === 'tro-tu').viDu[0].romaji = 'watashi ha gakusei desu'))).toMatch(/mục tro-tu: romaji/);
  });
  it('đáp án sai trùng đáp án đúng / trùng nhau thì báo lỗi', () => {
    expect(err((r) => (r.cauTroTu[0].sai = [r.cauTroTu[0].romaji, 'a', 'b']))).toMatch(/không hợp lệ/);
    expect(err((r) => (r.cauTroTu[0].sai = ['a', 'a', 'b']))).toMatch(/không hợp lệ/);
  });
  it('thiếu ví dụ / ví dụ thiếu trường / mục lạ, trùng / phần tử hỏng / ít câu trợ từ', () => {
    expect(err((r) => (r.muc[0].viDu = []))).toMatch(/thiếu ví dụ/);
    expect(err((r) => delete r.muc[1].viDu[0].nghia)).toMatch(/ví dụ thiếu trường/);
    expect(err((r) => r.muc.push({ ...r.muc[0], id: 'la' }))).toMatch(/mục lạ: la/);
    expect(err((r) => r.muc.push(r.muc[0]))).toMatch(/trùng id/);
    expect(err((r) => r.muc.push(null))).toMatch(/không phải object/);
    expect(err((r) => r.cauTroTu.push(null))).toMatch(/không phải object/);
    expect(err((r) => (r.cauTroTu = r.cauTroTu.slice(0, 3)))).toMatch(/ít nhất 8/);
  });
  it('động từ tận cùng う không bị coi là trường âm; えい là trường âm', () => {
    const r = buildKanaRules(rules(), vocab, kanaItems);
    expect(r.tuLuyen.find((w) => w.doc === 'すう')).toBeUndefined();
    expect(r.tuLuyen.find((w) => w.doc === 'とけい').loai).toEqual(['truong-am']);
    expect(r.tuLuyen.find((w) => w.doc === 'せんせい').loai).toEqual(['truong-am']);
  });
  it('readingKinds', () => {
    expect(readingKinds('がっこう', 'gakkou')).toEqual(['am-ngat', 'truong-am']);
    expect(readingKinds('スーパー', 'suupaa')).toEqual(['ke-dai']);
    expect(readingKinds('ボウル', 'bouru')).toEqual([]);
    expect(readingKinds('きって', 'kitte')).toEqual(['am-ngat']);
    expect(readingKinds('コーヒー', 'koohii')).toEqual(['ke-dai']);
    expect(readingKinds('おかあさん', 'okaasan')).toEqual(['truong-am']);
    expect(readingKinds('あさ', 'asa')).toEqual([]);
  });
});
