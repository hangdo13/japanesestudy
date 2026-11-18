// Các giá trị dẫn xuất dùng ở nhiều màn hình (AD-8). Toàn bộ là hàm thuần.

export const DEFAULT_KANJI_MOI = 5;
export const MIN_KANJI_MOI = 1;
export const MAX_KANJI_MOI = 10;
export const DEFAULT_TU_MOI = 10;
export const TU_MOI_CHOICES = [5, 10, 15, 20, 30];

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

export const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;

const toTime = (iso) => {
  const t = typeof iso === 'string' && iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

/**
 * Đã đến lúc nhắc sao lưu chưa: lần sao lưu gần nhất cách đây ≥ 7 ngày,
 * hoặc chưa sao lưu lần nào và đã dùng app ≥ 7 ngày.
 */
export function backupDue(data, now) {
  const t = now.getTime();
  const last = toTime(data && data.lastBackupAt);
  // mốc ở tương lai (đồng hồ máy bị chỉnh lùi) thì coi như cần sao lưu
  if (last != null) return last > t || t - last >= DAYS_7_MS;
  const created = toTime(data && data.createdAt);
  // không biết bắt đầu dùng từ bao giờ thì nhắc luôn cho an toàn
  if (created == null) return true;
  return t - created >= DAYS_7_MS;
}

/** Có nên hiện hướng dẫn thêm vào màn hình chính không. */
export function shouldShowInstallGuide({ isIos, isStandalone, dismissedAt, now }) {
  if (!isIos || isStandalone) return false;
  const d = toTime(dismissedAt);
  return d == null || d > now.getTime() || now.getTime() - d >= DAYS_7_MS;
}

/** Số từ vựng mới mỗi ngày theo cài đặt (một trong TU_MOI_CHOICES, mặc định 10). */
export function tuMoiLimit(settings = {}) {
  const n = Number(settings && settings.tuMoiMoiNgay);
  return TU_MOI_CHOICES.includes(n) ? n : DEFAULT_TU_MOI;
}

/** Có tự đọc từ khi lật thẻ không (mặc định có). */
export function autoSpeakOnFlip(settings = {}) {
  return !(settings && settings.tuDocKhiLat === false);
}
