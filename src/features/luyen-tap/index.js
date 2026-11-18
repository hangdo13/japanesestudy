import { renderEmptyState } from '../../ui/empty-state.js';

export function mount(el) {
  el.append(
    renderEmptyState({
      title: 'Luyện tập sắp có',
      text: 'Cách đọc bất quy tắc, luyện nghe và đề thi thử sẽ nằm ở đây.',
    }),
  );
}
