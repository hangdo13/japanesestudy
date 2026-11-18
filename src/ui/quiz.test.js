import { describe, it, expect, vi } from 'vitest';
import { renderQuestion } from './quiz.js';

function make(extra = {}) {
  const onAnswer = vi.fn();
  const onNext = vi.fn();
  const node = renderQuestion({ prompt: 'Hỏi', options: ['a', 'i', 'u', 'e'], answer: 2, onAnswer, onNext, explain: () => 'う = u', ...extra });
  document.body.replaceChildren(node);
  return { node, onAnswer, onNext, opts: [...node.querySelectorAll('.kt-option')] };
}

describe('renderQuestion', () => {
  it('đúng markup QuizOption: phím A–D', () => {
    const { opts } = make();
    expect(opts.map((o) => o.querySelector('.kt-option__key').textContent)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('chọn đúng: is-correct + icon check, feedback happy 64, nút Tiếp tục', () => {
    const { node, opts, onAnswer } = make();
    opts[2].click();
    expect(onAnswer).toHaveBeenCalledWith(true, 2);
    expect(opts[2].classList.contains('is-correct')).toBe(true);
    expect(opts[2].querySelector('i.kt-option__state').dataset.icon).toBe('check');
    const fb = node.querySelector('.kt-feedback');
    expect(fb.classList.contains('kt-feedback--wrong')).toBe(false);
    expect(fb.querySelector('.kt-mascot').dataset.mascot).toBe('happy');
    expect(fb.querySelector('.kt-mascot').dataset.size).toBe('64');
    expect(fb.querySelector('.kt-btn--primary').textContent).toBe('Tiếp tục');
    expect(fb.textContent).toContain('う = u');
  });

  it('chọn sai: đánh dấu sai + vẫn hiện đáp án đúng, feedback oops, có chữ cho trình đọc màn hình', () => {
    const { node, opts, onAnswer } = make();
    opts[0].click();
    expect(onAnswer).toHaveBeenCalledWith(false, 0);
    expect(opts[0].classList.contains('is-wrong')).toBe(true);
    expect(opts[0].querySelector('i.kt-option__state').dataset.icon).toBe('x');
    expect(opts[2].classList.contains('is-correct')).toBe(true);
    expect(opts[2].textContent).toContain('đáp án đúng');
    expect(opts[0].textContent).toContain('sai');
    expect(node.querySelector('.kt-feedback--wrong .kt-mascot').dataset.mascot).toBe('oops');
  });

  it('bấm đáp án thứ hai không tính lại; khoá hết nút; chỉ một hộp phản hồi', () => {
    const { node, opts, onAnswer } = make();
    opts[0].click();
    opts[2].click();
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(opts.every((o) => o.disabled)).toBe(true);
    expect(node.querySelectorAll('.kt-feedback')).toHaveLength(1);
  });

  it('bấm Tiếp tục hai lần chỉ gọi onNext một lần', () => {
    const { node, opts, onNext } = make();
    opts[1].click();
    const btn = node.querySelector('.kt-feedback .kt-btn--primary');
    btn.click();
    btn.click();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
