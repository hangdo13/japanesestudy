// Bước Flashcard dùng chung (ôn kanji, ôn từ vựng, học từ theo chủ đề). Chỉ giao diện, không đụng dữ liệu.
import './flash-step.css';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}
function icon(name) {
  const i = document.createElement('i');
  i.dataset.icon = name;
  return i;
}

/**
 * Bước Flashcard cho thẻ nghĩa: vuốt phải Đã nhớ, trái Ôn lại; phím → ← Space.
 * Hai chữ "Ôn lại" / "Đã nhớ" dưới thẻ là nút thật, cho người không vuốt được (WCAG 2.5.7).
 */
export function flashStep({ card, label, revealText }, answer, win, announce, onReveal) {
  const wrap = el('div', 'kt-stack');
  const deck = el('div', 'kt-deck');
  deck.tabIndex = 0;
  deck.setAttribute('role', 'group');
  deck.setAttribute('aria-roledescription', 'thẻ ghi nhớ');
  deck.setAttribute('aria-label', `${label}. Phím cách: lật thẻ xem nghĩa. Mũi tên phải: đã nhớ. Mũi tên trái: ôn lại.`);
  deck.append(card);
  // Enter/Space trên nút trong thẻ (vd. phát âm) là bấm nút, không phải lật thẻ (chặn trước swipeDeck)
  deck.addEventListener(
    'keydown',
    (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target !== deck && e.target.closest && e.target.closest('button')) e.stopImmediatePropagation();
    },
    true,
  );
  let observer = null;
  const done = (ok) => {
    if (observer) observer.disconnect();
    answer(ok);
  };
  // giữ phím mũi tên không được trả lời liền nhiều thẻ chưa xem (đăng ký trước swipeDeck để chặn trước)
  deck.addEventListener('keydown', (e) => {
    if (e.repeat) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
  // lật thẻ thì đọc cho trình đọc màn hình
  let wasOpen = false;
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => {
      if (!card.isConnected) return;
      const open = card.classList.contains('is-revealed');
      if (open && !wasOpen) {
        announce(revealText);
        if (onReveal) onReveal();
      }
      wasOpen = open;
    });
    observer.observe(card, { attributes: true, attributeFilter: ['class'] });
  }
  const hint = el('div', 'kt-swipe-hint review-hint');
  const btn = (cls, label, ok, ...kids) => {
    const b = el('button', `review-hint__btn ${cls}`.trim());
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.append(...kids);
    b.addEventListener('click', () => (api ? api.swipe(ok ? 'right' : 'left') : done(ok)));
    return b;
  };
  const left = btn('', 'Ôn lại', false, icon('chevron-left'), document.createTextNode('Ôn lại'));
  const flip = el('button', 'review-hint__btn', 'Chạm để lật');
  flip.type = 'button';
  flip.addEventListener('click', () => (api ? api.flip() : card.classList.toggle('is-revealed')));
  const right = btn('is-yes', 'Đã nhớ', true, document.createTextNode('Đã nhớ'), icon('chevron-right'));
  hint.append(left, flip, right);
  wrap.append(deck, hint);
  const K = win && win.Kotoba;
  let api = null;
  if (K && typeof K.swipeDeck === 'function') {
    api = K.swipeDeck(deck, { onSwipe: (dir) => done(dir === 'right') });
  } else {
    // không có bundle (test): tự xử lý phím như swipeDeck
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') done(true);
      else if (e.key === 'ArrowLeft') done(false);
      else if (e.key === ' ' || e.key === 'Enter') card.classList.toggle('is-revealed');
      else return;
      e.preventDefault();
    });
  }
  return wrap;
}

