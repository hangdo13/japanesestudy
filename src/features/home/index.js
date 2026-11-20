import './home.css';
import { progress as defaultProgress, localDate, CHANGED_EVENT } from '../../core/progress.js';
import { kanji as allKanji, vocab as allVocab } from '../../core/content.js';
import { dueToday, summarize, studyStreak, weekDays, learnedCounts } from '../../core/today.js';
import { hasCard } from '../../ui/cards/registry.js';
import { minutesOn } from '../../core/study-clock.js';
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

function icon(name) {
  const i = document.createElement('i');
  i.dataset.icon = name;
  return i;
}

/** Lời chào theo giờ trên máy. */
export function greetingWord(now) {
  const h = now.getHours();
  if (h < 11) return 'Chào buổi sáng,';
  if (h < 18) return 'Chào buổi chiều,';
  return 'Chào buổi tối,';
}

function renderGreeting(now, due, minutes) {
  const g = el('div', 'kt-greeting');
  const h1 = el('h1');
  h1.append(document.createTextNode(`${greetingWord(now)} `), el('b', null, 'Hannah!'));
  const p = el('p');
  if (due.total) {
    // dòng phụ là lời nhắc hành động; con số chi tiết đã có ở thẻ bên dưới
    p.append(document.createTextNode('Bấm nút ↗ ở thẻ bên dưới để học tiếp với '), el('b', null, 'Kotoba'), document.createTextNode(' nhé.'));
  } else if (minutes) {
    p.append(document.createTextNode(`Bạn đã học ${minutes} phút hôm nay với `), el('b', null, 'Kotoba'), document.createTextNode('. Giỏi lắm!'));
  } else {
    p.append(document.createTextNode('Hôm nay không còn việc nào. Nghỉ ngơi nhé!'));
  }
  g.append(h1, p);
  return g;
}

/** ActiveLessonCard: khối surface-tint duy nhất trên màn. */
function renderToday(due, go) {
  const c = el('article', 'kt-lesson');
  if (!due.total) {
    const top = el('div', 'kt-lesson__top');
    const pyon = el('span', 'kt-mascot');
    pyon.dataset.mascot = 'celebrate';
    pyon.dataset.size = '72';
    pyon.setAttribute('role', 'img');
    pyon.setAttribute('aria-label', 'Pyon ăn mừng');
    top.append(pyon, el('span', 'kt-chip kt-chip--surface', 'Hôm nay'));
    c.append(top, el('h3', null, 'Xong việc hôm nay!'));
    const foot = el('div', 'kt-lesson__foot');
    foot.append(el('span', null, 'Mai Pyon chuẩn bị thẻ mới cho bạn.'));
    c.append(foot);
    return c;
  }
  const top = el('div', 'kt-lesson__top');
  const chip = el('span', 'kt-chip kt-chip--surface');
  chip.append(icon('calendar'), document.createTextNode('Hôm nay'));
  top.append(chip);
  const h3 = el('h3', null, `Hôm nay: ${summarize(due)}`);
  const foot = el('div', 'kt-lesson__foot');
  const parts = [];
  if (due.kanjiDue) parts.push(`${due.kanjiDue} kanji`);
  if (due.vocabDue) parts.push(`${due.vocabDue} từ`);
  foot.append(el('span', null, parts.length ? `Ôn: ${parts.join(', ')}` : 'Học bài mới'));
  const start = el('button', 'kt-iconbtn kt-iconbtn--surface');
  start.type = 'button';
  start.setAttribute('aria-label', 'Bắt đầu việc hôm nay');
  start.append(icon('arrow-up-right'));
  start.addEventListener('click', go);
  foot.append(start);
  c.append(top, h3, foot);
  return c;
}

function stat(iconName, value, unit, label, href, blue) {
  const a = el('a', 'kt-card kt-stat home__stat');
  a.href = href;
  a.setAttribute('aria-label', `${label}: ${value} ${unit.replace('/', 'trên ')}`.trim());
  const top = el('div', 'kt-stat__top');
  const ic = el('span', `kt-stat__icon${blue ? ' kt-stat__icon--blue' : ''}`);
  ic.append(icon(iconName));
  const v = el('span', 'kt-stat__value', String(value));
  v.append(el('small', null, unit));
  top.append(ic, v);
  const bottom = el('div', 'kt-stat__bottom');
  const go = el('span', 'kt-iconbtn kt-iconbtn--sm');
  go.setAttribute('aria-hidden', 'true');
  go.append(icon('arrow-up-right'));
  bottom.append(el('span', 'kt-stat__label', label), go);
  a.append(top, bottom);
  return a;
}

function renderStreak(streak, week) {
  const sec = el('section', 'kt-streak');
  sec.setAttribute('aria-label', 'Chuỗi ngày học');
  const head = el('div', 'kt-streak__head');
  const flame = icon('flame');
  flame.setAttribute('aria-hidden', 'true');
  const txt = el('span');
  txt.append(el('b', null, 'ngày'), document.createTextNode(' học liên tiếp'));
  head.append(flame, el('strong', 'kt-num', String(streak.days)), txt);
  const row = el('div', 'kt-week');
  for (const d of week) {
    const day = el('div', `kt-day${d.done ? ' is-done' : ''}${d.today ? ' is-today' : ''}${d.future ? ' is-future' : ''}`);
    if (d.today) day.setAttribute('aria-current', 'date');
    day.setAttribute('role', 'img');
    day.setAttribute('aria-label', `${d.label}: ${d.done ? 'đã học' : d.future ? 'chưa tới' : d.today ? 'hôm nay' : 'nghỉ'}`);
    const mark = el('span', 'kt-day__mark');
    if (d.done) mark.append(icon('check'));
    day.append(el('span', 'kt-day__label', d.label), mark);
    row.append(day);
  }
  sec.append(head, row, el('p', 'kt-muted home__note', 'Mỗi tuần được nghỉ 1 ngày mà không mất chuỗi.'));
  return sec;
}

function course(skill, glyph, title, sub, done, total, unit, href) {
  const a = el('a', 'kt-card kt-course home__course');
  a.href = href;
  const head = el('div', 'kt-course__head');
  const tile = el('span', `kt-skill kt-skill--${skill}`, glyph);
  tile.lang = 'ja';
  tile.setAttribute('aria-hidden', 'true');
  const t = el('div');
  t.append(el('h3', null, title), el('p', null, sub));
  head.append(tile, t);
  // chưa xong hết thì không hiện 100% (715/718 → 99%)
  const pct = !total ? 0 : done >= total ? 100 : Math.min(99, Math.round((done / total) * 100));
  const meta = el('div', 'kt-course__meta');
  const p = el('span', 'kt-pct', String(pct));
  p.append(el('sup', null, '%'));
  const count = el('span', 'kt-course__count');
  count.append(el('b', null, `${done}/${total}`), document.createTextNode(` ${unit}`));
  meta.append(p, count);
  const seg = el('div', `kt-seg kt-seg--${skill}`);
  const SEGS = 20;
  const on = done >= total && total ? SEGS : Math.min(SEGS - 1, Math.round((done / Math.max(total, 1)) * SEGS));
  seg.setAttribute('role', 'progressbar');
  seg.setAttribute('aria-label', `${title}: ${done} trên ${total} ${unit}`);
  seg.setAttribute('aria-valuenow', String(done));
  seg.setAttribute('aria-valuemin', '0');
  seg.setAttribute('aria-valuemax', String(total));
  for (let i = 0; i < SEGS; i++) seg.append(Object.assign(el('i'), { className: i < on ? 'on' : '' }));
  a.append(head, meta, seg);
  return a;
}

/** Dựng nội dung trang chủ vào `host`. */
function render(host, deps) {
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

  const ctx = { kanji: allKanji(), vocab: allVocab(), now, canShow: hasCard };
  const due = dueToday(data, ctx);
  const minutes = minutesOn(data, localDate(now));
  const counts = learnedCounts(data, ctx);
  const go = () => {
    win.location.hash = toHash('hoc-ngay');
  };
  const stats = el('div', 'kt-grid-2');
  stats.append(
    stat('clock', minutes, 'phút', 'Học hôm nay', toHash('luyen-tap')),
    stat('book', counts.kanjiHoc, `/${counts.kanjiTong}`, 'Kanji đã học', toHash('kanji'), true),
  );
  const courses = el('div', 'kt-stack');
  courses.append(
    course('kanji', '字', 'Kanji N5', 'Đã thuộc cả nghĩa, cách đọc và mặt chữ', counts.kanjiThuoc, counts.kanjiTong, 'chữ', toHash('kanji')),
    course('vocab', '語', 'Từ vựng N5', 'Đã thuộc', counts.tuThuoc, counts.tuTong, 'từ', toHash('luyen-tap')),
  );
  wrap.append(renderGreeting(now, due, minutes), renderToday(due, go), stats, renderStreak(studyStreak(data, now), weekDays(data, now)), courses);
  host.replaceChildren(wrap);
  const K = win && win.Kotoba;
  if (K && typeof K.hydrate === 'function') K.hydrate(wrap);
}

export function mount(root, _params, deps = {}) {
  const host = el('div');
  root.append(host);
  render(host, deps);
  const win = deps.win || window;
  // dựng lại khi nội dung thật sự đổi (vd. nhập sao lưu, phút học tăng), giữ chỗ focus
  const rerender = () => {
    if (!host.isConnected) return;
    const before = host.textContent;
    const active = host.ownerDocument && host.ownerDocument.activeElement;
    const key = active && host.contains(active) ? active.getAttribute('aria-label') || active.textContent : null;
    const tmp = el('div');
    render(tmp, deps);
    if (tmp.textContent === before) return;
    host.replaceChildren(...tmp.childNodes);
    if (key) {
      const again = [...host.querySelectorAll('a, button')].find((n) => (n.getAttribute('aria-label') || n.textContent) === key);
      if (again) again.focus();
    }
  };
  const target = deps.events || win;
  if (target && typeof target.addEventListener === 'function') target.addEventListener(CHANGED_EVENT, rerender);
  // mở lại app sau nửa đêm: ngày mới, việc mới
  const doc = deps.doc || (typeof document !== 'undefined' ? document : null);
  const onVisible = () => {
    if (!doc || doc.visibilityState !== 'hidden') rerender();
  };
  if (doc) doc.addEventListener('visibilitychange', onVisible);
  return () => {
    if (target && typeof target.removeEventListener === 'function') target.removeEventListener(CHANGED_EVENT, rerender);
    if (doc) doc.removeEventListener('visibilitychange', onVisible);
  };
}
