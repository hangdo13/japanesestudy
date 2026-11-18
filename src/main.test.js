import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { start } from './main.js';
import { ROUTES, toHash } from './core/router.js';

const flush = () => new Promise((r) => setTimeout(r, 0));

// Nội dung thật mà mỗi route phải hiện, đi qua bảng feature trong start()
const EXPECTED = {
  '': 'Trang chủ sắp có',
  kanji: 'Kanji sắp có',
  'hoc-ngay': 'Học ngay sắp có',
  'luyen-tap': 'Luyện tập sắp có',
  'cai-dat': 'Cài đặt sắp có',
  'gioi-thieu': 'Nguồn nội dung',
};

describe('start(): nối route với tính năng thật', () => {
  let router;
  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.location.hash = '';
    await flush();
    router = start(document.getElementById('app'));
  });
  afterEach(() => router.stop());

  it('mọi route trong ROUTES đều có nội dung mong đợi', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(Object.keys(ROUTES).sort());
  });

  for (const [name, text] of Object.entries(EXPECTED)) {
    it(`route "${name || 'trang chủ'}" hiện "${text}"`, async () => {
      window.location.hash = toHash(name);
      await flush();
      const main = document.querySelector('.app-main');
      expect(main.textContent).toContain(text);
      expect(main.textContent).not.toContain('Không tìm thấy trang này');
    });
  }

  it('nút "Xem giới thiệu" ở Cài đặt mở trang Giới thiệu và giữ tab Cài đặt', async () => {
    window.location.hash = toHash('cai-dat');
    await flush();
    document.querySelector('.app-main .kt-empty button').click();
    await flush();
    expect(window.location.hash).toBe('#/gioi-thieu');
    expect(document.querySelector('.app-main').textContent).toContain('Nguồn nội dung');
    const tab = document.querySelector('[data-route="cai-dat"]');
    expect(tab.getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('.kt-topbar__title').textContent).toBe('Giới thiệu');
  });
});
