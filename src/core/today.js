// Việc hôm nay và số liệu trang chủ (Story 2.4). Giá trị dẫn xuất, hàm thuần (AD-8).
// Tách khỏi growth.js vì vocab-review đã import growth (tránh import vòng).
import { localDate } from './progress.js';
import { missingKanjiCards, kanjiSessionSteps, MAX_PER_SESSION, KANJI_KINDS } from './kanji-review.js';
import { minutesOn } from './study-clock.js';
import { dueVocab, newVocabToday, isLearned, MAX_REVIEW, VOCAB_PREFIX } from './vocab-review.js';
import { newKanjiToday } from './growth.js';

/** Số giây học thực tối thiểu để một ngày được tính là ngày học. */
export const MIN_STUDY_SECONDS = 60;
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Việc hôm nay.
 * @param {object} data  progress
 * @param {{ kanji: object[], vocab: object[], now: Date, canShow?: (kind: string) => boolean }} ctx
 * @returns {{ kanjiDue: number, vocabDue: number, kanjiMoi: number, tuMoi: number, cards: number, total: number }}
 */
export function dueToday(data, { kanji, vocab, now, canShow = () => true }) {
  const kKnown = new Set(kanji.map((k) => k.id));
  const vKnown = new Set(vocab.map((w) => w.id));
  const today = localDate(now);
  // thẻ kanji: đúng các bước màn ôn sẽ hiện (mỗi chữ một thẻ, bỏ thẻ không dựng được câu);
  // chữ đã học mà chưa có thẻ sẽ có thẻ nghĩa đến hạn ngay khi mở màn ôn
  const dueIds = new Set(kanjiSessionSteps(data, kanji, now, { canShow }).map((s) => s.id));
  if (canShow('kanji'))
    for (const key of missingKanjiCards(data, kKnown)) if (key.startsWith('kanji-nghia:')) dueIds.add(key.slice('kanji-nghia:'.length));
  const kanjiDue = Math.min(dueIds.size, MAX_PER_SESSION);
  const vocabOk = canShow('vocab');
  const vocabDue = vocabOk ? Math.min(dueVocab(data, vKnown, now).length, MAX_REVIEW) : 0;
  const kanjiMoi = newKanjiToday(data, kanji, today).pack.length;
  const tuMoi = vocabOk ? newVocabToday(data, vocab, today).pack.length : 0;
  const cards = kanjiDue + vocabDue;
  return { kanjiDue, vocabDue, kanjiMoi, tuMoi, cards, total: cards + kanjiMoi + tuMoi };
}

/** Việc kế tiếp theo thứ tự ôn kanji → ôn từ vựng (gồm từ mới) → kanji mới. Trả [route, param] hoặc null. */
export function nextTask(due) {
  if (due.kanjiDue > 0) return ['on-tap', 'kanji'];
  if (due.vocabDue + due.tuMoi > 0) return ['on-tap', 'tu-vung'];
  if (due.kanjiMoi > 0) return ['kanji', 'hoc-moi'];
  return null;
}

/** Dòng tóm tắt "12 thẻ cần ôn · 3 kanji mới · 10 từ mới", hoặc '' nếu xong. */
export function summarize(due) {
  return [
    due.cards ? `${due.cards} thẻ cần ôn` : '',
    due.kanjiMoi ? `${due.kanjiMoi} kanji mới` : '',
    due.tuMoi ? `${due.tuMoi} từ mới` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

// ngày học: ít nhất 1 phút học thực (đọc qua đồng hồ học, AD-5)
const studied = (data, day) => minutesOn(data, day) * 60 >= MIN_STUDY_SECONDS;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * Chuỗi ngày học, "dễ tha thứ": được nghỉ 1 ngày trong mỗi 7 ngày mà không mất chuỗi.
 * Hôm nay chưa học thì chưa tính hôm nay và cũng không làm mất chuỗi.
 * @returns {{ days: number, freezeUsed: boolean }}
 */
export function studyStreak(data, now) {
  const todayDone = studied(data, localDate(now));
  let d = todayDone ? now : addDays(now, -1);
  let days = 0;
  let lastFreeze = -Infinity; // chỉ số ngày (đếm lùi) đã dùng ngày nghỉ
  let freezeUsed = false;
  for (let i = 0; i < 3660; i++, d = addDays(d, -1)) {
    if (studied(data, localDate(d))) {
      days += 1;
      continue;
    }
    // ngày nghỉ được tha nếu 6 ngày gần đó chưa tha ngày nào và hôm trước nữa có học
    // (hôm nay chưa học thì hôm qua nghỉ cũng được tha: chuỗi không về 0 trước khi kịp học)
    if ((days > 0 || (i === 0 && !todayDone)) && i - lastFreeze >= 7 && studied(data, localDate(addDays(d, -1)))) {
      lastFreeze = i;
      freezeUsed = true;
      continue;
    }
    break;
  }
  return { days, freezeUsed };
}

/** Bảy ngày tuần này (T2–CN) cho StreakTracker. */
export function weekDays(data, now) {
  const dow = (now.getDay() + 6) % 7; // T2 = 0
  const monday = addDays(now, -dow);
  return DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    const day = localDate(date);
    return { label, day, done: studied(data, day), today: i === dow, future: i > dow };
  });
}

/** Số kanji đã học (giới thiệu), kanji đã thuộc (3 thẻ đều ở trạng thái ôn), từ vựng đã thuộc. */
export function learnedCounts(data, { kanji, vocab }) {
  const srs = (data && data.srs) || {};
  const REVIEW = 2; // ts-fsrs State.Review
  const hoc = kanji.filter((k) => data.kanji && data.kanji[k.id] && data.kanji[k.id].gioiThieu).length;
  const thuoc = kanji.filter((k) => KANJI_KINDS.every((kind) => srs[`${kind}:${k.id}`] && srs[`${kind}:${k.id}`].state === REVIEW)).length;
  const tuThuoc = vocab.filter((w) => srs[VOCAB_PREFIX + w.id] && srs[VOCAB_PREFIX + w.id].state === REVIEW).length;
  const tuHoc = vocab.filter((w) => isLearned(data, w.id)).length;
  return { kanjiHoc: hoc, kanjiThuoc: thuoc, kanjiTong: kanji.length, tuHoc, tuThuoc, tuTong: vocab.length };
}

/**
 * Sau khi xong một phần: còn việc thì { label: 'Việc tiếp theo', hash: '#/hoc-ngay' }, hết thì về trang chủ.
 * @param {(route: string, param?: string) => string} toHash
 */
export function afterSession(data, ctx, toHash) {
  return nextTask(dueToday(data, ctx)) ? { label: 'Việc tiếp theo', hash: toHash('hoc-ngay') } : { label: 'Về trang chủ', hash: toHash('') };
}
