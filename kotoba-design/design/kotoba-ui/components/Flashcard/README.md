# Flashcard

Chồng thẻ ghi nhớ vuốt kiểu Tinder: vuốt phải là **Đã nhớ**, vuốt trái là **Ôn lại**, chạm để lật xem cách đọc, nghĩa và câu ví dụ — không có nút đánh giá.

Áp dụng phong cách của reference (thẻ trắng bo lớn, chip, segmented progress) cho tính năng riêng của app học ngôn ngữ.

## Giải phẫu
- **Đầu phiên** (`kt-session__head`): nút đóng, `SegmentedProgress` dày theo màu kỹ năng, đếm thẻ `4 / 10`.
- **Chồng thẻ** (`kt-deck`): thẻ trên cùng là phần tử **cuối** trong DOM; hai thẻ phía sau lùi xuống 14px và 28px, nhỏ lại, để người học thấy còn thẻ.
- **Thẻ** (`kt-flash`): chip kỹ năng, nút phát âm + lưu thẻ, chữ lớn `font-jp` 88px, kana phía trên, nghĩa phía dưới, câu ví dụ trong ô `surface-sunken`.
- **Dấu đóng** khi kéo: "ĐÃ NHỚ" (`green`, nghiêng trái) hiện dần khi kéo sang phải; "ÔN LẠI" (`line-strong`, trung tính, nghiêng phải) khi kéo sang trái.
- **Gợi ý** (`kt-swipe-hint`) dưới chồng thẻ: ‹ Ôn lại · Chạm để lật · Đã nhớ ›.

## Hành vi — `Kotoba.swipeDeck(deckEl, { onSwipe(dir, card) })`
- Kéo quá 28% bề rộng thẻ rồi thả → thẻ bay ra, thẻ sau tiến lên. Thả sớm hơn → thẻ bật về chỗ.
- Thẻ nghiêng theo hướng kéo (0.06°/px), dấu đóng mờ dần theo khoảng kéo.
- Chạm (không kéo) → lật (`is-revealed`). Mặt trước chỉ có chữ và dòng "Chạm để xem nghĩa".
- Bàn phím: → đã nhớ, ← ôn lại, Space/Enter lật. Chồng thẻ có `tabindex="0"` và `aria-label` mô tả các phím.
- `prefers-reduced-motion`: bỏ chuyển động bay, chỉ mờ dần.
- Hàm trả về `{ swipe('left'|'right'), flip(), reset(card), top() }` để app tự điều khiển.

## Quy tắc
- "Ôn lại" dùng màu trung tính, **không đỏ** — quên một từ là chuyện bình thường, không phải lỗi.
- Hai hướng vuốt nuôi thuật toán lặp lại ngắt quãng (SRS); đừng thêm hướng thứ ba (vuốt lên/xuống).
- Trên app thật, gắn thêm hành động trợ năng (VoiceOver custom actions / Android accessibility actions) "Đã nhớ" và "Ôn lại" cho người không vuốt được — thay cho hai nút đã bỏ.
- Nút phát âm tự đọc khi lật thẻ (có thể tắt trong cài đặt); nút trong thẻ không kích hoạt kéo.
