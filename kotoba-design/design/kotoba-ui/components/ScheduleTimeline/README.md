# ScheduleTimeline

Lịch trong ngày dạng trục ngang cho tablet: viên giờ trên cùng, đường kẻ dọc nét đứt, sự kiện là thẻ màu kỹ năng gắn chấm lên đường giờ. Giờ hiện tại là viên `primary`.

Lấy từ: khối "My Schedule" có viên "03:00 pm" đen (reference tablet).

## Quy tắc
- Mỗi sự kiện mang màu kỹ năng của nó (`kt-ev--vocab`, `--grammar`, `--kanji`, `--speaking`).
- Sự kiện đang diễn ra thêm `is-live` (viền màu kỹ năng).
- Sự kiện xếp so le theo hàng để không đè lên nhau; vị trí ngang = giờ bắt đầu.
- Điện thoại dùng `AgendaList` thay vì trục ngang.

Lưu ý: reference dùng vạch màu ở cạnh trái thẻ; ở đây thay bằng chấm tròn trên đường giờ — gọn hơn và nói rõ "bắt đầu lúc này".
