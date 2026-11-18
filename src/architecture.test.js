// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SRC = join(process.cwd(), 'src');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(SRC).filter((f) => /\.(js|css)$/.test(f) && !/\.test\.js$/.test(f));
const rel = (f) => relative(SRC, f).split(sep).join('/');
const imports = (src) => [...src.matchAll(/import\s[^'"]*['"]([^'"]+)['"]/g)].map((m) => m[1]);

describe('luật kiến trúc', () => {
  it('tính năng không import tính năng khác (AD-2)', () => {
    for (const f of files.filter((f) => rel(f).startsWith('features/'))) {
      const own = rel(f).split('/')[1];
      for (const spec of imports(readFileSync(f, 'utf8'))) {
        if (!spec.startsWith('.')) continue;
        const target = rel(join(f, '..', spec));
        if (target.startsWith('features/')) {
          expect(target.split('/')[1], `${rel(f)} import ${spec}`).toBe(own);
        }
      }
    }
  });

  it('core không import features (AD-2)', () => {
    for (const f of files.filter((f) => rel(f).startsWith('core/'))) {
      for (const spec of imports(readFileSync(f, 'utf8'))) {
        if (!spec.startsWith('.')) continue;
        expect(rel(join(f, '..', spec)).startsWith('features/'), `${rel(f)} import ${spec}`).toBe(false);
      }
    }
  });

  it('không ghi cứng mã màu ngoài token (AD-9)', () => {
    const own = files.filter((f) => {
      const r = rel(f);
      return r !== 'ui/tokens.css' && !r.startsWith('ui/components/');
    });
    for (const f of own) {
      const src = readFileSync(f, 'utf8');
      expect(src.match(/#[0-9a-fA-F]{3,8}\b(?![\w-])/g), rel(f)).toBeNull();
      expect(src.match(/\b(rgb|rgba|hsl|hsla)\(/g), rel(f)).toBeNull();
    }
  });

  it('tính năng và lõi không đọc thẳng dữ liệu nguồn (AD-3)', () => {
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const bad of ['vendor/', 'content-vi/', 'n5_vocab']) {
        expect(src.includes(bad), `${rel(f)} nhắc tới ${bad}`).toBe(false);
      }
    }
  });

  it('chỉ core/progress được dùng localStorage (AD-4)', () => {
    for (const f of files) {
      if (rel(f) === 'core/progress.js') continue;
      expect(/localStorage/.test(readFileSync(f, 'utf8')), `${rel(f)} dùng localStorage`).toBe(false);
    }
  });
});
