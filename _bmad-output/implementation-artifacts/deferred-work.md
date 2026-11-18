# Deferred work

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-dung-app-kotoba-github-pages.md`
  summary: Siết `src/architecture.test.js` để bắt cả `export … from`, `import()` động, đường dẫn `/src/...`, và màu đặt tên / `oklch()` / `hwb()` / `color-mix()` ngoài token.
  evidence: Ba reviewer cùng chỉ ra regex hiện tại bỏ sót các dạng này (ví dụ `export * from '../kanji/index.js'` hay `background: white` vẫn qua test). Code hiện tại vẫn tuân thủ AD-2 và AD-9.
