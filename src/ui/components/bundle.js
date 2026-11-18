/* Kotoba UI — icons, mascot Pyon, swipe deck. Classic script, no network. Usage: <i data-icon="bell"></i> or <span class="kt-mascot" data-mascot="happy" data-size="120"></span>, then Kotoba.hydrate(); Kotoba.swipeDeck(el, {onSwipe}). */
(function () {
  var P = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v3M3.5 18.5h3"/>',
    'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevrons-right': '<path d="m6 17 5-5-5-5M13 17l5-5-5-5"/>',
    play: '<path d="M7 4.5v15a.6.6 0 0 0 .9.5l12-7.5a.6.6 0 0 0 0-1L7.9 4a.6.6 0 0 0-.9.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M19 10.5v.5a7 7 0 0 1-14 0v-.5M12 18v3.5"/>',
    smile: '<circle cx="12" cy="12" r="9.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19 14.5 14.5 0 0 1 0-19z"/>',
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3.5" y="4.5" width="17" height="16.5" rx="3"/><path d="M16 2.5v4M8 2.5v4M3.5 10h17"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    quiz: '<rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h2a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1.5 14h5M9.5 8h5M17.5 16h5"/>',
    star: '<path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36 6.3 20.36l1.09-6.35-4.62-4.5 6.38-.93z"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .55-.47.98-.97 1.2C7.85 18.75 7 20.24 7 22M14 14.7V17c0 .55.47.98.97 1.2C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2.5"/><path d="m16 10.5 6-4v11l-6-4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    volume: '<path d="M11 5 6 9H2.5v6H6l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/>',
    chart: '<path d="M3.5 3.5v17h17"/><path d="m7.5 15 4-4 3 3 5-6"/>',
    more: '<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>',
    pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    note: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M15.5 13h-7M15.5 17h-7"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    flip: '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.3"/><path d="M3 3.3v5h5"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'
  };
  function svg(name) {
    var body = P[name];
    if (!body) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  function hydrate(root) {
    var els = (root || document).querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-icon-done')) continue;
      el.innerHTML = svg(el.getAttribute('data-icon'));
      el.setAttribute('data-icon-done', '1');
    }
  }
  var K = (window.Kotoba = window.Kotoba || {});
  K.icons = P;
  K.icon = svg;
  K.hydrate = hydrate;

  /* Swipe deck (Tinder-style flashcards).
     <div class="kt-deck" tabindex="0"> … .kt-flash cards … </div>; the LAST child is the top card.
     Drag right = 'right' (đã nhớ), left = 'left' (ôn lại); tap = flip (.is-revealed).
     Keys: → / ← swipe, Space / Enter flip. opts.onSwipe(dir, card) runs after the card leaves. */
  function swipeDeck(deck, opts) {
    opts = opts || {};
    var ratio = opts.threshold || 0.28, card = null, x0 = 0, y0 = 0, dx = 0, dy = 0, drag = false, moved = false, busy = false;
    function top() { var c = deck.querySelectorAll('.kt-flash'); return c[c.length - 1] || null; }
    function setP(c, x) {
      var p = Math.min(Math.abs(x) / (c.offsetWidth * ratio), 1);
      c.style.setProperty('--yes', x > 0 ? p : 0);
      c.style.setProperty('--no', x < 0 ? p : 0);
    }
    function reset(c) { c.style.transform = ''; c.style.opacity = ''; c.style.setProperty('--yes', 0); c.style.setProperty('--no', 0); }
    function flip(c) { c = c || top(); if (c) c.classList.toggle('is-revealed'); }
    function fling(dir) {
      var c = top(); if (!c || busy) return; busy = true;
      var s = dir === 'right' ? 1 : -1;
      c.classList.remove('is-dragging');
      setP(c, s * c.offsetWidth);
      c.style.transform = 'translate(' + s * c.offsetWidth * 1.4 + 'px,' + (dy * 0.2) + 'px) rotate(' + s * 18 + 'deg)';
      c.style.opacity = '0';
      setTimeout(function () {
        busy = false;
        if (opts.onSwipe) opts.onSwipe(dir, c); else c.remove();
      }, 280);
    }
    deck.addEventListener('pointerdown', function (e) {
      card = top();
      if (!card || busy || !card.contains(e.target) || e.target.closest('button')) return;
      drag = true; moved = false; x0 = e.clientX; y0 = e.clientY; dx = dy = 0;
      card.classList.add('is-dragging');
      try { card.setPointerCapture(e.pointerId); } catch (_) {}
    });
    deck.addEventListener('pointermove', function (e) {
      if (!drag) return;
      dx = e.clientX - x0; dy = e.clientY - y0;
      if (Math.abs(dx) > 6) moved = true;
      card.style.transform = 'translate(' + dx + 'px,' + dy * 0.2 + 'px) rotate(' + dx * 0.06 + 'deg)';
      setP(card, dx);
    });
    function end() {
      if (!drag) return; drag = false;
      card.classList.remove('is-dragging');
      if (Math.abs(dx) > card.offsetWidth * ratio) fling(dx > 0 ? 'right' : 'left');
      else { reset(card); if (!moved) flip(card); }
    }
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); dy = 0; fling('right'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); dy = 0; fling('left'); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
    });
    return { swipe: fling, flip: flip, reset: reset, top: top };
  }
  K.swipeDeck = swipeDeck;

  /* Pyon — the Kotoba mascot. Kotoba.mascot(mood, {flag, petals}) returns an SVG string (viewBox 200).
     Markup: <span class="kt-mascot" data-mascot="happy" data-size="120"></span>, filled by Kotoba.hydrate().
     Moods: default | happy | think | sleepy | oops | celebrate. data-flag="off" hides the flag;
     under 72px the flag and coat petals are dropped automatically. */
  var mascotSeq = 0;
  function mascot(mood, o) {
    o = o || {};
    mood = mood || 'default';
    var id = 'kp' + (++mascotSeq), u = function (n) { return 'url(#' + id + n + ')'; };
    var flag = o.flag !== false, petals = o.petals !== false;
    var E = [[84, 104], [116, 104]], MX = 100, MY = 119, s = 1.35;
    function ell(x, y, rx, ry) { return 'M' + (x - rx) + ' ' + y + ' a' + rx + ' ' + ry + ' 0 1 0 ' + (2 * rx) + ' 0 a' + rx + ' ' + ry + ' 0 1 0 ' + (-2 * rx) + ' 0 Z'; }
    function star(x, y, r) { var k = r * 0.22; return 'M' + x + ' ' + (y - r) + ' Q' + (x + k) + ' ' + (y - k) + ' ' + (x + r) + ' ' + y + ' Q' + (x + k) + ' ' + (y + k) + ' ' + x + ' ' + (y + r) + ' Q' + (x - k) + ' ' + (y + k) + ' ' + (x - r) + ' ' + y + ' Q' + (x - k) + ' ' + (y - k) + ' ' + x + ' ' + (y - r) + ' Z'; }
    function arcUp(x, y, w) { return 'M' + (x - w) + ' ' + (y + 2) + ' Q' + x + ' ' + (y - w - 1) + ' ' + (x + w) + ' ' + (y + 2); }
    function arcDown(x, y, w) { return 'M' + (x - w) + ' ' + y + ' Q' + x + ' ' + (y + 5) + ' ' + (x + w) + ' ' + y; }
    function eye(x, y) {
      var f = '', st = '', hl = '', hx = x, hy = y;
      if (mood === 'happy') st = arcUp(x, y, 6 * s);
      else if (mood === 'sleepy') st = arcDown(x, y, 6 * s);
      else if (mood === 'celebrate') f = star(x, y, 8 * s);
      else if (mood === 'think') { hx = x + 2; hy = y - 3; f = ell(hx, hy, 4.5 * s, 5.5 * s); }
      else if (mood === 'oops') { hy = y + 1; f = ell(x, hy, 4.5 * s, 5 * s); }
      else f = ell(x, y, 5 * s, 6.5 * s);
      if (f && mood !== 'celebrate') hl = ell(hx - 1.8 * s, hy - 2.6 * s, 2 * s, 2 * s) + ' ' + ell(hx + 2 * s, hy + 2.6 * s, 0.9 * s, 0.9 * s);
      var out = '';
      if (f) out += '<path d="' + f + '" fill="' + u('Eye') + '"/>';
      if (hl) out += '<path d="' + hl + '" fill="#FFFFFF"/>';
      if (st) out += '<path d="' + st + '" fill="none" stroke="#2A2350" stroke-width="3.5" stroke-linecap="round"/>';
      return out;
    }
    var mouth = '';
    if (mood === 'happy' || mood === 'celebrate') {
      var w = mood === 'celebrate' ? 11 : 9, h = mood === 'celebrate' ? 16 : 12;
      mouth = '<path d="M' + (MX - w) + ' ' + MY + ' Q' + MX + ' ' + (MY + h) + ' ' + (MX + w) + ' ' + MY + ' Z" fill="#2A2350"/>' +
        '<path d="' + ell(MX, MY + h * 0.42, w * 0.42, h * 0.16) + '" fill="#FF8FA6"/>';
    } else if (mood === 'think') mouth = '<path d="' + ell(MX + 3, MY + 1, 3.5, 3.5) + '" fill="#2A2350"/>';
    else if (mood === 'sleepy') mouth = '<path d="' + ell(MX, MY + 1, 2.5, 2.5) + '" fill="#2A2350"/>';
    else {
      var d = mood === 'oops' ? 'M' + (MX - 8) + ' ' + (MY + 2) + ' q4 -4 8 0 t8 0' : 'M' + (MX - 7) + ' ' + MY + ' q3.5 4.5 7 0 q3.5 4.5 7 0';
      mouth = '<path d="' + d + '" fill="none" stroke="#2A2350" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    var aL = 0, aR = 0;
    if (mood === 'happy') { aL = 60; aR = 8; }
    if (mood === 'celebrate') { aL = 75; aR = 14; }
    if (mood === 'think') aL = 35;
    if (mood === 'sleepy') { aL = -8; aR = 10; }
    if (mood === 'oops') aR = 4;
    function flower(x, y, r, c) {
      var pts = [[0, -1.15], [1.1, -0.35], [0.65, 0.92], [-0.65, 0.92], [-1.1, -0.35]], out = '<g transform="translate(' + x + ' ' + y + ')">';
      for (var i = 0; i < 5; i++) out += '<circle cx="' + (pts[i][0] * r * 1.05).toFixed(2) + '" cy="' + (pts[i][1] * r * 1.05).toFixed(2) + '" r="' + r + '" fill="#FFFFFF"/>';
      return out + '<circle cx="0" cy="0" r="' + (r * 0.52).toFixed(2) + '" fill="' + c + '"/></g>';
    }
    var g = function (id2, kind, attrs, stops) {
      var t = '<' + kind + 'Gradient id="' + id + id2 + '" ' + attrs + '>';
      for (var i = 0; i < stops.length; i++) t += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"' + (stops[i][2] != null ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
      return t + '</' + kind + 'Gradient>';
    };
    var defs = '<defs>' +
      g('Head', 'radial', 'cx="36%" cy="28%" r="78%"', [[0, '#FFFFFF'], [0.55, '#F8F5FF'], [0.85, '#E4DCFF'], [1, '#C6B9FA']]) +
      g('Ear', 'radial', 'cx="34%" cy="24%" r="88%"', [[0, '#FFFFFF'], [0.6, '#F1ECFF'], [1, '#CDC1FB']]) +
      g('EarIn', 'linear', 'x1="0" y1="0" x2="0" y2="1"', [[0, '#FFB8CC'], [0.55, '#FFD3DF'], [1, '#FFE6EC']]) +
      g('Coat', 'radial', 'cx="35%" cy="20%" r="85%"', [[0, '#FFE6EE'], [0.55, '#FFB6CB'], [1, '#F0789F']]) +
      g('Band', 'linear', 'x1="0" y1="0" x2="0" y2="1"', [[0, '#FFFFFF'], [1, '#D9CFFF']]) +
      g('Obi', 'linear', 'x1="0" y1="0" x2="0" y2="1"', [[0, '#B3A6FF'], [1, '#7C66F5']]) +
      g('Petal', 'radial', 'cx="50%" cy="85%" r="85%"', [[0, '#FF8FB1'], [1, '#FFD6E2']]) +
      g('Mochi', 'radial', 'cx="40%" cy="30%" r="75%"', [[0, '#FFFFFF'], [1, '#EAE3FF']]) +
      g('Cheek', 'radial', '', [[0, '#FF8FA6', 0.8], [1, '#FF8FA6', 0]]) +
      g('Eye', 'radial', 'cx="38%" cy="32%" r="72%"', [[0, '#6252B8'], [0.55, '#2A2350'], [1, '#171230']]) +
      g('Shadow', 'radial', '', [[0, '#6E62C8', 0.38], [1, '#6E62C8', 0]]) +
      '<filter id="' + id + 'Soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>';
    var hachiFlower = '<g transform="translate(100 76)">';
    for (var k = 0; k < 5; k++) hachiFlower += '<ellipse cx="0" cy="-4.2" rx="3" ry="4" transform="rotate(' + k * 72 + ')" fill="' + u('Petal') + '"/>';
    hachiFlower += '<circle cx="0" cy="0" r="1.7" fill="#FFD27A"/></g>';
    var flagSvg = flag ? '<path d="M128 176 L 147 114" fill="none" stroke="#D9B78F" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="147.4" cy="111.6" r="2.8" fill="#FFD27A"/>' +
      '<path d="M146.5 117 C 156 114 166 120 176 116 L 175.3 136 C 165.5 140 155.5 134 145.8 137 Z" fill="#FFFFFF" stroke="#DCD6EE" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M147.5 119 C 156 116.5 165 121.5 174 118" fill="none" stroke="#EEEAF8" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="161" cy="126.5" r="6" fill="#BC002D"/><ellipse cx="159.2" cy="124.4" rx="2" ry="1.3" fill="#FFFFFF" opacity="0.35"/>' : '';
    var body =
      '<ellipse cx="100" cy="190" rx="58" ry="10" fill="' + u('Shadow') + '"/>' +
      '<g transform="rotate(-16 86 66)"><ellipse cx="86" cy="36" rx="15" ry="31" fill="' + u('Ear') + '"/><ellipse cx="86" cy="40" rx="7.5" ry="21" fill="' + u('EarIn') + '"/><ellipse cx="81" cy="24" rx="3.5" ry="9" fill="#FFFFFF" opacity="0.85"/></g>' +
      '<g transform="rotate(20 114 66)"><ellipse cx="114" cy="38" rx="15" ry="29" fill="' + u('Ear') + '"/><ellipse cx="114" cy="42" rx="7.5" ry="19" fill="' + u('EarIn') + '"/></g>' +
      '<ellipse cx="83" cy="185" rx="15" ry="9" fill="' + u('Head') + '"/><ellipse cx="117" cy="185" rx="15" ry="9" fill="' + u('Head') + '"/>' +
      '<path d="M100 130 C 130 130 143 150 141 167 C 139 182 124 188 100 188 C 76 188 61 182 59 167 C 57 150 70 130 100 130 Z" fill="' + u('Coat') + '"/>' +
      '<ellipse cx="80" cy="150" rx="12" ry="8" transform="rotate(-30 80 150)" fill="#FFFFFF" opacity="0.45" filter="' + u('Soft') + '"/>' +
      '<path d="M85 136 Q 90 150 100 158" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95"/>' +
      '<path d="M115 136 Q 110 150 100 158" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95"/>' +
      (petals ? flower(100, 146, 2, '#F0789F') : '') +
      '<path d="M61 165 Q 100 177 139 165 Q 141 171 139.5 176 Q 100 188 60.5 176 Q 59 171 61 165 Z" fill="' + u('Obi') + '"/>' +
      '<g transform="rotate(' + aL + ' 76 146)"><ellipse cx="72" cy="157" rx="13" ry="15" fill="' + u('Coat') + '"/>' + (petals ? flower(68, 151, 2.3, '#F0789F') : '') + '<circle cx="76" cy="168" r="7" fill="' + u('Head') + '"/></g>' +
      '<g transform="rotate(' + aR + ' 124 146)">' + flagSvg + '<ellipse cx="128" cy="157" rx="13" ry="15" fill="' + u('Coat') + '"/>' + (petals ? flower(132, 150, 1.9, '#F0789F') : '') + '<circle cx="124" cy="168" r="7" fill="' + u('Head') + '"/></g>' +
      '<ellipse cx="100" cy="167" rx="16" ry="11" fill="' + u('Mochi') + '"/><ellipse cx="95" cy="163" rx="5" ry="2.5" fill="#FFFFFF" opacity="0.9"/><circle cx="104" cy="164" r="2.4" fill="#FF8FA6"/>' +
      '<ellipse cx="100" cy="137" rx="38" ry="7" fill="#C2537F" opacity="0.25" filter="' + u('Soft') + '"/>' +
      '<ellipse cx="100" cy="97" rx="49" ry="45" fill="' + u('Head') + '"/>' +
      '<ellipse cx="77" cy="77" rx="17" ry="10" transform="rotate(-30 77 77)" fill="#FFFFFF" opacity="0.9" filter="' + u('Soft') + '"/>' +
      '<path d="M55 85 Q 100 62 145 85 Q 147 91 145 96 Q 100 74 55 96 Q 53 91 55 85 Z" fill="' + u('Band') + '"/>' + hachiFlower +
      '<circle cx="147" cy="89" r="6" fill="' + u('Band') + '"/>' +
      '<ellipse cx="155" cy="99" rx="4.5" ry="10" transform="rotate(-38 155 99)" fill="' + u('Band') + '"/>' +
      '<ellipse cx="148" cy="103" rx="4" ry="9" transform="rotate(-8 148 103)" fill="' + u('Band') + '"/>' +
      '<ellipse cx="72" cy="117" rx="12" ry="8" fill="' + u('Cheek') + '"/><ellipse cx="128" cy="117" rx="12" ry="8" fill="' + u('Cheek') + '"/>' +
      eye(E[0][0], E[0][1]) + eye(E[1][0], E[1][1]) +
      '<ellipse cx="100" cy="113" rx="3.6" ry="2.6" fill="#FF8FA6"/>' + mouth;
    var extra = '';
    if (mood === 'sleepy') extra = '<text x="150" y="64" font-size="18" font-weight="800" fill="#917EFF" font-family="Plus Jakarta Sans, system-ui, sans-serif">z</text><text x="164" y="44" font-size="26" font-weight="800" fill="#917EFF" font-family="Plus Jakarta Sans, system-ui, sans-serif">Z</text>';
    if (mood === 'oops') extra = '<path d="M160 82 C 153 93 153 100 160 102 C 167 100 167 93 160 82 Z" fill="#6B9CFF"/>';
    if (mood === 'think') extra = '<circle cx="150" cy="72" r="3" fill="#917EFF"/><circle cx="160" cy="60" r="4.5" fill="#917EFF"/><circle cx="173" cy="44" r="7" fill="#917EFF"/>';
    if (mood === 'celebrate') extra = '<path d="' + star(34, 58, 10) + '" fill="#FF9F68"/><path d="' + star(168, 50, 12) + '" fill="#6B9CFF"/><path d="' + star(184, 84, 8) + '" fill="#917EFF"/><path d="' + star(28, 118, 7) + '" fill="#FF8FB1"/>';
    return '<svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" style="overflow:visible">' + defs + body + extra + '</svg>';
  }
  function hydrateMascots(root) {
    var els = (root || document).querySelectorAll('[data-mascot]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-mascot-done')) continue;
      var size = parseInt(el.getAttribute('data-size') || '120', 10);
      var small = size < 72;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.innerHTML = mascot(el.getAttribute('data-mascot'), {
        flag: el.getAttribute('data-flag') !== 'off' && !small,
        petals: !small
      });
      el.setAttribute('data-mascot-done', '1');
    }
  }
  K.mascot = mascot;
  var baseHydrate = hydrate;
  hydrate = function (root) { baseHydrate(root); hydrateMascots(root); };
  K.hydrate = hydrate;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { hydrate(); });
  else hydrate();
})();
