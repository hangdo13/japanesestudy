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
