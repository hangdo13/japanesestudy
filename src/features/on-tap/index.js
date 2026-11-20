import { kanji as allKanji, kanjiById } from '../../core/content.js';
import { progress as defaultProgress } from '../../core/progress.js';
import { reviewCard } from '../../core/srs.js';
import { studyClock } from '../../core/study-clock.js';
import { ensureKanjiCards, dueKanjiCards, nextKanjiDue, buildKanjiQuestion, readingOf, onePerKanji, MAX_PER_SESSION } from '../../core/kanji-review.js';
import { toHash } from '../../core/router.js';
import { renderQuizSession } from '../../ui/quiz-session.js';
import { renderKanjiCard } from '../../ui/cards/kanji.js';
import { renderEmptyState } from '../../ui/empty-state.js';
import { renderGoalComplete } from '../../ui/goal-complete.js';
import './on-tap.css';
import { flashStep } from './flash.js';
import { renderVocabReview, TU_VUNG } from './vocab.js';

export const KANJI = 'kanji';

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

/** Thời điểm dạng "14:30 ngày 19/11" theo giờ trên máy. */
export function formatWhen(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ngày ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

/**
 * Màn ôn kanji. deps: progress, now, rng, win, scheduleReview
 * @returns {{ node: HTMLElement, ready: Promise<void>, idle: () => Promise<void>, cleanup: () => void }}
 */
export function renderKanjiReview(deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = deps.now || (() => new Date());
  const win = deps.win || globalThis.window;
  const review = deps.scheduleReview || reviewCard;
  const activity = deps.activity || (() => studyClock().activity());
  const known = new Set(allKanji().map((k) => k.id));
  const root = el('div', 'kt-stack');
  const view = el('div', 'kt-stack');
  const status = el('p', 'kt-muted');
  status.setAttribute('role', 'status');
  const announcer = el('p', 'app-sr-only');
  announcer.setAttribute('role', 'status');
  root.append(view, status, announcer);
  view.append(el('p', 'kt-muted', 'Đang chuẩn bị thẻ ôn…'));
  let saving = Promise.resolve();
  let alive = true;
  const go = (hash) => {
    if (win) win.location.hash = hash;
  };
  const hydrate = () => {
    const K = win && win.Kotoba;
    if (K && typeof K.hydrate === 'function') K.hydrate(root);
  };

  const record = (key, correct) => {
    saving = saving.then(async () => {
      try {
        const card = await review(store.get().srs[key], correct, now());
        const res = store.update((d) => {
          d.srs[key] = card;
        });
        if (!res.ok) status.textContent = res.error;
      } catch {
        status.textContent = 'Không lưu được lịch ôn cho thẻ này.';
      }
    });
  };

  const showEmpty = () => {
    const next = nextKanjiDue(store.get(), known, now());
    const node = next
      ? renderEmptyState({
          title: 'Chưa có thẻ kanji nào đến hạn',
          text: `Thẻ tiếp theo đến hạn lúc ${formatWhen(next)}. Trong lúc chờ, học thêm vài chữ mới nhé.`,
          actionLabel: 'Học kanji mới',
          onAction: () => go(toHash('kanji', 'hoc-moi')),
        })
      : renderEmptyState({
          title: 'Chưa có thẻ kanji để ôn',
          text: 'Học gói kanji mới trước, sau đó các chữ sẽ được đưa vào lịch ôn.',
          actionLabel: 'Học kanji mới',
          onAction: () => go(toHash('kanji', 'hoc-moi')),
        });
    view.replaceChildren(node);
    hydrate();
  };

  const start = () => {
    // mỗi chữ một thẻ mỗi phiên; dựng sẵn câu hỏi và bỏ thẻ đọc/chữ không dựng được (để nguyên lịch)
    const due = [];
    for (const step of onePerKanji(dueKanjiCards(store.get(), known, now()))) {
      if (due.length === MAX_PER_SESSION) break;
      const k = kanjiById(step.id);
      const q = step.kind === 'kanji-nghia' ? null : buildKanjiQuestion(step.kind, k, allKanji(), deps.rng);
      if (step.kind !== 'kanji-nghia' && !q) continue;
      due.push({ ...step, k, q });
    }
    if (!due.length) return showEmpty();
    const session = renderQuizSession({
      title: 'Ôn kanji',
      questions: due,
      toQuestion: (step) => {
        const { k, q } = step;
        if (!q)
          return {
            render: (answer) =>
              flashStep(
                { card: renderKanjiCard(k), label: `Thẻ kanji ${k.id}`, revealText: `${k.id}: ${k.hanViet}, ${k.nghia}.` },
                answer,
                win,
                (t) => (announcer.textContent = t),
                activity,
              ),
          };
        if (step.kind === 'kanji-doc') {
          const prompt = el('span');
          prompt.append(jp('span', 'kt-flash__glyph review-word', q.word), el('span', 'kt-muted', ' đọc là gì?'));
          return {
            prompt,
            options: q.options.map((r) => jp('span', 'review-option', r)),
            answer: q.answer,
            explain: () => {
              const s = el('span');
              s.append(jp('span', null, `${q.word} = ${readingOf(k)}`), document.createTextNode(` · ${q.nghia || k.nghia} (${k.id}: ${k.hanViet})`));
              return s;
            },
          };
        }
        const prompt = el('span', 'kt-stack');
        prompt.append(el('span', null, `${k.hanViet} · ${k.nghia}`), el('span', 'kt-muted', 'Chọn chữ kanji đúng'));
        return {
          prompt,
          options: q.options.map((id) => jp('span', 'review-option review-option--kanji', id)),
          answer: q.answer,
          explain: () => {
            const s = el('span');
            s.append(jp('span', null, k.id), document.createTextNode(` = ${k.hanViet} · ${k.nghia}`));
            return s;
          },
        };
      },
      onActivity: activity,
      onAnswer: (step, correct) => record(step.key, correct),
      onClose: () => go(toHash('luyen-tap')),
      renderResult: ({ score, total }) =>
        renderGoalComplete({
          title: 'Ôn kanji xong!',
          text: `Bạn vừa ôn ${total} thẻ, nhớ ${score} thẻ. Thẻ chưa nhớ sẽ quay lại sớm.`,
          chips: [{ text: `${total} thẻ`, className: 'kt-chip--kanji' }],
          actionLabel: 'Về Luyện tập',
          onAction: () => go(toHash('luyen-tap')),
        }),
    });
    view.replaceChildren(session);
    hydrate();
  };

  const ready = (async () => {
    let failed = null;
    try {
      const res = await ensureKanjiCards(store, known, now());
      if (!res.ok) failed = res.error;
    } catch {
      failed = 'Không tạo được thẻ ôn.';
    }
    if (!alive) return;
    if (failed) {
      status.textContent = failed;
      // không tạo được thẻ và cũng không có thẻ nào đến hạn: đừng bảo "hãy học kanji mới"
      if (!dueKanjiCards(store.get(), known, now()).length) {
        view.replaceChildren(
          renderEmptyState({
            title: 'Chưa chuẩn bị được thẻ ôn',
            text: 'Máy chưa lưu được lịch ôn. Hãy sao lưu tiến độ trong Cài đặt rồi thử lại.',
            actionLabel: 'Mở Cài đặt',
            onAction: () => go(toHash('cai-dat')),
          }),
        );
        hydrate();
        return;
      }
    }
    start();
  })();

  return {
    node: root,
    ready,
    idle: () => saving,
    cleanup: () => {
      alive = false;
    },
  };
}

export function mount(root, { param } = {}, deps = {}) {
  if (param === TU_VUNG) {
    const v = renderVocabReview(deps);
    root.append(v.node);
    return v.cleanup;
  }
  if (param === KANJI || !param) {
    const v = renderKanjiReview(deps);
    root.append(v.node);
    return v.cleanup;
  }
  root.append(
    renderEmptyState({
      title: 'Không tìm thấy bài ôn này',
      text: 'Đường dẫn không đúng. Quay lại Luyện tập để chọn bài.',
      actionLabel: 'Về Luyện tập',
      onAction: () => {
        (deps.win || window).location.hash = toHash('luyen-tap');
      },
    }),
  );
}
