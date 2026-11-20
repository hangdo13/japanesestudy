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
| `thuTu` | number | Thứ tự học, từ 1 đến 110 (106 chữ JLPTSuccess theo bài, 4 chữ thêm chen sau chữ cùng nhóm nghĩa) |
| `hanViet` | string | Âm Hán Việt viết hoa, ví dụ `"NHẬT"` |
| `nghia` | string | Nghĩa tiếng Việt |
| `cauGoiNho` | string | Câu gợi nhớ tiếng Việt, dựa trên các bộ phận của chữ |
| `boPhan` | string[] | Các bộ phận ghép thành chữ |
| `on`, `kun` | `{ kana, audio }[]` | Âm on (katakana) và âm kun (hiragana). `audio` là đường dẫn trong `public/`, hoặc `null` với 4 chữ thêm (app đọc bằng speechSynthesis ja-JP) |
| `soNet` | number | Số nét |
| `svg` | string | Đường dẫn SVG thứ tự nét trong `public/` (KanjiVG) |
| `viDu` | `{ id, tu, doc, nghia }[]` | Tối đa 3 từ trong `n5_vocab.json`, `id` có dạng `n5-xxxx`. Lấy ví dụ của JLPTSuccess trước (nếu cùng cách viết có nhiều từ thì chọn theo cách đọc), sau đó đến từ n5_vocab có chứa chữ này. Có thể rỗng |
| `deNham` | string[] | Các kanji N5 dễ nhầm với chữ này. Đã bỏ chữ trùng và chữ ngoài N5 |
| `reviewStatus` | `"draft"` \| `"approved"` | `draft` là AI soạn, Hannah chưa duyệt. Để trống thì mặc định là `draft` |

Đường dẫn file trong `public/` được ghép với `import.meta.env.BASE_URL` qua `content.assetUrl()`.

## `content/kana.json`

```json
{ "version": 1, "reviewStatus": "draft", "items": [ Kana, ... ], "capDeNham": [["シ","ツ"], ...] }
```

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `id` | string | Chữ kana, có thể gồm 2 ký tự (`きゃ`, `ティ`) |
| `script` | `"hiragana"` \| `"katakana"` | Bảng chữ |
| `romaji` | string | Phiên âm Hepburn (shi, chi, tsu, fu, ji) |
| `nhom` | `"co-ban"` \| `"duc"` \| `"ban-duc"` \| `"ghep"` \| `"mo-rong"` | Nhóm trong bảng |
| `hang` | string | Hàng để dựng bảng: `a`, `k`, `s`… (cơ bản), `g`, `z`, `d`, `b`, `p` (đục/bán đục), `ky`, `sh`… (ghép), `n2` (riêng ん/ン), `ext` (mở rộng) |
| `cot` | `"a"`…`"o"` \| null | Cột nguyên âm. Bắt buộc với nhóm cơ bản/đục/bán đục, `null` với nhóm mở rộng |
| `ghiChu` | string \| null | Ghi chú cách đọc |
| `svg` | string \| null | SVG nét viết trong `public/` (chỉ có ở chữ đơn) |

Ở cấp gốc: `reviewStatus` (`draft` \| `approved`) áp dụng cho cả file; `capDeNham` là danh sách nhóm (mỗi nhóm có ít nhất 2 chữ khác nhau) các kana dễ nhầm, kể cả nhầm giữa hiragana và katakana. Một số romaji trùng nhau có chủ ý (ぢ/じ = ji, づ/ず = zu, ウォ/ヲ = wo); có ghi chú trong `ghiChu`.

## `content/kana-quy-tac.json`

```json
{ "version": 1, "reviewStatus": "draft", "muc": [Muc, ...], "cauTroTu": [CauTroTu, ...], "tuLuyen": [TuLuyen, ...] }
```

- `Muc`: `{ id, tieuDe, giaiThich, viDu: { tu?, doc, romaji, nghia }[] }`. Có đúng 5 mục: `am-ngat`, `truong-am`, `ke-dai`, `tro-tu`, `kata-mo-rong`. Romaji ví dụ được kiểm tra khi build (mục `tro-tu` đọc は/へ/を cuối cụm là wa/e/o).
- `CauTroTu`: `{ doc, romaji, sai: [3 chuỗi], nghia }`. Ít nhất 8 câu. `sai` là đáp án sai soạn sẵn, khác nhau và khác `romaji`.
- `TuLuyen`: `{ id, tu, doc, romaji, nghia, loai }`, sinh từ `n5_vocab.json`: từ có cách đọc duy nhất (không ～ / ;), đọc được hết bằng bảng kana, và có âm ngắt (`am-ngat`), dấu ー (`ke-dai`) hoặc trường âm hiragana aa/ii/uu/ee/oo/ou/ei (`truong-am`; bỏ đuôi う của động từ). Mỗi loại ít nhất 5 từ.
- Romaji: Hepburn, trường âm viết đôi chữ (okaasan, koohii), っ nhân đôi phụ âm (kitte, matcha), ん trước nguyên âm/y viết n'.

## `content/kana-phat-am.json`

```json
{ "version": 1, "reviewStatus": "draft", "muc": [Muc, ...], "capAm": [{ "a": Tu, "b": Tu }, ...] }
```

- `Tu`: `{ doc, nghia, romaji, phach }`. `phach` là mảng phách do `src/core/mora.js` tách (とうきょう → と・う・きょ・う). `romaji` tính lúc build.
- `Muc`: `{ id, tieuDe, giaiThich, viDu: Tu[] }`. Đúng 5 mục: `phach`, `nguyen-am`, `vo-thanh`, `n`, `r`.
- `capAm`: ít nhất 10 cặp, không trùng. Hai từ của cặp chỉ được khác nhau ở っ hoặc trường âm (kiểm tra bằng romaji: kitte/kite, koukou/koko).

## `content/vocab.json`

```json
{ "version": 1, "chuDe": ["Chào hỏi, giao tiếp", ...], "items": [Tu, ...] }
```

`chuDe`: 21 chủ đề theo thứ tự lộ trình mục 5.1 rồi các nhóm bổ sung. `items`: 718 từ, theo id.

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `id` | string | Giữ nguyên id `n5-xxxx` của n5_vocab.json (khoá thẻ `vocab:<id>`) |
| `tu`, `tuKhac` | string, string[] | Cách viết chính và các cách viết khác (tách theo `;`/`；`). Nhiều cách viết một cách đọc thì cách viết có đuôi kana khớp cách đọc đứng đầu |
| `doc`, `docKhac` | string, string[] | Cách đọc chính và các cách đọc khác. Có thể có `～` (phụ tố) |
| `nghia` | string | Nghĩa tiếng Việt |
| `loai` | string | Loại từ |
| `chuDe`, `chuDeThuTu` | string, number | Chủ đề và thứ tự chủ đề (1–21) |

## Tiến độ trên máy (`progress`, khoá `kotoba:v1`)

Ngoài `settings`, `kanji`, `srs`: `tuVung: { <id>: { gioiThieu: "YYYY-MM-DD" } }` là ngày từ được học lần đầu (tính hạn mức từ mới mỗi ngày). `settings.tuMoiMoiNgay` (5/10/15/20/30, mặc định 10), `settings.tuDocKhiLat` (mặc định bật).

## Nguồn

- `vendor/jlptsuccess/kanji.json`: dữ liệu gốc (MIT)
- `content-vi/kanji.json`: `{ "<chữ>": { hanViet, nghia, cauGoiNho, reviewStatus } }`
- `content-vi/kanji-extra.json`: `{ items: [{ glyph, sauChu, on, kun, boPhan, soNet, deNham, hanViet, nghia, cauGoiNho, reviewStatus }] }`. 4 chữ có trong lộ trình mục 4 nhưng không có trong JLPTSuccess (多 少 耳 魚), AI soạn. `sauChu`: chữ đứng ngay trước theo nhóm nghĩa. SVG: `public/kanji/svg/<chữ>.svg` từ KanjiVG (commit 9d7220d)
- `n5_vocab.json`: từ vựng N5 kèm nghĩa tiếng Việt
- `public/kanji/svg/`, `public/kana/svg/`: SVG thứ tự nét của KanjiVG (CC BY-SA 3.0)
- `content-vi/kana-phat-am.json`: giải thích phát âm và cặp âm (AI soạn)
- `content-vi/kana-quy-tac.json`: quy tắc đọc và câu trợ từ (AI soạn)
- `content-vi/kana.json`: bảng kana, romaji, ghi chú, cặp dễ nhầm (AI soạn)
- `public/audio/kanji/`: audio cách đọc (VOICEVOX:春日部つむぎ, do JLPTSuccess tạo)
