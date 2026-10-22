# EmptyState

Khối trống có Pyon ngủ gật, một tiêu đề nói rõ trạng thái, một câu gợi việc làm được ngay, và một nút phụ — thay cho màn hình trắng trơn.

## Giải phẫu
- `kt-empty`: thẻ `surface`, viền `line`, căn giữa.
- Pyon `sleepy` 96–120px.
- `kt-empty__title` (16/700): nói trạng thái ("Hôm nay chưa có lớp", "Chưa có từ đã lưu").
- `kt-empty__text` (14, `ink-muted`): một câu gợi ý hành động nhỏ.
- Một `kt-btn--soft kt-btn--sm` — không dùng nút `primary` ở màn trống.

## Dùng ở đâu
Lịch học trống, danh sách từ đã lưu trống, chưa có thành tích, tìm kiếm không có kết quả (đổi Pyon sang `think`), lâu không học (`sleepy` + "Quay lại học 5 phút nhé?").

## Quy tắc
- Không trách người học ("Bạn chưa học gì cả!"); giọng nhẹ nhàng, rủ rê.
- Gợi ý phải nhỏ và cụ thể: 5 phút, 5 từ, 1 bài.
