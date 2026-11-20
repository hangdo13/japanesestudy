// Từ vựng theo chủ đề (Story 2.6): #/tu-vung (21 chủ đề) và #/tu-vung/<n> (chi tiết + học gói từ mới).
import './tu-vung.css';
import { vocab as allVocab, vocabTopics } from '../../core/content.js';
import { progress as defaultProgress, localDate } from '../../core/progress.js';
import { reviewCard } from '../../core/srs.js';
import { topicStats, topicPack, isLearned, speakText, canSpeakWord, VOCAB_PREFIX } from '../../core/vocab-review.js';
import { autoSpeakOnFlip } from '../../core/growth.js';
import { studyClock } from '../../core/study-clock.js';
import { toHash } from '../../core/router.js';
import { renderQuizSession } from '../../ui/quiz-session.js';
import { renderCard, hasCard } from '../../ui/cards/registry.js';
import { flashStep } from '../../ui/flash-step.js';
import { renderEmptyState } from '../../ui/empty-state.js';
import { renderGoalComplete } from '../../ui/goal-complete.js';
import { speakJa, canSpeakJapanese } from '../../ui/speech.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}
function jp(tag, className, text) {
  const n = el(tag, `${className || ''} kt-jp`.trim(), text);
  n.lang = 'ja';
  return n;
}

/** Lần lưu gói từ gần nhất (dùng chung giữa các lần mở màn chủ đề). */
const settledSave = Promise.resolve();
let pendingSave = settledSave;

/** Thanh tiến độ 20 đoạn màu vocab; chưa xong hết thì không đầy. */
function seg(done, total, label) {
  const s = el('div', 'kt-seg kt-seg--vocab');
  const N = 20;
  const on = total && done >= total ? N : Math.min(N - 1, Math.round((done / Math.max(total, 1)) * N));
  s.setAttribute('role', 'progressbar');
  s.setAttribute('aria-label', label);
  s.setAttribute('aria-valuemin', '0');
  s.setAttribute('aria-valuemax', String(total));
  s.setAttribute('aria-valuenow', String(done));
  for (let i = 0; i < N; i++) s.append(Object.assign(el('i'), { className: i < on ? 'on' : '' }));
  return s;
}
const pctOf = (done, total) => (!total ? 0 : done >= total ? 100 : Math.min(99, Math.round((done / total) * 100)));

/** CourseProgressCard cho một chủ đề. `level`: thẻ tiêu đề (h2 ở trang chi tiết, h3 trong danh sách). */
function topicCard(t, href, level = 'h3') {
  const card = el(href ? 'a' : 'section', 'kt-card kt-course tu-vung__course');
  if (href) {
    card.href = href;
    // tên link gọn cho trình đọc màn hình; phần số liệu bên trong ẩn khỏi cây truy cập
    card.setAttribute('aria-label', `Chủ đề ${t.thuTu}: ${t.chuDe}, đã học ${t.daHoc} trên ${t.tong} từ`);
  }
  const head = el('div', 'kt-course__head');
  const tile = jp('span', 'kt-skill kt-skill--vocab', '語');
  tile.setAttribute('aria-hidden', 'true');
  const txt = el('div');
  txt.append(el(level, 'tu-vung__title', t.chuDe), el('p', null, `Chủ đề ${t.thuTu}`));
  head.append(tile, txt);
  const meta = el('div', 'kt-course__meta');
  const pct = el('span', 'kt-pct', String(pctOf(t.daHoc, t.tong)));
  pct.append(el('sup', null, '%'));
  const count = el('span', 'kt-course__count');
  count.append(el('b', null, `${t.daHoc}/${t.tong}`), document.createTextNode(' từ'));
  meta.append(pct, count);
  const bar = seg(t.daHoc, t.tong, `${t.chuDe}: đã học ${t.daHoc} trên ${t.tong} từ`);
  if (href) {
    meta.setAttribute('aria-hidden', 'true');
    bar.setAttribute('aria-hidden', 'true');
  }
  card.append(head, meta, bar);
  return card;
}

function renderList(store) {
  const wrap = el('div', 'kt-stack');
  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, 'Từ vựng theo chủ đề'));
  wrap.append(head, el('p', 'kt-muted tu-vung__text', '21 chủ đề theo lộ trình N5. Chọn một chủ đề để học từ mới.'));
  const list = el('ul', 'kt-stack tu-vung__topics');
  for (const t of topicStats(store.get(), allVocab(), vocabTopics())) {
    const li = el('li');
    li.append(topicCard(t, toHash('tu-vung', String(t.thuTu))));
    list.append(li);
  }
  wrap.append(list);
  return wrap;
}

/**
 * Chi tiết một chủ đề và phiên học gói từ mới.
 * deps: progress, now, win, scheduleReview, canSpeak, speak, activity
 */
export function renderTopic(thuTu, deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = deps.now || (() => new Date());
  const win = deps.win || globalThis.window;
  const review = deps.scheduleReview || reviewCard;
  const canSpeak = deps.canSpeak || canSpeakJapanese;
  const speak = deps.speak || speakJa;
  const activity = deps.activity || (() => studyClock().activity());
  const root = el('div', 'kt-stack');
  const announcer = el('p', 'app-sr-only');
  announcer.setAttribute('role', 'status');
  const view = el('div', 'kt-stack');
  root.append(view, announcer);
  let alive = true;
  let saving = pendingSave;
  let inSession = false; // đang học gói: không vẽ lại trang chi tiết đè lên phiên
  const hydrate = () => {
    const K = win && win.Kotoba;
    if (K && typeof K.hydrate === 'function') K.hydrate(root);
  };

  const showDetail = ({ focus = false } = {}) => {
    inSession = false;
    const data = store.get();
    const t = topicStats(data, allVocab(), vocabTopics())[thuTu - 1];
    const words = allVocab()
      .filter((w) => w.chuDeThuTu === thuTu)
      .sort((a, b) => a.id.localeCompare(b.id));
    const { pack, left } = topicPack(data, allVocab(), thuTu, localDate(now()));
    const vocabOk = hasCard('vocab');
    const wrap = el('div', 'kt-stack');
    const back = el('a', 'kt-link', '‹ Các chủ đề');
    back.href = toHash('tu-vung');
    const card = topicCard(t, null, 'h2');
    const label = !left ? 'Đã học hết chủ đề này' : !pack.length ? 'Đã đủ từ mới hôm nay' : `Học ${pack.length} từ mới`;
    const learn = el('button', 'kt-btn kt-btn--primary kt-btn--block', label);
    learn.type = 'button';
    learn.disabled = !pack.length || !vocabOk;
    learn.addEventListener('click', () => {
      // tính lại gói lúc bấm (dữ liệu có thể vừa đổi ở nơi khác)
      const fresh = topicPack(store.get(), allVocab(), thuTu, localDate(now())).pack;
      if (fresh.length) startSession(fresh);
      else showDetail({ focus: true });
    });
    wrap.append(back, card, learn);
    if (left && !pack.length)
      wrap.append(el('p', 'kt-muted tu-vung__text', 'Hôm nay bạn đã học đủ số từ mới trong Cài đặt. Mai học tiếp chủ đề này nhé.'));
    if (!left) {
      const r = el('a', 'kt-link', 'Ôn các từ đã học');
      r.href = toHash('on-tap', 'tu-vung');
      wrap.append(r);
    }
    const head = el('div', 'kt-sechead');
    head.append(el('h2', null, 'Danh sách từ'));
    const list = el('ul', 'tu-vung__list');
    for (const w of words) {
      const li = el('li', 'tu-vung__item');
      const left = el('div', 'tu-vung__words');
      left.append(jp('span', 'tu-vung__tu', w.tu));
      if (w.doc !== w.tu) left.append(jp('span', 'kt-muted tu-vung__doc', w.doc));
      left.append(el('span', 'tu-vung__nghia', w.nghia));
      li.append(left);
      if (isLearned(data, w.id)) li.append(el('span', 'kt-chip kt-chip--success', 'Đã học'));
      list.append(li);
    }
    wrap.append(head, list);
    view.replaceChildren(wrap);
    hydrate();
    if (focus) learn.disabled ? back.focus() : learn.focus();
  };

  function startSession(pack) {
    inSession = true;
    const grades = new Map();
    // ngày và giờ của phiên (phiên kéo qua nửa đêm vẫn tính cho ngày bắt đầu)
    const startedAt = now();
    const day = localDate(startedAt);
    const auto = autoSpeakOnFlip(store.get().settings);
    const play = (w) => {
      if (!canSpeakWord(w) || !canSpeak()) return;
      speak(speakText(w));
    };
    const session = renderQuizSession({
      title: `Học từ mới: ${vocabTopics()[thuTu - 1]}`,
      skill: 'vocab',
      questions: pack,
      onActivity: activity,
      onAnswer: (w, ok) => grades.set(w.id, ok),
      toQuestion: (w) => ({
        render: (answer) => {
          const c = renderCard('vocab', w, {
            onPlay: () => {
              activity();
              play(w);
            },
            canPlay: !!canSpeak() && canSpeakWord(w),
          });
          const chip = c.querySelector('.kt-flash__top .kt-chip');
          if (chip) chip.textContent = 'Từ mới';
          return flashStep(
            { card: c, label: `Thẻ từ mới ${w.tu} (${w.nghia})`, revealText: `${w.tu}, đọc ${w.doc}: ${w.nghia}.` },
            answer,
            win,
            (t) => (announcer.textContent = t),
            () => {
              activity();
              if (auto) play(w);
            },
          );
        },
      }),
      onClose: () => showDetail({ focus: true }),
      renderResult: ({ score, total }) => {
        const status = el('p', 'kt-muted tu-vung__text');
        status.setAttribute('role', 'status');
        const retry = el('button', 'kt-btn kt-btn--soft kt-btn--sm', 'Thử lưu lại');
        retry.type = 'button';
        retry.hidden = true;
        // xem hết gói: ghi một lần ngày học + thẻ ôn cho từng từ; lỗi thì giữ kết quả để thử lại
        const save = () => {
          status.textContent = 'Đang lưu…';
          retry.hidden = true;
          saving = (async () => {
            const cards = {};
            for (const w of pack) cards[w.id] = await review(null, grades.get(w.id) !== false, startedAt);
            const res = store.update((d) => {
              for (const w of pack) {
                if (!d.tuVung[w.id] || !d.tuVung[w.id].gioiThieu) d.tuVung[w.id] = { ...(d.tuVung[w.id] || {}), gioiThieu: day };
                if (!d.srs[VOCAB_PREFIX + w.id]) d.srs[VOCAB_PREFIX + w.id] = cards[w.id];
              }
            });
            if (!res.ok) throw new Error(res.error);
            if (alive) status.textContent = 'Đã lưu: các từ này đã vào lịch ôn.';
          })().catch((err) => {
            if (!alive) return;
            status.textContent = `Chưa lưu được: ${(err && err.message) || 'lỗi không rõ'}`;
            retry.hidden = false;
          });
          pendingSave = saving;
        };
        retry.addEventListener('click', save);
        save();
        const goal = renderGoalComplete({
          title: 'Xong gói từ mới!',
          text: `Bạn vừa học ${total} từ chủ đề "${vocabTopics()[thuTu - 1]}", nhớ ngay ${score} từ.`,
          chips: [{ text: `${total} từ mới`, className: 'kt-chip--vocab' }],
          actionLabel: 'Về chủ đề',
          // về ngay; khi lưu xong trang chủ đề tự cập nhật
          onAction: () => {
            showDetail({ focus: true });
            saving.then(() => alive && !inSession && showDetail());
          },
        });
        const box = el('div', 'kt-stack');
        box.append(goal, status, retry);
        return box;
      },
    });
    view.replaceChildren(session);
    hydrate();
  }

  showDetail();
  // lần lưu trước (vd. vừa rời màn khi đang lưu) xong thì vẽ lại cho đúng tiến độ
  if (saving !== settledSave) saving.then(() => alive && !inSession && showDetail());
  return {
    node: root,
    idle: () => saving,
    cleanup: () => {
      alive = false;
      if (globalThis.speechSynthesis && typeof globalThis.speechSynthesis.cancel === 'function') globalThis.speechSynthesis.cancel();
    },
  };
}

export function mount(root, { param } = {}, deps = {}) {
  const store = deps.progress || defaultProgress();
  if (!param) {
    root.append(renderList(store));
    return undefined;
  }
  const n = /^[1-9]\d*$/.test(String(param)) ? Number(param) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > vocabTopics().length) {
    root.append(
      renderEmptyState({
        title: 'Không tìm thấy chủ đề',
        text: 'Đường dẫn không đúng. Quay lại danh sách chủ đề để chọn.',
        actionLabel: 'Các chủ đề',
        onAction: () => {
          (deps.win || window).location.hash = toHash('tu-vung');
        },
      }),
    );
    return undefined;
  }
  const v = renderTopic(n, deps);
  root.append(v.node);
  return v.cleanup;
}
