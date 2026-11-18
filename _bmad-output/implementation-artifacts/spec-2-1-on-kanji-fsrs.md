---
title: 'Story 2.1: Ôn kanji theo lịch FSRS, 3 chiều'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '27fe5ad0f0a2aa7d2d59d92b4a33b765c4045c48'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-japanesestudy-2026-11-18/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Kanji đã "giới thiệu" (Story 1.5) chưa bao giờ được ôn lại, nên sẽ quên (FR3, FR7).

**Approach:** Mỗi kanji đã giới thiệu có 3 thẻ FSRS trong `progress.srs`: `kanji-nghia:<chữ>` (Flashcard: nhìn chữ, lật xem nghĩa, vuốt phải Đã nhớ = Good, trái Ôn lại = Again), `kanji-doc:<chữ>` (trắc nghiệm: chọn cách đọc), `kanji-chu:<chữ>` (trắc nghiệm: nhìn Hán Việt + nghĩa, chọn chữ; đáp án sai ưu tiên chữ dễ nhầm). Thẻ sinh khi bấm "Đã học xong" ở 1.5, và bù cho kanji giới thiệu trước đó khi mở màn ôn. Màn `#/on-tap/kanji` ôn các thẻ đến hạn (sớm nhất trước, tối đa 20/phiên).

## Boundaries & Constraints

**Always:** Lịch qua `core/srs` (AD-6); ghi qua `progress`; ghi tuần tự. UI: Flashcard (swipeDeck, phím ← → Space), QuizOption + Feedback (`ui/quiz`), SegmentedProgress `kt-seg--kanji`, GoalComplete, EmptyState (AD-9).

**Ask First:** Thêm nút "Đã nhớ / Ôn lại" hiện trên màn (README Flashcard bỏ hai nút).

**Never:** Không dùng màu đỏ cho "Ôn lại". Không tự đếm giờ (đó là 2.3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Học xong gói | bấm "Đã học xong" 5 chữ | 15 thẻ mới, đến hạn ngay | ghi lỗi → báo, vẫn hiện GoalComplete |
| Dữ liệu cũ | kanji có gioiThieu nhưng chưa có thẻ | mở màn ôn → bù đủ 3 thẻ | — |
| Có thẻ đến hạn | 12 thẻ | phiên 12 bước, đếm `1 / 12` | — |
| Thẻ nghĩa | vuốt phải / trái / phím → ← | Good / Again, sang thẻ sau | — |
| Thẻ đọc/chữ | chọn đáp án | phản hồi Pyon happy/oops, Good/Again | — |
| Hết thẻ | xong phiên | GoalComplete có số thẻ đã ôn | — |
| Không có thẻ đến hạn | mở màn | EmptyState kèm lúc đến hạn kế tiếp nếu có | — |
| Thẻ của kanji không còn trong nội dung | id lạ | bỏ qua | — |

</frozen-after-approval>

## Code Map

- `src/core/kanji-review.js` -- loại thẻ, thẻ còn thiếu, thẻ đến hạn, dựng câu hỏi đọc/chữ
- `src/features/kanji/learn.js` -- sinh thẻ khi học xong
- `src/features/on-tap/` -- route `#/on-tap/kanji`
- `src/core/router.js`, `src/main.js` -- route mới

## Tasks & Acceptance

- [x] core/kanji-review + test (đúng → hạn xa hơn sai đã có ở srs.test)
- [x] Sinh thẻ ở learn + bù thẻ cũ
- [x] Màn ôn trộn Flashcard và trắc nghiệm; kết thúc GoalComplete; EmptyState
- [x] Liên kết từ hub Luyện tập và danh sách Kanji

## Verification

- `npm test && npm run build`; screenshot sáng/tối.

## Implementation Notes

- Thẻ đọc hỏi cách đọc **từ ví dụ đầu tiên** của chữ (食べる → たべる), vì âm kun trong dữ liệu chỉ là gốc (食 → た). Chữ không có từ ví dụ (力 員 田) hỏi âm on, đáp án sai cũng là âm on.
- Ba thẻ của một chữ được giãn ngày lúc tạo (nghĩa: hôm nay, đọc: +1, chữ: +2), và mỗi phiên chỉ lấy một thẻ mỗi chữ, để thẻ này không lộ đáp án thẻ kia.
- `ui/quiz-session` nhận bước tự dựng (`render(answer)`) cho Flashcard; focus câu đầu đợi phiên gắn vào trang (sửa luôn lỗi mất focus ở màn quy tắc/phát âm); bước có thể tắt tự focus (`autoFocus: false`).
- `reviewCard` làm lại thẻ mới khi ts-fsrs từ chối thẻ thiếu trường.

## Spec Change Log

- "Ôn lại / Đã nhớ / Chạm để lật" dưới thẻ thành nút bấm được (giữ nguyên giao diện gợi ý), cho người không vuốt được (WCAG 2.5.7). Không thêm nút mới nổi bật.
- Thẻ đọc hỏi cách đọc từ ví dụ thay vì âm kun gốc (xem Implementation Notes).

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Thẻ đọc có thể có 2 đáp án đúng (女: め, 五: ゴ…) | BH, ECH | patch: loại đáp án trùng mọi cách đọc của chữ, so sau khi đổi katakana→hiragana |
| 2 | Âm kun là gốc (食 → た) | BH | patch: hỏi cách đọc từ ví dụ |
| 3 | 3 thẻ một chữ cùng phiên, lộ đáp án nhau | BH | patch: giãn ngày + một thẻ/chữ/phiên |
| 4 | Giữ phím mũi tên trả lời liền nhiều thẻ | BH | patch: bỏ qua phím lặp |
| 5 | Chỉ vuốt/phím mới chấm được thẻ | BH | patch: gợi ý thành nút |
| 6 | Lật thẻ không được đọc; deck không có role | BH | patch: role=group + thông báo khi lật |
| 7 | ensureKanjiCards lỗi ở màn ôn: kẹt "Đang chuẩn bị" / EmptyState sai | ECH, VG | patch |
| 8 | Lỗi tạo thẻ khi "Đã học xong" bị nuốt | BH, ECH, VG | patch: báo ở status dưới GoalComplete |
| 9 | Thẻ đọc/chữ không dựng được câu bị chấm như thẻ nghĩa | ECH | patch: bỏ khỏi phiên |
| 10 | Hub ghi số thẻ > 20 mỗi phiên | BH, ECH | patch: "…, mỗi phiên 20" |
| 11 | Thiếu link từ danh sách Kanji | ECH, VG | patch |
| 12 | Focus câu đầu mất vì phiên chưa gắn vào trang (cả màn 7.3/7.4) | phát hiện khi viết test | patch |
| 13 | Thiếu test: tạo 15 thẻ, lỗi ghi, giới hạn 20, swipeDeck thật, hướng Good/Again của trắc nghiệm, bước render, route main | VG | patch: +14 test (312 tổng) |
| 14 | Phiên vẫn tiến khi rời màn giữa lúc thẻ bay | ECH | reject: vô hại, thẻ đã trả lời vẫn được lưu |
