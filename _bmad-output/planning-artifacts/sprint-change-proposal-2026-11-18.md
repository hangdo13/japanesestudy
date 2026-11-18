---
title: 'Sprint Change Proposal: Kotoba phủ đủ lộ trình N5'
date: 2026-11-18
status: approved
approved_by: Hannah
---

# Sprint Change Proposal: phủ đủ lộ trình kiến thức N5

## 1. Vấn đề

Sau khi Epic 1 lên mạng, Hannah thấy app chưa có hai bảng chữ cái hiragana và katakana. Hannah yêu cầu app phải bao phủ **đầy đủ lộ trình N5** như tài liệu `Lộ trình kiến thức tiếng Nhật N5.md` có trong repo.

Nguyên nhân: brief và PRD chỉ ghi lại hai chỗ Hannah thấy khó nhất (kanji và cách đọc bất quy tắc). Lộ trình N5 có sẵn trong repo nhưng chưa được dùng làm nguồn yêu cầu.

## 2. Ảnh hưởng

| Mục lộ trình | Trạng thái trước thay đổi | Phần còn thiếu |
| --- | --- | --- |
| 2. Kana | Chưa có | Bảng hiragana và katakana, quy tắc đọc, nét viết |
| 3. Phát âm | Chưa có | Đếm phách, phân biệt cặp âm |
| 4. Kanji | 106 chữ | Thiếu 多 少 耳 魚 |
| 5. Từ vựng | Chỉ có ôn tập (Story 2.2) | Học từ mới theo chủ đề; số đếm, trợ số từ, thời gian, cách đọc đặc biệt |
| 6. Ngữ pháp | Chưa có | Trợ từ, です, chia động từ và tính từ, mẫu câu, bài tập |
| 7. Đọc hiểu | Chỉ có trong đề thi thử | Luyện đọc riêng, đọc kanji khi ẩn furigana |
| 7. Đề thi | Đề rút gọn, không bấm giờ | Đủ 14 dạng bài, chế độ thi thật có bấm giờ |
| Thứ tự học 12 tuần | Chưa có | Trang chủ dẫn bài học theo tuần |

- **Kiến trúc:** không cần đổi quyết định nào (AD-1 đến AD-9 vẫn giữ nguyên). Các tính năng mới đi theo đúng các tầng hiện có, nội dung mới đi qua `scripts/build-content.mjs`.
- **Code đã làm:** không phải bỏ đi. Epic 1 giữ nguyên, chỉ thêm 4 kanji.
- **Hạn 30/11:** không thể làm hết phạm vi mới trong 12 ngày.

## 3. Hướng xử lý (Direct Adjustment + chia mốc)

- Bổ sung yêu cầu FR20 đến FR32 vào PRD.
- Thêm 4 epic mới, mở rộng các epic 1, 2, 3 và 5.
- Thứ tự làm bám theo thứ tự học trong lộ trình:
  - **Mốc 30/11, ứng với tuần 1–6 của lộ trình:** Epic 7 (Kana & phát âm) → Epic 2 (ôn tập + từ vựng theo chủ đề) → Story 1.7 (4 kanji).
  - **Sau đó:** Epic 3 (số đếm, thời gian) → Epic 8 (Ngữ pháp) → Epic 9 (Đọc hiểu) → Epic 4 (Nghe) → Epic 5 (Thi thử 14 dạng) → Epic 10 (Lộ trình 12 tuần) → Epic 6 (Cây).

**Quyết định của Hannah (18/11/2026):**
1. Đồng ý chia mốc như trên.
2. Đề thi thử có hai chế độ. Chế độ **luyện**: rút gọn, không bấm giờ (giữ như cũ). Chế độ **thi thật**: đủ 14 dạng, bấm giờ 20/40/30 phút. `[GIẢ ĐỊNH]` Hannah đồng ý cả gói đề xuất, nên mình hiểu là làm cả hai chế độ.
3. Thêm 4 kanji 多 少 耳 魚 thành 110 chữ, giữ nguyên 7 chữ đang có.

## 4. Thay đổi chi tiết

- **PRD** (`prds/prd-japanesestudy-2026-11-18/prd.md`): thêm mục §4.9 đến §4.14 với các yêu cầu FR20–FR32; cập nhật §6 Phạm vi và §7 Thước đo.
- **Epics** (`epics.md`):
  - Thêm Story 1.7, 2.6, 3.3, 5.4.
  - Thêm Epic 7 (Kana & phát âm), Epic 8 (Ngữ pháp N5), Epic 9 (Đọc hiểu), Epic 10 (Lộ trình 12 tuần).
  - Cập nhật bản đồ FR.
- **Sprint status:** sinh lại bằng script; trạng thái các story đã làm vẫn giữ nguyên.

## 5. Bàn giao

Mức độ thay đổi: **Moderate**, cần sắp lại backlog. Phần dev tiếp tục bằng `bmad-build`, bắt đầu từ **Epic 7 Story 7.1**. Thay đổi được coi là thành công khi mọi mục trong lộ trình N5 đều có ít nhất một story phụ trách.
