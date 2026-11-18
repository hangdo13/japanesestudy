import { describe, it, expect, vi } from 'vitest';
import { renderQuizSession } from './quiz-session.js';

describe('renderQuizSession', () => {
  it('thanh tiến độ, onAnswer, kết quả nhận focus, nút đóng', () => {
    const onAnswer = vi.fn();
    const onClose = vi.fn();
    const qs = [{ id: 1 }, { id: 2 }];
    const node = renderQuizSession({
      title: 'Thử',
      questions: qs,
      toQuestion: () => ({ prompt: 'Hỏi', options: ['a', 'b'], answer: 0 }),
      onAnswer,
      onClose,
      renderResult: ({ score, total, wrong }) => {
        const s = document.createElement('section');
        s.innerHTML = `<h2>${score}/${total}</h2><p>${wrong.length}</p>`;
        return s;
      },
    });
    document.body.replaceChildren(node);
    const seg = node.querySelector('[role=progressbar]');
    expect(seg.getAttribute('aria-valuenow')).toBe('0');
    node.querySelectorAll('.kt-option')[0].click();
    expect(onAnswer).toHaveBeenCalledWith(qs[0], true);
    node.querySelector('.kt-feedback .kt-btn--primary').click();
    expect(seg.getAttribute('aria-valuenow')).toBe('1');
    node.querySelectorAll('.kt-option')[1].click();
    expect(onAnswer).toHaveBeenLastCalledWith(qs[1], false);
    node.querySelector('.kt-feedback .kt-btn--primary').click();
    const h = node.querySelector('h2');
    expect(h.textContent).toBe('1/2');
    expect(document.activeElement).toBe(h);
    node.querySelector('[aria-label="Đóng"]').click();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('renderQuizSession: bước tự dựng và focus lần đầu', () => {
  it('render: answer chỉ tính một lần; focus câu đầu sau khi gắn vào trang', async () => {
    const onAnswer = vi.fn();
    let answerFn;
    const node = renderQuizSession({
      title: 'T',
      questions: [{ id: 1 }, { id: 2 }],
      toQuestion: (q) =>
        q.id === 1
          ? {
              render: (answer) => {
                answerFn = answer;
                const d = document.createElement('div');
                d.className = 'kt-deck';
                d.tabIndex = 0;
                return d;
              },
            }
          : { prompt: 'Hỏi', options: ['a', 'b'], answer: 0 },
      onAnswer,
      onClose: () => {},
      renderResult: () => document.createElement('section'),
    });
    document.body.replaceChildren(node);
    await Promise.resolve();
    expect(document.activeElement.className).toBe('kt-deck');
    answerFn(true);
    answerFn(false);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 2');
    expect(document.activeElement.classList.contains('kt-option')).toBe(true);
  });
});
