// 기기에 저장되는 스위치: 구매한 권한과 관리자용 테스트 설정
export interface Flags {
  noAds: boolean; // 광고 제거 패키지 보유
  allChapters: boolean; // 관리자: 모든 장 열기
  webAds: boolean; // 관리자: 웹에서도 전면 광고 자리 보기
}

const KEY = 'kangin.flags.v1';
const base: Flags = { noAds: false, allChapters: false, webAds: false };

export function flags(): Flags {
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return base;
  }
}

export function setFlag<K extends keyof Flags>(k: K, v: Flags[K]) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...flags(), [k]: v }));
  } catch {
    // 저장이 막혀 있으면 이번 실행에만 적용되지 않을 뿐이다
  }
}
