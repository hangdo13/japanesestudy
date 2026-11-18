---
title: 'Story 2.2: Ôn 718 từ vựng N5 có phát âm'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'e2911aa5a5b0346881f1c367c332184d823ec7d6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/content/SCHEMA.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-2-1-on-kanji-fsrs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 718 từ N5 chưa có chỗ học và ôn trong app (FR8).

**Approach:** Build sinh `content/vocab.json` từ `n5_vocab.json` (giữ id `n5-xxxx`, thêm thứ tự chủ đề theo lộ trình 5.1). Màn `#/on-tap/tu-vung` gồm thẻ `vocab:<id>` đến hạn (≤20) rồi từ mới trong hạn mức ngày (mặc định 10, chỉnh trong Cài đặt), theo thứ tự chủ đề. Thẻ `ui/cards/vocab` trong Flashcard: kana trên, chữ lớn, mặt sau nghĩa + chip chủ đề, màu vocab; vuốt phải Đã nhớ (Good), trái Ôn lại (Again). Nút phát âm đọc bằng Web Speech `ja-JP`; tự đọc khi lật (bật mặc định, tắt được trong Cài đặt). Không có giọng: ẩn nút, ghi chú một lần.

## Boundaries & Constraints

**Always:** `core/srs` cho lịch; ghi qua `progress` (thêm khoá `tuVung`: `{ <id>: { gioiThieu: 'YYYY-MM-DD' } }`); `ui/quiz-session` + Flashcard; chỉ token/component Kotoba UI.

**Ask First:** Đổi nghĩa tiếng Việt trong n5_vocab.

**Never:** Không sửa n5_vocab.json bằng tay trong build.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Build | n5_vocab 718 từ | vocab.json 718 mục, id giữ nguyên, `doc` lấy cách đọc đầu (いい; よい → いい), `docKhac` giữ phần còn lại | id trùng / thiếu nghĩa → lỗi, mã 1 |
| Phiên | 3 thẻ đến hạn, hạn mức 10, đã học 4 từ mới hôm nay | 3 thẻ ôn + 6 từ mới | — |
| Từ mới | vuốt lần đầu | tạo thẻ `vocab:<id>` (Good/Again) + `tuVung[id].gioiThieu` | ghi lỗi → báo, làm tiếp |
| Phát âm | có giọng | nút đọc; lật thẻ thì tự đọc nếu bật | không giọng: ẩn nút + ghi chú |
| Không có gì | hết thẻ đến hạn và hết hạn mức | EmptyState | — |

</frozen-after-approval>

## Code Map

- `scripts/build-content.mjs` -- `buildVocab`
- `src/core/content.js` -- `vocab()`, `vocabById()`
- `src/core/vocab-review.js` -- hạn mức, từ mới hôm nay, thẻ đến hạn
- `src/ui/cards/vocab.js`
- `src/features/on-tap/` -- param `tu-vung`
- `src/features/cai-dat/` -- số từ mới/ngày, tự đọc khi lật
- `src/features/luyen-tap/` -- lối vào

## Tasks & Acceptance

- [x] vocab.json + SCHEMA + test build
- [x] core/vocab-review + test
- [x] ui/cards/vocab + màn ôn từ vựng + test
- [x] Cài đặt + hub

## Verification

- `npm test && npm run build`; screenshot sáng/tối.

## Implementation Notes

- Bước Flashcard tách ra `features/on-tap/flash.js` dùng chung cho kanji và từ vựng; vùng đọc khi lật thẻ là `app-sr-only` (không hiện chữ thừa dưới thẻ).
- "Ghi chú một lần" hiểu là một lần mỗi phiên.
- Phụ tố một chữ (お～, ～個) không đọc TTS (máy đọc thành tên chữ cái).

## Spec Change Log

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Giọng chỉ kiểm tra một lần lúc mở phiên (iOS/Chrome nạp muộn) | BH, ECH | patch: onVoicesChanged, kiểm tra lại khi đọc |
| 2 | Enter/Space trên nút phát âm bị deck nuốt thành lật thẻ | BH | patch: chặn ở capture khi đích là nút |
| 3 | Phiên qua nửa đêm ăn hạn mức ngày mai | BH, ECH | patch: ngày của phiên |
| 4 | "Cũng viết/đọc: よい, よい" | BH, ECH | patch: bỏ trùng |
| 5 | 伯父 đi với おじさん | BH | patch: chọn cách viết có đuôi kana khớp |
| 6 | Phụ tố một chữ đọc thành tên chữ cái; hai thẻ ～時 trùng nhãn | BH, ECH | patch: không đọc; nhãn deck kèm nghĩa |
| 7 | Nhãn nút phát âm lộ cách đọc trước khi lật | BH | patch |
| 8 | Nguồn rỗng sinh vocab.json rỗng | BH | patch: lỗi build |
| 9 | Hub giấu số thẻ > 20 | BH | patch: "…, mỗi phiên 20" |
| 10 | Báo lỗi không tự xoá; observer không ngắt, đọc thẻ cũ | ECH | patch |
| 11 | Dấu ； toàn khổ | ECH | patch |
| 12 | SCHEMA.md thiếu vocab.json / tuVung | ECH | patch |
| 13 | Thiếu test: thứ tự chủ đề, giới hạn 20, dữ liệu cũ thiếu tuVung, giữ lịch sử thẻ, mặt sau thẻ, đọc một lần, speak lỗi, main mã 1, EmptyState học hết, hub xong, dừng đọc khi rời | VG | patch: +17 test (348 tổng) |
| 14 | formatWhen trùng ở hai file | VG | defer |
