import { assetUrl } from '../core/content.js';

/**
 * KanjiVG khai báo tiền tố kvg: trong DTD. Bỏ DTD, prolog và comment,
 * rồi khai báo lại kvg: trên thẻ <svg> để trình phân tích XML nào cũng đọc được.
 */
export function cleanKanjiVg(text) {
  let s = String(text)
    .replace(/<\?xml[\s\S]*?\?>/, '')
    .replace(/<!DOCTYPE[^[>]*(\[[\s\S]*?\])?\s*>/i, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  if (!/xmlns:kvg=/.test(s)) s = s.replace(/<svg\b/, '<svg xmlns:kvg="http://kanjivg.tagaini.net"');
  return s.trim();
}

/**
 * Tải SVG thứ tự nét (KanjiVG) và nhúng thẳng vào trang để nét đổi màu theo theme.
 * Trả về phần tử khung; nội dung được điền khi tải xong.
 */
export function renderStrokes(svgPath, { fetchImpl = globalThis.fetch, label = 'Thứ tự nét viết' } = {}) {
  const box = document.createElement('div');
  box.className = 'kanji-strokes';
  box.setAttribute('aria-busy', 'true');
  let cancelled = false;
  box.cancel = () => {
    cancelled = true;
  };

  const fail = () => {
    if (cancelled) return;
    box.removeAttribute('aria-busy');
    box.className = 'kt-muted';
    box.textContent = 'Chưa tải được hình thứ tự nét.';
  };

  box.ready = Promise.resolve()
    .then(() => fetchImpl(assetUrl(svgPath)))
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((text) => {
      const doc = new DOMParser().parseFromString(cleanKanjiVg(text), 'image/svg+xml');
      const svg = doc.documentElement;
      if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
        throw new Error('SVG không hợp lệ');
      }
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      if (cancelled) return;
      box.removeAttribute('aria-busy');
      box.setAttribute('role', 'img');
      box.setAttribute('aria-label', label);
      box.replaceChildren(document.importNode(svg, true));
    })
    .catch(fail);

  return box;
}
