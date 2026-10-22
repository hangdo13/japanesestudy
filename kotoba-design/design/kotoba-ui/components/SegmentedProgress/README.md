# SegmentedProgress

Thanh tiến độ chia đoạn bo tròn — mỗi đoạn là một bài hoặc một câu hỏi; đoạn đã xong tô màu kỹ năng, còn lại `line-strong`.

Lấy từ: thanh nét đứt nhiều màu dưới các thẻ khoá học (reference tablet).

## Quy tắc
- Khoá học: 20 đoạn (làm tròn theo tỉ lệ). Trong bài làm: 1 đoạn = 1 câu, dùng `kt-seg--thick`.
- Đoạn chia rõ ràng giúp người học thấy "còn mấy câu nữa" — động lực tốt hơn thanh liền.
- Luôn có `role="progressbar"` + `aria-valuenow` / `aria-valuemax`.
