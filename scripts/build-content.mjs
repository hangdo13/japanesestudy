// Gom nội dung nguồn thành content/*.json (AD-3).
// Chỉ script này được đọc vendor/, content-vi/ và n5_vocab.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { splitMora } from '../src/core/mora.js';
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

const KANA_NHOM = ['co-ban', 'duc', 'ban-duc', 'ghep', 'mo-rong'];
const KANA_LUOI = ['co-ban', 'duc', 'ban-duc']; // các nhóm dựng thành lưới 5 cột
const NGUYEN_AM = ['a', 'i', 'u', 'e', 'o'];

/**
 * Hàm thuần: gom kana. Chữ đơn bắt buộc có SVG nét viết (KanjiVG); chữ ghép thì không.
 * @param {{items: object[], capDeNham: string[][], reviewStatus?: string}} vi
 */
export function buildKana(vi, fileExists) {
  const errors = [];
  const items = Array.isArray(vi && vi.items) ? vi.items : [];
  if (!items.length) errors.push('content-vi/kana.json không có mục nào');
  const reviewStatus = (vi && vi.reviewStatus) || 'draft';
  if (!REVIEW.has(reviewStatus)) errors.push(`kana: reviewStatus không hợp lệ "${reviewStatus}"`);
  const ids = new Set();
  const cells = new Set();
  const out = [];
  for (const raw of items) {
    if (!raw || typeof raw.id !== 'string' || !raw.id) {
      errors.push('kana: có mục thiếu id');
      continue;
    }
    const k = { ...raw, id: raw.id.normalize('NFC') };
    if (ids.has(k.id)) errors.push(`kana bị trùng: ${k.id} (${k.script})`);
    ids.add(k.id);
    if (KANA_LUOI.includes(k.nhom)) {
      if (!k.hang || !NGUYEN_AM.includes(k.cot)) errors.push(`${k.id}: hang/cot không hợp lệ để dựng bảng`);
      const key = `${k.script}:${k.nhom}:${k.hang}:${k.cot}`;
      if (cells.has(key)) errors.push(`${k.id}: trùng ô ${k.hang}/${k.cot} trong bảng`);
      cells.add(key);
    }
    if (k.ghiChu != null && typeof k.ghiChu !== 'string') errors.push(`${k.id}: ghiChu phải là chuỗi`);
    if (!k.romaji || typeof k.romaji !== 'string') errors.push(`${k.id}: thiếu romaji`);
    if (!['hiragana', 'katakana'].includes(k.script)) errors.push(`${k.id}: script không hợp lệ`);
    if (!KANA_NHOM.includes(k.nhom)) errors.push(`${k.id}: nhom không hợp lệ "${k.nhom}"`);
    const single = [...k.id].length === 1;
    const svg = single ? `kana/svg/${k.id}.svg` : null;
    if (svg && !fileExists(svg)) errors.push(`${k.id}: thiếu file SVG ${svg}`);
    out.push({
      id: k.id,
      script: k.script,
      romaji: k.romaji,
      nhom: k.nhom,
      hang: k.hang,
      cot: k.cot ?? null,
      ghiChu: k.ghiChu ?? null,
      svg,
    });
  }
  const known = new Set(out.map((k) => k.id));
  const pairs = (vi && vi.capDeNham) ?? [];
  if (!Array.isArray(pairs)) errors.push('capDeNham phải là mảng');
  for (const group of Array.isArray(pairs) ? pairs : []) {
    if (!Array.isArray(group) || group.length < 2 || new Set(group).size !== group.length) {
      errors.push(`nhóm capDeNham không hợp lệ: ${JSON.stringify(group)}`);
      continue;
    }
    for (const g of group) if (!known.has(g)) errors.push(`capDeNham có chữ lạ: ${g}`);
  }
  return { items: out, capDeNham: Array.isArray(pairs) ? pairs : [], reviewStatus, errors };
}

const VOWELS = 'aiueo';

/**
 * Chuyển kana sang romaji Hepburn: trường âm viết đôi (okaasan, koohii), っ nhân đôi phụ âm (kitte, matcha),
 * ん trước nguyên âm/y viết n'. Khoảng trắng giữ nguyên. Trả null nếu có chữ không đọc được.
 * @param {string} text
 * @param {Map<string,string>} map  kana → romaji (từ content-vi/kana.json)
 */
export function romanize(text, map) {
  const out = [];
  let geminate = false;
  for (let i = 0; i < text.length; ) {
    const ch = text[i];
    if (ch === ' ') {
      if (geminate) return null;
      out.push(' ');
      i += 1;
      continue;
    }
    if (ch === 'っ' || ch === 'ッ') {
      if (geminate) return null;
      geminate = true;
      i += 1;
      continue;
    }
    if (ch === 'ー') {
      const prev = out.length ? out[out.length - 1] : '';
      const v = prev[prev.length - 1];
      if (!v || !VOWELS.includes(v) || geminate) return null;
      out.push(v);
      i += 1;
      continue;
    }
    const two = text.slice(i, i + 2);
    const key = map.has(two) ? two : map.has(ch) ? ch : null;
    if (!key) return null;
    let r = map.get(key);
    if (geminate) {
      if (VOWELS.includes(r[0]) || key === 'ん' || key === 'ン') return null;
      r = (r.startsWith('ch') ? 't' : r[0]) + r;
      geminate = false;
    }
    const prev = out[out.length - 1];
    if ((prev === 'n') && (VOWELS.includes(r[0]) || r[0] === 'y')) out[out.length - 1] = "n'";
    out.push(r);
    i += key.length;
  }
  if (geminate) return null;
  return out.join('');
}

/** Phân loại từ luyện đọc theo quy tắc nó chứa. */
export function readingKinds(reading, romaji) {
  const kinds = [];
  if (/[っッ]/.test(reading)) kinds.push('am-ngat');
  if (/ー/.test(reading)) kinds.push('ke-dai');
  else if (/(aa|ii|uu|ee|oo|ou|ei)/.test(romaji) && /[ぁ-ゖ]/.test(reading)) kinds.push('truong-am');
  return kinds;
}

const RULE_IDS = ['am-ngat', 'truong-am', 'ke-dai', 'tro-tu', 'kata-mo-rong'];
const PARTICLES = { は: 'wa', へ: 'e', を: 'o' };

/** Romaji cho câu có trợ từ: tách theo khoảng trắng, chữ は/へ/を cuối mỗi cụm đọc wa/e/o. */
export function romanizeSentence(text, map) {
  const parts = [];
  for (const chunk of String(text).split(' ')) {
    const last = chunk[chunk.length - 1];
    const body = PARTICLES[last] && chunk.length > 1 ? chunk.slice(0, -1) : chunk;
    const r = romanize(body, map);
    if (r == null) return null;
    parts.push(body === chunk ? r : `${r} ${PARTICLES[last]}`);
  }
  return parts.join(' ');
}
/** So câu romaji, bỏ qua khoảng trắng (kana không tách です khỏi từ trước). */
const sameSentence = (a, b) => a != null && a.replace(/ /g, '') === String(b).replace(/ /g, '');
const MIN_TRO_TU = 8;
const MIN_TU_MOI_LOAI = 5;
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

/** Dựng content/kana-quy-tac.json: các mục quy tắc, câu trợ từ, và từ luyện đọc lấy từ n5_vocab. */
export function buildKanaRules(rulesVi, vocab, kanaItems) {
  const errors = [];
  const map = new Map(kanaItems.map((k) => [k.id, k.romaji]));
  const rawMuc = Array.isArray(rulesVi && rulesVi.muc) ? rulesVi.muc : [];
  const muc = rawMuc.filter(isObj);
  if (muc.length !== rawMuc.length) errors.push('kana-quy-tac: có mục không phải object');
  const ids = muc.map((m) => m.id);
  for (const id of RULE_IDS) if (!ids.includes(id)) errors.push(`kana-quy-tac thiếu mục ${id}`);
  for (const id of ids) if (!RULE_IDS.includes(id)) errors.push(`kana-quy-tac có mục lạ: ${id}`);
  if (new Set(ids).size !== ids.length) errors.push('kana-quy-tac có mục trùng id');
  for (const m of muc) {
    if (!m.tieuDe || !m.giaiThich) errors.push(`kana-quy-tac mục ${m.id}: thiếu tiêu đề/giải thích`);
    if (!Array.isArray(m.viDu) || !m.viDu.length) errors.push(`kana-quy-tac mục ${m.id}: thiếu ví dụ`);
    for (const v of Array.isArray(m.viDu) ? m.viDu : []) {
      if (!isObj(v) || !v.doc || !v.romaji || !v.nghia) {
        errors.push(`kana-quy-tac mục ${m.id}: ví dụ thiếu trường`);
        continue;
      }
      const want = m.id === 'tro-tu' ? romanizeSentence(v.doc, map) : romanize(v.doc, map);
      if (m.id === 'tro-tu' ? !sameSentence(want, v.romaji) : want !== v.romaji) errors.push(`kana-quy-tac mục ${m.id}: romaji "${v.romaji}" không khớp ${v.doc} (${want})`);
    }
  }
  const cauTroTu = Array.isArray(rulesVi && rulesVi.cauTroTu) ? rulesVi.cauTroTu : [];
  if (cauTroTu.length < MIN_TRO_TU) errors.push(`kana-quy-tac cần ít nhất ${MIN_TRO_TU} câu trợ từ`);
  for (const c of cauTroTu) {
    if (!isObj(c)) {
      errors.push('kana-quy-tac câu trợ từ không phải object');
      continue;
    }
    const sai = Array.isArray(c.sai) ? c.sai : [];
    if (!c.doc || !c.romaji || !c.nghia || sai.length !== 3 || new Set([c.romaji, ...sai]).size !== 4)
      errors.push(`kana-quy-tac câu trợ từ không hợp lệ: ${c.doc}`);
    else if (!sameSentence(romanizeSentence(c.doc, map), c.romaji))
      errors.push(`kana-quy-tac câu trợ từ: romaji "${c.romaji}" không khớp ${c.doc} (${romanizeSentence(c.doc, map)})`);
  }
  const seen = new Set();
  const tuLuyen = [];
  for (const w of (vocab && vocab.words) || []) {
    const reading = w.reading;
    if (!reading || /[;～~]/.test(reading) || seen.has(reading)) continue;
    const romaji = romanize(reading, map);
    if (!romaji) continue;
    // động từ tận cùng う (すう, かう): う là đuôi động từ, không phải trường âm
    const isVerbU = /động từ/.test(w.type || '') && /う$/.test(reading);
    const loai = readingKinds(isVerbU ? reading.slice(0, -1) : reading, isVerbU ? romaji.slice(0, -1) : romaji);
    if (!loai.length) continue;
    seen.add(reading);
    tuLuyen.push({ id: w.id, tu: w.word, doc: reading, romaji, nghia: w.meaning_vi, loai });
  }
  for (const k of ['am-ngat', 'truong-am', 'ke-dai'])
    if (tuLuyen.filter((w) => w.loai[0] === k).length < MIN_TU_MOI_LOAI) errors.push(`kana-quy-tac: quá ít từ luyện loại ${k}`);
  return { muc, cauTroTu, tuLuyen, reviewStatus: (rulesVi && rulesVi.reviewStatus) || 'draft', errors };
}

const SOUND_IDS = ['phach', 'nguyen-am', 'vo-thanh', 'n', 'r'];

/**
 * `short` có được từ `long` chỉ bằng cách bỏ phụ âm nhân đôi (っ) hoặc phần kéo dài nguyên âm không?
 * So trên romaji: kitte→kite, okaasan→okasan, koukou→koko, heiya→heya.
 */
export function differsByLength(long, short) {
  let j = 0;
  let skipped = 0;
  for (let i = 0; i < long.length; i++) {
    if (j < short.length && long[i] === short[j]) {
      j += 1;
      continue;
    }
    const prev = long[i - 1];
    const ok = long[i] === prev || (long[i] === 'u' && prev === 'o') || (long[i] === 'i' && prev === 'e') || (long[i] === 't' && long[i + 1] === 'c');
    if (!ok) return false;
    skipped += 1;
  }
  return j === short.length && skipped > 0;
}
const MIN_CAP_AM = 10;

/** Dựng content/kana-phat-am.json: giải thích phát âm và cặp âm dễ nhầm (khác nhau ở phách dài/っ). */
export function buildKanaSounds(soundsVi, kanaItems) {
  const errors = [];
  const map = new Map(kanaItems.map((k) => [k.id, k.romaji]));
  const raw = Array.isArray(soundsVi && soundsVi.muc) ? soundsVi.muc : [];
  const muc = raw.filter(isObj);
  if (muc.length !== raw.length) errors.push('kana-phat-am: có mục không phải object');
  const ids = muc.map((m) => m.id);
  for (const id of SOUND_IDS) if (!ids.includes(id)) errors.push(`kana-phat-am thiếu mục ${id}`);
  for (const id of ids) if (!SOUND_IDS.includes(id)) errors.push(`kana-phat-am có mục lạ: ${id}`);
  if (new Set(ids).size !== ids.length) errors.push('kana-phat-am có mục trùng id');
  const word = (w, where) => {
    if (!isObj(w) || typeof w.doc !== 'string' || typeof w.nghia !== 'string' || !w.doc.trim() || !w.nghia.trim()) {
      errors.push(`kana-phat-am ${where}: thiếu doc/nghia`);
      return null;
    }
    const mora = splitMora(w.doc);
    const romaji = romanize(w.doc, map);
    if (!mora || !romaji) {
      errors.push(`kana-phat-am ${where}: không đọc được "${w.doc}"`);
      return null;
    }
    return { doc: w.doc, nghia: w.nghia, romaji, phach: mora };
  };
  const outMuc = muc.map((m) => {
    if (!m.tieuDe || !m.giaiThich) errors.push(`kana-phat-am mục ${m.id}: thiếu tiêu đề/giải thích`);
    const viDu = (Array.isArray(m.viDu) ? m.viDu : []).map((v) => word(v, `mục ${m.id}`)).filter(Boolean);
    if (!viDu.length) errors.push(`kana-phat-am mục ${m.id}: thiếu ví dụ`);
    return { id: m.id, tieuDe: m.tieuDe, giaiThich: m.giaiThich, viDu };
  });
  const rawCap = Array.isArray(soundsVi && soundsVi.capAm) ? soundsVi.capAm : [];
  if (rawCap.length < MIN_CAP_AM) errors.push(`kana-phat-am cần ít nhất ${MIN_CAP_AM} cặp âm`);
  const capAm = [];
  const seenPairs = new Set();
  for (const c of rawCap) {
    if (!isObj(c)) {
      errors.push('kana-phat-am cặp âm không phải object');
      continue;
    }
    const a = word(c.a, 'cặp âm');
    const b = word(c.b, 'cặp âm');
    if (!a || !b) continue;
    // cặp chỉ được khác nhau ở っ hoặc trường âm: đó là thứ bài nghe luyện
    const [longW, shortW] = a.phach.length > b.phach.length ? [a, b] : [b, a];
    if (a.phach.length === b.phach.length || !differsByLength(longW.romaji, shortW.romaji)) {
      errors.push(`kana-phat-am cặp ${a.doc}/${b.doc}: phải chỉ khác nhau ở っ hoặc trường âm`);
      continue;
    }
    const key = [a.doc, b.doc].sort().join('|');
    if (seenPairs.has(key)) {
      errors.push(`kana-phat-am cặp trùng: ${a.doc}/${b.doc}`);
      continue;
    }
    seenPairs.add(key);
    capAm.push({ a, b });
  }
  return { muc: outMuc, capAm, reviewStatus: (soundsVi && soundsVi.reviewStatus) || 'draft', errors };
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
      kanaVi: readJson('content-vi/kana.json'),
      rulesVi: readJson('content-vi/kana-quy-tac.json'),
      soundsVi: readJson('content-vi/kana-phat-am.json'),
    };
  } catch (err) {
    console.error(`build-content: không đọc được dữ liệu nguồn: ${err.message}`);
    return 1;
  }
  const fileExists = (p) => existsSync(join(root, 'public', p));
  const { items, errors: kanjiErrors } = buildKanji(sources, fileExists);
  const kana = buildKana(sources.kanaVi, fileExists);
  const rules = buildKanaRules(sources.rulesVi, sources.vocab, kana.items);
  const sounds = buildKanaSounds(sources.soundsVi, kana.items);
  const errors = [...kanjiErrors, ...kana.errors, ...rules.errors, ...sounds.errors];
  if (errors.length) {
    console.error(`build-content: ${errors.length} lỗi`);
    for (const e of errors) console.error(`  - ${e}`);
    return 1;
  }
  mkdirSync(join(root, 'content'), { recursive: true });
  writeFileSync(join(root, 'content/kanji.json'), JSON.stringify({ version: 1, items }, null, 1) + '\n');
  writeFileSync(
    join(root, 'content/kana.json'),
    JSON.stringify({ version: 1, reviewStatus: kana.reviewStatus, items: kana.items, capDeNham: kana.capDeNham }, null, 1) + '\n',
  );
  writeFileSync(
    join(root, 'content/kana-quy-tac.json'),
    JSON.stringify({ version: 1, reviewStatus: rules.reviewStatus, muc: rules.muc, cauTroTu: rules.cauTroTu, tuLuyen: rules.tuLuyen }, null, 1) + '\n',
  );
  writeFileSync(
    join(root, 'content/kana-phat-am.json'),
    JSON.stringify({ version: 1, reviewStatus: sounds.reviewStatus, muc: sounds.muc, capAm: sounds.capAm }, null, 1) + '\n',
  );
  console.log(`build-content: content/kana-phat-am.json (${sounds.capAm.length} cặp âm)`);
  console.log(`build-content: content/kana-quy-tac.json (${rules.tuLuyen.length} từ luyện đọc)`);
  console.log(`build-content: content/kanji.json (${items.length} kanji), content/kana.json (${kana.items.length} kana)`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main();
