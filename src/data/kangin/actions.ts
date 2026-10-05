import type { ActionDef } from '../../engine/types';
import { careerActions } from './career';

export const actions: ActionDef[] = [
  { id: 'tech', kind: 'train', icon: '⚽', name: '개인 기술훈련', desc: '드리블↑ 패스↑', gain: { dri: 2.2, pas: 0.5 }, fx: { stamina: -14, stress: 4, joy: -2 }, physical: true },
  { id: 'pass', kind: 'train', icon: '🎯', name: '패스·킥 연습', desc: '패스↑ 지능↑', gain: { pas: 2.2, iq: 0.6 }, fx: { stamina: -12, stress: 4, joy: -2 }, physical: true },
  { id: 'shoot', kind: 'train', icon: '🥅', name: '슈팅 훈련', desc: '슈팅↑ 드리블↑', gain: { sho: 2.2, dri: 0.5 }, fx: { stamina: -14, stress: 4, joy: -2 }, physical: true },
  { id: 'phys', kind: 'train', icon: '🏋️', name: '피지컬 훈련', desc: '피지컬↑↑ 몸에 부담', gain: { phy: 2.6 }, fx: { stamina: -20, stress: 6, injury: 4, joy: -4 }, physical: true },
  { id: 'team', kind: 'train', icon: '🤝', name: '팀 훈련', desc: '고루↑ 감독·동료↑', gain: { dri: 0.7, pas: 0.7, phy: 0.7, iq: 0.7 }, fx: { stamina: -14, stress: 3, coach: 4, mates: 3, joy: -1 }, physical: true },
  { id: 'street', kind: 'train', icon: '🏃', name: '동네 막축구', desc: '드리블↑ 스트레스↓', when: { age: [0, 13] }, gain: { dri: 1.3, men: 0.7 }, fx: { stamina: -10, stress: -8, mates: 3, joy: 6 }, physical: true },
  { id: 'fk', kind: 'train', icon: '🦶', name: '왼발 프리킥 특훈', desc: '슈팅↑ 패스↑', when: { age: [8, 99] }, gain: { sho: 1.4, pas: 1.4 }, fx: { stamina: -12, stress: 5, joy: -2 }, physical: true },
  { id: 'tactic', kind: 'train', icon: '📺', name: '경기 분석', desc: '지능↑↑ 체력 소모 적음', when: { age: [9, 99] }, gain: { iq: 2.2, pas: 0.4 }, fx: { stamina: -5, stress: 5, joy: -2 } },
  { id: 'lesson', kind: 'train', icon: '👨‍🏫', name: '개인 코치 레슨', desc: '기술 3종↑ 가족 부담', when: { age: [9, 99], min: { family: 40 } }, gain: { dri: 1.3, pas: 1.3, sho: 1.3 }, fx: { stamina: -14, stress: 5, family: -4, joy: -3 }, physical: true },
  { id: 'mental', kind: 'train', icon: '🧘', name: '멘탈 트레이닝', desc: '멘탈↑ 스트레스↓', when: { age: [10, 99] }, gain: { men: 2.2 }, fx: { stamina: -4, stress: -5, joy: 1 } },
  { id: 'rest', kind: 'life', icon: '😴', name: '휴식', desc: '체력↑↑ 스트레스↓', fx: { stamina: 40, stress: -12, joy: 3 } },
  { id: 'family', kind: 'life', icon: '🏠', name: '가족과 시간', desc: '스트레스↓↓ 가족↑', fx: { family: 6, stress: -14, stamina: 15, homesick: -18, joy: 5 } },
  { id: 'friends', kind: 'life', icon: '🎮', name: '친구와 놀기', desc: '동료↑ 스트레스↓', fx: { mates: 6, stress: -10, stamina: 5, homesick: -6, joy: 7 } },
  { id: 'lang', kind: 'life', icon: '📖', name: '외국어 공부', desc: '외국어↑ 지능↑', gain: { iq: 0.4 }, fx: { lang: 10, stress: 3, stamina: -3, joy: -2 } },
  { id: 'media', kind: 'life', icon: '🎤', name: '방송·인터뷰', desc: '인지도↑ 감독↓', when: { min: { fame: 10 } }, fx: { fame: 7, stress: 4, stamina: -8, coach: -2, joy: 2 } },
  { id: 'rehab', kind: 'life', icon: '🩹', name: '재활·보강운동', desc: '부상 위험↓ 체력↑', when: { age: [8, 99] }, fx: { injury: -25, stamina: 12, stress: 2, joy: -1 } },
  { id: 'date', kind: 'life', icon: '💑', name: '데이트', desc: '애인↑ 스트레스↓ 의욕↑', when: { has: ['lover'] }, fx: { love: 14, stress: -12, joy: 8, stamina: -6 } },

  // 에이전시: 일정 칸을 쓰지 않지만 한 분기에 하나만. 누르면 바로 판정 이벤트가 열린다. 하이리스크 하이리턴.
  { id: 'ag_talk', kind: 'agency', icon: '🚪', name: '감독 면담', desc: '신뢰를 크게 얻거나, 잃거나', when: { age: [11, 99] }, event: 'ag_talk', cool: 3 },
  { id: 'ag_skip', kind: 'agency', icon: '⏫', name: '월반 요청', desc: '형들 틈에서 급성장 또는 부상', when: { age: [12, 17], stage: ['kr', 'school', 'es', 'bra'] }, event: 'ag_skip', cool: 6 },
  { id: 'ag_trial', kind: 'agency', icon: '✈️', name: '해외 입단 테스트', desc: '스페인 아카데미에 도전', when: { age: [11, 17], stage: ['kr', 'school'] }, event: 'ag_trial', cool: 6 },
  { id: 'ag_nat', kind: 'agency', icon: '🇰🇷', name: '대표팀 어필', desc: '대표팀 입지↑ 또는 역풍', when: { age: [14, 99] }, event: 'ag_nat', cool: 4 },
  { id: 'ag_sponsor', kind: 'agency', icon: '💰', name: '광고 계약', desc: '인지도↑ 가족↑ 체력↓', when: { age: [12, 99], min: { fame: 30 } }, event: 'ag_sponsor', cool: 6 },
  { id: 'ag_press', kind: 'agency', icon: '🗞️', name: '언론 플레이', desc: '여론으로 감독을 압박', when: { age: [15, 99], min: { fame: 20 } }, event: 'ag_press', cool: 5 },
  { id: 'ag_super', kind: 'agency', icon: '🦈', name: '거물 에이전트 접촉', desc: '큰 판이 열리거나, 사기를 당하거나', when: { age: [15, 99], not: ['agent2'] }, event: 'ag_super', cool: 8 },
  { id: 'ag_transfer', kind: 'agency', icon: '📑', name: '이적 요청', desc: '새 팀으로. 실패하면 미운털', when: { age: [18, 99] }, event: 'ag_transfer', cool: 5 },
  { id: 'ag_owner', kind: 'agency', icon: '🎩', name: '구단주 미팅', desc: '주전 보장 또는 괘씸죄', when: { age: [18, 99], has: ['pro'] }, event: 'ag_owner', cool: 5 },
  { id: 'ag_loan', kind: 'agency', icon: '🔁', name: '임대 요청', desc: '뛸 수 있는 팀으로 잠시', when: { age: [18, 99], stage: ['val', 'psg', 'epl'] }, event: 'ag_loan', cool: 6 },
  ...careerActions,
  { id: 'ag_retire', kind: 'agency', icon: '🎙️', name: '은퇴 선언', desc: '여기서 커리어를 마친다', when: { age: [30, 99], has: ['pro'] }, event: 'ag_retire', cool: 4 },
];
