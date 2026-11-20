---
title: 'Story 2.3: Ghi lại thời gian học thực'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '8f4b8158c81f360875b08891d5d5a47babce9295'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-japanesestudy-2026-11-18/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Chưa có số phút học thực mỗi ngày (FR10) — cần cho trang chủ (2.4) và cây học tập sau này (AD-5).

**Approach:** `core/study-clock` là đồng hồ duy nhất. Tính năng gọi `activity()` khi lật thẻ, vuốt, chọn đáp án, phát âm. Thời gian được tính từ lần tương tác đầu tới **lần tương tác cuối** của một đợt; quá 60 giây không tương tác thì đợt kết thúc (không tính phần chờ). Ẩn app (`visibilitychange`) thì kết thúc đợt ngay, tính tới lúc ẩn nếu chưa quá 60 giây kể từ tương tác cuối. Số giây cộng vào `progress.hocGiay[YYYY-MM-DD]` (giờ trên máy) ít nhất mỗi 15 giây và khi kết thúc đợt; đoạn qua nửa đêm được chia đúng ngày.

## Boundaries & Constraints

**Always:** Chỉ `core/study-clock` đếm giờ (AD-5); ghi qua `progress`. Hàm cộng giây theo ngày là hàm thuần có test.

**Ask First:** Tính cả thời gian đọc trang chi tiết kanji (không có tương tác).

**Never:** Không màn nào tự đếm giờ.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Học 5' (tương tác mỗi 10"), nghỉ 3', học 2' | fake timers | ≈ 7 phút (±60") | — |
| Không tương tác 60" | đang đếm | dừng, không tính phần chờ | — |
| Ẩn app | đang đếm | dừng ngay, ghi | — |
| Qua nửa đêm | 23:59 → 00:01 | 60" cho ngày cũ, 60" cho ngày mới | — |
| Ghi lỗi | update trả ok:false | giữ số giây chưa ghi, thử lại lần sau | — |

</frozen-after-approval>

## Code Map

- `src/core/study-clock.js` (+ `splitByDay`)
- `src/core/progress.js` -- khoá `hocGiay`
- Gọi `activity()`: `features/kanji/learn.js`, `features/on-tap/*`, `features/kana/{practice,rules,sounds}.js`

## Tasks & Acceptance

- [x] study-clock + test fake timers
- [x] Nối vào các màn học/ôn
- [x] main.js khởi động đồng hồ (visibilitychange)

## Verification

- `npm test && npm run build`

## Implementation Notes

- Tương tác được tính: lật thẻ, vuốt, chọn đáp án, bấm "Tiếp tục", bấm nút nghe. Tự phát âm (không do người bấm) không tính.
- `ui/quiz-session` có `onActivity` (gọi khi trả lời và khi bấm Tiếp tục) để tính năng nối đồng hồ.
- Kết thúc đợt (ẩn app, rảnh, `pagehide`) thì làm tròn phần giây lẻ; giữa đợt ghi phần nguyên mỗi 15 giây.
- `normalize` lọc `hocGiay` hỏng (khoá không phải ngày, số âm/không phải số) từ bản sao lưu.

## Spec Change Log

## Review Triage Log

| # | Phát hiện | Nguồn | Quyết định |
|---|---|---|---|
| 1 | Màn học kanji mới không tính lật thẻ | BH, ECH, VG | patch |
| 2 | Quá 60 giây giữa hai câu thì mất cả đoạn; "Tiếp tục" không tính | BH | patch: tính "Tiếp tục"; giữ ngưỡng 60 giây theo AD-5 |
| 3 | Ẩn app tính tới lúc ẩn, rảnh thì tính tới tương tác cuối | BH | reject: đúng ý spec (ẩn app tính tới lúc ẩn nếu ≤ 60 giây) |
| 4 | Ghi mỗi 15 giây phát progress:changed | BH | reject: chỉ ghi khi có giây mới (sau tương tác mới) |
| 5 | Không nghe pagehide; phần lẻ mất | BH, ECH | patch |
| 6 | Đồng hồ máy lùi làm treo/mất | BH | patch |
| 7 | Rule AD-5 bỏ sót `+=`, chặn setInterval quá rộng | BH, ECH | patch: cấm chữ `hocGiay` ngoài study-clock/progress |
| 8 | Tự phát âm trong bài nghe tính là tương tác; vocab tính 2 lần | BH, ECH | patch |
| 9 | Ghi lỗi chỉ thử lại khi có giây mới; `ok` khác false bị coi là lỗi | ECH | patch |
| 10 | dispose để lại singleton chết | ECH | patch |
| 11 | hocGiay hỏng từ bản sao lưu | ECH | patch |
| 12 | Thiếu test: máy ngủ, ẩn khi đã rảnh, dữ liệu cũ, các nút nghe, lật/phát âm/Tiếp tục | VG | patch: +8 test (370 tổng) |
| 13 | Test tính năng dùng đồng hồ thật (singleton) | ECH, VG | defer |
| 14 | Dùng Date.now thay performance.now | BH | defer: đã xử lý chỉnh lùi; nhảy tới < 60 giây chấp nhận |
