/**
 * Thẻ kanji dạng Flashcard (markup theo kotoba-ui/components/Flashcard/preview.html).
 * Mặt trước: chữ. Lật: cách đọc, âm Hán Việt + nghĩa, câu gợi nhớ, ví dụ.
 */
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

export function primaryReading(k) {
  return (k.kun && k.kun[0]) || (k.on && k.on[0]) || null;
}

export function renderKanjiCard(k, { onPlay } = {}) {
  const card = el('article', 'kt-flash');
  card.dataset.id = k.id;
  card.setAttribute('aria-label', `Thẻ kanji ${k.id}`);

  card.append(el('span', 'kt-flash__stamp kt-flash__stamp--yes', 'Đã nhớ'), el('span', 'kt-flash__stamp kt-flash__stamp--no', 'Ôn lại'));

  const top = el('div', 'kt-flash__top');
  top.append(el('span', 'kt-chip kt-chip--kanji', 'Kanji N5'));
  const reading = primaryReading(k);
  if (reading && onPlay) {
    const tools = el('span', 'kt-flash__tools');
    const btn = el('button', 'kt-iconbtn kt-iconbtn--sm');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Phát âm ${reading.kana}`);
    const icon = document.createElement('i');
    icon.dataset.icon = 'volume';
    btn.append(icon);
    btn.addEventListener('click', () => onPlay(reading));
    tools.append(btn);
    top.append(tools);
  }
  card.append(top);

  const face = el('div', 'kt-flash__face');
  const kana = el('span', 'kt-flash__kana', reading ? reading.kana : '');
  kana.lang = 'ja';
  const glyph = el('span', 'kt-flash__glyph', k.id);
  glyph.lang = 'ja';
  face.append(kana, glyph, el('span', 'kt-flash__meaning', `${k.hanViet} · ${k.nghia}`), el('span', 'kt-flash__tap', 'Chạm để xem nghĩa'));
  card.append(face);

  const ex = el('div', 'kt-flash__ex');
  ex.append(el('small', null, k.cauGoiNho));
  const v = k.viDu && k.viDu[0];
  if (v) {
    const p = el('p', null, `${v.tu}（${v.doc}）`);
    p.lang = 'ja';
    ex.append(p, el('small', null, v.nghia));
  }
  card.append(ex);
  return card;
}
