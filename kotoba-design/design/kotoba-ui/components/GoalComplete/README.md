# GoalComplete

Màn ăn mừng khi đạt mục tiêu: Pyon `celebrate` trên vòng `sakura-soft` có cánh hoa anh đào bay, tiêu đề lớn kèm "ぴょん", một câu tóm tắt thành quả, chip phần thưởng và nút "Tiếp tục".

## Giải phẫu
- `kt-goal__stage`: vòng 260px nền `sakura-soft`, 3–5 cánh hoa `kt-goal__petal` (màu `sakura`) đặt quanh viền, Pyon 200–220px ở giữa.
- `kt-goal__title` (26/800); phần "ぴょん" tô `sakura-ink`.
- `kt-goal__text`: số liệu thật của tuần — số ngày, số từ, số bài.
- `kt-goal__chips`: `kt-chip--rank` cho XP, `kt-chip--success` cho chuỗi.
- Một nút `kt-btn--primary kt-btn--block` duy nhất.

## Dùng khi
Đạt mục tiêu tuần, mốc chuỗi 7 / 30 / 100 ngày, hoàn thành một cấp JLPT. Không dùng cho mỗi bài học xong — khi đó chỉ cần hộp phản hồi của `QuizOption`.

## Quy tắc
- Đây là nơi duy nhất ngoài Pyon được dùng `sakura` làm mảng màu (nền vòng tròn, cánh hoa).
- Cánh hoa có thể rơi nhẹ (2–3 giây, rồi dừng); tắt khi `prefers-reduced-motion`.
- Kèm rung nhẹ (haptic) khi màn hiện ra.
