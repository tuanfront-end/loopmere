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
| `merge` của cả năm store | `deepmerge` **nối** mảng, và Strict Mode của Next chạy effect gọi `rehydrate()` hai lần ở dev — island của Astro thì không. Presets và checklist nhân đôi mỗi lần tải, React báo hai child cùng key, lần ghi kế tiếp lưu luôn bản đôi | `mergePersisted` trong `lib/persist.ts`: mảng đã lưu **thay** mảng mặc định. `StoreConsumer` chỉ hydrate một lần mỗi lần tải trang. Bản đôi đã lỡ ghi thì migration dọn: presets v2, todos v1 |
| `hooks/use-local-storage.ts` | ghi giá trị hiện tại — lúc mount còn là fallback — đè lên giá trị đã lưu; Strict Mode đọc lại đúng cái fallback đó, nên mỗi lần tải ở dev mất thời lượng Pomodoro và Show more của từng kệ | viết lại bằng `useSyncExternalStore`, cùng dáng với theme: không ghi gì cho tới khi có người set |
| `shuffle`, `unselectAll`, `override` trong `stores/sound.ts` | ghi thẳng vào object đang nằm trong store rồi `set` lại đúng tham chiếu đó, nên ai subscribe cả `state.sounds` không nghe thấy — sau "Build me a mix", Send this mix chia sẻ một mix rỗng | trả về object mới, qua `cleared()` |
| `lib/confetti.ts` | mỗi lần gọi là một `new JSConfetti()`, tức một canvas toàn màn hình nữa gắn vào `<body>` và không bao giờ gỡ | một instance, tạo lười |

Bản gốc **không chạy `tsc`** — script `check` của nó là Biome, nên lỗi
`navigator.audioSession` chưa bao giờ lộ ra. Bản này typecheck sạch.

## Đã port

- Toàn bộ lớp dữ liệu và state: `stores/` (8 store), `data/`, `hooks/`,
  `helpers/`, `constants/`, `lib/` — gần như không đổi.
- UI: hero, play controls (play/pause, shuffle, clear, restore), category
  section, sound grid có Show More, sound card, favorite, volume slider.
- Assets: `public/sounds` (117MB) và images. Logo và og của bản gốc thì đã
  bỏ — mark giờ là của bản port, xem đoạn Logo ở § Shell.
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
| `page-check` | section 2–9: tám cái liên tiếp không ảnh, luật là ba | **quyết định** — xem ngay dưới |
| `ref-ledger` | 0/3 section ghi `// drawn:` | **quyết định** — không có mark vẽ tay nào, và moodist không đòi |
| `image-check` | `/assets/pwa/192.png` và `512.png` hẹp hơn sàn 1200px | **false positive** — đó là icon app, dùng lại làm artwork của MediaSession, không bao giờ vẽ lên trang |
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

## Shell — trái, giữa, phải

Trang chạy trên một app shell ba cột, và **chỉ có một breakpoint**: `xl`
(1280px).

| | Dưới `xl` | Từ `xl` |
|---|---|---|
| Thương hiệu, điều hướng | thanh trên cùng sticky | cột trái |
| Play / pause, âm lượng, mix đang chạy | `PlayControls` trong luồng | cột phải |
| 13 công cụ | nút tròn nổi góc phải dưới | cột phải |
| Rail 9 kệ cuộn ngang | `CategoryRail` | cột trái |

Hai cách bày, **mỗi cách tự đủ**. Cái không tồn tại là một bề rộng mà nửa bộ
chrome biến mất — đó là lý do chỉ một breakpoint chứ không phải hai: ở
`lg` cột trái vừa chỗ nhưng cột phải thì không, và một app trộn âm có điều
hướng mà không có bàn trộn thì tệ hơn là gấp lại hẳn.

Hai rail là **panel nổi trên nền trang**, không phải cột chia bằng đường kẻ
— đọc theo ảnh tham chiếu chứ không theo X. Card chỉ nhỉnh hơn nền một
whisper nên mỗi panel lấy đúng cái hairline mà surface ladder đòi, và
`h-[calc(100dvh-1.5rem)]` giữ lề 12px nhìn thấy được ở trên và dưới suốt
chiều cuộn.

### Ba điều lệch khỏi house style, cả ba đều cố ý

- **Không có mega menu Explore.** Luật đó viết cho template bán kèm cả chục
  route. Ở đây "route" duy nhất là chín cái kệ trên cùng một trang, nên nav là
  chín anchor trong cột trái.
- **Menu mobile là `DropdownMenu`, không phải Drawer.** Luật Drawer đứng vững
  khi nav cao bằng màn hình và cuộn bên trong; mười anchor thì không. Đổi lại
  là không phải kéo một primitive mới vào bản port Base UI — `components/ui/`
  chưa có `drawer` lẫn `sheet`, và mỗi component thêm vào là một báo cáo
  `.migration/` nữa.
- **`PlayControls` không còn `sticky`.** Header sticky và cột phải đều giữ
  play/pause, nên hai viên thuốc kính cùng tranh đỉnh màn hình là thứ bản
  trước đã có — viên dưới `z-20` chui xuống dưới viên trên `z-50`.

### Lưới đo theo cột giữa, không theo cửa sổ

`SoundGrid` và footer dùng container query (`@xl`, `@4xl`) chứ không phải
breakpoint viewport. Với một rail mỗi bên, cửa sổ thôi không còn là thứ quyết
định lưới bao nhiêu cột: ở 1280 cửa sổ là "desktop" nhưng cột giữa chỉ 612px.
Ngưỡng hai cột là `@xl` (576px) sau khi đo — `@2xl` để 1280 rơi về một cột.

### Chữ phải viết lại vì cột hẹp đi

Cột giữa hẹp làm ba khối chữ kết thúc bằng dòng cụt và `responsive-check` bắt
được: blurb của `places`, của `things`, và dòng cuối footer. Sửa bằng chữ chứ
không bằng `text-balance` — cả ba rút thành **một dòng** ở 1280, vì muốn hai
dòng cân thì blurb phải dài gấp rưỡi những blurb còn lại.

### Scrollspy đo, không quan sát

Cột trái sáng đúng kệ đang xem: `useActiveShelf` lấy kệ cuối cùng có mép trên
vượt qua vạch một phần ba màn hình, đọc trên mỗi sự kiện cuộn. Bản đầu dùng
`IntersectionObserver` trên một dải hẹp và có một lỗ cơ học: qua khỏi kệ cuối
thì **không section nào nằm trong dải**, callback ngừng bắn và highlight đứng
lại ở chỗ cũ. Đo thì trả lời được mọi vị trí cuộn, kể cả những vị trí không có
gì trong tầm.

Chín phép đọc rect, không có phép ghi nào xen giữa, nên trình duyệt trả lời cả
chín từ một lần layout — gom thêm sau `requestAnimationFrame` chỉ đẻ ra một cờ
để mà sai.

### Anchor thật, không phải `scrollIntoView`

`<a href="#category-rain">` chứ không phải JavaScript: `scroll-padding-top`
trong `globals.css` đã chừa chỗ, nên link hạ cánh đúng chỗ **và** vẫn chạy khi
không có JavaScript. Từ `xl` không còn thanh nào ghim trên cột giữa nên khoảng
chừa hạ từ `6rem` xuống `1.5rem`, bằng đúng lề của shell.

### Một chỗ trùng đã bỏ

Cột phải **không có nút `Levels`**: panel của nó chính là hai slider mục
Levels ngay phía trên, và một rail mở modal lên nội dung của chính nó là cái
cửa dẫn vào căn phòng đang đứng. Menu nổi thì vẫn giữ, vì dưới `xl` không có
mục nào để mà trùng.

### Trạng thái 13 modal nằm ở `ToolsProvider`

Trước đây `Toolbar` vừa là nút bấm vừa là chủ sở hữu state của cả 13 panel.
Giờ `tools-provider.tsx` giữ state, phím tắt và chỗ render modal; cột phải,
menu nổi và phím tắt là ba cái nút trên cùng một bộ panel. `TOOL_GROUPS` là
một danh sách duy nhất, nên rail và menu không thể trôi thành hai ý khác nhau
về việc công cụ là gì.

**Logo là mark riêng của bản port — Horizon:** một vòng tròn, mức nước dâng
trong nó theo một nhịp sóng; đọc ra level, sóng âm và đồi dưới trời cùng lúc.
Rosette của bản gốc là mark của dự án gốc, nên nó ra đi cùng mọi file ăn theo —
`logo.svg`, `logo-dark.png`, `logo-light.png`, `favicon.svg`, `og.png`, cả năm
giống hệt từng byte với `../moodist` — còn `favicon.ico` từng là tam giác mặc
định của Vercel. Mark nằm inline trong `components/moodist/logo.tsx` để nhận
`currentColor`; mọi bản raster — favicon, `apple-icon`, bảy icon PWA, artwork
của MediaSession — render từ `app/icon.svg` bằng `npm run icons`. Hai path của
mark có mặt ở cả hai file, nên đổi mark là sửa cả hai rồi chạy lại lệnh đó.

**Tên hiển thị là Loopmere** — một *loop*, cái vòng của mark, và một *mere*,
mặt nước lặng dâng trong nó. "Moodist" là tên của dự án gốc, nên nó chỉ còn ở
chỗ ghi công: dòng cuối rail và cột "Where it came from" của footer. Lowtide
được tra trước và bị loại — ít nhất năm sản phẩm phần mềm cùng tên, và TIDE là
một app ngủ/tập trung lớn đúng ngách. Ngách này đã bão hoà chữ thiên nhiên
(Stillroom, Drift, Lull đều có app), nên tên được ghép. Ngày 23/9/2026 Loopmere
không có kết quả web nào, `.com` và `.app` đều còn trống.

**Khoá lưu trữ vẫn là `moodist-*`, cố ý.** Bảy khoá localStorage và hai cache
của service worker mang tên cũ. Không ai nhìn thấy chúng, và đổi tên là xoá mix,
preset và note của người đã dùng, trừ khi viết migration. Thư mục
`components/moodist/`, tên package và tên repo cũng giữ nguyên.

Header dùng `buttonVariants` trên `<a>` thật cho hai link trông như nút. Viết
`<Button render={<a/>}>` thì Base UI gắn `role="button"` lên thẻ điều hướng, và
screen reader đọc một cú nhảy trang thành một cú bấm.

## Brand, face và trạng thái của card

**Brand là xanh Envato**, `hsl(97 76% 60%)` — chính là `#87E64B` đọc từ
elements.envato.com chứ không phải đoán. Đây là hàng `lime` của skill với hue
nhích hai độ cho khớp, nên các số đo mà hàng đó được nhận vào vẫn còn đúng.

Nó là brand **sáng**, tức là đúng trường hợp mà cặp hai token sinh ra để giải
quyết: `--primary` làm fill và mang chữ gần-đen (16:1; chữ trắng trên nó chỉ
1.6 và không đọc được), còn `--primary-ink` là `hsl(95 50% 26%)` — thứ mà
`--ring` và dải chart đọc.

**Cái giá phải nói ra:** ở 97° brand này cách `--lime` 17°, nên trang nào ở đây
muốn màu thứ hai thì tiêu một trong năm accent còn lại. `palette-check` báo
khoảng cách đó mỗi lần chạy.

**Face là Google Sans Flex**, một họ duy nhất cho cả heading lẫn body — trạng
thái nghỉ của house style và là câu trả lời đúng cho product UI. Fraunces đã
rời đi cùng lúc. Bốn số của hàng này lấy từ bảng per-face trong `setup.md`, đo
sẵn chứ không tự chọn: cặp trọng lượng **400/500**, tracking **lỏng một bậc**
(side bearing của `n` đọc 0.061 so với 0.080 của Geist, tức face này fit chặt
hơn cái mà luật gốc được viết trên), leading tối thiểu 0.97 nên bind ở 1.

`ss01` **bật, và nó gần như không làm gì trên bản tiếng Anh.** Feature này
trong Google Sans Flex chỉ thay hai glyph — `ă` và `ạ` — cộng thêm `ā ą ǎ` ở
subset latin-ext. Đó là lý do subset `vietnamese` được nạp: trên chữ Latin nó
trơ, còn trên chữ Việt nó là toàn bộ điểm của feature.

### Bốn trạng thái của sound card

Trước đây card chỉ có hai trạng thái và cả hai đều hỏng ở chỗ hover:

| Hỏng gì | Vì sao |
|---|---|
| Đĩa tròn sau icon biến mất khi hover | đĩa đặt `group-hover:bg-transparent` |
| Track của volume slider chìm mất | card đang chọn hover xuống `bg-muted`, đúng màu của track |
| Layout giật khi chọn / bỏ chọn | slider `return null` khi chưa chọn, nên card đổi chiều cao |
| Không pause được từng sound | bỏ chọn là cách duy nhất làm im, và nó xoá luôn mức âm lượng |
| Nền hai nút góc card nhấp nháy | popup tooltip ăn con trỏ ngay trên mép nút — xem mục dưới |

Giờ:

- **Không còn đĩa tròn, cũng không còn hộp, sau ảnh thiings.** Các render này
  tự mang hình khối của chúng, nên một cái đĩa đằng sau là hình thứ hai cãi
  nhau với hình thứ nhất. Bỏ nền mà giữ hộp thì chưa xong việc: ảnh 26px nằm
  giữa hộp 44px vẫn thụt vào **9px** so với nhãn ngay dưới nó, và cái thụt đó
  là thứ đọc ra thành lệch. Giờ ảnh tự định kích thước, đo lại được **0px**.
  Hai cỡ duy nhất: **32px** cho card và tiêu đề kệ, **24px** cho mọi hàng và
  mục menu. Chiều cao hàng rail giữ nguyên 44px bằng cách bù padding.
  Vì thẻ ảnh mang `alt=""`, một file PNG khuyết hiện ra là chỗ trống chứ không
  phải ảnh vỡ. Đây cũng là chỗ lỗi "đĩa chìm khi hover" từng sống; giờ không
  còn đĩa thì không còn lỗi.
- **Một radius cho mọi nút: `rounded-sm`, khai báo ở `buttonVariants`.**
  Đo trên trang: 84 phần tử bấm được, tất cả 14.4px. Ba cái còn hình viên
  thuốc là link chữ trong footer — ở đó radius chỉ tạo hình vòng focus, và
  vòng bo tròn trên chữ inline là đúng.
  Trái tim và nút pause trên card **không đi qua `buttonVariants`** (chúng là
  `TooltipTrigger`), nên radius ở đó chép tay; cái thứ ba mang hình này thì
  phải thành variant.
  Đây là cách đọc rộng hơn luật radius: luật nói dưới 40px thì `rounded-full`
  thường hợp hơn, mà một nút icon `size-9` ở đây rơi vào 40% cạnh ngắn chứ
  không phải một phần ba. Đó là cái giá của việc cả bộ dùng chung một radius.
  **Container và badge không theo** — viên thuốc kính của header, khay
  `PlayControls`, chip đếm, và vòng tròn thở đều giữ `rounded-full`, vì chúng
  không phải nút.
- **Tab bo `rounded-sm`, card bo `rounded-lg`.** Radius đọc theo cạnh ngắn
  chứ không theo tên lớp: hàng rail cao 44px nên 24px của `rounded-lg` là 55%
  cạnh ngắn — hết đoạn thẳng giữa hai góc, và nó vẽ ra đúng hình viên thuốc.
  14px là 33%, vừa đúng ngưỡng để đọc ra hình chữ nhật bo góc. Pill của
  category rail cao 50px, cùng 14px là 29%. Card thì cao 162px nên 24px chỉ
  là 15% — đó là thang container, và nó đúng chỗ.
- **Hover: nhấc lên, và nhuộm đúng cái hairline.** Card giữ nền trắng, nhận
  `shadow-soft`, và border đổi từ xám sang `border-primary/60` — đúng sắc brand
  mà `ring` của trạng thái đang phát dùng ở cường độ đầy, nên hover đọc ra là
  **bản nháp của cú bấm sắp tới** chứ không phải một trang trí thứ hai. Đây là
  cách đọc rộng hơn luật depth: luật cho một tín hiệu, mà ở đây bóng gánh toàn
  bộ phần chiều sâu còn viền brand không gánh tí nào.
  Tab — hàng rail trái và pill của category rail — thì *nhuộm*: `bg-accent`,
  phẳng, không bóng; pill cũng lấy `border-primary/60`, card lấy thêm bóng.
  Cả hai đều tránh `bg-muted`, vì đó đúng là màu của track slider và của trái
  tim.
- **Trạng thái đang phát là một đường viền, không phải một mảng nền.**
  `bg-accent` đo được 1.02 so với card trắng — một tiếng thì thầm, lướt qua cả
  lưới thì đọc ra là không có gì. Muốn tint đủ to tiếng để chữa việc đó thì nó
  thành một mảng màu brand cỡ section, tức là một luật khác nữa; còn một đường
  viền thì đọc được ở mọi cỡ và không tiêu diện tích nào. Dùng `ring` chứ
  không phải `border`, vì hover gỡ border ra, mà viền này là **trạng thái**
  chứ không phải dấu hiệu đang-nằm-yên.
- **Slider luôn được vẽ**, và ở trạng thái `disabled` khi sound chưa vào mix.
  Trước đó nó `return null`, nên mỗi lần bấm là card đổi chiều cao và cả kệ
  nhảy một dòng. Bản trung gian chừa chỗ trống — hết giật nhưng card rỗng một
  phần ba ở đáy; vẽ hẳn một cái disabled thì vừa hết giật vừa nói cho người
  dùng biết mức âm lượng có tồn tại. Giá phải trả đo được: 83 input thừa,
  1860 node cho cả trang, DOMContentLoaded 190ms.
- **Bỏ chọn không còn xoá mức âm lượng.** Trước đây `toggle()` gọi kèm
  `setVolume(id, 0.5)`, nên bấm ra rồi bấm vào là mất mức đã chỉnh — và chính
  cái mất đó là lý do duy nhất nút pause trên card đáng tồn tại. Giờ card là
  một toggle thật. Một chốt chặn ở `select()`: mức đang là 0 thì quay về 0.5,
  vì một sound kéo về câm rồi lấy ra, lấy vào lại sẽ đọc ra là hỏng.
- **`isPaused` là một field riêng trong store**, tách khỏi `isSelected` (vẫn
  trong mix, vẫn giữ mức âm lượng) và tách khỏi `isPlaying` toàn cục (thứ tắt
  tất cả). Nút chỉ còn ở hàng trong cột phải — xem mục dưới.

Card đang chọn **không đổ bóng lúc nghỉ** — bóng là dấu của hover, không phải
của trạng thái. Thứ giữ trạng thái đang phát là `ring-primary` 2px inset.

Rail bên trái và rail category ở bản dưới `xl` đi theo cùng luật đó.

**Hai trạng thái là trắng-trên-trắng**, và chúng vẫn đọc được nhờ đường khác.
Đo bằng cách chụp cùng một vùng có và không có `:hover` rồi đếm pixel, chứ
không bằng mắt:

| Hover | % pixel đổi | Delta kênh lớn nhất |
|---|---|---|
| Card chưa chọn | 6.3% | 94 — hairline sang brand, cộng bóng |
| Card đang chọn | 6.6% | 94 — nền giữ trắng, viền brand cộng bóng |
| Rail inactive | 38.2% | 79 — nền accent cộng chữ đậm lên |
| Rail active | 38.2% | 9 — nền từ muted sang accent |

Card vẫn là ô động ít pixel nhất — nhưng delta kênh lớn nhất đã từ **16 lên
94** khi hairline chuyển sang brand: hover đọc rõ hơn hẳn mà không tiêu thêm
một phần trăm diện tích nào. Nếu có ngày cần to tiếng hơn nữa thì `shadow-soft`
→ `shadow-soft-lg` là cái núm, chứ đừng động vào nền: nền mà sẫm xuống là lại
nuốt track slider.

### Tooltip từng ăn con trỏ của chính cái nút nó mô tả

Triệu chứng người dùng báo: rê vào trái tim hoặc nút pause trên card thì **nền
hai nút đó nhấp nháy**. Đo bằng cách bắn `Input.dispatchMouseEvent` từng pixel
qua nút rồi đọc `elementFromPoint` cùng `backgroundColor` của trigger:

```
dy=-1  hit=div  inTip=true   bg=rgba(0,0,0,0)     ← con trỏ nằm trên tooltip
dy= 0  hit=div  inTip=true   bg=rgba(0,0,0,0)
dy=+1  hit=button[tooltip-trigger]  bg=rgb(238,237,236)
```

Popup mở cách trigger 4px, nhưng mũi tên `size-2.5` xoay 45° nên hộp bao của nó
nở từ 10 lên 14.1px và thò **~1px trở lại vào hàng pixel trên cùng của nút**.
Base UI mặc định để popup nhận con trỏ (`disableHoverablePopup` mặc định
`false`), nên hit test trả về tooltip: trigger mất `:hover`, nền tắt; nhích
xuống 1px thì bật lại. Cùng dải đó nằm đè lên chính card, nên bóng của card
cũng chớp theo.

Chữa ở **wrapper, một lần**: `disableHoverablePopup` trên Root nói ý định, còn
`pointer-events-none` trên Positioner mới là thứ chặn hit test. Không có gì
trong tooltip của app này bấm hay bôi đen được, nên nó không có việc gì phải
nhận con trỏ. Đo lại: `inTip=false` ở mọi hàng, nền bật từ đúng pixel đầu tiên
của nút.

**Chưa hết — còn một nửa nữa, và nửa này là animation.** Vẫn báo nhấp nháy sau
lần sửa trên. `slide-in-from-bottom-2` đặt `--tw-enter-translate-y: 8px` (kiểm
trong CSS đã build), tức popup **bắt đầu thấp hơn chỗ nó dừng 8px**. Chỗ nó
dừng là cách nút 4px, mũi tên đã thò sẵn 1px vào trong. Cộng 8 vào:

| | popup ↓ vào nút | mũi tên ↓ vào nút |
|---|---|---|
| khung đầu của animation (trước) | +4px | **+9.1px** |
| lúc nghỉ | −4px | +1.1px |

Nghĩa là mỗi lần tooltip mở, một khối `bg-foreground` **quét xuống một phần tư
chiều cao nút rồi rút lên** trong ~150ms. Rê vào rê ra vài lần là nháy.

Bỏ `slide-in-from-*` ở cả sáu hướng, giữ fade và zoom. Zoom đã mang chuyển
động, và nó mang đúng chiều: `--transform-origin` do positioner đặt trỏ về phía
trigger, nên popup nở **ra xa** control chứ không quét ngang qua. Ghi từng frame
sau khi sửa: mũi tên đứng yên ở +1.1px từ khung đầu tiên đến khung cuối.

### Nút pause đã rời khỏi card

Câu hỏi: nút pause trên card có cần không? Trả lời: **không**, và nó còn đang
gây hại.

| Vấn đề | |
|---|---|
| Layout giật | nút chỉ hiện khi card được chọn, nên mỗi cú bấm đẩy trái tim sang trái 36px — ngay dưới con trỏ đang đặt ở đó |
| Hai đường đến cùng một kết quả | bấm card = ra khỏi mix (im), bấm pause = trong mix nhưng im. Tai nghe không phân biệt được, mắt chỉ phân biệt được bằng cái ring |
| Slider đã làm việc đó | kéo về 0 cũng là "trong mix, im", và nó nằm ngay trên cùng card |
| Chật | hai nút 36px ở góc một card mà nhãn nằm ngay dưới chúng |

Lý do tồn tại duy nhất của nó — giữ mức âm lượng khi làm im — đã được chuyển
vào chính mô hình: bỏ chọn không xoá mức nữa. Nút ở lại **hàng trong cột
phải**, nơi nó là thành ngữ mute của bàn trộn: kênh vẫn nằm trên bàn, bấm một
cái là nghe lại, không phải đi tìm card.

Card đọc trạng thái đó mà không cần thêm control nào: **ring giữ nguyên brand**
(sound vẫn trong mix), còn ảnh render tụt xuống `opacity-55` — đúng độ mờ hàng
rail dùng — và nhãn chuyển `text-muted-foreground`. Bản đầu vẽ ring ở
`ring-primary/30`, và nó đọc ra thành *một card đang được hover*, tức là thứ
duy nhất trên card này không phải một trạng thái.

### Favourites: luôn có mặt, nằm cuối, sau một đường kẻ

Trước đây hàng Favourites chỉ hiện khi đã có ít nhất một tim, và nó nằm **trên
cùng** rail. Hai cái sai:

- Một hàng xuất hiện rồi biến mất sẽ **đẩy tám hàng còn lại xuống 40px** vì một
  cú bấm ở chỗ khác hẳn trên trang.
- Một kệ chỉ tồn tại sau khi người dùng đã dùng tính năng tạo ra nó thì không
  ai khám phá ra nó cả.

Giờ nó luôn được vẽ, nằm **ngoài vùng cuộn** của rail và dưới một `border-t`,
nên vị trí của nó không đổi dù rail cuộn đến đâu; số đếm ghi `0` khi rỗng, đó
là một trạng thái hợp lệ chứ không phải lỗi. Section trên trang cũng chuyển
xuống cuối theo — scrollspy đọc thứ tự của trang, nên thứ tự rail **phải** bằng
thứ tự DOM, nếu không highlight sẽ nhảy lung tung. Đo lại: bấm hàng Favourites
→ `aria-current` rơi đúng vào nó, và trang chạm đáy.

Kệ rỗng có empty state riêng trên `bg-accent` (không phải viền đứt — không ai
thả gì vào đây cả), chữ `text-balance` trong `max-w-[42ch]`: để nguyên bề rộng
kệ thì `responsive-check` bắt được dòng cuối chỉ dài 62px trên khổ 467px.

Bản dưới `xl` có cùng cấu trúc: dải chip category kết thúc bằng một vạch dọc
rồi đến chip Favourites.

### Một mép trái cho cả hai rail

Đo được, không phải áng chừng — `Range.getClientRects()` trên từng nhãn, vì
`getBoundingClientRect()` của một `<p class="px-1">` trả về mép **hộp** (0) chứ
không phải mép **chữ** (4):

| | Trước | Sau |
|---|---|---|
| Rail trái — wordmark | 0 | 10 |
| Rail trái — icon kệ | 10 | 10 |
| Rail trái — divider | 0..238 | 10..228 |
| Rail trái — credit | 0 | 10 |
| Rail phải — tiêu đề section | 4 | 10 |
| Rail phải — nhãn nhóm Tools | 4 | 10 |
| Rail phải — icon hàng Tools | 10 | 10 |

Luật: **thứ để đọc thì thẳng hàng với thứ để đọc; thứ để bấm thì không bắt
buộc.** Nền hover của một hàng, nút brand `w-full`, và card có viền trong The
mix đều chạm mép trong của rail — chúng là *nền*, và một cái nền chạy hết bề
ngang mới đọc ra là nền. Nhãn và đường kẻ thì vào 10px.

Trước đó divider và nhãn nhóm chỉ "đúng" khi hover, lúc nền hàng vươn ra gặp
chúng. Đó là canh theo một trạng thái tạm thời.

shadcn cho `SidebarSeparator` bám `mx-2` — tức mép *nền* của menu item chứ
không phải mép icon. Ở đây chọn mép icon, vì rail này chỉ có một cột nội dung
và một mép đọc thì dễ theo hơn hai.

Cùng lúc: glyph Favourites ở đầu kệ lấy `size-8`. Để mặc định nó ra 24px trong
khi `SoundIcon` vẽ đầu kệ ở 32px, nên tâm quang học của nó nằm **cao hơn tâm
tiêu đề 4px**. Đo lại: delta 0, đúng bằng tám kệ còn lại.

### Nhịp dọc ở mobile

Đo ở 390×844 rồi mới sửa. Ba chỗ, theo thứ tự nặng dần:

| | Trước | Sau |
|---|---|---|
| Khay `PlayControls` — khoảng trống trên/dưới | 128 + 128 | 32 + 96 |
| Gap giữa các kệ | 128 (15.2% màn hình) | 96 (11.4%) |
| `padding-bottom` của `main` | 160 | 96 |
| Đầu kệ → lưới | 40 | 24 |
| Padding card | 20 | 16 |

Chỗ hỏng nặng nhất **không phải card** mà là khay Play. Nó với dải chip từng là
`display: contents`, tức hai đứa con rời của `main`, nên **mỗi đứa ăn một gap
section đầy đủ**: một khay cao 52px nằm giữa 256px trống — một phần ba màn hình
điện thoại tiêu cho khoảng trắng quanh đúng một control. Giờ chúng là một hộp
`flex flex-col gap-8`, ăn một gap, bên trong 32.

Gap giữa kệ xuống 96 là **cố ý lệch khỏi bậc 128 của house style**. Chính luật
đặt ra bậc đó cũng nói: section chỉ nối tiếp nhau là một *run*, mà run thì đọc
liền mạch khi nó chặt. Chín cái kệ gần như giống hệt nhau là một run, và 128px
là một phần sáu màn hình 390px, tiêu tám lần. Từ `sm` trả về số của house.

Card lấy `p-4 sm:p-5`: luật compounding nói lớp thứ hai tính từ mép viewport ở
mobile rơi vào 12–16px, và gutter section 24px là lớp thứ nhất.

Tổng: trang từ ~14.7k xuống **13.4k px**.

Một chỗ còn để lại: nút tools nổi (`fixed right-6 bottom-6`) đè lên dải chip ở
ngay màn hình đầu. Dải chip cuộn ngang nên không có chip nào bị khoá hẳn, và
`pr-14` cho nó chỗ để cuộn chip cuối ra khỏi nút. Bản thân việc một FAB nằm đè
lên nội dung khi cuộn thì vẫn còn.

### Hai menu mobile thành sheet

Cả hai menu ở bản dưới `xl` đều là dropdown neo vào một nút 36px ở hai góc đối
nhau: mười hàng đổ xuống từ góc trên phải, mười ba hàng mở ngược lên từ góc
dưới phải, mỗi cái tự cuộn trong `max-h-[70dvh]`. Sheet bắt đầu ngay ở mép mà
ngón cái đang ở đó, tự nói nó là cái gì, và đóng được bằng cách hất xuống chứ
không phải nhắm vào đâu cả. Hàng lên `py-3` — đo lại: **0 hàng dưới 44px**.

Dựng trên **`Drawer` của Base UI**, không phải `vaul` của shadcn: mọi wrapper
trong `components/ui/` đều là Base UI, và Base UI có sẵn cùng bộ cử chỉ. Thứ
làm nó giống native là `--bleed`: popup được vẽ cao hơn 3rem so với phần nhìn
thấy rồi kéo tụt xuống đúng ngần ấy, nên cuộn quá đà ở đáy sheet lòi ra thêm
sheet chứ không lòi ra trang phía sau.

**Một lỗi đã phải sửa ngay sau đó, và nó im lặng.** Popup từng là `flex
flex-col`, còn `Drawer.Content` — đứa con flex duy nhất của nó — mang
`min-h-0`. Đúng cặp đó cho phép một flex item **bị ép nhỏ hơn nội dung** thay
vì tràn ra. Hệ quả: popup báo `scrollHeight === clientHeight`, tức nó tin là
vừa, nên **không bao giờ mọc thanh cuộn** — còn các hàng vượt quá cap thì vẫn
được vẽ, ở ngoài sheet và dưới đáy màn hình, không cách nào với tới.

Sheet tools thừa **236px** kiểu đó: Binaural beat, Isochronic tone và Lofi
radio nằm ngoài màn hình và cuộn cũng không ra. Không nhìn thấy được bằng ảnh
chụp — ảnh chụp chỉ cho thấy danh sách bị cắt, đúng như một sheet cuộn được.
Phải đo `scrollHeight - clientHeight` mới ra.

Chữa: popup thành `block`. **Một hộp cuộn thì là một block.**

### Chỗ mà `responsive-check` không nhìn thấy

Gate xanh mà trang vẫn còn dòng cụt. Lý do nằm ở leaf test của nó:

```js
const leaf = [...el.childNodes].every((n) => n.nodeType === 3);
```

React chèn **comment separator** (`<!-- -->`) giữa hai text node liền nhau khi
SSR. Nên bất kỳ đoạn văn nào có một `{...}` cạnh chữ thường — lede của hero là
đúng một cái — đều không bao giờ được đo. Cộng thêm việc gate cố ý bỏ qua đoạn
có link inline.

Quét lại với lỗ đó bịt kín, **giữ nguyên sàn 300px của gate** (trong một thẻ
260px thì không có dòng dài nào để so đuôi), ở 5 bề rộng và cả hai sheet:

| | Trước | |
|---|---|---|
| Lede hero @1440 | 189/580px | 33% |
| Blurb footer @1440 | 28/309px | một chữ |
| Dòng licence @1024 | 80/**928px** | 8% |

928px là khoảng 150 ký tự một dòng — gấp đôi mức đọc được. Nên chữa hai thứ
khác nhau: `max-w-[68ch]` cho **measure**, `text-balance` cho **đuôi**.

Và khối licence lên `text-sm`. `type-check` coi một measure đặt trên `text-xs`
là lỗi phân loại, và nó đúng: khối nào cần chỉ chỗ xuống dòng thì khối đó là
copy, mà copy dừng ở `text-sm`; `text-xs` dành cho label một dòng. Bậc xuống
của small print do **mực** gánh, không phải cỡ chữ.

Kết quả: **0 stub** ở 390, 768, 1024, 1280 và 1440, cả trong hai sheet.

### Hover: ba chỗ, cùng một sắc

| | Trạng thái nghỉ | Hover |
|---|---|---|
| Sound card | trắng + hairline | **viền brand nhạt** + `shadow-soft` |
| Category chip | trắng + hairline | nền accent + **viền brand nhạt** |
| Hàng rail / hàng sheet | trong suốt | nền accent, phẳng |
| Nút `outline` | trắng + hairline | **trắng nguyên** + `shadow-soft`, hairline biến mất |
| Nút tròn của slider | không ring | ring `primary/45` |

**Card có viền brand, nút thì không — và đây là cố ý.** Hover một card là *xem
trước cú chọn* nó sắp trở thành, nên nó mượn đúng sắc mà `ring` của trạng thái
đang phát dùng ở cường độ đầy. Một cái nút thì không có trạng thái nào để xem
trước: bấm xong là xong, nên thứ duy nhất hover của nó cần nói là "cái này bấm
được" — và nó nói bằng cách **nhấc lên**. Đó cũng là luật depth đọc thẳng: một
hairline khi nằm trên mặt, một bóng mềm khi đã rời mặt, không bao giờ cả hai.

`outline` đi qua ba phiên bản trước khi đứng lại: `bg-muted` (rơi 7 bậc, đọc ra
thành *đang bị nhấn*, và trùng đúng màu track slider), rồi `bg-accent` +
viền brand, rồi mới đến trắng + bóng.

Ring của slider: ba màu, và **thứ tự variant quyết định chứ không phải thứ tự
viết** — Tailwind sắp `hover` < `focus-visible` < `active`, nên chuột được quầng
brand nhạt, bàn phím giữ `--ring` (vốn đã là `--primary-ink`, màu focus của cả
app), thumb đang kéo thì đậm lên `primary/70`.

`ScrollToTop` là ngoại lệ duy nhất: nó nổi trên trang nên **nghỉ đã có
`shadow-soft`**, và hover đi lên `shadow-soft-lg` thay vì đi ngang — không có
dòng đó thì hover nút duy nhất trên màn hình không đổi gì cả.

Thứ tự variant quyết định chứ không phải thứ tự viết: Tailwind sắp `hover` <
`focus-visible` < `active`, nên chuột được quầng brand nhạt, bàn phím giữ
`--ring` (vốn đã là `--primary-ink`, và là màu focus của cả app), còn thumb
đang kéo thì đậm lên.

Đo nút Show more: nghỉ `rgb(255,255,255)` + hairline `rgb(241,240,239)`, không
bóng → hover `rgb(255,255,255)`, viền `rgba(0,0,0,0)`, có bóng. Trang là
`rgb(253,252,252)`, nên nền trắng vẫn tách khỏi nền trang một bậc.

Và `transition-all` ở base của `buttonVariants` đổi thành danh sách tường minh
— `color, background-color, border-color, box-shadow, opacity, translate`.
`all` đặt mọi thuộc tính lên timer kể cả layout, và bộ nút này giờ có một cái
bóng để chạy. `translate` chứ không phải `transform`: Tailwind v4 ghi
`translate-y-px` vào đúng thuộc tính `translate`, và `active:translate-y-px`
vẫn đo được là `0px 1px`.

### Dark mode

Không có trước đó — và đó không phải "chưa làm", mà là **một lỗi đang chạy**.
`dark:` của Tailwind mặc định bám `prefers-color-scheme`, nên các utility
`dark:` mà wrapper shadcn mang sẵn vẫn kích hoạt trên máy để OS tối, trong khi
không có token dark nào phía sau. Đo được: với `prefers-color-scheme: dark`,
trang vẫn trắng mà nút outline đã nhận `dark:bg-input/30`.

Nên `@custom-variant dark (&:where(.dark, .dark *))` — bám **class**, vì một
cái switch không override được media query.

**Thang bậc lật ngược, nhưng whisper band thì giữ.** Bản đầu em dùng thang
rộng gấp ba (card L12, secondary L21) với giả định: ở gần đen, một bước
lightness nhỏ không thể cho ra ratio nhỏ. **Giả định đó sai**, và số học nói
vậy — giữ đúng các ratio của bản sáng trên nền L8 chỉ cần khoảng **6.4 điểm
lightness**, so với 8 điểm mà bản sáng tự tiêu giữa L99 và L91.

Nên năm rung dưới đây là **chính các ratio của bản sáng giải ngược cho nền
này**, và bản rộng bị bỏ sau khi render cả hai rồi so:

| | Sáng | Tối |
|---|---|---|
| card | 1.021 | 1.027 |
| accent | 1.057 | 1.069 |
| border | 1.118 | 1.131 |
| muted | 1.143 | 1.144 |
| secondary | 1.197 | 1.196 |

Mực: thấp nhất là `--muted-foreground` trên `--secondary` ở **6.87** — sàn là
4.5. `--primary-ink` không còn là bản tối của brand nữa mà là bản **sáng hơn**:
cái split tồn tại vì một brand sáng không clear 4.5:1 trên nền gần trắng; trên
nền gần đen thì chính brand sáng đó *là* mực.

Bốn chỗ hardcode phải sửa vì chúng chỉ đúng một phía:

| | Vấn đề trên nền tối |
|---|---|
| thumb của slider | `bg-card` là đỉnh thang sáng và **đáy** thang tối → thumb tối hơn track, biến mất |
| backdrop của Drawer | `bg-foreground/25` → `--foreground` gần trắng → màn che **trắng** |
| backdrop của Dialog | `bg-black/10` trên nền gần đen là không có gì |
| viên kính của header | `ring-white/50` thành một vạch chói |

`--shadow-soft` cũng dựng lại: bóng gần đen trên trang gần đen là không có gì,
nên vòng hairline lật sang **mực** — đó là cách một vật nổi giữ được mép ở phía
này — còn phần toả thì dùng đen thật ở alpha gấp 4–8 lần.

Theme đọc bằng `useSyncExternalStore` chứ không giữ trong React: class nằm trên
`<html>` **trước khi React tồn tại**, do script chặn trong `layout.tsx` ghi, nên
lần paint đầu đã đúng màu. Chép nó vào `useState` trong effect nghĩa là render
sai theme rồi sửa — đúng cái flash mà script sinh ra để tránh, chỉ muộn một
frame.

### Hero dựng lại theo ảnh tham chiếu

Yêu cầu là **chính xác về layout**, chỉ đổi content và ảnh. Nên mọi con số
dưới đây được đo từ ảnh rồi quy về tỉ lệ của container, không phải ước lượng:

| | Reference | Bản này |
|---|---|---|
| Cột phải mở ở | 48.0% | 50% + 36px |
| Khoảng giữa hai cột | 9.0% | 72px (`gap-x-18`) |
| Tỉ lệ ảnh | 1.94 | **1.94** |
| Card trái — left / top | 1.4% / 3.2% | 14.4px, cố định |
| Card trái — rộng | 25.9% | 26% |
| Card phải — right / bottom | 2.4% / 3.7% | 14.4px, cố định |
| Card phải — rộng | 29.9% | 30% |

Hai cột **bằng nhau**, không theo 48% của reference: tiêu đề không mang `max-w`
riêng, cột chính là measure, và copy được cắt cho vừa hai dòng lấp đầy cột đó.

**Inset của hai card là số cố định, không theo phần trăm của reference.** Khung
ảnh, card và hàng/nút bên trong là **ba góc đồng tâm**: khung `xl` 33.6 = card
`md` 19.2 + hở 14.4, và card 19.2 ≈ hàng/nút `sm` 14.4 + hở 6. Hở theo phần trăm
thì lớn theo cột còn radius thì đứng yên, nên các góc từng lệch đồng tâm 6–20px,
càng rộng càng lệch. `--panel-inset` là hai token trừ nhau, nên đổi `--radius`
thì nó tự đúng theo. Hàng starter cuối và nút "Play them all" tràn 10px ra cả
đáy lẫn hai bên; card giữ `p-4` ở mọi bề rộng (card sound lên `p-5` từ `sm`) để
khe 6 ấy không đổi. Đã dựng cả hai bậc bên cạnh: khung `2xl` trên card `lg`, hở
19.2, tròn quá so với tấm ảnh; khung `xl` trên card `lg`, hở 9.6, làm card dính
vào góc và khung cắt mất bóng.

Breakpoint đọc **cột giữa** chứ không đọc cửa sổ (`@xl`), cùng lý do với lưới
card. Thứ tự trong markup là thứ tự nó xếp chồng: tiêu đề → dòng giải thích →
hai nút.

Tiêu đề là **thang sáu bậc** đọc theo cột giữa, và mỗi breakpoint là một phép
đo chứ không phải một sở thích — số đo nằm ở comment trên lưới hai cột trong
`hero.tsx`. Cỡ nào cũng là bậc của thang: `text-4xl` đã vào hàng display trong
`globals.css`, nên không còn cần một cỡ arbitrary để có leading display.

**Hàng heading đứng ở 500; riêng H1 là 460, đặt ở call site, cố ý.**
`font-medium` trên một `h1` bị `type-check` chặn, đúng: từ `text-3xl` trở lên
thì **cỡ chữ là nhấn**, nên một utility weight nặng thêm ở call site là cái nhấn
thứ hai cãi nhau với cái thứ nhất. Chỗ của weight chung là **hàng type của
face** — `--heading-weight-normal: 500`, `--heading-weight-medium: 600` — nên
mọi heading, kể cả `h2` của các kệ, đứng ở 500. H1 đi hướng ngược lại: nhẹ hơn
hàng một chút (450, rồi 460), chỉnh bằng mắt, vì chữ cỡ display đọc ra nặng hơn
chữ nhỏ ở cùng một weight. Google Sans Flex là font variable nên 460 là 460 thật
chứ không bị làm tròn về 500. Đây là chỗ lệch khỏi Soft Neutral — skill không
cho weight arbitrary trên chữ display — và là weight call-site duy nhất trên một
heading.

Hai cột `items-end` — reference cho dòng cuối của tiêu đề và hàng nút rơi gần như cùng
một vạch, và `items-end` giữ điều đó đúng bất kể copy của cột nào đổi.

**Panel trái từng là một lưới tile** vẽ sáu sound đang chọn. Nó chỉ nói lại
đúng thứ panel bên kia ảnh đã nói, và trên một trang rỗng — tức mọi lần ghé
đầu tiên — nó không nói gì cả. Giờ là **ba mix dựng sẵn**, bấm một cái là chạy:
một cái cửa đáng giá hơn một cái gương.

Nó chỉ overlay từ `@3xl`, không phải `@xl`. Lý do là cái **floor**: hai card
chiếm 26% và 30% của một ảnh 1316px thì chừa lại 44% ảnh, nhưng cũng hai card
đó ở bề rộng tối thiểu trên một ảnh 548px chỉ chừa **4%**. Đo được: 1280 → một
overlay, 45%; 1600 → hai, 59%; 1920 → 56%, đúng bằng 55.8% của reference.

**Hai panel được render hai lần chứ không phải di chuyển.** Overlay thì chúng
phải nằm trong một hộp có `overflow-hidden`, xếp chồng thì phải nằm ngoài hộp
đó — không có một vị trí DOM nào làm được cả hai. `hidden` gỡ bản thừa khỏi cả
accessibility tree lẫn màn hình, nên không có gì bị đọc hai lần.

Dưới `@xl` khung ảnh vuông lại và hai panel rơi xuống thành stack: một màn hình
342px không gánh nổi một card rộng 26% có ảnh bên trong mà vẫn đọc được.

**Hàng starter là transport một khi nó là mix đang chạy.** Một hình tam giác
play mà vẫn là tam giác play trong lúc thứ nó khởi động đang phát ra tiếng là
cái control **nói dối về trạng thái của chính nó**. Nên nó lật: hàng nhận nền
`bg-chip` với mực brand, glyph thành pause, và cú bấm thôi nghĩa là "nạp cái
này" mà thành "dừng cái này". So khớp bằng chữ ký — id của mix đang chọn sắp
xếp rồi nối lại — chứ không phải bằng một cờ, để nó vẫn đúng khi người dùng tự
tay dựng lại đúng mix đó.

**Panel phải từng là transport cộng readout global volume.** Đó đúng là cặp mà
rail bên phải đã vẽ sẵn với đủ chỗ ghi nhãn — hai panel nói cùng một điều ở hai
bên một tấm ảnh. Giờ là **Favourites**: phần duy nhất của sản phẩm mà không có
gì khác trên màn hình này báo cáo — một con số, tên các sound đã lưu, và một nút
phát cả loạt. Thanh tiến độ của reference **đã bỏ**: kệ không đi tới đâu cả,
nên ba trên tám mươi tư là ba sound có người thích chứ không phải 4% của một
hành trình.

### H1 gõ chữ — và cái giá của một hộp chữ thay nội dung

Bốn câu chạy vòng trong H1. Ba quyết định, cả ba đều là để **cái hộp đứng yên
trong khi chữ bên trong đổi**.

**Không dùng thư viện.** Motion có `Typewriter` nhưng nằm sau Motion+ (trả
phí). Mọi gói miễn phí — `react-type-animation`, `typewriter-effect` — đều gõ
bằng cách *nối thêm* vào một node. Nghĩa là giữa hai frame, `h1.textContent`
đọc ra `"A night tra"`: với crawler, và với screen reader đáp xuống đúng lúc
đó. Ở đây phần chưa gõ chỉ `opacity-0` chứ vẫn nằm trong flow và trong
accessibility tree — đo 240 mẫu liên tiếp, **không lần nào** H1 không phải một
câu trọn vẹn.

Phần đuôi giữ chỗ còn giải quyết chuyện thứ hai: `text-balance` cân lại hai
dòng **mỗi lần chuỗi đổi**, nên gõ kiểu nối thêm sẽ làm tiêu đề giật chữ qua
lại suốt. Giữ nguyên cả câu thì line break được tính một lần cho mỗi câu. Đo:
vị trí hai dòng chỉ có **đúng một giá trị** trong 12 giây, chiều cao cũng vậy.

Câu đầu được server-render nguyên vẹn, caret chỉ mọc sau khi mount — nên first
paint đọc được ngay và HTML gửi đi chỉ có một câu, không nhân đôi.

**Caret là border-right của một span rỗng.** `inline-block` hay một thanh
absolute đều tạo **break opportunity** giữa lòng từ, nên tiêu đề sẽ xuống dòng
lại mỗi khi caret đi qua một chữ; ranh giới giữa hai `inline` thường thì không
— `"lo|ng"` vẫn là một từ với line breaker. Đặt border lên chính span chứa chữ
thì được, nhưng nó cao bằng font của span đó: một vạch từ ascender xuống dưới
descender, thò hẳn dưới dòng. Cho caret một element riêng thì nó có font-size
riêng, và font-size là **đòn bẩy duy nhất** đặt chiều cao một inline box
(`height` không áp dụng). Giải từ metrics của chính face này ra `0.64em` +
`vertical-align: 0.14em`; đo lại bằng một mốc baseline mà caret không xê dịch
được: **0.71em trên baseline** so với cap height 0.716em, và 0.09em dưới.
`-mr` trả lại đúng bề rộng border, nên line break giống hệt lúc có và không có
caret.

**Bốn câu được chọn bằng thước, không phải bằng tai.** Một câu chạy trong hộp
cố định phải xuống **đúng hai dòng ở mọi bề rộng hộp nhận được** — nếu không,
tiêu đề đổi chiều cao bốn lần một phút. Con số quyết định là cột hẹp nhất mà
câu còn nằm hai dòng, quy ra `em` để so được giữa sáu cỡ. Thang hiện tại đưa ra
cột chật nhất là **5.67em** (272px ở 48px — máy 320px), và bốn câu này đo
5.33 / 5.02 / 5.31 / 5.35. Đầu kia cũng có thước: quá khoảng 8.2em thì câu sụp
về một dòng, cột rộng nhất thang đưa ra là 8.2em, trần thấp nhất của bốn câu là
9.77em.

Đo 17 ứng viên, **11 câu rớt**, trong đó có `"A cafe that never closes."`
(5.62em) và `"A storm you can sleep through."` (5.90em) — hai câu này đã từng ở
trong bản đầu và làm tiêu đề nhảy 3 dòng ở 320/390/1280/1440. Kiểm lại cuối:
23 bề rộng × 4 câu = **92 tổ hợp, tất cả hai dòng, `box` giống hệt nhau**.

Cả bốn mở đầu giống nhau là cố ý: caret chỉ xoá về phần `"A "` chung, nên vòng
lặp đọc ra như một câu đang được viết lại chứ không phải bốn câu bị xoá trắng.

`prefers-reduced-motion` thì không có caret, không có vòng lặp — chỉ còn câu
đầu, đứng yên. Không có xử lý visibility: tab chạy nền bị browser bóp
`setTimeout` xuống một giây trở lên, vòng lặp tự nghỉ.

### Hai số nhỏ

`MixRow` — thumb chỉ cách mép dưới **3px** dù row khai `p-3`. Không phải lỗi
của row: control của slider cao đúng bằng track 4px, còn thumb 24px thì tràn ra
10px mỗi đầu. Chữa ở wrapper bằng `min-h-6` — **chỗ duy nhất biết thumb cao bao
nhiêu** — chứ không phải ở từng call site, vì mỗi call site đang sai một kiểu.
Đo lại: 13px.

`Levels` mặc định **90%** thay vì 100. Đầy là đỉnh slider, nên một mix đến đó
rồi thì chỉ còn đường đi xuống.

**Đổi một default không với tới được ai đã có localStorage** — và sau một ngày
dùng thì đó là tất cả mọi người. Trang lên 90 rồi bật ngược về 100 ngay khi
`rehydrate()` chạy. Nên `version` lên 1 kèm một `migrate`.

Một con số 1 đã lưu thì **không phân biệt được với một con số 1 do người dùng
chọn** — v0 ghi con số chứ không ghi việc slider có bị đụng vào hay không. Nên
migrate chuyển cả hai, và cái giá rơi vào người cố ý để full. Một cú kéo là về.
Mức nào khác 1 thì không đụng tới: đo với `0.4 / 0.65` → giữ nguyên, chỉ version
lên 1.

## Toolbar, toolbox và modals

Mười ba panel, tất cả đi qua **một** `ToolPanel` bọc shadcn `Dialog`: escape,
focus trap, scroll lock và nút đóng viết một lần thay vì mười ba lần. Bản gốc
tự dựng Modal bằng Portal + FocusTrap + motion; ở đây Base UI lo hết.

Bốn nhóm, tên trong `TOOL_GROUPS` ở `tools-provider.tsx` — một danh sách
duy nhất mà cả cột phải lẫn menu nổi cùng đọc:

| Nhóm | Panel |
|---|---|
| The mix | Presets, Send this mix, Sleep timer |
| While it plays | Countdown, Pomodoro, Notepad, Checklist, Breathing |
| Generated | Binaural beat, Isochronic tone, Lofi radio |
| This app | Levels, Keyboard |

**Binaural và isochronic gộp thành một `ToneModal`.** Hai cái khác nhau đúng
bốn dòng — binaural là hai oscillator pan trái phải, isochronic là một tone bị
một sóng vuông ngắt quãng — còn toàn bộ phần bao quanh thì giống hệt. Bản gốc
là hai file gần như trùng nhau, và đó là hai file sẽ trôi khỏi nhau.

State của cả mười ba nằm ở `ToolsProvider`, không ở nút bấm — § Shell nói
vì sao. Hotkey giữ nguyên bản gốc, cộng `⇧M` mở menu nổi. `MediaSession` cũng port:
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
