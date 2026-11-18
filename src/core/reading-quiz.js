// Bài luyện đọc từ: nhìn kana chọn romaji. Đáp án sai là lỗi đọc thường gặp (hàm thuần).
import { shuffle } from './kana-quiz.js';

const V = 'aiueo';

/** Bỏ âm ngắt: kitte → kite, matcha → macha. */
function degeminate(r) {
  const out = new Set();
  const re = /(?:([bcdfghjkmprstvwz])\1|tch)/g;
  let m;
  while ((m = re.exec(r))) out.add(r.slice(0, m.index) + (m[0] === 'tch' ? 'ch' : m[1]) + r.slice(m.index + m[0].length));
  return [...out];
}

/** Rút ngắn trường âm: okaasan → okasan, gakkou → gakko. */
function shorten(r) {
  const out = new Set();
  const re = /(aa|ii|uu|ee|oo|ou|ei)/g;
  let m;
  while ((m = re.exec(r))) out.add(r.slice(0, m.index + 1) + r.slice(m.index + 2));
  return [...out];
}

/** Kéo dài một nguyên âm ngắn: kite → kiite. */
function lengthen(r) {
  const out = new Set();
  for (let i = 0; i < r.length; i++) {
    const c = r[i];
    if (!V.includes(c) || r[i + 1] === c || r[i - 1] === c) continue;
    if ((c === 'o' && r[i + 1] === 'u') || (c === 'e' && r[i + 1] === 'i')) continue;
    if ((c === 'u' && r[i - 1] === 'o') || (c === 'i' && r[i - 1] === 'e')) continue;
    out.add(r.slice(0, i + 1) + c + r.slice(i + 1));
  }
  return [...out];
}

/** Thêm âm ngắt sai chỗ: kite → kitte. */
function geminate(r) {
  const out = new Set();
  for (let i = 1; i < r.length; i++) {
    const c = r[i];
    if (!'kstp'.includes(c) || !V.includes(r[i - 1]) || r[i + 1] === c) continue;
    out.add(r.slice(0, i) + c + r.slice(i));
  }
  return [...out];
}

const VOICING = { k: 'g', g: 'k', t: 'd', d: 't', s: 'z', z: 's', h: 'b', b: 'h', p: 'b' };

/** Đổi đục/trong một phụ âm: kitte → gitte, tokei → dokei (lỗi nghe nhầm thật, không phải chữ vô nghĩa). */
function voicing(r) {
  const out = new Set();
  for (let i = 0; i < r.length; i++) {
    const c = r[i];
    if (!VOICING[c] || (i > 0 && !V.includes(r[i - 1]) && r[i - 1] !== 'n') || r[i + 1] === c || r[i - 1] === c) continue;
    if (c === 's' && r[i + 1] === 'h') continue;
    if (c === 't' && (r[i + 1] === 's' || r[i + 1] === 'c')) continue;
    if (c === 'h' && i > 0 && 'cs'.includes(r[i - 1])) continue;
    out.add(r.slice(0, i) + VOICING[c] + r.slice(i + 1));
  }
  return [...out];
}

/**
 * Ba cách đọc sai cho `romaji`, ưu tiên lỗi đúng quy tắc mà từ chứa.
 * @param {string} romaji
 * @param {string[]} loai  'am-ngat' | 'truong-am' | 'ke-dai'
 */
export function wrongReadings(romaji, loai = [], rng = Math.random) {
  const first = [];
  if (loai.includes('am-ngat')) first.push(...shuffle(degeminate(romaji), rng));
  if (loai.includes('truong-am') || loai.includes('ke-dai')) first.push(...shuffle(shorten(romaji), rng));
  const rest = shuffle([...degeminate(romaji), ...shorten(romaji), ...lengthen(romaji), ...geminate(romaji)], rng);
  if (!romaji) return [];
  const out = [];
  for (const w of [...first.slice(0, 2), ...rest, ...first, ...shuffle(voicing(romaji), rng)]) {
    if (out.length === 3) break;
    if (w && w !== romaji && !out.includes(w)) out.push(w);
  }
  return out;
}

/**
 * Phiên luyện đọc: `count` câu, khoảng 3/10 là câu trợ từ (đáp án sai soạn sẵn).
 * @returns {{ doc: string, tu?: string, nghia: string, romaji: string, options: string[], answer: number, troTu: boolean }[]}
 */
export function buildReadingSession({ tuLuyen, cauTroTu }, { count = 10, rng = Math.random } = {}) {
  // chỉ dùng từ sinh đủ 3 đáp án sai
  tuLuyen = tuLuyen.filter((w) => wrongReadings(w.romaji, w.loai, () => 0).length === 3);
  const nTroTu = Math.min(cauTroTu.length, Math.round(count * 0.3));
  // xen đều các loại: âm ngắt, trường âm, ー
  const byKind = ['am-ngat', 'truong-am', 'ke-dai'].map((k) => shuffle(tuLuyen.filter((w) => w.loai[0] === k), rng));
  const words = [];
  for (let i = 0; words.length < count - nTroTu && byKind.some((b) => b.length); i++) {
    const b = byKind[i % 3];
    if (b.length) words.push(b.pop());
  }
  const items = [
    ...words.map((w) => ({ ...w, troTu: false, sai: wrongReadings(w.romaji, w.loai, rng) })),
    ...shuffle(cauTroTu, rng)
      .slice(0, nTroTu)
      .map((c) => ({ ...c, troTu: true })),
  ];
  return shuffle(items, rng).map((it) => {
    const options = shuffle([it.romaji, ...it.sai], rng);
    return { doc: it.doc, tu: it.tu, nghia: it.nghia, romaji: it.romaji, options, answer: options.indexOf(it.romaji), troTu: it.troTu };
  });
}
