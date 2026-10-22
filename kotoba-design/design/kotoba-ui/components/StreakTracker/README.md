# StreakTracker

Chuỗi ngày học trong tuần: số ngày lớn + ngọn lửa `peach` (trang trí, chữ "ngày học liên tiếp" mang nghĩa), bảy ô ngày với dấu tích xanh cho ngày đã học, vòng đang chạy cho hôm nay, vòng nét đứt cho ngày tới.

Lấy từ: "6 Days Learning Streak" với hàng Su–Sa (reference tablet).

## Trạng thái ngày
| Class | Hiển thị |
|---|---|
| `is-done` | Nhãn trắng, chấm `green` có dấu tích |
| `is-today` | Nhãn nền `green`, vòng tiến độ một phần |
| `is-future` | Nhãn viền nét đứt `line-strong` |

## Quy tắc
- Chuỗi phải "dễ tha thứ": cho 1 ngày nghỉ/tuần (đóng băng chuỗi) và nói rõ điều đó.
- Không dùng màu đỏ cho ngày bỏ lỡ — chỉ để trống.
