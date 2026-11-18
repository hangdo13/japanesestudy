/**
 * Phát âm tiếng Nhật bằng giọng có sẵn trên máy (Web Speech API).
 * Dùng cho kana, từ vựng và các chữ không có file audio.
 */
export function japaneseVoice(synth = globalThis.speechSynthesis) {
  if (!synth || typeof synth.getVoices !== 'function') return null;
  const voices = synth.getVoices() || [];
  return voices.find((v) => /^ja(-|_|$)/i.test(v.lang)) || null;
}

/** Có phát được tiếng Nhật không. Trên iOS danh sách giọng có thể tải muộn. */
export function canSpeakJapanese(synth = globalThis.speechSynthesis) {
  return !!japaneseVoice(synth);
}

/** Đọc `text`. Trả true nếu đã gửi lệnh đọc. */
export function speakJa(text, { synth = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance, rate = 0.85 } = {}) {
  const voice = japaneseVoice(synth);
  if (!voice || typeof Utterance !== 'function') return false;
  synth.cancel();
  const u = new Utterance(text);
  u.lang = voice.lang;
  u.voice = voice;
  u.rate = rate;
  synth.speak(u);
  return true;
}

/** Gọi `cb` khi danh sách giọng thay đổi (iOS tải giọng bất đồng bộ). Trả hàm huỷ. */
export function onVoicesChanged(cb, synth = globalThis.speechSynthesis) {
  if (!synth || typeof synth.addEventListener !== 'function') return () => {};
  synth.addEventListener('voiceschanged', cb);
  return () => synth.removeEventListener('voiceschanged', cb);
}
