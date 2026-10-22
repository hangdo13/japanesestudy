# SwipeButton

Nút CTA lớn của màn hình chào (onboarding): viên thuốc màu `primary` cao 60px, núm tròn trắng bên trái mang icon `chevrons-right`.

Lấy từ: nút "Get Started" màn hình onboarding (reference điện thoại).

## Quy tắc
- Chỉ dùng ở onboarding và màn hình kết thúc bài (ví dụ "Học tiếp"). Mọi chỗ khác dùng `Button`.
- Có thể làm thành thao tác vuốt, nhưng **chạm một lần cũng phải hoạt động** — người dùng không biết là cần vuốt.
- Đặt cách mép dưới `space-6`, rộng hết màn hình trừ lề `space-4`.
- Tiêu đề phía trên kết hợp chữ thường + **chữ đậm** (400 + 800) như reference.
- Màn chào đặt Pyon (`happy`, ~180px trên vòng `surface-tint`) phía trên tiêu đề; nhãn nút có thể nhắc tên Pyon ("Bắt đầu cùng Pyon").
