# Button

Nút bấm dạng viên thuốc (pill) — một nút `primary` tím lavender cho hành động chính của màn hình, nút `ai` xanh dương cho mọi thứ liên quan tới gia sư AI.

Lấy từ: nút "Get Started" / "Start with AI" và "Ask AI Tutor" trong hai reference — màu chuyển thành tím lavender `#917EFF` và xanh cornflower.

## Biến thể
| Class | Khi nào dùng |
|---|---|
| `kt-btn--primary` | Hành động chính: Bắt đầu học, Tiếp tục, Kiểm tra. **Tối đa 1 nút / màn hình.** Nền `primary-strong` #705AF2, chữ trắng `on-primary` (4.7:1). |
| `kt-btn--ai` | Mở gia sư AI, hội thoại AI. Luôn kèm icon `sparkles`. Nền `blue-strong` #3B6FE0, chữ trắng `on-blue` (4.6:1). |
| `kt-btn--secondary` | Hành động phụ đi cạnh primary: Xem lộ trình, Vào lớp. |
| `kt-btn--soft` | Hành động trong thẻ học: Lật thẻ, Nghe lại. |
| `kt-btn--ghost` | Bỏ qua, Để sau — hành động ít quan trọng. |
| `kt-btn--sm` | Cao 36px, dùng trong thẻ và danh sách. Mặc định cao 48px. |
| `kt-btn--block` | Rộng 100% — nút cuối màn hình làm bài. |

## Quy tắc
- Nhãn là động từ, 1–3 từ ("Bắt đầu", không phải "Nhấn vào đây để bắt đầu").
- Disabled dùng `surface-sunken` + `ink-muted`, không làm mờ bằng opacity.
- Vùng chạm tối thiểu 44px — với `--sm`, giữ khoảng cách `space-2` giữa các nút.

```html
<button class="kt-btn kt-btn--ai"><i data-icon="sparkles"></i>Hỏi gia sư AI</button>
```
