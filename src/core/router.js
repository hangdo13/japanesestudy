import { renderEmptyState } from '../ui/empty-state.js';

/**
 * Bảng route duy nhất của app (AD-2). Hash có dạng #/<tên>/<tham số>.
 * `tab` là tab của BottomNav được đánh dấu khi đang ở route đó.
 * core không import features: main.js truyền module tính năng vào createRouter.
 */
export const ROUTES = {
  '': { title: 'Kotoba', tab: '' },
  kanji: { title: 'Kanji', tab: 'kanji' },
  kana: { title: 'Kana', tab: 'luyen-tap' },
  'on-tap': { title: 'Ôn tập', tab: 'luyen-tap' },
  'tu-vung': { title: 'Từ vựng', tab: 'luyen-tap' },
  'hoc-ngay': { title: 'Học ngay', tab: 'hoc-ngay' },
  'luyen-tap': { title: 'Luyện tập', tab: 'luyen-tap' },
  'cai-dat': { title: 'Cài đặt', tab: 'cai-dat' },
  'gioi-thieu': { title: 'Giới thiệu', tab: 'cai-dat' },
};

/** Tách hash thành { name, param }. Ví dụ '#/kanji/%E6%97%A5' → { name: 'kanji', param: '日' }. */
export function parseHash(hash) {
  const path = String(hash || '').replace(/^#\/?/, '');
  const [name = '', ...rest] = path.split('/');
  const raw = rest.join('/');
  let param = null;
  if (raw) {
    try {
      param = decodeURIComponent(raw);
    } catch {
      param = raw;
    }
  }
  let decodedName = name;
  try {
    decodedName = decodeURIComponent(name);
  } catch {
    /* giữ nguyên */
  }
  return { name: decodedName, param };
}

/** Tạo hash cho một route. */
export function toHash(name, param) {
  const base = `#/${name}`;
  return param == null || param === '' ? base : `${base}/${encodeURIComponent(param)}`;
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.outlet  nơi gắn nội dung tính năng
 * @param {Record<string, {mount: Function}>} opts.features  module tính năng theo tên route;
 *   `mount(el, { param })` có thể trả về hàm dọn dẹp, được gọi trước khi sang màn khác
 * @param {(route: {name: string, title: string, tab: string|null}) => void} [opts.onRoute]
 * @param {Window} [opts.win]
 */
export function createRouter({ outlet, features, onRoute, win = window }) {
  let cleanup = null;

  function render() {
    const { name, param } = parseHash(win.location.hash);
    const route = Object.prototype.hasOwnProperty.call(ROUTES, name) ? ROUTES[name] : null;
    const feature = route ? features[name] : null;

    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch {
        /* bỏ qua lỗi dọn dẹp của màn trước */
      }
    }
    cleanup = null;
    outlet.replaceChildren();

    if (route && feature && typeof feature.mount === 'function') {
      cleanup = feature.mount(outlet, { param }) || null;
      onRoute && onRoute({ name, title: route.title, tab: route.tab });
    } else {
      outlet.append(
        renderEmptyState({
          title: 'Không tìm thấy trang này',
          text: 'Đường dẫn này không có trong Kotoba. Mình về trang chủ nhé.',
          actionLabel: 'Về trang chủ',
          onAction: () => {
            win.location.hash = toHash('');
          },
        }),
      );
      onRoute && onRoute({ name, title: 'Kotoba', tab: null });
    }

    if (win.Kotoba && typeof win.Kotoba.hydrate === 'function') {
      win.Kotoba.hydrate(outlet);
    }
    // màn mới luôn bắt đầu từ đầu trang
    if (typeof win.scrollTo === 'function') {
      try {
        win.scrollTo(0, 0);
      } catch {
        /* jsdom không hỗ trợ scrollTo */
      }
    }
  }

  win.addEventListener('hashchange', render);
  render();

  return {
    render,
    navigate(name, param) {
      win.location.hash = toHash(name, param);
    },
    stop() {
      win.removeEventListener('hashchange', render);
    },
  };
}
