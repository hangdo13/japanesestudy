---
title: 'Story 7.2: Luyện nhận diện kana'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '1bf0a63bb6568277e95dc3578c83fdd6546718f9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/content/SCHEMA.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Có bảng kana rồi nhưng chưa luyện được. Hannah cần luyện đến khi nhìn chữ là đọc được ngay, và được ôn lại những chữ hay sai.

**Approach:** `#/kana/luyen` cho chọn bộ luyện: Hiragana/Katakana × (cơ bản, đục + bán đục, ghép), "Cặp dễ nhầm", và "Ôn chữ hay sai" nếu có thẻ đến hạn. Mỗi phiên 10 câu trắc nghiệm `QuizOption` gồm hai dạng: nhìn chữ chọn romaji, và nghe (hoặc đọc romaji nếu máy không có giọng) rồi chọn chữ. Có hộp phản hồi kèm Pyon. Chữ trả lời sai được tạo thẻ `kana:<chữ>` trong `core/srs` (bọc ts-fsrs 6.0.0). Story này dựng `core/srs`, vì Epic 7 giờ được làm trước Epic 2.

## Boundaries & Constraints

**Always:** đáp án sai lấy từ cùng bộ luyện, không bao giờ trùng romaji với đáp án đúng (ぢ/じ, づ/ず, ウォ/ヲ). Bộ "Cặp dễ nhầm" ưu tiên lấy chữ trong cùng nhóm làm đáp án sai. Trạng thái thẻ lưu trong `progress.srs[id]`, ngày giờ dạng ISO. Lịch ôn và việc dựng câu hỏi là hàm thuần, có test (dùng seed ngẫu nhiên). Markup QuizOption và Feedback theo đúng preview. Một Pyon trên màn. Máy không có giọng tiếng Nhật thì dạng câu nghe đổi thành "cho romaji, chọn chữ".

**Never:** không chấm nét viết. Chưa đếm thời gian học (Story 2.3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bộ luyện | Chọn "Hiragana cơ bản" | 10 câu từ 46 chữ, mỗi câu 4 đáp án khác romaji | N/A |
| Trả lời đúng | Chọn đúng | Ô đúng có ✓, Pyon `happy`, nút "Tiếp tục" | N/A |
| Trả lời sai | Chọn sai | Ô sai có ✕, hiện đáp án đúng, Pyon `oops`. Chữ đó được tạo hoặc cập nhật thẻ `kana:<chữ>` với điểm Again | Ghi lỗi thì vẫn cho làm tiếp, báo lỗi |
| Kết thúc | Làm xong 10 câu | Kết quả x/10, danh sách chữ sai, nút luyện lại | N/A |
| Ôn chữ hay sai | Có thẻ `kana:*` đến hạn | Bộ "Ôn chữ hay sai" hiện số thẻ. Trả lời đúng thì lịch ôn lùi xa (Good) | N/A |
| Không có giọng | `canSpeak` false | Không có câu nghe, thay bằng "romaji → chữ" | N/A |

</frozen-after-approval>

## Code Map

- `ts-fsrs@6.0.0` (đã cài): `await DefaultScheduler({ enableFuzz:false })`, `scheduler.newCard({now})`, `scheduler.review({card, grade, now})` trả `{card}`. Khi đọc lại từ JSON, `dueAt`/`lastReviewAt` phải đổi lại thành `Date`. Rating: Again=1, Good=3. Gói yêu cầu Node ≥24, nên CI chuyển sang Node 24.
- `src/core/progress.js` `normalize()` -- thêm `srs: {}`.
- QuizOption preview: `button.kt-option` > `.kt-option__key` + `.kt-option__text` + `i.kt-option__state`. Các trạng thái `is-correct`/`is-wrong`. Feedback: `.kt-feedback[--wrong]` > mascot 64 + `__body` + nút primary sm.

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/srs.js` + test -- `getScheduler()`, `reviewCard(stored, correct, now)`, `dueIds(srs, prefix, now)`.
- [ ] `src/core/progress.js` -- `srs` trong normalize.
- [ ] `src/core/kana-quiz.js` + test -- dựng câu hỏi (hàm thuần, rng truyền vào).
- [ ] `src/ui/quiz.js` -- `renderQuestion` và feedback theo markup QuizOption, dùng chung cho các bài trắc nghiệm sau này.
- [ ] `src/features/kana/practice.js` + CSS + route `#/kana/luyen`, link từ bảng chữ.
- [ ] `.github/workflows/deploy.yml`, `package.json` -- Node 24.

## Verification

**Commands:**
- `npm test && npm run build` -- expected: thành công.

## Implementation Notes

- Thẻ ôn kana lưu ở `progress.srs['kana:<chữ>']` (JSON của ts-fsrs, ngày dạng ISO). Chỉ tạo thẻ khi trả lời sai; trả lời đúng chỉ chấm khi chữ đã có thẻ và đến hạn.
- Ghi lịch ôn được xếp hàng tuần tự (`saving`), mỗi lần đọc thẻ mới nhất; màn chọn bộ chờ hàng ghi xong rồi mới đếm chữ đến hạn.
- Đáp án sai luôn cùng bảng chữ với chữ hỏi, khác âm (`soundKey`: を/お, ヲ/オ, ウォ cùng âm).
- Đổi theo yêu cầu của Hannah (18/11): nền chế độ sáng của Kotoba UI `--bg` #f6f5fd → #ffffff (tokens.json, tokens.css, manifest, theme-color).

## Spec Change Log

- Màn kết quả có hai nút: "Luyện lại" (cùng bộ; bộ ôn thì lấy lại danh sách đến hạn) và "Luyện bộ khác".

## Review Triage Log

3 agent review: Blind Hunter, Edge Case Hunter, Verification Gap.

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Bộ "Ôn chữ hay sai" / "Cặp dễ nhầm" trộn hai bảng chữ → đáp án sai khác bảng, lộ đáp án | BH, ECH, VG | patch: pool theo từng chữ (`sameScript`) |
| 2 | Câu nghe có thể có を và お (cùng tiếng) | BH | patch: `soundKey` |
| 3 | `canSpeak` chỉ đọc một lần; `speak` trả false thì câu nghe không trả lời được | BH, ECH | patch: kiểm tra lại mỗi phiên; đổi sang hỏi romaji |
| 4 | Bấm "Tiếp tục" hai lần nhảy câu | ECH | patch: khoá nút |
| 5 | Ghi thẻ chạy song song / bị bỏ khi thoát / picker đọc trước khi ghi xong | BH, ECH | patch: hàng ghi tuần tự, luôn ghi, picker chờ |
| 6 | Lỗi ghi hiện ở phần tử đã bị gỡ | ECH | patch: dòng trạng thái nằm ngoài phiên |
| 7 | Đúng một chữ chưa đến hạn vẫn chấm Good | BH | patch: chỉ chấm khi đến hạn |
| 8 | Bộ ôn >10 chữ lấy ngẫu nhiên thay vì quá hạn nhất | BH | patch: `ordered` |
| 9 | Thiếu nút luyện lại (spec) | ECH, VG | patch |
| 10 | Mất focus khi đổi câu; trạng thái đúng/sai không có chữ cho trình đọc màn hình | BH | patch: focus đáp án đầu / tiêu đề kết quả; chữ ẩn "(đáp án đúng)" |
| 11 | Thẻ hỏng (dueAt sai) kẹt mãi | BH | patch: coi như đến hạn, ôn lại làm thẻ mới |
| 12 | Không dừng giọng đọc khi rời màn | ECH | patch: `speechSynthesis.cancel()` trong cleanup |
| 13 | Thiếu test: lỗi ghi, thẻ ghi đúng chữ, bộ ôn, markup QuizOption, chống bấm 2 lần, route, ウォ/ヲ, không giọng, normalize srs | VG | patch: +19 test (187 tổng) |
| 14 | `pickDistractors` có thể trả <3 khi pool nhỏ | ECH | defer: mọi bộ hiện tại đủ lớn (test nhiều seed) |
| 15 | Live region tạo sẵn nội dung có thể không được đọc | BH | defer |
| 16 | Cặp dễ nhầm khác bảng chữ cùng romaji (へ/ヘ) không bao giờ làm đáp án sai | ECH | defer: cần dạng câu "chọn bảng chữ" |
