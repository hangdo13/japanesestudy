// Dựng câu hỏi luyện kana (hàm thuần; rng truyền vào để test được).

/** Trộn mảng (Fisher–Yates) với hàm ngẫu nhiên `rng` trả [0,1). */
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** RNG có seed (mulberry32) cho test. */
export function seededRng(seed = 1) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Khoá âm: chữ đọc giống nhau (を/お, ヲ/オ, ウォ) có cùng khoá, để câu nghe không có hai đáp án giống tiếng. */
export function soundKey(romaji) {
  return romaji === 'wo' ? 'o' : romaji;
}

/**
 * Chọn 3 đáp án sai cho `target` từ `pool`: khác chữ, khác romaji, và khác romaji lẫn nhau.
 * Ưu tiên các chữ trong `preferred` (cặp dễ nhầm).
 */
export function pickDistractors(target, pool, rng = Math.random, preferred = []) {
  const out = [];
  const romajis = new Set([soundKey(target.romaji)]);
  const ok = (k) => k && k.id !== target.id && !romajis.has(soundKey(k.romaji)) && !out.includes(k);
  const take = (k) => {
    if (out.length < 3 && ok(k)) {
      out.push(k);
      romajis.add(soundKey(k.romaji));
    }
  };
  for (const id of shuffle(preferred, rng)) take(pool.find((k) => k.id === id));
  for (const k of shuffle(pool, rng)) take(k);
  return out;
}

/**
 * Dựng một phiên luyện.
 * @param {object[]} set  các kana trong bộ luyện
 * @param {object} opts
 * @param {number} [opts.count=10]
 * @param {boolean} [opts.canSpeak]  có giọng đọc thì có câu "nghe chọn chữ"
 * @param {(id: string) => string[]} [opts.pairsOf]  chữ dễ nhầm với id
 * @param {object[]|((target: object) => object[])} [opts.pool]  nguồn đáp án sai (mặc định là `set`); có thể là hàm theo từng chữ
 * @param {boolean} [opts.ordered]  giữ thứ tự `set` (ôn chữ đến hạn: sớm nhất trước)
 * @returns {{ kind: 'chu-romaji'|'nghe-chu'|'romaji-chu', target: object, options: object[], answer: number }[]}
 */
export function buildSession(set, { count = 10, canSpeak = false, pairsOf = () => [], pool = set, rng = Math.random, ordered = false } = {}) {
  const targets = [];
  if (ordered) targets.push(...set.slice(0, count));
  while (targets.length < count && set.length) targets.push(...shuffle(set, rng));
  return targets.slice(0, count).map((target, i) => {
    const kind = i % 2 === 0 ? 'chu-romaji' : canSpeak ? 'nghe-chu' : 'romaji-chu';
    const src = typeof pool === 'function' ? pool(target) : pool;
    const distractors = pickDistractors(target, src, rng, pairsOf(target.id));
    const options = shuffle([target, ...distractors], rng);
    return { kind, target, options, answer: options.indexOf(target) };
  });
}
