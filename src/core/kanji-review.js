// Thẻ ôn kanji 3 chiều (Story 2.1). Hàm thuần trừ chỗ có ghi chú.
import { newCard, isValidCard } from './srs.js';
import { shuffle } from './kana-quiz.js';

export const KANJI_KINDS = ['kanji-nghia', 'kanji-doc', 'kanji-chu'];
export const MAX_PER_SESSION = 20;

/** Tách khoá thẻ 'kanji-doc:日' → { kind: 'kanji-doc', id: '日' }, hoặc null nếu không phải thẻ kanji. */
export function parseKey(key) {
  const i = String(key).indexOf(':');
  if (i < 0) return null;
  const kind = key.slice(0, i);
  return KANJI_KINDS.includes(kind) ? { kind, id: key.slice(i + 1) } : null;
}

/** Khoá các thẻ còn thiếu của những kanji đã giới thiệu (có trong nội dung). */
export function missingKanjiCards(data, known) {
  const out = [];
  const srs = (data && data.srs) || {};
  for (const [id, st] of Object.entries((data && data.kanji) || {})) {
    if (!st || !st.gioiThieu || (known && !known.has(id))) continue;
    for (const kind of KANJI_KINDS) if (!srs[`${kind}:${id}`]) out.push(`${kind}:${id}`);
  }
  return out;
}

/**
 * Tạo thẻ còn thiếu và ghi vào progress (bất đồng bộ vì scheduler ts-fsrs nạp lười).
 * @returns {Promise<{ ok: boolean, created: number, error?: string }>}
 */
export async function ensureKanjiCards(store, known, now = new Date()) {
  const keys = missingKanjiCards(store.get(), known);
  if (!keys.length) return { ok: true, created: 0 };
  const card = await newCard(now);
  const DAY = 86400000;
  const res = store.update((d) => {
    for (const k of keys) {
      if (d.srs[k]) continue;
      // giãn ba thẻ của một chữ: nghĩa hôm nay, đọc +1 ngày, chữ +2 ngày, để thẻ này không lộ đáp án thẻ kia
      const offset = KANJI_KINDS.indexOf(k.slice(0, k.indexOf(':'))) * DAY;
      d.srs[k] = { ...card, dueAt: new Date(now.getTime() + offset).toISOString() };
    }
  });
  return res.ok ? { ok: true, created: keys.length } : { ok: false, created: 0, error: res.error };
}

/** Thẻ kanji đến hạn (kanji có trong nội dung), sớm nhất trước. Thẻ hỏng coi như đến hạn. */
export function dueKanjiCards(data, known, now = new Date()) {
  const t = now.getTime();
  const at = (c) => (isValidCard(c) ? Date.parse(c.dueAt) : -Infinity);
  return Object.entries((data && data.srs) || {})
    .map(([key, c]) => ({ key, card: c, p: parseKey(key) }))
    .filter((x) => x.p && (!known || known.has(x.p.id)) && at(x.card) <= t)
    .sort((a, b) => at(a.card) - at(b.card) || a.key.localeCompare(b.key))
    .map((x) => ({ key: x.key, kind: x.p.kind, id: x.p.id }));
}

/** Mỗi chữ tối đa một thẻ trong một phiên (thẻ anh em để phiên sau), giữ thứ tự. */
export function onePerKanji(steps) {
  const seen = new Set();
  return steps.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}

/** Thời điểm thẻ kanji đến hạn sớm nhất trong tương lai, hoặc null. */
export function nextKanjiDue(data, known, now = new Date()) {
  let best = null;
  for (const [key, c] of Object.entries((data && data.srs) || {})) {
    const p = parseKey(key);
    if (!p || (known && !known.has(p.id)) || !isValidCard(c)) continue;
    const t = Date.parse(c.dueAt);
    if (t > now.getTime() && (best == null || t < best)) best = t;
  }
  return best == null ? null : new Date(best);
}

/** Katakana → hiragana, bỏ dấu tách okurigana (. -), để so cách đọc khác bảng chữ. */
export function normKana(s) {
  return String(s || '')
    .replace(/[.\-]/g, '')
    .replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/**
 * Nội dung thẻ đọc. Âm kun trong dữ liệu chỉ là gốc (食 → た), hỏi gốc không có ích,
 * nên hỏi cách đọc của từ ví dụ đầu tiên (食べる → たべる), giống phần đọc kanji của đề JLPT.
 * Chữ không có từ ví dụ thì hỏi âm on đầu tiên.
 * @returns {{ word: string, reading: string, nghia?: string, kind: 'tu'|'on' } | null}
 */
export function readingTarget(k) {
  const v = k.viDu && k.viDu[0];
  if (v && v.tu && v.doc) return { word: v.tu, reading: v.doc, nghia: v.nghia, kind: 'tu' };
  const on = k.on && k.on[0];
  return on ? { word: k.id, reading: on.kana, kind: 'on' } : null;
}

/** Cách đọc đúng của thẻ đọc (xem readingTarget). */
export function readingOf(k) {
  const t = readingTarget(k);
  return t ? t.reading : null;
}

/** Mọi cách đọc "cũng đúng" của k: âm on/kun và cách đọc các từ ví dụ, đã chuẩn hoá. */
function allReadings(k) {
  return new Set(
    [...(k.kun || []), ...(k.on || [])].map((r) => normKana(r.kana)).concat((k.viDu || []).map((v) => normKana(v.doc))),
  );
}

/**
 * Câu trắc nghiệm cho thẻ đọc (`kanji-doc`) hoặc thẻ chữ (`kanji-chu`).
 * @param {'kanji-doc'|'kanji-chu'} kind
 * @param {object} k  kanji đang hỏi
 * @param {object[]} all  toàn bộ kanji (nguồn đáp án sai)
 * @returns {{ options: string[], answer: number } | null}  null nếu không đủ đáp án
 */
export function buildKanjiQuestion(kind, k, all, rng = Math.random) {
  if (kind === 'kanji-doc') {
    const target = readingTarget(k);
    if (!target) return null;
    const right = target.reading;
    const mine = allReadings(k);
    // đáp án sai cùng dạng với đáp án đúng: cách đọc từ (hiragana) hoặc âm on (katakana)
    const pool = shuffle(
      all.filter((x) => x.id !== k.id),
      rng,
    )
      .map((x) => (target.kind === 'tu' ? x.viDu && x.viDu[0] && x.viDu[0].doc : x.on && x.on[0] && x.on[0].kana))
      .filter(Boolean);
    const wrong = [];
    for (const r of pool) {
      if (wrong.length === 3) break;
      // bỏ đáp án trùng một cách đọc khác của chính chữ này (vd. 女: め): đề sẽ có hai đáp án đúng
      if (!mine.has(normKana(r)) && !wrong.some((w) => normKana(w) === normKana(r))) wrong.push(r);
    }
    if (wrong.length < 3) return null;
    const options = shuffle([right, ...wrong], rng);
    return { options, answer: options.indexOf(right), word: target.word, nghia: target.nghia };
  }
  if (kind === 'kanji-chu') {
    const byId = new Map(all.map((x) => [x.id, x]));
    const near = shuffle(k.deNham || [], rng)
      .map((id) => byId.get(id))
      .filter(Boolean);
    const rest = shuffle(
      all.filter((x) => x.id !== k.id),
      rng,
    );
    const wrong = [];
    for (const x of [...near, ...rest]) {
      if (wrong.length === 3) break;
      // không lấy chữ trùng nghĩa/Hán Việt: đề sẽ có hai đáp án đúng
      if (x.id !== k.id && !wrong.includes(x.id) && x.hanViet !== k.hanViet && x.nghia !== k.nghia) wrong.push(x.id);
    }
    if (wrong.length < 3) return null;
    const options = shuffle([k.id, ...wrong], rng);
    return { options, answer: options.indexOf(k.id) };
  }
  return null;
}
