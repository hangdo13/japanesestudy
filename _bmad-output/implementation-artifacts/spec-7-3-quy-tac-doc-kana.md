---
title: 'Story 7.3: Quy tắc âm ngắt, trường âm và đọc trợ từ'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'bc9871b67cd471b8ae73dabf6b85e67e539ccd64'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/content/SCHEMA.md'
  - '{project-root}/Lộ trình kiến thức tiếng Nhật N5.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Hannah biết từng chữ kana nhưng chưa có chỗ học và luyện các quy tắc đọc đặc biệt (lộ trình mục 2.4): っ nhỏ, trường âm, ー, は/へ/を khi làm trợ từ, katakana mở rộng. Đọc sai những chỗ này làm sai nghĩa (FR22).

**Approach:** Màn `#/kana/quy-tac` có 5 mục giải thích tiếng Việt (AI soạn, nhãn "chưa duyệt") kèm ví dụ nghe được. Có bài "Luyện đọc từ": nhìn từ (kana) chọn romaji đúng trong 4 đáp án. Đáp án sai được sinh bằng cách làm sai đúng chỗ quy tắc (bỏ っ, rút ngắn trường âm, đọc trợ từ theo mặt chữ). Từ lấy từ `n5_vocab.json`; romaji tính lúc build.

## Boundaries & Constraints

**Always:**
- Nội dung đi qua `scripts/build-content.mjs` → `content/kana-quy-tac.json`, đọc qua `core/content`.
- UI chỉ dùng component và token Kotoba UI (AD-9). Câu hỏi dùng `ui/quiz.js`.
- Romaji: Hepburn, trường âm viết đôi chữ (okaasan, gakkou, koohii); っ nhân đôi phụ âm (kitte, matcha → "tch").

**Ask First:** Thêm SRS cho bài đọc từ.

**Never:** Không sửa n5_vocab.json. Không tự đánh dấu nội dung là đã duyệt.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở trang | `#/kana/quy-tac` | 5 mục: âm ngắt, trường âm hiragana, ー katakana, trợ từ は/へ/を, katakana mở rộng; mỗi mục có ví dụ (chữ, romaji, nghĩa, nút nghe khi có giọng) | Không có giọng thì ẩn nút nghe |
| Luyện đọc từ | bấm "Luyện đọc từ" | 10 câu, 4 đáp án romaji khác nhau, có câu trợ từ | — |
| Đáp án sai | từ きって | có "kite" (bỏ っ) | Không đủ biến thể quy tắc thì bù bằng biến thể khác, luôn đủ 4 |
| Từ có chữ lạ | reading có ～ / ; / chữ không có trong bảng kana | Bỏ qua lúc build | — |
| Build | mục thiếu ví dụ / romaji sai kiểu | build-content báo lỗi, không ghi file | thoát mã 1 |

</frozen-after-approval>

## Code Map

- `content-vi/kana-quy-tac.json` -- 5 mục + câu trợ từ (AI soạn, draft)
- `scripts/build-content.mjs` -- `romanize`, `buildKanaRules`, ghi `content/kana-quy-tac.json`
- `src/core/content.js` -- `kanaRules()`
- `src/core/reading-quiz.js` -- `wrongReadings`, `buildReadingSession`
- `src/features/kana/rules.js` + route `quy-tac` trong `features/kana/index.js`

## Tasks & Acceptance

- [x] Nội dung 5 mục + ≥8 câu trợ từ có đáp án sai soạn sẵn
- [x] `romanize` + chọn từ luyện (っ/ッ, ー, trường âm) từ n5_vocab; test
- [x] `wrongReadings` sinh biến thể sai theo quy tắc; test luôn đủ 3, khác nhau, khác đáp án đúng
- [x] Màn quy tắc + luyện đọc 10 câu + kết quả; liên kết từ bảng kana
- [x] SCHEMA.md cập nhật

## Verification

- `npm test && npm run build` -- expected: thành công.
- Screenshot sáng/tối màn quy tắc và câu luyện.

## Implementation Notes

- Khung phiên trắc nghiệm tách ra `ui/quiz-session.js` (dùng cho bài đọc từ). Màn luyện kana 7.2 và học kanji 1.5 chưa chuyển sang (deferred).
- Từ quá ngắn không sinh đủ 3 đáp án sai có nghĩa (ああ, どう…) bị loại khỏi phiên thay vì bù chữ vô nghĩa.
- Đáp án sai thêm loại "đổi đục/trong" (tokei → dokei) làm nguồn bù.

## Spec Change Log

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | えい không được tính là trường âm (とけい, せんせい bị bỏ) | BH, ECH, VG | patch: thêm `ei` vào readingKinds và shorten |
| 2 | Đáp án sai "wo" mâu thuẫn với bảng kana (を = wo) | BH | patch: đổi đáp án sai; giải thích thêm về cách ghi "wo" |
| 3 | Đáp án sai bù kiểu "aaau", "kyuuuu" vô nghĩa | BH | patch: bù bằng đổi đục/trong; từ không đủ 3 đáp án có nghĩa bị loại khỏi phiên |
| 4 | lengthen nhân đôi u của ou / i của ei | BH | patch |
| 5 | "gakko", "kyo" quen thuộc (bỏ macron) | BH | patch: dòng giải thích ou/ei khi phản hồi |
| 6 | Romaji câu trợ từ không được kiểm khi build | BH, ECH, VG | patch: `romanizeSentence` + so sánh |
| 7 | Không ép ≥8 câu trợ từ, mục lạ/trùng, phần tử null làm crash | ECH | patch |
| 8 | SCHEMA.md chưa cập nhật | ECH, VG | patch |
| 9 | Động từ đuôi う (すう) bị coi là trường âm | ECH | patch |
| 10 | Phiên ngắn khi ít từ / thiếu loại | ECH | patch: build ép mỗi loại ≥5 từ |
| 11 | wrongReadings('') sinh "undefined" | ECH | patch |
| 12 | Focus rơi về đầu trang khi đóng phiên | BH | patch: focus nút "Luyện đọc từ" |
| 13 | Nhãn nút nghe trộn tiếng Nhật không có lang | BH | patch: "Nghe ví dụ N: romaji" |
| 14 | Thiếu test: ưu tiên lỗi đúng quy tắc, lỗi build từng loại, không ghi file khi lỗi, romanize biên, readingKinds kết hợp, phiên ít dữ liệu, quiz-session | VG | patch: +15 test (237 tổng) |
| 15 | romanize('を') = "wo" | BH | reject: đúng với bảng kana; câu trợ từ đi qua romanizeSentence |
| 16 | Nhãn "chưa duyệt" so sánh khác index.js | ECH | defer |
| 17 | practice.js / learn.js chưa dùng quiz-session | VG | defer |
| 18 | quiz-session với 0 câu | ECH | defer: build đảm bảo đủ dữ liệu |
