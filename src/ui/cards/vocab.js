/**
 * Thẻ từ vựng dạng Flashcard (markup theo kotoba-ui/components/Flashcard/preview.html), màu vocab.
 * Mặt trước: từ. Lật: kana phía trên, nghĩa tiếng Việt, chip chủ đề và loại từ.
 */
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

/**
 * @param {object} w  từ trong content/vocab.json
 * @param {{ onPlay?: () => void, canPlay?: boolean }} [opts]
 */
export function renderVocabCard(w, { onPlay, canPlay = true } = {}) {
  const card = el('article', 'kt-flash');
  card.dataset.id = w.id;
  card.setAttribute('aria-label', `Thẻ từ vựng ${w.tu}`);
  card.append(el('span', 'kt-flash__stamp kt-flash__stamp--yes', 'Đã nhớ'), el('span', 'kt-flash__stamp kt-flash__stamp--no', 'Ôn lại'));

  const top = el('div', 'kt-flash__top');
  top.append(el('span', 'kt-chip kt-chip--vocab', 'Từ vựng N5'));
  if (onPlay) {
    const tools = el('span', 'kt-flash__tools');
    const btn = el('button', 'kt-iconbtn kt-iconbtn--sm');
    btn.type = 'button';
    // nhãn chung: không đọc lộ cách đọc trước khi lật thẻ
    btn.setAttribute('aria-label', 'Phát âm');
    btn.dataset.role = 'play';
    btn.hidden = !canPlay;
    const icon = document.createElement('i');
    icon.dataset.icon = 'volume';
    btn.append(icon);
    btn.addEventListener('click', onPlay);
    tools.append(btn);
    top.append(tools);
  }
  card.append(top);

  const face = el('div', 'kt-flash__face');
  // từ viết bằng kana thì không lặp lại kana phía trên
  const kana = el('span', 'kt-flash__kana', w.tu === w.doc ? '' : w.doc);
  kana.lang = 'ja';
  const len = [...w.tu].length;
  const glyph = el('span', `kt-flash__glyph${len > 4 ? ' app-flash__glyph--long' : len > 2 ? ' app-flash__glyph--mid' : ''}`, w.tu);
  glyph.lang = 'ja';
  face.append(kana, glyph, el('span', 'kt-flash__meaning', w.nghia), el('span', 'kt-flash__tap', 'Chạm để xem nghĩa'));
  card.append(face);

  const ex = el('div', 'kt-flash__ex');
  const chips = el('div', 'kt-row');
  chips.append(el('span', 'kt-chip kt-chip--vocab', w.chuDe));
  if (w.loai) chips.append(el('span', 'kt-chip kt-chip--outline', w.loai));
  ex.append(chips);
  const other = [...new Set([...(w.tuKhac || []), ...(w.docKhac || [])])].filter((x) => x !== w.tu && x !== w.doc);
  if (other.length) {
    const p = el('small', null, `Cũng viết/đọc: ${other.join(', ')}`);
    p.lang = 'ja';
    ex.append(p);
  }
  card.append(ex);
  return card;
}
