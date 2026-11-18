// Bài luyện phát âm: đếm phách và nghe cặp âm (hàm thuần).
import { shuffle } from './kana-quiz.js';
import { splitMora } from './mora.js';

const VOWEL_OF = {};
for (const [v, row] of Object.entries({
  a: 'あかさたなはまやらわがざだばぱ',
  i: 'いきしちにひみりぎじぢびぴ',
  u: 'うくすつぬふむゆるぐずづぶぷ',
  e: 'えけせてねへめれげぜでべぺ',
  o: 'おこそとのほもよろをごぞどぼぽ',
}))
  for (const ch of row) VOWEL_OF[ch] = v;
const SMALL_Y = { ゃ: 'a', ゅ: 'u', ょ: 'o' };
const VOWEL_KANA = { あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o' };

/** Nguyên âm cuối của một phách hiragana (きょ → o), hoặc null. */
function moraVowel(m) {
  const last = m[m.length - 1];
  return SMALL_Y[last] || VOWEL_OF[last] || null;
}

/** Có trường âm hiragana: phách sau là あいうえお kéo dài nguyên âm phách trước (おかあさん, とけい, きのう). */
export function hasLongVowel(phach) {
  for (let i = 1; i < phach.length; i++) {
    const v = VOWEL_KANA[phach[i]];
    const p = moraVowel(phach[i - 1]);
    if (v && p && (v === p || (p === 'e' && v === 'i') || (p === 'o' && v === 'u'))) return true;
  }
  return false;
}

/** Từ "đáng đếm": 2–8 phách và có っ, ん, ー, chữ nhỏ hoặc trường âm (chỗ hay đếm sai), hoặc dài từ 4 phách. */
export function isInterestingForMora(doc) {
  const m = splitMora(doc);
  if (!m || m.length < 2 || m.length > 8) return false;
  return /[っッんンーゃゅょぁぃぅぇぉャュョァィゥェォ]/u.test(doc) || hasLongVowel(m) || m.length >= 4;
}

/**
 * Phiên đếm phách: mỗi câu 4 đáp án là 4 số liền nhau (≥1) chứa số đúng, vị trí số đúng ngẫu nhiên.
 * @param {{doc: string, nghia: string}[]} words
 */
export function buildMoraSession(words, { count = 10, rng = Math.random } = {}) {
  const seen = new Set();
  const pool = words.filter((w) => {
    if (seen.has(w.doc) || !isInterestingForMora(w.doc)) return false;
    seen.add(w.doc);
    return true;
  });
  return shuffle(pool, rng)
    .slice(0, count)
    .map((w) => {
      const phach = splitMora(w.doc);
      const n = phach.length;
      // chọn vị trí đáp án đúng đều trong các vị trí giữ mọi số ≥ 1 (từ ngắn không bị lộ vị trí)
      const idx = Math.floor(rng() * Math.min(4, n));
      const options = [0, 1, 2, 3].map((k) => n - idx + k);
      return { doc: w.doc, nghia: w.nghia, phach, options, answer: idx };
    });
}

/**
 * Phiên nghe cặp âm: mỗi câu đọc một từ trong cặp, đáp án là hai từ của cặp.
 * @param {{a: object, b: object}[]} pairs
 */
export function buildPairSession(pairs, { count = 10, rng = Math.random } = {}) {
  const picked = [];
  while (picked.length < count && pairs.length) picked.push(...shuffle(pairs, rng));
  return picked.slice(0, count).map((p) => {
    const target = rng() < 0.5 ? p.a : p.b;
    const options = shuffle([p.a, p.b], rng);
    return { target, other: target === p.a ? p.b : p.a, options, answer: options.indexOf(target) };
  });
}
