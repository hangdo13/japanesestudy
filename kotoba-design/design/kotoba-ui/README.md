# Kotoba UI

Bộ giao diện cho app học tiếng Nhật: **sạch, sáng, có nhịp**. Màu chính là **tím lavender `#917EFF`** và **xanh dương cornflower `#6B9CFF`** — tươi nhưng nhẹ, không nặng như tím than — với một chút peach ấm cho phần thưởng, và linh vật **Pyon** — bé thỏ áo hồng sakura — làm gương mặt cảm xúc của app. Được tổng hợp từ hai reference — một dashboard học tập trên tablet (nền sáng ấm, nút cam "Ask AI Tutor", ô môn học màu pastel, lịch trục ngang, chuỗi ngày học) và một app học trên điện thoại tông tím (nút viên thuốc tím đậm, thẻ bài học tím nhạt, thanh điều hướng có nút tròn nổi, dải chọn ngày) — rồi làm sáng bảng màu và chuyển thành ngôn ngữ của một app học ngôn ngữ: môn học trở thành **kỹ năng** (từ vựng, ngữ pháp, kanji, nghe – nói), và có thêm các thành phần riêng như thẻ ghi nhớ và câu hỏi trắc nghiệm.

## Năm nguyên tắc "clean nhưng không nhàm chán"

1. **Nền phẳng, một điểm nhấn.** Thẻ trắng trên nền `bg` lavender rất nhạt, viền `line` mảnh, bóng mềm. Mỗi màn hình chỉ có **một** khối tô màu (`surface-tint`): bài đang học, hoặc banner AI.
2. **Màu mang nghĩa, không trang trí.** `primary` (tím lavender) = hành động chính. `blue` (xanh cornflower) = AI và thông tin. `peach` = phần thưởng (XP, chuỗi ngày) — điểm ấm duy nhất. `green` = đã xong. Bốn màu kỹ năng giúp người học nhận ra nội dung trước khi đọc chữ.
3. **Mọi thứ đều tròn.** Nút và chip là viên thuốc (`radius-pill`), thẻ bo `radius-lg`/`radius-xl`. Không có góc nhọn.
4. **Nhịp đến từ số và chữ, cảm xúc đến từ Pyon.** Số phần trăm lớn, thanh tiến độ chia đoạn, chữ Nhật rõ ràng. Không ảnh minh hoạ — hình duy nhất là linh vật Pyon, tối đa một lần mỗi màn hình.
5. **Một chạm là học.** Nút tròn giữa thanh điều hướng, thẻ bài đang học, nút ↗ — luôn đưa người học thẳng vào bài kế tiếp.

## Màu sắc

Hai theme: Light và Dark. Mọi chữ đạt tối thiểu 4.5:1 trên nền của nó ở cả hai theme.

| Vai trò | Token | Dùng cho |
|---|---|---|
| Nền | `bg`, `surface`, `surface-sunken`, `surface-tint` | Trang, thẻ, ô nhập/viên giờ, khối nhấn duy nhất |
| Chữ | `ink`, `ink-muted`, `ink-subtle` | Tiêu đề & nội dung; chữ phụ; chỉ icon |
| Tím — chính | `primary`, `primary-strong`, `on-primary`, `primary-soft`, `primary-ink` | `primary` #917EFF: màu thương hiệu (tiến độ, viền chọn, hoạ tiết). `primary-strong` #705AF2 + chữ trắng: mọi mảng tím có chữ/icon — nút chính, nút tròn nổi, ngày đang chọn, viên giờ hiện tại, logo |
| Xanh dương — AI | `blue`, `blue-strong`, `on-blue`, `blue-soft`, `blue-ink` | `blue` #6B9CFF: vòng focus, chấm ngày có lớp, quả cầu AI. `blue-strong` #3B6FE0 + chữ trắng: nút hỏi AI, nút gửi |
| Peach — thưởng | `peach`, `peach-soft`, `peach-ink` | XP, ngọn lửa chuỗi ngày, vòng avatar, hạng — chỉ tô nền/icon trang trí, không làm nút |
| Sakura — nhân vật | `sakura`, `sakura-soft`, `sakura-ink` | Áo của Pyon và màn ăn mừng (`GoalComplete`). Màu nhân vật: không dùng cho chữ thường, nút hay trạng thái. Nhạt và dịu hơn hẳn `skill-kanji` nên không lẫn |
| Trạng thái | `green`, `on-green`, `green-soft`, `green-ink`, `danger*` | Đúng / đã học; sai / khoảng trống lịch. Xanh lá tươi `#28D873` sống động ngang tím–xanh, chữ và dấu tích trên nó dùng `on-green` (tối) |

**Không đặt hai mảng màu tô cạnh nhau trong cùng một khối.** Hộp phản hồi đúng/sai giữ nền trắng; chỉ icon mang màu trạng thái, nút tím là mảng màu duy nhất.

**Mỗi màu thương hiệu có hai nấc.** Nấc sáng (`primary` #917EFF, `blue` #6B9CFF) là gương mặt thương hiệu — thanh tiến độ, viền, hoạ tiết, ánh sáng. Nấc đậm (`primary-strong` #705AF2, `blue-strong` #3B6FE0) dành cho mọi mảng màu có chữ hoặc icon, luôn đi với **chữ trắng** (4.7:1 và 4.6:1). Chữ trắng đặt thẳng lên nấc sáng chỉ đạt 3.2:1 và 2.7:1; chữ tối thì đủ tương phản nhưng làm nút trông đục — nên nút luôn dùng nấc đậm, ở cả hai theme.

### Màu kỹ năng

Mỗi kỹ năng có bộ ba: màu đậm (icon, thanh tiến độ), `-soft` (nền ô), `-ink` (chữ trên nền soft).

| Kỹ năng | Token | Ký hiệu |
|---|---|---|
| Từ vựng | `skill-vocab` — xanh trời | 語 |
| Ngữ pháp | `skill-grammar` — tím dừa cạn sáng | 文 |
| Kanji & đọc | `skill-kanji` — hồng tươi | 字 |
| Nghe – nói | `skill-speaking` — xanh bạc hà | icon `mic` |

Màu kỹ năng được nâng lên cùng độ tươi với tím–xanh; chúng luôn đi kèm ký hiệu (語 文 字 mic) nên không lẫn với màu thương hiệu. Không đổi màu kỹ năng giữa các màn hình, không dùng màu kỹ năng cho thứ không phải kỹ năng.

## Linh vật Pyon

**Pyon (ぴょん)** là bé thỏ chibi buộc khăn hachimaki có hoa anh đào, mặc áo hanten hồng sakura thắt đai tím, ôm viên mochi và cầm lá cờ Nhật. ぴょん là tiếng thỏ nhảy: mỗi ngày học là một bước nhảy nhỏ.

- Gắn bằng `<span class="kt-mascot" data-mascot="happy" data-size="120"></span>` rồi `Kotoba.hydrate()` (chi tiết: component `Mascot`).
- Sáu biểu cảm, mỗi cái có chỗ dùng cố định: `default` lời chào · `happy` trả lời đúng · `think` AI · `oops` ôn lại · `sleepy` màn trống · `celebrate` đạt mục tiêu.
- Component có Pyon: `SwipeButton` (màn chào), `AIHeroBanner`, `AIInsightCard`, `QuizOption` (hộp phản hồi), `EmptyState`, `GoalComplete`.
- Một Pyon mỗi màn hình. AI trong app nói bằng giọng Pyon ("Pyon gợi ý").
- Phong cách vẽ: khối tròn đổ bóng mềm kiểu đồ chơi đất sét, không nét viền, mắt có hai chấm sáng. Bản dựng 3D sau này giữ nguyên tỉ lệ và màu.

## Chữ

- **Plus Jakarta Sans** (Google Fonts) cho giao diện — hình học, tròn trịa, hỗ trợ đủ dấu tiếng Việt.
- **Noto Sans JP** (Google Fonts) cho mọi chữ tiếng Nhật. Gắn class `kt-jp` và thuộc tính `lang="ja"`.
- Phân cấp: `display` 34 · `greeting` 28 · `stat` 32 · `title-lg` 22 · `title` 18 · `title-sm` 15 · `body` 15 · `label` 14 · `caption` 13 · `micro` 11. Số dùng `tabular-nums`.
- Lời chào và tiêu đề onboarding trộn **400 + 700/800** trong cùng một dòng ("Chào, **Hằng!**") — cách tạo nhịp mà không cần thêm màu.

## Hình khối, khoảng cách, chiều sâu

- Khoảng cách theo bước 4: `space-1` 4 … `space-8` 32. Lề màn hình điện thoại `space-4`, khoảng giữa thẻ `space-3`–`space-5`, giữa các khối `space-6`.
- Bo góc: `radius-sm` 10 (ô kỹ năng) · `radius-md` 14 (ô nhập, dòng danh sách) · `radius-lg` 20 (thẻ) · `radius-xl` 28 (thẻ nổi bật, thanh điều hướng) · `radius-pill`.
- Bóng: `shadow-card` cho thẻ thường, `shadow-raised` cho thứ nổi (thanh điều hướng, thẻ ghi nhớ), `shadow-fab` (bóng **tím mờ**) chỉ cho nút tròn giữa và ngày đang chọn.

## Icon

Nét mảnh 1.75px, đầu nét tròn, khung 24×24 — cùng họ với Lucide. `components/bundle.js` có sẵn 38 icon dùng trong bộ này:

```html
<i data-icon="bell"></i>
<script>Kotoba.hydrate();</script>
```

Kích thước: mặc định 20px; `kt-i-sm` 16, `kt-i-xs` 14, `kt-i-lg` 24. Icon lấy màu chữ hiện tại (`currentColor`).

## Giọng văn

- Tiếng Việt, ngắn, xưng "bạn". Nút là động từ: **Bắt đầu**, **Tiếp tục**, **Vào lớp**, **Lật thẻ**.
- Nhắc nhở cụ thể, làm được ngay: "Còn 2 bài để giữ chuỗi", "Ôn 5 câu trong 3 phút".
- Khen ngắn khi đúng ("Đúng rồi! +10 XP"); khi sai thì chỉ ra đáp án, không trách.
- Thứ viết tắt: CN, T2 … T7. Giờ 24h: `16:00 – 17:00`.

## Bố cục màn hình gợi ý

**Trang chủ (điện thoại):** TopBar → Greeting → AIHeroBanner *hoặc* ActiveLessonCard → StatCard ×2 → CourseProgressCard (cuộn ngang) → BottomNav.

**Dashboard (tablet):** SideRail | Greeting + SearchField + nút AI → CourseProgressCard ×3 → ScheduleTimeline → AIInsightCard + CourseListItem | cột phải: UpcomingClassItem, ProfileCard (kèm StreakTracker), AchievementItem.

**Màn học:** TopBar (nút đóng) → SegmentedProgress dày → Flashcard *hoặc* câu hỏi + QuizOption → phản hồi có Pyon trượt lên. Ẩn thanh điều hướng.

**Màn trống / ăn mừng:** EmptyState (Pyon ngủ gật) cho danh sách trống; GoalComplete (Pyon ăn mừng trên nền sakura) khi đạt mục tiêu tuần hoặc mốc chuỗi.

## Cách dùng

Nạp theo thứ tự: `tokens.css` (biến CSS từ `tokens.json`) → `components/bundle.css` (đã import Google Fonts) → `components/bundle.js` (icon, linh vật Pyon, chồng thẻ vuốt). Mọi class đều có tiền tố `kt-`; markup mẫu của từng component nằm trong `components/<Tên>/preview.html`, hướng dẫn trong `components/<Tên>/README.md`. Bộ này là HTML + CSS thuần, chuyển sang React Native / Flutter / SwiftUI bằng cách giữ nguyên token và quy tắc.


---

## Consuming this system (generated — do not edit)

Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.

`components/bundle.js` defines `window.Kotoba` (29 components); `components/bundle.css` is its stylesheet; `tokens.css` is every token as a CSS variable plus `@font-face` for the fonts. `components/bundle.css` reads its variables from `tokens.css`. Build any UI by mounting these components; never hand-build a control or draw an icon the system provides.

- **Standalone page:** inline `tokens.css` and `components/bundle.css` in a `<style>`, then `components/bundle.js` as a classic script (a file containing `</style`, `</script` or `<!--` breaks an inline element: write the sequence `<\/style`, `<\/script` or `\x3C!--` in your copy, or load that file by URL).
- **Design canvas:** bring `tokens.css`, `components/bundle.css` and `components/bundle.js` onto the canvas in full, as the canvas type’s design-system components reference says (a server-side copy first where it offers one); in each artboard that uses this system, right after the `support.js` line, load `tokens.css` first, then the stylesheet, then the script; mount with `<x-import component-from-global-scope="Kotoba.<Comp>" …>`.
- **Slides deck, or any surface that cannot run the bundle:** tokens only — the values are on `api/tokens.md`; the deck takes `tokens.json` by file path for its colour pickers.

**Read, per thing:** a component’s props, parts and examples: `api/components/<Comp>.md`; token values: `api/tokens.md`. After this README, fetch the cards and fonts you need in ONE message as parallel calls — none depends on another.

**Two rules.** Before you use a thing — a component, a token group, an icon, an asset — read its card from the index below; a value you did not read from a card is a guess. `tokens.json`, `manifest.json` and `design-system.json` are sources for tools: hand them over. `components/<Comp>/README.md` is the long-form second read a card links to; `SKILL.md` and `artifact-type/` beside them are authoring guidance, not needed to consume the system.

## Index (generated — do not edit)

**Tokens**

- `api/tokens.md` — Every token: surface, text, fill, palette, type, spacing, radius, shadow. (12.6k)

**Components** (`api/components/<Comp>.md`, 29)

- **Nhập liệu**: `AIComposer` — Ô hỏi gia sư AI: vùng nhập 2 dòng + thanh công cụ (đính kèm, tìm kiếm, biểu cảm, micro, gửi) · `SearchField` — Ô tìm kiếm dạng viên thuốc, nền surface, viền line; khi focus viền chuyển blue + vầng sáng blue-soft
- **Thẻ**: `AIHeroBanner` — Banner giới thiệu tính năng AI: nền surface-tint, tiêu đề 2 dòng, nút primary nhỏ, trang trí bằng một chữ Hán lớn màu primary rất mờ · `AIInsightCard` — Thẻ gợi ý cá nhân hoá từ AI: chip "AI Sensei" xanh dương, quả cầu xanh–tím phát sáng mềm, một câu nhận xét cụ thể, ô hỏi tiếp · `ActiveLessonCard` — Thẻ nổi bật nhất trang chủ — bài đang học dở, nền surface-tint, tiêu đề lớn 26px, avatar bạn cùng học và chip đánh giá · `CourseProgressCard` — Thẻ tiến độ khoá học: ô kỹ năng + tên, số phần trăm lớn, số bài đã học, thanh tiến độ chia đoạn theo màu kỹ năng · `ProfileCard` — Thẻ hồ sơ: avatar có vòng peach, tên + lớp, chip xếp hạng, và chuỗi ngày học ngay bên dưới · `StatCard` — Thẻ số liệu nhỏ đi theo cặp: icon tròn màu đặc trên trái, con số + đơn vị trên phải, nhãn dưới trái, nút ↗ dưới phải
- **Danh sách**: `AchievementItem` — Dòng thành tích: ô icon nền peach-soft (kt-skill--reward), tên huy hiệu, điều kiện đạt, điểm XP màu peach-ink bên phải · `CourseListItem` — Dòng khoá học/bài giảng: ô kỹ năng, tên + chủ đề, thời lượng, nút phát vuông nhỏ · `UpcomingClassItem` — Dòng lớp học sắp tới: nút chuông, tên lớp, giờ, avatar người tham gia
- **Lịch học**: `AgendaList` — Lịch trong ngày dạng danh sách dọc cho điện thoại: cột giờ bên trái, đường nét đứt mỗi mốc giờ, thẻ sự kiện trắng có chấm màu kỹ năng · `ScheduleTimeline` — Lịch trong ngày dạng trục ngang cho tablet: viên giờ trên cùng, đường kẻ dọc nét đứt, sự kiện là thẻ màu kỹ năng gắn chấm lên đường giờ
- **Nhận diện**: `Avatar` — Ảnh đại diện tròn (hoặc chữ viết tắt trên nền pastel), và nhóm avatar chồng nhau với số +N · `Chip` — Nhãn nhỏ dạng viên thuốc 28px: đánh giá, xếp hạng, AI, trạng thái, cấp độ JLPT, kỹ năng · `SkillTile` — Ô vuông bo góc nền nhạt mang chữ đại diện hoặc icon của kỹ năng — dấu hiệu nhận biết kỹ năng xuyên suốt app
- **Điều hướng**: `BottomNav` — Thanh điều hướng dưới cho điện thoại: 4 tab + một nút tròn màu primary nổi ở giữa (FAB) cho hành động "Học ngay" · `DateStrip` — Dải chọn ngày theo tuần: mỗi ngày là một viên thuốc dọc; ngày đang chọn nổi lên màu primary với số ngày nằm trong vòng tròn trắng · `Greeting` — Lời chào đầu trang chủ: "Chào," chữ thường + tên chữ đậm, dòng phụ màu ink-muted có tên app tô primary-ink · `SectionHeader` — Tiêu đề mỗi khối nội dung (18px/700) với hành động phụ bên phải: link "Xem tất cả", bộ chọn "Hôm nay ▾" hoặc nút thêm · `SideRail` — Thanh điều hướng dọc cho tablet và web: logo trên cùng, icon ở giữa, cài đặt + avatar dưới cùng · `TopBar` — Thanh trên cùng của màn hình điện thoại: nút tròn hai bên, tiêu đề ở giữa (màn con) hoặc avatar bên phải (màn chính)
- **Hành động**: `Button` — Nút bấm dạng viên thuốc (pill) — một nút primary tím dịu cho hành động chính của màn hình, nút ai xanh dương cho mọi thứ liên quan tới gia sư AI · `IconButton` — Nút tròn chỉ có icon — menu, thông báo, quay lại, mở chi tiết (mũi tên chéo ↗), phát/tạm dừng · `SwipeButton` — Nút CTA lớn của màn hình chào (onboarding): viên thuốc màu primary cao 60px, núm tròn trắng bên trái mang icon chevrons-right
- **Học tập**: `Flashcard` — Thẻ ghi nhớ từ/kanji: chip kỹ năng + đếm thẻ, thanh tiến độ phiên ôn, chữ lớn ở giữa (cách đọc kana phía trên, nghĩa phía dưới), câu ví dụ, và hai nút đánh giá · `QuizOption` — Lựa chọn trắc nghiệm cao 56px với ô chữ cái A–D, bốn trạng thái (mặc định, đang chọn, đúng, sai), và thanh phản hồi sau khi kiểm tra
- **Tiến độ**: `SegmentedProgress` — Thanh tiến độ chia đoạn bo tròn — mỗi đoạn là một bài hoặc một câu hỏi; đoạn đã xong tô màu kỹ năng, còn lại line-strong · `StreakTracker` — Chuỗi ngày học trong tuần: số ngày lớn + ngọn lửa peach (trang trí, chữ "ngày học liên tiếp" mang nghĩa), bảy ô ngày với dấu tích xanh cho ngày đã học, vòng đa…
