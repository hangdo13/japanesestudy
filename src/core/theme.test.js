import { it, expect } from 'vitest';
import { startTheme } from './theme.js';

function fakeWindow(dark) {
  const listeners = [];
  const mq = {
    matches: dark,
    addEventListener: (_e, fn) => listeners.push(fn),
  };
  return {
    win: { matchMedia: () => mq },
    toggle(v) {
      mq.matches = v;
      listeners.forEach((fn) => fn());
    },
  };
}

it('đặt data-theme theo hệ thống và đổi theo khi hệ thống đổi', () => {
  const { win, toggle } = fakeWindow(true);
  startTheme(document, win);
  expect(document.documentElement.dataset.theme).toBe('dark');
  toggle(false);
  expect(document.documentElement.dataset.theme).toBe('light');
});
