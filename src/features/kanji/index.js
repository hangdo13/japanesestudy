import './kanji.css';
import { renderEmptyState } from '../../ui/empty-state.js';
import { kanji } from '../../core/content.js';
import { toHash } from '../../core/router.js';
import { renderList } from './list.js';
import { renderDetail } from './detail.js';
import { renderLearn } from './learn.js';
import { HOC_MOI } from './routes.js';

export { HOC_MOI };

export function mount(el, { param } = {}, deps = {}) {
  if (!param) {
    el.append(renderList());
    return;
  }
  if (param === HOC_MOI) {
    const learn = renderLearn(deps);
    el.append(learn.node);
    return learn.cleanup;
  }
  const detail = renderDetail(param, deps);
  if (detail) {
    el.append(detail);
    return detail.cleanup;
  }
  el.append(
    renderEmptyState({
      title: 'Không tìm thấy chữ này',
      text: `Chữ này không có trong ${kanji().length} kanji N5.`,
      actionLabel: 'Về danh sách kanji',
      onAction: () => {
        window.location.hash = toHash('kanji');
      },
    }),
  );
}
