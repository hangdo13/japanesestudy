---
title: 'Story 2.5: Đếm ngược ngày thi và nhắc đăng ký'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: '86b4784e3bec6e4869d84eec5129cc8dff4fb772'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Hannah cần biết còn bao lâu tới kỳ thi và không được lỡ hạn đăng ký (đợt 7/2026 kín chỗ sau vài tuần) (FR19).

**Approach:** Cài đặt có "Ngày thi" (mặc định 04/07/2027, Chủ nhật đầu tháng 7) chỉnh được, và "Đã đăng ký thi". `core/growth` tính số ngày còn lại và lúc bắt đầu nhắc (hàm thuần, theo giờ trên máy): kỳ tháng 7 nhắc từ 01/03, kỳ tháng 12 nhắc từ 01/08 (4 tháng trước tháng thi). Trang chủ: SectionHeader "JLPT N5 · 04/07/2027" với Chip "Còn N ngày"; từ ngày nhắc, nếu chưa đánh dấu đã đăng ký và chưa tới ngày thi, hiện thẻ nhắc với link trang JLPT của Japan Foundation Việt Nam và nút "Đã đăng ký" (lưu `settings.daDangKyThi`).

## Boundaries & Constraints

**Always:** Giá trị dẫn xuất ở `core/growth` (AD-8). Chip + SectionHeader có sẵn, không thêm `surface-tint` (AD-9). Link mở tab mới, `rel="noopener"`.

**Ask First:** Thông báo đẩy (push) ngoài app.

**Never:** Không ghi ngày đăng ký cụ thể như thể là chính thức (chưa công bố).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mặc định | 20/11/2026 | "Còn 226 ngày" | — |
| Hôm nay thi | ngày thi | "Hôm nay thi! Chúc bạn thi tốt" | — |
| Đã qua | sau ngày thi | "Kỳ thi đã qua", gợi ý đổi ngày trong Cài đặt; không nhắc đăng ký | — |
| Nhắc | ≥ 01/03/2027, chưa đăng ký | thẻ nhắc + link + "Đã đăng ký" | ghi lỗi → báo, vẫn hiện |
| Đã đăng ký | bấm nút | ẩn nhắc (lưu progress) | — |
| Cài đặt | nhập ngày không hợp lệ / để trống | dùng mặc định, báo | — |

</frozen-after-approval>

## Code Map

- `src/core/growth.js` -- `examDay`, `daysUntilExam`, `registrationReminderDue`
- `src/features/home/` -- đếm ngược + nhắc
- `src/features/cai-dat/` -- ngày thi, đã đăng ký

## Tasks & Acceptance

- [x] growth + test
- [x] Trang chủ + test
- [x] Cài đặt + test

## Verification

- `npm test && npm run build`

## Implementation Notes

- Ngày thi 04/07/2027 kiểm bằng web (20/11/2026): JLPT thi Chủ nhật đầu tháng 7 và 12; ngoài Nhật đăng ký kỳ tháng 7 khoảng tháng 3–4; đợt 7/2026 kín chỗ sau vài tuần. Lịch 2027 chưa công bố chính thức trên jlpt.jp.
- Link: trang JLPT của Japan Foundation Hà Nội (`hn.jpf.go.jp/.../japanese-language-test-jlpt-basic`).
- `settings.daDangKyThi` lưu **ngày thi đã đăng ký** (không phải true/false), để đổi ngày thi thì nhắc lại.
- Từ mùng 1 của tháng cách tháng thi 2 tháng (thi 7 → 1/5), lời nhắc đổi thành "khung đăng ký có thể đã qua, kiểm tra lại".

## Spec Change Log

- Ngày thi nhận năm 2024–2100 (tránh lưu nhầm 0202 khi đang gõ).
- Khung tháng "thường mở" chỉ nói cho kỳ tháng 7 / 12; tháng khác dùng lời trung tính (đúng luật Never).

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Ô ngày nhảy về mặc định khi đang gõ năm (Chrome báo change từng phần); lưu 0202 | BH, ECH | patch: năm 2024–2100, chờ khi đang focus, đặt lại khi rời ô; min/max |
| 2 | "Đã đăng ký" là cờ vĩnh viễn, đổi ngày thi không nhắc lại | BH, ECH | patch: lưu ngày thi đã đăng ký |
| 3 | Bịa khung đăng ký cho tháng khác 7/12; câu "đợt 7/2026" cứng | BH, ECH | patch |
| 4 | Sau khung đăng ký vẫn bảo "đến lúc đăng ký" | BH | patch: lời nhắc khi đã qua khung |
| 5 | Lỗi lưu mất khi dựng lại trang | ECH | patch |
| 6 | Gỡ thẻ làm mất focus, không báo đã lưu | BH, ECH | patch: focus tiêu đề kỳ thi + vùng status |
| 7 | aria-label trên div; link tab mới không báo | BH | patch: section + aria-labelledby; "(mở tab mới)" |
| 8 | now không hợp lệ → NaN → "Kỳ thi đã qua" | BH, ECH | patch |
| 9 | Ngày thi: không có lối đặt ngày thi tiếp theo | ECH | patch: link cả khi n = 0 |
| 10 | Ghi đè ô ngày khi đang mở bộ chọn | BH | patch: không ghi khi đang focus |
| 11 | Thiếu test: ô tích khi đã đăng ký, cập nhật khi dữ liệu đổi, lỗi lưu ở Cài đặt, hôm trước ngày thi, một surface-tint khi có nhắc | VG | patch: +7 test (431 tổng) |
| 12 | Test DST không thể sai ở múi giờ không có DST | VG | defer: phép tính dùng Date.UTC trên ngày địa phương (đã kiểm bằng tay); cần chạy test trong múi có DST |
| 13 | Trang để qua nửa đêm không cập nhật số ngày | BH | reject: đã dựng lại khi mở lại app (2.4) |
