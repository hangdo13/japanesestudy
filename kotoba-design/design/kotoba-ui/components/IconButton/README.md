# IconButton

Nút tròn chỉ có icon — menu, thông báo, quay lại, mở chi tiết (mũi tên chéo ↗), phát/tạm dừng.

Lấy từ: nút menu/chuông xám tròn và nút mũi tên ↗ trên thẻ thống kê (reference điện thoại); nút play vuông nhỏ trong danh sách khoá học (reference tablet).

## Biến thể
- Mặc định: nền `surface-sunken`, 44px — dùng trên nền trắng.
- `--surface`: nền trắng + `shadow-card` — dùng trên nền `bg` hoặc thẻ `surface-tint`.
- `--dark`: nền `primary` — đánh dấu mục quan trọng nhất trong danh sách (lớp sắp diễn ra).
- `--sm` 36px (mũi tên ↗ trong thẻ), `--xs` 28px bo `radius-sm` (play trong danh sách).
- `has-dot`: chấm đỏ `danger` báo có thông báo mới.

## Quy tắc
- Luôn có `aria-label` bằng tiếng Việt.
- Mũi tên ↗ nghĩa là "mở chi tiết"; mũi tên ‹ là "quay lại". Đừng dùng lẫn.
