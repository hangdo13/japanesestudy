// Tách phách (mora) cho kana. Hàm thuần, dùng cả lúc build lẫn trong app.

/** Chữ nhỏ ghép với chữ đứng trước thành một phách (ゃ ゅ ょ, và nguyên âm nhỏ của katakana mở rộng). */
const SMALL = new Set([...'ゃゅょゎぁぃぅぇぉャュョヮァィゥェォ']);
const KANA = /^[ぁ-ゖァ-ヺー]+$/u;

/**
 * Tách chuỗi kana thành các phách: とうきょう → ['と','う','きょ','う'].
 * っ, ん, ー mỗi cái là một phách. Trả null nếu có ký tự không phải kana hoặc chữ nhỏ đứng đầu.
 * @param {string} text
 * @returns {string[]|null}
 */
export function splitMora(text) {
  const s = String(text || '');
  if (!s || !KANA.test(s)) return null;
  // ー, っ, ん không đứng đầu; っ không đứng cuối; ー không đứng sau ー/っ/ん
  if (/^[っッんンー]/u.test(s) || /[っッ]$/u.test(s) || /[ーっッんン]ー/u.test(s) || /[っッ][っッ]/u.test(s)) return null;
  const out = [];
  for (const ch of s) {
    if (SMALL.has(ch)) {
      if (!out.length || out[out.length - 1].length > 1 || /[っッんンー]/.test(out[out.length - 1])) return null;
      out[out.length - 1] += ch;
    } else out.push(ch);
  }
  return out;
}

/** Số phách, hoặc null. */
export function countMora(text) {
  const m = splitMora(text);
  return m ? m.length : null;
}
