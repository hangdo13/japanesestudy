import { kanji as allKanji, vocab as allVocab } from '../../core/content.js';
import { progress as defaultProgress, localDate } from '../../core/progress.js';
import { newKanjiToday } from '../../core/growth.js';
import { ensureKanjiCards } from '../../core/kanji-review.js';
import { afterSession } from '../../core/today.js';
import { studyClock } from '../../core/study-clock.js';
import { toHash } from '../../core/router.js';
import { renderEmptyState } from '../../ui/empty-state.js';
import { renderGoalComplete } from '../../ui/goal-complete.js';
import { renderKanjiCard } from '../../ui/cards/kanji.js';
import { createPlayer } from './detail.js';

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
 * Màn học gói kanji mới hôm nay.
 * @returns {{ node: HTMLElement, cleanup: () => void }}
 */
export function renderLearn(deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = deps.now || (() => new Date());
  const win = deps.win || window;
  const today = localDate(now());
  const activity = deps.activity || (() => studyClock().activity());
  const { pack, introducedToday, remainingTotal } = newKanjiToday(store.get(), allKanji(), today);
  const goList = () => {
    win.location.hash = toHash('kanji');
  };

  if (!pack.length) {
    const node =
      remainingTotal === 0
        ? renderEmptyState({
            title: `Bạn đã học hết ${allKanji().length} kanji N5!`,
            text: 'Không còn chữ mới. Hãy xem lại danh sách để ôn những chữ còn chưa chắc.',
            actionLabel: 'Về danh sách kanji',
            onAction: goList,
          })
        : renderEmptyState({
            title: 'Hôm nay đủ rồi, mai học tiếp nhé',
            text: `Bạn đã học ${introducedToday} chữ mới hôm nay. Pyon đi ngủ đây.`,
            actionLabel: 'Về danh sách kanji',
            onAction: goList,
          });
    return { node, cleanup: () => {} };
  }

  const root = el('div', 'kt-stack');
  const session = el('section', 'kt-session');
  session.setAttribute('aria-label', 'Học kanji mới hôm nay');

  // Đầu phiên
  const head = el('div', 'kt-session__head');
  const close = el('button', 'kt-iconbtn kt-iconbtn--sm');
  close.type = 'button';
  close.setAttribute('aria-label', 'Đóng');
  close.append(icon('x'));
  close.addEventListener('click', goList);
  const seg = el('div', 'kt-seg kt-seg--kanji kt-seg--thick');
  seg.setAttribute('role', 'progressbar');
  seg.setAttribute('aria-valuemin', '0');
  seg.setAttribute('aria-valuemax', String(pack.length));
  seg.setAttribute('aria-label', 'Tiến độ gói hôm nay');
  const count = el('span', 'kt-count');
  head.append(close, seg, count);

  const status = el('p', 'kt-muted kanji-learn__status');
  status.setAttribute('role', 'status');
  const player = createPlayer(status, deps.Audio, { speak: deps.speak, canSpeak: deps.canSpeak });

  // Chồng thẻ: thẻ trên cùng là phần tử cuối
  const deck = el('div', 'kt-deck');
  deck.tabIndex = 0;
  deck.setAttribute(
    'aria-label',
    'Thẻ kanji mới. Phím cách: lật thẻ. Mũi tên trái hoặc phải: sang thẻ tiếp theo.',
  );
  const cards = pack.map((k) =>
    renderKanjiCard(k, {
      onPlay: (r) => {
        activity();
        player.playReading(r);
      },
    }),
  );
  // lật thẻ cũng là tương tác học (đọc mặt sau lâu không bị tính là rảnh)
  const observers = [];
  if (typeof MutationObserver === 'function') {
    for (const c of cards) {
      let open = false;
      const o = new MutationObserver(() => {
        const now2 = c.classList.contains('is-revealed');
        if (now2 && !open && c.isConnected) activity();
        open = now2;
      });
      o.observe(c, { attributes: true, attributeFilter: ['class'] });
      observers.push(o);
    }
  }
  for (let i = cards.length - 1; i >= 0; i--) deck.append(cards[i]);

  const hint = el('div', 'kt-swipe-hint');
  hint.setAttribute('aria-hidden', 'true');
  const left = el('span');
  left.append(icon('chevron-left'), document.createTextNode('Ôn lại'));
  const right = el('span', 'is-yes');
  right.append(document.createTextNode('Đã nhớ'), icon('chevron-right'));
  hint.append(left, el('span', null, 'Chạm để lật'), right);

  const done = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Đã học xong');
  done.type = 'button';
  done.hidden = true;

  let seen = 0;
  let disposed = false;
  const renderProgress = () => {
    seg.replaceChildren(...pack.map((_, i) => (i < seen ? Object.assign(el('i'), { className: 'on' }) : el('i'))));
    seg.setAttribute('aria-valuenow', String(seen));
    count.textContent = `${Math.min(seen + 1, pack.length)} / ${pack.length}`;
  };
  renderProgress();

  const onSwiped = (card) => {
    if (disposed || !card || !card.isConnected) return;
    activity();
    card.remove();
    seen += 1;
    player.stop();
    renderProgress();
    if (seen >= pack.length) {
      count.textContent = `${pack.length} / ${pack.length}`;
      deck.hidden = true;
      hint.hidden = true;
      done.hidden = false;
      done.focus();
    }
  };

  let api = null;
  const K = win.Kotoba;
  const attach = () => {
    if (api || !K || typeof K.swipeDeck !== 'function') return;
    api = K.swipeDeck(deck, { onSwipe: (_dir, card) => onSwiped(card) });
  };

  done.addEventListener('click', () => {
    // tính lại ngày lúc lưu: phiên học có thể kéo qua nửa đêm
    const stamp = localDate(now());
    const res = store.update((d) => {
      for (const k of pack) {
        const cur = d.kanji[k.id] || {};
        if (!cur.gioiThieu) d.kanji[k.id] = { ...cur, gioiThieu: stamp };
      }
    });
    if (!res.ok) {
      status.textContent = res.error;
      return;
    }
    // đưa các chữ vừa học vào lịch ôn (3 thẻ mỗi chữ); lỗi thì báo, màn ôn sẽ bù lại sau
    const cardsDone = ensureKanjiCards(store, new Set(allKanji().map((k) => k.id)), now())
      .then((r) => {
        if (!r.ok && !disposed) status.textContent = `Chưa đưa được chữ vào lịch ôn: ${r.error}`;
      })
      .catch(() => {
        if (!disposed) status.textContent = 'Chưa đưa được chữ vào lịch ôn. Màn Ôn kanji sẽ thử lại.';
      });
    learnApi.cardsDone = cardsDone;
    const nextAfter = () => afterSession(store.get(), { kanji: allKanji(), vocab: allVocab(), now: now() }, toHash);
    cardsDone.then(() => {
      const b = root.querySelector('.kt-goal .kt-btn');
      if (!disposed && b) b.textContent = nextAfter().label;
    });
    root.replaceChildren(
      renderGoalComplete({
        title: 'Xong gói kanji hôm nay!',
        text: `Bạn vừa làm quen ${pack.length} chữ: ${pack.map((k) => k.id).join(' ')}.`,
        chips: [{ text: `${pack.length} chữ mới`, className: 'kt-chip--success' }],
        actionLabel: 'Việc tiếp theo',
        onAction: () =>
          cardsDone.then(() => {
            if (!disposed && win) win.location.hash = nextAfter().hash;
          }),
      }),
      status,
    );
    if (K && typeof K.hydrate === 'function') K.hydrate(root);
  });

  session.append(head, deck, hint, done, status);
  root.append(session);
  attach();

  const learnApi = {
    node: root,
    cardsDone: Promise.resolve(),
    /** Dùng trong test và cho bàn phím: vuốt thẻ trên cùng. */
    swipe(dir = 'right') {
      if (api) api.swipe(dir);
      else {
        const top = deck.lastElementChild;
        if (top) onSwiped(top);
      }
    },
    cleanup: () => {
      disposed = true;
      for (const o of observers) o.disconnect();
      player.stop();
    },
  };
  return learnApi;
}
