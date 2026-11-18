// Gom nội dung nguồn thành content/*.json (AD-3).
// Chỉ script này được đọc vendor/, content-vi/ và n5_vocab.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_VI_DU = 3;
const SO_KANJI_N5 = 106;
const REVIEW = new Set(['draft', 'approved']);

/** Katakana → hiragana (tên file audio dùng hiragana). */
export function toHiragana(s) {
  return [...s].map((c) => (c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c)).join('');
}

/**
 * Hàm thuần: gom kanji. Trả { items, errors }.
 * @param {{ jlpt: {entries: object[]}, vi: Record<string, object>, vocab: {words: object[]} }} sources
 * @param {(publicPath: string) => boolean} fileExists  kiểm tra file trong public/
 */
export function buildKanji({ jlpt, vi, vocab }, fileExists) {
  const errors = [];
  const entries = [...jlpt.entries].sort((a, b) => a.lesson_order - b.lesson_order);
  const glyphs = new Set(entries.map((e) => e.glyph));

  // Kiểm tra dữ liệu vendor để bản cập nhật sau không lặng lẽ sinh dữ liệu hỏng.
  if (entries.length !== SO_KANJI_N5) errors.push(`vendor: cần ${SO_KANJI_N5} kanji, có ${entries.length}`);
  if (glyphs.size !== entries.length) errors.push('vendor: có kanji bị trùng');
  const orders = entries.map((e) => e.lesson_order);
  if (!orders.every(Number.isInteger) || new Set(orders).size !== orders.length) {
    errors.push('vendor: lesson_order thiếu, không phải số nguyên hoặc bị trùng');
  }

  for (const g of Object.keys(vi)) {
    if (!glyphs.has(g)) errors.push(`content-vi/kanji.json có chữ lạ không thuộc N5: ${g}`);
  }

  // Một cách viết có thể có nhiều từ (一日: いちにち / ついたち): chọn theo cách đọc của ví dụ.
  const byWord = new Map();
  for (const w of vocab.words) byWord.set(w.word, [...(byWord.get(w.word) || []), w]);
  const matchExample = (ex) => {
    const cands = byWord.get(ex.form) || [];
    const readings = String(ex.reading || '').split(/\s*\/\s*/);
    return cands.find((w) => readings.includes(w.reading)) ?? cands[0];
  };
  const toViDu = (w) => ({ id: w.id, tu: w.word, doc: w.reading, nghia: w.meaning_vi });

  const items = entries.map((e) => {
    const v = vi[e.glyph] || {};
    for (const field of ['hanViet', 'nghia', 'cauGoiNho']) {
      if (typeof v[field] !== 'string' || !v[field].trim()) {
        errors.push(`${e.glyph}: thiếu "${field}" trong content-vi/kanji.json`);
      }
    }
    if (typeof v.hanViet === 'string' && v.hanViet !== v.hanViet.toUpperCase()) {
      errors.push(`${e.glyph}: "hanViet" phải viết hoa`);
    }
    if (!Number.isInteger(e.stroke_count) || e.stroke_count < 1) errors.push(`${e.glyph}: thiếu stroke_count`);
    const reviewStatus = v.reviewStatus || 'draft';
    if (!REVIEW.has(reviewStatus)) errors.push(`${e.glyph}: reviewStatus không hợp lệ "${reviewStatus}"`);

    const readings = (kind) =>
      (e[kind] || []).map((r) => {
        const audio = `audio/kanji/${e.glyph}-${kind}-${toHiragana(r)}.mp3`;
        if (!fileExists(audio)) errors.push(`${e.glyph}: thiếu file audio ${audio}`);
        return { kana: r, audio };
      });

    const svg = `kanji/svg/${e.glyph}.svg`;
    if (!fileExists(svg)) errors.push(`${e.glyph}: thiếu file SVG ${svg}`);

    // Ví dụ: ưu tiên ví dụ của JLPTSuccess có trong n5_vocab, rồi đến từ n5_vocab chứa chữ này.
    const seen = new Set();
    const viDu = [];
    const push = (w) => {
      if (w && !seen.has(w.id) && viDu.length < MAX_VI_DU) {
        seen.add(w.id);
        viDu.push(toViDu(w));
      }
    };
    for (const ex of e.examples || []) push(matchExample(ex));
    for (const w of vocab.words) if ((w.kanji || []).includes(e.glyph)) push(w);

    const deNham = [...new Set(e.lookalikes || [])].filter((g) => g !== e.glyph && glyphs.has(g));

    return {
      id: e.glyph,
      thuTu: e.lesson_order,
      hanViet: v.hanViet,
      nghia: v.nghia,
      cauGoiNho: v.cauGoiNho,
      boPhan: e.radical_decomposition || [],
      on: readings('on'),
      kun: readings('kun'),
      soNet: e.stroke_count,
      svg,
      viDu,
      deNham,
      reviewStatus,
    };
  });

  return { items, errors };
}

/** Chạy script với thư mục gốc `root`. Trả mã thoát: 0 là thành công, 1 là có lỗi (không ghi file). */
export function main(root = ROOT) {
  const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
  let sources;
  try {
    sources = {
      jlpt: readJson('vendor/jlptsuccess/kanji.json'),
      vi: readJson('content-vi/kanji.json'),
      vocab: readJson('n5_vocab.json'),
    };
  } catch (err) {
    console.error(`build-content: không đọc được dữ liệu nguồn: ${err.message}`);
    return 1;
  }
  const { items, errors } = buildKanji(sources, (p) => existsSync(join(root, 'public', p)));
  if (errors.length) {
    console.error(`build-content: ${errors.length} lỗi`);
    for (const e of errors) console.error(`  - ${e}`);
    return 1;
  }
  mkdirSync(join(root, 'content'), { recursive: true });
  writeFileSync(join(root, 'content/kanji.json'), JSON.stringify({ version: 1, items }, null, 1) + '\n');
  console.log(`build-content: content/kanji.json (${items.length} kanji)`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main();
