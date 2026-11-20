---
title: 'Story 2.4: Trang chủ "việc hôm nay"'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: 'd0662c14446ada59d0ccb00b4cb3ce53502ecf03'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
  - '{project-root}/kotoba-design/design/kotoba-ui/components/ActiveLessonCard/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Mở app chưa biết hôm nay học gì; trang chủ đang là EmptyState "sắp có" (FR6).

**Approach:** `core/growth.dueToday()` (hàm thuần) đếm việc hôm nay: thẻ kanji đến hạn (mỗi chữ một thẻ, tối đa 20), thẻ từ vựng đến hạn (tối đa 20), kanji mới và từ mới còn trong hạn mức. Trang chủ từ trên xuống: Greeting "Chào, **Hannah!**" + dòng nhắc hành động; ActiveLessonCard (khối `surface-tint` duy nhất) "Hôm nay: … " + nút bắt đầu; cặp StatCard (phút học hôm nay từ đồng hồ học, kanji đã học / 106); StreakTracker (T2–CN, chuỗi được nghỉ 1 ngày mỗi 7 ngày, ngọn lửa peach); CourseProgressCard cho kanji và từ vựng đã thuộc. Nút bắt đầu và nút tròn giữa BottomNav vào `#/hoc-ngay`, nơi chuyển thẳng tới việc kế tiếp: ôn kanji → ôn từ vựng → kanji mới; xong một phần thì màn kết quả có nút "Việc tiếp theo". Thẻ ôn hiển thị qua bảng đăng ký `ui/cards/registry`; loại chưa đăng ký bị bỏ qua. Xong hết: "Xong việc hôm nay!" + Pyon `celebrate` (một Pyon trên màn).

## Boundaries & Constraints

**Always:** Giá trị dẫn xuất ở `core/growth` (AD-8); phút học đọc qua `minutesOn` (AD-5); component theo preview.html (AD-9). Thông báo cài đặt/sao lưu/dữ liệu hỏng giữ nguyên, đặt trên Greeting.

**Ask First:** Đổi tên hiển thị "Hannah".

**Never:** Không thêm khối `surface-tint` thứ hai; `peach` chỉ cho ngọn lửa.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Có việc | 12 thẻ đến hạn, 3 kanji mới | "Hôm nay: 12 thẻ cần ôn · 3 kanji mới" | — |
| Bắt đầu | bấm nút / nút tròn | tới #/on-tap/kanji nếu có thẻ kanji, rồi từ vựng, rồi #/kanji/hoc-moi | — |
| Xong một phần | GoalComplete | nút "Việc tiếp theo" nếu còn việc, không thì "Về trang chủ" | — |
| Xong hết | không còn việc | "Xong việc hôm nay!" + Pyon celebrate; #/hoc-ngay về trang chủ | — |
| Chuỗi ngày | học T2,T3, nghỉ T4, học T5 (hôm nay) | chuỗi 3, ghi chú được nghỉ 1 ngày/tuần | — |
| Ngày học | ≥ 60 giây học thực trong ngày | tính là ngày học | — |

</frozen-after-approval>

## Code Map

- `src/core/today.js` -- `dueToday`, `nextTask`, `afterSession`, `studyStreak`, `weekDays`, `learnedCounts`
- `src/features/home/` -- trang chủ
- `src/features/hoc-ngay/` -- chuyển tới việc kế tiếp
- `src/ui/cards/registry.js` -- bảng đăng ký thẻ
- `src/features/on-tap/*`, `src/features/kanji/learn.js` -- nút "Việc tiếp theo"

## Tasks & Acceptance

- [x] growth + test
- [x] Trang chủ + test (một surface-tint, một Pyon)
- [x] #/hoc-ngay + nút việc tiếp theo
- [x] registry thẻ

## Verification

- `npm test && npm run build`; screenshot sáng/tối.

## Implementation Notes

- Số liệu trang chủ nằm ở `core/today.js` (không phải `core/growth.js`) vì `vocab-review` đã import `growth`, để chung sẽ thành import vòng. Vẫn là giá trị dẫn xuất trong core (AD-8).
- `kanjiSessionSteps` (core/kanji-review) dùng chung cho màn ôn và số "thẻ cần ôn" ở trang chủ, nên hai nơi luôn khớp (không có vòng lặp Học ngay).
- Thẻ nghĩa của chữ vừa học đến hạn ngay, nên sau gói kanji mới "Việc tiếp theo" sẽ đưa vào ôn luôn 5 chữ đó (cố ý: nhớ lại ngay sau khi học).
- Trang chủ chỉ dựng lại khi nội dung đổi, giữ focus; mở lại app (visibilitychange) thì tính lại theo ngày mới.

## Spec Change Log

- Greeting đổi theo giờ ("Chào buổi sáng/chiều/tối, **Hannah!**"), theo quy tắc trong README Greeting của Kotoba UI. Tên vẫn là Hannah.
- ActiveLessonCard: chỉ nút ↗ bắt đầu (không làm cả thẻ bấm được) để tránh phần tử tương tác lồng nhau.
- StatCard "Học hôm nay" và thẻ Từ vựng N5 dẫn tới Luyện tập (không mở phiên học ngay khi chỉ muốn xem số liệu).

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Chuỗi về 0 sáng hôm sau ngày nghỉ (chưa kịp học) | BH, ECH | patch |
| 2 | Số thẻ ở trang chủ khác số màn ôn hiện được → vòng lặp Học ngay | BH, ECH, VG | patch: `kanjiSessionSteps` dùng chung, `canShow` theo bảng đăng ký |
| 3 | Nút luôn "Việc tiếp theo" (spec: hết việc thì "Về trang chủ"); điều hướng sau khi đã rời màn | BH, ECH | patch: `afterSession` sau khi lưu xong; kiểm tra alive/disposed |
| 4 | Trang chủ dựng lại cả trang mỗi lần đồng hồ ghi, mất focus | BH, ECH | patch: chỉ dựng lại khi nội dung đổi, giữ focus |
| 5 | aria-label trên div ngày không được đọc | BH | patch: role=img |
| 6 | StatCard phút học mở phiên học | BH | patch: dẫn tới Luyện tập |
| 7 | Cả thẻ bấm được chỉ bằng chuột, lồng nút | BH | patch: chỉ nút |
| 8 | Fallback hoc-ngay thêm mục lịch sử | BH | patch: history.replaceState |
| 9 | Tên truy cập "5phút" dính chữ | BH | patch: aria-label |
| 10 | Trang để qua đêm không cập nhật | BH, ECH | patch: visibilitychange |
| 11 | 717/718 hiện 100% | ECH | patch |
| 12 | Hôm nay đã học thì mất is-today | ECH | patch |
| 13 | today.js đọc thẳng hocGiay; luật AD-5 bị nới | VG, ECH | patch: đọc qua minutesOn, khôi phục luật chặt |
| 14 | Spec ghi core/growth, masteredCounts, lời chào cố định | ECH, VG | patch spec (Implementation Notes, Change Log) |
| 15 | Thiếu test: bỏ qua loại thẻ chưa đăng ký, giới hạn 20 kanji, kịch bản chuỗi của spec, thông báo trên Greeting, một surface-tint, dòng phụ Greeting, fallback hoc-ngay | VG | patch: +12 test (410 tổng) |
| 16 | Đếm "thẻ" theo chữ (mỗi chữ một thẻ mỗi phiên) | ECH | reject: đúng với số bước phiên sẽ hiện |
