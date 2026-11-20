import { kanjiById, assetUrl } from '../../core/content.js';
import { toHash } from '../../core/router.js';
import { renderStrokes } from '../../ui/strokes.js';
import { speakJa, canSpeakJapanese, onVoicesChanged } from '../../ui/speech.js';

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
const KHONG_GIONG = 'Âm này chưa có file audio, cần giọng đọc tiếng Nhật của máy để nghe. Trên iPhone: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói.';

/**
 * Trình phát âm đọc kanji: file audio của JLPTSuccess, hoặc giọng tiếng Nhật của máy (speechSynthesis ja-JP)
 * cho chữ không có audio (4 chữ thêm ở Story 1.7).
 */
export function createPlayer(
  status,
  AudioImpl = globalThis.Audio,
  { speak = speakJa, canSpeak = canSpeakJapanese, voicesChanged = onVoicesChanged, cancelSpeech = () => globalThis.speechSynthesis && globalThis.speechSynthesis.cancel && globalThis.speechSynthesis.cancel() } = {},
) {
  let current = null;
  let token = 0;
  // chỉ một âm phát một lúc: dừng cả file audio lẫn giọng máy
  const stop = () => {
    token += 1; // bỏ mọi lần phát đang chờ (vd. đang đợi giọng nạp)
    if (current && typeof current.pause === 'function') current.pause();
    current = null;
    try {
      cancelSpeech();
    } catch {
      /* trình duyệt không có speechSynthesis */
    }
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
  /** Phát một âm đọc { kana, audio }: có audio thì phát file, không thì đọc bằng giọng máy. */
  /** Chờ giọng nạp xong (iOS/Chrome nạp danh sách giọng muộn), tối đa `ms`. */
  const waitVoices = (ms = 1500) =>
    new Promise((resolve) => {
      let off = () => {};
      const t = setTimeout(() => {
        off();
        resolve(false);
      }, ms);
      off =
        voicesChanged(() => {
          clearTimeout(t);
          off();
          resolve(true);
        }) || (() => {});
    });
  const playReading = async (r) => {
    if (r && r.audio) return play(r.audio);
    stop();
    const my = ++token;
    status.textContent = '';
    const text = r && (r.tts || r.kana);
    if (!text) {
      status.textContent = KHONG_GIONG;
      return false;
    }
    if (!canSpeak()) await waitVoices();
    if (my !== token) return false;
    const fail = () => {
      if (my === token) status.textContent = KHONG_GIONG;
    };
    if (!canSpeak() || speak(text, { onError: fail }) === false) {
      fail();
      return false;
    }
    return true;
  };
  return { play, playReading, stop };
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
  const player = createPlayer(status, deps.Audio, { speak: deps.speak, canSpeak: deps.canSpeak });
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
    btn.addEventListener('click', () => player.playReading(r));
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
