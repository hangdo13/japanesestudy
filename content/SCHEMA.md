# Schema nội dung Kotoba

Mọi file `content/*.json` đều do `scripts/build-content.mjs` sinh ra. **Không sửa tay.** Muốn sửa nội dung tiếng Việt thì sửa trong `content-vi/`, sau đó chạy `npm run build:content`.

## `content/kanji.json`

```json
{ "version": 1, "items": [ Kanji, ... ] }
```

`items` sắp theo thứ tự bài học (`thuTu`).

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `id` | string | Chính chữ kanji, ví dụ `"日"` |
| `thuTu` | number | Thứ tự bài học, từ 1 đến 106 |
| `hanViet` | string | Âm Hán Việt viết hoa, ví dụ `"NHẬT"` |
| `nghia` | string | Nghĩa tiếng Việt |
| `cauGoiNho` | string | Câu gợi nhớ tiếng Việt, dựa trên các bộ phận của chữ |
| `boPhan` | string[] | Các bộ phận ghép thành chữ |
| `on`, `kun` | `{ kana, audio }[]` | Âm on (katakana) và âm kun (hiragana). `audio` là đường dẫn trong `public/` |
| `soNet` | number | Số nét |
| `svg` | string | Đường dẫn SVG thứ tự nét trong `public/` (KanjiVG) |
| `viDu` | `{ id, tu, doc, nghia }[]` | Tối đa 3 từ trong `n5_vocab.json`, `id` có dạng `n5-xxxx`. Lấy ví dụ của JLPTSuccess trước (nếu cùng cách viết có nhiều từ thì chọn theo cách đọc), sau đó đến từ n5_vocab có chứa chữ này. Có thể rỗng |
| `deNham` | string[] | Các kanji N5 dễ nhầm với chữ này. Đã bỏ chữ trùng và chữ ngoài N5 |
| `reviewStatus` | `"draft"` \| `"approved"` | `draft` là AI soạn, Hannah chưa duyệt. Để trống thì mặc định là `draft` |

Đường dẫn file trong `public/` được ghép với `import.meta.env.BASE_URL` qua `content.assetUrl()`.

## Nguồn

- `vendor/jlptsuccess/kanji.json`: dữ liệu gốc (MIT)
- `content-vi/kanji.json`: `{ "<chữ>": { hanViet, nghia, cauGoiNho, reviewStatus } }`
- `n5_vocab.json`: từ vựng N5 kèm nghĩa tiếng Việt
- `public/kanji/svg/`: SVG thứ tự nét của KanjiVG (CC BY-SA 3.0)
- `public/audio/kanji/`: audio cách đọc (VOICEVOX:春日部つむぎ, do JLPTSuccess tạo)
