# 진행 상황

축구선수 육성 게임(패러디) — React + TypeScript + Vite. 실행·구조·배포는 [README](../README.md).

- 저장소: https://github.com/hanlok007-stack/kangin-raising · 배포: https://hanlok007-stack.github.io/kangin-raising/
- `main`에 푸시하면 GitHub Actions가 테스트 → 빌드 → Pages 배포. **푸시·스토어 제출·결제·계정 생성은 사용자 확인 없이 하지 않는다.**
- 실행: `npm install` → `npm run dev` (http://localhost:5180) · 검증: `npx tsc --noEmit`, `npm test`, `npm run build`

## 완료

v0.2 유소년 MVP · v0.3 프로 구간·경기 기록지·에이전시·편집자·세계 탭·배포 ·
v0.4 반기/분기 가변 턴·은퇴·의욕/변덕·해외 유스·손흥민/박지성 팩·레전드 도감·PWA·가로 화면·광고 자리(되돌리기)

## v0.5 체크리스트 (사용자 요청 2026-10-04 밤)

위에서부터 순서대로. 항목을 끝낼 때마다 검증 → 이 파일 갱신 → `git commit` (푸시는 하지 않는다).

- [x] 1. **패러디 표기** (`src/data/parody.ts`, `src/data/index.ts`에서 모든 팩에 적용)
  - 실존 인물·구단·학교·방송 이름을 살짝 비튼 표기로 바꾼다. 데이터 파일은 원래 표기로 두고, 팩을 내보낼 때 치환표로 한꺼번에 바꾼다.
  - "실제 역사 / 실제 커리어 / 실제와 같은 선택 / REAL ROUTE" → "원작 / 원작 연표 / 원작과 같은 선택 / ORIGINAL ROUTE".
  - 화면 코드(`src/ui/*.tsx`)에 박힌 이름·"실제" 문구도 `pack.hero`와 "원작"으로. `index.html` 제목과 `public/manifest.webmanifest` 이름도.
  - 고지문: "이 게임의 인물·구단·대회는 모두 패러디이며 실존 인물·단체와 무관합니다."
- [x] 2. **초기화면에서 편집자 제거 + 관리자 설정** (`src/platform/admin.ts`, `src/ui/admin.tsx`)
  - 타이틀의 "편집자 화면" 버튼을 없앤다. 로고를 7번 누르면 PIN 입력 → SHA-256 해시가 맞으면 관리자 화면.
  - 관리자 화면: 편집자 열기, 광고 제거 권한 켜고 끄기(테스트), 챕터 전부 열기, 웹에서도 전면 광고 자리 보기, 저장 데이터 초기화.
  - PIN 바꾸기: `node scripts/set-pin.cjs <새 PIN>` 이 `ADMIN_HASH`를 다시 쓴다.
- [x] 3. **경기 선택지 슬롯** (`engine.ts` startMatch/movesFor, `types.ts`)
  - 배운 기술이 많아도 한 장면에 나오는 선택지는 `s.slots`개(기본 4, 최대 6)만 무작위로. 기본기 하나는 반드시 포함.
  - 제시 목록은 경기 시작 때 정해 `match.offers`에 저장한다(다시 그려도 바뀌지 않게).
  - 슬롯 +1: 이벤트 보상(`Outcome.slot`) 또는 광고 보기(기록 탭의 버튼, `addSlot`).
- [x] 4. **챕터 진행** (`src/data/index.ts`의 campaign, `store.ts`의 `meta.chapter`)
  - 1장 슛돌이 시절(이강인, 2011년 스페인행 결정까지) → 2장 유럽 사가(이강인, 2023년까지) → 3장 손흥민 → 4장 박지성.
  - 1장을 넘기면 "CHAPTER CLEAR" 화면 + 광고 제거 패키지 안내, 같은 판을 그대로 이어서 2장.
  - 손흥민은 2장을 마쳐야(2024년 도달 또는 은퇴 엔딩), 박지성은 3장을 마쳐야 열린다. `meta.unlocked`는 `meta.chapter`로 대체.
- [x] 5. **광고 정책과 결제 준비** (`src/platform/ads.ts`, `src/platform/billing.ts`)
  - 되돌리기는 횟수 제한 없이, 매번 광고 한 번. 1장에서는 첫 번째 되돌리기가 무료.
  - 전면 광고 자리: 1장 없음, 2장 14턴마다, 3장 10턴마다, 4장 8턴마다. 웹에서는 띄우지 않고(관리자 설정으로 미리보기), 앱에서만.
  - 상품 `no_ads` "광고 완전 무료 패키지" 9,900원: 가지고 있으면 모든 광고를 건너뛰고 보상만 받는다.
  - 웹에서는 구매 불가 안내만. 앱에서는 Google Play 결제 플러그인을 붙일 자리(`purchase()`)만 만들어 둔다. **실제 결제 코드는 Play Console 상품 등록 후에.**
- [x] 6. **광고를 부르는 위기 이벤트** (`src/data/kangin/crisis.ts`, 삽화는 `art.ts`)
  - 탈진 1회차는 구급차를 타고 가서 봐준다(지금의 f_collapse1 문구 보강), 2회차는 엔딩 → 되돌리기.
  - 연애: 첫사랑 고백 → 응원 덕에 오히려 잘 풀리는 길 / 한눈팔다 축구를 그만두는 길(엔딩 `love`). 다른 선수 팩에는 연애 이벤트를 넣지 않는다.
  - 최저학력 미달, 새벽 휴대폰, 피로골절, 아빠의 축구 금지령, 체지방 측정 등 8개 이상.
- [x] 7. **안드로이드 앱** (Capacitor) — 빌드 성공 (2026-10-04 22시)
  - 결과물: `C:\Users\eetlk\android-dev\kangin-debug.apk`(4.3MB, 휴대폰에 바로 설치해 볼 수 있음), `kangin-release-unsigned.aab`(3.1MB, 서명 전).
  - 다시 빌드: Git Bash에서 `export JAVA_HOME="C:/Users/eetlk/android-dev/jdk" ANDROID_HOME="C:/Users/eetlk/android-dev/sdk"` → 프로젝트에서 `npm run build && npx cap sync android` → `cd android && ./gradlew.bat assembleDebug --no-daemon` (또는 `bundleRelease`). 보안 정책에 막힌 실행 파일은 없었다.
  - 남은 것(사용자 몫): 서명 키 만들기(비밀번호를 사용자가 정해야 함)와 AAB 서명, Play 개발자 계정, 스토어 제출. 실제 휴대폰에서의 실행 확인도 아직 못 했다.
  - 아래는 이 항목을 진행하던 중의 기록이다.
  - 끝난 것: Capacitor 설치, `android/` 프로젝트 생성(compileSdk 36, Gradle 8.14.3), 가로 고정, 런처 아이콘(`npm run icons`).
  - 사용자가 2026-10-04에 승인한 것: JDK·Android SDK·Gradle 내려받기, Android SDK 라이선스 동의.
  - 내려받기는 `C:\Users\eetlk\android-dev\`에 진행 중이었다(회선이 느림, 초당 200KB 안팎). `jdk.zip`(약 200MB)과 `cmdline.zip`(약 150MB)이 다 받아지면 각각 `jdk\`와 `sdk\cmdline-tools\latest\`로 풀려 있어야 한다. 없거나 깨졌으면 다시 받는다:
    - JDK 21: `https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse`
    - 명령줄 도구: `https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip`
  - 남은 순서 (PowerShell, 매번 `$env:JAVA_HOME="C:\Users\eetlk\android-dev\jdk"; $env:ANDROID_HOME="C:\Users\eetlk\android-dev\sdk"`):
    1. `"y`n"*20 | & "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses`
    2. `sdkmanager.bat "platform-tools" "platforms;android-36" "build-tools;36.0.0"`
    3. 프로젝트 폴더에서 `npm run build; npx cap sync android`
    4. `android\local.properties`에 `sdk.dir=C\:\\Users\\eetlk\\android-dev\\sdk` 기록 후 `cd android; .\gradlew.bat assembleDebug` → `android\app\build\outputs\apk\debug\app-debug.apk`
    5. 되면 `.\gradlew.bat bundleRelease` (서명 키는 사용자가 비밀번호를 정해야 하므로 만들지 않는다. 서명되지 않은 AAB까지만.)
  - 2026-10-04 22시경 상태: JDK 21 정상 실행 확인(보안 정책에 막히지 않음), 명령줄 도구 설치됨. 위 1~4번을 한 번에 돌리는 스크립트를 백그라운드로 시작했고 로그는 `C:Userseetlkandroid-devuild-log.txt`에 쌓인다. 먼저 이 로그와 `androidappuildoutputsapkdebugapp-debug.apk` 유무를 확인하고, 끝나지 않았거나 실패했으면 실패한 단계부터 다시 한다.
  - 사용자 결정: 공개 배포(푸시)는 아침에 사용자가 확인한 뒤 한꺼번에. Play 개발자 계정은 아직 없음 → AAB와 스토어 등록 자료(`docs/STORE.md`: 앱 설명, 스크린샷 목록, 콘텐츠 등급 답변 초안, 개인정보처리방침 초안)까지 준비.
  - **정정 (22시)**: 위 1번의 PowerShell 파이프로는 동의 입력이 전달되지 않는다. 라이선스 동의는 Git Bash에서 `yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager.bat" --licenses`로 **이미 완료**했다. 2번의 빌드 도구 버전은 36.0.0이 아니라 빌드가 요구하는 **35.0.0**이다. 첫 빌드 시도는 라이선스 미동의로 실패했고(JDK 실행과 Gradle 8.14.3 내려받기는 정상), 동의 후 22:00쯤 패키지 설치와 `assembleDebug`를 Git Bash 백그라운드로 다시 시작했다. 로그는 같은 `build-log.txt`.
  - java.exe, aapt2.exe 등이 "Application Control policy"에 막히면 거기서 멈추고 무엇이 막혔는지 이 파일에 적는다.
  - 도구 위치: `C:\Users\eetlk\android-dev\` (JDK, Android SDK). 환경변수는 명령마다 `JAVA_HOME`, `ANDROID_HOME`으로 넘긴다.
  - `npm i -D @capacitor/cli @capacitor/core @capacitor/android` → `npx cap add android` → `npm run build && npx cap sync android` → `android\gradlew.bat assembleDebug` (그다음 `bundleRelease`).
  - 가로 고정(`android:screenOrientation="sensorLandscape"`), 앱 이름·아이콘 반영.
  - 네이티브 실행 파일이 보안 정책에 막히면 우회하지 말고 무엇이 막혔는지 기록한다.
- [ ] 8. 테스트 갱신, 브라우저 확인, 문서(README) 갱신

## 사용자만 할 수 있는 일 (대신 하지 않는다)

- Google Play 개발자 계정 만들기(등록비 결제, 본인 확인), 스토어 최종 제출 버튼, 결제 프로필·세금 정보.
- 서명 키 비밀번호 정하기와 보관.
- 광고 SDK(AdMob) 계정과 앱 ID 발급.

## 알아둘 것

- 이 PC는 Windows 애플리케이션 제어 정책이 서명되지 않은 네이티브 바이너리(.node/.exe)를 차단한다.
  Vite 7 + `package.json` `overrides`(rollup → `@rollup/wasm-node`, esbuild → `esbuild-wasm`) 구성을 바꾸지 말 것.
- 개발 서버 포트 5180. `gh` CLI 없음.
- 파일을 고칠 때 가끔 `UNKNOWN: unknown error, open` 이 난다(다른 프로세스가 잠깐 잡고 있음). 2초 뒤 다시 하면 된다.
- 구조: 엔진 `src/engine`(순수 함수), 데이터 `src/data`(이강인 `kangin/`, 손흥민 `son.ts`, 박지성 `park.ts`, 공용 파생 `derive.ts`), 화면 `src/ui`, 플랫폼 `src/platform`.
- 밸런스 손잡이: `src/data/kangin/index.ts`의 `gainScale`, `matchHard`, `calendar`.
- 콘텐츠 원칙: 주인공 외 인물은 가상이거나 이름 없이 역할로만. 사생활·논란은 쓰지 않는다. 병역 제도는 사실대로. 2026년 여름 이후는 지어낸 미래.
