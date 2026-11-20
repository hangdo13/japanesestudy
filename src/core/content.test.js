import { it, expect, vi } from 'vitest';
import { kanji, kanjiById, assetUrl } from './content.js';

it('đọc kanji qua core/content', () => {
  expect(kanji()).toHaveLength(110);
  expect(kanjiById('日').hanViet).toBe('NHẬT');
  expect(kanjiById('猫')).toBeNull();
});

it('ghép đường dẫn tài nguyên với base, mã hoá chữ Nhật', () => {
  expect(assetUrl('kanji/svg/日.svg', '/japanesestudy/')).toBe('/japanesestudy/kanji/svg/%E6%97%A5.svg');
  expect(assetUrl('audio/kanji/日-on-にち.mp3', '/x')).toBe(
    '/x/audio/kanji/%E6%97%A5-on-%E3%81%AB%E3%81%A1.mp3',
  );
});

it('dữ liệu dùng chung bị đóng băng sâu', () => {
  const nhat = kanjiById('日');
  expect(Object.isFrozen(nhat.viDu)).toBe(true);
  expect(Object.isFrozen(nhat.on[0])).toBe(true);
});

it('assetUrl mặc định dùng BASE_URL của bản build (/japanesestudy/)', async () => {
  vi.stubEnv('BASE_URL', '/japanesestudy/');
  vi.resetModules();
  const mod = await import('./content.js');
  expect(mod.assetUrl('kanji/svg/日.svg')).toBe('/japanesestudy/kanji/svg/%E6%97%A5.svg');
  vi.unstubAllEnvs();
});
