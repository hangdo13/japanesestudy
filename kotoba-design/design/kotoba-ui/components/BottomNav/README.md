# BottomNav

Thanh điều hướng dưới cho điện thoại: 4 tab + một nút tròn màu `primary` nổi ở giữa (FAB) cho hành động "Học ngay".

Lấy từ: tab bar "Home · Schedule · ● · Quizzes · Setting" (reference điện thoại).

## Giải phẫu
- Nền `surface`, bo `radius-xl`, `shadow-raised`.
- Tab: icon 22px + nhãn 11px. Tab đang chọn: chữ `ink`, nét icon đậm hơn, vạch `primary` 4px ở mép trên.
- FAB: 60px, `primary`, viền `surface` 4px, `shadow-fab` (bóng tím mờ chứ không xám).

## Quy tắc
- FAB luôn mở bài học tiếp theo — một chạm là học, không mở menu.
- Đúng 4 tab. Nhãn 1–2 từ.
- Trên tablet thay bằng `SideRail`.
