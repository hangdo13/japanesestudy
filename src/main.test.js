import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { start } from './main.js';
import { ROUTES, toHash } from './core/router.js';

const flush = () => new Promise((r) => setTimeout(r, 0));

// Nội dung thật mà mỗi route phải hiện, đi qua bảng feature trong start()
const EXPECTED = {
  '': 'Trang chủ sắp có',
  kanji: 'Kanji N5',
  'hoc-ngay': 'Học ngay sắp có',
  'luyen-tap': 'Luyện tập sắp có',
  'cai-dat': 'Sao lưu tiến độ',
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

  it('link Giới thiệu ở Cài đặt mở trang Giới thiệu và giữ tab Cài đặt', async () => {
    window.location.hash = toHash('cai-dat');
    await flush();
    document.querySelector('.app-main a.kt-link').click();
    await vi.waitFor(() => expect(window.location.hash).toBe('#/gioi-thieu'));
    await flush();
    expect(window.location.hash).toBe('#/gioi-thieu');
    expect(document.querySelector('.app-main').textContent).toContain('JLPTSuccess');
    const tab = document.querySelector('[data-route="cai-dat"]');
    expect(tab.getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('.kt-topbar__title').textContent).toBe('Giới thiệu');
  });

  it('route chi tiết #/kanji/日 đi qua router tới trang chi tiết', async () => {
    window.location.hash = toHash('kanji', '日');
    await flush();
    expect(document.querySelector('.app-main').textContent).toContain('NHẬT');
  });

  it('route #/kanji/hoc-moi mở màn học chữ mới', async () => {
    localStorage.clear();
    window.location.hash = toHash('kanji', 'hoc-moi');
    await flush();
    expect(document.querySelector('.app-main .kt-session')).not.toBeNull();
  });
});
