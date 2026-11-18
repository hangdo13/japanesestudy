# Review: tìm hai đơn vị tuân thủ mọi AD mà vẫn lệch nhau

**Kết luận:** có 2 lỗ hổng, đã vá.

1. **Trang chủ cần hiển thị cây, nhưng AD-2 cấm `features/home` import `features/tree`.** Nếu mỗi bên tự viết code tính độ cao và mức héo, ví dụ "7 ngày" tính từ ngày học cuối hay tính theo tuần lịch, thì trang chủ và màn hình cây sẽ hiện hai kết quả khác nhau.
   → Vá bằng AD-8: các luật tính toán dẫn xuất đặt ở `core/growth`, phần hiển thị dùng chung đặt ở `src/ui/`.
2. **Ôn tập phải hiển thị mọi loại thẻ (kanji, từ vựng, cách đọc, câu thi sai).** Nếu tính năng kanji và tính năng ôn tập mỗi bên tự vẽ thẻ kanji, hai nơi sẽ hiển thị khác nhau.
   → Vá bằng AD-8: component hiển thị thẻ theo từng loại đặt ở `src/ui/cards/`.
