---
title: "Addendum: Đánh giá nguồn nội dung cho Kotoba"
created: 2026-11-18
---

# Đánh giá nguồn nội dung (18/11/2026)

## JLPTSuccess: nguồn chính

- Repo: https://github.com/gauravhq/JLPTSuccess. Nội dung N5 nằm trong thư mục `N5/`.
- Giấy phép: MIT (`LICENSE` ở thư mục gốc). `N5/CONTENT-LICENSE.md` khẳng định toàn bộ ngữ pháp, từ vựng, kanji, câu đề, bài đọc và bài nghe đều do nhóm tác giả tự soạn, không chép hay dịch từ đề thi thật. Repo có script `tools/audit_provenance.py` để dò dấu hiệu chép đề, và lần quét gần nhất ghi nhận 0 kết quả.
- Nội dung N5 có trong repo:
  - `data/papers/` gồm 28 đề nhỏ, tổng 402 câu, chia 4 phần: moji (chữ), goi (từ vựng), bunpou (ngữ pháp), dokkai (đọc hiểu). Phần nghe (chōkai) trong bộ đề hiện chưa có câu nào.
  - `data/questions.json`: 284 câu trắc nghiệm.
  - `data/listening.json`: 50 bài nghe theo dạng mondai, có kịch bản tiếng Nhật, 4 lựa chọn, đáp án, giải thích tiếng Anh và tiếng Hindi. Mỗi bài có file mp3 tốc độ thường và tốc độ chậm, đọc bằng VOICEVOX.
  - `data/reading.json`: 54 bài đọc. `data/grammar.json`: 178 mẫu ngữ pháp. `data/vocab.json`: 995 từ. `data/kanji.json`: 106 kanji, mỗi chữ có âm on, âm kun, phân tích bộ thủ, câu gợi nhớ, nhóm chữ dễ nhầm và ví dụ.
  - Có SVG thứ tự nét (KanjiVG) và audio đọc từng cách đọc của mỗi kanji.
- Điều kiện khi dùng lại:
  - Giữ thông báo bản quyền MIT.
  - SVG thứ tự nét của KanjiVG theo giấy phép CC BY-SA 3.0: phải ghi công, và nếu chỉnh sửa thì bản sửa phải dùng cùng giấy phép.
  - Audio VOICEVOX: mỗi giọng nhân vật có điều khoản ghi công riêng (xem `N5/NOTICES.md`). Audio bài đọc làm bằng gTTS.
- Hạn chế:
  - Không có tiếng Việt cho N5, chỉ có tiếng Anh và tiếng Hindi. Tiếng Việt chỉ có ở file giao diện của N4 (`N4/locales/vi.json`).
  - Một số mục được đánh dấu `review_status: ai_quality_reviewed`, nghĩa là có AI tham gia soạn hoặc duyệt, nên cần soát lại chất lượng.
- Việc cần làm cho Kotoba:
  - Dịch các trường `explanation_en` sang tiếng Việt.
  - Thêm âm Hán Việt cho 106 kanji.
  - Ghép dữ liệu với 718 từ vựng đã có trong `n5_vocab.json`.

## Tanuki JLPT: không dùng

- https://tanuki-jlpt.vercel.app tự giới thiệu là dự án mã nguồn mở, có hơn 16.025 câu luyện tập.
- Trang không ghi giấy phép, không có link tới repo, và không nói câu hỏi lấy từ đâu. Tìm trên GitHub cũng không ra repo của dự án.
- Không có giấy phép thì về mặt pháp lý coi như mọi quyền thuộc về tác giả. Vì vậy không chép nội dung này vào Kotoba.

## Các nguồn khác ghi nhận

- jlpt.jp có câu hỏi mẫu chính thức và bộ đề mẫu 2009 kèm audio. Dùng để đối chiếu định dạng đề, không commit vào repo công khai.
- hanabira.org mở cả mã nguồn lẫn nội dung, nhưng yêu cầu sản phẩm dùng lại cũng phải mở mã nguồn và phải đặt backlink. Danh sách nguồn của họ có các sách thương mại, nên cần thận trọng nếu dùng.
- OpenJLPT (PyPI `openjlpt`) là bộ dữ liệu JLPT có giấy phép rõ ràng. Có thể dùng để đối chiếu từ vựng và kanji.
