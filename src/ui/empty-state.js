/**
 * Khối trống có Pyon ngủ gật, theo markup của component EmptyState
 * (kotoba-design/design/kotoba-ui/components/EmptyState/preview.html).
 * Gọi Kotoba.hydrate() sau khi gắn vào trang để vẽ Pyon.
 */
export function renderEmptyState({ title, text, actionLabel, onAction, label } = {}) {
  const section = document.createElement('section');
  section.className = 'kt-empty';
  section.setAttribute('aria-label', label || title || 'Trống');

  const mascot = document.createElement('span');
  mascot.className = 'kt-mascot';
  mascot.dataset.mascot = 'sleepy';
  mascot.dataset.size = '120';
  section.append(mascot);

  if (title) {
    const h = document.createElement('h3');
    h.className = 'kt-empty__title';
    h.textContent = title;
    section.append(h);
  }
  if (text) {
    const p = document.createElement('p');
    p.className = 'kt-empty__text';
    p.textContent = text;
    section.append(p);
  }
  if (actionLabel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kt-btn kt-btn--soft kt-btn--sm';
    btn.textContent = actionLabel;
    if (onAction) btn.addEventListener('click', onAction);
    section.append(btn);
  }
  return section;
}
