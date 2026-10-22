# Kotoba UI — thiết kế app học tiếng Nhật

- `kotoba-ui/` — design system: `tokens.json` (nguồn gốc), `tokens.css` (biến CSS, light/dark), `components/bundle.css` + `components/bundle.js` (icon, swipe flashcard, linh vật Pyon), mỗi component có `preview.html` + `README.md`.
- `mascot-pyon/` — bản vẽ linh vật Pyon (file `.dc.html` dùng trong canvas Claude Design).

Dùng trong app: nhúng `tokens.css`, `components/bundle.css`, `components/bundle.js`, rồi gọi `Kotoba.hydrate()`.
Linh vật: `<span class="kt-mascot" data-mascot="happy" data-size="120"></span>`.
