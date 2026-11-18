import './home.css';
import { renderEmptyState } from '../../ui/empty-state.js';
import { progress as defaultProgress } from '../../core/progress.js';
import { backupDue, shouldShowInstallGuide } from '../../core/growth.js';
import { detectPlatform } from '../../core/platform.js';
import { toHash } from '../../core/router.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function card(title, ...children) {
  const c = el('section', 'kt-card kt-stack');
  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, title));
  c.append(head, ...children);
  return c;
}

const STEPS_SAFARI = [
  'Bấm nút Chia sẻ (hình vuông có mũi tên hướng lên) trên thanh của Safari.',
  'Chọn "Thêm vào MH chính".',
  'Bấm "Thêm", rồi luôn mở Kotoba từ biểu tượng Pyon vừa tạo.',
];
const STEPS_KHAC = [
  'Sao chép địa chỉ trang này.',
  'Mở Safari và dán địa chỉ vào (trình duyệt hiện tại không thêm được vào màn hình chính).',
  'Trong Safari, bấm nút Chia sẻ → "Thêm vào MH chính", rồi luôn mở Kotoba từ biểu tượng Pyon.',
];

function renderInstallGuide(onLater, isSafari = true) {
  const steps = el('ol', 'home__steps');
  for (const s of isSafari ? STEPS_SAFARI : STEPS_KHAC) {
    steps.append(el('li', null, s));
  }
  const why = el(
    'p',
    'kt-muted home__text',
    'Mở trong tab Safari thường thì sau 7 ngày không vào, Safari có thể xoá hết tiến độ học. Mở từ màn hình chính sẽ an toàn hơn.',
  );
  const later = el('button', 'kt-btn kt-btn--ghost kt-btn--sm', 'Để sau');
  later.type = 'button';
  later.addEventListener('click', onLater);
  const row = el('div', 'kt-row');
  row.append(later);
  const c = card('Thêm Kotoba vào màn hình chính', steps, why, row);
  c.dataset.notice = 'install';
  return c;
}

function renderBackupReminder(win) {
  const text = el(
    'p',
    'home__text',
    'Đã 7 ngày trở lên bạn chưa sao lưu tiến độ. Xuất file sao lưu để không mất công học nhé.',
  );
  const go = el('button', 'kt-btn kt-btn--soft kt-btn--sm', 'Mở Cài đặt để sao lưu');
  go.type = 'button';
  go.addEventListener('click', () => {
    win.location.hash = toHash('cai-dat');
  });
  const row = el('div', 'kt-row');
  row.append(go);
  const c = card('Đến lúc sao lưu', text, row);
  c.dataset.notice = 'backup';
  return c;
}

export function mount(root, _params, deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = (deps.now || (() => new Date()))();
  const win = deps.win || window;
  const platform = deps.platform || detectPlatform(win);
  const data = store.get();

  const wrap = el('div', 'kt-stack');

  if (store.writeBlocked) {
    const c = card('Kotoba đang tạm ngừng lưu', el('p', 'home__text', store.writeBlocked));
    c.dataset.notice = 'blocked';
    wrap.append(c);
  } else if (store.recoveredFromCorrupt) {
    const c = card(
      'Tiến độ đã được đặt lại',
      el('p', 'home__text', 'Dữ liệu tiến độ trên máy bị hỏng nên Kotoba đã bắt đầu lại. Nếu có file sao lưu, hãy nhập lại trong Cài đặt.'),
    );
    c.dataset.notice = 'corrupt';
    wrap.append(c);
  }

  if (
    shouldShowInstallGuide({
      isIos: platform.isIos,
      isStandalone: platform.isStandalone,
      dismissedAt: data.settings.anHuongDanCaiDatLuc,
      now,
    })
  ) {
    const clock = deps.now || (() => new Date());
    const guide = renderInstallGuide(() => {
      // ẩn ngay trong phiên này; nếu không lưu được thì lần sau sẽ hiện lại
      guide.remove();
      store.update((d) => {
        d.settings.anHuongDanCaiDatLuc = clock().toISOString();
      });
    }, platform.isIosSafari !== false);
    wrap.append(guide);
  }

  if (backupDue(data, now)) wrap.append(renderBackupReminder(win));

  wrap.append(
    renderEmptyState({
      title: 'Trang chủ sắp có',
      text: 'Pyon đang chuẩn bị việc học hôm nay cho bạn. Trong lúc chờ, vào tab Kanji để học chữ mới nhé.',
    }),
  );
  root.append(wrap);
}
