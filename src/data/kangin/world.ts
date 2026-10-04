import type { Category, Gate, Milestone, StageDef, World } from '../../engine/types';

const KR = ['kr', 'school'];

// 세계 축구 사다리. level은 그 리그 중위권 팀에서 주전으로 뛰는 데 필요한 OVR이다.
export const world: World = {
  cohort: '2001년생',
  leagues: [
    { id: 'big', name: '유럽 빅클럽 (챔스 우승권)', level: 85 },
    { id: 'epl', name: '프리미어리그', level: 80 },
    { id: 'laliga', name: '라리가', level: 76 },
    { id: 'bundes', name: '분데스리가', level: 76 },
    { id: 'seriea', name: '세리에 A', level: 75 },
    { id: 'ligue1', name: '리그 1', level: 73 },
    { id: 'ned', name: '포르투갈·네덜란드 1부', level: 71 },
    { id: 'bra', name: '브라질 세리이 A', level: 70 },
    { id: 'sau', name: '사우디 프로리그', level: 68 },
    { id: 'kl1', name: 'K리그 1', level: 66 },
    { id: 'j1', name: 'J1 리그', level: 66 },
    { id: 'mls', name: 'MLS', level: 65 },
    { id: 'es3', name: '스페인 3부', level: 62 },
    { id: 'esy', name: '유럽 명문 유스', level: 60 },
    { id: 'kl2', name: 'K리그 2', level: 58 },
    { id: 'kry', name: '국내 프로 유스', level: 52 },
    { id: 'univ', name: '대학 U리그', level: 50 },
    { id: 'school', name: '학교 축구부', level: 44 },
    { id: 'tv', name: 'TV 예능 축구단', level: 12 },
  ],
  par: [[6, 8], [10, 24], [14, 40], [17, 52], [22, 60]],
  real: [[6, 12], [10, 38], [14, 57], [17, 70], [19, 75], [22, 82]],
};

// 실제 커리어 연표. when이 참이면 "이 세계선에서도 일어났다"로 표시된다.
export const realRoute: Milestone[] = [
  { year: 2007, text: '「날아라 슛돌이」 출연', when: {} },
  { year: 2009, text: '인천 유나이티드 U-12 입단', when: { has: ['m_kr'] } },
  { year: 2011, text: '발렌시아 유소년 아카데미 입단', when: { has: ['go_spain'] } },
  { year: 2017, text: '발렌시아 B팀(메스타야) 데뷔', when: { has: ['go_spain', 'promoted'], not: ['brazil', 'returned'] } },
  { year: 2018, text: '만 17세, 발렌시아 1군 데뷔', when: { has: ['go_spain', 'first_team'], not: ['brazil', 'returned'] } },
  { year: 2019, text: '발렌시아 1군 정식 등록', when: { has: ['m_val'] } },
  { year: 2019, text: 'U-20 월드컵 준우승, 골든볼 수상', when: { has: ['goldenball'] } },
  { year: 2019, text: 'A대표팀 데뷔', when: { has: ['a_debut'] } },
  { year: 2021, text: 'RCD 마요르카 이적', when: { has: ['m_mal'] } },
  { year: 2022, text: '카타르 월드컵 16강 (가나전 도움)', when: { has: ['wc_hero'] } },
  { year: 2023, text: '파리 생제르맹 이적', when: { has: ['m_psg'] } },
  { year: 2023, text: '항저우 아시안게임 금메달 → 병역특례', when: { has: ['ag_gold'] } },
];

export const stages: Record<string, StageDef> = {
  shoot: { name: '날아라 슛돌이', league: 'tv', teams: [[0, 'FC 슛돌이']], kit: ['#ffd23f', '#1d3fae'], curve: [[6, 8], [8, 17]], facility: 1.0, opps: ['꿈나무 FC', '번개 유소년', '햇살 축구교실', '독수리 FC'] },
  kr: {
    name: '국내 프로 유스',
    league: 'kry',
    teams: [[0, '인천 유나이티드 U-12'], [13, '인천 유나이티드 U-15'], [16, '인천 유나이티드 U-18']],
    kit: ['#1e4fd8', '#111111'],
    curve: [[7, 20], [18, 57]],
    facility: 1.0,
    opps: ['수원 유스', '서울 유스', '포항 유스', '울산 유스', '전북 유스'],
  },
  school: {
    name: '학교 축구부',
    league: 'school',
    teams: [[0, '바람초 축구부'], [13, '바람중 축구부'], [16, '바람고 축구부']],
    kit: ['#e53935', '#ffffff'],
    curve: [[7, 17], [18, 51]],
    facility: 0.88,
    opps: ['한빛 축구부', '새솔 축구부', '푸른 축구부', '대성 축구부'],
  },
  es: {
    name: '스페인 아카데미',
    league: 'esy',
    teams: [[0, '발렌시아 알레빈'], [12, '발렌시아 인판틸'], [14, '발렌시아 카데테'], [16, '발렌시아 후베닐'], [17, '발렌시아 메스타야 (B팀)']],
    kit: ['#ffffff', '#111111'],
    curve: [[10, 37], [17, 67], [18, 69]],
    facility: 1.2,
    opps: ['비야레알 유스', '레반테 유스', '바르셀로나 유스', '레알 마드리드 유스', '에스파뇰 유스'],
  },
  bra: {
    name: '브라질',
    league: 'bra',
    teams: [[0, 'FC 코파카바나 유스'], [18, 'FC 코파카바나']],
    kit: ['#ffe14d', '#1f8f3a'],
    curve: [[9, 32], [17, 62], [18, 68], [22, 72]],
    facility: 1.12,
    opps: ['이파네마 SC', '상파울루 유나이티드', '아마조나스 FC', '벨루 스타스'],
  },
  val: { name: '라리가', league: 'laliga', teams: [[0, '발렌시아 CF']], kit: ['#ffffff', '#111111'], curve: [[17, 73], [22, 78]], facility: 1.15, opps: ['바르셀로나', '레알 마드리드', '아틀레티코', '세비야', '비야레알', '헤타페'] },
  mal: { name: '라리가', league: 'laliga', teams: [[0, 'RCD 마요르카']], kit: ['#d81e2c', '#111111'], curve: [[17, 69], [22, 74]], facility: 1.1, opps: ['바르셀로나', '레알 마드리드', '아틀레티코', '세비야', '발렌시아', '헤타페'] },
  psg: { name: '리그 1 · 챔피언스리그', league: 'big', teams: [[0, '파리 생제르맹']], kit: ['#14275e', '#14275e'], curve: [[17, 80], [22, 85]], facility: 1.25, opps: ['마르세유', '리옹', '모나코', '릴', '챔피언스리그 16강 상대'] },
  epl: { name: '프리미어리그', league: 'epl', teams: [[0, '런던 로버스']], kit: ['#7b1fa2', '#ffffff'], curve: [[17, 78], [22, 83]], facility: 1.22, opps: ['맨체스터 블루', '머지사이드 레즈', '북런던 거너스', '타인사이드 FC', '런던 블루스'] },
  kl: { name: 'K리그 1', league: 'kl1', teams: [[0, '인천 유나이티드']], kit: ['#1e4fd8', '#111111'], curve: [[17, 62], [22, 68]], facility: 1.02, opps: ['울산', '전북', '포항', '서울', '수원', '대구'] },
  es3: { name: '스페인 3부', league: 'es3', teams: [[0, 'CD 알코야노 (임대)']], kit: ['#2b6cff', '#ffffff'], curve: [[17, 60], [22, 65]], facility: 1.0, opps: ['카스테욘', '에르쿨레스', '아틀레티코 발레아레스', '이비사'] },
  univ: { name: '대학 U리그', league: 'univ', teams: [[0, '한강대학교']], kit: ['#0f766e', '#ffffff'], curve: [[17, 48], [22, 55]], facility: 0.9, opps: ['북악대', '안암대', '신촌대', '용인대'] },
};

// 만 17세 겨울(48턴)의 프로 진입 관문. 위에서부터 처음 맞는 규칙이 적용된다.
export const gates: Gate[] = [
  {
    turn: 48,
    rules: [
      { when: { has: ['bigclub_sign'], min: { ovr: 72 } }, stage: 'epl', set: { coach: 42 }, flag: ['pro', 'm_big'], news: '[오피셜] 런던 로버스, 17세 {hero} 전격 영입' },
      { when: { stage: ['es'], has: ['signed'], min: { ovr: 66, coach: 40 } }, stage: 'val', set: { coach: 42 }, flag: ['pro', 'm_val'], news: '[오피셜] 발렌시아, {hero} 1군 정식 등록' },
      { when: { stage: ['bra'], has: ['signed'], min: { ovr: 60 } }, set: { coach: 50 }, flag: ['pro'], news: '[해외축구] {hero}, 브라질 1부 프로 계약' },
      { when: { stage: KR, has: ['signed'], min: { ovr: 63 } }, stage: 'kl', set: { coach: 55 }, flag: ['pro'], news: '[K리그] {hero}, 고교생 신분으로 준프로 계약' },
      { when: { has: ['bookworm', 'college'], min: { iq: 70 } }, end: 'scholar' },
      { when: { any: ['tv_kid', 'tv2', 'cf'], min: { fame: 75 }, max: { ovr: 58 } }, end: 'tv_star' },
      { when: { stage: ['es', 'bra'], not: ['college'], min: { ovr: 54 } }, stage: 'es3', set: { coach: 55 }, flag: ['pro'], news: '[해외축구] {hero}, 스페인 3부 임대' },
      { when: { stage: ['es', 'bra'], not: ['college'] }, end: 'released' },
      { when: { min: { ovr: 46 } }, stage: 'univ', set: { coach: 55 }, flag: ['univ'] },
      { end: 'amateur' },
    ],
  },
];

// 이벤트 카테고리. rate는 그 카테고리의 랜덤·자동 이벤트 빈도 배율 — 편집자 화면에서 바꿀 수 있다.
export const cats: Record<string, Category> = {
  진로: { icon: '🧭', color: '#2563eb', rate: 1 },
  축구: { icon: '⚽', color: '#15803d', rate: 1 },
  훈련: { icon: '🏋️', color: '#0f766e', rate: 1 },
  경기: { icon: '🏟️', color: '#16a34a', rate: 1 },
  감독: { icon: '📋', color: '#475569', rate: 1 },
  동료: { icon: '🤝', color: '#0891b2', rate: 1 },
  라이벌: { icon: '🌪️', color: '#7c3aed', rate: 1 },
  대표팀: { icon: '🇰🇷', color: '#b91c1c', rate: 1 },
  병역: { icon: '🪖', color: '#4d5d1e', rate: 1 },
  이적: { icon: '📑', color: '#9333ea', rate: 1 },
  에이전시: { icon: '🕴️', color: '#1f2937', rate: 1 },
  가족: { icon: '🏠', color: '#ea580c', rate: 1 },
  연애: { icon: '💌', color: '#db2777', rate: 1 },
  방송: { icon: '📺', color: '#e11d48', rate: 1 },
  언론: { icon: '🗞️', color: '#64748b', rate: 1 },
  팬: { icon: '📣', color: '#f59e0b', rate: 1 },
  광고: { icon: '💰', color: '#ca8a04', rate: 1 },
  부상: { icon: '🩹', color: '#dc2626', rate: 1 },
  멘탈: { icon: '🧠', color: '#6d28d9', rate: 1 },
  적응: { icon: '🌍', color: '#0369a1', rate: 1 },
  생활: { icon: '🍜', color: '#a16207', rate: 1 },
  황당: { icon: '🤪', color: '#c026d3', rate: 1 },
  위기: { icon: '💀', color: '#111111', rate: 1 },
};
