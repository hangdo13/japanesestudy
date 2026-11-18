// Ôn từ vựng (Story 2.2). Hàm thuần.
import { isValidCard } from './srs.js';
import { tuMoiLimit } from './growth.js';

export const VOCAB_PREFIX = 'vocab:';
export const MAX_REVIEW = 20;

/** Từ theo thứ tự học: chủ đề theo lộ trình, rồi theo id. */
export function learningOrder(words) {
  return [...words].sort((a, b) => a.chuDeThuTu - b.chuDeThuTu || a.id.localeCompare(b.id));
}

/** Id các từ có thẻ đến hạn (từ có trong nội dung), sớm nhất trước. Thẻ hỏng coi như đến hạn. */
export function dueVocab(data, known, now = new Date()) {
  const t = now.getTime();
  const at = (c) => (isValidCard(c) ? Date.parse(c.dueAt) : -Infinity);
  return Object.entries((data && data.srs) || {})
    .filter(([k, c]) => k.startsWith(VOCAB_PREFIX) && (!known || known.has(k.slice(VOCAB_PREFIX.length))) && at(c) <= t)
    .sort((a, b) => at(a[1]) - at(b[1]) || a[0].localeCompare(b[0]))
    .map(([k]) => k.slice(VOCAB_PREFIX.length));
}

/**
 * Từ mới hôm nay: các từ chưa giới thiệu, theo thứ tự học, trong phần hạn mức còn lại.
 * @param {string} today YYYY-MM-DD theo giờ trên máy
 */
export function newVocabToday(data, words, today) {
  const seen = (data && data.tuVung) || {};
  const srs = (data && data.srs) || {};
  const limit = tuMoiLimit((data && data.settings) || {});
  const introducedToday = Object.values(seen).filter((s) => s && s.gioiThieu === today).length;
  // từ đã có thẻ cũng coi như đã học (dữ liệu nhập từ bản sao lưu cũ)
  const notYet = learningOrder(words).filter((w) => !(seen[w.id] && seen[w.id].gioiThieu) && !srs[VOCAB_PREFIX + w.id]);
  const slots = Math.max(0, limit - introducedToday);
  return { pack: notYet.slice(0, slots), introducedToday, remainingTotal: notYet.length, limit };
}

/** Thời điểm thẻ từ vựng sớm nhất trong tương lai, hoặc null. */
export function nextVocabDue(data, known, now = new Date()) {
  let best = null;
  for (const [k, c] of Object.entries((data && data.srs) || {})) {
    if (!k.startsWith(VOCAB_PREFIX) || (known && !known.has(k.slice(VOCAB_PREFIX.length))) || !isValidCard(c)) continue;
    const t = Date.parse(c.dueAt);
    if (t > now.getTime() && (best == null || t < best)) best = t;
  }
  return best == null ? null : new Date(best);
}

/** Văn bản để đọc: bỏ dấu ～ (～えん → えん). */
export function speakText(w) {
  return String(w.doc || '').replace(/[～~]/g, '');
}

/** Có nên đọc từ này không: phụ tố như お～, ～個 chỉ còn một chữ kana, máy đọc dễ thành tên chữ cái. */
export function canSpeakWord(w) {
  return [...speakText(w)].length >= 2;
}
