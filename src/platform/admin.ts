// 관리자 설정의 문지기. 타이틀 로고를 일곱 번 누르고 PIN을 넣어야 들어간다.
// 코드에는 해시만 둔다. PIN을 바꾸려면: node scripts/set-pin.cjs <새 PIN>
// 주의: 화면을 가리는 용도일 뿐 보안 장치는 아니다. 짧은 PIN의 해시는 풀릴 수 있다.
export const ADMIN_HASH = 'f63954fc52ed507dc764de3a4debbf37dd07520d28c6e10a119c712bb9d03849';

export async function checkPin(pin: string): Promise<boolean> {
  if (!ADMIN_HASH) return false;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('kangin:' + pin));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === ADMIN_HASH;
}
