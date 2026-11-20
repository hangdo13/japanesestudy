---
title: 'Story 2.6: Học từ vựng mới theo chủ đề'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: '0462a2d1075e06ab0d1f3425986898df1d35045d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-2-2-on-tu-vung.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Từ mới hiện chỉ đến theo thứ tự cố định trong phiên ôn; Hannah muốn chủ động học theo chủ đề như lộ trình mục 5.1 (FR25).

**Approach:** `#/tu-vung`: 21 chủ đề theo thứ tự lộ trình, mỗi chủ đề là một CourseProgressCard màu vocab (đã học / tổng). `#/tu-vung/<n>`: tên chủ đề, tiến độ, nút "Học từ mới" và danh sách từ (từ, cách đọc, nghĩa, nhãn "Đã học"). "Học từ mới" mở gói N từ chưa học của chủ đề (N = cài đặt "Số từ vựng mới mỗi ngày", mặc định 10) bằng Flashcard (`ui/cards` + `ui/flash-step`): vuốt phải Đã nhớ, trái Chưa nhớ. Xem hết gói thì một lần ghi: `tuVung[id].gioiThieu` = hôm nay và thẻ `vocab:<id>` (Good/Again theo lần vuốt). Thoát giữa chừng thì không ghi.

## Boundaries & Constraints

**Always:** `core/srs` cho thẻ; ghi qua `progress`; đồng hồ học `activity()`; component Kotoba UI; tính năng không import tính năng khác (Flashcard dùng chung chuyển sang `ui/flash-step`).

**Ask First:** Gói học từ mới vượt hạn mức ngày bị chặn.

**Never:** Không tạo thẻ cho từ chưa xem.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Danh sách | mở #/tu-vung | 21 thẻ chủ đề theo thứ tự, "x/y từ" | — |
| Học | chủ đề còn 16 từ chưa học, N=10 | gói 10 từ đầu (theo id) | — |
| Xong gói | vuốt hết | ghi 10 từ + 10 thẻ; GoalComplete | ghi lỗi → báo, giữ GoalComplete, không mất |
| Thoát giữa chừng | đóng | không ghi gì | — |
| Học hết chủ đề | 0 từ chưa học | nút khoá "Đã học hết chủ đề này", gợi ý ôn | — |
| Param lạ | #/tu-vung/99 | EmptyState "Không tìm thấy chủ đề" | — |

</frozen-after-approval>

## Code Map

- `src/core/vocab-review.js` -- `topicStats`, `topicPack`
- `src/features/tu-vung/` -- danh sách chủ đề, chi tiết, học gói
- `src/ui/flash-step.js` -- (chuyển từ features/on-tap/flash.js)
- `src/core/router.js`, `src/main.js`, `src/features/luyen-tap/` -- route + lối vào

## Tasks & Acceptance

- [x] core + test
- [x] Màn chủ đề, chi tiết, học gói + test
- [x] Route, hub

## Verification

- `npm test && npm run build`; screenshot.

## Implementation Notes

- Quyết định của Hannah (20/11, mục Ask First): **hạn mức từ mới là chung trong ngày**. Từ học ở phiên ôn hay ở chủ đề đều trừ vào "Số từ vựng mới mỗi ngày"; đủ rồi thì nút chủ đề hiện "Đã đủ từ mới hôm nay".
- Flashcard dùng chung chuyển sang `ui/flash-step.js` (+ `flash-step.css`), vì tính năng không được import tính năng khác.
- Thẻ "Từ vựng N5" ở trang chủ đổi sang đếm "đã học" (cùng cách đếm với trang chủ đề mà nó dẫn tới).
- Lưu lỗi: giữ kết quả gói trong bộ nhớ, có nút "Thử lưu lại".

## Spec Change Log

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Gói chủ đề bỏ qua hạn mức ngày | BH, ECH, VG | hỏi Hannah → hạn mức chung; patch |
| 2 | Ngày học lấy lúc lưu, không phải lúc bắt đầu phiên | BH | patch |
| 3 | Trang chủ đếm "đã thuộc", trang chủ đề đếm "đã học" | BH | patch: trang chủ đếm đã học; today.js dùng isLearned |
| 4 | Thứ tự tiêu đề sai (h3 trước h2) | BH | patch |
| 5 | Link thẻ chủ đề dài, không phải danh sách | BH | patch: ul/li + aria-label gọn |
| 6 | CSS nút Flashcard còn nằm ở on-tap | BH | patch |
| 7 | querySelector chip không kiểm tra; không kiểm tra bảng đăng ký | BH, ECH | patch |
| 8 | Ghi đè object tuVung | BH | patch |
| 9 | Lưu lỗi mất kết quả, không thử lại | ECH, VG | patch: "Thử lưu lại" |
| 10 | Gói tính lúc dựng trang (cũ) | ECH | patch: tính lại lúc bấm |
| 11 | Rời màn khi đang lưu, mở lại thấy từ cũ | ECH | patch: chờ lần lưu trước rồi vẽ lại (không đè phiên đang học) |
| 12 | Param 1.0 / 1e0 được nhận | ECH | patch |
| 13 | Số liệu hub viết cứng | ECH, VG | patch |
| 14 | Thiếu test: route chi tiết, param biên, link trang chủ/hub, ném lỗi, giữ tiến độ có sẵn, cleanup, tắt tự đọc, hạn mức chung | VG | patch: +15 test (457 tổng) |
