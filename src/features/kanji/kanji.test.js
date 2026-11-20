import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mount } from './index.js';
import { playAudio, createPlayer } from './detail.js';
import { renderStrokes, cleanKanjiVg } from '../../ui/strokes.js';

afterEach(() => {
  window.location.hash = '';
});

const SVG = readFileSync(join(process.cwd(), 'public/kanji/svg/日.svg'), 'utf8');
const okFetch = () => vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(SVG) }));

function render(param, deps = {}) {
  const el = document.createElement('div');
  document.body.replaceChildren(el);
  const fetch = deps.fetch || okFetch();
  el.cleanup = mount(el, { param }, { fetch, ...deps });
  el.fetch = fetch;
  return el;
}

describe('màn danh sách', () => {
  it('có 110 ô theo thứ tự, link tới trang chi tiết, có chip Chưa duyệt', () => {
    const el = render(null);
    const tiles = el.querySelectorAll('a.kanji-tile');
    expect(tiles).toHaveLength(110);
    expect(tiles[0].textContent).toContain('一');
    expect(tiles[0].textContent).toContain('NHẤT');
    expect(tiles[0].getAttribute('href')).toBe('#/kanji/%E4%B8%80');
    expect(tiles[0].textContent).toContain('Chưa duyệt');
    expect(tiles[0].querySelector('.kt-skill').getAttribute('lang')).toBe('ja');
    expect(tiles[0].getAttribute('aria-label')).toContain('chưa duyệt');
    const learn = [...el.querySelectorAll('a.kt-btn')].find((a) => a.textContent === 'Học chữ mới hôm nay');
    expect(learn.getAttribute('href')).toBe('#/kanji/hoc-moi');
    const review = [...el.querySelectorAll('a.kt-btn')].find((a) => a.textContent === 'Ôn kanji đến hạn');
    expect(review.getAttribute('href')).toBe('#/on-tap/kanji');
  });
});

describe('trang chi tiết', () => {
  it('hiện đủ các phần của 日 và chỉ có một khối tô màu', async () => {
    const el = render('日');
    const text = el.textContent;
    for (const s of ['NHẬT', 'mặt trời, ngày', 'Cách nhớ', 'Cách đọc', 'ニチ', 'ひ', 'Thứ tự nét', 'Ví dụ', '今日', 'Dễ nhầm với', 'Chưa duyệt']) {
      expect(text).toContain(s);
    }
    expect(el.querySelectorAll('.kt-card--tinted')).toHaveLength(1);
    const deNham = [...el.querySelectorAll('section a.kanji-tile')].map((a) => a.getAttribute('href'));
    expect(deNham).toContain('#/kanji/%E7%9B%AE');
    await el.querySelector('.kanji-strokes').ready;
    const svg = el.querySelector('.kanji-strokes svg');
    expect(svg).not.toBeNull();
    expect(svg.hasAttribute('width')).toBe(false);
    expect(el.fetch).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}kanji/svg/%E6%97%A5.svg`);
    expect(el.querySelector('.kanji-strokes').getAttribute('aria-label')).toBe('Thứ tự nét viết chữ 日');
  });

  it('bấm phát âm thì phát đúng file theo base', async () => {
    const played = [];
    class FakeAudio {
      constructor(src) {
        played.push(src);
      }
      play() {
        return Promise.resolve();
      }
    }
    const el = render('日', { Audio: FakeAudio });
    el.querySelector('button[aria-label="Phát âm ニチ"]').click();
    el.querySelector('button[aria-label="Phát âm ひ"]').click();
    await Promise.resolve();
    expect(played[0]).toBe(`${import.meta.env.BASE_URL}audio/kanji/%E6%97%A5-on-%E3%81%AB%E3%81%A1.mp3`);
    expect(played[1]).toBe(`${import.meta.env.BASE_URL}audio/kanji/%E6%97%A5-kun-%E3%81%B2.mp3`);
  });

  it('phát lỗi thì hiện thông báo tiếng Việt', async () => {
    const status = document.createElement('p');
    class BadAudio {
      play() {
        return Promise.reject(new Error('NotAllowedError'));
      }
    }
    expect(await playAudio('audio/kanji/x.mp3', status, BadAudio)).toBe(false);
    expect(status.textContent).toContain('Không phát được âm thanh');
  });

  it('chữ lạ hiện EmptyState có nút về danh sách', () => {
    const el = render('xyz');
    expect(el.querySelector('.kt-empty').textContent).toContain('Không tìm thấy chữ này');
    el.querySelector('.kt-empty button').click();
    expect(window.location.hash).toBe('#/kanji');
  });
});

describe('SVG thứ tự nét', () => {
  it('tải lỗi thì hiện dòng thông báo, không ném lỗi', async () => {
    const box = renderStrokes('kanji/svg/日.svg', { fetchImpl: () => Promise.reject(new Error('mạng')) });
    await box.ready;
    expect(box.textContent).toBe('Chưa tải được hình thứ tự nét.');
  });
  it('phản hồi không ok cũng hiện thông báo', async () => {
    const box = renderStrokes('kanji/svg/日.svg', { fetchImpl: () => Promise.resolve({ ok: false, status: 404 }) });
    await box.ready;
    expect(box.textContent).toBe('Chưa tải được hình thứ tự nét.');
  });
});

describe('bộ phát và dọn dẹp', () => {
  function fakeAudioClass(log) {
    return class {
      constructor(src) {
        this.src = src;
        log.push(this);
      }
      play() {
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
      }
    };
  }

  it('bấm âm mới thì dừng âm đang phát, lỗi muộn của lần trước không ghi đè trạng thái', async () => {
    const status = document.createElement('p');
    let rejectFirst;
    const log = [];
    class A {
      constructor() {
        log.push(this);
      }
      play() {
        return log.length === 1 ? new Promise((_, r) => (rejectFirst = r)) : Promise.resolve();
      }
      pause() {
        this.paused = true;
      }
    }
    const player = createPlayer(status, A);
    const first = player.play('a.mp3');
    await player.play('b.mp3');
    expect(log[0].paused).toBe(true);
    rejectFirst(new Error('x'));
    await first;
    expect(status.textContent).toBe('');
  });

  it('rời trang chi tiết thì dừng âm thanh và bỏ kết quả tải SVG', async () => {
    const log = [];
    let resolveFetch;
    const fetch = vi.fn(() => new Promise((r) => (resolveFetch = r)));
    const el = render('日', { Audio: fakeAudioClass(log), fetch });
    el.querySelector('button[aria-label="Phát âm ニチ"]').click();
    el.cleanup();
    expect(log[0].paused).toBe(true);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    resolveFetch({ ok: true, text: () => Promise.resolve(SVG) });
    await el.querySelector('.kanji-strokes').ready;
    expect(el.querySelector('.kanji-strokes svg')).toBeNull();
  });
});

describe('cleanKanjiVg', () => {
  it('bỏ DTD có internal subset, prolog, comment và khai báo kvg', () => {
    const out = cleanKanjiVg(SVG);
    expect(out.startsWith('<svg')).toBe(true);
    expect(out).toContain('xmlns:kvg="http://kanjivg.tagaini.net"');
    expect(out).not.toContain('<!DOCTYPE');
    expect(out).not.toContain('<!--');
  });
  it('xử lý DOCTYPE không có internal subset mà không cắt nội dung', () => {
    const out = cleanKanjiVg('<!DOCTYPE svg><svg><path d="M1 1"/><![CDATA[x]]></svg>');
    expect(out).toBe('<svg xmlns:kvg="http://kanjivg.tagaini.net"><path d="M1 1"/><![CDATA[x]]></svg>');
  });
  it('không thêm kvg lần nữa nếu đã có', () => {
    const out = cleanKanjiVg('<svg xmlns:kvg="http://kanjivg.tagaini.net"></svg>');
    expect(out.match(/xmlns:kvg/g)).toHaveLength(1);
  });
  it('phản hồi 200 nhưng không phải SVG thì hiện thông báo', async () => {
    const box = renderStrokes('x.svg', {
      fetchImpl: () => Promise.resolve({ ok: true, text: () => Promise.resolve('<!doctype html><html><body>x</body></html>') }),
    });
    await box.ready;
    expect(box.querySelector('svg')).toBeNull();
    expect(box.textContent).toBe('Chưa tải được hình thứ tự nét.');
  });
});

describe('âm đọc không có audio (4 chữ thêm, Story 1.7)', () => {
  class A {
    constructor(src) {
      A.played.push(src);
    }
    play() {
      return Promise.resolve();
    }
    pause() {
      A.paused += 1;
    }
  }
  A.played = [];
  A.paused = 0;
  const noVoices = () => () => {};

  it('có audio thì phát file; không có thì đọc bằng giọng máy (cả từ cho âm kun gốc); dừng thì huỷ giọng', async () => {
    const status = document.createElement('p');
    const speak = vi.fn(() => true);
    const cancelSpeech = vi.fn();
    const player = createPlayer(status, A, { speak, canSpeak: () => true, voicesChanged: noVoices, cancelSpeech });
    expect(await player.playReading({ kana: 'ニチ', audio: 'audio/kanji/日-on-にち.mp3' })).toBe(true);
    expect(decodeURIComponent(A.played.at(-1))).toContain('日-on-');
    expect(await player.playReading({ kana: 'ギョ', audio: null })).toBe(true);
    expect(speak).toHaveBeenLastCalledWith('ギョ', expect.objectContaining({ onError: expect.any(Function) }));
    expect(await player.playReading({ kana: 'すく', audio: null, tts: 'すくない' })).toBe(true);
    expect(speak).toHaveBeenLastCalledWith('すくない', expect.anything());
    player.stop();
    expect(cancelSpeech).toHaveBeenCalled();
  });

  it('không có giọng: chờ giọng nạp, vẫn không có thì báo; lỗi khi đọc thì báo', async () => {
    const status = document.createElement('p');
    let ready = false;
    let notify;
    const speak = vi.fn((t, o) => {
      speak.onError = o.onError;
      return true;
    });
    const player = createPlayer(status, A, { speak, canSpeak: () => ready, voicesChanged: (cb) => ((notify = cb), () => {}), cancelSpeech: () => {} });
    const p = player.playReading({ kana: 'ギョ', audio: null });
    ready = true;
    notify();
    expect(await p).toBe(true);
    speak.onError({ error: 'synthesis-failed' });
    expect(status.textContent).toContain('giọng đọc tiếng Nhật');
    vi.useFakeTimers();
    try {
      ready = false;
      const silent = createPlayer(status, A, { speak, canSpeak: () => false, voicesChanged: noVoices, cancelSpeech: () => {} });
      status.textContent = '';
      const q = silent.playReading({ kana: 'うお', audio: null });
      await vi.advanceTimersByTimeAsync(2000);
      expect(await q).toBe(false);
      expect(status.textContent).toContain('giọng đọc tiếng Nhật');
    } finally {
      vi.useRealTimers();
    }
  });

  it('trang chi tiết 魚: tải SVG nét viết, bấm nghe âm on đọc bằng giọng máy; không có giọng thì báo trên trang', async () => {
    const svg = readFileSync(join(process.cwd(), 'public/kanji/svg/魚.svg'), 'utf8');
    const fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(svg) }));
    const speak = vi.fn(() => true);
    const el = document.createElement('div');
    document.body.replaceChildren(el);
    mount(el, { param: '魚' }, { speak, canSpeak: () => true, fetch });
    expect(el.textContent).toContain('NGƯ');
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(decodeURIComponent(fetch.mock.calls[0][0])).toContain('kanji/svg/魚.svg');
    el.querySelector('[aria-label="Phát âm ギョ"]').click();
    await vi.waitFor(() => expect(speak).toHaveBeenCalledWith('ギョ', expect.anything()));
    await vi.waitFor(() => expect(el.querySelectorAll('.kanji-strokes path').length).toBeGreaterThan(0));

    const el2 = document.createElement('div');
    mount(el2, { param: '魚' }, { speak, canSpeak: () => false, fetch: () => new Promise(() => {}) });
    el2.querySelector('[aria-label="Phát âm ギョ"]').click();
    await vi.waitFor(() => expect(el2.textContent).toContain('giọng đọc tiếng Nhật'), { timeout: 3000 });
  });

  it('chữ lạ: EmptyState nói 110 kanji', () => {
    const el = document.createElement('div');
    mount(el, { param: '龍' }, {});
    expect(el.textContent).toContain('110 kanji N5');
  });
});
