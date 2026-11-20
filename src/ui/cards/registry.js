/**
 * Bảng đăng ký thẻ ôn (AD-8): loại thẻ → hàm dựng Flashcard. Màn ôn chỉ hỏi bảng này,
 * nên loại thẻ mới (cách đọc, câu thi sai) chỉ cần đăng ký thêm. Loại chưa đăng ký: trả null để bỏ qua.
 */
import { renderKanjiCard } from './kanji.js';
import { renderVocabCard } from './vocab.js';

const registry = new Map();

/** Đăng ký hàm dựng thẻ cho một loại. */
export function registerCard(kind, render) {
  registry.set(kind, render);
}

/** Dựng thẻ của loại `kind`, hoặc null nếu loại chưa đăng ký. */
export function renderCard(kind, item, opts) {
  const render = registry.get(kind);
  return render ? render(item, opts) : null;
}

/** Loại đã đăng ký chưa. */
export function hasCard(kind) {
  return registry.has(kind);
}

registerCard('kanji', renderKanjiCard);
registerCard('vocab', renderVocabCard);
