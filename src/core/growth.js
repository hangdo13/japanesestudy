// Các giá trị dẫn xuất dùng ở nhiều màn hình (AD-8). Toàn bộ là hàm thuần.

export const DEFAULT_KANJI_MOI = 5;
export const MIN_KANJI_MOI = 1;
export const MAX_KANJI_MOI = 10;

/** Kẹp một số nguyên vào khoảng [min, max]; giá trị không hợp lệ thì dùng mặc định. */
export function clampInt(value, min, max, fallback) {
  if (value == null || value === '' || typeof value === 'boolean') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Số kanji mới mỗi ngày theo cài đặt (1–10, mặc định 5). */
export function kanjiMoiLimit(settings = {}) {
  return clampInt(settings.kanjiMoiMoiNgay, MIN_KANJI_MOI, MAX_KANJI_MOI, DEFAULT_KANJI_MOI);
}

/**
 * Gói kanji mới của hôm nay.
 * @param {{settings?: object, kanji?: Record<string, {gioiThieu?: string}>}} data  dữ liệu progress
 * @param {{id: string}[]} allKanji  theo thứ tự bài học
 * @param {string} today  YYYY-MM-DD theo giờ trên máy
 */
export function newKanjiToday(data, allKanji, today) {
  const seen = (data && data.kanji) || {};
  const limit = kanjiMoiLimit((data && data.settings) || {});
  const introducedToday = allKanji.filter((k) => seen[k.id] && seen[k.id].gioiThieu === today).length;
  const notYet = allKanji.filter((k) => !(seen[k.id] && seen[k.id].gioiThieu));
  const slots = Math.max(0, limit - introducedToday);
  return {
    pack: notYet.slice(0, slots),
    introducedToday,
    limit,
    remainingTotal: notYet.length,
  };
}
