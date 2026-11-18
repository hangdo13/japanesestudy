---
title: 'Story 1.6: Thêm Kotoba vào màn hình chính iPhone'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '66e1a9c2a80ae2593970737ea310aa81bcdc6155'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Mở Kotoba trong tab Safari thường thì sau 7 ngày không dùng, Safari có thể xoá toàn bộ tiến độ. Hannah cần mở app từ màn hình chính và được nhắc sao lưu.

**Approach:** Thêm `manifest.webmanifest`, `apple-touch-icon` (vẽ từ Pyon) và các thẻ meta cho iOS. Trên iPhone/iPad mà app đang mở trong Safari thường, trang chủ hiện thẻ hướng dẫn 3 bước thêm vào màn hình chính, có nút "Để sau". Quá 7 ngày chưa sao lưu thì trang chủ nhắc xuất sao lưu, kèm nút sang Cài đặt. Trang chủ cũng báo khi dữ liệu bị hỏng hoặc app đang tạm ngừng ghi (việc deferred từ Story 1.4).

## Boundaries & Constraints

**Always:** chỉ dùng token và component có sẵn: Card, Button, SectionHeader, EmptyState. Không thêm mảng màu thứ hai trong một khối. Logic "đến hạn sao lưu" và "có nên hiện hướng dẫn" là hàm thuần trong `core/growth`, có test. Bấm "Để sau" thì ẩn hướng dẫn 7 ngày; mốc thời gian lưu trong `progress`. Icon và manifest dùng đường dẫn tương đối để chạy đúng dưới `/japanesestudy/`.

**Never:** không dùng service worker, không dùng `alert`. Không hiện hướng dẫn trên máy không phải iOS hoặc khi đã mở từ màn hình chính.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| iPhone, tab Safari | iOS, không standalone, chưa bấm "Để sau" | Hiện thẻ hướng dẫn 3 bước kèm lý do 7 ngày | N/A |
| Đã thêm vào màn hình chính | `navigator.standalone` hoặc `display-mode: standalone` | Không hiện hướng dẫn | N/A |
| Không phải iOS | Desktop hoặc Android | Không hiện hướng dẫn | N/A |
| Để sau | Bấm "Để sau" | Ẩn ngay, 7 ngày sau mới hiện lại | Ghi lỗi thì vẫn ẩn trong phiên này |
| Đến hạn sao lưu | `lastBackupAt` cách đây ≥ 7 ngày, hoặc chưa sao lưu và `createdAt` cách đây ≥ 7 ngày | Nhắc xuất sao lưu, có nút tới `#/cai-dat` | N/A |
| Chưa đến hạn | Sao lưu cách đây dưới 7 ngày | Không nhắc | N/A |
| Dữ liệu hỏng hoặc đang ngừng ghi | `recoveredFromCorrupt` hoặc `writeBlocked` | Trang chủ hiện thông báo tương ứng | N/A |

</frozen-after-approval>

## Code Map

- `index.html` -- đã có `color-scheme` và script đặt theme. Thêm `<link rel="manifest">`, `apple-touch-icon`, `apple-mobile-web-app-capable`/`-title`/`-status-bar-style`, `theme-color` (lấy từ token `--bg` sáng #f6f5fd và tối).
- `public/` -- thêm `manifest.webmanifest` và `icons/` (PNG 180, 192, 512, render từ `Kotoba.mascot('happy')` trên nền `--surface-tint`).
- `src/features/home/index.js` -- hiện là EmptyState "Trang chủ sắp có". Giữ EmptyState đó, thêm các thẻ thông báo phía trên.
- `src/core/progress.js` -- `recoveredFromCorrupt`, `writeBlocked`, `lastBackupAt`, `createdAt`.

## Tasks & Acceptance

**Execution:**
- [x] `public/manifest.webmanifest`, `public/icons/*.png`, `scripts/make-icons.py` -- manifest và icon.
- [x] `index.html` -- thẻ meta và link.
- [x] `src/core/growth.js` -- `backupDue(data, now)`, `shouldShowInstallGuide({ isIos, isStandalone, dismissedAt, now })`, `DAYS_7_MS`.
- [x] `src/core/platform.js` -- `detectPlatform(win)` → `{ isIos, isStandalone }`.
- [x] `src/features/home/index.js` + `home.css` -- thẻ hướng dẫn, nhắc sao lưu, thông báo dữ liệu.
- [x] Tests: growth, platform, home.

**Acceptance Criteria:**
- Given bản build, when xem `dist/index.html` và `dist/manifest.webmanifest`, then link icon và manifest trỏ đúng dưới `/japanesestudy/`.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công. `dist/manifest.webmanifest` tồn tại.

## Implementation Notes

- Icon được render bằng Playwright từ `Kotoba.mascot('happy')` (`scripts/make-icons.py`). Script ghi thẳng ra `apple-touch-icon.png` (180), `icon-192.png` và `icon-512.png`.
- Kiểm tra bằng Playwright với user agent iPhone, cả theme sáng và tối: thẻ hướng dẫn và lời nhắc sao lưu hiện đúng, không có lỗi console. `dist/index.html` trỏ manifest và icon dưới `/japanesestudy/`.
- Gọi thêm `navigator.storage.persist()` khi khởi động. Không bắt buộc thành công.
- Trên iOS mà trình duyệt không phải Safari (Chrome, Facebook, Zalo…), thẻ hướng dẫn đổi sang các bước mở trang bằng Safari.

## Spec Change Log

- Edge (claim): task ghi `DAYS_7`, nhưng code xuất `DAYS_7_MS`. Đã sửa task theo tên trong code.

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | cả 3 | Script vẽ icon không sinh `apple-touch-icon.png` | medium | patch: script ghi đúng tên file, xoá `icon-180.png` |
| 2 | blind | CI không kiểm tra file icon và manifest có trong `dist` | low | patch: `test -f` |
| 3 | blind | Manifest không có icon `maskable` | low | reject: Hannah dùng iPhone |
| 4 | blind+edge | Hướng dẫn kiểu Safari hiện trên Chrome iOS và trình duyệt trong app | medium | patch: `isIosSafari` + các bước mở bằng Safari |
| 5 | blind | Chưa xin lưu trữ lâu dài | low | patch: `requestPersistentStorage` |
| 6 | blind | Thiếu `createdAt` thì không bao giờ nhắc sao lưu | medium | patch: thiếu mốc thì nhắc luôn |
| 7 | blind | Lời nhắc sao lưu không bấm "Để sau" được; chữ "hơn 7 ngày" | low | patch câu chữ. Phần "Để sau": reject (lời nhắc này nên hiện liên tục) |
| 8 | blind+edge | "Để sau" lưu thời điểm lúc mở trang | low | patch: lấy giờ lúc bấm |
| 9 | edge | "Để sau" không lưu được khi đang tạm ngừng ghi | low | reject: ẩn trong phiên là đủ, trang chủ đã báo đang tạm ngừng lưu |
| 10 | edge | Không ghi được thì lời nhắc sao lưu không hiện | low | reject: thẻ "tạm ngừng lưu" đã hiện thay |
| 11 | edge | Mốc thời gian ở tương lai | low | patch |
| 12 | edge | `dismissedAt` không phải chuỗi | low | patch |
| 13 | blind+edge | Script vẽ icon dễ hỏng (thư mục, regex, chờ cố định) | low | patch |
| 14 | blind+edge | `theme_color` của manifest chỉ có bản sáng | low | reject: manifest không đổi màu theo theme được |
| 15 | blind | `import` nằm giữa file test | low | patch |
| 16 | blind | Test platform thiếu trường hợp `matchMedia` lỗi | low | patch |
| 17 | vg | Trang chủ chưa được test việc đọc mốc "Để sau" | medium | patch |
| 18 | edge | Spec ghi `DAYS_7`, code xuất `DAYS_7_MS` | low | sửa spec |
