# moodist-next

Bản port **Astro → Next.js** của [remvze/moodist](https://github.com/remvze/moodist),
dựng để **học kiến trúc** — không phải template đem bán, không có kế hoạch phát hành.

Bản gốc nằm cạnh ở `../moodist` (commit `285ecdb`, v3.0.0) và vẫn chạy được, để
đối chiếu hành vi khi có gì đó không khớp.

## Chạy

```bash
npm install
npm run dev
```

`http://localhost:3100` — cổng 3100 chứ không phải 3000, vì bản gốc chiếm 4321
và hai bản thường mở song song.

Hai gate, và sự khác nhau giữa chúng là có chủ đích:

```bash
npm run check      # build + sáu gate đang xanh — đỏ ở đây là hồi quy
npm run check:all  # thêm năm gate nữa, bốn trong số đó đang đỏ
```

Bốn gate đỏ đó tên gì và vì sao chưa xanh: **CONTEXT.md § Gate**.

## Đọc gì trước

| File | Giữ gì |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | Kiến trúc bản gốc, những chỗ phải sửa khi port, các chỗ cố ý lệch khỏi house style, việc còn mở |
| [`.migration/`](.migration/) | Một báo cáo cho mỗi component khi chuyển Radix → Base UI, cộng `project.md` cho cả lượt |

## Icon

`public/thiings/` **không nằm trong repo này** — thiings.co chỉ cấp licence
dùng cá nhân cho bản tải lẻ, nên 92 file PNG đó không được phát hành lại.

Repo vẫn build và chạy bình thường khi thiếu chúng: mỗi icon sound ngồi trong
một đĩa tròn đã có sẵn nền, nên chỗ khuyết hiện ra là một đĩa trơn chứ không
phải ảnh vỡ. Muốn có icon thì tự tải theo `data/sound-thiings.ts` — file đó
giữ nguyên bản đồ `id → đường dẫn`, đặt PNG đúng tên vào `public/thiings/` là
xong. Chi tiết vì sao chọn bộ này: **CONTEXT.md § Icon**.

## Licence

Port này kế thừa **MIT** từ bản gốc — xem [`LICENSE`](LICENSE), bản quyền
thuộc MAZE (2023).

Tài sản bên thứ ba đi kèm khác licence:

| Tài sản | Licence |
|---|---|
| `public/sounds/` (117MB, commit trong repo) | Pixabay Content License và CC0, theo bản gốc |
| `public/thiings/` | thiings.co, **chỉ dùng cá nhân** — vì vậy không có trong repo |

## Repo

[`tuanfront-end/moodist-next`](https://github.com/tuanfront-end/moodist-next),
công khai. Nhánh `migrate-to-base-ui` đi trước `main` hai commit.

`public/sounds` được commit nên `.git` nặng ~125MB — clone chậm, đổi lại là
chạy được ngay không cần bước tải thêm.
