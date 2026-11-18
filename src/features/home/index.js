import { renderEmptyState } from '../../ui/empty-state.js';

export function mount(el) {
  el.append(
    renderEmptyState({
      title: 'Trang chủ sắp có',
      text: 'Pyon đang chuẩn bị việc học hôm nay cho bạn. Quay lại sớm nhé!',
    }),
  );
}
