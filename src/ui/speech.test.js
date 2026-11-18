import { it, expect, vi } from 'vitest';
import { speakJa, canSpeakJapanese } from './speech.js';

const synth = (voices) => ({ getVoices: () => voices, speak: vi.fn(), cancel: vi.fn() });
class U {
  constructor(t) {
    this.text = t;
  }
}

it('đọc bằng giọng tiếng Nhật nếu có', () => {
  const s = synth([{ lang: 'en-US' }, { lang: 'ja-JP', name: 'Kyoko' }]);
  expect(canSpeakJapanese(s)).toBe(true);
  expect(speakJa('し', { synth: s, Utterance: U })).toBe(true);
  expect(s.speak.mock.calls[0][0]).toMatchObject({ text: 'し', lang: 'ja-JP' });
});

it('onVoicesChanged đăng ký voiceschanged và gỡ được', async () => {
  const { onVoicesChanged } = await import('./speech.js');
  const add = vi.fn();
  const remove = vi.fn();
  const cb = () => {};
  const off = onVoicesChanged(cb, { addEventListener: add, removeEventListener: remove });
  expect(add).toHaveBeenCalledWith('voiceschanged', cb);
  off();
  expect(remove).toHaveBeenCalledWith('voiceschanged', cb);
});

it('nhận giọng ja_JP và huỷ câu đang đọc trước khi đọc câu mới', () => {
  const s = synth([{ lang: 'ja_JP' }]);
  speakJa('あ', { synth: s, Utterance: U });
  expect(s.cancel).toHaveBeenCalled();
});

it('không có giọng Nhật hoặc không có API thì trả false', () => {
  expect(speakJa('し', { synth: synth([{ lang: 'en-US' }]), Utterance: U })).toBe(false);
  expect(speakJa('し', { synth: undefined, Utterance: U })).toBe(false);
  expect(canSpeakJapanese(undefined)).toBe(false);
});

it('onError: gọi khi lỗi thật, bỏ qua khi bị huỷ/ngắt', () => {
  const s = synth([{ lang: 'ja-JP' }]);
  const onError = vi.fn();
  speakJa('き', { synth: s, Utterance: U, onError });
  const u = s.speak.mock.calls[0][0];
  u.onerror({ error: 'canceled' });
  u.onerror({ error: 'interrupted' });
  expect(onError).not.toHaveBeenCalled();
  u.onerror({ error: 'audio-busy' });
  expect(onError).toHaveBeenCalledTimes(1);
});
