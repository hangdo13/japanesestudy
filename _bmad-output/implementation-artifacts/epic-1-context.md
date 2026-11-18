# Epic 1 Context: Mở Kotoba trên iPhone và học kanji N5

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Hannah mở Kotoba từ biểu tượng trên màn hình chính iPhone, xem từng kanji trong khoảng 106 kanji N5, mỗi chữ có âm Hán Việt, câu gợi nhớ tiếng Việt, cách đọc có audio và thứ tự nét. Mỗi ngày Hannah học một gói kanji mới. Tiến độ được lưu trên máy và sao lưu được ra file. Epic này còn dựng nền móng cho cả app: dự án Vite + Kotoba UI, tự đưa lên GitHub Pages, script gom nội dung, kho tiến độ. Kotoba là app cá nhân, chỉ có một người dùng, cần xong bản đầu tiên trước 30/11/2026, và code do AI viết theo từng story.

## Stories

- Story 1.1: Dựng app Kotoba và đưa lên GitHub Pages
- Story 1.2: Gom nội dung kanji N5 với phần tiếng Việt do AI soạn
- Story 1.3: Xem danh sách và trang chi tiết kanji
- Story 1.4: Lưu tiến độ và sao lưu ra file
- Story 1.5: Học gói kanji mới mỗi ngày
- Story 1.6: Thêm Kotoba vào màn hình chính iPhone

## Requirements & Constraints

- Chạy trên trình duyệt điện thoại, cụ thể là Safari iPhone, và chỉ cần chạy khi có mạng. Không làm offline, không có service worker.
- Mọi chữ hiển thị viết tiếng Việt. Không làm đa ngôn ngữ (i18n).
- Không có server, không có tài khoản. Tiến độ lưu trong trình duyệt, xuất và nhập được file JSON sao lưu.
- Safari iPhone xoá dữ liệu sau 7 ngày không mở trang, trừ khi app được mở từ màn hình chính. App phải hướng dẫn Hannah thêm vào màn hình chính, và nhắc sao lưu khi đã quá 7 ngày chưa sao lưu.
- Mỗi kanji bắt buộc có âm Hán Việt, nghĩa tiếng Việt và câu gợi nhớ. Nội dung tiếng Việt do AI soạn, mặc định `reviewStatus: "draft"`. App chỉ hiển thị chip "Chưa duyệt". Muốn duyệt thì sửa file `content-vi/` rồi push.
- Mặc định học tối đa 5 kanji mới mỗi ngày, chỉnh được từ 1 đến 10.
- Phải ghi công đúng giấy phép: JLPTSuccess (MIT), KanjiVG (CC BY-SA 3.0), VOICEVOX. Không đưa đề thi có bản quyền vào repo, vì repo đang công khai.

## Technical Decisions

- **Stack:** Vite 8.3.8, JavaScript thuần với ES modules. Không dùng framework. Thư viện runtime duy nhất được thêm là ts-fsrs 6.0.0, dùng từ Epic 2. Test dùng Vitest 5.1.0.
- **Triển khai:** GitHub Actions build rồi đưa lên GitHub Pages mỗi lần push nhánh `main` của repo `hangdo13/japanesestudy`. Repo đã bật Pages với Source là GitHub Actions. App chạy ở đường dẫn con `/japanesestudy/`, nên phải đặt `base` trong cấu hình Vite.
- **Phân tầng:** `src/core/` gồm content, progress, srs, study-clock, growth, router. `src/features/<tên>/index.js` xuất `mount(el, params)`. `src/ui/` chứa Kotoba UI. Tính năng không được import lẫn nhau. Lõi không được import tính năng.
- **Điều hướng:** dùng hash route `#/<tính năng>/<tham số>`, chỉ `core/router` được định nghĩa route.
- **Nội dung:** chỉ `scripts/build-content.mjs` được đọc dữ liệu nguồn (`n5_vocab.json`, `vendor/jlptsuccess/`, `content-vi/`). Script xuất `content/*.json` theo `content/SCHEMA.md` và báo lỗi nếu thiếu trường bắt buộc. `npm run build` chạy `build:content` trước. App đọc nội dung chỉ qua `core/content`. Không sửa tay file trong `content/`.
- **Tiến độ:** chỉ `core/progress` được dùng `localStorage`, với một khoá duy nhất `kotoba:v1`. Dữ liệu có `schemaVersion`, khi đổi cấu trúc phải có hàm chuyển đổi. Mỗi lần ghi phát sự kiện `progress:changed`. Lỗi lưu trữ phải được báo bằng tiếng Việt, không làm treo app.
- **ID:** kanji dùng chính chữ đó (`日`), từ vựng dùng `n5-xxxx`. Ngày lưu dạng `YYYY-MM-DD` theo giờ trên máy, thời điểm lưu dạng ISO 8601.
- **Tên:** file và thư mục viết `kebab-case`, hàm viết `camelCase`.

## UX & Interaction Patterns

- `kotoba-design/design/kotoba-ui/` là nguồn chuẩn duy nhất về giao diện. Nạp `tokens.css`, `components/bundle.css`, `components/bundle.js`, và gọi `Kotoba.hydrate()` sau mỗi lần dựng màn hình. Font Plus Jakarta Sans cho giao diện, Noto Sans JP cho chữ Nhật (class `kt-jp` + `lang="ja"`).
- Chỉ dùng biến CSS trong `tokens.css`. Cấm ghi cứng mã màu hay giá trị px. Ghép màn hình từ component có sẵn với đúng markup và class trong `components/<Tên>/preview.html`. Đối chiếu với preview trước khi coi là xong.
- Quy tắc của thiết kế:
  - Một Pyon mỗi màn hình, đúng biểu cảm theo ngữ cảnh (`sleepy` cho màn trống, `celebrate` khi đạt mục tiêu).
  - Một khối `surface-tint` mỗi màn hình.
  - Nút dùng nấc màu đậm `primary-strong`, mỗi màn chỉ một nút chính.
  - Kanji dùng màu `skill-kanji` (字).
  - Không đặt hai mảng màu tô cạnh nhau trong cùng một khối.
- Khung điện thoại gồm `TopBar` và `BottomNav` (4 tab, nút tròn ở giữa). Màn trống hoặc lỗi dùng `EmptyState`. Thẻ học dựa trên `Flashcard` (chữ lớn `font-jp`, chạm để lật, ví dụ đặt trong ô `surface-sunken`). Ăn mừng dùng `GoalComplete`.
- Chữ đạt tương phản 4.5:1 ở cả theme sáng và tối. Tôn trọng `prefers-reduced-motion`. Có phím thay thế cho thao tác vuốt và lật. Không dùng `alert`/`confirm`, hộp thoại phải tự dựng.

## Cross-Story Dependencies

- Story 1.1 dựng khung, router và quy trình triển khai mà mọi story sau dùng.
- Story 1.2 tạo `core/content` và `content/kanji.json` cho Story 1.3 và 1.5.
- Story 1.4 tạo `core/progress` và màn Cài đặt. Story 1.5 (hạn mức, ghi chữ đã giới thiệu) và Story 1.6 (ngày sao lưu gần nhất) đều cần đến.
- Epic 2 sẽ sinh thẻ ôn từ các kanji "đã giới thiệu" ở Story 1.5, và thêm đồng hồ học vào các màn của epic này.
