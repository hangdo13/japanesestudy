import { toHash } from '../../core/router.js';
import { kanji } from '../../core/content.js';

/** Mục lục các phần học theo lộ trình N5. Phần chưa có thì ghi "Sắp có". */
const PHAN = [
  { title: 'Kana & phát âm', sub: 'Hiragana, katakana, quy tắc đọc', glyph: 'あ', skill: 'kanji', hash: toHash('kana') },
  { title: 'Kanji N5', sub: `${kanji().length} chữ, âm Hán Việt, câu gợi nhớ`, glyph: '字', skill: 'kanji', hash: toHash('kanji') },
  { title: 'Từ vựng', sub: 'Sắp có', glyph: '語', skill: 'vocab' },
  { title: 'Ngữ pháp', sub: 'Sắp có', glyph: '文', skill: 'grammar' },
  { title: 'Luyện nghe', sub: 'Sắp có', icon: 'mic', skill: 'speaking' },
];

export function mount(root) {
  const wrap = document.createElement('div');
  wrap.className = 'kt-stack';
  const head = document.createElement('div');
  head.className = 'kt-sechead';
  const h2 = document.createElement('h2');
  h2.textContent = 'Học theo lộ trình N5';
  head.append(h2);

  const list = document.createElement('div');
  list.className = 'kt-list';
  for (const p of PHAN) {
    const item = document.createElement(p.hash ? 'a' : 'div');
    item.className = 'kt-item';
    if (p.hash) {
      item.href = p.hash;
      item.classList.add('app-link-plain');
    }
    const skill = document.createElement('span');
    skill.className = `kt-skill kt-skill--${p.skill}`;
    if (p.icon) {
      const i = document.createElement('i');
      i.dataset.icon = p.icon;
      skill.append(i);
    } else {
      skill.textContent = p.glyph;
      skill.classList.add('kt-jp');
      skill.lang = 'ja';
    }
    const body = document.createElement('div');
    body.className = 'kt-item__body';
    const t = document.createElement('p');
    t.className = 'kt-item__title';
    t.textContent = p.title;
    const s = document.createElement('p');
    s.className = 'kt-item__sub';
    s.textContent = p.sub;
    body.append(t, s);
    item.append(skill, body);
    list.append(item);
  }
  wrap.append(head, list);
  root.append(wrap);
}
