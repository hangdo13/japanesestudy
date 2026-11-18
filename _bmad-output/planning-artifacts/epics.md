---
status: final
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-japanesestudy-2026-11-18/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-japanesestudy-2026-11-18/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/briefs/brief-japanesestudy-2026-11-18/addendum.md
  - kotoba-design/design/kotoba-ui/README.md
  - kotoba-design/design/kotoba-ui/components/*/README.md
  - kotoba-design/design/kotoba-ui/tokens.json
---

# Kotoba: Chia epic và story

## Tổng quan

Tài liệu này chia các yêu cầu từ PRD, kiến trúc và thiết kế Kotoba UI thành các story để AI lần lượt build.

## Danh sách yêu cầu

### Yêu cầu chức năng

FR1: Hannah xem được trang chi tiết của từng kanji trong khoảng 106 kanji N5. Mỗi trang có: âm Hán Việt, nghĩa tiếng Việt, bộ phận ghép thành chữ, câu gợi nhớ tiếng Việt, âm on/kun có audio, thứ tự nét, ví dụ từ vựng, chữ dễ nhầm. Không chữ nào thiếu âm Hán Việt, nghĩa hay câu gợi nhớ. Mỗi kanji có trạng thái "đã duyệt" hoặc "chưa duyệt".
FR2: Hannah học kanji mới theo gói. Mặc định tối đa 5 chữ mỗi ngày, chỉnh được trong cài đặt.
FR3: Hannah ôn kanji theo 3 chiều: nhìn chữ đoán nghĩa, nhìn chữ chọn cách đọc, nhìn âm Hán Việt hoặc nghĩa để chọn chữ.
FR4: Mỗi nhóm cách đọc bất quy tắc (ngày, tháng, giờ/phút, đếm người, đếm đồ vật) có một bảng đầy đủ, tách rõ phần đọc theo quy tắc và phần ngoại lệ.
FR5: Hannah luyện từng nhóm cách đọc, có audio. Các ngoại lệ được đưa vào lịch ôn.
FR6: Trang chủ hiện việc cần làm hôm nay (số thẻ đến hạn, số kanji mới), chạm một lần là bắt đầu học.
FR7: Lịch ôn của mỗi thẻ được tính lại sau mỗi lần trả lời đúng hoặc sai, theo thuật toán FSRS.
FR8: Hannah ôn được 718 từ vựng có sẵn, có audio phát âm.
FR9: Cây cao thêm theo thời gian học thực tích luỹ. Chỉ có một cây, ra hoa vào khoảng ngày thi nếu học trung bình 15 phút mỗi ngày.
FR10: Chỉ tính thời gian học thực. Quá 60 giây không tương tác thì dừng đếm.
FR11: Cứ mỗi 7 ngày liên tiếp không học, mức héo tăng 1, tối đa mức 3.
FR12: Mỗi phiên học từ 10 phút trở lên giảm mức héo đi 1. Độ cao đã đạt không bao giờ mất.
FR13: Sau mỗi phiên học có hiệu ứng cây mọc thêm và Pyon tưới cây.
FR14: Hannah luyện nghe theo 4 dạng bài nghe N5. Mỗi bài có audio tốc độ thường và chậm, lời thoại, đáp án, giải thích tiếng Việt.
FR15: Lời thoại bị ẩn khi đang nghe, chỉ hiện sau khi đã chọn đáp án.
FR16: Hannah làm đề thi thử rút gọn khoảng 30 phút, đủ các phần (chữ, từ vựng, ngữ pháp, đọc hiểu, nghe) theo đúng tỉ lệ đề thật. Không bấm giờ: không đếm ngược, không hiện thời gian, không tự nộp bài.
FR17: Sau khi nộp bài, app quy đổi điểm sang thang JLPT và ghi rõ là ước tính: điểm phần Kiến thức ngôn ngữ và Đọc hiểu trên 0–120 (điểm sàn 38), phần Nghe trên 0–60 (điểm sàn 19), tổng trên 0–180 (đỗ từ 80) và kết luận đỗ/trượt.
FR18: Mỗi câu thi có giải thích tiếng Việt. Câu làm sai được tự động đưa vào lịch ôn.
FR19: App đếm ngược tới ngày thi và nhắc đăng ký thi từ đầu tháng 3/2027.
FR20: Bảng hiragana và katakana đầy đủ (cơ bản, đục, ghép, mở rộng), có romaji, phát âm và nét viết.
FR21: Luyện nhận diện kana (nhìn chữ chọn âm, nghe âm chọn chữ), có nhóm cặp dễ nhầm, chữ sai được đưa vào lịch ôn.
FR22: Quy tắc っ, trường âm, は/へ/を, kèm bài đọc từ.
FR23: Luyện phát âm: đếm phách, phân biệt cặp âm ngắn/dài và có/không có っ.
FR24: Thêm 4 kanji 多 少 耳 魚 (110 chữ).
FR25: Học từ vựng mới theo 21 chủ đề, mỗi ngày N từ, từ đã học vào lịch ôn.
FR26: Số đếm, trợ số từ N5 đầy đủ, thời gian, cách đọc đặc biệt.
FR27: Bài học ngữ pháp N5 (trợ từ, です, chia động từ/tính từ, mẫu câu 6.5–6.6), giải thích tiếng Việt, 3 ví dụ, nhãn N5/N4.
FR28: Bài tập ngữ pháp: điền trợ từ, chia thể chấm tự động, sắp xếp câu có ★.
FR29: Luyện đọc hiểu: đoạn ngắn, trung bình, tìm thông tin, có giải thích tiếng Việt.
FR30: Đọc kanji trong câu khi ẩn furigana.
FR31: Đề thi thử đủ 14 dạng, có chế độ luyện (không bấm giờ) và chế độ thi thật (20/40/30 phút).
FR32: Trang chủ gợi ý việc hôm nay theo lộ trình 12 tuần.

### Yêu cầu phi chức năng

NFR1: Dùng tốt trên trình duyệt điện thoại. Chỉ cần chạy online, không yêu cầu offline.
NFR2: Toàn bộ giao diện và phần giải thích bằng tiếng Việt.
NFR3: Tiến độ học lưu trên máy, có nút xuất và nhập file sao lưu.
NFR4: Dùng design system Kotoba UI.
NFR5: Ghi công nguồn nội dung đúng giấy phép (JLPTSuccess – MIT, KanjiVG – CC BY-SA 3.0, VOICEVOX). Không commit đề thi có bản quyền vào repo công khai.

### Yêu cầu bổ sung từ kiến trúc

- **Khởi tạo dự án (Epic 1, Story 1):** dựng dự án Vite 8.3.8 dùng JavaScript thuần (ES modules), không framework, không service worker. Đặt Kotoba UI vào `src/ui/`. Tạo cấu trúc thư mục theo Structural Seed (`content/`, `content-vi/`, `vendor/jlptsuccess/`, `public/audio/`, `scripts/`, `src/core/`, `src/features/`, `src/ui/`). (AD-1)
- **Triển khai:** dùng GitHub Actions để build và đưa lên GitHub Pages mỗi lần push nhánh `main` của repo `hangdo13/japanesestudy`.
- **Ranh giới tầng:** `features/*` không được import lẫn nhau. Tác động chéo giữa các tính năng phải đi qua `core/progress`. (AD-2)
- **Gom nội dung:** `scripts/build-content.mjs` gom `n5_vocab.json`, dữ liệu JLPTSuccess N5 và `content-vi/` thành `content/*.json` theo `content/SCHEMA.md`. Mỗi mục tiếng Việt có `reviewStatus`. Chỉ chép khoảng 360 file audio cần dùng. (AD-3)
- **Kho tiến độ:** chỉ `core/progress` được dùng localStorage, với khoá `kotoba:v1`. Dữ liệu có `schemaVersion`, có xuất/nhập JSON, và phát sự kiện `progress:changed` khi thay đổi. (AD-4)
- **Đồng hồ học:** chỉ `core/study-clock` đếm thời gian học thực. Các tính năng gọi `studyClock.activity()`. Thời gian lưu theo ngày dạng `YYYY-MM-DD` trong `progress`. (AD-5)
- **Lịch ôn:** dùng `core/srs`, lớp bọc quanh ts-fsrs 6.0.0. Mã thẻ có dạng `<loại>:<id>`. (AD-6)
- **iPhone:** có `manifest.webmanifest` và icon để thêm vào màn hình chính. Hiện hướng dẫn khi đang mở trong tab Safari thường. Nhắc sao lưu khi đã quá 7 ngày chưa sao lưu. (AD-7)
- **Luật dẫn xuất:** độ cao cây, mức héo, số thẻ đến hạn, đếm ngược đều tính trong `core/growth` bằng hàm thuần, có test Vitest 5.1.0. Phần hiển thị dùng chung đặt ở `ui/tree-view` và `ui/cards/<loại>`. (AD-8)
- **Bám thiết kế:** chỉ dùng token từ `tokens.css`, ghép component theo đúng `preview.html`, đối chiếu với preview trước khi coi là xong. (AD-9)
- **Điều hướng:** dùng hash route `#/<tính năng>/<tham số>`, chỉ định nghĩa trong `core/router`. Mỗi tính năng xuất hàm `mount(el, params)`.
- **Ghi công:** có `NOTICES.md` và trang "Giới thiệu".

### Yêu cầu thiết kế (UX)

UX-DR1: Nạp design system ở mọi trang: `tokens.css` (theme sáng/tối), `components/bundle.css`, `components/bundle.js`, gọi `Kotoba.hydrate()` sau mỗi lần dựng màn hình. Font Plus Jakarta Sans cho giao diện, Noto Sans JP cho chữ Nhật (`kt-jp` + `lang="ja"`).
UX-DR2: Khung điều hướng điện thoại: `TopBar` (màn con có nút quay lại) và `BottomNav` 4 tab, nút tròn `primary-strong` ở giữa để "học ngay".
UX-DR3: Trang chủ: `Greeting` ("Chào, **Hannah!**"), `ActiveLessonCard` (khối `surface-tint` duy nhất: việc cần làm hôm nay), cặp `StatCard`, `SectionHeader`, `ui/tree-view`, đếm ngược ngày thi.
UX-DR4: Ôn thẻ dùng `Flashcard` (`Kotoba.swipeDeck`): vuốt phải "Đã nhớ", vuốt trái "Ôn lại" (màu trung tính, không đỏ), chạm để lật. Có phím tắt ← → Space. `SegmentedProgress` ở đầu phiên theo màu kỹ năng.
UX-DR5: Câu trắc nghiệm (ôn kanji 3 chiều, luyện nghe, đề thi thử) dùng `QuizOption` với 4 trạng thái và hộp phản hồi có Pyon (`happy` khi đúng, `oops` khi sai).
UX-DR6: Màu kỹ năng cố định: Kanji và Cách đọc dùng `skill-kanji` (字), Từ vựng dùng `skill-vocab` (語), Luyện nghe dùng `skill-speaking` (icon mic), Ngữ pháp trong đề thi dùng `skill-grammar` (文). Dùng `SkillTile` và `Chip` để đánh dấu.
UX-DR7: Kết thúc phiên học hoặc đạt mục tiêu ngày: `GoalComplete` (Pyon `celebrate`, cánh hoa sakura).
UX-DR8: Màn trống hoặc lỗi dùng `EmptyState` (Pyon `sleepy`) với câu tiếng Việt gợi việc nên làm tiếp.
UX-DR9: Chuỗi ngày học dùng `StreakTracker` (ngọn lửa `peach`). Đây là phần thưởng, không phải nút.
UX-DR10: Component mới `ui/tree-view` thể hiện độ cao và 4 mức héo (0–3), theo 5 nguyên tắc thiết kế, chỉ dùng token sẵn có. Pyon tưới cây là Pyon duy nhất trên màn hình đó.
UX-DR11: Component mới `ui/cards/kanji|vocab|reading|mock` dựa trên `Flashcard`: chữ lớn `font-jp`, kana ở trên, nghĩa ở dưới, ví dụ đặt trong ô `surface-sunken`.
UX-DR12: Bảng cách đọc bất quy tắc: ô thẻ trắng, ngoại lệ đánh dấu bằng `Chip`, không thêm mảng màu thứ hai trong cùng một khối.
UX-DR13: Thẻ tiến độ dùng `CourseProgressCard` (số phần trăm lớn, thanh tiến độ), ví dụ cho "kanji đã thuộc" và "đề thi thử đã làm".
UX-DR14: Đạt tương phản chữ tối thiểu 4.5:1 ở cả hai theme. Tôn trọng `prefers-reduced-motion`. Mọi tương tác vuốt đều có cách thay thế bằng bàn phím.

### Bản đồ phủ yêu cầu

FR1: Epic 1 - Trang chi tiết kanji
FR2: Epic 1 - Học gói kanji mới mỗi ngày
FR3: Epic 2 - Ôn kanji theo 3 chiều
FR4: Epic 3 - Bảng cách đọc bất quy tắc
FR5: Epic 3 - Luyện cách đọc, đưa ngoại lệ vào lịch ôn
FR6: Epic 2 - Trang chủ "việc hôm nay"
FR7: Epic 2 - Lịch ôn FSRS
FR8: Epic 2 - Ôn 718 từ vựng có audio
FR9: Epic 6 - Cây mọc theo thời gian học
FR10: Epic 2 - Đồng hồ học thực (dừng sau 60 giây không tương tác)
FR11: Epic 6 - Cây héo sau mỗi 7 ngày không học
FR12: Epic 6 - Cây hồi phục khi học lại
FR13: Epic 6 - Hiệu ứng cây mọc, Pyon tưới cây
FR14: Epic 4 - Luyện nghe 4 dạng bài
FR15: Epic 4 - Ẩn lời thoại tới khi đã chọn đáp án
FR16: Epic 5 - Đề thi thử rút gọn, không bấm giờ
FR17: Epic 5 - Quy đổi điểm theo thang JLPT
FR18: Epic 5 - Giải thích tiếng Việt, câu sai vào lịch ôn
FR19: Epic 2 - Đếm ngược ngày thi, nhắc đăng ký
FR20: Epic 7 - Bảng kana
FR21: Epic 7 - Luyện nhận diện kana
FR22: Epic 7 - Quy tắc っ, trường âm, は/へ/を
FR23: Epic 7 - Luyện phát âm
FR24: Epic 1 - Story 1.7: thêm 4 kanji
FR25: Epic 2 - Story 2.6: từ vựng theo chủ đề
FR26: Epic 3 - Story 3.3: số đếm, trợ số từ, thời gian
FR27: Epic 8 - Bài học ngữ pháp
FR28: Epic 8 - Bài tập ngữ pháp
FR29: Epic 9 - Đọc hiểu
FR30: Epic 9 - Đọc kanji ẩn furigana
FR31: Epic 5 - Story 5.4: đủ 14 dạng, chế độ thi thật
FR32: Epic 10 - Lộ trình 12 tuần

## Danh sách epic

#### Epic 7: Kana & phát âm *(thêm 18/11, làm đầu tiên của mốc 30/11)*
Hannah đọc và nhận diện thành thạo hiragana và katakana, nắm các quy tắc âm ngắt, trường âm và đọc trợ từ, đếm phách đúng.
**FRs covered:** FR20, FR21, FR22, FR23

### Epic 8: Ngữ pháp N5
Hannah học trợ từ, chia động từ và tính từ, các mẫu câu N5 bằng giải thích tiếng Việt, rồi luyện bằng bài tập chấm tự động.
**FRs covered:** FR27, FR28

### Epic 9: Đọc hiểu
Hannah luyện đọc ba dạng bài đọc của đề N5 và đọc kanji khi không có furigana.
**FRs covered:** FR29, FR30

### Epic 10: Lộ trình 12 tuần
Trang chủ dẫn Hannah đi theo đúng thứ tự học trong lộ trình N5.
**FRs covered:** FR32

**Thứ tự làm (sprint change proposal 18/11):** Epic 7 → Epic 2 → Story 1.7 → *(mốc 30/11)* → Epic 3 → Epic 8 → Epic 9 → Epic 4 → Epic 5 → Epic 10 → Epic 6.

## Epic 1: Mở Kotoba trên iPhone và học kanji N5
Hannah mở Kotoba từ màn hình chính iPhone, xem từng kanji N5 với âm Hán Việt, câu gợi nhớ, cách đọc có audio và thứ tự nét, rồi học mỗi ngày một gói kanji mới. Tiến độ được lưu và sao lưu được. Epic này cũng dựng nền móng cho toàn bộ app: dự án Vite + Kotoba UI, tự đưa lên GitHub Pages, script gom nội dung, kho tiến độ.
**FRs covered:** FR1, FR2 · NFR1–NFR5 · AD-1, AD-3, AD-4, AD-7, AD-9 · UX-DR1, UX-DR2, UX-DR6, UX-DR8, UX-DR11, UX-DR14

### Epic 2: Ôn tập mỗi ngày từ trang chủ
Mở app là thấy ngay việc cần làm hôm nay. Chạm một lần là ôn kanji theo 3 chiều và ôn 718 từ vựng, theo lịch FSRS. Thời gian học thực được ghi lại. Trang chủ có đếm ngược ngày thi và nhắc đăng ký thi.
**FRs covered:** FR3, FR6, FR7, FR8, FR10, FR19 · AD-5, AD-6, AD-8 · UX-DR3, UX-DR4, UX-DR5, UX-DR7, UX-DR9, UX-DR13

### Epic 3: Làm chủ cách đọc bất quy tắc
Hannah xem bảng cách đọc ngày, tháng, giờ/phút và cách đếm, thấy rõ đâu là quy tắc và đâu là ngoại lệ, luyện có audio. Các ngoại lệ tự vào lịch ôn của Epic 2.
**FRs covered:** FR4, FR5 · UX-DR12

#### Story 3.3: Số đếm, trợ số từ và thời gian đầy đủ

As a Hannah,
I want học đủ số đếm, trợ số từ và cách nói thời gian của N5,
So that mình không mất điểm ở những câu về số và giờ.

**Acceptance Criteria:**

**Given** mục 5.2–5.5 của lộ trình
**When** mở rộng `content-vi/readings.json`
**Then** có thêm: số đếm (1–10.000, 百/千 biến âm như さんびゃく/はっぴゃく/さんぜん), đủ trợ số từ N5 (つ, 人, 本, 枚, 個, 台, 冊, 匹, 杯, 回, 階, 歳, 円), thời gian (曜日, 週/月/年 trước/này/sau, ～ごろ), cách đọc đặc biệt ở mục 5.5 (FR26)
**And** mỗi nhóm có bảng và bài luyện như Story 3.1–3.2; ngoại lệ vào lịch ôn

## Epic 4: Luyện nghe theo dạng đề N5
Hannah luyện 50 bài nghe theo 4 dạng bài, chọn nghe tốc độ thường hoặc chậm. Lời thoại và giải thích tiếng Việt chỉ hiện sau khi đã trả lời.
**FRs covered:** FR14, FR15 · UX-DR5

### Epic 5: Làm đề thi thử và xem điểm ước tính
Hannah làm đề thi thử rút gọn khoảng 30 phút, không bấm giờ, gồm đủ các phần. Nộp bài xong thấy điểm quy đổi theo thang JLPT so với điểm sàn và kết luận đỗ hay trượt. Câu sai có giải thích tiếng Việt và tự vào lịch ôn.
**FRs covered:** FR16, FR17, FR18 · UX-DR5, UX-DR13

#### Story 5.4: Đề thi thật đủ 14 dạng, có bấm giờ

As a Hannah,
I want làm đề thi thử giống đề thật, đủ dạng bài và có bấm giờ,
So that mình quen áp lực thời gian trước ngày thi.

**Acceptance Criteria:**

**Given** ngân hàng câu hỏi gồm cả bài sắp xếp câu (Epic 8) và đọc hiểu (Epic 9)
**When** chọn "Thi thật" ở `#/thi-thu`
**Then** đề có đủ 14 dạng bài theo bảng mục 7 của lộ trình. Ba phần được bấm giờ 20/40/30 phút, hết giờ thì tự nộp phần đó (FR31)
**And** chế độ "Luyện" (Story 5.2) giữ nguyên: rút gọn, không bấm giờ

## Epic 6: Cây học tập
Cây mọc theo thời gian học thực (dùng số liệu Epic 2 đã ghi), héo sau mỗi 7 ngày không học, hồi phục khi học lại. Sau mỗi phiên có hiệu ứng cây mọc và Pyon tưới cây. Cây xuất hiện ở trang chủ và có màn hình riêng. **Ưu tiên thấp nhất, được phép ra sau ngày 30/11.**
**FRs covered:** FR9, FR11, FR12, FR13 · UX-DR10

## Epic 1: Mở Kotoba trên iPhone và học kanji N5

Hannah mở Kotoba từ màn hình chính iPhone, xem từng kanji N5 với âm Hán Việt, câu gợi nhớ, cách đọc có audio và thứ tự nét, rồi học mỗi ngày một gói kanji mới. Tiến độ được lưu và sao lưu được.

### Story 1.1: Dựng app Kotoba và đưa lên GitHub Pages

As a Hannah,
I want mở được một app Kotoba trống nhưng đúng giao diện Kotoba UI trên điện thoại,
So that mọi tính năng sau có sẵn nền móng và tự lên mạng mỗi khi push code.

**Acceptance Criteria:**

**Given** repo `japanesestudy`
**When** chạy `npm create vite` với template vanilla (Vite 8.3.8), rồi `npm run dev`
**Then** app chạy được, với cấu trúc thư mục đúng Structural Seed (`src/core`, `src/features`, `src/ui`, `content`, `content-vi`, `vendor`, `public/audio`, `scripts`)
**And** `kotoba-design/design/kotoba-ui` được chép vào `src/ui/` (`tokens.css`, `components/bundle.css`, `components/bundle.js`). `index.html` nạp font Plus Jakarta Sans và Noto Sans JP, sau mỗi lần dựng màn hình đều gọi `Kotoba.hydrate()` (UX-DR1)

**Given** app đã chạy
**When** mở `#/` trên màn hình hẹp 390px
**Then** thấy khung gồm `TopBar` và `BottomNav` (4 tab + nút tròn `primary-strong` ở giữa), dựng đúng markup trong `preview.html` của hai component này (UX-DR2)
**And** các tab chưa có tính năng hiển thị `EmptyState` (Pyon `sleepy`) với câu tiếng Việt "Sắp có" (UX-DR8)

**Given** `core/router`
**When** đổi hash sang `#/<tính năng>/<tham số>`
**Then** router gọi `mount(el, params)` của đúng tính năng. Hash không khớp route nào thì hiện `EmptyState`
**And** chỉ `core/router` được định nghĩa route (AD-2)

**Given** workflow GitHub Actions
**When** push lên nhánh `main`
**Then** app được build và đưa lên GitHub Pages, mở được qua https từ Safari iPhone
**And** có `NOTICES.md` và trang `#/gioi-thieu` ghi công JLPTSuccess (MIT), KanjiVG (CC BY-SA 3.0), VOICEVOX (NFR5)

**Given** mọi file CSS và JS viết mới
**When** rà lại code
**Then** không có mã màu, font hay kích thước ghi cứng ngoài biến trong `tokens.css` (AD-9)

### Story 1.2: Gom nội dung kanji N5 với phần tiếng Việt do AI soạn

As a Hannah,
I want có sẵn dữ liệu đầy đủ cho khoảng 106 kanji N5 bằng tiếng Việt,
So that app có nội dung kanji để học mà mình chỉ cần duyệt lại.

**Acceptance Criteria:**

**Given** repo JLPTSuccess (MIT)
**When** chép dữ liệu cần dùng vào `vendor/jlptsuccess/`
**Then** có `kanji.json`, SVG KanjiVG của các kanji N5, audio đọc từng âm của kanji (khoảng 259 file, đặt vào `public/audio/kanji/`), kèm `LICENSE` và phần ghi công tương ứng (NFR5)

**Given** 106 kanji
**When** AI soạn `content-vi/kanji.json`
**Then** mỗi chữ có `hanViet`, `nghia`, `cauGoiNho` (bộ phận ghép và câu gợi nhớ tiếng Việt), và `reviewStatus: "draft"`

**Given** `scripts/build-content.mjs`
**When** chạy `npm run build:content`
**Then** script gom JLPTSuccess, `content-vi` và `n5_vocab.json` thành `content/kanji.json` đúng schema ghi trong `content/SCHEMA.md`. Mỗi chữ có: id là chính chữ đó, âm Hán Việt, nghĩa, câu gợi nhớ, bộ phận, âm on/kun kèm đường dẫn audio, đường dẫn SVG thứ tự nét, tối đa 3 ví dụ từ vựng (id `n5-xxxx`), chữ dễ nhầm, reviewStatus (AD-3)
**And** script **báo lỗi và dừng** nếu có chữ nào thiếu âm Hán Việt, nghĩa hoặc câu gợi nhớ (FR1)
**And** `npm run build` tự chạy `build:content` trước, và GitHub Actions cũng làm như vậy

**Given** `core/content`
**When** một tính năng gọi `content.kanji()` hoặc `content.kanjiById('日')`
**Then** nhận dữ liệu từ `content/kanji.json`. Không tính năng nào được đọc file nguồn trực tiếp (AD-3)

### Story 1.3: Xem danh sách và trang chi tiết kanji

As a Hannah,
I want xem từng kanji N5 với âm Hán Việt, câu gợi nhớ, cách đọc có audio và thứ tự nét,
So that mình nhớ chữ theo cách hiểu thay vì chép vẹt.

**Acceptance Criteria:**

**Given** đang ở `#/kanji`
**When** màn hình mở ra
**Then** thấy lưới đủ 106 kanji, mỗi ô là `SkillTile` màu `skill-kanji`, chữ dùng `kt-jp` + `lang="ja"`, bên dưới là âm Hán Việt (UX-DR6)
**And** chữ có `reviewStatus: "draft"` mang `Chip` "Chưa duyệt"

**Given** chạm vào một chữ, ví dụ 日
**When** mở `#/kanji/日`
**Then** thấy chữ lớn, âm Hán Việt (NHẬT), nghĩa tiếng Việt, các bộ phận ghép, câu gợi nhớ, âm on/kun mỗi âm có nút phát (`IconButton`), hình thứ tự nét, ví dụ từ vựng, chữ dễ nhầm (bấm vào để chuyển sang chữ đó) (FR1)
**And** câu gợi nhớ và ví dụ nằm trong ô `surface-sunken`, toàn màn hình chỉ có một khối `surface-tint` (UX-DR11, AD-9)

**Given** bấm nút phát một âm đọc
**When** audio tải xong
**Then** phát đúng file của âm đó. Nếu tải lỗi thì hiện thông báo tiếng Việt, không làm hỏng màn hình

**Given** chữ không tồn tại, ví dụ `#/kanji/xyz`
**When** mở
**Then** hiện `EmptyState` "Không tìm thấy chữ này" kèm nút quay lại danh sách (UX-DR8)

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của SkillTile, Chip, IconButton, EmptyState, Flashcard
**Then** markup, class và token khớp với preview. Chữ đạt tương phản 4.5:1 ở cả theme sáng và tối (AD-9, UX-DR14)

### Story 1.4: Lưu tiến độ và sao lưu ra file

As a Hannah,
I want tiến độ học được lưu trên máy và xuất/nhập được file sao lưu,
So that không mất công học khi đổi máy hoặc lỡ bị xoá dữ liệu.

**Acceptance Criteria:**

**Given** `core/progress`
**When** khởi tạo lần đầu
**Then** tạo dữ liệu trong localStorage ở khoá `kotoba:v1`, có `schemaVersion: 1`
**And** chỉ `core/progress` được gọi `localStorage`. Có test Vitest kiểm tra không file nào khác trong `src/` dùng `localStorage` (AD-4)

**Given** một tính năng ghi dữ liệu qua API của `progress`
**When** ghi xong
**Then** `progress` phát sự kiện `progress:changed`. Nếu localStorage bị lỗi (đầy hoặc bị chặn) thì hiện thông báo tiếng Việt, app không treo

**Given** đang ở màn Cài đặt (`#/cai-dat`)
**When** bấm "Xuất sao lưu"
**Then** tải về file `kotoba-sao-luu-YYYY-MM-DD.json` chứa toàn bộ dữ liệu `kotoba:v1`, và ghi lại ngày sao lưu gần nhất (NFR3, AD-7)

**Given** chọn một file sao lưu hợp lệ
**When** bấm "Nhập sao lưu" và xác nhận trong hộp thoại tự dựng (không dùng `confirm()`)
**Then** dữ liệu được thay bằng nội dung file. Nếu file có `schemaVersion` cũ hơn thì chạy hàm chuyển đổi trước khi nhập
**And** file không hợp lệ thì báo lỗi tiếng Việt và giữ nguyên dữ liệu cũ

**Given** màn Cài đặt
**When** đối chiếu với preview các component đã dùng (Button, SectionHeader)
**Then** khớp thiết kế: nút chính dùng `primary-strong`, mỗi màn chỉ một nút chính (AD-9)

### Story 1.5: Học gói kanji mới mỗi ngày

As a Hannah,
I want mỗi ngày học một gói kanji mới vừa sức,
So that mình tiến đều mà không bị ngợp.

**Acceptance Criteria:**

**Given** chưa học hết 106 kanji
**When** mở `#/kanji/hoc-moi`
**Then** thấy gói kanji mới của hôm nay, mặc định tối đa 5 chữ, theo thứ tự trong `content/kanji.json` (FR2)
**And** mỗi chữ hiện bằng `ui/cards/kanji` (dựa trên Flashcard: chữ lớn `font-jp`, chạm để lật xem âm Hán Việt, nghĩa, câu gợi nhớ, ví dụ) (UX-DR11)

**Given** đã xem hết thẻ của gói
**When** bấm "Đã học xong"
**Then** các chữ được ghi vào `progress` là "đã giới thiệu" kèm ngày học, và số chữ mới còn lại trong ngày giảm theo
**And** hiện `GoalComplete` (Pyon `celebrate`) (UX-DR7)

**Given** đã học đủ hạn mức hôm nay
**When** mở lại `#/kanji/hoc-moi`
**Then** hiện `EmptyState` "Hôm nay đủ rồi, mai học tiếp nhé" (UX-DR8)

**Given** màn Cài đặt
**When** đổi "Số kanji mới mỗi ngày" sang giá trị từ 1 đến 10
**Then** hạn mức mới áp dụng từ lần mở tiếp theo và được lưu trong `progress`

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của Flashcard và GoalComplete
**Then** khớp thiết kế. Chuyển động tôn trọng `prefers-reduced-motion`, và lật thẻ được bằng phím Space/Enter (AD-9, UX-DR14)

### Story 1.6: Thêm Kotoba vào màn hình chính iPhone

As a Hannah,
I want mở Kotoba từ biểu tượng trên màn hình chính,
So that Safari không xoá tiến độ của mình sau 7 ngày không mở trang.

**Acceptance Criteria:**

**Given** app trên GitHub Pages
**When** chọn "Thêm vào màn hình chính" trong Safari iPhone
**Then** có biểu tượng Kotoba (vẽ từ Pyon theo bộ `Pyon-Icons`) và tên "Kotoba". Mở từ biểu tượng thì app chạy toàn màn hình, không có thanh địa chỉ (AD-7)
**And** có `manifest.webmanifest`, `apple-touch-icon`, `theme-color` lấy từ token màu nền

**Given** đang mở trong tab Safari thường (`navigator.standalone` không bật)
**When** vào trang chủ
**Then** hiện thẻ hướng dẫn 3 bước thêm vào màn hình chính, có giải thích ngắn lý do (Safari xoá dữ liệu sau 7 ngày không mở), và có nút "Để sau"

**Given** đã quá 7 ngày kể từ lần sao lưu gần nhất (ngày lấy từ `progress`)
**When** mở app
**Then** trang chủ hiện lời nhắc xuất sao lưu, có nút dẫn tới màn Cài đặt (AD-7)

**Given** các thẻ hướng dẫn và nhắc nhở
**When** đối chiếu thiết kế
**Then** chỉ dùng token và component có sẵn. Không thêm mảng màu thứ hai trong cùng một khối (AD-9)

### Story 1.7: Thêm 4 kanji 多 少 耳 魚

As a Hannah,
I want có đủ 110 kanji, gồm cả 4 chữ trong lộ trình N5 mà app còn thiếu,
So that không bỏ sót chữ nào sẽ gặp trong đề.

**Acceptance Criteria:**

**Given** 4 chữ 多 少 耳 魚 không có trong dữ liệu JLPTSuccess
**When** bổ sung vào `content-vi/kanji-extra.json` (AI soạn on/kun, bộ phận, Hán Việt, nghĩa, câu gợi nhớ, `reviewStatus: "draft"`) và tải SVG KanjiVG của 4 chữ
**Then** `content/kanji.json` có 110 chữ. 4 chữ mới đứng sau chữ cùng nhóm nghĩa theo bảng mục 4 của lộ trình (FR24)
**And** âm đọc của 4 chữ này phát bằng `speechSynthesis` `ja-JP`, vì JLPTSuccess không có audio; script kiểm tra build vẫn báo lỗi nếu thiếu trường

## Epic 2: Ôn tập mỗi ngày từ trang chủ

Mở app là thấy ngay việc cần làm hôm nay. Chạm một lần là ôn kanji theo 3 chiều và ôn 718 từ vựng, theo lịch FSRS. Thời gian học thực được ghi lại. Trang chủ có đếm ngược ngày thi và nhắc đăng ký thi.

### Story 2.1: Ôn kanji theo lịch FSRS, 3 chiều

As a Hannah,
I want ôn những kanji đã học đúng lúc sắp quên, theo nhiều chiều,
So that mình nhớ cả nghĩa, cách đọc lẫn mặt chữ.

**Acceptance Criteria:**

**Given** `core/srs` bọc ts-fsrs 6.0.0
**When** một kanji được "giới thiệu" (Story 1.5)
**Then** sinh 3 thẻ: `kanji-nghia:<chữ>` (nhìn chữ đoán nghĩa), `kanji-doc:<chữ>` (nhìn chữ chọn cách đọc), `kanji-chu:<chữ>` (nhìn âm Hán Việt và nghĩa, chọn đúng chữ). Trạng thái thẻ lưu trong `progress` (AD-6, FR3)
**And** những kanji đã "giới thiệu" từ trước khi có story này (Story 1.5) cũng được tạo đủ 3 thẻ trong lần chạy đầu tiên
**And** có test Vitest cho `core/srs`: trả lời đúng thì hạn ôn lùi xa hơn, trả lời sai thì hạn ôn về sớm (FR7)

**Given** có thẻ kanji đến hạn
**When** mở `#/on-tap/kanji`
**Then** thẻ `kanji-nghia` hiện bằng `ui/cards/kanji` trong `Flashcard` (vuốt phải "Đã nhớ", vuốt trái "Ôn lại" màu trung tính, chạm để lật). Thẻ `kanji-doc` và `kanji-chu` hiện dạng trắc nghiệm 4 lựa chọn bằng `QuizOption` (UX-DR4, UX-DR5)
**And** đầu phiên có `SegmentedProgress` màu `skill-kanji` và đếm `4 / 12`

**Given** trả lời một thẻ
**When** vuốt hoặc chọn đáp án
**Then** `core/srs` tính lại lịch ôn và ghi qua `progress`. Trắc nghiệm hiện hộp phản hồi có Pyon (`happy` khi đúng, `oops` khi sai)

**Given** hết thẻ đến hạn
**When** phiên kết thúc
**Then** hiện `GoalComplete`. Nếu mở `#/on-tap/kanji` khi không có thẻ nào đến hạn thì hiện `EmptyState` (UX-DR7, UX-DR8)

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của Flashcard, QuizOption, SegmentedProgress, GoalComplete
**Then** khớp thiết kế. Phím ← → Space dùng được trên Flashcard (AD-9, UX-DR14)

### Story 2.2: Ôn 718 từ vựng N5 có phát âm

As a Hannah,
I want ôn từ vựng N5 có nghĩa tiếng Việt và nghe được phát âm,
So that mình nhớ từ và quen tai.

**Acceptance Criteria:**

**Given** `n5_vocab.json` có 718 từ
**When** chạy `npm run build:content`
**Then** sinh `content/vocab.json` theo `content/SCHEMA.md`, giữ nguyên id `n5-xxxx`, có từ, cách đọc, nghĩa tiếng Việt, loại từ, chủ đề (AD-3)

**Given** mở `#/on-tap/tu-vung`
**When** có thẻ `vocab:<id>` đến hạn, hoặc còn từ mới trong hạn mức ngày (mặc định 10 từ, chỉnh được trong Cài đặt)
**Then** từ hiện bằng `ui/cards/vocab` trong `Flashcard`: chữ lớn, kana ở trên, nghĩa tiếng Việt ở mặt sau, chip chủ đề, màu `skill-vocab` (UX-DR4, UX-DR6, FR8)
**And** lịch ôn do `core/srs` tính (FR7)

**Given** bấm nút phát âm, hoặc lật thẻ khi tính năng tự đọc đang bật
**When** trình duyệt có giọng tiếng Nhật
**Then** đọc từ bằng Web Speech API (`speechSynthesis`, giọng `ja-JP`). Nếu không có giọng tiếng Nhật thì ẩn nút phát và hiện ghi chú một lần
**And** tự đọc có thể tắt trong Cài đặt

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của Flashcard và Chip
**Then** khớp thiết kế (AD-9)

### Story 2.3: Ghi lại thời gian học thực

As a Hannah,
I want app tự đếm đúng số phút mình thật sự học mỗi ngày,
So that mình thấy công sức của mình, và cây học tập sau này mọc đúng.

**Acceptance Criteria:**

**Given** `core/study-clock`
**When** một tính năng gọi `studyClock.activity()` (khi lật thẻ, vuốt, chọn đáp án, phát audio)
**Then** đồng hồ bắt đầu hoặc tiếp tục đếm. Quá 60 giây không có `activity()` nào thì dừng đếm, và không tính phần thời gian chờ đó (FR10, AD-5)
**And** khi app bị ẩn (`visibilitychange`) thì dừng đếm ngay

**Given** đồng hồ đang đếm
**When** ít nhất mỗi 15 giây, hoặc khi dừng đếm
**Then** số giây được cộng vào `progress` theo ngày `YYYY-MM-DD` giờ trên máy. Nếu phiên kéo qua nửa đêm thì phần sau nửa đêm tính cho ngày mới

**Given** các màn ôn tập ở Story 2.1, 2.2 và học mới ở Story 1.5
**When** có tương tác
**Then** đều gọi `studyClock.activity()`. Không màn hình nào tự đếm giờ riêng (AD-5)

**Given** test Vitest với đồng hồ giả lập (fake timers)
**When** mô phỏng: hoạt động 5 phút, nghỉ 3 phút, hoạt động thêm 2 phút
**Then** ghi nhận khoảng 7 phút, sai số không quá 60 giây

### Story 2.4: Trang chủ "việc hôm nay"

As a Hannah,
I want mở app là biết ngay hôm nay cần học gì và chạm một lần là bắt đầu,
So that mình không phải tự quyết định, nên đỡ ngại bắt đầu.

**Acceptance Criteria:**

**Given** `core/growth`
**When** tính `dueToday()`
**Then** trả về số thẻ đến hạn theo từng loại, số kanji mới và số từ mới còn trong hạn mức hôm nay. Đây là hàm thuần, có test (AD-8)

**Given** mở `#/` (trang chủ)
**When** màn hình dựng xong
**Then** thấy, từ trên xuống:
- `Greeting` "Chào, **Hannah!**" kèm dòng phụ
- `ActiveLessonCard` là khối `surface-tint` duy nhất trên màn, ghi "Hôm nay: 12 thẻ cần ôn · 3 kanji mới", có nút bắt đầu
- cặp `StatCard`: phút học hôm nay, kanji đã học trên 106
- `StreakTracker`: chuỗi ngày học
- `CourseProgressCard`: kanji đã thuộc (UX-DR3, UX-DR9, UX-DR13, FR6)

**Given** đang ở trang chủ
**When** bấm nút bắt đầu trên `ActiveLessonCard`, hoặc nút tròn giữa `BottomNav`
**Then** vào thẳng việc tiếp theo: ôn thẻ kanji đến hạn trước, rồi đến thẻ từ vựng, rồi đến kanji mới. Làm xong một phần thì tự chuyển sang phần kế tiếp (FR6)
**And** phiên ôn hằng ngày (`features/review`) hiển thị thẻ qua bảng đăng ký `ui/cards/<loại>`. Thẻ thuộc loại chưa đăng ký thì bỏ qua, không gây lỗi. Nhờ vậy các loại thẻ mới (cách đọc, câu thi sai) chỉ cần đăng ký thêm (AD-2, AD-8)

**Given** đã làm xong mọi việc hôm nay
**When** quay về trang chủ
**Then** `ActiveLessonCard` đổi thành "Xong việc hôm nay!" kèm Pyon `celebrate` (một Pyon trên màn)

**Given** trang chủ đã xong
**When** đối chiếu với `preview.html` của Greeting, ActiveLessonCard, StatCard, StreakTracker, CourseProgressCard
**Then** khớp thiết kế: chỉ một khối `surface-tint`, `peach` chỉ dùng cho ngọn lửa của chuỗi ngày học (AD-9)

### Story 2.5: Đếm ngược ngày thi và nhắc đăng ký

As a Hannah,
I want thấy còn bao nhiêu ngày tới kỳ thi và được nhắc đăng ký đúng lúc,
So that mình không lỡ hạn đăng ký và có động lực học.

**Acceptance Criteria:**

**Given** Cài đặt có "Ngày thi", mặc định 04/07/2027 (Chủ nhật đầu tháng 7/2027), chỉnh được
**When** mở trang chủ
**Then** thấy "Còn N ngày tới JLPT N5". Số ngày do `core/growth` tính bằng hàm thuần, có test (FR19, AD-8)

**Given** hôm nay từ 01/03/2027 trở đi, và Hannah chưa đánh dấu "Đã đăng ký thi"
**When** mở trang chủ
**Then** hiện lời nhắc "Đăng ký thi JLPT tháng 7 thường mở tháng 3–4 và nhanh kín chỗ", có link tới trang JLPT của Japan Foundation Việt Nam và nút "Đã đăng ký" (FR19)

**Given** bấm "Đã đăng ký"
**When** quay lại trang chủ
**Then** lời nhắc không hiện nữa (trạng thái lưu trong `progress`)

**Given** đếm ngược và lời nhắc đã xong
**When** đối chiếu thiết kế
**Then** dùng `Chip` và `SectionHeader` có sẵn, không thêm khối `surface-tint` thứ hai (AD-9)

### Story 2.6: Học từ vựng mới theo chủ đề

As a Hannah,
I want học từ mới theo từng chủ đề quen thuộc,
So that mình học từ vựng có hệ thống như lộ trình N5.

**Acceptance Criteria:**

**Given** 718 từ thuộc 21 chủ đề trong `content/vocab.json`
**When** mở `#/tu-vung`
**Then** thấy 21 chủ đề, mỗi chủ đề là một `CourseProgressCard` với số từ đã học trên tổng, màu `skill-vocab`. Thứ tự chủ đề theo mục 5.1 của lộ trình (FR25)

**Given** chọn một chủ đề
**When** bấm "Học từ mới"
**Then** học gói N từ (mặc định 10, chỉnh được) bằng `ui/cards/vocab`. Xem hết thì từ được ghi "đã học" và tạo thẻ `vocab:<id>` trong `core/srs`

## Epic 3: Làm chủ cách đọc bất quy tắc

Hannah xem bảng cách đọc ngày, tháng, giờ/phút và cách đếm, thấy rõ đâu là quy tắc và đâu là ngoại lệ, luyện có phát âm. Các ngoại lệ tự vào lịch ôn của Epic 2.

### Story 3.1: Bảng cách đọc bất quy tắc

As a Hannah,
I want xem bảng cách đọc ngày, tháng, giờ, phút và cách đếm, có tô rõ ngoại lệ,
So that mình hiểu vì sao 一日 đọc là ついたち chứ không phải học vẹt.

**Acceptance Criteria:**

**Given** AI soạn `content-vi/readings.json` với `reviewStatus: "draft"`
**When** chạy `npm run build:content`
**Then** sinh `content/readings.json` gồm 6 nhóm: ngày trong tháng (1–31), tháng (1–12), giờ (1–12), phút (1–10, 15, 20, 30), đếm người (1–10), đếm đồ vật chung つ (1–10). Có thêm một nhóm trợ số từ 本/枚/個 (1–10) (FR4)
**And** mỗi mục có: id `<nhóm>-<số>` (ví dụ `day-01`), chữ, cách đọc, cờ `ngoaiLe: true/false`, và với ngoại lệ thì có một câu giải thích tiếng Việt ngắn (ví dụ "ついたち là cách đọc cổ, không theo số đếm") (AD-3)
**And** script báo lỗi nếu nhóm nào thiếu mục, hoặc ngoại lệ nào thiếu câu giải thích

**Given** mở `#/cach-doc`
**When** màn hình dựng xong
**Then** thấy danh sách 7 nhóm bằng `SkillTile` màu `skill-kanji`. Chạm vào một nhóm thì mở `#/cach-doc/<nhóm>`

**Given** đang xem một nhóm, ví dụ ngày trong tháng
**When** màn hình dựng xong
**Then** bảng hiện mọi mục trên ô thẻ trắng. Mục ngoại lệ có `Chip` "Ngoại lệ" và câu giải thích. Không thêm mảng màu thứ hai trong cùng một khối (UX-DR12)
**And** mỗi mục có nút phát âm bằng `speechSynthesis` `ja-JP`, giống Story 2.2

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của SkillTile, Chip, IconButton
**Then** khớp thiết kế. Chữ Nhật dùng `kt-jp` + `lang="ja"` (AD-9)

### Story 3.2: Luyện cách đọc và đưa ngoại lệ vào lịch ôn

As a Hannah,
I want luyện từng nhóm cách đọc và tự động được ôn lại các ngoại lệ,
So that những cách đọc khó dính vào đầu cho tới ngày thi.

**Acceptance Criteria:**

**Given** đang ở một nhóm cách đọc
**When** bấm "Luyện nhóm này"
**Then** nhận 10 câu trắc nghiệm `QuizOption` (cho chữ, chọn cách đọc đúng trong 4 cách). Đáp án sai được lấy từ những cách đọc dễ nhầm trong cùng nhóm, ví dụ よっか / よんにち / しにち (FR5, UX-DR5)
**And** đầu phiên có `SegmentedProgress` màu `skill-kanji`. Hộp phản hồi có Pyon và câu giải thích của ngoại lệ

**Given** đã luyện một nhóm lần đầu
**When** kết thúc phiên
**Then** mọi mục `ngoaiLe: true` của nhóm đó được tạo thẻ `reading:<id>` trong `core/srs`, và xuất hiện trong phần ôn tập hằng ngày ở trang chủ (FR5, AD-6)

**Given** thẻ `reading:<id>` đến hạn
**When** ôn từ trang chủ (Story 2.4)
**Then** thẻ hiện bằng `ui/cards/reading` dạng trắc nghiệm (story này tạo component và đăng ký loại `reading` vào bảng thẻ của Story 2.4), lịch ôn được tính lại sau khi trả lời (UX-DR11)

**Given** mọi tương tác trong phiên luyện
**When** chọn đáp án hoặc phát âm
**Then** gọi `studyClock.activity()` (AD-5)

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của QuizOption và SegmentedProgress
**Then** khớp thiết kế (AD-9)

## Epic 4: Luyện nghe theo dạng đề N5

Hannah luyện 50 bài nghe theo 4 dạng bài, chọn nghe tốc độ thường hoặc chậm. Lời thoại và giải thích tiếng Việt chỉ hiện sau khi đã trả lời.

### Story 4.1: Gom nội dung bài nghe

As a Hannah,
I want có 50 bài nghe N5 kèm giải thích tiếng Việt,
So that mình luyện nghe đúng dạng đề với nội dung mình hiểu được.

**Acceptance Criteria:**

**Given** `listening.json` và 100 file mp3 (tốc độ thường và chậm) của JLPTSuccess
**When** chép vào `vendor/jlptsuccess/` và `public/audio/listening/`
**Then** đủ 50 bài thuộc 4 dạng `task_understanding`, `point_understanding`, `utterance_expression`, `immediate_response`, có ghi công VOICEVOX theo `NOTICES.md` của JLPTSuccess (NFR5)

**Given** AI dịch `explanation_en` của 50 bài sang tiếng Việt
**When** lưu vào `content-vi/listening.json` với `reviewStatus: "draft"`
**Then** `npm run build:content` sinh `content/listening.json` có: id gốc, dạng bài (kèm tên tiếng Việt: Hiểu nhiệm vụ, Hiểu điểm chính, Diễn đạt bằng lời, Phản hồi nhanh), audio thường và chậm, lời thoại, câu hỏi, 4 lựa chọn, đáp án, giải thích tiếng Việt (AD-3)
**And** script báo lỗi nếu bài nào thiếu giải thích tiếng Việt hoặc thiếu file audio

### Story 4.2: Màn hình luyện nghe

As a Hannah,
I want nghe từng bài, chọn đáp án rồi mới xem lời thoại và giải thích,
So that mình luyện tai thật chứ không đọc lén.

**Acceptance Criteria:**

**Given** mở `#/luyen-nghe`
**When** màn hình dựng xong
**Then** thấy 4 dạng bài bằng `SkillTile` màu `skill-speaking` (icon mic), mỗi dạng có số bài đã làm trên tổng (UX-DR6)

**Given** đang làm một bài (`#/luyen-nghe/<id>`)
**When** bấm phát
**Then** phát audio tốc độ thường. Có nút chuyển sang bản chậm, và nghe lại được bao nhiêu lần tuỳ ý (FR14)
**And** trình phát là component dùng chung `src/ui/audio-player`, không nằm trong `features/listening`, để Epic 5 dùng lại được mà không phải import chéo tính năng (AD-2)
**And** lời thoại **bị ẩn** cho tới khi Hannah chọn đáp án (FR15)

**Given** chọn một đáp án bằng `QuizOption`
**When** chọn xong
**Then** hiện đúng/sai với Pyon, rồi mới mở lời thoại (`kt-jp`, chia theo lượt nói 男/女) và giải thích tiếng Việt. Kết quả lưu vào `progress` (UX-DR5)

**Given** mọi lần phát audio hoặc chọn đáp án
**When** xảy ra
**Then** gọi `studyClock.activity()` (AD-5)

**Given** audio không tải được
**When** bấm phát
**Then** hiện thông báo tiếng Việt và nút thử lại, màn hình không bị hỏng

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của SkillTile, QuizOption, IconButton
**Then** khớp thiết kế (AD-9)

## Epic 5: Làm đề thi thử và xem điểm ước tính

Hannah làm đề thi thử rút gọn khoảng 30 phút, không bấm giờ, gồm đủ các phần. Nộp bài xong thấy điểm quy đổi theo thang JLPT so với điểm sàn và kết luận đỗ hay trượt. Câu sai có giải thích tiếng Việt và tự vào lịch ôn.

### Story 5.1: Gom ngân hàng câu hỏi thi thử

As a Hannah,
I want có ngân hàng câu hỏi thi thử N5 với giải thích tiếng Việt,
So that mỗi đề thi thử có nội dung đủ phần và hiểu được vì sao sai.

**Acceptance Criteria:**

**Given** 28 đề nhỏ (402 câu) trong `papers/moji|goi|bunpou|dokkai` của JLPTSuccess
**When** chép vào `vendor/jlptsuccess/papers/`
**Then** giữ nguyên id câu (ví dụ `bunpou-1.1`), phần thi, mondai, đề bài, 4 lựa chọn, `correctIndex`, `rationale` (NFR5)

**Given** AI dịch `rationale` của 402 câu sang tiếng Việt
**When** lưu vào `content-vi/mock.json` với `reviewStatus: "draft"`
**Then** `npm run build:content` sinh `content/mock-bank.json` chia 5 phần: `moji` (chữ), `goi` (từ vựng), `bunpou` (ngữ pháp), `dokkai` (đọc hiểu, giữ đoạn văn đi chung với các câu hỏi của nó), `choukai` (nghe, lấy từ 50 bài ở `content/listening.json`) (AD-3, FR18)
**And** script báo lỗi nếu câu nào thiếu giải thích tiếng Việt

### Story 5.2: Làm đề thi thử 30 phút, không bấm giờ

As a Hannah,
I want làm một đề thi thử ngắn đủ các phần như đề thật,
So that mình quen dạng đề mà không bị áp lực thời gian.

**Acceptance Criteria:**

**Given** bấm "Làm đề mới" ở `#/thi-thu`
**When** đề được tạo
**Then** đề có 24 câu: chữ 6, từ vựng 5, ngữ pháp 6, đọc hiểu 1 đoạn với 2–3 câu, nghe 4 bài. Ưu tiên câu chưa làm, chỉ lặp câu cũ khi đã dùng hết câu mới. Đề được lưu trong `progress` để làm dở rồi quay lại tiếp được (FR16)
**And** **không** có đếm ngược, không hiện thời gian, không tự nộp bài (FR16)

**Given** đang làm đề
**When** chuyển câu
**Then** mỗi câu hiện bằng `QuizOption`, có tên phần và `Chip` màu kỹ năng (ngữ pháp `skill-grammar` 文, chữ `skill-kanji`, từ vựng `skill-vocab`, nghe `skill-speaking`). `SegmentedProgress` chia theo 24 câu. Câu nghe dùng `ui/audio-player` (Story 4.2), lời thoại chỉ hiện sau khi nộp bài (UX-DR5, UX-DR6)
**And** trong lúc làm, **không** hiện đúng/sai (khác với luyện tập). Mỗi lần chọn đáp án gọi `studyClock.activity()`

**Given** đã làm xong, hoặc muốn dừng
**When** bấm "Nộp bài" và xác nhận trong hộp thoại tự dựng
**Then** bài được chấm, và chuyển sang màn kết quả (Story 5.3)

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của QuizOption, Chip, SegmentedProgress
**Then** khớp thiết kế (AD-9)

### Story 5.3: Kết quả thi thử, quy đổi điểm và đưa câu sai vào lịch ôn

As a Hannah,
I want biết nếu thi thật thì mình được khoảng bao nhiêu điểm, phần nào yếu,
So that mình biết cần ôn gì tiếp.

**Acceptance Criteria:**

**Given** `core/growth` có hàm `estimateJlptScore(ketQua)` (hàm thuần, có test)
**When** chấm một đề
**Then** điểm Kiến thức ngôn ngữ + Đọc hiểu = (số câu đúng ở chữ, từ vựng, ngữ pháp, đọc hiểu ÷ tổng số câu các phần đó) × 120, làm tròn. Điểm Nghe = (đúng ÷ tổng câu nghe) × 60. Tổng = hai phần cộng lại (FR17, AD-8)
**And** **đỗ** chỉ khi tổng từ 80 trở lên, phần ngôn ngữ từ 38 trở lên **và** phần nghe từ 19 trở lên. Có test cho trường hợp tổng đủ 80 nhưng phần nghe dưới 19 thì vẫn trượt

**Given** màn kết quả
**When** dựng xong
**Then** thấy `CourseProgressCard` cho từng phần (điểm, điểm sàn), tổng điểm lớn, kết luận "Đỗ (ước tính)" hoặc "Chưa đỗ (ước tính)", dòng chú thích "Điểm ước tính từ đề rút gọn, không phải điểm thật" (FR17, UX-DR13)
**And** đỗ thì hiện `GoalComplete`. Chưa đỗ thì Pyon `oops` cùng tên phần yếu nhất (UX-DR7)

**Given** xem lại bài
**When** mở từng câu
**Then** thấy đáp án đã chọn, đáp án đúng, giải thích tiếng Việt, và lời thoại với câu nghe (FR18)

**Given** có câu làm sai
**When** chấm xong
**Then** mỗi câu sai được tạo thẻ `mock:<id câu>` trong `core/srs` và xuất hiện ở phần ôn tập trang chủ, hiện bằng `ui/cards/mock`. Story này tạo component và đăng ký loại `mock` vào bảng thẻ của Story 2.4 (FR18, AD-6, UX-DR11)

**Given** `#/thi-thu`
**When** mở
**Then** thấy lịch sử các đề đã làm với tổng điểm ước tính, mới nhất ở trên

**Given** màn hình đã xong
**When** đối chiếu với `preview.html` của CourseProgressCard, GoalComplete
**Then** khớp thiết kế: chỉ một khối `surface-tint`, một Pyon trên màn (AD-9)

## Epic 6: Cây học tập

Cây mọc theo thời gian học thực (dùng số liệu Epic 2 đã ghi), héo sau mỗi 7 ngày không học, hồi phục khi học lại. Sau mỗi phiên có hiệu ứng cây mọc và Pyon tưới cây. Cây xuất hiện ở trang chủ và có màn hình riêng. Ưu tiên thấp nhất, được phép ra sau ngày 30/11.

### Story 6.1: Luật mọc và héo của cây

As a Hannah,
I want cây mọc đúng theo thời gian mình học và héo khi mình bỏ học,
So that cây phản ánh đúng công sức của mình.

**Acceptance Criteria:**

**Given** `core/growth` có hàm `treeState(lichSuHoc, homNay, ngayThi, ngayBatDau)` (hàm thuần)
**When** tính độ cao
**Then** độ cao = tổng giây học thực ÷ (15 phút × số ngày từ ngày bắt đầu đến ngày thi), giới hạn trong khoảng 0–1. Chia thành 6 giai đoạn: hạt, mầm, cây non, cây nhỡ, cây lớn, ra hoa. Học trung bình 15 phút mỗi ngày thì ra hoa vào khoảng ngày thi (FR9, AD-5, AD-8)
**And** độ cao **không bao giờ giảm** (FR12)

**Given** ngày học gần nhất cách hôm nay N ngày
**When** tính mức héo
**Then** mức héo = min(3, số chu kỳ 7 ngày liên tiếp không học, cộng dồn) trừ đi số phiên hồi phục. Ví dụ: không học 6 ngày → mức 0, ngày thứ 7 → mức 1, ngày thứ 14 → mức 2 (FR11)

**Given** cây đang héo
**When** có một ngày học từ 10 phút trở lên
**Then** mức héo giảm 1. Nhiều ngày như vậy thì giảm dần cho tới 0 (FR12)

**Given** test Vitest
**When** chạy bộ test các trường hợp: 0 ngày, 6, 7, 14, 21, 30 ngày không học, học lại 1 phiên và 2 phiên 10 phút, phiên 9 phút, ngày thi đã qua
**Then** tất cả đều cho kết quả đúng theo luật trên

### Story 6.2: Cây trên trang chủ và màn hình cây

As a Hannah,
I want thấy cây của mình ngay trên trang chủ và xem cây to trong màn hình riêng,
So that mỗi lần mở app mình muốn học để cây lớn thêm.

**Acceptance Criteria:**

**Given** component mới `ui/tree-view`
**When** nhận `{ giaiDoan, doCao, mucHeo }` từ `core/growth.treeState`
**Then** vẽ cây bằng SVG tại chỗ theo 6 giai đoạn và 4 mức héo (0 tươi, 3 héo nặng: lá rũ, đổi sang tông nhạt). Chỉ dùng màu từ token, không ghi cứng mã màu. Phong cách khối tròn, bóng mềm, không nét viền, hợp với 5 nguyên tắc của Kotoba UI (UX-DR10, AD-9)
**And** có nhãn trợ năng, ví dụ "Cây đang ở giai đoạn cây non, hơi héo"

**Given** trang chủ (Story 2.4)
**When** dựng xong
**Then** có thẻ cây nhỏ dùng `ui/tree-view` dưới `ActiveLessonCard`, bấm vào thì mở `#/cay`. Không thêm khối `surface-tint` thứ hai (AD-8, AD-9)

**Given** mở `#/cay`
**When** dựng xong
**Then** thấy cây lớn, giai đoạn hiện tại, tổng giờ học, số phút còn thiếu để lên giai đoạn sau, và trạng thái héo kèm câu tiếng Việt nói rõ cách hồi phục ("Học 10 phút để cây tươi lại")

**Given** màn hình đã xong
**When** đối chiếu thiết kế
**Then** chỉ dùng token và component có sẵn, chuyển động tôn trọng `prefers-reduced-motion` (AD-9, UX-DR14)

### Story 6.3: Hiệu ứng cây mọc và Pyon tưới cây sau phiên học

As a Hannah,
I want thấy cây mọc thêm và Pyon tưới cây mỗi khi học xong,
So that mình có cảm giác được thưởng ngay sau khi học.

**Acceptance Criteria:**

**Given** kết thúc một phiên học (ôn tập, học mới, luyện cách đọc, luyện nghe, thi thử) mà có cộng thêm thời gian học thực
**When** màn kết thúc phiên hiện ra
**Then** hiện `ui/tree-view` chuyển từ trạng thái trước phiên sang trạng thái sau phiên. Đây là Pyon duy nhất trên màn, đang tưới cây (biểu cảm `happy`, nếu cây vừa lên giai đoạn mới thì dùng `celebrate`) (FR13)
**And** màn này thay cho `GoalComplete` để trên màn chỉ có một Pyon

**Given** phiên học làm cây hồi một mức héo
**When** hiện hiệu ứng
**Then** có thêm dòng "Cây tươi lại rồi!"

**Given** bật `prefers-reduced-motion`
**When** hiện hiệu ứng
**Then** bỏ chuyển động, chỉ hiện trạng thái sau phiên (UX-DR14)

**Given** các màn kết thúc phiên đã có sẵn ở các epic trước
**When** tích hợp cây
**Then** mọi màn đó dùng chung một component kết thúc phiên đặt ở `src/ui/`. Không tính năng nào tự import `features/tree` (AD-2, AD-8)

## Epic 7: Kana & phát âm

Hannah đọc và nhận diện thành thạo hiragana và katakana, nắm các quy tắc âm ngắt, trường âm và đọc trợ từ, đếm phách đúng.

### Story 7.1: Bảng hiragana và katakana

As a Hannah,
I want xem hai bảng kana đầy đủ, có phát âm và nét viết,
So that mình học chữ cái trước mọi thứ khác.

**Acceptance Criteria:**

**Given** `content/kana.json` do `build-content` sinh từ `content-vi/kana.json` (AI soạn romaji, hàng/cột, nhóm cơ bản/đục/ghép/mở rộng, ghi chú dễ nhầm) và SVG KanjiVG của từng kana
**When** mở `#/kana`
**Then** có hai tab Hiragana/Katakana. Mỗi tab có bảng 46 chữ cơ bản, âm đục và bán đục, âm ghép; katakana có thêm phần mở rộng (ティ, ファ…) (FR20)
**And** chạm một chữ thì mở chi tiết: chữ lớn, romaji, nút phát âm (`speechSynthesis` `ja-JP`), thứ tự nét, chữ dễ nhầm
**And** dùng đúng token và component, chữ Nhật có `kt-jp` + `lang="ja"`

### Story 7.2: Luyện nhận diện kana

As a Hannah,
I want luyện nhận mặt và nghe kana đến khi thuộc,
So that mình đọc kana không phải nghĩ.

**Acceptance Criteria:**

**Given** chọn một nhóm (một hàng, cả bảng, hoặc "cặp dễ nhầm")
**When** bắt đầu luyện
**Then** gồm 10 câu trộn hai dạng: nhìn chữ chọn romaji, và nghe âm chọn chữ (`QuizOption`, Pyon phản hồi). Nhóm "cặp dễ nhầm" có シ/ツ, ソ/ン, ぬ/め, わ/ね/れ, さ/ち, ク/ケ (FR21)
**And** chữ trả lời sai được tạo thẻ `kana:<chữ>` trong `core/srs`. Mỗi tương tác gọi `studyClock.activity()` (khi Story 2.3 đã có)

### Story 7.3: Quy tắc âm ngắt, trường âm và đọc trợ từ

As a Hannah,
I want hiểu và luyện các quy tắc đọc đặc biệt của kana,
So that mình đọc đúng きって, おかあさん, コーヒー, は/へ/を.

**Acceptance Criteria:**

**Given** mục 2.4 của lộ trình
**When** mở `#/kana/quy-tac`
**Then** có giải thích tiếng Việt kèm ví dụ cho っ, trường âm hiragana, ー của katakana, は/へ/を khi làm trợ từ, katakana mở rộng (FR22)
**And** có bài đọc từ: nhìn từ chọn romaji đúng, có ví dụ lấy từ `n5_vocab`

### Story 7.4: Luyện phát âm: đếm phách và cặp âm

As a Hannah,
I want luyện đếm phách và phân biệt âm ngắn/dài, có/không có っ,
So that mình nghe và nói không bị đổi nghĩa.

**Acceptance Criteria:**

**Given** mục 3 của lộ trình
**When** mở `#/kana/phat-am`
**Then** có bài đếm phách (cho từ, chọn số phách; ví dụ とうきょう = 4) và bài nghe cặp âm (nghe một từ trong cặp おばさん/おばあさん, きて/きって, ここ/こうこう… rồi chọn từ đã nghe) (FR23)
**And** có giải thích ngắn bằng tiếng Việt về phách, nguyên âm vô thanh và ん

## Epic 8: Ngữ pháp N5

Hannah học trợ từ, chia động từ và tính từ, các mẫu câu N5 bằng giải thích tiếng Việt, rồi luyện bằng bài tập chấm tự động.

### Story 8.1: Gom nội dung ngữ pháp N5

As a Hannah,
I want có các bài ngữ pháp N5 giải thích bằng tiếng Việt,
So that mình hiểu ngữ pháp rõ hơn sách.

**Acceptance Criteria:**

**Given** `grammar.json` của JLPTSuccess (178 mẫu, MIT) và mục 6 của lộ trình
**When** AI soạn `content-vi/grammar.json` (giải thích tiếng Việt, 3 câu ví dụ có dịch, nhãn N5/N4, `reviewStatus: "draft"`)
**Then** `content/grammar.json` nhóm theo: trợ từ, です, động từ, tính từ, mẫu câu 6.5, mẫu câu 6.6. Mọi mẫu trong mục 6 của lộ trình đều có mặt (FR27)

### Story 8.2: Màn học ngữ pháp

As a Hannah,
I want xem từng bài ngữ pháp theo nhóm,
So that mình học có thứ tự.

**Acceptance Criteria:**

**Given** mở `#/ngu-phap`
**When** chọn một nhóm rồi một mẫu
**Then** thấy cấu trúc, giải thích tiếng Việt, 3 ví dụ (chữ Nhật + dịch, có nút phát âm), chip N5/N4, màu `skill-grammar` (文)

### Story 8.3: Bài tập trợ từ và chia thể

As a Hannah,
I want làm bài điền trợ từ và chia động từ/tính từ có chấm tự động,
So that mình dùng đúng ngữ pháp, không chỉ hiểu.

**Acceptance Criteria:**

**Given** một câu có chỗ trống
**When** chọn trợ từ, hoặc chọn/gõ dạng chia
**Then** chấm tự động. Có bảng chia thể ます/từ điển/て/ない/た cho động từ nhóm 1, 2, 3 và tính từ い/な (quy tắc chia có test). Sai thì giải thích tiếng Việt (FR28)

### Story 8.4: Bài sắp xếp câu (★)

As a Hannah,
I want luyện dạng sắp xếp câu như đề thật,
So that mình làm được câu ★ trong phần ngữ pháp.

**Acceptance Criteria:**

**Given** câu bị cắt thành 4 mảnh
**When** chạm để xếp các mảnh vào ô (có cách thay thế bằng bàn phím)
**Then** kiểm tra đúng thứ tự và hỏi mảnh ở vị trí ★ như đề thật (FR28)

## Epic 9: Đọc hiểu

Hannah luyện đọc ba dạng bài đọc của đề N5 và đọc kanji khi không có furigana.

### Story 9.1: Luyện đọc hiểu

As a Hannah,
I want luyện đọc các đoạn ngắn, trung bình và bài tìm thông tin,
So that mình làm được phần đọc trong đề.

**Acceptance Criteria:**

**Given** 54 bài đọc của JLPTSuccess (MIT), AI dịch giải thích sang tiếng Việt
**When** mở `#/doc-hieu`
**Then** bài được chia theo 3 dạng. Đọc xong trả lời câu hỏi, sau đó mới xem giải thích; có nút bật/tắt furigana (FR29)

### Story 9.2: Đọc kanji khi ẩn furigana

As a Hannah,
I want đọc câu có kanji mà không có furigana,
So that mình đọc được kanji trong ngữ cảnh như khi thi.

**Acceptance Criteria:**

**Given** câu ví dụ chỉ chứa từ N5
**When** luyện
**Then** câu hiện không có furigana. Hannah chọn cách đọc cho từ được gạch chân, sau đó mới hiện furigana và nghĩa. Từ sai vào lịch ôn (FR30)

## Epic 10: Lộ trình 12 tuần

Trang chủ dẫn Hannah đi theo đúng thứ tự học trong lộ trình N5.

### Story 10.1: Việc hôm nay theo tuần của lộ trình

As a Hannah,
I want trang chủ biết mình đang ở tuần mấy và gợi ý đúng việc cần học,
So that mình học theo lộ trình mà không phải tự sắp xếp.

**Acceptance Criteria:**

**Given** ngày bắt đầu lộ trình lưu trong `progress` (mặc định là ngày mở app lần đầu, chỉnh được)
**When** mở trang chủ
**Then** thấy "Tuần N / 12" và mục tiêu tuần đó theo mục "Thứ tự học đề xuất". `ActiveLessonCard` ưu tiên đúng loại bài của tuần (FR32)
**And** hàm tính tuần và mục tiêu là hàm thuần trong `core/growth`, có test

