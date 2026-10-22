# AgendaList

Lịch trong ngày dạng danh sách dọc cho điện thoại: cột giờ bên trái, đường nét đứt mỗi mốc giờ, thẻ sự kiện trắng có chấm màu kỹ năng. Khoảng trống không có lớp được đánh dấu bằng đường đỏ có chú thích.

Lấy từ: màn "Calendar · My Schedule" với dòng "You've no Courses from 12:00 PM to 02:00 PM" (reference điện thoại).

## Quy tắc
- Thẻ sự kiện bắt đầu lệch giờ (ví dụ 11:00 trong mốc 10:00) thì thụt vào bằng `--indent`.
- Khoảng trống ≥ 1 giờ hiển thị `kt-gap` — gợi ý chèn bài ôn 5 phút vào đó.
- Đặt `DateStrip` phía trên danh sách.
