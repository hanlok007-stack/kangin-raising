// 결제 창구. 게임 코드는 이 파일의 함수만 부른다.
// 상품은 하나: 광고 완전 무료 패키지(비소모성). Play Console에 같은 id로 인앱 상품을 등록해야 한다.
// 실제 결제 연결은 아직 없다 — 앱 출시 때 purchase()와 restore() 안에서 Google Play 결제 플러그인을 부른다.
import { flags, setFlag } from './flags';

export const NO_ADS = { id: 'no_ads', title: '광고 완전 무료 패키지', price: '9,900원', desc: '모든 광고가 사라집니다. 되돌리기와 선택지 슬롯도 광고 없이 바로.' };

export const owned = () => flags().noAds;

export type PurchaseResult = 'owned' | 'unavailable' | 'cancelled';

export async function purchase(): Promise<PurchaseResult> {
  if (owned()) return 'owned';
  // TODO(앱 출시): 네이티브에서 Play 결제 흐름을 띄우고, 성공하면 setFlag('noAds', true) 후 'owned' 반환.
  // 구매 영수증 검증과 환불 처리는 그때 함께 넣는다.
  return 'unavailable';
}

// 기기를 바꿨을 때 구매 내역 복원
export async function restore(): Promise<boolean> {
  // TODO(앱 출시): Play 결제 플러그인의 구매 내역 조회로 교체
  return owned();
}

// 관리자 설정에서 테스트용으로 켜고 끈다
export const grantForTest = (on: boolean) => setFlag('noAds', on);
