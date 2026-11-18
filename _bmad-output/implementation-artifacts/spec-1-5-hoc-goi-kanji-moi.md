---
title: 'Story 1.5: Học gói kanji mới mỗi ngày'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'e6296850c82d3097039cfd4bb9694d29ad3dca11'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Hannah xem được kanji nhưng chưa có lộ trình mỗi ngày. Cần một gói kanji mới vừa sức mỗi ngày, mặc định 5 chữ.

**Approach:** `#/kanji/hoc-moi` hiện gói hôm nay bằng chồng thẻ `Flashcard` (component dùng chung `ui/cards/kanji`). Xem hết thẻ thì bấm "Đã học xong": các chữ được ghi vào `progress` là "đã giới thiệu" kèm ngày, rồi hiện `GoalComplete`. Hạn mức được tính trong `core/growth` và chỉnh được trong Cài đặt (1–10).

## Boundaries & Constraints

**Always:** chọn chữ theo thứ tự bài học, bỏ qua chữ đã giới thiệu. Hạn mức trong ngày = cài đặt − số chữ đã giới thiệu hôm nay (ngày `YYYY-MM-DD` theo giờ trên máy). Hàm tính là hàm thuần trong `core/growth`, có test. Thẻ dùng đúng markup `kt-flash` của preview. Lật được bằng Space/Enter, chuyển thẻ bằng phím ←/→. Chuyển động theo `prefers-reduced-motion` (đã có sẵn trong bundle.css). Một Pyon mỗi màn hình.

**Never:** chưa lên lịch ôn (Epic 2). Vuốt trái hay phải đều chỉ là "xem xong thẻ", không chấm điểm.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Gói đầu tiên | Chưa học chữ nào, hạn mức 5 | 5 thẻ: 一 二 三 四 五 | N/A |
| Học xong | Đã xem hết 5 thẻ, bấm "Đã học xong" | 5 chữ được ghi `gioiThieu = hôm nay`, hiện GoalComplete | Ghi lỗi thì hiện lỗi tiếng Việt, không hiện GoalComplete |
| Đủ hạn mức | Hôm nay đã giới thiệu 5 chữ | EmptyState "Hôm nay đủ rồi, mai học tiếp nhé" | N/A |
| Còn một phần | Hôm nay đã giới thiệu 3 chữ, hạn mức 5 | 2 thẻ tiếp theo | N/A |
| Hết chữ | Đã giới thiệu đủ 106 chữ | EmptyState báo đã học hết 106 kanji | N/A |
| Đổi hạn mức | Cài đặt chọn 8 | Lưu `settings.kanjiMoiMoiNgay = 8`, lần mở sau gói có tối đa 8 chữ | Giá trị ngoài 1–10 bị kẹp về khoảng hợp lệ |

</frozen-after-approval>

## Code Map

- `Kotoba.swipeDeck(deck, { onSwipe(dir, card) })` trong bundle.js. Thẻ trên cùng là phần tử con cuối. Có sẵn phím ←/→/Space/Enter. Nếu không truyền `onSwipe` thì thẻ tự xoá.
- Markup `Flashcard/preview.html`: `section.kt-session` > `.kt-session__head` (nút đóng, `.kt-seg.kt-seg--kanji.kt-seg--thick`, `.kt-count`) + `.kt-deck[tabindex=0]` + `.kt-swipe-hint`. Thẻ: `.kt-flash` (stamp, `__top` chip + tools, `__face` kana/glyph/meaning/tap, `__ex`).
- `GoalComplete/preview.html`: `section.kt-goal` + petals + mascot `celebrate` + title/text/chips + nút block.
- `src/features/kanji/index.js` -- `param === 'hoc-moi'` là màn học mới. `createPlayer` có sẵn trong `detail.js`.
- `src/features/cai-dat/index.js` -- thêm thẻ cài đặt "Số kanji mới mỗi ngày".

## Tasks & Acceptance

**Execution:**
- [x] `src/core/growth.js` -- `DEFAULT_KANJI_MOI`, `kanjiMoiLimit(settings)`, `newKanjiToday(data, allKanji, today)` → `{ pack, introducedToday, limit, remainingTotal }`.
- [x] `src/ui/cards/kanji.js` -- `renderKanjiCard(k, { onPlay })` theo markup `kt-flash`.
- [x] `src/ui/goal-complete.js` -- `renderGoalComplete({ title, text, chips, actionLabel, onAction })`.
- [x] `src/features/kanji/learn.js` + `kanji.css` -- màn học mới. Thêm nút "Học chữ mới" ở đầu danh sách.
- [x] `src/features/cai-dat/index.js` -- chọn hạn mức từ 1 đến 10.
- [x] Tests: `src/core/growth.test.js`, `src/features/kanji/learn.test.js`, bổ sung test cho cai-dat.

**Acceptance Criteria:**
- Given khổ 390px ở cả hai theme, when mở `#/kanji/hoc-moi`, then màn khớp preview Flashcard và GoalComplete.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công.

## Implementation Notes

- Lúc kiểm tra bằng trình duyệt thật thì phát hiện nút "Đã học xong" hiện ngay từ đầu. Nguyên nhân là `.kt-btn` đặt `display: inline-flex`, đè lên thuộc tính `hidden`. Đã thêm `[hidden] { display: none !important; }` vào `app.css`, kèm test kiểm tra luật này.
- Chạy cả luồng bằng Playwright, ở cả theme sáng và tối: lật thẻ bằng Space, chuyển thẻ bằng → ×5, bấm "Đã học xong" thì ra GoalComplete. Tải lại trang thì hiện "Hôm nay đủ rồi". Không có lỗi console.
- Route con `hoc-moi` được tách ra `features/kanji/routes.js` để tránh import vòng.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | blind+edge | Vuốt trái ("Ôn lại") và vuốt phải xử lý như nhau | false | Spec (frozen) ghi rõ: vuốt trái hay phải đều chỉ là "xem xong thẻ". Ôn lại thật sự thuộc Epic 2 |
| 2 | blind+edge | Không có `window.Kotoba` thì không làm tiếp được | low | reject: `bundle.js` được Vite gộp chung vào bundle chính, không tải riêng |
| 3 | blind | Rời trang trước khi bấm "Đã học xong" thì không lưu | low | reject: AC yêu cầu lưu khi bấm nút |
| 4 | blind+edge | Hạn mức `null`/rỗng bị kẹp về 1 thay vì 5 | low | patch |
| 5 | blind+edge | Số "106" ghi cứng | low | patch |
| 6 | blind+edge | Deck không được dọn khi rời trang, `onSwipe` đến muộn vẫn chạy | low | patch: cờ `disposed` |
| 7 | blind+edge | Phiên học kéo qua nửa đêm lưu nhầm ngày | medium | patch: tính lại ngày lúc lưu |
| 8 | blind | Cài đặt không kiểm tra `d.settings` có tồn tại | false | `normalize()` của Story 1.4 luôn điền sẵn `settings` |
| 9 | blind | Dòng trạng thái của hạn mức bị cũ | low | patch |
| 10 | blind | Nút vào học không phản ánh số chữ còn lại | low | reject |
| 11 | blind | Tên route bị lặp ở nhiều chỗ | low | patch: `routes.js` |
| 12 | blind+edge | Test đọc file CSS phụ thuộc thư mục đang chạy | low | patch |
| 13 | blind | Luật CSS rò sang màn khác | low | patch: `.kanji-learn-link` |
| 14 | vg | Đường vuốt thật qua `swipeDeck` chưa được test | high | patch |
| 15 | vg | Link "Học chữ mới hôm nay" chưa được test | medium | patch |
| 16 | vg | Ô chọn hạn mức chưa được test đồng bộ sau khi nhập sao lưu | medium | patch |
| 17 | vg | Nhánh lưu hạn mức bị lỗi chưa được test | low | patch |
