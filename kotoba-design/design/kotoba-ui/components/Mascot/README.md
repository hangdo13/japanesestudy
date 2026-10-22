# Mascot

Pyon (ぴょん) — linh vật chính thức của Kotoba: bé thỏ chibi buộc khăn hachimaki có hoa anh đào, mặc áo hanten hồng sakura thắt đai tím, ôm viên mochi và cầm lá cờ Nhật.

## Cách dùng

```html
<span class="kt-mascot" data-mascot="happy" data-size="120"></span>
<script>Kotoba.hydrate();</script>
```

`Kotoba.mascot(mood, { flag, petals })` trả về chuỗi SVG nếu cần tự chèn. Mỗi lần vẽ có id gradient riêng, nên đặt nhiều Pyon trên một trang không bị lẫn.

| Thuộc tính | Giá trị |
|---|---|
| `data-mascot` | `default` · `happy` · `think` · `oops` · `sleepy` · `celebrate` |
| `data-size` | Cạnh khung vuông, px (mặc định 120) |
| `data-flag="off"` | Ẩn lá cờ — khi Pyon đứng sát mép phải hoặc cạnh một nút |

Dưới 72px, cờ và hoa trên áo tự ẩn để hình không bị lấm tấm.

## Biểu cảm nào, ở đâu

| Mood | Dùng khi | Component |
|---|---|---|
| `default` | Lời chào, onboarding, icon app | `SwipeButton` (màn chào) |
| `happy` | Trả lời đúng, vuốt "Đã nhớ" | `QuizOption` (hộp phản hồi) |
| `think` | AI đang trả lời, gợi ý cá nhân | `AIHeroBanner`, `AIInsightCard` |
| `oops` | Trả lời sai, vuốt "Ôn lại" — phụng phịu, **không buồn** | `QuizOption` (`kt-feedback--wrong`) |
| `sleepy` | Danh sách trống, lâu không học | `EmptyState` |
| `celebrate` | Đạt mục tiêu, giữ chuỗi mốc 7 / 30 ngày | `GoalComplete` |

## Quy tắc
- **Tối đa một Pyon mỗi màn hình.** Pyon là điểm nhấn cảm xúc, không phải hoạ tiết lặp.
- Không đặt Pyon trên nền `primary-strong` hay `blue-strong`; nền phù hợp: `surface`, `surface-tint`, `sakura-soft`.
- Cỡ tối thiểu 48px; dưới 72px chỉ dùng cho huy hiệu và icon.
- Màu áo của Pyon là token `sakura` — màu nhân vật, không dùng cho chữ hay nút.
- Không xoay, lật ngược hay đổi màu Pyon; muốn khác thì đổi `mood`.
- SVG có `aria-hidden`; nghĩa phải nằm ở chữ đi kèm ("Đúng rồi!", "Hôm nay chưa có lớp").
