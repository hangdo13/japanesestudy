/** Trang Giới thiệu: ghi công các nguồn nội dung (NFR5). */
const NGUON = [
  {
    ten: 'JLPTSuccess',
    giayPhep: 'Giấy phép MIT',
    url: 'https://github.com/gauravhq/JLPTSuccess',
    moTa: 'Dữ liệu kanji, bài nghe và câu hỏi thi thử N5 do nhóm JLPTSuccess tự soạn.',
  },
  {
    ten: 'KanjiVG',
    giayPhep: 'CC BY-SA 3.0, © Ulrich Apel',
    url: 'https://kanjivg.tagaini.net/',
    moTa: 'Hình thứ tự nét viết của kanji.',
    giayPhepUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    ten: 'VOICEVOX',
    giayPhep: 'Theo điều khoản của từng giọng nhân vật',
    url: 'https://voicevox.hiroshiba.jp/',
    moTa:
      'Giọng đọc tổng hợp cho audio bài nghe và cách đọc kanji: VOICEVOX:春日部つむぎ, VOICEVOX:玄野武宏, VOICEVOX:四国めたん, VOICEVOX:ずんだもん, VOICEVOX:雨晴はう, VOICEVOX:青山龍星.',
    giayPhepUrl: 'https://voicevox.hiroshiba.jp/term/',
  },
];

export function mount(el) {
  const wrap = document.createElement('div');
  wrap.className = 'kt-stack';

  const head = document.createElement('div');
  head.className = 'kt-sechead';
  const h2 = document.createElement('h2');
  h2.textContent = 'Nguồn nội dung';
  head.append(h2);
  wrap.append(head);

  const intro = document.createElement('p');
  intro.className = 'kt-muted';
  intro.textContent =
    'Kotoba là app tự học JLPT N5 của Hannah. Nội dung dưới đây được dùng lại theo đúng giấy phép của từng nguồn.';
  wrap.append(intro);

  for (const n of NGUON) {
    const card = document.createElement('article');
    card.className = 'kt-card kt-stack';

    const title = document.createElement('h3');
    title.className = 'title-sm';
    title.style.margin = '0';
    title.textContent = n.ten;

    const licenseRow = document.createElement('div');
    licenseRow.className = 'kt-row';
    const license = document.createElement('span');
    license.className = 'kt-chip kt-chip--outline';
    license.textContent = n.giayPhep;
    licenseRow.append(license);

    const desc = document.createElement('p');
    desc.className = 'kt-muted';
    desc.style.margin = '0';
    desc.textContent = n.moTa;

    const link = document.createElement('a');
    link.className = 'kt-link';
    link.href = n.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = n.url.replace(/^https:\/\//, '');

    card.append(title, licenseRow, desc, link);
    if (n.giayPhepUrl) {
      const lic = document.createElement('a');
      lic.className = 'kt-link';
      lic.href = n.giayPhepUrl;
      lic.target = '_blank';
      lic.rel = 'noopener';
      lic.textContent = 'Xem điều khoản giấy phép';
      card.append(lic);
    }
    wrap.append(card);
  }

  el.append(wrap);
}
