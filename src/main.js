import './ui/tokens.css';
import './ui/components/bundle.css';
import './ui/app.css';
import './ui/components/bundle.js';

import { startTheme } from './core/theme.js';
import { createRouter, toHash } from './core/router.js';
import { requestPersistentStorage } from './core/progress.js';
import { studyClock } from './core/study-clock.js';

import * as home from './features/home/index.js';
import * as kanji from './features/kanji/index.js';
import * as kanaFeature from './features/kana/index.js';
import * as hocNgay from './features/hoc-ngay/index.js';
import * as onTap from './features/on-tap/index.js';
import * as luyenTap from './features/luyen-tap/index.js';
import * as caiDat from './features/cai-dat/index.js';
import * as gioiThieu from './features/gioi-thieu/index.js';

const TABS = [
  { route: '', icon: 'home', label: 'Trang chủ' },
  { route: 'kanji', icon: 'book', label: 'Kanji' },
  { route: 'hoc-ngay', icon: 'note', label: 'Học ngay', fab: true },
  { route: 'luyen-tap', icon: 'quiz', label: 'Luyện tập' },
  { route: 'cai-dat', icon: 'sliders', label: 'Cài đặt' },
];

/** Dựng khung TopBar + nội dung + BottomNav theo markup của Kotoba UI. */
export function buildShell(root) {
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const topbar = document.createElement('header');
  topbar.className = 'kt-topbar';
  const title = document.createElement('span');
  title.className = 'kt-topbar__title';
  title.textContent = 'Kotoba';
  topbar.append(title);

  const main = document.createElement('main');
  main.className = 'app-main';

  const navWrap = document.createElement('div');
  navWrap.className = 'app-nav';
  const nav = document.createElement('nav');
  nav.className = 'kt-bottomnav';
  nav.setAttribute('aria-label', 'Điều hướng chính');

  const buttons = new Map();
  for (const t of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.route = t.route;
    const icon = document.createElement('i');
    icon.dataset.icon = t.icon;
    if (t.fab) {
      btn.className = 'kt-fab';
      btn.setAttribute('aria-label', t.label);
      btn.append(icon);
    } else {
      btn.className = 'kt-tab';
      btn.append(icon, document.createTextNode(t.label));
    }
    btn.addEventListener('click', () => {
      window.location.hash = toHash(t.route);
    });
    buttons.set(t.route, btn);
    nav.append(btn);
  }
  navWrap.append(nav);

  shell.append(topbar, main, navWrap);
  root.replaceChildren(shell);

  function setActive({ title: text, tab }) {
    title.textContent = text;
    for (const [route, btn] of buttons) {
      const active = route === tab;
      if (btn.classList.contains('kt-tab')) btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }
  }

  return { main, setActive, shell };
}

export function start(root = document.getElementById('app')) {
  startTheme();
  requestPersistentStorage();
  // tạo đồng hồ học sớm để nghe visibilitychange (ẩn app thì dừng đếm và ghi)
  studyClock();
  const { main, setActive, shell } = buildShell(root);
  const router = createRouter({
    outlet: main,
    features: {
      '': home,
      kanji,
      kana: kanaFeature,
      'hoc-ngay': hocNgay,
      'on-tap': onTap,
      'luyen-tap': luyenTap,
      'cai-dat': caiDat,
      'gioi-thieu': gioiThieu,
    },
    onRoute: setActive,
  });
  if (window.Kotoba && typeof window.Kotoba.hydrate === 'function') {
    window.Kotoba.hydrate(shell);
  }
  return router;
}

if (document.getElementById('app')) start();
