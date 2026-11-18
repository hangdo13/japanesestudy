---
title: 'Story 7.4: Luyện phát âm: đếm phách và cặp âm'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'bec66cd1398653cbcfca61f1e6f3d43342eef5ef'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/content/SCHEMA.md'
  - '{project-root}/Lộ trình kiến thức tiếng Nhật N5.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Người Việt hay đọc thiếu phách (おばさん/おばあさん) và bỏ っ (きて/きって), làm đổi nghĩa. Lộ trình mục 3 yêu cầu bài đếm phách và bài nghe phân biệt cặp âm (FR23).

**Approach:** Màn `#/kana/phat-am` gồm: giải thích ngắn tiếng Việt (phách, nguyên âm, nguyên âm vô thanh, ん đổi cách đọc, âm r; AI soạn, nhãn chưa duyệt); bài **Đếm phách** (cho từ, chọn số phách, phản hồi có tách phách と・う・きょ・う); bài **Nghe cặp âm** (máy đọc một từ trong cặp, chọn từ đã nghe). Không có giọng đọc thì bài nghe bị khoá và có hướng dẫn tải giọng.

## Boundaries & Constraints

**Always:** Nội dung qua build-content → `content/kana-phat-am.json`, đọc qua `core/content`. Dùng `ui/quiz-session`. Chỉ token/component Kotoba UI. Tách phách là hàm thuần trong core, có test.

**Ask First:** Thu âm/audio thật thay TTS.

**Never:** Không chấm phát âm của người học (không ghi âm).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tách phách | とうきょう / きって / ジュース / しんぶん | と・う・きょ・う (4) / き・っ・て (3) / ジュ・ー・ス (3) / し・ん・ぶ・ん (4) | — |
| Đếm phách | 10 câu, 4 đáp án số liền nhau ≥1 | phản hồi hiện từ đã tách phách | — |
| Nghe cặp âm | có giọng | tự đọc 1 từ, 2 đáp án (cặp), nút Nghe lại | speak trả false → báo không phát được, vẫn cho chọn |
| Không có giọng | canSpeak false | nút bài nghe bị khoá + hướng dẫn tải giọng; giọng nạp muộn thì mở | — |
| Build | cặp trùng nhau / số phách bằng nhau mà không khác っ/dài / chữ lạ | báo lỗi, mã 1 | — |

</frozen-after-approval>

## Code Map

- `content-vi/kana-phat-am.json` -- giải thích + cặp âm
- `scripts/build-content.mjs` -- `buildKanaSounds`
- `src/core/mora.js` -- `splitMora`, `countMora`
- `src/core/content.js` -- `kanaSounds()`
- `src/features/kana/sounds.js` + route `phat-am`

## Tasks & Acceptance

- [x] Nội dung giải thích + ≥10 cặp âm
- [x] `splitMora` + test
- [x] Bài đếm phách, bài nghe cặp âm, màn kết quả
- [x] Route + liên kết từ bảng kana; SCHEMA.md

## Verification

- `npm test && npm run build` -- expected: thành công.
- Screenshot sáng/tối.

## Implementation Notes

- `speakJa` nhận thêm `onError` (bỏ qua lỗi canceled/interrupted) để báo khi trình duyệt không đọc được thật sự.
- Bài nghe: phát âm sau khi câu đã gắn vào trang (microtask), focus nút "Nghe lại" để trình đọc màn hình không đọc đáp án đè lên tiếng.

## Spec Change Log

- Luật cặp âm ở build: "khác số phách" được làm chặt thành "chỉ khác nhau ở っ hoặc trường âm" (so romaji) và không trùng cặp, đúng ý dòng Build của ma trận.

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Đếm phách bỏ sót từ có trường âm hiragana (きのう, とけい) | BH | patch: `hasLongVowel` |
| 2 | Vị trí đáp án đúng lệch với từ ngắn (2 phách: B 75%) | BH, ECH | patch: chọn vị trí đều trong các vị trí hợp lệ |
| 3 | Vùng status điền chữ trước khi gắn vào trang → không được đọc | BH | patch: phát âm trong microtask |
| 4 | Lỗi đọc thật (onerror) không được báo | BH | patch: `speakJa({ onError })` |
| 5 | Trình đọc màn hình đọc đáp án A đè tiếng bài nghe | BH | patch: focus "Nghe lại" |
| 6 | Chữ Nhật trong phản hồi/xem lại không có lang="ja" | BH | patch |
| 7 | "Không lên xuống giọng" sai (có trọng âm cao độ); so sánh r miền Nam | BH | patch nội dung |
| 8 | Build không chặn cặp trùng / cặp khác chữ chứ không chỉ khác っ/trường âm | BH, ECH, VG | patch: `differsByLength` + khoá cặp |
| 9 | splitMora nhận ー/っ/ん đứng đầu, っ cuối, ーー | BH, ECH | patch |
| 10 | doc/nghia không phải chuỗi hoặc toàn khoảng trắng vẫn qua | ECH | patch |
| 11 | Không dừng tiếng khi đóng phiên / ra kết quả | BH | patch |
| 12 | Mất giọng khi đang focus nút bài nghe → focus rơi | ECH | patch |
| 13 | SCHEMA.md thiếu kana-phat-am; hướng dẫn giọng chỉ có iPhone | BH, ECH, VG | patch |
| 14 | Thiếu test: kết quả/giải thích bài nghe khi sai, cả hai từ của cặp được đọc, nút nghe ví dụ, cleanup, mất giọng, main ghi/không ghi file | VG | patch: +14 test (279 tổng) |
| 15 | Hai lượt trộn cặp nối nhau có thể lặp cặp liền kề | ECH | defer |
| 16 | Bài đếm phách khi kho từ < 10 | ECH | reject: build ép dữ liệu đủ |
