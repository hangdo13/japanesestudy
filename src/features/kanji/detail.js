import { kanjiById, assetUrl } from '../../core/content.js';
import { toHash } from '../../core/router.js';
import { renderStrokes } from '../../ui/strokes.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function jp(tag, className, text) {
  const n = el(tag, `${className ? `${className} ` : ''}kt-jp`, text);
  n.lang = 'ja';
  return n;
}

function section(title, body) {
  const s = el('section', 'kt-stack');
  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, title));
  s.append(head, body);
  return s;
}

const LOI_AUDIO = 'Không phát được âm thanh. Bấm lại thử nhé, nếu vẫn lỗi thì kiểm tra kết nối mạng.';

/** Bộ phát dùng chung cho một màn: chỉ một âm phát tại một thời điểm. */
export function createPlayer(status, AudioImpl = globalThis.Audio) {
  let current = null;
  let token = 0;
  const stop = () => {
    if (current && typeof current.pause === 'function') current.pause();
    current = null;
  };
  /** Phát audio. Trả Promise<boolean>: true là phát được. */
  const play = (path) => {
    stop();
    const my = ++token;
    status.textContent = '';
    const fail = () => {
      if (my === token) status.textContent = LOI_AUDIO;
      return false;
    };
    try {
      current = new AudioImpl(assetUrl(path));
      return Promise.resolve(current.play()).then(() => true, fail);
    } catch {
      return Promise.resolve(fail());
    }
  };
  return { play, stop };
}

/** Phát một lần (giữ cho tương thích test). */
export function playAudio(path, status, AudioImpl = globalThis.Audio) {
  return createPlayer(status, AudioImpl).play(path);
}

export function renderDetail(id, deps = {}) {
  const k = kanjiById(id);
  if (!k) return null;

  const wrap = el('div', 'kt-stack');
  const cleanups = [];
  wrap.cleanup = () => cleanups.forEach((fn) => fn());

  const back = el('a', 'kt-link', '‹ Tất cả kanji');
  back.href = toHash('kanji');
  wrap.append(back);

  // Đầu trang: khối tô màu duy nhất của màn
  const hero = el('article', 'kt-card kt-card--tinted kanji-hero');
  const glyph = jp('span', 'kt-flash__glyph', k.id);
  const info = el('div', 'kanji-hero__info');
  info.append(el('h2', 'title-lg', k.hanViet), el('p', null, k.nghia), el('p', 'kt-muted', `${k.soNet} nét`));
  if (k.reviewStatus === 'draft') {
    const row = el('div', 'kt-row');
    row.append(el('span', 'kt-chip kt-chip--outline', 'Chưa duyệt'));
    info.append(row);
  }
  hero.append(glyph, info);
  wrap.append(hero);

  // Cách nhớ
  const nho = el('div', 'kt-card kt-card--sunken kt-stack');
  if (k.boPhan.length) {
    const parts = el('div', 'kt-row');
    for (const b of k.boPhan) parts.append(jp('span', 'kt-chip kt-chip--surface', b));
    nho.append(parts);
  }
  nho.append(el('p', null, k.cauGoiNho));
  wrap.append(section('Cách nhớ', nho));

  // Cách đọc
  const status = el('p', 'kt-muted');
  status.setAttribute('role', 'status');
  const player = createPlayer(status, deps.Audio);
  cleanups.push(player.stop);
  const readList = el('div', 'kt-list kanji-list--flush');
  const addReading = (label, r) => {
    const item = el('div', 'kt-item kt-item--plain');
    const body = el('div', 'kt-item__body');
    body.append(jp('p', 'kt-item__title', r.kana), el('p', 'kt-item__sub', label));
    const btn = el('button', 'kt-iconbtn kt-iconbtn--xs');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Phát âm ${r.kana}`);
    const icon = document.createElement('i');
    icon.dataset.icon = 'volume';
    btn.append(icon);
    btn.addEventListener('click', () => player.play(r.audio));
    item.append(body, btn);
    readList.append(item);
  };
  k.on.forEach((r) => addReading('Âm on', r));
  k.kun.forEach((r) => addReading('Âm kun', r));
  const readBody = el('div', 'kt-card kt-stack');
  readBody.append(readList, status);
  wrap.append(section('Cách đọc', readBody));

  // Thứ tự nét
  const strokeCard = el('div', 'kt-card');
  const strokes = renderStrokes(k.svg, { fetchImpl: deps.fetch, label: `Thứ tự nét viết chữ ${k.id}` });
  cleanups.push(strokes.cancel);
  strokeCard.append(strokes);
  wrap.append(section('Thứ tự nét', strokeCard));

  // Ví dụ
  if (k.viDu.length) {
    const ex = el('div', 'kt-card kt-card--sunken kt-list');
    for (const v of k.viDu) {
      const item = el('div', 'kt-stack kanji-list--flush');
      const line = el('p', 'kanji-ex__line');
      line.append(jp('b', null, v.tu), document.createTextNode(' '), jp('span', 'kt-muted', v.doc));
      const nghia = el('small', 'kt-muted', v.nghia);
      item.append(line, nghia);
      ex.append(item);
    }
    wrap.append(section('Ví dụ', ex));
  }

  // Dễ nhầm với
  if (k.deNham.length) {
    const row = el('div', 'kt-row');
    for (const g of k.deNham) {
      const other = kanjiById(g);
      const a = el('a', 'kanji-tile');
      a.href = toHash('kanji', g);
      a.setAttribute('aria-label', `${g}${other ? `, ${other.hanViet}, ${other.nghia}` : ''}`);
      a.append(jp('span', 'kt-skill kt-skill--kanji', g));
      if (other) a.append(el('small', 'kt-muted', other.hanViet));
      row.append(a);
    }
    wrap.append(section('Dễ nhầm với', row));
  }

  return wrap;
}
