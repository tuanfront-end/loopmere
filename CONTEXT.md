# moodist-next — ghi chú nghiên cứu

Bản port **Astro → Next.js** của [remvze/moodist](https://github.com/remvze/moodist)
(bản gốc nằm cạnh, ở `../moodist`, commit `285ecdb` / v3.0.0). Mục đích là học
kiến trúc, không phải để phát hành.

## Stack

| | Bản gốc | Bản này |
|---|---|---|
| Framework | Astro 7 | Next.js 16.3.5 (App Router, Turbopack) |
| UI lib | `radix-ui` 1.5 dùng trực tiếp | shadcn/ui `base-nova` — **Base UI**, không phải Radix |
| CSS | CSS Modules + PostCSS nesting | Tailwind v4 + token shadcn |
| Audio | Howler 2.2 | giữ nguyên |
| State | Zustand 4 + persist | Zustand 5 + persist (API dùng không đổi) |
| Icons | react-icons 4, sáu bộ trộn lẫn | Thiings cho sound, HugeIcons + Heroicons cho chrome |

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
| `data/sounds/*.tsx` | import `react-icons/bs/index` (đuôi `/index` để Vite tree-shake) | bỏ `/index`, rồi sau đó bỏ luôn cả `react-icons` — xem § Icon |
| `helpers/styles.ts` | `cn` tự viết, trùng với `cn` của shadcn (có `tailwind-merge`) | xoá, dùng `@/lib/utils` |
| `stores/`, `hooks/` | chạm localStorage và Howler | thêm `'use client'` |
| `navigator.audioSession` | API draft, không có trong `lib.dom` | khai báo ở `types/audio-session.d.ts` |
| `contexts/snackbar.tsx` | kéo theo một component chưa port | bỏ hẳn, dùng `sonner` — xem § Snackbar |

Bản gốc **không chạy `tsc`** — script `check` của nó là Biome, nên lỗi
`navigator.audioSession` chưa bao giờ lộ ra. Bản này typecheck sạch.

## Đã port

- Toàn bộ lớp dữ liệu và state: `stores/` (8 store), `data/`, `hooks/`,
  `helpers/`, `constants/`, `lib/` — gần như không đổi.
- UI: hero, play controls (play/pause, shuffle, clear, restore), category
  section, sound grid có Show More, sound card, favorite, volume slider.
- Assets: `public/sounds` (117MB), images, logo, og.
- Toolbar, mười ba panel, PWA, snackbar và nửa nhận của share link — mỗi thứ
  có mục riêng bên dưới.

## Soft Neutral

House style đã áp lên bản port. Palette copy nguyên khối từ
`template/scaffold/app/globals.css`, brand xoay sang **teal** bằng
`brand-hue.py`, type đổi sang pairing **Warm** (Fraunces trên Plus Jakarta
Sans) — Inter bị loại vì không có row đo trong skill. Button re-scale về
36/40/44, slider thumb từ 12px lên 24px, lucide bị thay khỏi mọi primitive.

**Không có `.soft-neutral.json` — site brief không áp vào đây.** Hai dial mà
`/site-brief` ghi ra là dial của một template đem bán: vẽ bao nhiêu, tiêu hue
dày bao nhiêu. Bản này là port để đọc kiến trúc, nên nó chạy ở notch mặc định,
tức là chính tài liệu skill. `_dials.py` không cần file đó, và hai checker đọc
nó thì rơi về mặc định.

### Icon sound không phải HugeIcons — cố ý

Skill nói icon là HugeIcons, nhưng đó là bộ icon *giao diện*: nó không có
woodpecker, singing bowl hay morse code. Cái luật đó thực sự cấm là **trộn
nhiều bộ trong một lưới**, và bản gốc trộn sáu bộ react-icons. Nên 92 icon
sound giờ lấy từ **một** bộ — xem § Icon.

### Một chỗ lệch khỏi scaffold của team

`lib/utils.ts` ở đây là `export { cn } from "cn"`, và mọi wrapper import thẳng
`from "cn"`. Đó là thứ `shadcn init` viết ra. Scaffold của team thì gỡ gói `cn`
và tự viết `cn` bằng `clsx` + `tailwind-merge` — xem `_comment` trong
`template/scaffold.json`. Hai đường cho cùng một kết quả (`cn` 0.3.0 của shadcn
là drop-in của clsx + tailwind-merge, không có dependency nào), nên chưa đổi;
nhưng một template đem bán thì phải theo scaffold.

## Gate

`npm run check` gom sáu gate đang xanh — type, palette, responsive, controls,
hover, vn-comment — cộng `next build` và toàn bộ selftest. **Đỏ ở đó là hồi
quy thật.**

`npm run check:all` chạy thêm năm gate nữa, và bốn trong số đó đang đỏ. Ba là
quyết định, một là việc chưa làm:

| Gate | Báo gì | Đọc thế nào |
|---|---|---|
| `page-check` | section 2–10: chín cái liên tiếp không ảnh, luật là ba | **quyết định** — xem ngay dưới |
| `ref-ledger` | 0/2 section ghi `// drawn:` | **quyết định** — không có mark vẽ tay nào, và moodist không đòi |
| `image-check` | `/logo-light.png` rộng 200px, sàn là 1200px | **false positive** — file đó là artwork của MediaSession, không bao giờ vẽ lên trang |
| `seo-check` | 4 defect | **việc chưa làm** — xem § Việc còn mở |

**`page-check` fail, và không sửa.** Luật picture run nói ba section liên tiếp
không ảnh là hết mức; trang này có chín grid category liên tiếp. Luật đó viết
cho landing page bán hàng, nơi mỗi section là một lập luận. Moodist là app
tool: chín grid là chín cái kệ của cùng một thứ, và nhồi một tấm ảnh vào mỗi kệ
sẽ làm trang đọc như catalogue chứ không phải như bàn trộn. Trang vẫn giữ một
ảnh thật ở hero, tức là colour floor vẫn được thoả.

## Icon

Một bộ duy nhất: **Thiings**, 92 PNG 3D trong `public/thiings/`, khoá theo id
của sound. `react-icons` đã gỡ khỏi `package.json`, và field `icon` đã rời
khỏi `data/sounds/*` — icon là tài sản hiển thị khoá theo id, không phải một
cột của dữ liệu. Chín file đó giờ là `.ts` vì không còn JSX nào trong chúng.

Chrome vẫn HugeIcons, với Heroicons cho chevron và play/pause. Hàng
Favourites là category duy nhất không có sound sau cái tên, nên nó mang theo
glyph trái tim của riêng nó qua prop `icon`.

**Licence là việc còn mở.** thiings.co cho tải lẻ **chỉ để dùng cá nhân**;
muốn dùng thương mại phải mua licence trọn bộ. Bản này chạy nội bộ nên không
sao, nhưng nếu có ngày đem bán thì đó là khoản phải trả trước.

Lấy được từng cái một: site không có API công khai (`/api/things`,
`/api/search`, `/api/icons` đều 404, danh sách không nằm trong RSC payload),
và tên khái niệm chỉ sống trong `alt` của mỗi ảnh. Ảnh gốc là PNG 1024px —
92 cái là 149MB, resize xuống 256px còn 5.1MB.

Bốn khái niệm không có trong bộ và phải mượn cái gần nhất: `inside-a-train`
lấy Tram, `morse-code` lấy Walkie Talkie, `windshield-wipers` lấy Car Wash,
`pink-noise` lấy Portable Speaker.

## Header và footer

Trang chỉ có **một route**, nên hai luật chrome của house style không áp dụng
nguyên văn và cả hai chỗ lệch đều là cố ý:

- **Không có mega menu Explore.** Luật đó viết cho template bán kèm cả chục
  route, nơi người mua cần thấy mình đã trả tiền cho những trang nào. Ở đây
  "route" duy nhất là chín cái kệ trên cùng một trang, nên nav là một dropdown
  **Shelves** dẫn tới chín anchor.
- **Menu mobile là `DropdownMenu`, không phải Drawer.** Luật Drawer đứng vững
  khi nav cao bằng màn hình và cuộn bên trong; mười anchor thì không. Đổi lại
  là không phải kéo một primitive mới vào bản port Base UI — `components/ui/`
  chưa có `drawer` lẫn `sheet`, và mỗi component thêm vào là một báo cáo
  `.migration/` nữa.

Anchor thật (`<a href="#category-rain">`) chứ không phải `scrollIntoView`:
`scroll-padding-top: 6rem` trong `globals.css` đã chừa chỗ cho thanh sticky, nên
link hạ cánh đúng chỗ **và** vẫn chạy khi không có JavaScript. Đo được 35px
giữa đáy header và đỉnh section.

**`PlayControls` không còn `sticky` nữa.** Header sticky và giữ play/pause cộng
số sound đang trong mix, nên hai viên thuốc kính cùng tranh đỉnh màn hình là
thứ bản trước đã có — viên dưới `z-20` chui xuống dưới viên trên `z-50`. Bộ
đầy đủ — shuffle, undo, clear — ở lại trong luồng, ngay trên kệ đầu tiên.

Logo là `components/moodist/logo.tsx` chứ không phải `<img src="/logo.svg">`:
file gốc tô path `#FAFAFA`, vẽ cho nền gần-đen của bản Astro, và một `<img>`
thì không tô lại được từ bên ngoài. Path vào thẳng component và nhận
`currentColor`.

Header dùng `buttonVariants` trên `<a>` thật cho hai link trông như nút. Viết
`<Button render={<a/>}>` thì Base UI gắn `role="button"` lên thẻ điều hướng, và
screen reader đọc một cú nhảy trang thành một cú bấm.

## Toolbar, toolbox và modals

Mười ba panel, tất cả đi qua **một** `ToolPanel` bọc shadcn `Dialog`: escape,
focus trap, scroll lock và nút đóng viết một lần thay vì mười ba lần. Bản gốc
tự dựng Modal bằng Portal + FocusTrap + motion; ở đây Base UI lo hết.

| Nhóm | Panel |
|---|---|
| Mix | Presets, Send this mix, Sleep timer |
| Tools | Countdown, Pomodoro, Notepad, Checklist, Breathing |
| Tones | Binaural beat, Isochronic tone, Lofi radio |
| Khác | Levels, Keyboard |

**Binaural và isochronic gộp thành một `ToneModal`.** Hai cái khác nhau đúng
bốn dòng — binaural là hai oscillator pan trái phải, isochronic là một tone bị
một sóng vuông ngắt quãng — còn toàn bộ phần bao quanh thì giống hệt. Bản gốc
là hai file gần như trùng nhau, và đó là hai file sẽ trôi khỏi nhau.

Hotkey giữ nguyên bản gốc, cộng `⇧M` mở menu. `MediaSession` cũng port:
Howler phát qua Web Audio API mà phím media của hệ điều hành không thấy được,
nên một track im lặng chạy vòng làm chỗ bám cho Media Session API.

## PWA

`app/manifest.ts` qua Metadata API của Next, và `public/sw.js` viết tay —
không thêm dependency nào, vì `@vite-pwa/astro` của bản gốc không có bản Next
tương đương đáng cài.

Service worker chia hai chiến lược: **cache-first cho `/sounds/`** vì loop là
lý do người ta cài app này và một file mp3 đã nằm trên đĩa thì không bao giờ
nên hỏi lại; **network-first cho phần còn lại** vì shell đổi mỗi lần deploy.
Request `Range` trả 206 nên không cache được nguyên khối — worker bỏ qua
chúng thay vì lưu một phần.

Worker **không** tự `skipWaiting`. Bản mới chờ, `ServiceWorker` component mời
reload bằng toast, và chỉ reload sau khi `controllerchange` báo worker mới đã
tiếp quản. Một trang tự reload dưới tay người đang viết dở ghi chú là một
trang vừa làm mất ghi chú đó.

**Chưa kiểm được bằng tay.** Browser pane của Claude chặn đăng ký service
worker — một worker rỗng cũng trả cùng lỗi `An unknown error occurred when
fetching the script`, nên đó là giới hạn môi trường chứ không phải script.
Cần mở bằng Chrome thật để xác nhận vòng install → waiting → reload.

## Snackbar

Bỏ context snackbar của bản gốc, dùng `sonner` đã có sẵn trong shadcn. Toast
chỉ đặt ở những chỗ hành động không để lại dấu vết trên màn hình: copy link,
copy và tải ghi chú, lưu preset, nhận mix từ link. Hai chỗ có **Undo** vì
chúng xoá việc người ta đã làm — xoá ghi chú và xoá mix.

Toaster ép `theme="light"` và dùng `--normal-shadow: var(--shadow-soft-lg)`.
Mặc định nó đọc `next-themes` và sẽ ra dark theo hệ điều hành, mà bản này
ship light-only.

## Nhận link chia sẻ

`SharedMix` là nửa còn lại của Send this mix, và là thứ bị bỏ quên ở lần port
đầu: nó đọc `?share=` một lần lúc mount, hiện các loop nhận được, rồi xoá
tham số khỏi URL để refresh không hỏi lại.

## Chưa port

Dark theme toggle, có chủ đích: skill nói ship light-only trừ khi viết hẳn
một surface ramp thứ hai, và depth dựa trên tint thì không đảo được.

## Base UI, không phải Radix

Repo khởi tạo nhầm bằng `shadcn init --base radix`; scaffold chuẩn của team
dùng **Base UI**. Đã migrate toàn bộ mười một wrapper bằng skill
`migrate-radix-to-base`, `radix-ui` đã gỡ khỏi `package.json`, và
`components.json` giờ là `base-nova`. Báo cáo từng component nằm ở
`.migration/`.

Năm chỗ vỡ ở call site, và chỉ một trong số đó biên dịch sạch mà vẫn sai:
`Select.Value` của Base UI hiện raw value trừ khi `Root` được đưa một map
`items`, nên nút chọn binaural đọc là `custom` thay vì `Set it yourself`.

`controls-check.py` trước đó báo false positive trên repo Radix vì nó chỉ biết
`SelectPrimitive.Popup` của Base UI. Đã sửa trong repo skill: rule đọc cả hai
part và gọi tên đúng cái file thực sự dùng. Nó cũng bắt được một finding thật
trên đường đi — base variant đặt padding của Select lên `SelectGroup`, và repo
này dời nó về popup.

**Bản sửa đó chưa vào `main`.** Nó nằm ở nhánh `select-popup-on-either-base`
trong `claude-build-template-skills`, một commit (`46af405`), chưa push, và
`main` đã đi trước bốn commit kể từ điểm rẽ. Symlink `.claude/skills/` trỏ vào
working tree của repo skill, nên checker mà session này chạy là bản nào đang
được checkout ở đó. Xem § Việc còn mở.

## Việc còn mở

Bốn thứ, không cái nào đang chặn:

**1. `seo-check` báo 4 defect.** Thiếu canonical, thiếu cả năm thẻ Open Graph
(`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`), thiếu
`twitter:card`, thiếu `sitemap.xml`. Tất cả đều là vài dòng trong `metadata`
của `app/layout.tsx` cộng một `app/sitemap.ts`.

Defect thứ năm — skip link trỏ vào `#content` mà không có gì mang id đó — đã
hết: `<main>` nhận `id="content"` khi header vào, vì một header có menu là
hơn chục tab stop đứng trước thẻ sound đầu tiên.

**2. Service worker chưa kiểm được bằng tay** — § PWA nói vì sao. Cần mở bằng
Chrome thật để xác nhận vòng install → waiting → reload.

**3. Nhánh `select-popup-on-either-base` chưa merge** ở repo skill. Rebase lên
`main` rồi mở PR, hoặc bỏ nó đi — nhưng đừng để nó nằm đó: khi nào repo skill
checkout sang nhánh khác thì checker ở đây đổi hành vi mà không ai báo.

**4. Licence thiings** — § Icon nói rõ. Chỉ thành vấn đề nếu có ngày đem bán.
