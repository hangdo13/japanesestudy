import { kanaRules } from '../../core/content.js';
import { buildReadingSession } from '../../core/reading-quiz.js';
import { toHash } from '../../core/router.js';
import { studyClock } from '../../core/study-clock.js';
import { renderQuizSession } from '../../ui/quiz-session.js';
import { speakJa, canSpeakJapanese, onVoicesChanged } from '../../ui/speech.js';

export const QUY_TAC = 'quy-tac';

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
function hydrate(node) {
  if (globalThis.Kotoba && typeof globalThis.Kotoba.hydrate === 'function') globalThis.Kotoba.hydrate(node);
}

/**
 * Màn quy tắc đọc kana + bài luyện đọc từ.
 * deps: canSpeak, speak, onVoicesChanged, rng
 * @returns {{ node: HTMLElement, cleanup: () => void }}
 */
export function renderRules(deps = {}) {
  const rules = kanaRules();
  const speak = deps.speak || speakJa;
  const can = deps.canSpeak || canSpeakJapanese;
  const activity = deps.activity || (() => studyClock().activity());
  const root = el('div', 'kt-stack');
  const speakButtons = [];

  const speakBtn = (text, label) => {
    const b = el('button', 'kt-iconbtn kt-iconbtn--sm');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    const i = document.createElement('i');
    i.dataset.icon = 'volume';
    b.append(i);
    b.addEventListener('click', () => {
      activity();
      speak(text);
    });
    speakButtons.push(b);
    return b;
  };
  const syncVoice = () => {
    const ok = can();
    for (const b of speakButtons) b.hidden = !ok;
  };

  function showRules({ focus = false } = {}) {
    speakButtons.length = 0;
    const wrap = el('div', 'kt-stack');
    const back = el('a', 'kt-link', '‹ Bảng chữ cái');
    back.href = toHash('kana');
    const head = el('div', 'kt-sechead');
    head.append(el('h2', null, 'Quy tắc đọc'));
    const start = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Luyện đọc từ');
    start.type = 'button';
    start.addEventListener('click', startSession);
    start.dataset.role = 'start';
    wrap.append(back, head, start);
    if (rules.reviewStatus !== 'approved') wrap.append(el('p', 'kt-muted kana-text', 'Phần giải thích do AI soạn, chưa duyệt.'));

    let n = 0;
    for (const m of rules.muc) {
      const card = el('section', 'kt-card kt-stack kana-rule');
      card.id = `quy-tac-${m.id}`;
      card.append(el('h3', 'title kana-text', m.tieuDe), el('p', 'kana-text', m.giaiThich));
      const list = el('ul', 'kana-examples');
      for (const v of m.viDu) {
        const li = el('li', 'kana-example');
        const words = el('div', 'kana-example__words');
        words.append(jp('span', 'kana-example__doc', v.doc));
        if (v.tu && v.tu !== v.doc) words.append(jp('span', 'kt-muted kana-example__tu', v.tu));
        words.append(el('span', 'kana-example__romaji', v.romaji), el('span', 'kt-muted kana-example__nghia', v.nghia));
        n += 1;
        li.append(words, speakBtn(v.doc, `Nghe ví dụ ${n}: ${v.romaji}`));
        list.append(li);
      }
      card.append(list);
      wrap.append(card);
    }
    root.replaceChildren(wrap);
    syncVoice();
    hydrate(root);
    if (focus) start.focus(); // quay lại từ phiên luyện: không để focus rơi về đầu trang
  }
  const backToRules = () => showRules({ focus: true });

  function startSession() {
    const questions = buildReadingSession(rules, { rng: deps.rng });
    const session = renderQuizSession({
      onActivity: activity,
      title: 'Luyện đọc từ',
      questions,
      toQuestion: (q) => {
        const prompt = el('span', 'kt-stack kana-read');
        prompt.append(jp('span', 'kana-read__doc', q.doc), el('span', 'kt-muted kana-read__nghia', q.nghia));
        return {
          prompt,
          options: q.options,
          answer: q.answer,
          explain: () => {
            const s = el('span');
            s.append(jp('span', null, q.doc), document.createTextNode(` = ${q.romaji}`));
            if (/ou|ei/.test(q.romaji) && !q.troTu) s.append(document.createTextNode(' (ou = ô dài, ei = ê dài; nhiều sách viết ou thành ō)'));
            return s;
          },
        };
      },
      onClose: backToRules,
      renderResult: ({ score, total, wrong }) => {
        const card = el('section', 'kt-card kt-stack');
        const hw = el('div', 'kt-sechead');
        hw.append(el('h2', null, `Kết quả: ${score} / ${total}`));
        card.append(hw);
        if (wrong.length) {
          card.append(el('p', 'kana-text', 'Đọc lại các từ này:'));
          const list = el('ul', 'kana-examples');
          for (const q of wrong) {
            const li = el('li', 'kana-example');
            const words = el('div', 'kana-example__words');
            words.append(jp('span', 'kana-example__doc', q.doc), el('span', 'kana-example__romaji', q.romaji), el('span', 'kt-muted kana-example__nghia', q.nghia));
            li.append(words);
            list.append(li);
          }
          card.append(list);
        } else card.append(el('p', 'kana-text', 'Đọc đúng hết. Tuyệt vời!'));
        const again = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Luyện lại');
        again.type = 'button';
        again.addEventListener('click', startSession);
        const back = el('button', 'kt-btn kt-btn--soft kt-btn--block', 'Xem quy tắc');
        back.type = 'button';
        back.addEventListener('click', backToRules);
        card.append(again, back);
        return card;
      },
    });
    root.replaceChildren(session);
    hydrate(root);
  }

  showRules();
  const offVoices = (deps.onVoicesChanged || onVoicesChanged)(syncVoice);
  return {
    node: root,
    cleanup: () => {
      if (typeof offVoices === 'function') offVoices();
    },
  };
}
