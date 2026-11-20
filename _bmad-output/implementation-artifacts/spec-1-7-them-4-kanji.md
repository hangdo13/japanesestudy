---
title: 'Story 1.7: Thêm 4 kanji 多 少 耳 魚'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: '53bfd02695257c45b32b8bfe12b82344d6ad7c44'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/content/SCHEMA.md'
  - '{project-root}/Lộ trình kiến thức tiếng Nhật N5.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lộ trình mục 4 có 多 少 耳 魚 nhưng dữ liệu JLPTSuccess (106 chữ) không có, nên app thiếu 4 chữ có thể gặp trong đề (FR24).

**Approach:** `content-vi/kanji-extra.json` (AI soạn, `reviewStatus: "draft"`): âm on/kun, bộ phận, số nét, chữ dễ nhầm, Hán Việt, nghĩa, câu gợi nhớ, và `sauChu` (chữ đứng trước theo nhóm nghĩa của bảng mục 4: 耳 sau 口, 魚 sau 空, 多 少 sau 長). SVG lấy từ KanjiVG (cùng commit với kana). Build gộp thành 110 chữ, đánh lại `thuTu` 1–110. Âm đọc của 4 chữ không có file audio: `audio: null`, app phát bằng `speechSynthesis ja-JP`.

## Boundaries & Constraints

**Always:** Build báo lỗi (mã 1) khi chữ thêm thiếu trường, trùng chữ đã có, `sauChu` không tồn tại, hoặc thiếu SVG. Ví dụ lấy từ n5_vocab như các chữ khác.

**Ask First:** Thu âm audio thật cho 4 chữ.

**Never:** Không sửa dữ liệu vendor.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Build | 106 + 4 | content/kanji.json 110 chữ, 耳 ngay sau 口, 魚 sau 空, 多 少 sau 長 | — |
| Thiếu trường | kanji-extra thiếu cauGoiNho | lỗi, mã 1 | — |
| Phát âm | bấm nghe âm của 魚 | đọc bằng TTS ja-JP | không có giọng: báo |
| Học/ôn | gói kanji mới | 4 chữ xuất hiện đúng thứ tự, có thẻ ôn như chữ khác | — |

</frozen-after-approval>

## Code Map

- `content-vi/kanji-extra.json`, `public/kanji/svg/{多,少,耳,魚}.svg`
- `scripts/build-content.mjs` -- `buildKanji` gộp chữ thêm
- `src/features/kanji/{detail,learn}.js` -- phát TTS khi `audio` null

## Tasks & Acceptance

- [x] Dữ liệu + SVG
- [x] Build + test
- [x] Phát âm TTS + test

## Verification

- `npm test && npm run build`; screenshot chi tiết 魚.

## Implementation Notes

- 4 chữ mới: 耳 #45 (sau 口), 魚 #78 (sau 空), 多 #104, 少 #105 (sau 長). `thuTu` đánh lại 1–110; tiến độ lưu theo chữ nên không ảnh hưởng. Người đã học qua 口/空 sẽ gặp 耳/魚 ở gói kanji mới kế tiếp.
- Âm kun trong dữ liệu là gốc (すく), nên chữ thêm có `docNoi` → `tts` để giọng máy đọc cả từ (すくない, すこし, おおい).
- Trình phát kanji: dừng là huỷ cả giọng máy; chờ giọng nạp (tối đa 1,5 giây); lỗi khi đọc thì báo.
- Chữ dễ nhầm của chữ thêm được nối hai chiều (小↔少, 目↔耳, 名↔多).

## Spec Change Log

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Dừng trình phát không huỷ giọng máy (đọc tiếp sau khi rời trang/vuốt thẻ) | BH, ECH, VG | patch |
| 2 | iOS nạp giọng muộn: lần bấm đầu báo "không có giọng" | BH, ECH | patch: chờ voiceschanged tối đa 1,5 giây |
| 3 | Lỗi khi đọc không báo; token không chặn | BH, ECH | patch: onError + token |
| 4 | Câu gợi nhớ 少 sai (nói 小 bớt nét) | BH | patch nội dung |
| 5 | Giọng máy đọc gốc kun (すく, おお) vô nghĩa | BH | patch: docNoi/tts |
| 6 | Build crash khi on/kun là chuỗi; không kiểm katakana/hiragana; trùng trong file báo sai; deNham lạ bị nuốt | BH, ECH, VG | patch |
| 7 | sauChu nối nhau phụ thuộc thứ tự trong file | ECH, VG | patch: lặp tới khi không xếp thêm |
| 8 | Chữ dễ nhầm một chiều (小 không trỏ 少) | BH | patch |
| 9 | NOTICES chưa ghi SVG tải trực tiếp, chưa ghi đọc bằng giọng máy | BH | patch |
| 10 | Thiếu test: phát TTS trên trang thật, không giọng trên trang, nét viết, EmptyState 110, deNham, thẻ ôn cho chữ thêm | VG | patch: +6 test (468 tổng) |
| 11 | Bộ phận đầu 魚 viết ⺈ (KanjiVG dùng 𠂊) | BH | reject: 𠂊 thuộc CJK Ext B, nhiều máy thiếu phông |
