import { kanji } from '../../core/content.js';
import { toHash } from '../../core/router.js';
import { HOC_MOI } from './routes.js';

export function renderList() {
  const wrap = document.createElement('div');
  wrap.className = 'kt-stack';

  const head = document.createElement('div');
  head.className = 'kt-sechead';
  const h2 = document.createElement('h2');
  h2.textContent = 'Kanji N5';
  const count = document.createElement('span');
  count.className = 'kt-chip kt-chip--kanji';
  count.textContent = `${kanji().length} chữ`;
  head.append(h2, count);

  const learn = document.createElement('a');
  learn.className = 'kt-btn kt-btn--primary kt-btn--block kanji-learn-link';
  learn.href = toHash('kanji', HOC_MOI);
  learn.textContent = 'Học chữ mới hôm nay';

  const grid = document.createElement('div');
  grid.className = 'kanji-grid';
  for (const k of kanji()) {
    const a = document.createElement('a');
    a.className = 'kanji-tile';
    a.href = toHash('kanji', k.id);
    a.setAttribute('aria-label', `${k.id}, ${k.hanViet}, ${k.nghia}${k.reviewStatus === 'draft' ? ', chưa duyệt' : ''}`);

    const tile = document.createElement('span');
    tile.className = 'kt-skill kt-skill--lg kt-skill--kanji kt-jp';
    tile.lang = 'ja';
    tile.textContent = k.id;

    const hv = document.createElement('small');
    hv.className = 'kt-muted';
    hv.textContent = k.hanViet;

    a.append(tile, hv);
    if (k.reviewStatus === 'draft') {
      const chip = document.createElement('span');
      chip.className = 'kt-chip kt-chip--outline';
      chip.textContent = 'Chưa duyệt';
      a.append(chip);
    }
    grid.append(a);
  }

  wrap.append(head, learn, grid);
  return wrap;
}
