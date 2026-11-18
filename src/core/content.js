// Cửa duy nhất để tính năng đọc nội dung (AD-3).
// content/*.json do scripts/build-content.mjs sinh ra trước khi chạy dev/test/build.
import kanjiData from '../../content/kanji.json';

/** Đóng băng sâu để không tính năng nào sửa được dữ liệu dùng chung. */
function deepFreeze(v) {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.values(v).forEach(deepFreeze);
    Object.freeze(v);
  }
  return v;
}

const kanjiList = deepFreeze(kanjiData.items);
const kanjiMap = new Map(kanjiList.map((k) => [k.id, k]));

/** Toàn bộ kanji N5, theo thứ tự bài học. */
export function kanji() {
  return kanjiList;
}

/** Một kanji theo chữ, hoặc null nếu không có. */
export function kanjiById(id) {
  return kanjiMap.get(id) ?? null;
}

/** Ghép đường dẫn file trong public/ với base của app (GitHub Pages chạy ở /japanesestudy/). */
export function assetUrl(path, base = import.meta.env.BASE_URL) {
  const b = base.endsWith('/') ? base : `${base}/`;
  return b + String(path).split('/').map(encodeURIComponent).join('/');
}
