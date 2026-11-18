import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mount } from './index.js';
import { kanaPairs } from '../../core/content.js';

const SVG = readFileSync(join(process.cwd(), 'public/kana/svg/し.svg'), 'utf8');
afterEach(() => {
  window.location.hash = '';
});

function render(param, deps = {}) {
  const el = document.createElement('div');
  document.body.replaceChildren(el);
  const fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(SVG) }));
  el.cleanup = mount(el, { param }, { fetch, canSpeak: () => true, speak: vi.fn(() => true), onVoicesChanged: () => () => {}, ...deps });
  el.fetch = fetch;
  return el;
}

describe('bảng kana', () => {
  it('tab Hiragana: 46 chữ cơ bản trong lưới 5 cột có ô trống, rồi đục, bán đục, ghép', () => {
    const el = render(null);
    const sections = [...el.querySelectorAll('section')];
    expect(sections.map((s) => s.querySelector('h2').textContent)).toEqual([
      'Âm cơ bản (46)',
      'Âm đục (20)',
      'Âm bán đục (5)',
      'Âm ghép (33)',
    ]);
    const basic = sections[0].querySelector('.kana-grid');
    expect(basic.querySelectorAll('a.kana-cell')).toHaveLength(46);
    expect(basic.children).toHaveLength(55); // 11 hàng × 5 cột
    const shi = [...basic.querySelectorAll('a')].find((a) => a.textContent.startsWith('し'));
    expect(shi.textContent).toContain('shi');
    expect(shi.getAttribute('href')).toBe('#/kana/%E3%81%97');
    expect(el.querySelector('.kana-tabs [aria-current=page]').textContent).toBe('Hiragana');
    // hàng y: や _ ゆ _ よ ; hàng n: ん _ _ _ _
    const cells = [...basic.children];
    const yRow = cells.slice(35, 40).map((c) => (c.tagName === 'A' ? c.textContent[0] : '_'));
    expect(yRow).toEqual(['や', '_', 'ゆ', '_', 'よ']);
    const nRow = cells.slice(50, 55).map((c) => (c.tagName === 'A' ? c.textContent[0] : '_'));
    expect(nRow).toEqual(['ん', '_', '_', '_', '_']);
    expect(el.textContent).toContain('do AI soạn, chưa duyệt');
  });

  it('tab Katakana có thêm phần mở rộng', () => {
    const el = render('katakana');
    const titles = [...el.querySelectorAll('section h2')].map((h) => h.textContent);
    expect(titles).toContain('Katakana mở rộng (từ mượn) (22)');
    expect(el.querySelector('.kana-tabs [aria-current=page]').textContent).toBe('Katakana');
    expect(el.textContent).toContain('ティ');
  });
});

describe('chi tiết kana', () => {
  it('し: romaji, ghi chú, phát âm, nét viết, chữ dễ nhầm', async () => {
    const speak = vi.fn(() => true);
    const el = render('し', { speak });
    expect(el.textContent).toContain('shi');
    expect(el.textContent).toContain('không phải "si"');
    el.querySelector('.kt-btn--soft').click();
    expect(speak).toHaveBeenCalledWith('し');
    await el.querySelector('.kanji-strokes').ready;
    expect(el.querySelector('.kanji-strokes svg')).not.toBeNull();
    expect(el.fetch).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}kana/svg/%E3%81%97.svg`);
  });

  it('chữ ghép không có phần nét viết', () => {
    const el = render('きゃ');
    expect(el.textContent).toContain('kya');
    expect(el.querySelector('.kanji-strokes')).toBeNull();
  });

  it('シ dễ nhầm với ツ và ミ', () => {
    expect(kanaPairs('シ').sort()).toEqual(['ツ', 'ミ'].sort());
    const el = render('シ');
    const links = [...el.querySelectorAll('section a.kana-cell')].map((a) => a.textContent[0]);
    expect(links).toEqual(expect.arrayContaining(['ツ', 'ミ']));
  });

  it('máy không có giọng Nhật thì ẩn nút phát và hiện hướng dẫn', () => {
    const el = render('あ', { canSpeak: () => false });
    expect(el.querySelector('.kt-btn--soft').hidden).toBe(true);
    expect(el.querySelector('[role=status]').textContent).toContain('giọng đọc tiếng Nhật');
  });

  it('giọng tải muộn: khi có giọng thì hiện nút; lỗi phát không bị xoá', () => {
    let fire;
    let can = false;
    const speak = vi.fn(() => false);
    const el = render('あ', { canSpeak: () => can, speak, onVoicesChanged: (cb) => ((fire = cb), () => {}) });
    const btn = el.querySelector('.kt-btn--soft');
    expect(btn.hidden).toBe(true);
    can = true;
    fire();
    expect(btn.hidden).toBe(false);
    expect(el.querySelector('[role=status]').textContent).toBe('');
    btn.click();
    fire();
    expect(el.querySelector('[role=status]').textContent).toContain('Không phát được');
  });

  it('chi tiết katakana có link về bảng katakana', () => {
    expect(render('ア').querySelector('a.kt-link').getAttribute('href')).toBe('#/kana/katakana');
  });

  it('chữ lạ hiện EmptyState có nút về bảng', () => {
    const el = render('abc');
    expect(el.querySelector('.kt-empty').textContent).toContain('Không tìm thấy chữ này');
    el.querySelector('.kt-empty button').click();
    expect(window.location.hash).toBe('#/kana');
  });
});
