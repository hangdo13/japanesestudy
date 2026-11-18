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
