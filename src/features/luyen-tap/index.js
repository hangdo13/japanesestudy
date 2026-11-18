import { toHash } from '../../core/router.js';
import { kanji, vocab } from '../../core/content.js';
import { localDate } from '../../core/progress.js';
import { dueVocab, newVocabToday, MAX_REVIEW } from '../../core/vocab-review.js';
import { progress as defaultProgress } from '../../core/progress.js';
import { dueKanjiCards, missingKanjiCards, MAX_PER_SESSION } from '../../core/kanji-review.js';

/** Mục lục các phần học theo lộ trình N5. Phần chưa có thì ghi "Sắp có". */
const PHAN = [
  { title: 'Kana & phát âm', sub: 'Hiragana, katakana, quy tắc đọc', glyph: 'あ', skill: 'kanji', hash: toHash('kana') },
  { title: 'Kanji N5', sub: `${kanji().length} chữ, âm Hán Việt, câu gợi nhớ`, glyph: '字', skill: 'kanji', hash: toHash('kanji') },
  { title: 'Từ vựng', sub: 'Sắp có', glyph: '語', skill: 'vocab' },
  { title: 'Ngữ pháp', sub: 'Sắp có', glyph: '文', skill: 'grammar' },
  { title: 'Luyện nghe', sub: 'Sắp có', icon: 'mic', skill: 'speaking' },
];

/** Số thẻ kanji cần ôn bây giờ (gồm thẻ sắp được tạo cho chữ đã học). */
export function kanjiReviewCount(data, now = new Date()) {
  const known = new Set(kanji().map((k) => k.id));
  return dueKanjiCards(data, known, now).length + missingKanjiCards(data, known).length;
}

/** Từ vựng hôm nay: số thẻ đến hạn (tính tối đa một phiên) và số từ mới còn trong hạn mức. */
export function vocabTodayCount(data, now = new Date()) {
  const known = new Set(vocab().map((w) => w.id));
  return {
    due: dueVocab(data, known, now).length,
    moi: newVocabToday(data, vocab(), localDate(now)).pack.length,
  };
}

export function mount(root, _params, deps = {}) {
  const store = deps.progress || defaultProgress();
  const t = (deps.now || (() => new Date()))();
  const n = kanjiReviewCount(store.get(), t);
  const v = vocabTodayCount(store.get(), t);
  const vSub = [v.due ? `${v.due} từ cần ôn${v.due > MAX_REVIEW ? `, mỗi phiên ${MAX_REVIEW}` : ''}` : '', v.moi ? `${v.moi} từ mới` : ''].filter(Boolean).join(' · ') || 'Xong từ vựng hôm nay';
  const phan = [
    { title: 'Ôn kanji', sub: n ? `${n} thẻ cần ôn${n > MAX_PER_SESSION ? `, mỗi phiên ${MAX_PER_SESSION}` : ''}` : 'Chưa có thẻ đến hạn', glyph: '復', skill: 'kanji', hash: toHash('on-tap', 'kanji') },
    { title: 'Ôn từ vựng', sub: vSub, glyph: '語', skill: 'vocab', hash: toHash('on-tap', 'tu-vung') },
    ...PHAN,
  ];
  const wrap = document.createElement('div');
  wrap.className = 'kt-stack';
  const head = document.createElement('div');
  head.className = 'kt-sechead';
  const h2 = document.createElement('h2');
  h2.textContent = 'Học theo lộ trình N5';
  head.append(h2);

  const list = document.createElement('div');
  list.className = 'kt-list';
  for (const p of phan) {
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
