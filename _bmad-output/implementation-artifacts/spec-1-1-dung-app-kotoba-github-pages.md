---
title: 'Story 1.1: Dựng app Kotoba và đưa lên GitHub Pages'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '3546a10ec5d2318ed4eee1c143988abd9bae70e7'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/kotoba-design/design/kotoba-ui/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Repo chưa có app. Muốn làm được các story sau, cần một khung web app chạy được trên điện thoại, đúng giao diện Kotoba UI, và tự lên GitHub Pages mỗi lần push vào `main`.

**Approach:** Dựng dự án Vite 8 dùng JavaScript thuần ngay tại thư mục gốc repo, chép Kotoba UI vào `src/ui/`, làm khung TopBar + BottomNav, viết `core/router` dùng hash, tạo các tính năng "Sắp có" bằng EmptyState, trang Giới thiệu kèm `NOTICES.md`, và workflow GitHub Actions để đưa app lên Pages.

## Boundaries & Constraints

**Always:**
- Vite 8.3.8, JavaScript thuần với ES modules. Vitest 5.1.0 cho test. Node `>=22.12`.
- `base: '/japanesestudy/'` trong `vite.config.js`.
- Mọi màu, font, khoảng cách lấy từ biến trong `tokens.css`. Markup và class chép đúng từ `preview.html` của component.
- Theme: đặt `data-theme` trên `<html>` theo `prefers-color-scheme`, và cập nhật khi người dùng đổi theme hệ thống.
- Mọi chữ hiển thị viết tiếng Việt.
- `features/*` không import lẫn nhau. `core/*` không import `features/*`. Chỉ `core/router` định nghĩa route.
- Mỗi tính năng có `src/features/<tên>/index.js` xuất `mount(el, params)`. Router gọi `Kotoba.hydrate(el)` sau khi mount.

**Never:**
- Không framework, không service worker, không thư viện runtime ngoài Kotoba UI.
- Không sửa hay xoá file có sẵn của repo: `kotoba-design/`, `n5_vocab.*`, `build_n5.py`, `Lộ trình…md`, `README.md`, `_bmad*`.
- Không ghi cứng mã màu hay px ngoài token. Riêng `0` được dùng để bỏ padding mặc định của `body` trong bundle.css.
- Không làm nội dung, `progress` hay manifest: những phần đó thuộc các story sau.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở trang chủ | URL không có hash, hoặc `#/` | Khung TopBar + BottomNav. Nội dung là EmptyState "Trang chủ sắp có" | N/A |
| Chuyển tab | Bấm tab "Kanji" | Hash thành `#/kanji`, mount `features/kanji`, tab được đánh dấu `is-active` + `aria-current="page"` | N/A |
| Route có tham số | `#/kanji/日` | Router gọi `mount(el, { param: '日' })`, giải mã URI | N/A |
| Route lạ | `#/abc` | EmptyState "Không tìm thấy trang này" kèm nút "Về trang chủ" | Không lỗi console |
| Trang Giới thiệu | `#/gioi-thieu` | Ghi công JLPTSuccess (MIT), KanjiVG (CC BY-SA 3.0), VOICEVOX, có link | N/A |
| Theme tối | Hệ thống bật dark mode | `<html data-theme="dark">` | N/A |

</frozen-after-approval>

## Code Map

- `kotoba-design/design/kotoba-ui/tokens.css` -- theme dùng `:root, [data-theme="light"]` và `[data-theme="dark"]`, không tự theo hệ thống. Chép sang `src/ui/tokens.css`, không sửa.
- `kotoba-design/design/kotoba-ui/components/bundle.css` -- đã `@import` Google Fonts (Plus Jakarta Sans, Noto Sans JP). `body` có `padding: var(--space-5)` dành cho preview. `.kt-phone` rộng 360px. Chép sang `src/ui/components/`, không sửa.
- `kotoba-design/design/kotoba-ui/components/bundle.js` -- IIFE gán `window.Kotoba`, gồm `hydrate(root)` (icon `data-icon`, mascot `data-mascot`) và `swipeDeck`. Import kiểu side-effect là đủ. Icon có sẵn: `home`, `book`, `note`, `quiz`, `sliders`, `chevron-left`…
- `kotoba-design/design/kotoba-ui/components/BottomNav/preview.html` -- markup `nav.kt-bottomnav > button.kt-tab` + `button.kt-fab` ở giữa.
- `kotoba-design/design/kotoba-ui/components/TopBar/preview.html` -- markup `header.kt-topbar`, `.kt-topbar__title`, `.kt-topbar__spacer`, `button.kt-iconbtn`.
- `kotoba-design/design/kotoba-ui/components/EmptyState/preview.html` -- markup `section.kt-empty` + `span.kt-mascot[data-mascot=sleepy]` + `.kt-empty__title` + `.kt-empty__text` + `button.kt-btn.kt-btn--soft.kt-btn--sm`.
- Repo hiện chưa có `package.json` hay `.gitignore` ở gốc.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- tạo: `type: module`, `engines.node >=22.12`, scripts `dev`/`build`/`preview`/`test` (`vitest run`), devDeps `vite@8.3.8`, `vitest@5.1.0`, `jsdom`. Chạy `npm install` để có `package-lock.json` -- nền dự án.
- [x] `.gitignore` -- `node_modules/`, `dist/`.
- [x] `vite.config.js` -- `base: '/japanesestudy/'`, `test.environment: 'jsdom'` -- Pages chạy ở đường dẫn con.
- [x] `index.html` -- `lang="vi"`, viewport, `<title>Kotoba</title>`, `<div id="app">`, nạp `/src/main.js`.
- [x] `src/ui/tokens.css`, `src/ui/components/bundle.css`, `src/ui/components/bundle.js` -- chép nguyên từ `kotoba-design`.
- [x] `src/ui/app.css` -- bỏ padding của `body`, khung app (TopBar trên, nội dung cuộn, BottomNav dính đáy, chừa `env(safe-area-inset-bottom)`), chỉ dùng token.
- [x] `src/ui/empty-state.js` -- `renderEmptyState({ title, text, actionLabel, onAction })` trả về phần tử theo đúng markup EmptyState -- dùng lại ở nhiều tính năng (AD-8).
- [x] `src/core/theme.js` -- đặt và theo dõi `data-theme`.
- [x] `src/core/router.js` -- bảng route (`''`→home, `kanji`, `luyen-tap`, `cai-dat`, `hoc-ngay`, `gioi-thieu`), đọc `location.hash` dạng `#/<tên>/<tham số>`, gọi `mount(el, { param })`, gọi `Kotoba.hydrate(el)`, cập nhật tab đang chọn, bắt `hashchange`. Route lạ thì hiện EmptyState 404.
- [x] `src/main.js` -- import CSS và `bundle.js`, dựng khung TopBar (tiêu đề "Kotoba") + BottomNav (Trang chủ `home` · Kanji `book` · nút tròn "Học ngay" `note` · Luyện tập `quiz` · Cài đặt `sliders`), khởi động theme và router.
- [x] `src/features/{home,kanji,luyen-tap,cai-dat,hoc-ngay}/index.js` -- `mount` hiện EmptyState "Sắp có" với câu tiếng Việt riêng cho từng tính năng.
- [x] `src/features/gioi-thieu/index.js` -- trang ghi công, có link tới JLPTSuccess, KanjiVG, VOICEVOX.
- [x] `NOTICES.md` -- ghi công 3 nguồn kèm giấy phép.
- [x] `.github/workflows/deploy.yml` -- khi push `main`: `actions/checkout`, `actions/setup-node` (Node 22, cache npm), `npm ci`, `npm test`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` (`dist`), `actions/deploy-pages`. Quyền `pages: write`, `id-token: write`.
- [x] `src/core/router.test.js` -- test các dòng của bảng I/O (hash rỗng, route có tham số, route lạ, đổi tab) bằng jsdom.
- [x] `src/architecture.test.js` -- quét `src/features/*`: không file nào import `features/<khác>`, `src/core` không import `features`, và không có mã màu hex trong các file `.js`/`.css` viết mới ngoài `src/ui/tokens.css` và `src/ui/components/` (AD-2, AD-9).

**Acceptance Criteria:**
- Given đã `npm install`, when chạy `npm run build`, then build thành công và `dist/index.html` tham chiếu tài nguyên dưới `/japanesestudy/`.
- Given màn hình rộng 390px, when mở app, then TopBar và BottomNav hiển thị đúng như `preview.html`, BottomNav dính đáy và không che nội dung.
- Given push lên `main`, when workflow chạy xong, then app mở được tại `https://hangdo13.github.io/japanesestudy/`.

## Design Notes

Nút tròn "Học ngay" giữa BottomNav ở story này chỉ dẫn tới `#/hoc-ngay` (EmptyState). Story 2.4 sẽ nối nó với việc học hôm nay. Tab "Luyện tập" là chỗ chứa Cách đọc, Luyện nghe và Thi thử ở các epic sau.

## Verification

**Commands:**
- `npm test` -- expected: mọi test đều qua.
- `npm run build` -- expected: thành công, có `dist/`.

**Manual checks (if no CLI):**
- `npm run preview`, mở ở khổ 390px theme sáng và tối, so với `preview.html` của TopBar, BottomNav, EmptyState.

## Implementation Notes

- Không có quyền dùng subagent cho lượt chạy này nên agent điều phối tự viết code theo spec.
- `npm install` bằng npm 10.9.9 bị lỗi `Cannot read properties of null (reading 'edgesOut')`, một lỗi của arborist khi xử lý peer dependency tuỳ chọn của vitest. Lockfile được tạo bằng `npx npm@11 install`. `npm ci` bằng npm 10 vẫn chạy được với lockfile này, nên CI giữ Node 22.
- Router: AD-2 cấm `core` import `features`, nên `core/router.js` chỉ giữ bảng `ROUTES` (tên route, tiêu đề, tab). `main.js` đóng vai composition root và truyền các module tính năng vào `createRouter({ features })`.
- `gioi-thieu` đánh dấu tab "Cài đặt", vì nó được mở từ màn Cài đặt.
- Phiên bản GitHub Actions lấy theo tag major mới nhất ngày 18/11/2026: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5.
- Kiểm tra bằng mắt bằng Playwright ở khổ 390×844, cả theme sáng và tối, gồm trang chủ, Kanji, Giới thiệu và 404: không có lỗi console. Chip giấy phép trong trang Giới thiệu bị kéo giãn hết chiều ngang vì nằm trong `kt-stack`, đã sửa bằng cách bọc trong `kt-row`.
- Sau review: đã vá #3, #5, #6, #8, #9, #10, #11, #13, #21, #23. Còn 21 test qua, build qua, CI có kiểm tra base.
- File chép nguyên không sửa: `src/ui/tokens.css`, `src/ui/components/bundle.css`, `src/ui/components/bundle.js`.

## Spec Change Log

## Review Triage Log

| # | Nguồn | Phát hiện | Verdict | Bằng chứng / Xử lý |
|---|---|---|---|---|
| 1 | blind | Thiếu `package-lock.json`, `npm ci` sẽ lỗi | false | Lockfile có trong tree, chỉ bị loại khỏi diff review. `npm ci` đã chạy được |
| 2 | blind | Thiếu file UI mà `main.js` import | false | Ba file Kotoba UI được chép nguyên, có trong tree, chỉ bị loại khỏi diff |
| 3 | blind | Ghi công chưa đủ (link CC BY-SA, tên giọng VOICEVOX, toàn văn MIT) | medium | patch: thêm link giấy phép, liệt kê 6 giọng VOICEVOX. Toàn văn MIT sẽ đi cùng dữ liệu ở Story 1.2 |
| 4 | blind | Pyon bị vẽ hai lần vì hydrate chạy hai lần | false | `hydrate` bỏ qua phần tử có `data-icon-done`/`data-mascot-done`, nên gọi lại không vẽ thêm |
| 5 | blind | Dark mode loé nền sáng lúc tải | low | patch: script inline trong `index.html` đặt `data-theme` trước khi vẽ, thêm `color-scheme` |
| 6 | blind | Đổi route không reset cuộn, title, focus | low | patch phần cuộn (`scrollTo(0,0)`). Title/focus: rejected, ít gặp và cần thêm logic |
| 7 | blind+vg+edge | Test kiến trúc bỏ sót `export…from`, `import()`, màu đặt tên/oklch | medium | defer: code hiện tại đều tuân thủ. Ghi vào deferred-work |
| 8 | blind+edge | Test router rò listener và spy, hash reset không chờ | medium | patch: `afterEach` dừng router + `restoreAllMocks`, chờ `flush` sau khi reset hash |
| 9 | blind+vg | `start()` với bảng feature thật chưa được test, nút Cài đặt → Giới thiệu chưa test | medium | patch: thêm `src/main.test.js` chạy mọi route qua `start()` |
| 10 | blind+vg | `cai-dat` ghi cứng `'#/gioi-thieu'` | low | patch: dùng `toHash('gioi-thieu')` |
| 11 | blind+edge | `cancel-in-progress: true` có thể huỷ deploy giữa chừng | medium | patch: đổi thành `false` như workflow mẫu của GitHub Pages |
| 12 | blind | Inline `style.margin='0'`, tên Hannah trong nội dung công khai | false | `0` không phải token màu/px vi phạm AD-9. App cá nhân của Hannah, tên là chủ ý |
| 13 | vg | CI không kiểm tra `base: '/japanesestudy/'` | medium | patch: thêm bước `grep` sau `npm run build` trong workflow |
| 14 | edge | `mount` ném lỗi làm trống màn | low | rejected: chưa tính năng nào ném lỗi, sửa cần thêm nhánh xử lý |
| 15 | edge | Route có trong ROUTES nhưng thiếu feature thì ra 404 âm thầm | low | rejected: `main.test.js` (#9) bắt được trường hợp này |
| 16 | edge | Hash có query hoặc chữ hoa ra 404 | low | rejected: link chỉ do app tạo |
| 17 | edge | HMR tạo listener trùng | low | rejected: chỉ ảnh hưởng lúc dev |
| 18 | edge | Nút tròn "Học ngay" có `aria-current` nhưng không có trạng thái hiển thị | low | rejected: Kotoba UI không định nghĩa trạng thái active cho `kt-fab` |
| 19 | edge | `#app` không có thì `start()` lỗi | low | rejected: `index.html` luôn có `#app` |
| 20 | edge | `startTheme` không gỡ listener được | low | rejected: chỉ gọi một lần |
| 21 | edge | jsdom 31.0.1 cần Node `^22.22.2` nhưng engines ghi `>=22.12` | low | patch: engines thành `>=22.22.2` (vẫn nằm trong `>=22.12` của spec) |
| 22 | edge | `base` ghi cứng, đổi tên repo là hỏng | low | rejected: repo cố định |
| 23 | edge | Nhánh cleanup của router chưa có test | medium | patch: thêm test cleanup + `stop()` |
