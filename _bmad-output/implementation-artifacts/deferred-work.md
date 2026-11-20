# Deferred work

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-dung-app-kotoba-github-pages.md`
  summary: Siết `src/architecture.test.js` để bắt cả `export … from`, `import()` động, đường dẫn `/src/...`, và màu đặt tên / `oklch()` / `hwb()` / `color-mix()` ngoài token.
  evidence: Ba reviewer cùng chỉ ra regex hiện tại bỏ sót các dạng này (ví dụ `export * from '../kanji/index.js'` hay `background: white` vẫn qua test). Code hiện tại vẫn tuân thủ AD-2 và AD-9.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-gom-noi-dung-kanji.md`
  summary: Hiện okurigana cho âm kun (ví dụ ひと・つ), dựa trên `okurigana_cuts` của JLPTSuccess.
  evidence: `kun` của vendor chỉ có phần gốc (一 → ひと). `okurigana_cuts` lại gắn theo từ chứ không theo từng âm, nên cần ánh xạ cẩn thận.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-gom-noi-dung-kanji.md`
  summary: Thêm test cho base mặc định của `content.assetUrl()` khi Story 1.3 gọi hàm này lần đầu.
  evidence: Hiện test luôn truyền base, nên đổi giá trị mặc định thì không test nào bắt được.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-luu-tien-do-sao-luu.md`
  summary: Hiện thông báo "dữ liệu bị hỏng / app đang tạm ngừng ghi" ngay ở trang chủ, không chỉ ở màn Cài đặt.
  evidence: Hannah thường vào học thẳng mà không mở Cài đặt, nên có thể không biết tiến độ đã bị đặt lại. Nên làm cùng Story 2.4 (trang chủ).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-luu-tien-do-sao-luu.md`
  summary: Mở rộng luật kiến trúc AD-4 để bắt cả `sessionStorage`, `indexedDB` và `document.cookie`.
  evidence: Test hiện tại chỉ dò chữ `localStorage`.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-1-bang-kana.md`
  summary: Thêm cặp dễ nhầm giữa kana và kanji (ロ/口, エ/工, ニ/二, カ/力).
  evidence: Đây là chỗ người mới học hay nhầm. Hiện schema `capDeNham` chỉ chấp nhận kana.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-2-luyen-nhan-dien-kana.md`
  summary: `pickDistractors` bù đáp án sai từ toàn bảng chữ khi pool nhỏ (<4 âm khác nhau).
  evidence: Hiện mọi bộ đủ lớn nên không lỗi; người gọi sau có thể truyền pool nhỏ.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-2-luyen-nhan-dien-kana.md`
  summary: Một vùng `role=status` cố định cho phản hồi đúng/sai thay vì tạo mới mỗi câu.
  evidence: VoiceOver/NVDA có thể không đọc live region được chèn kèm nội dung.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-2-luyen-nhan-dien-kana.md`
  summary: Dạng câu "chữ này là hiragana hay katakana?" cho cặp cùng âm khác bảng (へ/ヘ, り/リ).
  evidence: Luật đáp án khác âm loại các cặp này khỏi câu trắc nghiệm.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-3-quy-tac-doc-kana.md`
  summary: Chuyển màn luyện kana (7.2) và học kanji (1.5) sang khung chung `ui/quiz-session.js`.
  evidence: Hiện có hai bản dựng `kt-session__head` riêng.
- source_spec: `_bmad-output/implementation-artifacts/spec-7-3-quy-tac-doc-kana.md`
  summary: Một hàm chung `isUnreviewed(status)` cho nhãn "chưa duyệt" (rules.js dùng !== 'approved', index.js dùng === 'draft').
  evidence: Trạng thái lạ sẽ hiện nhãn ở màn này mà không ở màn kia.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-2-on-tu-vung.md`
  summary: Gộp `formatWhen` (on-tap/index.js và on-tap/vocab.js) vào một chỗ dùng chung.
  evidence: Hai bản giống nhau.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-3-dong-ho-hoc.md`
  summary: Test tính năng tiêm `activity` no-op (hoặc test setup tạo đồng hồ giả) để không dùng singleton thật.
  evidence: Singleton thật ghi vào progress mặc định và giữ setInterval trong các file test.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-5-dem-nguoc-ngay-thi.md`
  summary: Chạy một phần test ngày tháng trong múi giờ có giờ mùa hè (vd. TZ=America/New_York) ở CI.
  evidence: Máy và CI ở múi không có DST nên test DST không thể sai.
