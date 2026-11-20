import './cai-dat.css';
import { progress as defaultProgress, CHANGED_EVENT } from '../../core/progress.js';
import { kanjiMoiLimit, MIN_KANJI_MOI, MAX_KANJI_MOI, tuMoiLimit, TU_MOI_CHOICES, autoSpeakOnFlip, examDay, isValidDay, isRegistered, formatDay, DEFAULT_EXAM_DAY } from '../../core/growth.js';
import { localDate } from '../../core/progress.js';
import { toHash } from '../../core/router.js';
import { confirmDialog as defaultConfirm } from '../../ui/confirm-dialog.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Tải một chuỗi về máy thành file. */
export function downloadText(fileName, text, doc = document) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  doc.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Đọc nội dung file người dùng chọn. */
function readFile(file) {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

export function mount(root, _params, deps = {}) {
  const store = deps.progress || defaultProgress();
  const confirm = deps.confirm || defaultConfirm;
  const download = deps.download || downloadText;

  const wrap = el('div', 'kt-stack');
  let pending = null;
  let unmounted = false;

  // --- Sao lưu ---
  const card = el('section', 'kt-card kt-stack');
  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, 'Sao lưu tiến độ'));
  const intro = el(
    'p',
    'kt-muted cai-dat__text',
    'Tiến độ chỉ lưu trên trình duyệt của máy này. Hãy xuất file sao lưu mỗi tuần và cất vào Tệp hoặc iCloud.',
  );
  const last = el('p', 'cai-dat__text');
  const status = el('p', 'kt-muted cai-dat__text');
  status.setAttribute('role', 'status');

  const renderLast = () => {
    const iso = store.get().lastBackupAt;
    const date = iso && formatDate(iso);
    last.textContent = date ? `Lần sao lưu gần nhất: ${date}` : 'Bạn chưa sao lưu lần nào.';
  };
  renderLast();

  const actions = el('div', 'kt-row');
  const exportBtn = el('button', 'kt-btn kt-btn--primary', 'Xuất sao lưu');
  exportBtn.type = 'button';
  const importBtn = el('button', 'kt-btn kt-btn--secondary', 'Nhập sao lưu');
  importBtn.type = 'button';
  const fileInput = el('input', 'cai-dat__file');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.tabIndex = -1;
  fileInput.setAttribute('aria-hidden', 'true');
  actions.append(exportBtn, importBtn, fileInput);

  exportBtn.addEventListener('click', () => {
    const at = (deps.now || (() => new Date()))();
    const name = store.backupFileName(at);
    // file sao lưu mang luôn ngày sao lưu; chỉ ghi ngày khi đã tải được file
    try {
      download(name, store.exportJson({ lastBackupAt: at.toISOString() }));
    } catch {
      status.textContent = 'Không tải được file sao lưu. Thử lại nhé.';
      return;
    }
    const res = store.markBackup(at);
    status.textContent = res.ok
      ? `Đã xuất ${name}.`
      : `Đã xuất ${name}, nhưng không ghi được ngày sao lưu trên máy. ${res.error}`;
    renderLast();
  });

  importBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    let text;
    try {
      text = await readFile(file);
    } catch {
      status.textContent = 'Không đọc được file này.';
      return;
    }
    const checked = store.parseBackup(text);
    if (!checked.ok) {
      status.textContent = checked.error;
      return;
    }
    pending = confirm({
      title: 'Nhập file sao lưu?',
      text: 'Toàn bộ tiến độ hiện tại trên máy này sẽ được thay bằng nội dung trong file.',
      confirmLabel: 'Nhập',
    });
    const ok = await pending;
    pending = null;
    if (!ok || unmounted) {
      status.textContent = 'Đã huỷ nhập sao lưu.';
      return;
    }
    const res = store.importJson(text);
    status.textContent = res.ok ? 'Đã nhập sao lưu.' : res.error;
    renderLast();
  });

  card.append(head, intro, last, actions, status);
  if (store.writeBlocked) card.append(el('p', 'cai-dat__text', store.writeBlocked));
  if (store.recoveredFromCorrupt) {
    card.append(
      el(
        'p',
        'cai-dat__text',
        'Dữ liệu tiến độ trên máy bị hỏng nên Kotoba đã bắt đầu lại. Nếu có file sao lưu, hãy nhập lại.',
      ),
    );
  }

  // --- Học mỗi ngày ---
  const daily = el('section', 'kt-card kt-stack');
  const dailyHead = el('div', 'kt-sechead');
  dailyHead.append(el('h2', null, 'Học mỗi ngày'));
  const row = el('label', 'kt-row cai-dat__field');
  row.append(el('span', 'cai-dat__label', 'Số kanji mới mỗi ngày'));
  const select = el('select', 'kt-select');
  select.setAttribute('aria-label', 'Số kanji mới mỗi ngày');
  for (let n = MIN_KANJI_MOI; n <= MAX_KANJI_MOI; n++) {
    const opt = el('option', null, String(n));
    opt.value = String(n);
    select.append(opt);
  }
  const renderLimit = () => {
    const st = store.get().settings;
    select.value = String(kanjiMoiLimit(st));
    vSelect.value = String(tuMoiLimit(st));
    sBox.checked = autoSpeakOnFlip(st);
  };
  const dailyStatus = el('p', 'kt-muted cai-dat__text');
  dailyStatus.setAttribute('role', 'status');
  select.addEventListener('change', () => {
    const value = kanjiMoiLimit({ kanjiMoiMoiNgay: select.value });
    const res = store.update((d) => {
      d.settings.kanjiMoiMoiNgay = value;
    });
    dailyStatus.textContent = res.ok ? `Đã lưu: ${value} kanji mới mỗi ngày.` : res.error;
    renderLimit();
  });
  row.append(select);

  const vRow = el('label', 'kt-row cai-dat__field');
  vRow.append(el('span', 'cai-dat__label', 'Số từ vựng mới mỗi ngày'));
  const vSelect = el('select', 'kt-select');
  vSelect.setAttribute('aria-label', 'Số từ vựng mới mỗi ngày');
  for (const n of TU_MOI_CHOICES) {
    const opt = el('option', null, String(n));
    opt.value = String(n);
    vSelect.append(opt);
  }
  vSelect.addEventListener('change', () => {
    const value = tuMoiLimit({ tuMoiMoiNgay: Number(vSelect.value) });
    const res = store.update((d) => {
      d.settings.tuMoiMoiNgay = value;
    });
    dailyStatus.textContent = res.ok ? `Đã lưu: ${value} từ mới mỗi ngày.` : res.error;
    renderLimit();
  });
  vRow.append(vSelect);

  const sRow = el('label', 'kt-row cai-dat__field');
  const sBox = el('input');
  sBox.type = 'checkbox';
  sBox.className = 'cai-dat__check';
  sRow.append(el('span', 'cai-dat__label', 'Tự đọc từ khi lật thẻ'), sBox);
  sBox.addEventListener('change', () => {
    const on = sBox.checked;
    const res = store.update((d) => {
      d.settings.tuDocKhiLat = on;
    });
    dailyStatus.textContent = res.ok ? (on ? 'Đã bật tự đọc khi lật thẻ.' : 'Đã tắt tự đọc khi lật thẻ.') : res.error;
    renderLimit();
  });

  daily.append(dailyHead, row, vRow, sRow, dailyStatus);
  renderLimit();

  // --- Kỳ thi ---
  const exam = el('section', 'kt-card kt-stack');
  const examHead = el('div', 'kt-sechead');
  examHead.append(el('h2', null, 'Kỳ thi'));
  const dRow = el('label', 'kt-row cai-dat__field');
  dRow.append(el('span', 'cai-dat__label', 'Ngày thi'));
  const dInput = el('input', 'kt-select cai-dat__date');
  dInput.type = 'date';
  dInput.setAttribute('aria-label', 'Ngày thi');
  {
    const t = (deps.now || (() => new Date()))();
    dInput.min = localDate(t);
    dInput.max = localDate(new Date(t.getFullYear() + 5, t.getMonth(), t.getDate()));
  }
  dRow.append(dInput);
  const rRow = el('label', 'kt-row cai-dat__field');
  const rBox = el('input');
  rBox.type = 'checkbox';
  rBox.className = 'cai-dat__check';
  rRow.append(el('span', 'cai-dat__label', 'Đã đăng ký thi'), rBox);
  const examStatus = el('p', 'kt-muted cai-dat__text');
  examStatus.setAttribute('role', 'status');
  const renderExam = () => {
    const st = store.get().settings;
    // đang gõ ngày thì không ghi đè ô nhập
    if (document.activeElement !== dInput) dInput.value = examDay(st);
    rBox.checked = isRegistered(st);
  };
  const resetDate = () => {
    const res = store.update((d) => {
      delete d.settings.ngayThi;
    });
    examStatus.textContent = res.ok ? `Ngày không hợp lệ, dùng ngày mặc định ${formatDay(DEFAULT_EXAM_DAY)}.` : res.error;
    dInput.value = examDay(store.get().settings);
  };
  dInput.addEventListener('change', () => {
    const v = dInput.value;
    if (isValidDay(v)) {
      const res = store.update((d) => {
        d.settings.ngayThi = v;
      });
      examStatus.textContent = res.ok ? `Đã lưu ngày thi: ${formatDay(v)}.` : res.error;
      renderExam();
      return;
    }
    // đang gõ dở (Chrome báo change từng phần) thì chờ, không nhảy về mặc định
    if (document.activeElement === dInput) {
      examStatus.textContent = 'Nhập đủ ngày, tháng, năm (năm 2024–2100).';
      return;
    }
    resetDate();
  });
  dInput.addEventListener('blur', () => {
    if (!isValidDay(dInput.value)) resetDate();
  });
  rBox.addEventListener('change', () => {
    const on = rBox.checked;
    const res = store.update((d) => {
      if (on) d.settings.daDangKyThi = examDay(d.settings);
      else delete d.settings.daDangKyThi;
    });
    examStatus.textContent = res.ok ? (on ? 'Đã đánh dấu: đã đăng ký thi.' : 'Đã bỏ đánh dấu đăng ký thi. Trang chủ sẽ nhắc lại khi tới mùa đăng ký.') : res.error;
    renderExam();
  });
  exam.append(examHead, dRow, rRow, examStatus);
  renderExam();

  // --- Giới thiệu ---
  const about = el('section', 'kt-card');
  const aboutHead = el('div', 'kt-sechead');
  aboutHead.append(el('h2', null, 'Giới thiệu'));
  const link = el('a', 'kt-link', 'Nguồn nội dung và giấy phép');
  link.href = toHash('gioi-thieu');
  aboutHead.append(link);
  about.append(aboutHead);

  wrap.append(card, daily, exam, about);
  root.append(wrap);

  const onChanged = () => {
    renderLast();
    renderLimit();
    renderExam();
    dailyStatus.textContent = '';
  };
  window.addEventListener(CHANGED_EVENT, onChanged);
  return () => {
    unmounted = true;
    window.removeEventListener(CHANGED_EVENT, onChanged);
    if (pending && typeof pending.close === 'function') pending.close();
  };
}
