/** Màn ăn mừng theo kotoba-ui/components/GoalComplete/preview.html. */
const PETALS = [
  'left:18px;top:52px;transform:rotate(-30deg)',
  'right:26px;top:30px;transform:rotate(25deg)',
  'right:8px;bottom:70px;transform:rotate(70deg);opacity:.7',
  'left:36px;bottom:28px;transform:rotate(-60deg);opacity:.8',
];

export function renderGoalComplete({ title, text, chips = [], actionLabel, onAction, label } = {}) {
  const section = document.createElement('section');
  section.className = 'kt-goal';
  section.setAttribute('aria-label', label || title);

  const stage = document.createElement('div');
  stage.className = 'kt-goal__stage';
  for (const style of PETALS) {
    const petal = document.createElement('span');
    petal.className = 'kt-goal__petal';
    petal.setAttribute('style', style);
    petal.setAttribute('aria-hidden', 'true');
    stage.append(petal);
  }
  const mascot = document.createElement('span');
  mascot.className = 'kt-mascot';
  mascot.dataset.mascot = 'celebrate';
  mascot.dataset.size = '210';
  stage.append(mascot);

  const h = document.createElement('h2');
  h.className = 'kt-goal__title';
  h.textContent = title;
  section.append(stage, h);

  if (text) {
    const p = document.createElement('p');
    p.className = 'kt-goal__text';
    p.textContent = text;
    section.append(p);
  }
  if (chips.length) {
    const row = document.createElement('div');
    row.className = 'kt-goal__chips';
    for (const c of chips) {
      const chip = document.createElement('span');
      chip.className = `kt-chip ${c.className || 'kt-chip--success'}`;
      chip.textContent = c.text;
      row.append(chip);
    }
    section.append(row);
  }
  if (actionLabel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kt-btn kt-btn--primary kt-btn--block';
    btn.textContent = actionLabel;
    if (onAction) btn.addEventListener('click', onAction);
    section.append(btn);
  }
  return section;
}
