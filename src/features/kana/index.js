import './kana.css';
import { kana, kanaById, kanaPairs, kanaReviewStatus } from '../../core/content.js';
import { toHash } from '../../core/router.js';
import { renderEmptyState } from '../../ui/empty-state.js';
import { renderStrokes } from '../../ui/strokes.js';
import { speakJa, canSpeakJapanese, onVoicesChanged } from '../../ui/speech.js';
import { renderPractice, LUYEN } from './practice.js';
import { renderRules, QUY_TAC } from './rules.js';
import { renderSounds, PHAT_AM } from './sounds.js';

export const KATAKANA = 'katakana';

const NHOM = [
  { id: 'co-ban', title: 'Âm cơ bản', cols: 5 },
  { id: 'duc', title: 'Âm đục', cols: 5 },
  { id: 'ban-duc', title: 'Âm bán đục', cols: 5 },
  { id: 'ghep', title: 'Âm ghép', cols: 3 },
  { id: 'mo-rong', title: 'Katakana mở rộng (từ mượn)', cols: 3 },
];
const COLS = ['a', 'i', 'u', 'e', 'o'];

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function jp(tag, className, text) {
  const n = el(tag, `${className || ''} kt-jp`.trim(), text);
  n.lang = 'ja';
  return n;
}

function cell(k) {
  const a = el('a', 'kana-cell');
  a.href = toHash('kana', k.id);
  a.setAttribute('aria-label', `${k.id}, ${k.romaji}`);
  a.append(jp('span', 'kana-cell__glyph', k.id), el('span', 'kana-cell__romaji', k.romaji));
  return a;
}

/** Lưới 5 cột a-i-u-e-o, chừa ô trống (hàng y, w, n) để đúng hình bảng. */
function grid5(items) {
  const grid = el('div', 'kana-grid');
  const rows = [];
  for (const k of items) {
    if (!rows.length || rows[rows.length - 1].hang !== k.hang) rows.push({ hang: k.hang, cells: {} });
    rows[rows.length - 1].cells[k.cot] = k;
  }
  for (const r of rows) {
    for (const c of COLS) {
      const k = r.cells[c];
      if (k) grid.append(cell(k));
      else {
        const empty = el('span', 'kana-cell kana-cell--empty');
        empty.setAttribute('aria-hidden', 'true');
        grid.append(empty);
      }
    }
  }
  return grid;
}

function renderTable(script) {
  const wrap = el('div', 'kt-stack');

  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, 'Bảng chữ cái'));
  const practice = el('a', 'kt-btn kt-btn--primary kt-btn--block kana-practice-link', 'Luyện nhận diện');
  practice.href = toHash('kana', LUYEN);
  const rulesLink = el('a', 'kt-btn kt-btn--soft kt-btn--block kana-practice-link', 'Quy tắc đọc: っ, trường âm, は/へ/を');
  rulesLink.href = toHash('kana', QUY_TAC);
  const soundsLink = el('a', 'kt-btn kt-btn--soft kt-btn--block kana-practice-link', 'Phát âm: đếm phách, nghe cặp âm');
  soundsLink.href = toHash('kana', PHAT_AM);

  const tabs = el('nav', 'kt-row kana-tabs');
  tabs.setAttribute('aria-label', 'Chọn bảng chữ');
  for (const [s, label, hash] of [
    ['hiragana', 'Hiragana', toHash('kana')],
    [KATAKANA, 'Katakana', toHash('kana', KATAKANA)],
  ]) {
    const t = el('a', `kt-chip ${s === script ? 'kt-chip--primary' : 'kt-chip--outline'}`, label);
    t.href = hash;
    if (s === script) t.setAttribute('aria-current', 'page');
    tabs.append(t);
  }
  wrap.append(head, practice, rulesLink, soundsLink, tabs);
  if (kanaReviewStatus() === 'draft') {
    wrap.append(el('p', 'kt-muted kana-text', 'Ghi chú và cặp chữ dễ nhầm do AI soạn, chưa duyệt.'));
  }

  const items = kana().filter((k) => k.script === script);
  for (const n of NHOM) {
    const group = items.filter((k) => k.nhom === n.id);
    if (!group.length) continue;
    const sec = el('section', 'kt-stack');
    const h = el('div', 'kt-sechead');
    h.append(el('h2', null, `${n.title} (${group.length})`));
    let body;
    if (n.cols === 5) body = grid5(group);
    else {
      body = el('div', 'kana-grid kana-grid--3');
      group.forEach((k) => body.append(cell(k)));
    }
    sec.append(h, body);
    wrap.append(sec);
  }
  return wrap;
}

function renderDetail(k, deps) {
  const wrap = el('div', 'kt-stack');
  const back = el('a', 'kt-link', `‹ Bảng ${k.script === 'katakana' ? 'katakana' : 'hiragana'}`);
  back.href = k.script === 'katakana' ? toHash('kana', KATAKANA) : toHash('kana');
  wrap.append(back);

  const hero = el('article', 'kt-card kt-card--tinted kana-hero');
  const info = el('div', 'kana-hero__info');
  info.append(el('h2', 'title-lg', k.romaji));
  const chipRow = el('div', 'kt-row');
  chipRow.append(el('span', 'kt-chip kt-chip--outline', k.script === 'katakana' ? 'Katakana' : 'Hiragana'));
  info.append(chipRow);
  if (k.ghiChu) info.append(el('p', 'kt-muted', k.ghiChu));
  hero.append(jp('span', 'kt-flash__glyph', k.id), info);
  wrap.append(hero);

  // Phát âm
  const status = el('p', 'kt-muted kana-text');
  status.setAttribute('role', 'status');
  const speak = deps.speak || speakJa;
  const can = deps.canSpeak || canSpeakJapanese;
  const play = el('button', 'kt-btn kt-btn--soft kt-btn--sm');
  play.type = 'button';
  const icon = document.createElement('i');
  icon.dataset.icon = 'volume';
  play.append(icon, document.createTextNode(' Nghe phát âm'));
  let playFailed = false;
  play.addEventListener('click', () => {
    playFailed = !speak(k.id);
    if (playFailed) status.textContent = 'Không phát được âm thanh trên máy này.';
  });
  const syncVoice = () => {
    const ok = can();
    play.hidden = !ok;
    if (!ok) status.textContent = 'Máy chưa có giọng đọc tiếng Nhật. Trên iPhone, vào Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói để tải giọng tiếng Nhật.';
    else if (!playFailed) status.textContent = '';
  };
  syncVoice();
  const offVoices = (deps.onVoicesChanged || onVoicesChanged)(syncVoice);
  const row = el('div', 'kt-row');
  row.append(play);
  const playCard = el('section', 'kt-card kt-stack');
  playCard.append(row, status);
  wrap.append(playCard);

  let strokes = null;
  if (k.svg) {
    const sec = el('section', 'kt-stack');
    const h = el('div', 'kt-sechead');
    h.append(el('h2', null, 'Thứ tự nét'));
    const card = el('div', 'kt-card');
    strokes = renderStrokes(k.svg, { fetchImpl: deps.fetch, label: `Thứ tự nét viết chữ ${k.id}` });
    card.append(strokes);
    sec.append(h, card);
    wrap.append(sec);
  }

  const pairs = kanaPairs(k.id);
  if (pairs.length) {
    const sec = el('section', 'kt-stack');
    const h = el('div', 'kt-sechead');
    h.append(el('h2', null, 'Dễ nhầm với'));
    const grid = el('div', 'kana-grid');
    for (const g of pairs) {
      const other = kanaById(g);
      if (other) grid.append(cell(other));
    }
    sec.append(h, grid);
    wrap.append(sec);
  }

  return {
    node: wrap,
    cleanup: () => {
      offVoices();
      if (strokes && strokes.cancel) strokes.cancel();
    },
  };
}

export function mount(root, { param } = {}, deps = {}) {
  if (param === PHAT_AM) {
    const view = renderSounds(deps);
    root.append(view.node);
    return view.cleanup;
  }
  if (param === QUY_TAC) {
    const view = renderRules(deps);
    root.append(view.node);
    return view.cleanup;
  }
  if (param === LUYEN) {
    const view = renderPractice(deps);
    root.append(view.node);
    return view.cleanup;
  }
  if (!param || param === KATAKANA || param === 'hiragana') {
    root.append(renderTable(param === KATAKANA ? KATAKANA : 'hiragana'));
    return;
  }
  const k = kanaById(param);
  if (k) {
    const view = renderDetail(k, deps);
    root.append(view.node);
    return view.cleanup;
  }
  root.append(
    renderEmptyState({
      title: 'Không tìm thấy chữ này',
      text: 'Chữ này không có trong bảng hiragana và katakana.',
      actionLabel: 'Về bảng chữ cái',
      onAction: () => {
        window.location.hash = toHash('kana');
      },
    }),
  );
}
