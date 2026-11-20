import { kana, kanaById, kanaPairs } from '../../core/content.js';
import { progress as defaultProgress } from '../../core/progress.js';
import { reviewCard, dueIds, isValidCard } from '../../core/srs.js';
import { studyClock } from '../../core/study-clock.js';
import { buildSession } from '../../core/kana-quiz.js';
import { toHash } from '../../core/router.js';
import { renderQuestion } from '../../ui/quiz.js';
import { speakJa, canSpeakJapanese } from '../../ui/speech.js';

export const LUYEN = 'luyen';
const SO_CAU = 10;

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}
function jp(tag, className, text) {
  const n = el(tag, `${className || ''} kt-jp`.trim(), text);
  n.lang = 'ja';
  return n;
}
function hydrate(node) {
  if (globalThis.Kotoba && typeof globalThis.Kotoba.hydrate === 'function') globalThis.Kotoba.hydrate(node);
}

/** Đáp án sai luôn cùng bảng chữ với chữ đang hỏi (không lộ đáp án khi bộ trộn hai bảng). */
const sameScript = (items) => (target) => items.filter((k) => k.script === target.script);

/** Các bộ luyện. `due` là danh sách chữ đến hạn ôn (sớm nhất trước). */
export function practiceSets(due = []) {
  const all = kana();
  const by = (script, nhoms) => all.filter((k) => k.script === script && nhoms.includes(k.nhom));
  const pairIds = new Set(all.flatMap((k) => (kanaPairs(k.id).length ? [k.id] : [])));
  const dn = all.filter((k) => pairIds.has(k.id));
  const sets = [
    { id: 'h-co-ban', title: 'Hiragana cơ bản', items: by('hiragana', ['co-ban']) },
    { id: 'h-duc', title: 'Hiragana đục & bán đục', items: by('hiragana', ['duc', 'ban-duc']) },
    { id: 'h-ghep', title: 'Hiragana âm ghép', items: by('hiragana', ['ghep']) },
    { id: 'k-co-ban', title: 'Katakana cơ bản', items: by('katakana', ['co-ban']) },
    { id: 'k-duc', title: 'Katakana đục & bán đục', items: by('katakana', ['duc', 'ban-duc']) },
    { id: 'k-ghep', title: 'Katakana âm ghép & mở rộng', items: by('katakana', ['ghep', 'mo-rong']) },
    { id: 'de-nham', title: 'Cặp dễ nhầm', items: dn, pool: sameScript(dn) },
  ];
  if (due.length) sets.unshift({ id: 'on-lai', title: 'Ôn chữ hay sai', items: due, due: true, pool: sameScript(all) });
  return sets;
}

function renderPicker(sets, onPick) {
  const wrap = el('div', 'kt-stack');
  const back = el('a', 'kt-link', '‹ Bảng chữ cái');
  back.href = toHash('kana');
  const head = el('div', 'kt-sechead');
  head.append(el('h2', null, 'Luyện nhận diện kana'));
  const list = el('div', 'kt-list');
  for (const s of sets) {
    const b = el('button', 'kt-item kana-set');
    b.type = 'button';
    const skill = jp('span', 'kt-skill kt-skill--kanji', s.items[0] ? s.items[0].id[0] : 'あ');
    skill.setAttribute('aria-hidden', 'true');
    const body = el('div', 'kt-item__body');
    const sub = s.due ? `${s.items.length} chữ đến hạn ôn` : `${s.items.length} chữ · ${SO_CAU} câu`;
    body.append(el('p', 'kt-item__title', s.title), el('p', 'kt-item__sub', sub));
    b.append(skill, body);
    b.addEventListener('click', () => onPick(s));
    list.append(b);
  }
  wrap.append(back, head, list);
  return wrap;
}

/**
 * Màn luyện kana. deps: progress, now, rng, canSpeak, speak, scheduleReview (mặc định reviewCard).
 * @returns {{ node: HTMLElement, start: (set: object) => void, idle: () => Promise<void>, cleanup: () => void }}
 */
export function renderPractice(deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = deps.now || (() => new Date());
  const canSpeak = deps.canSpeak || canSpeakJapanese;
  const speak = deps.speak || speakJa;
  const review = deps.scheduleReview || reviewCard;
  const activity = deps.activity || (() => studyClock().activity());
  const root = el('div', 'kt-stack');
  const view = el('div', 'kt-stack');
  // dòng báo lỗi nằm ngoài phiên, để vẫn thấy khi đã quay về danh sách bộ
  const status = el('p', 'kt-muted kana-text');
  status.setAttribute('role', 'status');
  root.append(view, status);
  let alive = true;
  // ghi lịch ôn tuần tự: mỗi lần ôn đọc thẻ mới nhất, không ghi đè lẫn nhau
  let saving = Promise.resolve();

  const dueKana = () =>
    dueIds(store.get().srs, 'kana:', now())
      .map((id) => kanaById(id.slice('kana:'.length)))
      .filter(Boolean);

  const showPicker = async () => {
    await saving;
    if (!alive) return;
    view.replaceChildren(renderPicker(practiceSets(dueKana()), start));
    const h = view.querySelector('h2');
    h.tabIndex = -1;
    h.focus();
  };

  const record = (k, correct) => {
    const key = `kana:${k.id}`;
    saving = saving.then(async () => {
      const existing = store.get().srs[key];
      const t = now();
      // sai: luôn vào lịch ôn. Đúng: chỉ chấm khi chữ đã có trong lịch và đến hạn.
      if (correct && !(existing && (!isValidCard(existing) || Date.parse(existing.dueAt) <= t.getTime()))) return;
      try {
        const card = await review(existing, correct, t);
        const res = store.update((d) => {
          d.srs[key] = card;
        });
        if (!res.ok) status.textContent = res.error;
      } catch {
        status.textContent = `Không lưu được lịch ôn cho chữ ${k.id}.`;
      }
    });
  };

  function start(set) {
    status.textContent = '';
    const can = !!canSpeak();
    const session = buildSession(set.items, {
      count: set.due ? Math.min(SO_CAU, set.items.length) : SO_CAU,
      ordered: !!set.due,
      canSpeak: can,
      pairsOf: kanaPairs,
      pool: set.pool || set.items,
      rng: deps.rng,
    });
    const wrong = [];
    let i = 0;
    let score = 0;

    const head = el('div', 'kt-session__head');
    const close = el('button', 'kt-iconbtn kt-iconbtn--sm');
    close.type = 'button';
    close.setAttribute('aria-label', 'Đóng');
    const x = document.createElement('i');
    x.dataset.icon = 'x';
    close.append(x);
    close.addEventListener('click', showPicker);
    const seg = el('div', 'kt-seg kt-seg--kanji kt-seg--thick');
    seg.setAttribute('role', 'progressbar');
    seg.setAttribute('aria-label', 'Tiến độ phiên');
    seg.setAttribute('aria-valuemin', '0');
    seg.setAttribute('aria-valuemax', String(session.length));
    const count = el('span', 'kt-count');
    head.append(close, seg, count);
    const body = el('div', 'kt-stack');
    const sessionEl = el('section', 'kt-session');
    sessionEl.setAttribute('aria-label', set.title);
    sessionEl.append(head, body);
    view.replaceChildren(sessionEl);
    hydrate(head);

    const progressBar = () => {
      seg.replaceChildren(...session.map((_, j) => Object.assign(el('i'), { className: j < i ? 'on' : '' })));
      seg.setAttribute('aria-valuenow', String(i));
      count.textContent = `${Math.min(i + 1, session.length)} / ${session.length}`;
    };

    const ask = () => {
      progressBar();
      if (i >= session.length) return finish();
      const q = session[i];
      let kind = q.kind;
      let prompt;
      if (kind === 'nghe-chu') {
        if (speak(q.target.id) === false) kind = 'romaji-chu'; // mất giọng giữa chừng: hỏi bằng romaji
        else {
          prompt = el('span', 'kt-row');
          const play = el('button', 'kt-btn kt-btn--soft kt-btn--sm', 'Nghe lại');
          play.type = 'button';
          play.addEventListener('click', () => {
            activity();
            speak(q.target.id);
          });
          prompt.append(el('span', null, 'Nghe và chọn chữ đúng'), play);
        }
      }
      if (kind === 'chu-romaji') {
        prompt = el('span');
        prompt.append(jp('span', 'kt-flash__glyph', q.target.id), el('span', 'kt-muted', ' đọc là gì?'));
      } else if (kind === 'romaji-chu') {
        prompt = el('span', null, `Chữ nào đọc là "${q.target.romaji}"?`);
      }
      const options = q.options.map((k) => (kind === 'chu-romaji' ? k.romaji : jp('span', 'kana-option', k.id)));
      body.replaceChildren(
        renderQuestion({
          prompt,
          options,
          answer: q.answer,
          explain: () => {
            const s = el('span');
            s.append(jp('span', null, q.target.id), document.createTextNode(` = ${q.target.romaji}`));
            return s;
          },
          onAnswer: (correct) => {
            activity();
            if (correct) score += 1;
            else wrong.push(q.target);
            record(q.target, correct);
          },
          onNext: () => {
            activity();
            i += 1;
            ask();
          },
        }),
      );
      hydrate(body);
      const first = body.querySelector('.kt-option');
      if (first) first.focus();
    };

    const finish = () => {
      head.hidden = true;
      const result = el('section', 'kt-card kt-stack');
      const h = el('h2', null, `Kết quả: ${score} / ${session.length}`);
      h.tabIndex = -1;
      const hw = el('div', 'kt-sechead');
      hw.append(h);
      result.append(hw);
      if (wrong.length) {
        result.append(el('p', 'kana-text', 'Các chữ cần ôn thêm (đã vào lịch ôn):'));
        const row = el('div', 'kt-row');
        for (const k of new Map(wrong.map((w) => [w.id, w])).values()) {
          const a = el('a', 'kana-cell');
          a.href = toHash('kana', k.id);
          a.append(jp('span', 'kana-cell__glyph', k.id), el('span', 'kana-cell__romaji', k.romaji));
          row.append(a);
        }
        result.append(row);
      } else {
        result.append(el('p', 'kana-text', 'Không sai câu nào. Tuyệt vời!'));
      }
      const again = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Luyện lại');
      again.type = 'button';
      again.addEventListener('click', async () => {
        await saving;
        if (!alive) return;
        // bộ ôn: lấy lại danh sách đến hạn mới nhất
        if (set.due) {
          const due = dueKana();
          return due.length ? start({ ...set, items: due }) : showPicker();
        }
        start(set);
      });
      const other = el('button', 'kt-btn kt-btn--soft kt-btn--block', 'Luyện bộ khác');
      other.type = 'button';
      other.addEventListener('click', showPicker);
      result.append(again, other);
      body.replaceChildren(result);
      h.focus();
    };

    ask();
  }

  // giọng đọc có thể nạp muộn (iOS): start() kiểm tra lại canSpeak mỗi phiên
  view.replaceChildren(renderPicker(practiceSets(dueKana()), start));
  return {
    node: root,
    start,
    idle: () => saving,
    cleanup: () => {
      alive = false;
      if (globalThis.speechSynthesis && typeof globalThis.speechSynthesis.cancel === 'function') globalThis.speechSynthesis.cancel();
    },
  };
}
