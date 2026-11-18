// Kho tiến độ duy nhất của Kotoba (AD-4).
// Chỉ file này được dùng localStorage. Mọi tính năng đọc/ghi qua API ở đây.

export const STORAGE_KEY = 'kotoba:v1';
/** Tiền tố khoá giữ bản dữ liệu hỏng (kèm thời điểm, không ghi đè bản cũ). */
export const CORRUPT_KEY = 'kotoba:v1:hong';
export const CURRENT_VERSION = 1;
export const CHANGED_EVENT = 'progress:changed';

/**
 * Hàm chuyển đổi theo phiên bản: MIGRATIONS[n] nhận dữ liệu bản n và trả dữ liệu bản n + 1.
 * Khi tăng CURRENT_VERSION, thêm một mục ở đây.
 */
export const MIGRATIONS = {};

const LOI_BAN_MOI =
  'Tiến độ trên máy được lưu bởi phiên bản Kotoba mới hơn. Hãy tải lại trang để cập nhật app; Kotoba sẽ không ghi đè dữ liệu này.';
const LOI_GIU_BAN_HONG =
  'Dữ liệu tiến độ bị hỏng và không giữ lại được bản sao. Kotoba tạm ngừng ghi để không mất dữ liệu cũ; hãy nhập file sao lưu.';
const LOI_LUU =
  'Không lưu được tiến độ trên máy. Có thể bộ nhớ trình duyệt đã đầy hoặc đang ở chế độ riêng tư. Hãy xuất sao lưu ngay để không mất dữ liệu.';

export function emptyData(nowIso) {
  return {
    schemaVersion: CURRENT_VERSION,
    createdAt: nowIso,
    lastBackupAt: null,
    settings: {},
    kanji: {},
    srs: {},
    tuVung: {},
  };
}

const clone = (v) => JSON.parse(JSON.stringify(v));
const isPlainObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v);

export class NewerVersionError extends Error {}

/** Kiểm tra hình dạng dữ liệu bản hiện tại; điền phần thiếu, ném lỗi nếu sai kiểu. */
export function normalize(d) {
  const out = { ...d };
  for (const key of ['settings', 'kanji', 'srs', 'tuVung']) {
    if (out[key] === undefined) out[key] = {};
    else if (!isPlainObject(out[key])) throw new Error(`File sao lưu không hợp lệ: "${key}" sai kiểu dữ liệu.`);
  }
  if (out.lastBackupAt === undefined) out.lastBackupAt = null;
  if (out.lastBackupAt !== null && typeof out.lastBackupAt !== 'string') {
    throw new Error('File sao lưu không hợp lệ: "lastBackupAt" sai kiểu dữ liệu.');
  }
  return out;
}

/** Chạy chuyển đổi tới bản hiện tại. Ném lỗi tiếng Việt nếu không chuyển được. */
export function migrate(data, migrations = MIGRATIONS, current = CURRENT_VERSION) {
  if (!isPlainObject(data) || !Number.isInteger(data.schemaVersion) || data.schemaVersion < 1) {
    throw new Error('File sao lưu không hợp lệ: thiếu số phiên bản dữ liệu.');
  }
  if (data.schemaVersion > current) {
    throw new NewerVersionError('File sao lưu được tạo bởi phiên bản Kotoba mới hơn. Hãy cập nhật app rồi nhập lại.');
  }
  let d = clone(data);
  while (d.schemaVersion < current) {
    const step = migrations[d.schemaVersion];
    if (typeof step !== 'function') {
      throw new Error(`Không chuyển đổi được dữ liệu từ phiên bản ${d.schemaVersion}.`);
    }
    const next = step(d);
    if (!isPlainObject(next) || next.schemaVersion !== d.schemaVersion + 1) {
      throw new Error(`Hàm chuyển đổi phiên bản ${d.schemaVersion} trả kết quả sai.`);
    }
    d = next;
  }
  return normalize(d);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/** Ngày theo giờ trên máy, dạng YYYY-MM-DD. */
export function localDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * @param {object} [opts]
 * @param {Storage|null} [opts.storage]  mặc định window.localStorage (null nếu bị chặn)
 * @param {() => Date} [opts.now]
 * @param {EventTarget} [opts.events]  nơi phát progress:changed (mặc định window)
 */
export function createProgress({ storage, now = () => new Date(), events } = {}) {
  const target = events ?? (typeof window !== 'undefined' ? window : null);
  let store = storage;
  if (store === undefined) {
    try {
      store = typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      store = null;
    }
  }

  let recoveredFromCorrupt = false;
  let writeBlocked = null; // lý do tạm ngừng ghi để bảo vệ dữ liệu cũ
  let data = load();

  function load() {
    let raw = null;
    try {
      raw = store ? store.getItem(STORAGE_KEY) : null;
    } catch {
      raw = null;
    }
    if (raw == null) return emptyData(now().toISOString());
    try {
      return migrate(JSON.parse(raw));
    } catch (err) {
      if (err instanceof NewerVersionError) {
        // không coi là hỏng, không ghi đè
        writeBlocked = LOI_BAN_MOI;
        return emptyData(now().toISOString());
      }
      recoveredFromCorrupt = true;
      try {
        store.setItem(`${CORRUPT_KEY}:${now().toISOString()}`, raw);
      } catch {
        writeBlocked = LOI_GIU_BAN_HONG;
      }
      return emptyData(now().toISOString());
    }
  }

  function persist(next) {
    if (writeBlocked) return { ok: false, error: writeBlocked };
    if (!store) return { ok: false, error: LOI_LUU };
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(next));
      return { ok: true };
    } catch {
      return { ok: false, error: LOI_LUU };
    }
  }

  function commit(next) {
    const res = persist(next);
    if (!res.ok) return res;
    data = next;
    if (target && typeof target.dispatchEvent === 'function') {
      target.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: clone(data) }));
    }
    return res;
  }

  const api = {
    get recoveredFromCorrupt() {
      return recoveredFromCorrupt;
    },
    /** Lý do đang tạm ngừng ghi (dữ liệu bản mới hơn, hoặc không giữ được bản hỏng), hoặc null. */
    get writeBlocked() {
      return writeBlocked;
    },
    /** Bản sao dữ liệu hiện tại (sửa bản sao không ảnh hưởng kho). */
    get() {
      return clone(data);
    },
    /** Sửa dữ liệu qua hàm `fn(bản nháp)`. Trả { ok, error? }. */
    update(fn) {
      const draft = clone(data);
      let out;
      try {
        out = fn(draft);
      } catch (err) {
        return { ok: false, error: `Không cập nhật được tiến độ: ${err && err.message ? err.message : err}` };
      }
      const next = out === undefined ? draft : out;
      if (!isPlainObject(next)) return { ok: false, error: 'Không cập nhật được tiến độ: dữ liệu mới không hợp lệ.' };
      return commit(next);
    },
    /** Chuỗi JSON để sao lưu. `overrides` ghi đè vài trường trong bản xuất (vd. lastBackupAt). */
    exportJson(overrides = {}) {
      return JSON.stringify({ ...data, ...overrides }, null, 2);
    },
    backupFileName(date = now()) {
      return `kotoba-sao-luu-${localDate(date)}.json`;
    },
    /** Ghi lại thời điểm sao lưu gần nhất. */
    markBackup(at = now()) {
      return api.update((d) => {
        d.lastBackupAt = at.toISOString();
      });
    },
    /** Kiểm tra file sao lưu mà chưa ghi. Trả { ok, data?, error? }. */
    parseBackup(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, error: 'File sao lưu không hợp lệ: không đọc được nội dung JSON.' };
      }
      try {
        return { ok: true, data: migrate(parsed) };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    /** Thay toàn bộ dữ liệu bằng file sao lưu. Lỗi thì giữ nguyên dữ liệu cũ. */
    importJson(text) {
      const parsed = api.parseBackup(text);
      if (!parsed.ok) return parsed;
      return commit(parsed.data);
    },
  };
  return api;
}

/** Xin trình duyệt giữ dữ liệu lâu dài (không bị dọn khi thiếu chỗ). Không bắt buộc thành công. */
export function requestPersistentStorage(nav = typeof navigator !== 'undefined' ? navigator : null) {
  try {
    if (nav && nav.storage && typeof nav.storage.persist === 'function') {
      return Promise.resolve(nav.storage.persist()).catch(() => false);
    }
  } catch {
    /* bỏ qua */
  }
  return Promise.resolve(false);
}

let defaultInstance = null;

/** Kho tiến độ dùng chung của app. */
export function progress() {
  if (!defaultInstance) defaultInstance = createProgress();
  return defaultInstance;
}

/** Chỉ dùng trong test. */
export function _resetDefaultProgress() {
  defaultInstance = null;
}
