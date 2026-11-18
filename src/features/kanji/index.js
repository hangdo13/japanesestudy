import './kanji.css';
import { renderEmptyState } from '../../ui/empty-state.js';
import { toHash } from '../../core/router.js';
import { renderList } from './list.js';
import { renderDetail } from './detail.js';

export function mount(el, { param } = {}, deps = {}) {
  if (!param) {
    el.append(renderList());
    return;
  }
  const detail = renderDetail(param, deps);
  if (detail) {
    el.append(detail);
    return detail.cleanup;
  }
  el.append(
    renderEmptyState({
      title: 'Không tìm thấy chữ này',
      text: 'Chữ này không có trong 106 kanji N5.',
      actionLabel: 'Về danh sách kanji',
      onAction: () => {
        window.location.hash = toHash('kanji');
      },
    }),
  );
}
