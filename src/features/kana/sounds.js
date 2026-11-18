import { kanaSounds, kanaRules } from '../../core/content.js';
import { buildMoraSession, buildPairSession } from '../../core/sound-quiz.js';
import { toHash } from '../../core/router.js';
import { renderQuizSession } from '../../ui/quiz-session.js';
import { speakJa, canSpeakJapanese, onVoicesChanged } from '../../ui/speech.js';

export const PHAT_AM = 'phat-am';
const NO_VOICE =
  'Bài nghe cần giọng đọc tiếng Nhật. Trên iPhone: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói, tải giọng tiếng Nhật. Trên Android: Cài đặt → Chuyển văn bản thành giọng nói, tải dữ liệu tiếng Nhật. Trên máy tính: thêm giọng tiếng Nhật trong cài đặt ngôn ngữ của hệ điều hành.';
const stopSpeech = () => {
  if (globalThis.speechSynthesis && typeof globalThis.speechSynthesis.cancel === 'function') globalThis.speechSynthesis.cancel();
};

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
const dots = (phach) => phach.join('・');

/**
 * Màn phát âm: giải thích + bài đếm phách + bài nghe cặp âm.
 * deps: canSpeak, speak, onVoicesChanged, rng
 */
export function renderSounds(deps = {}) {
  const data = kanaSounds();
  const speak = deps.speak || speakJa;
  const can = deps.canSpeak || canSpeakJapanese;
  const root = el('div', 'kt-stack');
  const voiceBound = []; // [element, kind] cần đồng bộ khi giọng thay đổi
  let moraBtn = null;

  const syncVoice = () => {
    const ok = !!can();
    for (const [n, kind] of voiceBound) {
      if (kind === 'hide') n.hidden = !ok;
      else if (kind === 'disable') {
        // nút đang được focus mà bị khoá: chuyển focus sang nút Đếm phách, không để rơi về đầu trang
        if (!ok && document.activeElement === n && moraBtn) moraBtn.focus();
        n.disabled = !ok;
      }
      else if (kind === 'note') n.hidden = ok;
    }
  };

  const speakBtn = (text, label) => {
    const b = el('button', 'kt-iconbtn kt-iconbtn--sm');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    const i = document.createElement('i');
    i.dataset.icon = 'volume';
    b.append(i);
    b.addEventListener('click', () => speak(text));
    voiceBound.push([b, 'hide']);
    return b;
  };

  function showHome({ focus } = {}) {
    voiceBound.length = 0;
    const wrap = el('div', 'kt-stack');
    const back = el('a', 'kt-link', '‹ Bảng chữ cái');
    back.href = toHash('kana');
    const head = el('div', 'kt-sechead');
    head.append(el('h2', null, 'Phát âm'));
    moraBtn = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Đếm phách');
    moraBtn.type = 'button';
    moraBtn.addEventListener('click', startMora);
    const pairBtn = el('button', 'kt-btn kt-btn--soft kt-btn--block', 'Nghe cặp âm');
    pairBtn.type = 'button';
    pairBtn.addEventListener('click', startPairs);
    const note = el('p', 'kt-muted kana-text', NO_VOICE);
    voiceBound.push([pairBtn, 'disable'], [note, 'note']);
    wrap.append(back, head, moraBtn, pairBtn, note);
    if (data.reviewStatus !== 'approved') wrap.append(el('p', 'kt-muted kana-text', 'Phần giải thích do AI soạn, chưa duyệt.'));

    let n = 0;
    for (const m of data.muc) {
      const card = el('section', 'kt-card kt-stack kana-rule');
      card.id = `phat-am-${m.id}`;
      card.append(el('h3', 'title kana-text', m.tieuDe), el('p', 'kana-text', m.giaiThich));
      const list = el('ul', 'kana-examples');
      for (const v of m.viDu) {
        n += 1;
        const li = el('li', 'kana-example');
        const words = el('div', 'kana-example__words');
        words.append(
          jp('span', 'kana-example__doc', dots(v.phach)),
          el('span', 'kana-example__romaji', `${v.phach.length} phách`),
          el('span', 'kt-muted kana-example__nghia', `${v.romaji} · ${v.nghia}`),
        );
        li.append(words, speakBtn(v.doc, `Nghe ví dụ ${n}: ${v.romaji}`));
        list.append(li);
      }
      card.append(list);
      wrap.append(card);
    }
    root.replaceChildren(wrap);
    syncVoice();
    hydrate(root);
    if (focus === 'mora') moraBtn.focus();
    else if (focus === 'pair') (pairBtn.disabled ? moraBtn : pairBtn).focus();
  }

  const result = (again, focusKey) => ({ score, total, wrong }, lines) => {
    const card = el('section', 'kt-card kt-stack');
    const hw = el('div', 'kt-sechead');
    hw.append(el('h2', null, `Kết quả: ${score} / ${total}`));
    card.append(hw);
    if (wrong.length) {
      card.append(el('p', 'kana-text', 'Xem lại:'));
      const list = el('ul', 'kana-examples');
      for (const q of wrong) list.append(lines(q));
      card.append(list);
    } else card.append(el('p', 'kana-text', 'Đúng hết. Tuyệt vời!'));
    const a = el('button', 'kt-btn kt-btn--primary kt-btn--block', 'Luyện lại');
    a.type = 'button';
    a.addEventListener('click', again);
    const b = el('button', 'kt-btn kt-btn--soft kt-btn--block', 'Về trang phát âm');
    b.type = 'button';
    b.addEventListener('click', () => showHome({ focus: focusKey }));
    stopSpeech();
    card.append(a, b);
    return card;
  };

  /** Dòng chữ trộn tiếng Việt và tiếng Nhật: phần tử mảng dạng { ja } được gắn lang="ja". */
  const mixed = (className, parts) => {
    const s = el('span', className);
    for (const p of parts) s.append(typeof p === 'string' ? document.createTextNode(p) : jp('span', null, p.ja));
    return s;
  };
  const exampleLine = (doc, phach, extra) => {
    const li = el('li', 'kana-example');
    const words = el('div', 'kana-example__words');
    words.append(jp('span', 'kana-example__doc', dots(phach)), el('span', 'kana-example__romaji', `${phach.length} phách`));
    if (extra) words.append(Array.isArray(extra) ? mixed('kt-muted kana-example__nghia', extra) : el('span', 'kt-muted kana-example__nghia', extra));
    li.append(words);
    return li;
  };

  function startMora() {
    voiceBound.length = 0;
    const words = [...kanaRules().tuLuyen, ...data.capAm.flatMap((c) => [c.a, c.b])];
    const questions = buildMoraSession(words, { rng: deps.rng });
    const render = result(startMora, 'mora');
    root.replaceChildren(
      renderQuizSession({
        title: 'Đếm phách',
        questions,
        toQuestion: (q) => {
          const prompt = el('span', 'kt-stack kana-read');
          prompt.append(jp('span', 'kana-read__doc', q.doc), el('span', 'kt-muted kana-read__nghia', `${q.nghia} · có mấy phách?`));
          return {
            prompt,
            options: q.options.map(String),
            answer: q.answer,
            explain: () => {
              const s = el('span');
              s.append(jp('span', null, dots(q.phach)), document.createTextNode(` = ${q.phach.length} phách`));
              return s;
            },
          };
        },
        onClose: () => showHome({ focus: 'mora' }),
        renderResult: (r) => render(r, (q) => exampleLine(q.doc, q.phach, q.nghia)),
      }),
    );
    hydrate(root);
  }

  function startPairs() {
    if (!can()) return showHome({ focus: 'pair' });
    voiceBound.length = 0;
    const questions = buildPairSession(data.capAm, { rng: deps.rng });
    const render = result(startPairs, 'pair');
    root.replaceChildren(
      renderQuizSession({
        title: 'Nghe cặp âm',
        questions,
        toQuestion: (q) => {
          const prompt = el('span', 'kt-stack');
          const row = el('span', 'kt-row');
          const status = el('span', 'kt-muted kana-read__nghia');
          status.setAttribute('role', 'status');
          const fail = () => {
            status.textContent = 'Không phát được âm thanh. Thử bấm Nghe lại.';
          };
          const play = () => {
            status.textContent = '';
            if (speak(q.target.doc, { onError: fail }) === false) fail();
          };
          const again = el('button', 'kt-btn kt-btn--soft kt-btn--sm', 'Nghe lại');
          again.type = 'button';
          again.addEventListener('click', play);
          row.append(el('span', null, 'Nghe và chọn từ bạn nghe được'), again);
          prompt.append(row, status);
          // đọc sau khi câu đã gắn vào trang: vùng status mới thông báo được, và focus ở Nghe lại
          // để trình đọc màn hình không đọc đáp án A đè lên tiếng của bài nghe
          queueMicrotask(() => {
            if (!again.isConnected) return;
            again.focus();
            play();
          });
          const option = (w) => {
            const s = el('span', 'kana-pair');
            s.append(jp('span', 'kana-option', w.doc), el('span', 'kt-muted kana-pair__nghia', w.nghia));
            return s;
          };
          return {
            prompt,
            options: q.options.map(option),
            answer: q.answer,
            explain: () =>
              mixed(null, [
                'Máy đọc: ',
                { ja: q.target.doc },
                ` (${q.target.phach.length} phách, ${q.target.nghia}). Từ kia: `,
                { ja: q.other.doc },
                ` (${q.other.phach.length} phách).`,
              ]),
          };
        },
        onClose: () => {
          stopSpeech();
          showHome({ focus: 'pair' });
        },
        renderResult: (r) =>
          render(r, (q) => exampleLine(q.target.doc, q.target.phach, [`${q.target.nghia} — khác `, { ja: q.other.doc }, ` (${q.other.nghia})`])),
      }),
    );
    hydrate(root);
  }

  showHome();
  const offVoices = (deps.onVoicesChanged || onVoicesChanged)(syncVoice);
  return {
    node: root,
    cleanup: () => {
      if (typeof offVoices === 'function') offVoices();
      stopSpeech();
    },
  };
}
