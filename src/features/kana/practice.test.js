import { describe, it, expect, vi } from 'vitest';
import { renderPractice, practiceSets } from './practice.js';
import { createProgress } from '../../core/progress.js';
import { seededRng, buildSession } from '../../core/kana-quiz.js';
import { kanaById, kanaPairs } from '../../core/content.js';
import { reviewCard } from '../../core/srs.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}
let clock;
const now = () => clock;

function setup(extra = {}, store) {
  clock = new Date('2026-11-18T10:00:00Z');
  store = store || createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
  const view = renderPractice({ progress: store, now, rng: seededRng(11), canSpeak: () => false, speak: vi.fn(), ...extra });
  document.body.replaceChildren(view.node);
  return { view, store };
}

const options = (node) => [...node.querySelectorAll('.kt-option')];
const button = (node, label) => [...node.querySelectorAll('button')].find((b) => b.textContent === label);
const next = (node) => node.querySelector('.kt-feedback .kt-btn--primary').click();

/** Chữ đang hỏi, suy từ đề bài. */
function currentTarget(node) {
  const glyph = node.querySelector('.app-quiz__prompt .kt-flash__glyph');
  if (glyph) return kanaById(glyph.textContent);
  const m = node.querySelector('.app-quiz__prompt').textContent.match(/"(.+)"/);
  const opt = options(node).find((o) => kanaById(o.querySelector('.kt-option__text').textContent.trim()).romaji === m[1]);
  return kanaById(opt.querySelector('.kt-option__text').textContent.trim());
}
function correctIndex(node) {
  const t = currentTarget(node);
  return options(node).findIndex((o) => {
    const txt = o.querySelector('.kt-option__text').textContent.trim();
    return txt === t.romaji || txt === t.id;
  });
}

describe('chọn bộ luyện', () => {
  it('có 7 bộ khi chưa có chữ đến hạn', () => {
    const { view } = setup();
    expect(view.node.querySelectorAll('.kana-set')).toHaveLength(7);
    expect(view.node.textContent).toContain('Cặp dễ nhầm');
    expect(practiceSets()[0].items).toHaveLength(46);
  });

  it('mọi bộ, nhiều seed: mỗi câu 4 đáp án khác âm, cùng bảng chữ với chữ hỏi', () => {
    for (const set of practiceSets()) {
      for (let seed = 1; seed <= 15; seed++) {
        for (const q of buildSession(set.items, { canSpeak: true, pairsOf: kanaPairs, pool: set.pool || set.items, rng: seededRng(seed) })) {
          expect(q.options).toHaveLength(4);
          const sounds = q.options.map((o) => (o.romaji === 'wo' ? 'o' : o.romaji));
          expect(new Set(sounds).size).toBe(4);
          expect(q.options.every((o) => o.script === q.target.script)).toBe(true);
        }
      }
    }
  });

  it('bộ dễ nhầm đưa chữ dễ nhầm vào đáp án (シ có ツ hoặc ミ)', () => {
    const dn = practiceSets().find((s) => s.id === 'de-nham');
    const shi = dn.items.find((k) => k.id === 'シ');
    const s = buildSession([shi], { count: 1, pairsOf: kanaPairs, pool: dn.pool, rng: seededRng(4) });
    expect(s[0].options.map((o) => o.id).some((id) => id === 'ツ' || id === 'ミ')).toBe(true);
  });
});

describe('phiên luyện', () => {
  it('3 câu sai: đúng 3 thẻ Again cho đúng chữ hỏi, kết quả 7/10 có liên kết chữ sai, rồi có bộ "Ôn chữ hay sai"', async () => {
    const { view, store } = setup();
    view.node.querySelector('.kana-set').click();
    const wrongIds = [];
    for (let i = 0; i < 10; i++) {
      const opts = options(view.node);
      const right = correctIndex(view.node);
      expect(right).toBeGreaterThanOrEqual(0);
      if (i < 3) wrongIds.push(currentTarget(view.node).id);
      const pick = i < 3 ? (right + 1) % 4 : right;
      opts[pick].click();
      expect(opts[pick].classList.contains(i < 3 ? 'is-wrong' : 'is-correct')).toBe(true);
      next(view.node);
    }
    expect(view.node.textContent).toContain('Kết quả: 7 / 10');
    const links = [...view.node.querySelectorAll('a.kana-cell')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(wrongIds.map((id) => `#/kana/${encodeURIComponent(id)}`).filter((h, j, a) => a.indexOf(h) === j));
    await view.idle();
    const srs = store.get().srs;
    expect(Object.keys(srs).sort()).toEqual([...new Set(wrongIds)].map((id) => `kana:${id}`).sort());
    for (const c of Object.values(srs)) {
      expect(typeof c.dueAt).toBe('string');
      expect(c.lapses + c.reps).toBeGreaterThan(0);
    }
    clock = new Date('2026-11-18T10:30:00Z'); // thẻ sai đến hạn lại sau bước học ngắn
    button(view.node, 'Luyện bộ khác').click();
    await vi.waitFor(() => expect(view.node.textContent).toContain('Ôn chữ hay sai'));
    expect(view.node.textContent).toContain(`${new Set(wrongIds).size} chữ đến hạn ôn`);
  });

  it('không sai câu nào thì báo tuyệt vời; "Luyện lại" mở lại cùng bộ', async () => {
    const { view, store } = setup();
    view.node.querySelector('.kana-set').click();
    for (let i = 0; i < 10; i++) {
      options(view.node)[correctIndex(view.node)].click();
      next(view.node);
    }
    expect(view.node.textContent).toContain('Không sai câu nào');
    await view.idle();
    expect(Object.keys(store.get().srs)).toHaveLength(0); // đúng mà chưa có thẻ thì không tạo
    button(view.node, 'Luyện lại').click();
    await vi.waitFor(() => expect(view.node.querySelector('.kt-count').textContent).toBe('1 / 10'));
    expect(view.node.querySelector('.kt-session').getAttribute('aria-label')).toBe('Hiragana cơ bản');
  });

  it('bộ ôn: 2 thẻ đến hạn → 2 câu, sớm nhất trước; đúng thì hạn ôn lùi xa và reps tăng', async () => {
    const t0 = new Date('2026-11-17T10:00:00Z');
    const a = await reviewCard(null, false, t0);
    const b = await reviewCard(null, false, new Date('2026-11-17T11:00:00Z'));
    clock = new Date('2026-11-18T10:00:00Z');
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    store.update((d) => {
      d.srs['kana:ア'] = b;
      d.srs['kana:し'] = a;
    });
    const { view } = setup({}, store);
    const due = view.node.querySelector('.kana-set');
    expect(due.textContent).toContain('2 chữ đến hạn ôn');
    due.click();
    expect(view.node.querySelector('.kt-count').textContent).toBe('1 / 2');
    expect(currentTarget(view.node).id).toBe('し');
    for (let i = 0; i < 2; i++) {
      const t = currentTarget(view.node);
      // câu hỏi chữ → romaji: không kiểm tra bảng chữ được; câu romaji → chữ: mọi đáp án cùng bảng chữ
      const glyphs = options(view.node).map((o) => kanaById(o.querySelector('.kt-option__text').textContent.trim()));
      if (glyphs.every(Boolean)) expect(glyphs.every((k) => k.script === t.script)).toBe(true);
      options(view.node)[correctIndex(view.node)].click();
      next(view.node);
    }
    await view.idle();
    const srs = store.get().srs;
    expect(Date.parse(srs['kana:し'].dueAt)).toBeGreaterThan(Date.parse(a.dueAt));
    expect(srs['kana:し'].reps).toBe(a.reps + 1);
    expect(srs['kana:ア'].reps).toBe(b.reps + 1);
  });

  it('đúng một chữ có thẻ nhưng chưa đến hạn thì không chấm lại', async () => {
    const card = await reviewCard(null, false, new Date('2026-11-18T09:59:30Z'));
    clock = new Date('2026-11-18T10:00:00Z');
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    store.update((d) => {
      for (const id of 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん') d.srs[`kana:${id}`] = card;
    });
    // thẻ vừa sai 30 giây trước chưa đến hạn (bước học 1 phút)
    expect(Date.parse(card.dueAt)).toBeGreaterThan(clock.getTime());
    const { view } = setup({}, store);
    clock = new Date('2026-11-18T10:00:00Z');
    [...view.node.querySelectorAll('.kana-set')].find((b) => b.textContent.includes('Hiragana cơ bản')).click();
    options(view.node)[correctIndex(view.node)].click();
    const id = currentTarget(view.node).id;
    await view.idle();
    expect(store.get().srs[`kana:${id}`]).toEqual(card);
  });

  it('ghi lỗi thì báo lỗi nhưng vẫn làm tiếp được', async () => {
    const store = createProgress({ storage: memoryStorage(), now, events: new EventTarget() });
    const broken = { get: store.get, update: () => ({ ok: false, error: 'Bộ nhớ đầy' }) };
    const { view } = setup({ progress: broken });
    view.node.querySelector('.kana-set').click();
    options(view.node)[(correctIndex(view.node) + 1) % 4].click();
    await view.idle();
    expect(view.node.querySelector('[role=status].kana-text').textContent).toBe('Bộ nhớ đầy');
    next(view.node);
    expect(view.node.querySelector('.kt-count').textContent).toBe('2 / 10');
  });

  it('lịch ôn ném lỗi thì báo, không vỡ', async () => {
    const { view } = setup({ scheduleReview: () => Promise.reject(new Error('x')) });
    view.node.querySelector('.kana-set').click();
    const t = currentTarget(view.node);
    options(view.node)[(correctIndex(view.node) + 1) % 4].click();
    await view.idle();
    expect(view.node.querySelector('[role=status].kana-text').textContent).toContain(t.id);
  });

  it('thoát giữa chừng vẫn lưu thẻ sai', async () => {
    const { view, store } = setup();
    view.node.querySelector('.kana-set').click();
    options(view.node)[(correctIndex(view.node) + 1) % 4].click();
    view.cleanup();
    await view.idle();
    expect(Object.keys(store.get().srs)).toHaveLength(1);
  });

  it('có giọng thì câu thứ hai là câu nghe và tự phát âm', () => {
    const speak = vi.fn(() => true);
    const { view } = setup({ canSpeak: () => true, speak });
    view.node.querySelector('.kana-set').click();
    options(view.node)[0].click();
    next(view.node);
    expect(speak).toHaveBeenCalled();
    expect(view.node.textContent).toContain('Nghe và chọn chữ đúng');
  });

  it('không có giọng thì câu thứ hai hỏi romaji → chữ và không phát âm', () => {
    const speak = vi.fn();
    const { view } = setup({ speak });
    view.node.querySelector('.kana-set').click();
    options(view.node)[0].click();
    next(view.node);
    expect(view.node.querySelector('.app-quiz__prompt').textContent).toMatch(/^Chữ nào đọc là ".+"\?$/);
    expect(speak).not.toHaveBeenCalled();
  });

  it('giọng mất giữa chừng (speak trả false) thì câu nghe đổi sang hỏi romaji', () => {
    const { view } = setup({ canSpeak: () => true, speak: () => false });
    view.node.querySelector('.kana-set').click();
    options(view.node)[0].click();
    next(view.node);
    expect(view.node.querySelector('.app-quiz__prompt').textContent).toMatch(/^Chữ nào đọc là/);
  });

  it('giọng nạp muộn: phiên sau có câu nghe', () => {
    let ready = false;
    const { view } = setup({ canSpeak: () => ready, speak: () => true });
    ready = true;
    view.node.querySelector('.kana-set').click();
    options(view.node)[0].click();
    next(view.node);
    expect(view.node.textContent).toContain('Nghe và chọn chữ đúng');
  });
});
