// Cửa duy nhất để tính năng đọc nội dung (AD-3).
// content/*.json do scripts/build-content.mjs sinh ra trước khi chạy dev/test/build.
import kanjiData from '../../content/kanji.json';
import kanaData from '../../content/kana.json';
import kanaRulesData from '../../content/kana-quy-tac.json';
import kanaSoundsData from '../../content/kana-phat-am.json';
import vocabData from '../../content/vocab.json';

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

const kanaList = deepFreeze(kanaData.items);
const kanaPairList = deepFreeze(kanaData.capDeNham || []);

/** Trạng thái duyệt của nội dung kana (AI soạn). */
export function kanaReviewStatus() {
  return kanaData.reviewStatus || 'draft';
}

/** Toàn bộ kana (hiragana + katakana), theo thứ tự bảng. */
export function kana() {
  return kanaList;
}

/** Một kana theo chữ (ví dụ 'し', 'きゃ', 'ティ'), hoặc null. */
export function kanaById(id) {
  return kanaList.find((k) => k.id === id) ?? null;
}

/** Các chữ dễ nhầm với `id` (không gồm chính nó). */
export function kanaPairs(id) {
  const out = new Set();
  for (const group of kanaPairList) if (group.includes(id)) group.forEach((g) => g !== id && out.add(g));
  return [...out];
}

const kanaRulesFrozen = deepFreeze({
  reviewStatus: kanaRulesData.reviewStatus || 'draft',
  muc: kanaRulesData.muc || [],
  cauTroTu: kanaRulesData.cauTroTu || [],
  tuLuyen: kanaRulesData.tuLuyen || [],
});

/** Quy tắc đọc kana (っ, trường âm, ー, trợ từ, katakana mở rộng), câu trợ từ và từ luyện đọc. */
export function kanaRules() {
  return kanaRulesFrozen;
}

const kanaSoundsFrozen = deepFreeze({
  reviewStatus: kanaSoundsData.reviewStatus || 'draft',
  muc: kanaSoundsData.muc || [],
  capAm: kanaSoundsData.capAm || [],
});

/** Giải thích phát âm (phách, nguyên âm vô thanh, ん, r) và các cặp âm dễ nhầm. */
export function kanaSounds() {
  return kanaSoundsFrozen;
}

const vocabList = deepFreeze(vocabData.items || []);
const vocabMap = new Map(vocabList.map((w) => [w.id, w]));
const chuDeList = deepFreeze(vocabData.chuDe || []);

/** 718 từ vựng N5 (thứ tự gốc theo id). */
export function vocab() {
  return vocabList;
}

/** Một từ theo id `n5-xxxx`, hoặc null. */
export function vocabById(id) {
  return vocabMap.get(id) ?? null;
}

/** Tên các chủ đề từ vựng theo thứ tự lộ trình. */
export function vocabTopics() {
  return chuDeList;
}

/** Ghép đường dẫn file trong public/ với base của app (GitHub Pages chạy ở /japanesestudy/). */
export function assetUrl(path, base = import.meta.env.BASE_URL) {
  const b = base.endsWith('/') ? base : `${base}/`;
  return b + String(path).split('/').map(encodeURIComponent).join('/');
}
