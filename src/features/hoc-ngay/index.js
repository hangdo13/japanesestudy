import { renderEmptyState } from '../../ui/empty-state.js';

export function mount(el) {
  el.append(
    renderEmptyState({
      title: 'Học ngay sắp có',
      text: 'Nút này sẽ đưa bạn thẳng vào việc học tiếp theo trong ngày.',
    }),
  );
}
