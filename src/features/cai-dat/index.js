import { renderEmptyState } from '../../ui/empty-state.js';
import { toHash } from '../../core/router.js';

export function mount(el) {
  el.append(
    renderEmptyState({
      title: 'Cài đặt sắp có',
      text: 'Sao lưu tiến độ và chỉnh số chữ học mỗi ngày sẽ có ở đây.',
      actionLabel: 'Xem giới thiệu',
      onAction: () => {
        window.location.hash = toHash('gioi-thieu');
      },
    }),
  );
}
