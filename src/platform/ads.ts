// 광고 창구. 게임 코드는 이 파일의 함수만 부른다.
// 지금(웹)은 진짜 광고 없이 몇 초 기다렸다가 보상을 준다. 앱으로 낼 때는 이 파일 안에서만
// Capacitor AdMob 플러그인(@capacitor-community/admob) 호출로 바꾸면 된다.

export const AD_SECONDS = 3;

// Capacitor로 감싼 앱 안에서 실행 중인가
export const isNative = () => typeof window !== 'undefined' && 'Capacitor' in window;

// 보상형 광고를 끝까지 보면 true
export function rewarded(): Promise<boolean> {
  // TODO(앱 출시): isNative()일 때 AdMob.showRewardVideoAd()로 교체
  return new Promise((resolve) => setTimeout(() => resolve(true), AD_SECONDS * 1000));
}
