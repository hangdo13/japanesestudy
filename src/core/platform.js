/** Nhận biết iPhone/iPad và việc app đang chạy từ màn hình chính. */
export function detectPlatform(win = window) {
  const nav = win.navigator || {};
  const ua = String(nav.userAgent || '');
  // iPadOS 13+ tự nhận là Mac, phân biệt bằng màn hình cảm ứng
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints || 0) > 1);
  let standaloneMq = false;
  try {
    standaloneMq = !!(win.matchMedia && win.matchMedia('(display-mode: standalone)').matches);
  } catch {
    standaloneMq = false;
  }
  // Chrome/Firefox/Edge trên iOS và trình duyệt trong app (Facebook, Zalo, Instagram…)
  const isIosSafari = isIos && !/CriOS|FxiOS|EdgiOS|OPiOS|FBAN|FBAV|Instagram|Zalo|Line\//.test(ua);
  return { isIos, isIosSafari, isStandalone: nav.standalone === true || standaloneMq };
}
