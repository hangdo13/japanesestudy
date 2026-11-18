import { renderEmptyState } from '../../ui/empty-state.js';

export function mount(el) {
  el.append(
    renderEmptyState({
      title: 'Kanji sắp có',
      text: '106 chữ kanji N5 kèm âm Hán Việt và câu gợi nhớ sẽ xuất hiện ở đây.',
    }),
  );
}
