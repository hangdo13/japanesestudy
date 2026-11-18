---
title: "PRD: Kotoba"
status: final
created: 2026-11-18
updated: 2026-11-18
---

# PRD: Kotoba

## 0. Mục đích tài liệu

PRD này mô tả *Kotoba cần làm được gì* để Hannah tự học và đỗ JLPT N5 kỳ tháng 7/2027. Tài liệu xây dựa trên ba nguồn đã có sẵn: brief đã chốt (`briefs/brief-japanesestudy-2026-11-18/brief.md`), bản đánh giá nguồn nội dung (`addendum.md` cùng thư mục với brief), và design system Kotoba UI (`kotoba-design/`). Phần chọn công nghệ ghi riêng trong `addendum.md` của PRD. Chỗ nào là suy đoán chưa được xác nhận đều gắn nhãn và được liệt kê lại ở §9.

## 1. Tầm nhìn

Kotoba là app học tiếng Nhật N5 dành riêng cho Hannah. Mục tiêu của app là gỡ đúng những chỗ khiến Hannah bỏ học, gồm kanji khó nhớ và cách đọc bất quy tắc, và biến thời gian học thành thứ nhìn thấy được, dưới dạng một cái cây lớn dần. Mỗi ngày, Hannah chỉ cần mở app lên là có ngay bài cần học. Học xong thì thấy cây cao thêm. Đến kỳ thi, Hannah đã làm đủ đề thi thử để bước vào phòng thi với tâm thế chắc chắn.

## 2. Người dùng

### 2.1 Việc cần làm (Jobs To Be Done)
- Nhớ được khoảng 100 kanji N5 mà không phải chép vẹt.
- Hiểu vì sao một chữ có nhiều cách đọc và nhớ được những cách đọc ngoại lệ, ví dụ ngày tháng.
- Duy trì việc học đều đặn suốt khoảng 33 tuần mà không bỏ giữa chừng.
- Luyện nghe và làm đề theo đúng định dạng N5 trước khi đi thi.

### 2.2 Hành trình chính
- **UJ-1. Phiên học buổi tối.** Hannah mở Kotoba trên điện thoại. Màn hình chính có cây học tập và danh sách việc cần làm hôm nay, ví dụ 12 thẻ cần ôn và 3 kanji mới. Hannah học khoảng 15 phút, sau đó cây mọc cao thêm và Pyon tưới cây.
- **UJ-2. Gặp chữ 日 trong ngày tháng.** Hannah học tới ついたち và はつか. App mở bảng cách đọc ngày trong tháng, tô màu riêng những ngày đọc theo quy tắc và những ngày là ngoại lệ, rồi cho luyện ngay.
- **UJ-3. Bỏ học một tuần rồi quay lại.** Hannah mở app sau 8 ngày không học và thấy cây đã héo một mức. Hannah học xong một phiên, cây bắt đầu tươi lại.
- **UJ-4. Thi thử cuối tuần.** Hannah làm một đề thi thử và xem điểm từng phần so với điểm sàn. App chỉ ra phần nào đang yếu.

## 3. Thuật ngữ

- **Phiên học**: một lần học liên tục trong app.
- **Thời gian học thực**: số giây Hannah thật sự tương tác, tức là đang trả lời câu hỏi, lật thẻ hoặc phát audio. Thời gian để app mở mà không làm gì không được tính.
- **Thẻ**: một đơn vị ôn tập. Có thể là kanji, từ vựng hoặc cách đọc.
- **Lịch ôn**: thời điểm mỗi thẻ cần được ôn lại, tính theo thuật toán lặp lại ngắt quãng.
- **Cây học tập**: hình cây lớn dần theo tổng thời gian học thực. Cây có độ cao và mức héo.
- **Mức héo**: tình trạng của cây, từ 0 (tươi) đến 3 (héo nặng).
- **Đề thi thử**: bài thi rút gọn khoảng 30 phút, không bấm giờ, mô phỏng đề N5, chấm theo thang JLPT.

## 4. Tính năng

### 4.1 Kanji theo cách hiểu
Mỗi kanji N5 được trình bày gồm: âm Hán Việt, nghĩa tiếng Việt, các bộ phận ghép nên chữ, câu gợi nhớ bằng tiếng Việt, âm on và âm kun kèm audio, thứ tự nét, ví dụ từ vựng lấy từ 718 từ đã có, và những chữ dễ nhầm với nó. Hiện thực hoá UJ-1.

- **FR-1**: Hannah xem được trang chi tiết của từng kanji trong khoảng 106 kanji N5, đủ các trường liệt kê ở trên.
  - Không kanji nào bị thiếu âm Hán Việt, nghĩa tiếng Việt hoặc câu gợi nhớ.
  - Nội dung do AI soạn. Mỗi kanji có trạng thái "Hannah đã duyệt" hoặc "chưa duyệt".
- **FR-2**: Hannah học kanji mới theo từng gói nhỏ. Mỗi ngày tối đa 5 chữ, có thể chỉnh trong cài đặt.
- **FR-3**: Hannah ôn kanji theo nhiều chiều: nhìn chữ đoán nghĩa, nhìn chữ chọn cách đọc, và nhìn âm Hán Việt hoặc nghĩa để chọn đúng chữ.
- **Ngoài phạm vi:** chấm nét viết tay. Hannah tự luyện viết trên giấy.

### 4.2 Cách đọc bất quy tắc
Một mục riêng gom các nhóm cách đọc hay gây nhầm: ngày trong tháng, tháng, giờ và phút, đếm người, đếm đồ vật (つ, 本, 枚, 個…). Hiện thực hoá UJ-2.

- **FR-4**: Mỗi nhóm có một bảng đầy đủ, phân biệt rõ những mục đọc theo quy tắc và những mục là ngoại lệ.
- **FR-5**: Hannah luyện được từng nhóm, mỗi câu có audio. Các ngoại lệ được đưa vào lịch ôn như những thẻ thông thường.

### 4.3 Ôn tập ngắt quãng và phiên học hằng ngày
- **FR-6**: Màn hình chính hiện việc cần làm hôm nay, gồm số thẻ đến hạn và số kanji mới. Hannah chỉ cần một chạm để bắt đầu. Hiện thực hoá UJ-1.
- **FR-7**: Lịch ôn của mỗi thẻ được tính lại sau mỗi lần trả lời đúng hoặc sai. Dùng thuật toán FSRS, giống JLPTSuccess.
- **FR-8**: Ôn được cả 718 từ vựng có sẵn, có audio phát âm.

### 4.4 Cây học tập
*Ưu tiên thấp nhất: được phép lùi sang sau ngày 30/11.*

Cây lớn dần theo tổng thời gian học thực. Không học thì cây héo. Hiện thực hoá UJ-1 và UJ-3.

- **FR-9**: Cây cao thêm theo thời gian học thực tích luỹ.
  - Chỉ có một cây duy nhất, lớn từ hạt mầm đến lúc ra hoa vào khoảng ngày thi, nếu học trung bình 15 phút mỗi ngày.
- **FR-10**: Chỉ tính thời gian học thực. Nếu không có tương tác nào trong 60 giây thì dừng đếm giờ.
- **FR-11**: Cứ mỗi 7 ngày liên tiếp không có phiên học nào, mức héo tăng thêm 1, tối đa đến mức 3.
  - Không học từ ngày 1 đến ngày 6: cây vẫn tươi.
  - Ngày thứ 7 không học: mức héo lên 1.
  - Ngày thứ 14 không học: mức héo lên 2.
- **FR-12**: Học lại thì cây hồi phục. Mỗi phiên học từ 10 phút trở lên làm giảm mức héo đi 1. Độ cao đã đạt thì không bao giờ bị mất.
- **FR-13**: Sau mỗi phiên học, app hiện hiệu ứng cây mọc thêm. Linh vật Pyon tưới cây.

### 4.5 Luyện nghe
- **FR-14**: Hannah luyện được các bài nghe theo 4 dạng bài nghe của đề N5. Mỗi bài có audio ở tốc độ thường và tốc độ chậm, có lời thoại, đáp án và giải thích bằng tiếng Việt. Nguồn là 50 bài nghe của JLPTSuccess.
- **FR-15**: Lời thoại bị ẩn khi đang nghe và chỉ hiện sau khi Hannah đã chọn đáp án.

### 4.6 Đề thi thử
- **FR-16**: Hannah làm được đề thi thử rút gọn, dài khoảng 30 phút, theo cấu trúc N5, gồm các phần chữ, từ vựng, ngữ pháp, đọc hiểu và nghe. Hiện thực hoá UJ-4.
  - Mỗi đề lấy câu từ đủ các phần, giữ đúng tỉ lệ số câu giữa các phần như đề thật.
  - Đề thi thử không bấm giờ: không đếm ngược, không hiện thời gian, không tự nộp bài. Hannah tự bấm nộp khi làm xong.
- **FR-17**: Sau khi nộp bài, app hiện kết quả. Vì là đề rút gọn, điểm được quy đổi sang thang JLPT và ghi rõ là *điểm ước tính*:
  - Điểm phần Kiến thức ngôn ngữ và Đọc hiểu trên thang 0–120, so với điểm sàn 38.
  - Điểm phần Nghe trên thang 0–60, so với điểm sàn 19.
  - Tổng điểm trên thang 0–180 và kết luận đỗ hay trượt, với mốc đỗ là 80 điểm.
- **FR-18**: Mỗi câu có giải thích bằng tiếng Việt. Những câu làm sai được tự động đưa vào lịch ôn.
- **Ghi chú:** bộ đề của JLPTSuccess chưa có phần nghe. Phần nghe của đề thi thử sẽ được ghép từ các bài ở §4.5.

### 4.7 Nhắc đăng ký thi
- **FR-19**: App hiện đếm ngược tới ngày thi. Từ đầu tháng 3/2027, app nhắc Hannah đăng ký thi.

### 4.9 Kana và phát âm *(thêm ngày 18/11, theo sprint change proposal)*
- **FR20**: Có bảng hiragana và katakana đầy đủ: 46 chữ cơ bản, âm đục và bán đục, âm ghép, katakana mở rộng. Mỗi chữ có romaji, phát âm và thứ tự nét (KanjiVG).
- **FR21**: Hannah luyện nhận diện kana theo hai cách: nhìn chữ chọn âm, và nghe âm chọn chữ. Có nhóm luyện riêng cho các cặp dễ nhầm (シ/ツ, ソ/ン, ぬ/め, わ/ね/れ…). Chữ hay sai được đưa vào lịch ôn.
- **FR22**: Có phần giải thích quy tắc âm ngắt っ, trường âm (cả hiragana lẫn ー của katakana), trợ từ đọc khác chữ (は/へ/を), kèm bài đọc từ có các hiện tượng này.
- **FR23**: Luyện phát âm theo hai dạng: đếm phách, và phân biệt cặp âm ngắn/dài, có/không có っ (ví dụ おばさん/おばあさん, きて/きって).

### 4.10 Bổ sung kanji và từ vựng
- **FR24**: Thêm 4 kanji 多 少 耳 魚, nâng tổng lên 110 chữ.
- **FR25**: Hannah học từ vựng mới theo 21 chủ đề, mỗi ngày N từ (chỉnh được). Từ đã học được đưa vào lịch ôn.
- **FR26**: Mở rộng FR4 và FR5 thành số đếm, đủ các trợ số từ N5, thời gian và các cách đọc đặc biệt (mục 5.2 đến 5.5 của lộ trình).

### 4.11 Ngữ pháp N5
- **FR27**: Có bài học cho trợ từ, です, chia động từ (thể ます, từ điển, て, ない, た), tính từ い/な, và các mẫu câu ở mục 6.5–6.6 của lộ trình. Mỗi mẫu có giải thích tiếng Việt, 3 câu ví dụ, và nhãn "N5/N4" khi cần.
- **FR28**: Có bài tập ngữ pháp: điền trợ từ, chia thể có chấm tự động, sắp xếp câu (có vị trí ★).

### 4.12 Đọc hiểu
- **FR29**: Hannah luyện đọc đoạn ngắn, đoạn trung bình và bài tìm thông tin. Mỗi bài có câu hỏi và giải thích tiếng Việt.
- **FR30**: Có bài luyện đọc kanji trong câu khi furigana bị ẩn.

### 4.13 Đề thi đủ dạng
- **FR31**: Đề thi thử có đủ 14 dạng bài. Có hai chế độ: chế độ **luyện** (rút gọn, không bấm giờ, như FR16) và chế độ **thi thật** (đủ dạng, bấm giờ 20/40/30 phút).

### 4.14 Lộ trình 12 tuần
- **FR32**: Trang chủ gợi ý việc hôm nay theo tuần hiện tại của lộ trình 12 tuần: tuần 1–2 kana và phát âm, tuần 3–6 từ vựng, kanji nhóm đầu và trợ từ, tuần 7–10 phần còn lại, tuần 11–12 mẫu câu, đọc hiểu và đề thi bấm giờ.

### 4.8 Yêu cầu chung
- **NFR-1**: Dùng tốt trên trình duyệt điện thoại. Chỉ cần chạy khi có mạng, không yêu cầu học offline.
- **NFR-2**: Toàn bộ giao diện và phần giải thích bằng tiếng Việt.
- **NFR-3**: Tiến độ học lưu ngay trên máy. Có nút xuất và nhập dữ liệu để sao lưu.
- **NFR-4**: Dùng design system Kotoba UI (tokens và các component có sẵn).
- **NFR-5**: Ghi công nguồn nội dung đúng giấy phép: JLPTSuccess (MIT), KanjiVG (CC BY-SA 3.0), VOICEVOX. Không đưa đề thi có bản quyền vào repo công khai.

## 5. Không làm
- Kotoba không phải sản phẩm thương mại, không có nhiều người dùng, không có tài khoản, không có tính năng mạng xã hội.
- Không chấm nét viết tay.
- Không có lớp học hay lịch lớp.
- Không có tính năng AI trong bản này.
- Không mở rộng sang N4 trước kỳ thi.

## 6. Phạm vi bản đầu tiên
**Hạn hoàn thành:** mốc 1 vào 30/11/2026, gồm Kana & phát âm, Ôn tập và Từ vựng theo chủ đề (tuần 1–6 của lộ trình). Các phần còn lại ra dần theo thứ tự học (xem `sprint-change-proposal-2026-11-18.md`).

**Có:** toàn bộ §4.1 đến §4.8. Theo quyết định của Hannah, luyện nghe và đề thi thử được gộp luôn vào bản đầu tiên.

**Rủi ro về tiến độ:** 12 ngày cho toàn bộ phạm vi là rất sát. Phần tốn công nhất không phải viết code mà là nội dung tiếng Việt: âm Hán Việt và câu gợi nhớ cho 106 kanji, dịch giải thích cho khoảng 400 câu đề và 50 bài nghe. Nếu không kịp, **Cây học tập (§4.4) được lùi lại trước tiên**. Đây là phần làm cuối và được phép ra sau 30/11.

**Thứ tự ưu tiên:** §4.1 Kanji → §4.2 Cách đọc → §4.3 Ôn tập → §4.5 Luyện nghe → §4.6 Đề thi thử → §4.7 Nhắc đăng ký → §4.4 Cây học tập.

**Cách soạn nội dung:** AI soạn toàn bộ nội dung tiếng Việt (âm Hán Việt, câu gợi nhớ, dịch giải thích), Hannah duyệt lại.

**Không có:** ngữ pháp N5 thành một mục riêng. Các câu ngữ pháp vẫn có trong đề thi thử và đều có giải thích bằng tiếng Việt.

## 7. Thước đo thành công
- **SM-1 (chính)**: đỗ JLPT N5 tháng 7/2027, đạt tổng điểm từ 80 trở lên và vượt cả hai điểm sàn.
- **SM-2**: học ít nhất 5 trên 7 ngày mỗi tuần. Kiểm chứng FR-6 và FR-9 đến FR-12.
- **SM-3**: đến tháng 3/2027, nhận diện và đọc đúng từ 90% kanji N5 trở lên. Kiểm chứng FR-1 đến FR-5.
- **SM-4**: từ tháng 4/2027, mỗi tuần làm ít nhất 1 đề thi thử và điểm tăng dần. Kiểm chứng FR-16 đến FR-18.
- **SM-C1 (không chạy theo)**: độ cao của cây. Cây cao mà điểm thi thử không tăng nghĩa là đang học cho cây chứ không phải học cho kỳ thi. Thước đo này cân bằng cho SM-2.

## 8. Câu hỏi còn mở
1. ~~Hạn xong bản đầu tiên~~: **đã chốt là 30/11/2026**, còn 12 ngày. Rủi ro: phạm vi bản đầu rất rộng, đặc biệt phần soạn nội dung tiếng Việt. Xem §6.
2. ~~Ai soạn nội dung tiếng Việt~~: **đã chốt là AI soạn, Hannah duyệt.** Áp dụng cho âm Hán Việt, câu gợi nhớ và phần dịch giải thích.
3. ~~Độ dài đề thi thử~~: **đã chốt là đề rút gọn khoảng 30 phút.**

Hiện không còn câu hỏi nào chặn bước tiếp theo.

## 9. Danh sách giả định
Hannah đã xác nhận toàn bộ giả định ngày 18/11/2026. Không còn giả định nào mở.
