// Đồng hồ học duy nhất (AD-5). Tính năng chỉ gọi activity(); đồng hồ tự đếm, dừng khi rảnh, ghi theo ngày.
import { progress as defaultProgress, localDate } from './progress.js';

export const IDLE_MS = 60_000;
export const FLUSH_MS = 15_000;

/** Nửa đêm kế tiếp (giờ trên máy) sau thời điểm t (ms). */
function nextMidnight(t) {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

/**
 * Chia đoạn [from, to) (ms) thành số giây theo ngày YYYY-MM-DD giờ trên máy. Hàm thuần.
 * @returns {Record<string, number>}  số giây (có thể lẻ) theo ngày
 */
export function splitByDay(from, to) {
  const out = {};
  let a = from;
  while (a < to) {
    const b = Math.min(to, nextMidnight(a));
    const key = localDate(new Date(a));
    out[key] = (out[key] || 0) + (b - a) / 1000;
    a = b;
  }
  return out;
}

/**
 * @param {object} [opts]
 * @param {{ get: Function, update: Function }} [opts.progress]
 * @param {() => number} [opts.now]  ms
 * @param {Function} [opts.setInterval] @param {Function} [opts.clearInterval]
 * @param {Document} [opts.doc]  để nghe visibilitychange
 */
let singleton = null;

export function createStudyClock(opts = {}) {
  const store = opts.progress || defaultProgress();
  const now = opts.now || (() => Date.now());
  const setI = opts.setInterval || ((f, ms) => setInterval(f, ms));
  const clearI = opts.clearInterval || ((id) => clearInterval(id));
  const doc = opts.doc === undefined ? globalThis.document : opts.doc;
  const win = opts.win === undefined ? globalThis.window : opts.win;

  let running = false;
  let committedAt = 0; // đã ghi tới thời điểm này (ms)
  let lastActivity = 0;
  let pending = {}; // giây chưa ghi được (ghi lỗi), theo ngày
  let timer = null;

  /** Cộng giây vào hàng chờ rồi ghi phần nguyên. `round`: làm tròn phần lẻ (khi kết thúc đợt) để không mất dần. */
  const write = (secsByDay, round = false) => {
    for (const [k, v] of Object.entries(secsByDay)) pending[k] = (pending[k] || 0) + v;
    const take = (v) => (round ? Math.round(v) : Math.floor(v));
    const whole = Object.fromEntries(Object.entries(pending).filter(([, v]) => take(v) >= 1).map(([k, v]) => [k, take(v)]));
    if (round) for (const k of Object.keys(pending)) if (take(pending[k]) < 1) delete pending[k];
    if (!Object.keys(whole).length) return;
    const res = store.update((d) => {
      for (const [k, v] of Object.entries(whole)) d.hocGiay[k] = (Number(d.hocGiay[k]) || 0) + v;
    });
    // chỉ coi là lỗi khi store báo rõ ok:false; lỗi thì giữ tất cả để lần sau ghi lại
    if (!(res && res.ok === false)) for (const [k, v] of Object.entries(whole)) {
      pending[k] -= v;
      if (pending[k] <= 0) delete pending[k];
    }
  };

  /** Ghi phần đã đếm tới `until` (không vượt quá lần tương tác cuối + rảnh). */
  const commit = (until, round = false) => {
    if (until > committedAt) {
      write(splitByDay(committedAt, until), round);
      committedAt = until;
    } else write({}, round); // vẫn thử ghi lại phần còn treo (lần trước ghi lỗi)
  };

  const stop = (until) => {
    if (!running) return;
    commit(until, true);
    running = false;
    if (timer != null) clearI(timer);
    timer = null;
  };

  const tick = () => {
    if (!running) return;
    const t = now();
    // quá 60 giây không tương tác: kết thúc đợt, chỉ tính tới lần tương tác cuối
    if (t - lastActivity > IDLE_MS) stop(lastActivity);
    else commit(lastActivity);
  };

  // ẩn app / rời trang: kết thúc đợt, tính tới lúc ẩn nếu chưa quá 60 giây kể từ tương tác cuối
  const leave = () => {
    if (!running) return;
    const t = now();
    stop(t >= lastActivity && t - lastActivity <= IDLE_MS ? t : lastActivity);
  };
  const onVisibility = () => {
    if (doc && doc.visibilityState === 'hidden') leave();
  };
  if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('visibilitychange', onVisibility);
  if (win && typeof win.addEventListener === 'function') win.addEventListener('pagehide', leave);

  const api = {
    /** Gọi khi có tương tác học: lật thẻ, vuốt, chọn đáp án, phát âm. */
    activity() {
      const t = now();
      // máy ngủ làm bộ đếm không chạy: lần tương tác sau quá 60 giây vẫn là đợt mới
      if (running && t - lastActivity > IDLE_MS) stop(lastActivity);
      // đồng hồ máy bị chỉnh lùi: bỏ đợt cũ (đã ghi tới lần tương tác cuối), bắt đầu lại
      if (running && t < lastActivity) stop(lastActivity);
      if (!running) {
        running = true;
        committedAt = t;
        timer = setI(tick, FLUSH_MS);
      }
      lastActivity = t;
    },
    /** Ghi ngay phần đã đếm (tới lần tương tác cuối). */
    flush() {
      if (running) commit(lastActivity);
      else write({});
    },
    isRunning: () => running,
    dispose() {
      stop(lastActivity);
      if (doc && typeof doc.removeEventListener === 'function') doc.removeEventListener('visibilitychange', onVisibility);
      if (win && typeof win.removeEventListener === 'function') win.removeEventListener('pagehide', leave);
      if (singleton === api) singleton = null;
    },
  };
  return api;
}

/** Đồng hồ dùng chung của app. */
export function studyClock() {
  if (!singleton) singleton = createStudyClock();
  return singleton;
}

/** Số phút đã học trong ngày (làm tròn xuống). */
export function minutesOn(data, day) {
  return Math.floor((Number(data && data.hocGiay && data.hocGiay[day]) || 0) / 60);
}
