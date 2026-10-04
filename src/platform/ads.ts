// 광고 창구. 게임 코드는 이 파일의 함수만 부른다.
// 지금은 진짜 광고 없이 몇 초 기다렸다가 보상을 준다. 앱으로 낼 때는 이 파일 안에서만
// Capacitor AdMob 플러그인(@capacitor-community/admob) 호출로 바꾸면 된다.
import { owned } from './billing';
import { flags } from './flags';

export const AD_SECONDS = 3;

// Capacitor로 감싼 앱 안에서 실행 중인가
export const isNative = () => typeof window !== 'undefined' && 'Capacitor' in window;

// 광고 제거 패키지를 가진 사람은 광고 없이 보상만 받는다
export const adFree = () => owned();

// 보상형 광고를 끝까지 보면 true
export function rewarded(): Promise<boolean> {
  if (adFree()) return Promise.resolve(true);
  // TODO(앱 출시): isNative()일 때 AdMob.showRewardVideoAd()로 교체
  return new Promise((resolve) => setTimeout(() => resolve(true), AD_SECONDS * 1000));
}

// 장이 넘어갈수록 광고가 잦아진다. 1장에는 전면 광고가 없다.
const EVERY = [0, 0, 14, 10, 8];

// 이번 턴을 시작하기 전에 전면 광고를 띄울 차례인가. 웹에서는 띄우지 않는다(관리자 설정으로 미리보기).
export function interstitialDue(chapter: number, turn: number): boolean {
  const n = EVERY[chapter] ?? 8;
  if (!n || adFree() || !(isNative() || flags().webAds)) return false;
  return turn > 0 && turn % n === 0;
}

// 되돌리기에 광고가 필요한가. 1장의 첫 번째는 그냥 봐준다.
export const reviveNeedsAd = (chapter: number, usedBefore: boolean) => !adFree() && !(chapter === 1 && !usedBefore);
