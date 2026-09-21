# moodist-next — ghi chú nghiên cứu

Bản port **Astro → Next.js** của [remvze/moodist](https://github.com/remvze/moodist)
(bản gốc nằm cạnh, ở `../moodist`, commit `285ecdb` / v3.0.0). Mục đích là học
kiến trúc, không phải để phát hành.

## Stack

| | Bản gốc | Bản này |
|---|---|---|
| Framework | Astro 7 | Next.js 16.3.5 (App Router, Turbopack) |
| UI lib | `radix-ui` 1.5 dùng trực tiếp | shadcn/ui (base `radix`, preset `nova`) |
| CSS | CSS Modules + PostCSS nesting | Tailwind v4 + token shadcn |
| Audio | Howler 2.2 | giữ nguyên |
| State | Zustand 4 + persist | Zustand 5 + persist (API dùng không đổi) |
| Icons | react-icons 4 | react-icons 5 |

## Kiến trúc bản gốc — bốn điểm đáng học

**1. Mỗi sound giữ một `Howl` riêng, không có mixer trung tâm.**
`useSound(src)` trong `hooks/use-sound.ts` tạo một instance Howler cho mỗi card
và đời sống của nó gắn với component. Trộn âm là việc của trình duyệt: N sound
bật cùng lúc = N `Howl` cùng phát. Đo trong dev: **168 instance** cho 84 sound
(React StrictMode render đôi); production là 84. `preload: false` nên file chỉ
tải khi bấm play lần đầu — đó là thứ giữ cho lần vào trang không kéo 117MB.

**2. `skipHydration: true` là mấu chốt để không vỡ hydration.**
Cả 8 store đều persist vào localStorage nhưng **không** tự đọc khi khởi tạo.
`StoreConsumer` gọi `persist.rehydrate()` trong `useEffect`. Nhờ vậy HTML server
sinh ra và lần render client đầu tiên luôn giống nhau — sang Next.js thì pattern
này dùng lại nguyên vẹn, không phải sửa một dòng.

**3. Event bus bằng `CustomEvent` trên `document`, không qua store.**
`lib/event.ts` + `constants/events.ts`. Sleep timer phát `FADE_OUT`, mọi `Howl`
đang phát tự nghe và fade — không cần store biết có bao nhiêu sound đang chạy.
Store chỉ `lock()` để chặn tương tác trong lúc fade, rồi `pause()` + `unlock()`.

**4. Volume là tích hai tầng.** `volume` của từng sound × `globalVolume` trong
settings store. Card tính `adjustedVolume` rồi truyền xuống `useSound`.

## Những chỗ phải sửa khi port

| Chỗ | Vì sao | Cách xử lý |
|---|---|---|
| `helpers/path.ts` | `import.meta.env.BASE_URL` là của Vite/Astro | viết lại, Next serve `public/` ở root |
| `data/sounds/*.tsx` | import `react-icons/bs/index` (đuôi `/index` để Vite tree-shake) | bỏ `/index` |
| `helpers/styles.ts` | `cn` tự viết, trùng với `cn` của shadcn (có `tailwind-merge`) | xoá, dùng `@/lib/utils` |
| `stores/`, `hooks/` | chạm localStorage và Howler | thêm `'use client'` |
| `navigator.audioSession` | API draft, không có trong `lib.dom` | khai báo ở `src/types/audio-session.d.ts` |
| `contexts/snackbar.tsx` | kéo theo một component chưa port | tạm bỏ, dùng `sonner` của shadcn |

Bản gốc **không chạy `tsc`** — script `check` của nó là Biome, nên lỗi
`navigator.audioSession` chưa bao giờ lộ ra. Bản này typecheck sạch.

## Đã port

- Toàn bộ lớp dữ liệu và state: `stores/` (8 store), `data/`, `hooks/`,
  `helpers/`, `constants/`, `lib/` — gần như không đổi.
- UI: hero, play controls (play/pause, shuffle, clear, restore), category
  section, sound grid có Show More, sound card, favorite, volume slider.
- Assets: `public/sounds` (117MB), images, logo, og.

## Chưa port

- `toolbar/` và `toolbox/`: pomodoro, todo, notepad, countdown.
- `modals/`: presets, sleep timer, share link, shortcuts, binaural, breathing,
  isochronic, lofi (YouTube embed).
- `media-controls/` (Media Session API), `category-icons/` (thanh nav nhảy
  nhanh tới category), PWA, dark theme toggle, snackbar.

## Chạy

```bash
npm run dev    # cổng 3100 khi test song song với bản gốc (Astro ở 4321)
npm run build
```
