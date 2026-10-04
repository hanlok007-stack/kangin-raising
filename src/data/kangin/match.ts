import type { Move, Situation } from '../../engine/types';

const PRO = ['val', 'mal', 'psg', 'epl', 'bra', 'kl', 'es3', 'univ'];

// 경기에서 쓰는 기술. learn이 없는 것은 기본기, 있는 것은 그 훈련을 n번 하면 배운다.
// learn.action이 'event'인 기술은 이벤트로만 얻는다.
export const moves: Move[] = [
  // ── 기본기
  { id: 'shot', kind: 'shot', icon: '🥅', name: '슛', desc: '직접 골문을 노린다', stats: { sho: 1 }, rel: 3, trait: 'left', goal: 0.55, rate: 0.4, miss: -0.3, ok: '왼발에 제대로 걸렸다.', fail: '슛이 수비 몸에 맞고 굴절됐다.' },
  { id: 'pass', kind: 'pass', icon: '➡️', name: '패스', desc: '확실한 동료에게', stats: { pas: 1 }, rel: -7, assist: 0.25, rate: 0.3, miss: -0.3, ok: '패스가 동료의 발 앞에 정확히 떨어졌다.', fail: '패스가 끊겼다. 상대의 역습이 시작된다.' },
  { id: 'dribble', kind: 'dribble', icon: '💨', name: '드리블 돌파', desc: '직접 뚫는다', stats: { dri: 1 }, rel: 2, goal: 0.15, assist: 0.2, rate: 0.6, miss: -0.4, ok: '방향을 한 번 꺾어 수비를 벗겨냈다.', fail: '수비 발에 걸려 공을 뺏겼다.' },
  { id: 'keep', kind: 'keep', icon: '🛡️', name: '볼 키핑', desc: '무리하지 않는다', stats: { iq: 1, phy: 0.5 }, rel: -16, rate: 0.1, miss: -0.2, ok: '몸으로 공을 지키고 뒤로 돌렸다. 무난한 선택.', fail: '머뭇거리다 공을 뺏겼다.' },
  { id: 'press', kind: 'press', icon: '🦵', name: '압박·태클', desc: '몸을 던져 끊는다', stats: { phy: 1, men: 1 }, rel: 0, rate: 0.6, miss: -0.4, ok: '끈질기게 따라붙어 공을 끊어냈다. 감독이 박수를 친다.', fail: '태클이 빗나갔다. 뒷공간이 열렸다.' },
  { id: 'cover', kind: 'press', icon: '🧱', name: '자리 지키기', desc: '패스 길을 막는다', stats: { iq: 1 }, rel: -8, rate: 0.3, miss: -0.2, ok: '달려들지 않고 길목을 지켰다. 상대가 공을 뒤로 돌린다.', fail: '한 박자 늦었다. 등 뒤로 패스가 빠져나갔다.' },

  // ── 패스 계열
  { id: 'through', kind: 'pass', icon: '🎯', name: '스루패스', desc: '수비 뒷공간을 찌른다', learn: { action: 'pass', n: 4 }, stats: { pas: 1, iq: 0.6 }, rel: 0, assist: 0.6, rate: 0.6, miss: -0.3, ok: '수비 둘 사이로 공이 미끄러져 들어갔다.', fail: '패스가 반 박자 길었다. 골키퍼가 나와 잡았다.' },
  { id: 'onetwo', kind: 'pass', icon: '🔂', name: '원투 패스', desc: '주고 뛰어들어 다시 받는다', learn: { action: 'team', n: 5 }, stats: { pas: 1, iq: 1 }, rel: -2, goal: 0.25, assist: 0.3, rate: 0.7, miss: -0.3, ok: '주고, 뛰고, 다시 받았다. 수비가 공만 쳐다본다.', fail: '돌아오는 패스가 끊겼다.' },
  { id: 'switch', kind: 'pass', icon: '📡', name: '롱패스 전환', desc: '반대편으로 크게 연다', learn: { action: 'pass', n: 9 }, stats: { pas: 1, sho: 0.3 }, rel: -3, assist: 0.35, rate: 0.5, miss: -0.2, ok: '40미터를 날아간 공이 반대편 동료의 가슴에 안겼다.', fail: '공이 터치라인 밖으로 나갔다.' },
  { id: 'cross', kind: 'pass', icon: '🌙', name: '왼발 크로스', desc: '휘어지는 공을 띄운다', learn: { action: 'fk', n: 3 }, only: ['wide', 'corner', 'setpiece'], stats: { pas: 1 }, trait: 'left', rel: -2, assist: 0.55, rate: 0.6, miss: -0.2, ok: '수비와 골키퍼 사이, 딱 그 자리에 공이 떨어졌다.', fail: '크로스가 골키퍼 품에 안겼다.' },
  { id: 'nolook', kind: 'pass', icon: '😎', name: '노룩 패스', desc: '보지 않고 준다', learn: { action: 'lesson', n: 4 }, stats: { pas: 1, dri: 0.5 }, rel: 2, assist: 0.7, rate: 0.9, miss: -0.4, fame: 2, ok: '오른쪽을 보면서 왼쪽으로 줬다. 수비 셋이 한꺼번에 속았다.', fail: '아무도 없는 곳으로 공이 갔다. 동료도 속았다.' },

  // ── 슛 계열
  { id: 'curl', kind: 'shot', icon: '🌀', name: '왼발 감아차기', desc: '먼 쪽 포스트로 감는다', learn: { action: 'shoot', n: 4 }, stats: { sho: 1 }, trait: 'left', rel: 0, goal: 0.65, rate: 0.5, miss: -0.3, ok: '공이 수비를 돌아 먼 쪽 포스트로 휘어 들어간다.', fail: '감긴 공이 포스트를 살짝 벗어났다.' },
  { id: 'longshot', kind: 'shot', icon: '🚀', name: '중거리 슛', desc: '멀리서 때린다', learn: { action: 'phys', n: 5 }, only: ['open', 'counter'], stats: { sho: 1, phy: 0.5 }, rel: 6, goal: 0.6, rate: 0.7, miss: -0.3, fame: 2, ok: '30미터 밖에서 날린 슛이 골문 구석으로 뻗는다.', fail: '공이 관중석 2층으로 날아갔다.' },
  { id: 'chip', kind: 'shot', icon: '🪶', name: '칩슛', desc: '골키퍼 키를 넘긴다', learn: { action: 'shoot', n: 9 }, only: ['1v1', 'open', 'pk'], stats: { sho: 1, dri: 1 }, rel: 4, goal: 0.75, rate: 0.8, miss: -0.5, fame: 3, ok: '공이 골키퍼 머리 위로 둥실 떠올랐다. 모두가 숨을 멈췄다.', fail: '칩슛이 골키퍼 가슴에 안겼다. "그걸 왜 띄워!"' },
  { id: 'knuckle', kind: 'shot', icon: '☄️', name: '무회전 프리킥', desc: '흔들리며 떨어지는 공', learn: { action: 'fk', n: 6 }, only: ['setpiece'], stats: { sho: 1 }, trait: 'left', rel: -3, goal: 0.7, rate: 0.7, miss: -0.2, fame: 3, ok: '공이 벽을 넘더니 뚝 떨어진다.', fail: '공이 벽에 맞았다.' },
  { id: 'volley', kind: 'shot', icon: '💥', name: '논스톱 발리', desc: '떨어지는 공을 그대로', learn: { action: 'shoot', n: 14 }, only: ['box', 'corner'], stats: { sho: 1 }, rel: 7, goal: 0.8, rate: 1.0, miss: -0.3, fame: 4, ok: '떨어지는 공을 그대로 때렸다.', fail: '헛발질. 공은 그대로 흘러갔다.' },
  { id: 'panenka', kind: 'shot', icon: '🧊', name: '파넨카 킥', desc: '한가운데로 살짝', learn: { action: 'mental', n: 5 }, only: ['pk'], stats: { men: 1 }, rel: -2, goal: 0.9, rate: 0.8, miss: -0.8, fame: 5, ok: '골키퍼가 몸을 날린 자리 한가운데로, 공이 느릿느릿 굴러간다.', fail: '골키퍼가 서 있었다. 공을 그냥 받았다. 밤에 이불을 찼다.' },

  // ── 드리블 계열
  { id: 'turn', kind: 'dribble', icon: '🌪️', name: '마르세유 턴', desc: '한 바퀴 돌며 벗겨낸다', learn: { action: 'tech', n: 4 }, stats: { dri: 1 }, rel: -2, goal: 0.2, assist: 0.25, rate: 0.7, miss: -0.4, fame: 1, ok: '공을 밟고 한 바퀴. 수비는 내 등만 봤다.', fail: '돌다가 공을 놓쳤다.' },
  { id: 'nutmeg', kind: 'dribble', icon: '🥚', name: '알까기', desc: '다리 사이로 뺀다', learn: { action: 'street', n: 4 }, stats: { dri: 1, men: 0.5 }, rel: 3, goal: 0.25, assist: 0.3, rate: 1.0, miss: -0.4, fame: 4, ok: '공이 수비 다리 사이를 빠져나갔다. 관중석에서 "오오—" 소리가 났다.', fail: '공이 수비 정강이에 맞았다.' },
  { id: 'flipflap', kind: 'dribble', icon: '🐍', name: '플립플랩', desc: '바깥으로 밀다 안으로', learn: { action: 'tech', n: 9 }, stats: { dri: 1 }, rel: 1, goal: 0.35, assist: 0.3, rate: 1.0, miss: -0.4, fame: 3, ok: '발목이 뱀처럼 꺾였다. 수비가 반대쪽으로 넘어졌다.', fail: '내 발에 내가 걸렸다.' },
  { id: 'body', kind: 'dribble', icon: '🐂', name: '어깨 싸움 돌파', desc: '힘으로 밀고 들어간다', learn: { action: 'phys', n: 8 }, stats: { phy: 1, dri: 0.5 }, rel: 0, goal: 0.2, assist: 0.2, rate: 0.7, miss: -0.3, ok: '어깨를 넣고 버텼다. 튕겨 나간 건 수비 쪽이다.', fail: '튕겨 나가 잔디 위를 굴렀다.' },

  // ── 패시브 (선택지가 아니라 판정을 돕는다)
  { id: 'clutch', kind: 'passive', icon: '❤️‍🔥', name: '강심장', desc: '결정적 순간 판정 +6', learn: { action: 'mental', n: 3 }, passive: { tag: 'clutch', add: 6 }, stats: {}, rel: 0, rate: 0, miss: 0, ok: '', fail: '' },
  { id: 'vision', kind: 'passive', icon: '👁️', name: '오프 더 볼', desc: '패스 계열 판정 +4', learn: { action: 'tactic', n: 5 }, passive: { kind: 'pass', add: 4 }, stats: {}, rel: 0, rate: 0, miss: 0, ok: '', fail: '' },
  { id: 'engine', kind: 'passive', icon: '🔋', name: '두 개의 심장', desc: '압박·수비 판정 +6', learn: { action: 'rehab', n: 4 }, passive: { kind: 'press', add: 6 }, stats: {}, rel: 0, rate: 0, miss: 0, ok: '', fail: '' },
  { id: 'samba', kind: 'passive', icon: '🇧🇷', name: '삼바 리듬', desc: '드리블 계열 판정 +5', learn: { action: 'event', n: 1 }, passive: { kind: 'dribble', add: 5 }, stats: {}, rel: 0, rate: 0, miss: 0, ok: '', fail: '' },
  { id: 'duo', kind: 'passive', icon: '🤜', name: '눈빛 호흡', desc: '패스 계열 판정 +3', learn: { action: 'event', n: 1 }, passive: { kind: 'pass', add: 3 }, stats: {}, rel: 0, rate: 0, miss: 0, ok: '', fail: '' },
];

// 경기 장면. kinds에 있는 종류의 기술만 쓸 수 있고, mod는 종류별 난이도 보정이다.
export const situations: Situation[] = [
  { id: 'sit_swarm', when: { stage: ['shoot'] }, title: '골문 앞 벌떼 축구', text: '공 하나에 아이들 열두 명이 몰려 있다. 그런데 공이 데굴데굴 내 발 앞으로 굴러왔다.', kinds: ['shot', 'pass', 'dribble'], tags: ['box'] },
  { id: 'sit_open', title: '중원에서 공을 잡았다', text: '고개를 들었다. 수비 라인 사이에 틈이 보이고, 동료가 손을 든다.', kinds: ['pass', 'dribble', 'shot', 'keep'], tags: ['open'], mod: { shot: 8 } },
  { id: 'sit_box', title: '박스 앞 혼전', text: '페널티박스 모서리. 수비 둘이 달려든다. 생각할 시간은 1초.', kinds: ['shot', 'pass', 'dribble'], tags: ['box'] },
  { id: 'sit_pressed', title: '강한 압박', text: '공을 받자마자 두 명이 에워쌌다. 등 뒤에서 거칠게 밀고 들어온다.', kinds: ['pass', 'dribble', 'keep'], tags: ['pressed'], mod: { dribble: 3, pass: 2 } },
  { id: 'sit_fk', when: { age: [7, 99] }, title: '프리킥', text: '골문까지 22미터. 수비벽이 선다. 동료들이 나를 본다.', kinds: ['shot', 'pass'], tags: ['setpiece'], mod: { shot: 2 } },
  { id: 'sit_counter', when: { age: [8, 99] }, title: '역습 찬스', text: '상대 코너킥을 걷어낸 공이 내게 왔다. 앞은 텅 비었고, 옆에서 동료가 전력 질주한다.', kinds: ['pass', 'dribble', 'shot', 'keep'], tags: ['counter', 'open'], mod: { shot: 6, dribble: -2 } },
  { id: 'sit_1v1', when: { age: [8, 99] }, title: '골키퍼와 1대1', text: '수비 라인을 깨고 혼자 달린다. 골키퍼가 각을 좁히며 뛰어나온다.', kinds: ['shot', 'pass', 'dribble'], tags: ['1v1'], mod: { shot: -5, pass: -2, dribble: 2 } },
  { id: 'sit_corner', when: { age: [8, 99] }, title: '코너킥 키커', text: '코너 깃발 옆에 공을 놓았다. 골문 앞에서 동료들이 자리를 다툰다.', kinds: ['pass', 'shot'], tags: ['corner', 'setpiece'], mod: { shot: 14, pass: -3 } },
  { id: 'sit_wide', when: { age: [9, 99] }, title: '측면에서 1대1', text: '터치라인을 등지고 수비와 마주 섰다. 중앙으로 동료 둘이 뛰어든다.', kinds: ['dribble', 'pass', 'shot'], tags: ['wide'], mod: { shot: 7 } },
  { id: 'sit_def', when: { age: [9, 99] }, title: '상대의 역습', text: '공을 뺏겼다. 상대 윙어가 우리 진영으로 내달린다. 가장 가까운 건 나다.', kinds: ['press'], tags: ['def'] },
  { id: 'sit_big', when: { stage: PRO }, title: '만원 관중', text: '수만 명의 함성이 등을 민다. 공을 잡자 관중석이 술렁인다. 뭔가를 기대하는 소리다.', kinds: ['pass', 'dribble', 'shot', 'keep'], tags: ['open', 'clutch'], mod: { shot: 6 } },
  { id: 'sit_pk', when: { age: [9, 99] }, slot: 'last', title: '페널티킥', text: '종료 직전 페널티킥. 주장이 공을 건넨다. "네가 차라."', kinds: ['shot'], tags: ['pk', 'clutch'], mod: { shot: -8 } },
  { id: 'sit_last', when: { age: [9, 99] }, slot: 'last', title: '후반 추가시간', text: '스코어는 동점. 마지막 공격이다. 공이 내 발에 있다.', kinds: ['shot', 'pass', 'dribble'], tags: ['clutch', 'box'], mod: { shot: 2, pass: 1, dribble: 2 } },
  { id: 'sit_sub', slot: 'sub', title: '교체 투입', text: '벤치에서 몸을 풀다 이름이 불렸다. 남은 시간은 20분. 첫 터치에서 뭔가 보여줘야 한다.', kinds: ['shot', 'pass', 'dribble', 'keep'], tags: ['open', 'clutch'], mod: { shot: 6 } },
];
