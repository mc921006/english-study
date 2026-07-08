# English Study

Next.js App Router, TypeScript, Sass modules 기반 영어 공부 웹앱입니다.

## Structure

- `src/app`: App Router routes and route-level styles
- `src/components/layout`: shared layout components
- `src/features/words`: wordbook feature boundary
- `src/styles`: global style tokens

## Routes

- `/`: entry page
- `/words`: wordbook page

## Scripts

```bash
pnpm install
pnpm dev
```

## PWA

이 프로젝트는 모바일에서 홈 화면에 추가해 앱처럼 실행할 수 있도록 PWA 설정을 포함합니다.

- Manifest: `src/app/manifest.ts`
- Service worker: `public/sw.js`
- App icons: `public/icon-192x192.png`, `public/icon-512x512.png`
- iOS icon: `public/apple-touch-icon.png`
- Display mode: `standalone`
- Production start URL: `https://english-study-navy.vercel.app/`

### PWA 체크리스트

- HTTPS 환경에서 제공됩니다. Vercel 배포 URL은 HTTPS입니다.
- Web App Manifest가 제공됩니다.
- `name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`가 설정되어 있습니다.
- 192x192, 512x512 PNG 아이콘이 manifest에 포함되어 있습니다.
- iPhone 홈 화면 아이콘용 `apple-touch-icon`이 설정되어 있습니다.
- 서비스 워커가 production 환경에서 등록됩니다.
- 서비스 워커에 `fetch` 핸들러가 있고, 페이지 이동은 네트워크 우선, 정적 리소스는 캐시 우선으로 처리합니다.

### Android 설치

1. Chrome 또는 Samsung Internet에서 `https://english-study-navy.vercel.app/`에 접속합니다.
2. 브라우저 메뉴를 엽니다.
3. `홈 화면에 추가` 또는 `앱 설치`를 선택합니다.
4. 설치가 끝나면 홈 화면의 `English` 아이콘으로 실행합니다.

### iPhone 설치

1. Safari에서 `https://english-study-navy.vercel.app/`에 접속합니다.
2. 하단 공유 버튼을 누릅니다.
3. `홈 화면에 추가`를 선택합니다.
4. 이름이 `English`인지 확인하고 `추가`를 누릅니다.
5. 홈 화면의 `English` 아이콘으로 실행합니다.
