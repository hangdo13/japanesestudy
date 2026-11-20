// Nút "Học ngay" (nút tròn giữa BottomNav) và nút bắt đầu trên trang chủ: vào thẳng việc kế tiếp.
import { progress as defaultProgress } from '../../core/progress.js';
import { kanji as allKanji, vocab as allVocab } from '../../core/content.js';
import { dueToday, nextTask } from '../../core/today.js';
import { toHash } from '../../core/router.js';
import { renderGoalComplete } from '../../ui/goal-complete.js';

/**
 * deps: progress, now, win
 */
export function mount(el, _params, deps = {}) {
  const store = deps.progress || defaultProgress();
  const now = (deps.now || (() => new Date()))();
  const win = deps.win || window;
  const next = nextTask(dueToday(store.get(), { kanji: allKanji(), vocab: allVocab(), now }));
  if (next) {
    // thay mục lịch sử: bấm Quay lại không rơi vào #/hoc-ngay rồi bị đẩy đi tiếp
    const hash = toHash(...next);
    if (typeof win.location.replace === 'function' && win.location.href) win.location.replace(win.location.href.replace(/#.*$/, '') + hash);
    else if (win.history && typeof win.history.replaceState === 'function') {
      win.history.replaceState(null, '', hash);
      win.dispatchEvent(new Event('hashchange'));
    } else win.location.hash = hash;
    return;
  }
  el.append(
    renderGoalComplete({
      title: 'Xong việc hôm nay!',
      text: 'Bạn đã ôn hết thẻ đến hạn và học đủ chữ, từ mới hôm nay. Mai Pyon chuẩn bị tiếp nhé.',
      actionLabel: 'Về trang chủ',
      onAction: () => {
        win.location.hash = toHash('');
      },
    }),
  );
  const K = win.Kotoba;
  if (K && typeof K.hydrate === 'function') K.hydrate(el);
}
