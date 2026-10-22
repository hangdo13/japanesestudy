# CourseProgressCard

Thẻ tiến độ khoá học: ô kỹ năng + tên, số phần trăm lớn, số bài đã học, thanh tiến độ chia đoạn theo màu kỹ năng.

Lấy từ: ba thẻ "Computer Science 54% · 16/20 Lessons" ở đầu dashboard (reference tablet) — đổi môn học thành kỹ năng ngôn ngữ.

## Giải phẫu
- `SkillTile` + tiêu đề `title-sm` + phụ đề `caption`.
- Số `%` dùng `kt-pct` (32px, chữ số đều `tabular-nums`), ký hiệu % nhỏ hơn.
- `SegmentedProgress` 20 đoạn, màu theo kỹ năng.

## Quy tắc
- Mỗi kỹ năng một màu cố định (xem README tổng) — người học nhận ra kỹ năng bằng màu trước khi đọc chữ.
- Chạm cả thẻ để vào khoá học; không cần thêm nút.
- Trên điện thoại cuộn ngang, mỗi thẻ rộng ~75% màn hình để lộ thẻ kế tiếp.
