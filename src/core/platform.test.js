import { it, expect } from 'vitest';
import { detectPlatform } from './platform.js';

const win = (ua, extra = {}, standaloneMq = false) => ({
  navigator: { userAgent: ua, ...extra },
  matchMedia: () => ({ matches: standaloneMq }),
});
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile/15E148 Safari/604.1';

it('nhận ra iPhone trong tab Safari thường', () => {
  expect(detectPlatform(win(IPHONE))).toEqual({ isIos: true, isIosSafari: true, isStandalone: false });
});
it('nhận ra iPhone mở từ màn hình chính (navigator.standalone)', () => {
  expect(detectPlatform(win(IPHONE, { standalone: true }))).toMatchObject({ isIos: true, isStandalone: true });
});
it('nhận ra display-mode: standalone', () => {
  expect(detectPlatform(win(IPHONE, {}, true)).isStandalone).toBe(true);
});
it('iPad tự nhận là Mac nhưng có cảm ứng', () => {
  expect(detectPlatform(win('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', { maxTouchPoints: 5 })).isIos).toBe(true);
  expect(detectPlatform(win('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', { maxTouchPoints: 0 })).isIos).toBe(false);
});
it('máy tính và Android không phải iOS', () => {
  expect(detectPlatform(win('Mozilla/5.0 (Linux; Android 15) Chrome/131')).isIos).toBe(false);
});

it('Chrome trên iPhone và trình duyệt trong app không phải Safari', () => {
  expect(detectPlatform(win(IPHONE.replace('Version/18.1', 'CriOS/131.0'))).isIosSafari).toBe(false);
  expect(detectPlatform(win(`${IPHONE} [FBAN/FBIOS]`)).isIosSafari).toBe(false);
});
it('matchMedia ném lỗi hoặc không có thì vẫn chạy', () => {
  expect(detectPlatform({ navigator: { userAgent: IPHONE }, matchMedia: () => { throw new Error('x'); } }).isStandalone).toBe(false);
  expect(detectPlatform({ navigator: { userAgent: IPHONE } }).isStandalone).toBe(false);
});
