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

// --- Ngày thi (Story 2.5) ---

/** Ngày thi mặc định: JLPT tháng 7/2027, Chủ nhật đầu tháng 7. */
export const DEFAULT_EXAM_DAY = '2027-07-04';

const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const MIN_EXAM_YEAR = 2024;
export const MAX_EXAM_YEAR = 2100;

/** Ngày YYYY-MM-DD hợp lệ (đúng lịch, năm 2024–2100; vd. không có 2027-02-30, không nhận 0202 lúc đang gõ). */
export function isValidDay(s) {
  if (!isDay(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (y < MIN_EXAM_YEAR || y > MAX_EXAM_YEAR) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Ngày thi theo cài đặt (YYYY-MM-DD), mặc định 2027-07-04. */
export function examDay(settings = {}) {
  const s = settings && settings.ngayThi;
  return isValidDay(s) ? s : DEFAULT_EXAM_DAY;
}

/** Số ngày từ hôm nay (giờ trên máy) tới ngày thi; 0 là hôm nay thi, âm là đã qua. */
const validNow = (now) => (now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date());

export function daysUntilExam(settings, now = new Date()) {
  now = validNow(now);
  const [y, m, d] = examDay(settings).split('-').map(Number);
  const exam = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam - today) / 86400000);
}

/** Ngày bắt đầu nhắc đăng ký: mùng 1 của tháng cách tháng thi 4 tháng (thi 7 → nhắc từ 1/3; thi 12 → 1/8). */
export function registrationOpensDay(settings) {
  const [y, m] = examDay(settings).split('-').map(Number);
  const start = new Date(y, m - 1 - 4, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Đã đánh dấu đăng ký cho đúng kỳ thi đang đặt chưa (đổi ngày thi thì phải đánh dấu lại). */
export function isRegistered(settings = {}) {
  return !!settings && settings.daDangKyThi === examDay(settings);
}

/** Ngày hết khung đăng ký thường lệ: mùng 1 của tháng cách tháng thi 2 tháng (thi 7 → 1/5). */
export function registrationClosesDay(settings) {
  const [y, m] = examDay(settings).split('-').map(Number);
  const end = new Date(y, m - 1 - 2, 1);
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Có hiện nhắc đăng ký thi không: từ ngày nhắc tới trước ngày thi, khi chưa đánh dấu đã đăng ký kỳ này. */
export function registrationReminderDue(settings = {}, now = new Date()) {
  now = validNow(now);
  if (isRegistered(settings)) return false;
  if (daysUntilExam(settings, now) <= 0) return false;
  const [y, m, d] = registrationOpensDay(settings).split('-').map(Number);
  return now.getTime() >= new Date(y, m - 1, d).getTime();
}

/** "04/07/2027" từ "2027-07-04". */
export function formatDay(day) {
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}`;
}
