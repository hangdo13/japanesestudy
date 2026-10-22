# QuizOption

Lựa chọn trắc nghiệm cao 56px với ô chữ cái A–D, bốn trạng thái (mặc định, đang chọn, đúng, sai), và hộp phản hồi trung tính sau khi kiểm tra.

Áp dụng phong cách bo tròn + màu ngữ nghĩa của hệ thống cho màn hình làm bài.

## Trạng thái
| Class | Màu |
|---|---|
| (mặc định) | `surface`, viền `line` |
| `is-selected` | viền `primary`, nền `primary-soft` |
| `is-correct` | viền `green`, nền `green-soft`, chữ `green-ink`, ô chữ cái `green` + chữ `on-green`, icon ✓ |
| `is-wrong` | viền `danger`, nền `danger-soft`, icon ✕ |

## Quy tắc
- Đúng/sai luôn có **icon + màu**, không chỉ màu (người mù màu đỏ–lục).
- Hộp phản hồi (`kt-feedback`) trượt lên từ dưới, **nền `surface` trung tính** với viền `line` và `shadow-raised`. Bên trái là Pyon 64px (`kt-feedback__mascot`): `happy` khi đúng, `oops` khi sai (`kt-feedback--wrong`, tiêu đề chuyển `danger`). Chỉ dòng tiêu đề mang màu trạng thái. Nút "Tiếp tục" màu `primary` là mảng màu tô duy nhất trong hộp — không đặt nút tím lên nền xanh lá hay đỏ, vì tím và xanh lá đối nhau trên vòng màu và sẽ tranh nhau.
- Bản không có linh vật (ví dụ chế độ thi): thay Pyon bằng icon tròn `kt-feedback__icon` (`green` ✓ / `danger` ✕).
- Khi sai, luôn hiện đáp án đúng ngay trong hộp; Pyon `oops` phụng phịu chứ không buồn.
- Màn làm bài chỉ có: câu hỏi, lựa chọn, nút. Ẩn thanh điều hướng.
