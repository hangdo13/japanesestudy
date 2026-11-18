---
title: "Addendum PRD Kotoba: ghi chú kỹ thuật"
created: 2026-11-18
---

# Ghi chú kỹ thuật (để dùng ở bước Architecture)

- Nền tảng: web app tĩnh, chạy online (Vite + JavaScript thuần), không làm offline. Dùng lại `kotoba-design/design/kotoba-ui` (`tokens.css`, `components/bundle.css`, `components/bundle.js`, `Kotoba.hydrate()`).
- Nội dung lấy từ JLPTSuccess/N5 (MIT): `data/kanji.json`, `data/listening.json` cùng audio, `data/papers/*`, `data/questions.json`. Phải dịch `explanation_en` sang tiếng Việt và bổ sung âm Hán Việt.
- Từ vựng: dùng `n5_vocab.json` có sẵn (718 từ), tạo lại bằng `build_n5.py`.
- Thuật toán ôn tập: JLPTSuccess dùng FSRS-4.5, có thể tham khảo cách họ làm.
- Thứ tự nét: SVG của KanjiVG (CC BY-SA 3.0).
- Lưu tiến độ: localStorage hoặc IndexedDB.
