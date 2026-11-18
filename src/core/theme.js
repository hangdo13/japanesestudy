/**
 * Đặt data-theme trên <html> theo cài đặt sáng/tối của hệ thống.
 * tokens.css chỉ đổi màu theo [data-theme], không tự theo hệ thống.
 */
export function startTheme(doc = document, win = window) {
  const root = doc.documentElement;
  const mq = win.matchMedia ? win.matchMedia('(prefers-color-scheme: dark)') : null;
  const apply = () => {
    root.dataset.theme = mq && mq.matches ? 'dark' : 'light';
  };
  apply();
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }
  return apply;
}
