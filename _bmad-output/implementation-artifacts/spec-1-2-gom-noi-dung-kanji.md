---
title: 'Story 1.2: Gom nội dung kanji N5 với phần tiếng Việt do AI soạn'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '0ab04387a10aecbe1f4fdfcb671b1bbab717dfd0'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** App chưa có dữ liệu kanji. Story 1.3 và 1.5 cần một nguồn duy nhất, đúng schema, có đủ âm Hán Việt, nghĩa và câu gợi nhớ tiếng Việt cho 106 kanji N5.

**Approach:** Chép dữ liệu kanji, SVG thứ tự nét và audio đọc của JLPTSuccess (MIT) vào repo. AI soạn `content-vi/kanji.json`. Script `scripts/build-content.mjs` gom JLPTSuccess, `content-vi` và `n5_vocab.json` thành `content/kanji.json`. App chỉ đọc nội dung qua `core/content`.

## Boundaries & Constraints

**Always:** schema ghi trong `content/SCHEMA.md`. Mỗi kanji: `id` (chính chữ), `hanViet`, `nghia`, `cauGoiNho`, `boPhan`, `on`/`kun` (mỗi âm có `kana` và đường dẫn `audio`), `soNet`, `svg`, `viDu` (tối đa 3 từ trong `n5_vocab.json`, giữ id `n5-xxxx` và nghĩa tiếng Việt), `deNham` (chữ dễ nhầm, chỉ lấy chữ có trong 106 chữ), `thuTu`, `reviewStatus`. Script báo lỗi và thoát mã khác 0 khi thiếu `hanViet`, `nghia` hoặc `cauGoiNho`, khi file audio hoặc SVG không tồn tại, hoặc khi `content-vi` có chữ lạ. `npm run build`, `npm test` và `npm run dev` đều chạy `build:content` trước. Ghi công: `vendor/jlptsuccess/LICENSE` (MIT) và `NOTICES.md` của họ.

**Never:** không sửa tay `content/kanji.json` (file sinh ra, không commit). Tính năng không được đọc `vendor/`, `content-vi/` hay `n5_vocab.json` trực tiếp. Không chép phần dữ liệu JLPTSuccess không dùng tới.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Gom đủ | 106 chữ đủ trường | `content/kanji.json` có 106 mục theo thứ tự bài học | N/A |
| Thiếu tiếng Việt | Một chữ thiếu `cauGoiNho` | Script dừng, in tên chữ và trường thiếu | exit 1 |
| Thiếu audio | Đường dẫn audio không có file | Script dừng, in đường dẫn thiếu | exit 1 |
| Ví dụ từ vựng | Chữ không có ví dụ JLPTSuccess khớp `n5_vocab` | Lấy từ `n5_vocab` có chứa chữ đó | Không có từ nào thì `viDu` rỗng |
| Đọc nội dung | `content.kanjiById('日')` | Trả mục 日. Chữ không có thì trả `null` | N/A |

</frozen-after-approval>

## Code Map

- `/home/claude/ext/JLPTSuccess/N5/data/kanji.json` -- `entries[]`: `glyph`, `lesson_order`, `on`/`kun` (on là katakana), `radical_decomposition`, `stroke_count`, `stroke_order_svg`, `examples[{form,reading,gloss}]`, `lookalikes[]`.
- `.../N5/svg/kanji/<chữ>.svg` (106 file, CC BY-SA 3.0). `.../N5/audio/kanji/<chữ>-<on|kun>-<hiragana>.mp3` (259 file, đủ cho mọi âm).
- `n5_vocab.json` -- `words[]`: `id`, `word`, `reading`, `meaning_vi`, `kanji[]`. Có 9 chữ không khớp ví dụ JLPTSuccess (円 友 足 力 語 員 川 田 店), các chữ này lấy ví dụ qua `kanji[]`.
- `/tmp/kanji_vi.tsv` -- bản AI soạn: chữ, Hán Việt, nghĩa, câu gợi nhớ.

## Tasks & Acceptance

**Execution:**
- [x] `vendor/jlptsuccess/` -- chép `kanji.json`, `LICENSE`, `NOTICES.md`, ghi commit nguồn trong `SOURCE.md`.
- [x] `public/kanji/svg/`, `public/audio/kanji/` -- chép SVG và mp3.
- [x] `content-vi/kanji.json` -- 106 mục `{hanViet, nghia, cauGoiNho, reviewStatus:"draft"}` theo khoá chữ.
- [x] `scripts/build-content.mjs` -- gom, kiểm tra, ghi `content/kanji.json`. Export hàm thuần `buildKanji(sources, fileExists)` để test.
- [x] `content/SCHEMA.md` -- mô tả schema.
- [x] `src/core/content.js` -- `kanji()`, `kanjiById(id)`, `assetUrl(path)` (ghép `import.meta.env.BASE_URL`).
- [x] `package.json`, `.gitignore` -- script `build:content`, các hook `pre*`, bỏ qua `content/*.json`.
- [x] `scripts/build-content.test.js`, `src/core/content.test.js` -- test các dòng của bảng I/O.

**Acceptance Criteria:**
- Given repo sạch, when `npm run build`, then `content/kanji.json` được sinh trước rồi app build thành công.

## Verification

**Commands:**
- `npm run build:content && npm test && npm run build` -- expected: thành công.

## Implementation Notes

- Hannah bảo "làm hết epic 1", nên spec này được coi là đã duyệt mà không dừng ở checkpoint.
- `content/*.json` không commit. Các hook `predev`/`prebuild`/`pretest` sinh lại file này. `vendor/jlptsuccess/kanji.json` chỉ giữ các trường Kotoba dùng.
- 3 chữ chưa có ví dụ trong `n5_vocab` (力, 員, 田), nên `viDu` của chúng rỗng.
- `main(root)` trả về mã thoát để test được.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | blind | Âm Hán Việt của 読 ghi sai là ĐỌC | medium | patch: sửa thành ĐỘC |
| 2 | blind | Câu gợi nhớ tả sai bộ phận (五, 社, 六, 書) | medium | patch: viết lại |
| 3 | blind | Câu gợi nhớ không nhắc nghĩa khó (安 = rẻ, 高 = đắt, 分, 社) | medium | patch: bổ sung |
| 4 | blind | Test bắt mọi chữ là `draft`, sẽ hỏng khi duyệt | medium | patch: cho phép `draft` hoặc `approved` |
| 5 | blind+edge | Không kiểm tra dữ liệu vendor (trùng, `lesson_order`, `stroke_count`, đủ 106, Hán Việt viết hoa) | medium | patch: thêm các kiểm tra |
| 6 | blind | Âm kun mất okurigana (ひと thay vì ひと・つ) | medium | defer: `okurigana_cuts` gắn theo từ, không theo từng âm kun. Story 1.3 hiện ví dụ từ vựng đầy đủ |
| 7 | blind+edge | Cùng cách viết có nhiều từ, ví dụ 一日 (いちにち / ついたち) | medium | patch: chọn theo cách đọc của ví dụ |
| 8 | blind | Ví dụ dự phòng theo thứ tự kana | low | reject: có ví dụ là đủ, xếp hạng cần thêm logic |
| 9 | blind+edge | Sửa content-vi lúc chạy dev không tự cập nhật. `npx vitest` trên bản clone mới bị lỗi import | low | reject: dùng `npm test`/`npm run dev` |
| 10 | blind | Test phụ thuộc thư mục đang đứng (cwd) | low | patch: dùng đường dẫn tính từ ROOT |
| 11 | blind+edge | Chỉ đóng băng nông | low | patch: `deepFreeze` |
| 12 | blind | SCHEMA thiếu thông tin | low | patch |
| 13 | blind | Test kana chỉ có 2 đầu vào | low | reject: build đã kiểm tra mọi file audio tồn tại |
| 14 | blind | `content-vi` thiếu dòng trống cuối file | low | patch |
| 15 | edge | `assetUrl` với dấu `/` đầu hoặc thiếu `import.meta.env` | low | reject: chưa có chỗ nào gọi |
| 16 | edge | JSON nguồn lỗi sinh stack trace thô | low | patch: bắt lỗi trong `main` |
| 17 | vg | Nhánh `exit 1` của `main()` chưa được test | medium | patch: `main(root)` trả mã thoát, test bằng thư mục mẫu |
| 18 | vg | Thứ tự ưu tiên ví dụ chưa được ghim | medium | patch: so khớp chính xác `viDu` của 日 |
| 19 | vg | `boPhan`/`soNet`/`deNham`/`svg` chưa được kiểm tra | medium | patch: thêm kiểm tra cho 日 và test lọc `deNham` |
| 20 | vg | Test thứ tự không phát hiện được khi bỏ `sort` | medium | patch: đảo ngược đầu vào |
| 21 | vg | Chưa test `reviewStatus` sai | low | patch |
| 22 | vg | Chưa test base mặc định của `assetUrl` | low | defer: sang Story 1.3, nơi đầu tiên gọi hàm này |
| 23 | vg | Vendor giữ khoảng 60 trường không dùng, trái với "Never" của spec | medium | patch: chỉ giữ các trường cần dùng |
| 24 | vg | Diff không gồm `public/` và `vendor/` | false | Các file này được stage và commit cùng |
