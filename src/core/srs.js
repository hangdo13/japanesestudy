// Lịch ôn duy nhất của Kotoba (AD-6): lớp bọc quanh ts-fsrs.
// Thẻ lưu trong progress.srs[<loại>:<id>] dạng JSON; ngày giờ là chuỗi ISO.
import { DefaultScheduler, Rating } from 'ts-fsrs';

let schedulerPromise = null;

/** Bộ lập lịch FSRS dùng chung (tạo một lần, bất đồng bộ). */
export function getScheduler() {
  if (!schedulerPromise) schedulerPromise = DefaultScheduler({ enableFuzz: false });
  return schedulerPromise;
}

const DATE_FIELDS = ['dueAt', 'lastReviewAt'];

/** JSON đã lưu → thẻ ts-fsrs (đổi chuỗi ngày về Date). */
export function isValidCard(stored) {
  return !!stored && typeof stored === 'object' && Number.isFinite(Date.parse(stored.dueAt));
}

export function fromStored(stored) {
  const card = { ...stored };
  for (const f of DATE_FIELDS) {
    if (card[f] != null) card[f] = new Date(card[f]);
  }
  return card;
}

/** Thẻ ts-fsrs → JSON để lưu. */
export function toStored(card) {
  const out = { ...card };
  for (const f of DATE_FIELDS) {
    if (out[f] instanceof Date) out[f] = out[f].toISOString();
  }
  return out;
}

/**
 * Chấm một lần ôn. `stored` rỗng thì tạo thẻ mới.
 * @returns {Promise<object>} thẻ mới dạng JSON để lưu
 */
export async function reviewCard(stored, correct, now = new Date()) {
  const s = await getScheduler();
  // thẻ hỏng (dueAt không đọc được) thì làm lại từ đầu thay vì kẹt mãi
  const card = isValidCard(stored) ? fromStored(stored) : s.newCard({ now });
  const { card: next } = s.review({ card, grade: correct ? Rating.Good : Rating.Again, now });
  return toStored(next);
}

/** Tạo thẻ mới (chưa ôn lần nào), đến hạn ngay. */
export async function newCard(now = new Date()) {
  const s = await getScheduler();
  return toStored(s.newCard({ now }));
}

/** Các mã thẻ có tiền tố `prefix` (vd. 'kana:') đã đến hạn, sớm nhất trước. */
export function dueIds(srs = {}, prefix = '', now = new Date()) {
  const t = now.getTime();
  // thẻ hỏng coi như đến hạn ngay (ôn lại sẽ sửa nó)
  const at = (c) => (isValidCard(c) ? Date.parse(c.dueAt) : -Infinity);
  return Object.entries(srs || {})
    .filter(([id, c]) => id.startsWith(prefix) && at(c) <= t)
    .sort((a, b) => at(a[1]) - at(b[1]))
    .map(([id]) => id);
}
