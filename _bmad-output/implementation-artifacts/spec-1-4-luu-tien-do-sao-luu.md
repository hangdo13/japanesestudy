---
title: 'Story 1.4: Lưu tiến độ và sao lưu ra file'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '2a48601a80b3b24f6c5b4efbeb6924349aaf938a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** App chưa lưu được gì. Các story sau cần một kho tiến độ duy nhất. Hannah cũng cần xuất và nhập file sao lưu để không mất công học khi Safari xoá dữ liệu hoặc khi đổi máy.

**Approach:** `core/progress` là module duy nhất được dùng `localStorage`, với khoá `kotoba:v1`. Dữ liệu có `schemaVersion` và hàm chuyển đổi. Mỗi lần ghi phát sự kiện `progress:changed`. Màn Cài đặt có nút xuất sao lưu (tải file JSON, ghi lại ngày sao lưu) và nút nhập sao lưu (chọn file, xác nhận bằng hộp thoại tự dựng).

## Boundaries & Constraints

**Always:** chỉ `src/core/progress.js` được dùng `localStorage`, có test kiến trúc kiểm tra. Lỗi lưu trữ (đầy, bị chặn, dữ liệu hỏng) hiện thông báo tiếng Việt, app không treo. Hộp thoại xác nhận dùng token, có `role="dialog"`, `aria-modal`, đóng được bằng Esc. Mỗi màn chỉ có một nút `kt-btn--primary`.

**Never:** không dùng `alert`/`confirm`/`prompt`. Không có server. Không xoá dữ liệu cũ khi file nhập không hợp lệ.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lần đầu | localStorage trống | Tạo `kotoba:v1` với `schemaVersion: 1` | N/A |
| Ghi | `progress.update(fn)` | Lưu và phát `progress:changed` | Lỗi quota thì trả `{ ok:false, error }` bằng tiếng Việt, dữ liệu trong bộ nhớ không đổi |
| Dữ liệu hỏng | `kotoba:v1` không phải JSON | Bắt đầu lại từ dữ liệu mới, giữ bản hỏng ở `kotoba:v1:hong` | Có cờ `recoveredFromCorrupt` |
| Xuất | Bấm "Xuất sao lưu" | Tải `kotoba-sao-luu-YYYY-MM-DD.json`, `lastBackupAt` được ghi | N/A |
| Nhập hợp lệ | File có `schemaVersion` ≤ hiện tại, đã xác nhận | Thay toàn bộ dữ liệu, chạy chuyển đổi nếu bản cũ | N/A |
| Nhập không hợp lệ | Không phải JSON, thiếu `schemaVersion`, hoặc phiên bản mới hơn app | Báo lỗi tiếng Việt | Giữ nguyên dữ liệu cũ |
| Huỷ nhập | Bấm "Huỷ" hoặc Esc | Không đổi gì | N/A |

</frozen-after-approval>

## Code Map

- `src/features/cai-dat/index.js` -- hiện là EmptyState có nút "Xem giới thiệu". Thay bằng màn Cài đặt thật, giữ đường tới Giới thiệu.
- `src/ui/components/bundle.css` -- `.kt-btn--primary/--secondary/--ghost/--sm`, `.kt-card`, `.kt-sechead`, `.kt-link`. Không có component hộp thoại, nên tự dựng bằng token.
- `src/architecture.test.js` -- thêm luật về `localStorage`.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/progress.js` -- `createProgress({ storage, now, events })` + `progress` mặc định. API: `get()`, `update(fn)`, `exportJson()`, `importJson(text)`, `markBackup()`, `backupFileName()`, `MIGRATIONS`, `CURRENT_VERSION`.
- [x] `src/ui/confirm-dialog.js` + `src/ui/app.css` -- hộp thoại xác nhận dùng chung, trả Promise<boolean>.
- [x] `src/features/cai-dat/index.js` + `cai-dat.css` -- màn Cài đặt: ngày sao lưu gần nhất, xuất, nhập, link Giới thiệu, vùng `role="status"`.
- [x] `src/core/progress.test.js`, `src/features/cai-dat/cai-dat.test.js`, `src/architecture.test.js` -- test các dòng của bảng I/O.

**Acceptance Criteria:**
- Given khổ 390px ở theme sáng và tối, when mở `#/cai-dat`, then màn khớp thiết kế và chỉ có một nút chính.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công.

## Implementation Notes

- Xuất sao lưu: tải file trước, sau đó mới ghi `lastBackupAt`, để tải lỗi thì không ghi nhầm ngày. File xuất ra cũng mang luôn ngày sao lưu đó.
- Dữ liệu trên máy là của phiên bản mới hơn thì không coi là hỏng: app tạm ngừng ghi (`writeBlocked`) để không ghi đè. Bản dữ liệu hỏng được giữ ở khoá có kèm thời điểm, nên lần hỏng sau không ghi đè lần trước. Nếu không giữ được bản hỏng thì app cũng tạm ngừng ghi.
- `confirmDialog` trả về Promise có thêm `.close()`. Khi hộp thoại đang mở, phần nền được đặt `inert`. Màn Cài đặt đóng hộp thoại khi bị unmount.
- Chụp màn hình bằng Playwright ở cả theme sáng và tối: không có lỗi console.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | cả 3 | File sao lưu sai hình dạng (thiếu hoặc sai kiểu `settings`/`kanji`) vẫn được nhập, sau đó lỗi khi ghi | high | patch: `normalize()` điền phần thiếu, từ chối sai kiểu |
| 2 | blind+vg | Dữ liệu của phiên bản mới hơn bị coi là hỏng và bị ghi đè | high | patch: `NewerVersionError` + `writeBlocked` |
| 3 | blind+edge | Bản hỏng bị ghi đè, hoặc không giữ được mà vẫn ghi tiếp | medium | patch: khoá kèm thời điểm, tạm ngừng ghi nếu không giữ được |
| 4 | blind+edge | `update` cho lỗi thoát ra ngoài, hoặc lưu giá trị không phải object | medium | patch |
| 5 | edge | Hàm chuyển đổi trả sai phiên bản thì lặp vô hạn | medium | patch: guard + test |
| 6 | edge | `markBackup` mất `this` khi gọi tách rời | low | patch |
| 7 | blind+edge+vg | Xuất khi bộ nhớ lỗi hoặc tải lỗi: báo sai, ghi nhầm ngày, lệch ngày quanh nửa đêm | medium | patch: một mốc `at`, tải trước rồi mới ghi |
| 8 | blind | Input file ẩn nằm trong thứ tự Tab | low | patch |
| 9 | blind+edge | Hộp thoại chưa thật sự modal, rời màn hình vẫn còn hộp thoại, listener rò | medium | patch: `inert`, `.close()`, guard `isConnected`, cleanup trong `mount` |
| 10 | blind | Màn Cài đặt không cập nhật khi tiến độ đổi | low | patch: lắng nghe `progress:changed` |
| 11 | blind | Không đồng bộ giữa nhiều tab | low | reject: Hannah dùng một máy, mở app từ màn hình chính |
| 12 | blind | Thông báo dữ liệu hỏng chỉ hiện ở màn Cài đặt | medium | defer: hiện thêm ở trang chủ (Story 2.4) |
| 13 | blind | Luật kiến trúc bỏ sót `sessionStorage`/`indexedDB` | low | defer: gộp vào mục deferred-work có sẵn |
| 14 | vg | Chưa test cách nối mặc định với `window.localStorage` và sự kiện | medium | patch |
| 15 | vg | Chưa test thông báo dữ liệu hỏng trên màn hình | medium | patch |
| 16 | vg | Chưa test lỗi lưu khi xuất/nhập ở giao diện | medium | patch |
| 17 | vg | Chưa test nút "Huỷ" | medium | patch |
| 18 | vg | Chưa test `downloadText` | medium | patch |
| 19 | blind | `main.test` không bấm link thật | low | patch |
