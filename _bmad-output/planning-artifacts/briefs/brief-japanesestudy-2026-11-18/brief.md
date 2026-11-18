---
title: "Product Brief: Kotoba"
status: final
created: 2026-11-18
updated: 2026-11-18
---

# Product Brief: Kotoba

## Tóm tắt

Kotoba là app học tiếng Nhật mà Hannah làm cho chính mình, để tự học và thi đỗ **JLPT N5 kỳ tháng 7/2027**. Tính từ hôm nay còn khoảng 33 tuần.

Hannah không thiếu tài liệu học. Cái làm Hannah bỏ dở là những chỗ vấp khi đang học: kanji không nhớ nổi, và những cách đọc bất quy tắc không ai giải thích cho rõ. Mỗi lần vấp là một lần nản, và "lười" là kết quả của chuỗi đó. Kotoba có mặt để gỡ đúng hai chỗ vấp này. App không định làm thêm một bộ flashcard hay một chuỗi ngày học (streak) nữa.

Vì là dự án cá nhân và có hạn thi cố định, mục tiêu chính của bản đầu tiên là **làm xong nhanh để Hannah dùng nó học được**. Thời gian làm app không được lấn sang thời gian học.

## Vấn đề

- **Đang dùng:** sách của Dũng Mori.
- **Chỗ vấp 1, kanji:** Hannah ghi nhớ bằng cách đọc rồi chép đi chép lại. Cách này chậm, nhanh quên và dễ nản.
- **Chỗ vấp 2, cách đọc bất quy tắc:** cùng một chữ mà có nhiều cách đọc, nổi rõ nhất ở chuyện đếm ngày, tháng, năm. Ví dụ 一日 đọc là ついたち, 二十日 là はつか, 四月 là しがつ, 九月 là くがつ. Sách đưa ra mà không giải thích vì sao, nên cảm giác như phải học vẹt.
- **Hệ quả:** vấp, rồi nản, rồi dừng học. Đây là chỗ Hannah gọi là "lười".
- Ngữ pháp thực sự (trợ từ, các thể động từ) không phải trở ngại chính. Hannah cần xác nhận lại điểm này.

## Giải pháp

Kotoba có ba trụ, mỗi trụ trả lời trực tiếp cho một chỗ vấp:

1. **Nhớ kanji theo cách hiểu thay vì chép vẹt.** Mỗi chữ trong khoảng 100 kanji N5 được tách thành các bộ phận ghép nên nó, đi kèm âm Hán Việt và một câu gợi nhớ ngắn bằng tiếng Việt. Ví dụ: 日 là NHẬT (mặt trời, ngày), 月 là NGUYỆT (mặt trăng, tháng). Âm Hán Việt là lợi thế riêng của người Việt: nghĩa của chữ đã gần như có sẵn trong đầu.
2. **Làm rõ cách đọc.** Có một mục riêng cho những cách đọc bất quy tắc hay gặp trong đề N5: ngày trong tháng, tháng, giờ, cách đếm người và đồ vật. Mục này gom các cách đọc thành bảng, chỉ ra đâu là quy tắc, đâu là ngoại lệ phải nhớ riêng, rồi cho luyện ngay.
3. **Ôn đúng lúc sắp quên.** Các phiên học ngắn mỗi ngày, ôn lại theo lịch lặp lại ngắt quãng (spaced repetition). Mở app ra là biết hôm nay cần ôn gì, không phải tự quyết định. Cách này đánh vào chỗ ngại bắt đầu.

Viết tay: Hannah tự luyện trên giấy. App chỉ cần hiển thị thứ tự nét để Hannah tham khảo.

## Điểm khác biệt

Nói thẳng: Kotoba không có lợi thế cạnh tranh về thị trường, và cũng không cần. Nó khác ở chỗ được làm đúng theo những chỗ vấp của một người học cụ thể. Giải thích bằng tiếng Việt, dựa vào âm Hán Việt, và tập trung vào những thứ đề N5 thật sự kiểm tra.

## Người dùng

Chỉ có một người dùng là Hannah: người Việt, tự học, bắt đầu từ trình độ N5, học theo sách Dũng Mori. Học thành công nghĩa là mỗi ngày mở app ra mà không thấy ngại, và đi thi với tâm thế chắc chắn.

## Tiêu chí thành công

- **Đỗ JLPT N5 tháng 7/2027.** Phải đạt tổng từ 80/180 điểm và vượt điểm sàn từng phần: 38/120 cho Kiến thức ngôn ngữ + Đọc hiểu, 19/60 cho Nghe hiểu.
- **Đăng ký thi kịp hạn.** Hạn dự kiến khoảng tháng 3–4/2027, và chỗ thường kín sau vài tuần.
- Học đều ít nhất 5 trên 7 ngày mỗi tuần, mỗi phiên khoảng 15 phút.
- Đến khoảng tháng 3/2027, đọc và nhận ra được toàn bộ khoảng 100 kanji N5 cùng các cách đọc ngày tháng.
- **Bản đầu tiên dùng được càng sớm càng tốt.** Chưa đặt số tuần cụ thể.

## Phạm vi bản đầu tiên

**Có:**
- Học kanji N5 với bộ phận ghép, âm Hán Việt, câu gợi nhớ, ví dụ từ vựng, và thứ tự nét để tham khảo.
- Mục cách đọc bất quy tắc: ngày, tháng, giờ, cách đếm.
- Ôn tập ngắt quãng cho kanji và 718 từ vựng N5 đã có sẵn trong repo.
- Phiên học ngắn mỗi ngày, có streak và linh vật Pyon, dùng các component có sẵn trong Kotoba UI.
- **Luyện nghe** theo đúng 4 dạng bài nghe của N5. Từ vựng và câu ngắn dùng giọng đọc máy. Hội thoại dạng đề dùng audio từ các nguồn bên dưới.
- **Đề thi thử** chấm điểm theo thang JLPT: điểm từng phần, điểm sàn, đỗ hay trượt. Có giải thích bằng tiếng Việt.

**Nguồn nội dung cho luyện nghe và đề thi thử** (đã kiểm tra ngày 18/11/2026; chi tiết xem `addendum.md`):

| Nguồn | Có gì | Dùng được không |
| --- | --- | --- |
| **JLPTSuccess** (`gauravhq/JLPTSuccess`) | 402 câu đề thi thử chia theo phần, 284 câu trắc nghiệm, 50 bài nghe có audio, 54 bài đọc, 106 kanji có bộ thủ và câu gợi nhớ | **Dùng được, đây là nguồn chính.** Giấy phép MIT, nội dung do nhóm tác giả tự soạn, không chép đề thi thật. Phải giữ ghi công. Phần giải thích chỉ có tiếng Anh và tiếng Hindi, Kotoba sẽ tự dịch sang tiếng Việt |
| jlpt.jp: câu hỏi mẫu chính thức | Mỗi dạng câu hỏi một câu, có audio | Chỉ để tham khảo định dạng đề, không đưa vào repo |
| Tanuki JLPT | Hơn 16.000 câu | **Không dùng được.** Tự nhận là mã nguồn mở nhưng không ghi giấy phép, không có link repo, không rõ câu hỏi lấy từ đâu |
| Các trang luyện đề web khác (NihongoMaster, JFT Guru…) | Đề và bài nghe miễn phí | Chỉ làm trực tiếp trên web của họ |

**Rủi ro bản quyền:** repo `japanesestudy` đang để công khai. Chép đề hoặc audio có bản quyền vào repo tức là phát tán lại nội dung đó. Hướng xử lý: chỉ đưa vào repo nội dung tự soạn hoặc có giấy phép mở. Đề chính thức thì để app tải từ nguồn gốc về, hoặc giữ ở máy riêng, không commit.

**Không có:**
- Chấm nét viết tay.
- Tài khoản người dùng, tính năng xã hội, bảng xếp hạng.
- Lịch lớp học hay danh sách lớp sắp tới. Các component *UpcomingClassItem* và *ScheduleTimeline* chưa dùng đến.
- Tính năng AI (AIComposer, AIInsightCard): để sau.

**Nền tảng:** Web app chạy tốt trên điện thoại, cài được lên màn hình chính (PWA). Lý do là design system hiện có viết bằng HTML/CSS/JS nên dùng lại được ngay, nhanh hơn làm app native.

## Lộ trình sau bản đầu tiên

Sau khi bản đầu tiên chạy được, thêm dần theo nhịp học thật của Hannah: ngữ pháp N5 có giải thích bằng tiếng Việt, rồi thêm đề thi thử cho 2–3 tháng luyện đề cuối cùng. Nếu đỗ N5, Kotoba có thể đi tiếp sang N4.
