import { it, expect } from 'vitest';
import { mount } from './index.js';

it('ghi công đủ ba nguồn kèm giấy phép và link', () => {
  const el = document.createElement('div');
  mount(el);
  const text = el.textContent;
  expect(text).toContain('JLPTSuccess');
  expect(text).toContain('MIT');
  expect(text).toContain('KanjiVG');
  expect(text).toContain('CC BY-SA 3.0');
  expect(text).toContain('VOICEVOX');
  const hrefs = [...el.querySelectorAll('a')].map((a) => a.href);
  expect(hrefs).toEqual(
    expect.arrayContaining([
      'https://github.com/gauravhq/JLPTSuccess',
      'https://kanjivg.tagaini.net/',
      'https://voicevox.hiroshiba.jp/',
    ]),
  );
});
