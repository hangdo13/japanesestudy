---
title: 'Story 7.1: Bảng hiragana và katakana'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'a3b7b19a8f4e95250e9b386fb4758ba58b99917c'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/content/SCHEMA.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** App chưa có hai bảng chữ cái, trong khi lộ trình N5 yêu cầu học kana trước tiên (tuần 1–2).

**Approach:** Gom dữ liệu kana thành `content/kana.json` gồm 223 mục: cơ bản, đục, bán đục, ghép, katakana mở rộng, kèm romaji, ghi chú và cặp dễ nhầm. SVG nét viết lấy từ KanjiVG. Màn `#/kana` có hai tab Hiragana/Katakana. Màn `#/kana/<chữ>` hiện chữ lớn, romaji, phát âm (`speechSynthesis`), nét viết và chữ dễ nhầm. Tab "Luyện tập" thành trang mục lục các phần học.

## Boundaries & Constraints

**Always:** đọc nội dung qua `core/content`. Tính năng không import tính năng khác: thành phần dùng chung (nét SVG, phát âm TTS) chuyển vào `src/ui/`. Chỉ dùng token và component có sẵn. Chữ Nhật có `kt-jp` + `lang="ja"`. Romaji theo Hepburn (shi, chi, tsu, fu, ji). Máy không có giọng tiếng Nhật thì ẩn nút phát và hiện ghi chú.

**Never:** chưa làm bài luyện (Story 7.2). Không chấm nét viết tay.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bảng hiragana | `#/kana` | Tab Hiragana: lưới 5 cột 46 chữ cơ bản, rồi đục/bán đục, rồi ghép. Mỗi ô có chữ + romaji, link tới chi tiết | N/A |
| Bảng katakana | Chọn tab Katakana | Như trên, thêm phần mở rộng | N/A |
| Chi tiết | `#/kana/し` | Chữ lớn, "shi", ghi chú, nút phát âm, nét viết, chữ dễ nhầm | N/A |
| Chữ ghép | `#/kana/きゃ` | Hiện chữ và romaji, không có nét viết riêng | N/A |
| Không có giọng Nhật | `speechSynthesis` không có giọng ja | Ẩn nút phát, hiện ghi chú | N/A |
| Chữ lạ | `#/kana/abc` | EmptyState có nút về bảng | N/A |
| Build thiếu SVG | Chữ đơn không có file SVG | build-content dừng, in tên chữ | exit 1 |

</frozen-after-approval>

## Code Map

- `content-vi/kana.json` (đã sinh): `items[{id, script, romaji, nhom, hang, cot, ghiChu?}]`, `capDeNham[][]`, `reviewStatus`.
- `public/kana/svg/<chữ>.svg` (168 file KanjiVG, CC BY-SA 3.0).
- `src/features/kanji/strokes.js` → chuyển sang `src/ui/strokes.js`. `kanji/detail.js` import lại từ đó.
- `scripts/build-content.mjs` -- thêm `buildKana`, ghi `content/kana.json`.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/build-content.mjs` + test -- `buildKana(vi, fileExists)`.
- [x] `src/core/content.js` -- `kana()`, `kanaById()`, `kanaPairs(id)`.
- [x] `src/ui/strokes.js`, `src/ui/speech.js` -- nét viết và phát âm TTS dùng chung.
- [x] `src/features/kana/` -- bảng, chi tiết, CSS.
- [x] `src/features/luyen-tap/index.js` -- trang mục lục.
- [x] `src/core/router.js` -- route `kana` (tab luyen-tap).
- [x] `NOTICES.md`, `content/SCHEMA.md` -- cập nhật.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công.

## Implementation Notes

- Có 168 SVG kana lấy từ KanjiVG (commit 9d7220d) và đổi tên file theo chữ. Muốn tải lại thì chạy `scripts/fetch-kana-svg.sh`.
- `strokes.js` được chuyển sang `src/ui/` để kanji và kana dùng chung. Class CSS vẫn giữ tên `.kanji-strokes`.
- Lúc review, phần mở rộng được thêm 7 tổ hợp (ヴァ/ヴィ/ヴェ/ヴォ, イェ, デュ, フュ), nên tổng là 230 kana. Có thêm các cặp dễ nhầm giữa hiragana và katakana.
- Kiểm tra bằng Playwright ở khổ 390px, cả theme sáng và tối: không có lỗi console. Chromium chạy headless không có giọng đọc tiếng Nhật, nên màn hình hiện đúng thông báo hướng dẫn.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | blind | SVG kana không rõ nguồn và cách tạo | medium | patch: thêm `scripts/fetch-kana-svg.sh`, ghim commit |
| 2 | blind | Romaji trùng nhau (ぢ/じ, づ/ず, ウォ/ヲ) | low | patch: ghi chú trong data + SCHEMA. Story 7.2 sẽ không ra câu hỏi có 2 đáp án romaji trùng |
| 3 | blind | Katakana thiếu các ghi chú mà hiragana có | medium | patch |
| 4 | blind | Thiếu っ, ー và nguyên âm nhỏ | low | reject cho 7.1: thuộc Story 7.3 (quy tắc đọc) |
| 5 | blind | Phần mở rộng còn thiếu tổ hợp | low | patch: thêm 7 tổ hợp |
| 6 | blind | Chưa có cặp dễ nhầm giữa hai bảng, giữa kana và kanji | medium | patch phần giữa hai bảng. Phần kana và kanji: defer |
| 7 | blind+edge | SCHEMA chưa khớp dữ liệu (`cot` có thể null, `hang`, trường ở cấp gốc) | low | patch |
| 8 | blind+edge | `buildKana` kiểm tra lỏng (id, hang/cot, nhóm dễ nhầm, reviewStatus, NFC, trùng chữ giữa hai bảng) | medium | patch |
| 9 | blind | Không báo cho người học là nội dung chưa duyệt | low | patch: dòng ghi chú |
| 10 | blind | Dùng sai ARIA tab | low | patch: `aria-current` |
| 11 | blind | Heading phẳng; chưa có hướng dẫn cho Android/desktop | low | reject |
| 12 | blind+edge | `syncVoice` xoá mất thông báo lỗi phát | low | patch |
| 13 | blind | Mục lục ghi cứng "106" | low | patch |
| 14 | blind | Class `.kanji-strokes` vẫn mang tên kanji | low | reject: đổi tên tốn công mà không có lợi |
| 15 | edge | Hàng không liền nhau hoặc trùng ô | low | patch: build báo lỗi khi trùng ô |
| 16 | vg | Chưa test trường hợp giọng tải muộn | medium | patch |
| 17 | vg | Chưa test link từ Luyện tập sang Kana | medium | patch |
| 18 | vg | Chưa test tab được đánh dấu ở route kana | low | patch |
