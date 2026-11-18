/**
 * Khung một phiên trắc nghiệm: nút đóng, SegmentedProgress, đếm câu, từng câu (ui/quiz), màn kết quả.
 * Dùng chung cho các bài luyện; tính năng chỉ cung cấp câu hỏi và màn kết quả.
 */
import { renderQuestion } from './quiz.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}
/** Focus `n`; nếu phiên chưa gắn vào trang (lần đầu) thì đợi gắn xong. */
function focusSoon(n) {
  if (!n) return;
  if (n.isConnected) n.focus();
  else queueMicrotask(() => n.isConnected && n.focus());
}
function hydrate(node) {
  if (globalThis.Kotoba && typeof globalThis.Kotoba.hydrate === 'function') globalThis.Kotoba.hydrate(node);
}

/**
 * @param {object} o
 * @param {string} o.title  nhãn vùng phiên (cho trình đọc màn hình)
 * @param {object[]} o.questions
 * @param {(q: object) => ({ prompt: Node|string, options: (Node|string)[], answer: number, explain?: Function } | { render: (answer: (correct: boolean) => void) => Node })} o.toQuestion
 *   Trả `render` cho bước tự dựng (vd. Flashcard): gọi `answer(correct)` một lần để chấm và sang bước sau.
 * @param {(q: object, correct: boolean) => void} [o.onAnswer]
 * @param {() => void} o.onClose
 * @param {(r: { score: number, total: number, wrong: object[] }) => Node} o.renderResult
 * @returns {HTMLElement}
 */
export function renderQuizSession({ title, questions, toQuestion, onAnswer, onClose, renderResult }) {
  const head = el('div', 'kt-session__head');
  const close = el('button', 'kt-iconbtn kt-iconbtn--sm');
  close.type = 'button';
  close.setAttribute('aria-label', 'Đóng');
  const x = document.createElement('i');
  x.dataset.icon = 'x';
  close.append(x);
  close.addEventListener('click', onClose);
  const seg = el('div', 'kt-seg kt-seg--kanji kt-seg--thick');
  seg.setAttribute('role', 'progressbar');
  seg.setAttribute('aria-label', 'Tiến độ phiên');
  seg.setAttribute('aria-valuemin', '0');
  seg.setAttribute('aria-valuemax', String(questions.length));
  const count = el('span', 'kt-count');
  head.append(close, seg, count);
  const body = el('div', 'kt-stack');
  const node = el('section', 'kt-session');
  node.setAttribute('aria-label', title);
  node.append(head, body);

  let i = 0;
  let score = 0;
  const wrong = [];

  const bar = () => {
    seg.replaceChildren(...questions.map((_, j) => Object.assign(el('i'), { className: j < i ? 'on' : '' })));
    seg.setAttribute('aria-valuenow', String(i));
    count.textContent = `${Math.min(i + 1, questions.length)} / ${questions.length}`;
  };

  const ask = () => {
    bar();
    if (i >= questions.length) {
      head.hidden = true;
      const result = renderResult({ score, total: questions.length, wrong });
      body.replaceChildren(result);
      hydrate(body);
      const h = result.querySelector('h2');
      if (h) {
        h.tabIndex = -1;
        focusSoon(h);
      }
      return;
    }
    const q = questions[i];
    const spec = toQuestion(q);
    const record = (correct) => {
      if (correct) score += 1;
      else wrong.push(q);
      if (onAnswer) onAnswer(q, correct);
    };
    const advance = () => {
      i += 1;
      ask();
    };
    if (typeof spec.render === 'function') {
      let used = false;
      body.replaceChildren(
        spec.render((correct) => {
          if (used) return;
          used = true;
          record(correct);
          advance();
        }),
      );
    } else body.replaceChildren(renderQuestion({ ...spec, onAnswer: record, onNext: advance }));
    hydrate(body);
    // bước tự lo focus (vd. bài nghe focus nút "Nghe lại") thì trả `autoFocus: false`
    if (spec.autoFocus !== false) focusSoon(body.querySelector('.kt-option, .kt-deck'));
  };

  hydrate(head);
  ask();
  return node;
}
