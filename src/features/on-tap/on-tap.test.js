import { describe, it, expect, vi } from 'vitest';
import { renderKanjiReview, mount, formatWhen } from './index.js';
import { createProgress } from '../../core/progress.js';
import { seededRng } from '../../core/kana-quiz.js';
import { kanji, kanjiById } from '../../core/content.js';
import { readingOf, MAX_PER_SESSION } from '../../core/kanji-review.js';
import { newCard } from '../../core/srs.js';
import { mount as mountHub, kanjiReviewCount } from '../luyen-tap/index.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
const T0 = new Date('2026-11-18T10:00:00Z');
let clock = T0;
const now = () => clock;
const DAY = 86400000;

/** Store có các chữ đã giới thiệu; `due` là các khoá thẻ cho đến hạn ngay (thẻ khác đến hạn sau 30 ngày). */
async function makeStore(ids = [], due = null) {
  clock = T0;
  const s = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
  const fresh = await newCard(T0);
  s.update((d) => {
    for (const id of ids) {
      d.kanji[id] = { gioiThieu: '2026-11-17' };
      if (due)
        for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) {
          const key = `${kind}:${id}`;
          d.srs[key] = { ...fresh, dueAt: new Date(T0.getTime() + (due.includes(key) ? -60000 : 30 * DAY)).toISOString() };
        }
    }
  });
  return s;
}
async function setup(store, extra = {}) {
  const win = extra.win || { location: { hash: '' } };
  const view = renderKanjiReview({ progress: store, now, rng: seededRng(3), win, ...extra });
  document.body.replaceChildren(view.node);
  await view.ready;
  return { view, store, win, node: view.node };
}
const key = (deck, k, repeat = false) => deck.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, repeat }));
const txt = (o) => o.querySelector('.kt-option__text').textContent;

/** Trả lời bước hiện tại đúng hoặc sai. */
function answer(node, correct) {
  const deck = node.querySelector('.kt-deck');
  if (deck) return key(deck, correct ? 'ArrowRight' : 'ArrowLeft');
  const opts = [...node.querySelectorAll('.kt-option')];
  const word = node.querySelector('.app-quiz__prompt .review-word');
  let right;
  if (word) {
    const k = kanji().find((x) => (x.viDu[0] ? x.viDu[0].tu : x.id) === word.textContent);
    right = opts.findIndex((o) => txt(o) === readingOf(k));
  } else {
    const hv = node.querySelector('.app-quiz__prompt').textContent.split(' · ')[0];
    right = opts.findIndex((o) => kanjiById(txt(o)).hanViet === hv);
  }
  opts[correct ? right : (right + 1) % opts.length].click();
  node.querySelector('.kt-feedback .kt-btn--primary').click();
}

describe('ôn kanji', () => {
  it('không có kanji đã học: EmptyState mời học kanji mới', async () => {
    const { node, win } = await setup(await makeStore([]));
    expect(node.textContent).toContain('Chưa có thẻ kanji để ôn');
    [...node.querySelectorAll('button')].find((b) => b.textContent === 'Học kanji mới').click();
    expect(win.location.hash).toBe('#/kanji/hoc-moi');
  });

  it('bù 3 thẻ cho kanji học từ trước; phiên đầu chỉ có thẻ nghĩa (Flashcard), thẻ đọc/chữ đến hạn sau', async () => {
    const { node, store } = await setup(await makeStore(['日', '月']));
    expect(Object.keys(store.get().srs)).toHaveLength(6);
    expect(node.querySelector('.kt-count').textContent).toBe('1 / 2');
    expect(node.querySelector('.kt-deck')).not.toBeNull();
    expect(node.querySelector('.kt-seg--kanji')).not.toBeNull();
  });

  it('mỗi chữ chỉ một thẻ mỗi phiên; tối đa 20 thẻ', async () => {
    const ids = kanji().slice(0, 25).map((k) => k.id);
    const allKeys = ids.flatMap((id) => ['kanji-nghia', 'kanji-doc', 'kanji-chu'].map((k) => `${k}:${id}`));
    const { node } = await setup(await makeStore(ids, allKeys));
    expect(node.querySelector('.kt-count').textContent).toBe(`1 / ${MAX_PER_SESSION}`);
  });

  it('trắc nghiệm: đúng → Good (hạn xa), sai → Again (lapses), GoalComplete đếm đúng', async () => {
    const store = await makeStore(['日', '月'], ['kanji-doc:日', 'kanji-chu:月']);
    const { node, view } = await setup(store);
    const before = { ...store.get().srs };
    const order = [];
    for (let i = 0; i < 2; i++) {
      const isDoc = !!node.querySelector('.review-word');
      order.push(isDoc ? 'doc' : 'chu');
      answer(node, isDoc); // đọc: đúng, chữ: sai
    }
    expect(order.sort()).toEqual(['chu', 'doc']);
    expect(node.textContent).toContain('Ôn kanji xong!');
    expect(node.textContent).toContain('ôn 2 thẻ, nhớ 1 thẻ');
    await view.idle();
    const srs = store.get().srs;
    expect(srs['kanji-chu:月'].lapses + srs['kanji-chu:月'].reps).toBeGreaterThan(0);
    expect(Date.parse(srs['kanji-chu:月'].dueAt)).toBeLessThan(Date.parse(srs['kanji-doc:日'].dueAt));
    expect(srs['kanji-nghia:日']).toEqual(before['kanji-nghia:日']);
  });

  it('thẻ đọc hỏi từ ví dụ có chữ đó', async () => {
    const { node } = await setup(await makeStore(['食'], ['kanji-doc:食']));
    expect(node.querySelector('.review-word').textContent).toContain('食');
    expect([...node.querySelectorAll('.kt-option__text')].map((o) => o.textContent)).toContain(readingOf(kanjiById('食')));
  });

  it('Flashcard (không có bundle): Space lật và đọc cho trình đọc màn hình; ← là Again; giữ phím không trả lời liền', async () => {
    const store = await makeStore(['日', '月'], ['kanji-nghia:日', 'kanji-nghia:月']);
    const { node, view } = await setup(store);
    const deck = node.querySelector('.kt-deck');
    expect(document.activeElement).toBe(deck);
    expect(deck.getAttribute('role')).toBe('group');
    key(deck, ' ');
    expect(deck.querySelector('.kt-flash').classList.contains('is-revealed')).toBe(true);
    await Promise.resolve();
    expect(node.querySelector('[role=status].kt-muted').textContent).toContain(kanjiById(deck.querySelector('.kt-flash').dataset.id).hanViet);
    key(deck, 'ArrowLeft');
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 2');
    key(node.querySelector('.kt-deck'), 'ArrowRight', true); // phím giữ: bỏ qua
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 2');
    await view.idle();
  });

  it('nút "Ôn lại" / "Đã nhớ" dưới thẻ bấm được (không cần vuốt)', async () => {
    const store = await makeStore(['日', '月'], ['kanji-nghia:日', 'kanji-nghia:月']);
    const { node, view } = await setup(store);
    node.querySelector('.review-hint__btn[aria-label="Đã nhớ"]').click();
    node.querySelector('.review-hint__btn[aria-label="Ôn lại"]').click();
    expect(node.textContent).toContain('ôn 2 thẻ, nhớ 1 thẻ');
    await view.idle();
  });

  it('có bundle Kotoba: dùng swipeDeck; vuốt phải = Good, trái = Again', async () => {
    const store = await makeStore(['日', '月'], ['kanji-nghia:日', 'kanji-nghia:月']);
    let onSwipe;
    const swipeDeck = vi.fn((deck, opts) => {
      onSwipe = opts.onSwipe;
      return { swipe: (d) => opts.onSwipe(d), flip: vi.fn() };
    });
    const { node, view } = await setup(store, { win: { location: { hash: '' }, Kotoba: { swipeDeck, hydrate: () => {} } } });
    expect(swipeDeck.mock.calls[0][0].classList.contains('kt-deck')).toBe(true);
    const first = node.querySelector('.kt-flash').dataset.id;
    onSwipe('right');
    const second = node.querySelector('.kt-flash').dataset.id;
    onSwipe('left');
    await view.idle();
    const srs = store.get().srs;
    expect(Date.parse(srs[`kanji-nghia:${first}`].dueAt)).toBeGreaterThan(Date.parse(srs[`kanji-nghia:${second}`].dueAt));
  });

  it('thẻ chữ ưu tiên chữ dễ nhầm và có phản hồi Pyon', async () => {
    const { node } = await setup(await makeStore(['日'], ['kanji-chu:日']));
    const opts = [...node.querySelectorAll('.kt-option__text')].map((o) => o.textContent);
    expect(opts).toContain('日');
    const near = (kanjiById('日').deNham || []).filter((id) => kanjiById(id));
    if (near.length) expect(opts.some((o) => near.includes(o))).toBe(true);
    node.querySelector('.kt-option').click();
    expect(node.querySelector('.kt-feedback .kt-mascot')).not.toBeNull();
  });

  it('hết thẻ đến hạn: mở lại thì EmptyState ghi giờ thẻ kế tiếp', async () => {
    const { node, view, store } = await setup(await makeStore(['日']));
    answer(node, true);
    await view.idle();
    const again = await setup(store);
    expect(again.node.textContent).toContain('Chưa có thẻ kanji nào đến hạn');
    expect(again.node.textContent).toMatch(/đến hạn lúc \d\d:\d\d ngày \d\d\/\d\d/);
  });

  it('lịch ôn ném lỗi thì báo nhưng vẫn làm tiếp', async () => {
    const store = await makeStore(['日', '月'], ['kanji-nghia:日', 'kanji-nghia:月']);
    const { node } = await setup(store, { scheduleReview: () => Promise.reject(new Error('x')) });
    answer(node, true);
    await vi.waitFor(() => expect(node.querySelector('[role=status].kt-muted').textContent).toContain('Không lưu được'));
    expect(node.querySelector('.kt-count').textContent).toBe('2 / 2');
  });

  it('không tạo được thẻ và không có thẻ đến hạn: báo lỗi, không bảo học kanji mới', async () => {
    const store = await makeStore(['日']);
    const broken = { get: store.get, update: () => ({ ok: false, error: 'Bộ nhớ đầy' }) };
    const { node } = await setup(broken);
    expect(node.textContent).toContain('Chưa chuẩn bị được thẻ ôn');
    expect(node.textContent).toContain('Bộ nhớ đầy');
    expect(node.textContent).not.toContain('Học gói kanji mới trước');
  });

  it('nút đóng về Luyện tập; route lạ báo không tìm thấy', async () => {
    const { node, win } = await setup(await makeStore(['日']));
    node.querySelector('.kt-session__head [aria-label="Đóng"]').click();
    expect(win.location.hash).toBe('#/luyen-tap');
    const el = document.createElement('div');
    mount(el, { param: 'xyz' }, { win: { location: { hash: '' } } });
    expect(el.textContent).toContain('Không tìm thấy bài ôn này');
  });

  it('formatWhen', () => {
    expect(formatWhen(new Date(2026, 10, 19, 8, 5))).toBe('08:05 ngày 19/11');
  });
});

describe('hub Luyện tập', () => {
  it('đếm thẻ cần ôn (gồm thẻ sắp tạo) và link #/on-tap/kanji', async () => {
    const store = await makeStore(['日', '月']);
    expect(kanjiReviewCount(store.get(), clock)).toBe(6);
    const el = document.createElement('div');
    mountHub(el, {}, { progress: store, now });
    const a = [...el.querySelectorAll('a')].find((x) => x.getAttribute('href') === '#/on-tap/kanji');
    expect(a.textContent).toContain('6 thẻ cần ôn');
  });
  it('không có thẻ: "Chưa có thẻ đến hạn"; nhiều hơn 20 thì ghi rõ mỗi phiên 20', async () => {
    const el = document.createElement('div');
    mountHub(el, {}, { progress: await makeStore([]), now });
    expect(el.textContent).toContain('Chưa có thẻ đến hạn');
    const el2 = document.createElement('div');
    mountHub(el2, {}, { progress: await makeStore(kanji().slice(0, 10).map((k) => k.id)), now });
    expect(el2.textContent).toContain('30 thẻ cần ôn, mỗi phiên 20');
  });
});
