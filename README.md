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

## Repo

Không có remote — repo này chỉ sống trên máy. Nhánh hiện tại là
`migrate-to-base-ui`, đi trước `main` hai commit.

`public/sounds` (117MB) và `public/thiings` (5.1MB) **được commit**, nên `.git`
nặng 122MB. Clone là chạy được ngay, đổi lại là không bao giờ nên push nó lên
một remote công khai: âm thanh thuộc về bản gốc và icon thiings chỉ có licence
dùng cá nhân.
