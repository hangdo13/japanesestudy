import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRouter, parseHash, toHash, ROUTES } from './router.js';
import { buildShell } from '../main.js';

function fakeFeature(name) {
  return {
    mount: vi.fn((el, params) => {
      const p = document.createElement('p');
      p.dataset.feature = name;
      p.textContent = params.param ?? '';
      el.append(p);
    }),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

async function setup() {
  document.body.innerHTML = '<div id="app"></div>';
  window.location.hash = '';
  await flush();
  window.Kotoba = { hydrate: vi.fn() };
  const { main, setActive, shell } = buildShell(document.getElementById('app'));
  const features = Object.fromEntries(Object.keys(ROUTES).map((k) => [k, fakeFeature(k)]));
  const router = createRouter({ outlet: main, features, onRoute: setActive });
  return { main, shell, features, router };
}

describe('parseHash / toHash', () => {
  it('hash rỗng là trang chủ', () => {
    expect(parseHash('')).toEqual({ name: '', param: null });
    expect(parseHash('#/')).toEqual({ name: '', param: null });
  });
  it('giải mã tham số', () => {
    expect(parseHash(toHash('kanji', '日'))).toEqual({ name: 'kanji', param: '日' });
  });
});

describe('router', () => {
  let ctx;
  beforeEach(async () => {
    ctx = await setup();
  });
  afterEach(() => {
    ctx.router.stop();
    vi.restoreAllMocks();
    delete window.Kotoba;
  });

  it('mở trang chủ khi không có hash và hydrate nội dung', () => {
    expect(ctx.features[''].mount).toHaveBeenCalledTimes(1);
    expect(ctx.main.querySelector('[data-feature=""]')).not.toBeNull();
    expect(window.Kotoba.hydrate).toHaveBeenCalledWith(ctx.main);
    const homeTab = ctx.shell.querySelector('[data-route=""]');
    expect(homeTab.classList.contains('is-active')).toBe(true);
    expect(homeTab.getAttribute('aria-current')).toBe('page');
  });

  it('bấm tab Kanji thì đổi hash, mount kanji và đánh dấu tab', async () => {
    ctx.shell.querySelector('[data-route="kanji"]').click();
    await flush();
    expect(window.location.hash).toBe('#/kanji');
    expect(ctx.features.kanji.mount).toHaveBeenCalled();
    const tab = ctx.shell.querySelector('[data-route="kanji"]');
    expect(tab.classList.contains('is-active')).toBe(true);
    expect(tab.getAttribute('aria-current')).toBe('page');
    expect(ctx.shell.querySelector('[data-route=""]').hasAttribute('aria-current')).toBe(false);
  });

  it('route có tham số truyền param đã giải mã', async () => {
    window.location.hash = toHash('kanji', '日');
    await flush();
    expect(ctx.features.kanji.mount).toHaveBeenLastCalledWith(ctx.main, { param: '日' });
  });

  it('route lạ hiện EmptyState có nút về trang chủ, không lỗi', async () => {
    const errors = vi.spyOn(console, 'error');
    window.location.hash = '#/abc';
    await flush();
    const empty = ctx.main.querySelector('.kt-empty');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('Không tìm thấy trang này');
    empty.querySelector('button').click();
    await flush();
    expect(window.location.hash).toBe('#/');
    expect(errors).not.toHaveBeenCalled();
  });

  it('trang Giới thiệu có trong bảng route', () => {
    expect(ROUTES['gioi-thieu']).toBeDefined();
  });

  it('gọi hàm dọn dẹp của màn trước khi chuyển route, và stop() gỡ listener', async () => {
    const cleanup = vi.fn();
    ctx.features.kanji.mount.mockImplementation(() => cleanup);
    window.location.hash = '#/kanji';
    await flush();
    window.location.hash = '#/cai-dat';
    await flush();
    expect(cleanup).toHaveBeenCalledTimes(1);

    ctx.router.stop();
    const calls = ctx.features.kanji.mount.mock.calls.length;
    window.location.hash = '#/kanji';
    await flush();
    expect(ctx.features.kanji.mount.mock.calls.length).toBe(calls);
  });
});
