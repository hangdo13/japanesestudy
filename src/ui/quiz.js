/**
 * Câu trắc nghiệm theo kotoba-ui/components/QuizOption/preview.html.
 * Chọn một đáp án thì khoá các nút, đánh dấu đúng/sai (icon + màu), hiện hộp phản hồi có Pyon.
 */
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function stateIcon(name) {
  const i = el('i', 'kt-option__state');
  i.dataset.icon = name;
  return i;
}

/**
 * @param {object} q
 * @param {Node|string} q.prompt  nội dung câu hỏi
 * @param {(Node|string)[]} q.options  nội dung từng đáp án
 * @param {number} q.answer  chỉ số đáp án đúng
 * @param {(correct: boolean, chosen: number) => void} [q.onAnswer]
 * @param {() => void} [q.onNext]
 * @param {(correct: boolean) => (Node|string)} [q.explain]  dòng giải thích trong hộp phản hồi
 * @param {string} [q.nextLabel]
 */
export function renderQuestion({ prompt, options, answer, onAnswer, onNext, explain, nextLabel = 'Tiếp tục' }) {
  const wrap = el('div', 'kt-stack');
  const p = el('div', 'title app-quiz__prompt');
  p.append(prompt);
  wrap.append(p);

  const buttons = options.map((content, i) => {
    const b = el('button', 'kt-option');
    b.type = 'button';
    const text = el('span', 'kt-option__text');
    text.append(content);
    b.append(el('span', 'kt-option__key', KEYS[i]), text);
    wrap.append(b);
    return b;
  });

  let done = false;
  buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      if (done) return;
      done = true;
      const correct = i === answer;
      buttons.forEach((x) => {
        x.disabled = true;
      });
      buttons[answer].classList.add('is-correct');
      buttons[answer].append(stateIcon('check'), el('span', 'app-sr-only', ' (đáp án đúng)'));
      if (!correct) {
        b.classList.add('is-wrong');
        b.append(stateIcon('x'), el('span', 'app-sr-only', ' (bạn chọn, sai)'));
      }

      const fb = el('div', `kt-feedback${correct ? '' : ' kt-feedback--wrong'}`);
      fb.setAttribute('role', 'status');
      const mascot = el('span', 'kt-feedback__mascot kt-mascot');
      mascot.dataset.mascot = correct ? 'happy' : 'oops';
      mascot.dataset.size = '64';
      const body = el('div', 'kt-feedback__body');
      body.append(el('b', null, correct ? 'Đúng rồi!' : 'Chưa đúng rồi'));
      if (explain) {
        const line = el('span');
        line.append(explain(correct));
        body.append(line);
      }
      const next = el('button', 'kt-btn kt-btn--primary kt-btn--sm', nextLabel);
      next.type = 'button';
      next.addEventListener('click', () => {
        if (next.disabled) return;
        next.disabled = true; // chống bấm hai lần làm nhảy câu
        if (onNext) onNext();
      });
      fb.append(mascot, body, next);
      wrap.append(fb);
      if (globalThis.Kotoba && typeof globalThis.Kotoba.hydrate === 'function') globalThis.Kotoba.hydrate(wrap);
      if (onAnswer) onAnswer(correct, i);
      next.focus();
    }),
  );

  return wrap;
}
