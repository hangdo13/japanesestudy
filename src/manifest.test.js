// @vitest-environment node
import { it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

it('manifest hợp lệ, đường dẫn tương đối và icon tồn tại', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'public/manifest.webmanifest'), 'utf8'));
  expect(m.short_name).toBe('Kotoba');
  expect(m.display).toBe('standalone');
  expect(m.start_url).toBe('./');
  for (const icon of m.icons) {
    expect(icon.src.startsWith('/')).toBe(false);
    expect(existsSync(join(ROOT, 'public', icon.src))).toBe(true);
  }
});

it('index.html có apple-touch-icon và manifest', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  expect(html).toContain('rel="manifest"');
  expect(html).toContain('rel="apple-touch-icon"');
  expect(existsSync(join(ROOT, 'public/icons/apple-touch-icon.png'))).toBe(true);
  expect(html).toContain('apple-mobile-web-app-capable');
});

it('requestPersistentStorage gọi navigator.storage.persist khi có, không lỗi khi không có', async () => {
  const { requestPersistentStorage } = await import('./core/progress.js');
  let called = false;
  expect(await requestPersistentStorage({ storage: { persist: () => { called = true; return Promise.resolve(true); } } })).toBe(true);
  expect(called).toBe(true);
  expect(await requestPersistentStorage({})).toBe(false);
  expect(await requestPersistentStorage(null)).toBe(false);
});
