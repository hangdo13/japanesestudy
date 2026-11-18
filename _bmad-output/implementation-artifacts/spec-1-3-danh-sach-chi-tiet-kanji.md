---
title: 'Story 1.3: Xem danh sách và trang chi tiết kanji'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'f0df1bdbe0bfdd9f9b814ee9226375e1ba0b258a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/content/SCHEMA.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tab Kanji còn đang là màn "Sắp có". Hannah cần xem được 106 kanji và mở từng chữ để học theo cách hiểu.

**Approach:** `features/kanji` có hai màn. `#/kanji` là lưới SkillTile. `#/kanji/<chữ>` là trang chi tiết gồm âm Hán Việt, nghĩa, bộ phận, câu gợi nhớ, âm on/kun có nút phát, thứ tự nét (SVG KanjiVG nhúng thẳng vào trang để theo màu theme), ví dụ từ vựng và chữ dễ nhầm.

## Boundaries & Constraints

**Always:** đọc dữ liệu qua `core/content`. Markup theo preview của SkillTile, Chip, IconButton, SectionHeader, Card, CourseListItem (`kt-item--plain`), EmptyState. Toàn màn chỉ có một khối `kt-card--tinted` (phần đầu trang chi tiết). Chữ Nhật có `kt-jp` + `lang="ja"`. Màu chỉ lấy từ token. Nét SVG phải thấy rõ ở cả theme sáng và tối. Lỗi audio hiện thông báo tiếng Việt trong một vùng `role="status"`, màn hình không hỏng.

**Never:** không chấm nét viết tay, không lưu tiến độ (thuộc Story 1.4), không sửa `content/` hay `vendor/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lưới | `#/kanji` | 106 ô theo thứ tự bài học, mỗi ô có chữ, âm Hán Việt, chip "Chưa duyệt" nếu `draft`, là link tới `#/kanji/<chữ>` | N/A |
| Chi tiết | `#/kanji/日` | Có NHẬT, nghĩa, bộ phận, câu gợi nhớ, các âm có nút phát, SVG nét, ví dụ, chữ dễ nhầm (là link) | N/A |
| Phát âm | Bấm nút phát | Phát `assetUrl(audio)` | play() bị từ chối thì hiện "Không phát được âm thanh…" |
| Chữ lạ | `#/kanji/xyz` | EmptyState "Không tìm thấy chữ này" kèm nút về danh sách | N/A |
| SVG lỗi | Tải SVG thất bại | Hiện dòng "Chưa tải được hình thứ tự nét." | Không ném lỗi |

</frozen-after-approval>

## Code Map

- `src/core/content.js` -- `kanji()`, `kanjiById()`, `assetUrl()` (base mặc định là `/japanesestudy/`).
- `src/core/router.js` -- `toHash('kanji', chữ)`. Route `kanji` đã có, `param` là chữ đã giải mã.
- `src/ui/components/bundle.css` -- có sẵn `.kt-skill--lg/--kanji`, `.kt-chip--outline`, `.kt-card--tinted/--sunken`, `.kt-item--plain`, `.kt-flash__glyph` (88px, font JP), `.kt-sechead`, `.kt-iconbtn--xs`.
- SVG KanjiVG: nét dùng `stroke:#000000`, số thứ tự nét nằm trong `<text>`. Cần thay bằng `currentColor` hoặc CSS token.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/kanji/index.js` -- `mount` chọn màn lưới hoặc màn chi tiết theo `param`.
- [x] `src/features/kanji/list.js`, `src/features/kanji/detail.js` -- dựng hai màn.
- [x] `src/features/kanji/strokes.js` -- tải SVG, bỏ prolog/comment, nhúng vào trang, nét dùng token.
- [x] `src/features/kanji/kanji.css` -- lưới 3 cột (xem Spec Change Log) và khung SVG, chỉ dùng token.
- [x] `src/features/kanji/kanji.test.js` -- test các dòng của bảng I/O (jsdom, giả lập Audio và fetch).
- [x] `src/core/content.test.js` -- thêm test base mặc định của `assetUrl` (deferred từ 1.2).

**Acceptance Criteria:**
- Given khổ 390px ở theme sáng và tối, when mở `#/kanji/日`, then mọi phần đọc được, nét SVG thấy rõ, và khớp với preview của các component.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công.

**Manual checks (if no CLI):**
- Chụp màn hình bằng Playwright ở khổ 390px, cả hai theme, cho `#/kanji` và `#/kanji/日`.

## Implementation Notes

- SVG KanjiVG khai báo tiền tố `kvg:` trong DTD, nên trình phân tích XML của jsdom (và một số trình duyệt) báo lỗi. `cleanKanjiVg` bỏ DTD, prolog và comment, rồi khai báo lại `xmlns:kvg`.
- Chụp bằng Playwright ở khổ 390px, cả theme sáng và tối: không có lỗi console. Nét SVG dùng `currentColor`/`--ink` nên đọc rõ ở theme tối.
- `mount` của trang chi tiết trả về hàm dọn dẹp: dừng âm thanh và bỏ qua kết quả tải SVG đến muộn.

## Spec Change Log

- Phát hiện khi review (edge #6) và lúc chụp màn hình: với lưới 4 cột, chip "Chưa duyệt" tràn sang ô bên cạnh ở khổ 390px. Đã đổi task CSS thành **3 cột**. Tránh được việc chip đè lên nhau. KEEP: chip "Chưa duyệt" trên từng ô, đúng như AC.

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Xử lý |
|---|---|---|---|---|
| 1 | edge+blind | Bấm nhiều lần thì âm chồng lên nhau, lỗi đến muộn ghi đè trạng thái | medium | patch: `createPlayer` dừng âm cũ, dùng token |
| 2 | edge | Rời trang mà âm vẫn phát, SVG vẫn được điền vào | medium | patch: `mount` trả về hàm dọn dẹp |
| 3 | edge+blind | Regex DOCTYPE cắt nhầm khi không có internal subset | low | patch: sửa regex, thêm test |
| 4 | edge+blind | `aria-label` che mất trạng thái "Chưa duyệt" | medium | patch |
| 5 | edge+blind | Test để lại hash | low | patch: `afterEach` |
| 6 | edge | Lưới 3 cột trong khi spec ghi 4 cột | medium | bad_spec → đã sửa spec (xem Change Log) |
| 7 | blind | Thông báo lỗi luôn đổ cho mạng | low | patch: sửa câu chữ |
| 8 | blind | Lỗi lặp lại có thể không được đọc lại | low | reject: ít gặp, sửa thì cần thêm logic |
| 9 | blind | Style inline viết trong JS | low | patch: chuyển thành class trong `kanji.css` |
| 10 | blind | Ô không có style khi focus | false | `bundle.css` đã có `a:focus-visible` |
| 11 | blind | Nhãn hình nét viết chung chung, `role=img` khi còn rỗng | low | patch |
| 12 | blind+vg | Test `assetUrl` tự chứng minh chính nó | medium | patch: `vi.stubEnv('BASE_URL','/japanesestudy/')` |
| 13 | blind | Chưa test luồng router → chi tiết | medium | patch: thêm vào `main.test.js` |
| 14 | blind | Nhánh kun/thiếu trường ít được test | low | patch phần audio kun. Phần còn lại reject |
| 15 | blind | Tiêu đề và heading không đổi theo chữ | low | reject |
| 16 | blind | Chip "Chưa duyệt" lặp trên mọi ô | low | reject: đúng AC đã duyệt |
| 17 | vg | URL tải SVG chưa được kiểm tra | medium | patch |
| 18 | vg | Nhánh SVG không hợp lệ chưa có test | low | patch: thêm test |
