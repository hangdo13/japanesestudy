import { vocab as allVocab, vocabById } from '../../core/content.js';
import { progress as defaultProgress, localDate } from '../../core/progress.js';
import { reviewCard } from '../../core/srs.js';
import { studyClock } from '../../core/study-clock.js';
import { dueVocab, newVocabToday, nextVocabDue, speakText, canSpeakWord, VOCAB_PREFIX, MAX_REVIEW } from '../../core/vocab-review.js';
import { autoSpeakOnFlip } from '../../core/growth.js';
import { toHash } from '../../core/router.js';
import { renderQuizSession } from '../../ui/quiz-session.js';
import { renderVocabCard } from '../../ui/cards/vocab.js';
import { renderEmptyState } from '../../ui/empty-state.js';
import { renderGoalComplete } from '../../ui/goal-complete.js';
import { speakJa, canSpeakJapanese, onVoicesChanged } from '../../ui/speech.js';
import { flashStep } from './flash.js';

export const TU_VUNG = 'tu-vung';
const NO_VOICE = 'Máy chưa có giọng đọc tiếng Nhật nên chưa phát âm được. Trên iPhone: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói, tải giọng tiếng Nhật.';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

/** Thời điểm dạng "14:30 ngày 19/11" theo giờ trên máy. */
function formatWhen(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ngày ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

/**
 * Màn ôn từ vựng: thẻ đến hạn rồi từ mới trong hạn mức ngày.
 * deps: progress, now, win, scheduleReview, canSpeak, speak
 */
export function renderVocabReview(deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = deps.now || (() => new Date());
  const win = deps.win || globalThis.window;
  const review = deps.scheduleReview || reviewCard;
  const canSpeak = deps.canSpeak || canSpeakJapanese;
  const speak = deps.speak || speakJa;
  const activity = deps.activity || (() => studyClock().activity());
  const known = new Set(allVocab().map((w) => w.id));
  const root = el('div', 'kt-stack');
  const view = el('div', 'kt-stack');
  const status = el('p', 'kt-muted');
  status.setAttribute('role', 'status');
  const voiceNote = el('p', 'kt-muted');
  voiceNote.hidden = true;
  // vùng đọc cho trình đọc màn hình khi lật thẻ (ẩn với mắt: thẻ đã hiện nội dung)
  const announcer = el('p', 'app-sr-only');
  announcer.setAttribute('role', 'status');
  root.append(view, voiceNote, status, announcer);
  let saving = Promise.resolve();
  let noteShown = false;
  const go = (hash) => {
    if (win) win.location.hash = hash;
  };
  const hydrate = () => {
    const K = win && win.Kotoba;
    if (K && typeof K.hydrate === 'function') K.hydrate(root);
  };

  const record = (step, correct) => {
    saving = saving.then(async () => {
      const key = VOCAB_PREFIX + step.w.id;
      try {
        const existing = store.get().srs[key];
        const card = await review(step.isNew && !existing ? null : existing, correct, now());
        // ngày của phiên, không phải lúc trả lời: phiên kéo qua nửa đêm không ăn hạn mức ngày mai
        const day = step.day;
        const res = store.update((d) => {
          d.srs[key] = card;
          if (step.isNew && !(d.tuVung[step.w.id] && d.tuVung[step.w.id].gioiThieu)) d.tuVung[step.w.id] = { gioiThieu: day };
        });
        status.textContent = res.ok ? '' : res.error;
      } catch {
        status.textContent = 'Không lưu được lịch ôn cho từ này.';
      }
    });
  };

  const showNote = () => {
    if (!noteShown) {
      voiceNote.textContent = NO_VOICE;
      voiceNote.hidden = false;
      noteShown = true;
    }
  };
  const play = (w) => {
    if (!canSpeakWord(w)) return false;
    if (!canSpeak() || speak(speakText(w)) === false) {
      showNote();
      return false;
    }
    return true;
  };

  const showEmpty = () => {
    const data = store.get();
    const next = nextVocabDue(data, known, now());
    const { remainingTotal } = newVocabToday(data, allVocab(), localDate(now()));
    const text = !remainingTotal
      ? `Bạn đã học hết ${allVocab().length} từ N5.${next ? ` Thẻ tiếp theo đến hạn lúc ${formatWhen(next)}.` : ''}`
      : `Đã đủ từ mới hôm nay.${next ? ` Thẻ tiếp theo đến hạn lúc ${formatWhen(next)}.` : ''} Mai học tiếp nhé.`;
    view.replaceChildren(
      renderEmptyState({
        title: 'Xong từ vựng hôm nay',
        text,
        actionLabel: 'Đổi số từ mới mỗi ngày',
        onAction: () => go(toHash('cai-dat')),
      }),
    );
    hydrate();
  };

  const start = () => {
    const data = store.get();
    const due = dueVocab(data, known, now())
      .slice(0, MAX_REVIEW)
      .map((id) => ({ w: vocabById(id), isNew: false }));
    const day = localDate(now());
    const fresh = newVocabToday(data, allVocab(), day).pack.map((w) => ({ w, isNew: true, day }));
    const steps = [...due, ...fresh];
    if (!steps.length) return showEmpty();
    if (!canSpeak()) showNote();
    const auto = autoSpeakOnFlip(data.settings);
    const session = renderQuizSession({
      title: 'Ôn từ vựng',
      skill: 'vocab',
      questions: steps,
      toQuestion: (step) => ({
        render: (answer) => {
          const card = renderVocabCard(step.w, {
            onPlay: () => {
              activity();
              play(step.w);
            }, canPlay: !!canSpeak() && canSpeakWord(step.w) });
          if (!canSpeakWord(step.w)) card.querySelector('[data-role=play]').dataset.never = '1';
          if (step.isNew) card.querySelector('.kt-flash__top .kt-chip').textContent = 'Từ mới';
          return flashStep(
            { card, label: `Thẻ từ vựng ${step.w.tu} (${step.w.nghia})`, revealText: `${step.w.tu}, đọc ${step.w.doc}: ${step.w.nghia}.` },
            answer,
            win,
            (t) => (announcer.textContent = t),
            () => {
              activity();
              if (auto && canSpeak()) play(step.w);
            },
          );
        },
      }),
      onActivity: activity,
      onAnswer: (step, correct) => record(step, correct),
      onClose: () => go(toHash('luyen-tap')),
      renderResult: ({ score, total }) =>
        renderGoalComplete({
          title: 'Ôn từ vựng xong!',
          text: `Bạn vừa xem ${total} từ (${fresh.length} từ mới), nhớ ${score} từ.`,
          chips: [{ text: `${total} từ`, className: 'kt-chip--vocab' }],
          actionLabel: 'Về Luyện tập',
          onAction: () => go(toHash('luyen-tap')),
        }),
    });
    view.replaceChildren(session);
    hydrate();
  };

  start();
  // giọng đọc nạp muộn (iOS, Chrome): hiện lại nút phát âm, ẩn ghi chú
  const offVoices = (deps.onVoicesChanged || onVoicesChanged)(() => {
    const ok = !!canSpeak();
    for (const b of root.querySelectorAll('[data-role=play]')) b.hidden = !ok || b.dataset.never === '1';
    if (ok) voiceNote.hidden = true;
  });
  return {
    node: root,
    idle: () => saving,
    cleanup: () => {
      if (typeof offVoices === 'function') offVoices();
      if (globalThis.speechSynthesis && typeof globalThis.speechSynthesis.cancel === 'function') globalThis.speechSynthesis.cancel();
    },
  };
}
