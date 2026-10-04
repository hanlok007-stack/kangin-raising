// 캐릭터 팩: 이강인. 이 폴더를 통째로 바꾸면 다른 주인공의 육성게임이 된다.
import type { Pack } from '../../engine/types';
import { actions } from './actions';
import { art } from './art';
import custom from './custom.json';
import { agency, chain, fails } from './chain';
import { crisis } from './crisis';
import { endings } from './endings';
import { moves, situations } from './match';
import { abroad, late, whims } from './more';
import { pro } from './pro';
import { random, triggered } from './random';
import { story } from './story';
import { cats, gates, realRoute, stages, world } from './world';

const base: Pack = {
  id: 'kangin',
  title: '이강인 키우기',
  hero: '이강인',
  given: '강인',
  foot: '왼발',
  tagline: '슛돌이 꼬마에서 은퇴까지, 당신의 선택으로',
  disclaimer:
    '이 게임의 인물·구단·대회는 모두 패러디이며, 실존 인물·단체와 관계가 없습니다. 나오는 사건은 전부 지어낸 이야기입니다.',
  intro: [
    '아직 아무도 이 아이의 미래를 모른다.',
    '대한민국 최고의 선수가 될 수도 있고,\n평범한 선수로 남을 수도 있다.',
    '어쩌면 우리가 알고 있는 것과\n완전히 다른 인생을 살게 될지도 모른다.',
  ],
  startYear: 2007,
  startAge: 6,
  // 유소년은 반기씩 휙휙, 만 18세부터 전성기는 분기 단위, 서른부터는 다시 반기. 2036년(만 35세) 은퇴
  calendar: [[6, 2], [18, 4], [30, 2]],
  endAge: 35,
  slots: 3,
  eventRate: 0.8,
  realBonus: 0.12,
  stats: [
    { key: 'dri', label: '드리블' },
    { key: 'pas', label: '패스' },
    { key: 'sho', label: '슈팅' },
    { key: 'phy', label: '피지컬' },
    { key: 'iq', label: '축구지능' },
    { key: 'men', label: '멘탈' },
  ],
  labels: {
    dri: '드리블',
    pas: '패스',
    sho: '슈팅',
    phy: '피지컬',
    iq: '축구지능',
    men: '멘탈',
    stamina: '체력',
    stress: '스트레스',
    coach: '감독',
    family: '가족',
    mates: '동료',
    fame: '인지도',
    lang: '외국어',
    nat: '대표팀',
    joy: '의욕',
  },
  hidden: ['homesick', 'injury', 'rival', 'love', 'peak'],
  negative: ['stress', 'homesick', 'injury'],
  init: {
    dri: 14, pas: 12, sho: 11, phy: 5, iq: 9, men: 12,
    stamina: 80, stress: 10,
    coach: 40, family: 70, mates: 40, fame: 5, nat: 0,
    homesick: 0, injury: 0, lang: 0, rival: 0, love: 0, joy: 70, peak: 0,
  },
  initStage: 'shoot',
  pa: [150, 200],
  growth: [[6, 2.0], [10, 2.0], [18, 1.3], [25, 1.0], [31, 0.6], [34, 0.3]],
  gainScale: 0.52,
  matchHard: 3,
  moveSlots: [4, 6],
  aptitude: { dri: 1.1, pas: 1.15, sho: 1.0, phy: 0.75, iq: 1.1, men: 1.0 },
  traits: { left: 8 },
  baseWeights: { dri: 0.2, pas: 0.2, sho: 0.15, phy: 0.15, iq: 0.15, men: 0.15 },
  positions: {
    CAM: { name: '공격형 미드필더', w: { pas: 0.28, dri: 0.22, iq: 0.22, sho: 0.13, men: 0.1, phy: 0.05 }, bonus: ['pas', 'iq'] },
    RW: { name: '오른쪽 윙어', w: { dri: 0.3, sho: 0.2, phy: 0.2, pas: 0.15, iq: 0.08, men: 0.07 }, bonus: ['dri', 'phy'] },
    CM: { name: '중앙 미드필더', w: { pas: 0.28, iq: 0.25, phy: 0.17, men: 0.12, dri: 0.12, sho: 0.06 }, bonus: ['iq', 'phy'] },
    SS: { name: '세컨드 스트라이커', w: { sho: 0.3, dri: 0.22, iq: 0.15, pas: 0.13, men: 0.1, phy: 0.1 }, bonus: ['sho', 'dri'] },
  },
  stages,
  actions,
  moves,
  situations,
  cats,
  // 순서가 우선순위다: 위기(triggered, fails) → 스토리 → 행동 반복 → 나머지
  events: [...triggered, ...fails, ...crisis, ...story, ...pro, ...late, ...agency, ...whims, ...abroad, ...chain, ...random],
  art,
  endings,
  gates,
  drift: [
    { fx: { stamina: 20, stress: -3 }, perTurn: true },
    { fx: { fame: -0.8 } },
    { when: { max: { joy: 49.99 } }, fx: { joy: 1 }, perTurn: true },
    { when: { min: { stress: 70 } }, fx: { joy: -2 }, perTurn: true },
    // 노쇠화: 서른부터 몸이 먼저 내려간다
    { when: { age: [30, 99] }, fx: { phy: -0.5, dri: -0.25 } },
    { when: { age: [33, 99] }, fx: { phy: -0.4, sho: -0.2, dri: -0.2, pas: -0.1 } },
    { when: { stage: ['es', 'bra', 'ned', 'ger', 'cat', 'val', 'mal', 'psg', 'epl', 'es3'] }, fx: { lang: 3 } },
    { when: { stage: ['es', 'bra', 'ned', 'ger', 'cat'], max: { lang: 59.99 } }, fx: { homesick: 5 } },
    { when: { stage: ['es', 'bra', 'ned', 'ger', 'cat'], min: { lang: 60 } }, fx: { homesick: 2 } },
    { when: { has: ['chronic'] }, fx: { injury: 2 } },
    { when: { has: ['partner'] }, fx: { stress: -3 } },
    { when: { has: ['dating'] }, fx: { love: 4 } },
    { when: { min: { nat: 1 } }, fx: { nat: -0.4 } },
  ],
  npcs: [
    { id: 'mom', face: '👩', name: '엄마', role: '가족', desc: '학습지와 김치찌개의 달인. 결정적인 순간에 한마디를 던진다.', rel: 'family' },
    { id: 'dad', face: '👨', name: '아빠', role: '가족', desc: '새벽 운전 담당. 축구는 잘 모르지만 아들은 잘 안다.', rel: 'family' },
    { id: 'oh', face: '🧢', name: '오 감독', role: '슛돌이 감독', desc: '조기축구회 득점왕 출신. 아이들에게 축구가 재미있다는 걸 가르쳤다.', when: { stage: ['shoot'] }, rel: 'coach' },
    { id: 'minsu', face: '🧒', name: '민수', role: '동네 친구', desc: '축구는 못하지만 응원은 세계 최고. 게임은 잘한다.', rel: 'mates' },
    { id: 'han', face: '🧔', name: '한 감독', role: '유소년 감독', desc: '기본기 신봉자. "인사이드 패스 500개."', when: { has: ['met_han'], stage: ['kr', 'school'] }, rel: 'coach' },
    { id: 'rival', face: '🌪️', name: '최태풍', role: '라이벌', desc: '크고, 빠르고, 오른발로 뭐든 한다. 이상하게 자꾸 마주친다.', when: { has: ['rival'] }, rel: 'rival' },
    { id: 'paco', face: '👴', name: '파코 코치', role: '아카데미 코치', desc: '말이 빠르다. 하지만 좋은 패스에는 누구보다 크게 박수를 친다.', when: { stage: ['es'] }, rel: 'coach' },
    { id: 'dani', face: '😜', name: '다니', role: '아카데미 동료', desc: '장난의 천재. 첫 스페인 친구.', when: { stage: ['es'] }, rel: 'mates' },
    { id: 'borja', face: '🗿', name: '보르하 감독', role: '감독', desc: '많이 뛰는 선수를 좋아한다. 기술만으로는 설득되지 않는 사람.', when: { has: ['met_borja'] }, rel: 'coach' },
    { id: 'agent', face: '🕴️', name: '황 실장', role: '에이전트', desc: '"선수님의 미래를 설계해 드리죠." 전화기를 손에서 놓지 않는다.', when: { has: ['met_agent'] } },
    { id: 'reporter', face: '📝', name: '기 기자', role: '스포츠 기자', desc: '성이 기, 직업이 기자. 수첩을 들고 어디든 나타난다.', when: { has: ['met_reporter'] }, rel: 'fame' },
    { id: 'sori', face: '🎙️', name: '한소리', role: '아나운서', desc: '스포츠 뉴스 진행자. 인터뷰 질문이 날카롭고, 웃음소리가 크다.', when: { has: ['met_sori'] }, rel: 'love' },
    { id: 'shark', face: '🦈', name: '미스터 조', role: '거물 에이전트(?)', desc: '흰 정장에 번쩍이는 시계. 진짜일 수도, 아닐 수도 있다.', when: { any: ['agent2'] } },
    { id: 'owner', face: '🎩', name: '구단주', role: '구단주', desc: '요트에서 사람을 만난다. 하몽을 직접 썬다.', when: { has: ['pro'] } },
  ],
  perks: [
    { id: 'lang', name: '조기교육', desc: '외국어 +25로 시작', unlock: 1, fx: { lang: 25 } },
    { id: 'iron', name: '강철 발목', desc: '부상 위험이 절반만 쌓인다', unlock: 2, mult: { injury: 0.5 } },
    { id: 'star', name: '국민 남동생', desc: '인지도 +15, 가족 +10으로 시작', unlock: 3, fx: { fame: 15, family: 10 } },
    { id: 'calm', name: '타고난 멘탈', desc: '멘탈 +8, 스트레스를 20% 덜 받는다', unlock: 5, fx: { men: 8 }, mult: { stress: 0.8 } },
    { id: 'left', name: '왼발의 축복', desc: '슈팅 +6, 패스 +6으로 시작', unlock: 8, fx: { sho: 6, pas: 6 } },
    { id: 'memory', name: '2회차의 기억', desc: '숨겨진 잠재력 +12', unlock: 12, pa: 12 },
  ],
  world,
  realRoute,
  comments: {
    good: ['왼발 미쳤다 ㄷㄷ', '얘는 진짜 될 놈이다', '슛돌이 때부터 알아봤음', '국대 언제 뽑냐', '저 나이에 저 시야가 말이 됨?', '우리 팀 와라 제발', '폼 미쳤다', '축구 도사네', '오늘 경기 이 선수 원맨쇼'],
    bad: ['오늘은 좀 안 보이네', '아직 어리잖아 기다려 주자', '피지컬이 좀 아쉽다', '욕심이 과했다', '폼 떨어진 것 같은데', '그래도 난 믿는다', '감독이 잘못 쓰는 거임'],
  },
  headlines: {
    goal: ['{hero} 결승골… {team} 승리', '[화제] {age}세 {hero}, 또 골', '"왼발 하나로 충분" {hero} 득점포'],
    assist: ['{hero} 도움… "패스가 어른 같다"', '[화제] {hero}의 킬패스, {team} 웃었다'],
    good: ['{hero}, {team}서 존재감… 평점 팀 내 최고', '[칼럼] 슛돌이 꼬마는 어떻게 자라고 있나'],
    bad: ['{hero} 침묵… {team} 고전', '[칼럼] {hero}, 성장통인가'],
  },
  text: {
    injured: '부상 중이라 이번 경기는 관중석에서 지켜봤다.',
    benched: '선발 명단에 이름이 없다. 벤치에서 시작한다.',
    dropped: '감독의 눈 밖에 났다. 이번에는 명단에도 들지 못했다.',
    goal: '골망이 출렁였다. 골!',
    saved: '골키퍼가 손끝으로 쳐냈다. 아깝다.',
    assist: '동료가 마무리했다. 도움!',
    coach: [
      [8.5, '"오늘은 네가 팀이었다."'],
      [7.3, '"좋았다. 다음 경기도 선발이다."'],
      [6.3, '"나쁘지 않았다."'],
      [5.3, '"더 보여줘야 한다."'],
      [0, '"…오늘은 할 말이 없다."'],
    ],
  },
  titles: [
    [95, '대한민국 축구의 미래 그 자체'],
    [88, '10년에 한 번 나올 왼발'],
    [80, '세계가 주목하는 플레이메이커'],
    [70, '될성부른 떡잎'],
    [60, '동네에서 제일 잘 차는 형'],
    [45, '축구를 사랑한 소년'],
    [0, '슛돌이 출신 일반인'],
  ],
  scoring: {
    ovr: 0,
    vars: { peak: 0.64, fame: 0.06, coach: 0.03, mates: 0.02 },
    goal: 0.15,
    assist: 0.12,
    recCap: 8,
    tier: { S: 12, A: 9, B: 6, C: 3, D: 0 },
    flags: { goldenball: 2, wc_hero: 2, exempt: 2, cl_win: 2, ac_win: 2, a_debut: 1, first_team: 1, captain: 1, mvp: 1 },
  },
};

// custom.json: 편집자 화면에서 내보낸 { cats, events, art }를 넣으면 기본 데이터를 덮어쓴다. 비어 있으면 그대로.
export const kangin: Pack = { ...base, ...(custom as Partial<Pack>) };
