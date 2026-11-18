import { describe, it, expect, vi } from 'vitest';
import { renderLearn } from './learn.js';
import { createProgress } from '../../core/progress.js';
import { kanji } from '../../core/content.js';

function memoryStorage({ failSet = false } = {}) {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      if (failSet) throw new Error('quota');
      m.set(k, String(v));
    },
  };
}
const now = () => new Date(2026, 10, 18, 20, 0);

function setup({ store, win } = {}) {
  const progress = store || createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
  const w = win || { location: { hash: '' }, Kotoba: undefined };
  const view = renderLearn({ progress, now, win: w });
  document.body.replaceChildren(view.node);
  return { view, progress, win: w };
}

describe('học gói kanji mới', () => {
  it('gói đầu tiên có 5 thẻ 一 二 三 四 五, thẻ trên cùng là 一', () => {
    const { view } = setup();
    const cards = [...view.node.querySelectorAll('.kt-deck .kt-flash')];
    expect(cards.map((c) => c.dataset.id)).toEqual(['五', '四', '三', '二', '一']);
    expect(view.node.querySelector('.kt-count').textContent).toBe('1 / 5');
    const top = cards[cards.length - 1];
    expect(top.querySelector('.kt-flash__glyph').textContent).toBe('一');
    expect(top.textContent).toContain('NHẤT');
    expect(top.textContent).toContain(kanji()[0].cauGoiNho);
    expect(view.node.querySelector('.kt-deck').tabIndex).toBe(0);
  });

  it('xem hết thẻ thì hiện nút "Đã học xong", bấm thì ghi tiến độ và hiện GoalComplete', () => {
    const { view, progress } = setup();
    for (let i = 0; i < 5; i++) view.swipe(i % 2 ? 'left' : 'right');
    const done = [...view.node.querySelectorAll('button')].find((b) => b.textContent === 'Đã học xong');
    expect(done.hidden).toBe(false);
    expect(view.node.querySelector('.kt-count').textContent).toBe('5 / 5');
    done.click();
    const data = progress.get();
    for (const id of ['一', '二', '三', '四', '五']) expect(data.kanji[id].gioiThieu).toBe('2026-11-18');
    expect(view.node.querySelector('.kt-goal')).not.toBeNull();
    expect(view.node.querySelectorAll('.kt-mascot')).toHaveLength(1);
  });

  it('ghi lỗi thì báo lỗi tiếng Việt, không hiện GoalComplete', () => {
    const store = createProgress({ storage: memoryStorage({ failSet: true }), now, events: new EventTarget() });
    const { view } = setup({ store });
    for (let i = 0; i < 5; i++) view.swipe();
    [...view.node.querySelectorAll('button')].find((b) => b.textContent === 'Đã học xong').click();
    expect(view.node.querySelector('[role=status]').textContent).toContain('Không lưu được');
    expect(view.node.querySelector('.kt-goal')).toBeNull();
  });

  it('đủ hạn mức hôm nay thì hiện EmptyState', () => {
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    store.update((d) => {
      for (const id of ['一', '二', '三', '四', '五']) d.kanji[id] = { gioiThieu: '2026-11-18' };
    });
    const { view } = setup({ store });
    expect(view.node.textContent).toContain('Hôm nay đủ rồi, mai học tiếp nhé');
  });

  it('còn một phần hạn mức thì hiện số thẻ còn lại', () => {
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    store.update((d) => {
      for (const id of ['一', '二', '三']) d.kanji[id] = { gioiThieu: '2026-11-18' };
    });
    const { view } = setup({ store });
    expect([...view.node.querySelectorAll('.kt-flash')].map((c) => c.dataset.id)).toEqual(['五', '四']);
  });

  it('học hết 106 chữ thì báo đã học hết', () => {
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    store.update((d) => {
      for (const k of kanji()) d.kanji[k.id] = { gioiThieu: '2026-11-01' };
    });
    expect(setup({ store }).view.node.textContent).toContain('học hết 106 kanji');
  });

  it('đường vuốt thật qua Kotoba.swipeDeck: onSwipe đẩy tiến độ tới nút Đã học xong', () => {
    let opts;
    const swipeDeck = vi.fn((deck, o) => {
      opts = o;
      return { swipe: (dir) => opts.onSwipe(dir, deck.lastElementChild) };
    });
    const { view } = setup({ win: { location: { hash: '' }, Kotoba: { swipeDeck, hydrate: vi.fn() } } });
    for (let i = 0; i < 5; i++) view.swipe(i % 2 ? 'left' : 'right');
    expect(view.node.querySelector('.kt-count').textContent).toBe('5 / 5');
    expect(view.node.querySelectorAll('.kt-deck .kt-flash')).toHaveLength(0);
    expect([...view.node.querySelectorAll('button')].find((b) => b.textContent === 'Đã học xong').hidden).toBe(false);
  });

  it('sau cleanup, onSwipe đến muộn bị bỏ qua', () => {
    let opts;
    const swipeDeck = (deck, o) => ((opts = o), { swipe: () => {} });
    const { view } = setup({ win: { location: { hash: '' }, Kotoba: { swipeDeck } } });
    view.cleanup();
    const top = view.node.querySelector('.kt-deck').lastElementChild;
    opts.onSwipe('right', top);
    expect(top.isConnected).toBe(true);
  });

  it('phiên kéo qua nửa đêm thì lưu theo ngày lúc bấm', () => {
    let t = new Date(2026, 10, 18, 23, 59);
    const store = createProgress({ storage: memoryStorage(), now: () => t, events: new EventTarget() });
    const view = renderLearn({ progress: store, now: () => t, win: { location: { hash: '' } } });
    for (let i = 0; i < 5; i++) view.swipe();
    t = new Date(2026, 10, 19, 0, 1);
    [...view.node.querySelectorAll('button')].find((b) => b.textContent === 'Đã học xong').click();
    expect(store.get().kanji['一'].gioiThieu).toBe('2026-11-19');
  });

  it('dùng Kotoba.swipeDeck khi có, và nút đóng về danh sách', () => {
    const swipeDeck = vi.fn(() => ({ swipe: vi.fn() }));
    const { view, win } = setup({ win: { location: { hash: '' }, Kotoba: { swipeDeck, hydrate: vi.fn() } } });
    expect(swipeDeck).toHaveBeenCalledWith(view.node.querySelector('.kt-deck'), expect.any(Object));
    view.node.querySelector('button[aria-label="Đóng"]').click();
    expect(win.location.hash).toBe('#/kanji');
  });
});

it('app.css có luật [hidden] để nút "Đã học xong" thật sự ẩn trên trình duyệt', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  expect(readFileSync(join(process.cwd(), 'src/ui/app.css'), 'utf8')).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

describe('đưa chữ vừa học vào lịch ôn (Story 2.1)', () => {
  const finish = (view) => {
    for (let i = 0; i < 5; i++) view.swipe('right');
    [...view.node.querySelectorAll('button')].find((b) => b.textContent === 'Đã học xong').click();
  };
  it('bấm "Đã học xong" tạo 15 thẻ kanji-nghia/doc/chu cho 5 chữ', async () => {
    const { view, progress } = setup();
    finish(view);
    await view.cardsDone;
    const keys = Object.keys(progress.get().srs).sort();
    expect(keys).toHaveLength(15);
    for (const id of ['一', '二', '三', '四', '五'])
      for (const kind of ['kanji-nghia', 'kanji-doc', 'kanji-chu']) expect(keys).toContain(`${kind}:${id}`);
  });
  it('không lưu được thẻ thì vẫn hiện GoalComplete và báo lỗi', async () => {
    const real = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    let calls = 0;
    const store = { get: real.get, update: (fn) => (++calls === 1 ? real.update(fn) : { ok: false, error: 'Bộ nhớ đầy' }) };
    const { view } = setup({ store });
    finish(view);
    await view.cardsDone;
    expect(view.node.textContent).toContain('Xong gói kanji hôm nay!');
    expect(view.node.querySelector('[role=status]').textContent).toContain('Bộ nhớ đầy');
  });
});
