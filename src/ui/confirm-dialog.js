/**
 * Hộp thoại xác nhận tự dựng (không dùng confirm()). Trả Promise<boolean>.
 * Dùng token và component Card/Button của Kotoba UI.
 */
export function confirmDialog({ title, text, confirmLabel = 'Đồng ý', cancelLabel = 'Huỷ' }, root = document.body) {
  let dispose = () => {};
  const promise = new Promise((resolve) => {
    const previous = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'app-dialog';

    const box = document.createElement('div');
    box.className = 'kt-card kt-stack app-dialog__box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    const titleId = `dlg-${Math.random().toString(36).slice(2)}`;
    box.setAttribute('aria-labelledby', titleId);

    const h = document.createElement('h2');
    h.id = titleId;
    h.className = 'title app-dialog__title';
    h.textContent = title;
    const p = document.createElement('p');
    p.className = 'kt-muted';
    p.textContent = text;

    const row = document.createElement('div');
    row.className = 'kt-row app-dialog__actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'kt-btn kt-btn--ghost kt-btn--sm';
    cancel.textContent = cancelLabel;
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'kt-btn kt-btn--primary kt-btn--sm';
    ok.textContent = confirmLabel;
    row.append(cancel, ok);

    box.append(h, p, row);
    overlay.append(box);

    let closed = false;
    const inerted = [...root.children];
    const close = (value) => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      inerted.forEach((n) => n.removeAttribute('inert'));
      if (previous && previous.isConnected && typeof previous.focus === 'function') previous.focus();
      resolve(value);
    };
    dispose = () => close(false);
    const onKey = (e) => {
      if (!overlay.isConnected) {
        close(false);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Tab') {
        // giữ focus trong hộp thoại
        const items = [cancel, ok];
        const i = items.indexOf(document.activeElement);
        e.preventDefault();
        items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
      }
    };
    cancel.addEventListener('click', () => close(false));
    ok.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKey, true);

    inerted.forEach((n) => n.setAttribute('inert', ''));
    root.append(overlay);
    cancel.focus();
  });
  /** Đóng hộp thoại từ bên ngoài (vd. khi rời màn hình): coi như huỷ. */
  promise.close = () => dispose();
  return promise;
}
