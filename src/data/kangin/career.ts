import type { ActionDef, GameEvent, Pack, StageDef } from '../../engine/types';

// 프로 커리어의 뼈대: 선수 등급, 해마다의 연봉 협상, FA 시장, 세계 곳곳의 구단.
// 여기 있는 것은 모든 선수 팩이 물려받는다. 구단은 전부 지어낸 이름이고 리그만 실제 이름이다.

export const career: Pack['career'] = {
  flag: 'pro',
  salary: 'y_salary',
  fa: 'y_fa',
  every: 2,
  tiers: [
    [80, '레전드'],
    [60, '월드클래스'],
    [40, '리그 정상급'],
    [20, '주전급'],
    [0, '유망주'],
  ],
  news: '[계약] {hero}, {team}와 연봉 {salary}에 사인… 계약은 {until}년까지',
};

const flat = (lv: number): [number, number][] => [
  [17, lv - 3],
  [23, lv],
  [36, lv],
];

// 이적 시장에서 갈 수 있는 세계의 구단들
export const clubs: Record<string, StageDef> = {
  w_eng: { name: '프리미어리그', league: 'epl', teams: [[0, 'AFC 사우스코스트']], kit: ['#2b6cff', '#ffffff'], curve: flat(79), facility: 1.2, opps: ['맨체스터 블루', '머지사이드 레즈', '북런던 거너스', '런던 블루스', '타인사이드 FC'] },
  w_esp: { name: '라리가', league: 'laliga', teams: [[0, 'CF 안달루시아']], kit: ['#15803d', '#ffffff'], curve: flat(75), facility: 1.12, opps: ['FC 카탈루냐', '마드리드 블랑코', '빌바오 레오네스', '갈리시아 셀타스'] },
  w_ita: { name: '세리에 A', league: 'seriea', teams: [[0, 'FC 롬바르디아']], kit: ['#1d3fae', '#111111'], curve: flat(76), facility: 1.15, opps: ['피에몬테 제브라', '수도 로마나', '베수비오 SC', '토스카나 비올라'] },
  w_bun: { name: '분데스리가', league: 'bundes', teams: [[0, 'SV 라인란트']], kit: ['#d81e2c', '#ffffff'], curve: flat(76), facility: 1.18, opps: ['바이에른 로트', 'BV 루르', '작센 불스', '베를린 유니온스'] },
  w_fra: { name: '리그 1', league: 'ligue1', teams: [[0, 'OC 리비에라']], kit: ['#111111', '#d81e2c'], curve: flat(73), facility: 1.1, opps: ['파리 에투알', '론 올랭피크', '모나코 루주', '브르타뉴 FC'] },
  w_por: { name: '포르투갈 1부', league: 'ned', teams: [[0, 'SC 리스보아']], kit: ['#15803d', '#ffffff'], curve: flat(71), facility: 1.12, opps: ['포르투 드라공', '리스본 이글스', '미뉴 SC', '북부 비토리아'] },
  w_tur: { name: '튀르키예 쉬페르리그', league: 'tur', teams: [[0, 'SK 보스포루스']], kit: ['#ffd23f', '#d81e2c'], curve: flat(70), facility: 1.05, opps: ['이스탄불 카나리아', '흑해 스톰', '앙카라 귀취', '이즈미르 SK'] },
  w_sco: { name: '스코틀랜드 프리미어십', league: 'sco', teams: [[0, '글래스고 그린스']], kit: ['#15803d', '#ffffff'], curve: flat(67), facility: 1.05, opps: ['글래스고 블루스', '에든버러 마룬스', '애버딘 레즈', '테이사이드 FC'] },
  w_jpn: { name: 'J1 리그', league: 'j1', teams: [[0, 'FC 간사이']], kit: ['#1d3fae', '#111111'], curve: flat(66), facility: 1.05, opps: ['도쿄 그린', '가나가와 마린', '이바라키 앤틀러', '사이타마 레즈'] },
  w_qat: { name: '카타르 스타스리그', league: 'qat', teams: [[0, '알 도하 SC']], kit: ['#7b1fa2', '#ffffff'], curve: flat(65), facility: 0.98, opps: ['알 진주 SC', '알 모래 FC', '알 등대 SC', '걸프 유나이팃'] },
  w_chn: { name: '중국 슈퍼리그', league: 'csl', teams: [[0, '상하이 드래곤즈']], kit: ['#d81e2c', '#ffd23f'], curve: flat(62), facility: 0.95, opps: ['베이징 가드', '광저우 타이거', '산둥 마운틴', '청두 판다스'] },
  w_aus: { name: 'A리그', league: 'aleague', teams: [[0, '시드니 하버 FC']], kit: ['#6ec5ff', '#14275e'], curve: flat(61), facility: 1.0, opps: ['멜버른 시티즌', '브리즈번 로어스', '퍼스 글로리아', '웰링턴 FC'] },
  w_usa: { name: 'MLS', league: 'mls', teams: [[0, '뉴욕 리버티 FC']], kit: ['#14275e', '#d81e2c'], curve: flat(65), facility: 1.02, opps: ['마이애미 플라밍고', '시애틀 레인', '애틀랜타 유나이팃', '토론토 메이플'] },
  w_mex: { name: '리가 MX', league: 'mex', teams: [[0, '클루브 아스테카']], kit: ['#ffd23f', '#14275e'], curve: flat(66), facility: 1.0, opps: ['과달라하라 치바', '몬테레이 라야', '티그레스 노르테', '푸에블라 카모테'] },
  w_arg: { name: '아르헨티나 프리메라', league: 'arg', teams: [[0, '보카 델 수르']], kit: ['#14275e', '#ffd23f'], curve: flat(69), facility: 1.02, opps: ['리베르 반다', '아베야네다 셀레스테', '로사리오 카나야', '라플라타 FC'] },
};
export const CLUB_IDS = Object.keys(clubs);

// 에이전시 탭에 더해지는 행동
export const careerActions: ActionDef[] = [
  { id: 'ag_stay', kind: 'agency', icon: '🏠', name: '잔류 선언', desc: '이번 시장에는 움직이지 않는다', when: { has: ['pro'] }, event: 'ag_stay', cool: 1 },
  { id: 'ag_market', kind: 'agency', icon: '📈', name: '시장 평가 듣기', desc: '내 몸값과 관심 구단을 알아본다', when: { has: ['pro'] }, event: 'ag_market', cool: 3 },
];

const BACK = { label: '지도를 다시 넓게 본다', ok: { text: '에이전트가 지도를 다시 펼쳤다.', next: 'mk_hub' } };

export const market: GameEvent[] = [
  {
    id: 'y_salary',
    cat: '계약',
    title: '연봉 협상',
    text: '새해 첫 출근. 단장실 책상 위에 계약서가 놓여 있다. 지금 연봉은 {salary}. 구단이 내민 숫자는 {offer}. 시장에서는 {market}쯤 받을 선수라고들 한다. (선수 등급 {tier} · 계약은 {until}년까지)',
    choices: [
      { label: '구단이 내민 숫자에 사인한다', ok: { text: '악수하고 나왔다. 새 연봉은 {salary}. 단장이 문 앞까지 배웅했다.', fx: { coach: 3 }, pay: 0.9, term: 0 } },
      {
        label: '"제 값어치는 그게 아닙니다"',
        check: { stats: { tier: 1, fame: 0.5, men: 0.5 }, dc: 48 },
        ok: { text: '단장이 계산기를 한참 두드리다 한숨을 쉬었다. "…알겠네." 새 연봉은 {salary}.', fx: { men: 1 }, pay: 1.2, term: 0 },
        fail: { text: '"그 성적으로?" 단장이 지난 시즌 기록지를 내밀었다. 할 말이 없었다. 새 연봉은 {salary}.', fx: { coach: -6, stress: 5 }, pay: 0.82, term: 0 },
      },
      {
        label: '에이전트에게 맡긴다',
        need: { has: ['agent'] },
        lock: '🔒 에이전트에게 맡긴다 — 계약한 에이전트가 없다',
        check: { stats: { fame: 1, tier: 1 }, dc: 40, boost: { agent2: 12 } },
        ok: { text: '에이전트가 세 시간 만에 단장실에서 나왔다. 넥타이가 풀려 있다. "됐습니다." 새 연봉은 {salary}.', pay: 1.12, term: 0 },
        fail: { text: '"올해는 구단 사정이 어렵답니다." 에이전트가 머리를 긁었다. 새 연봉은 {salary}.', pay: 0.95, term: 0 },
      },
      { label: '5년 장기 계약으로 묶는다', ok: { text: '구단은 반색했다. 앞으로 5년, 시장에 나갈 일은 없다. 새 연봉은 {salary}.', fx: { coach: 6, mates: 2 }, pay: 1.02, term: 5 } },
      { label: '"깎은 만큼 좋은 선수를 데려오세요"', ok: { text: '단장이 안경을 벗고 눈을 비볐다. 다음 날 라커룸에 소문이 퍼졌다. 주장이 말없이 어깨를 두드렸다. 새 연봉은 {salary}.', fx: { coach: 10, mates: 8, fame: 3 }, flag: ['paycut'], pay: 0.7, term: 0 } },
    ],
  },
  {
    id: 'y_fa',
    cat: '계약',
    title: 'FA — 시장에 나오다',
    text: '계약서의 마지막 해가 끝났다. 이제 어느 구단의 선수도 아니다. 이적료가 없는 선수에게는 그만큼 연봉을 더 얹어 준다. 휴대폰이 쉬지 않고 울린다. (시장의 평가: {tier} · 예상 연봉 {market})',
    choices: [
      { label: '세계 지도를 펼친다 — 시장의 평가를 받는다', ok: { text: '에이전트가 테이블에 지도를 펼쳤다. 핀이 여러 개 꽂혀 있다.', next: 'mk_hub' } },
      { label: '지금 팀에 남는다 — 3년 재계약', ok: { text: '익숙한 라커룸, 익숙한 주차 자리. 3년 더 이 유니폼을 입는다. 새 연봉은 {salary}.', fx: { coach: 8, mates: 4 }, pay: 1, term: 3 } },
      { label: '1년만 더, 그리고 다시 시장에', ok: { text: '"1년 뒤에 다시 얘기합시다." 단장의 표정이 복잡하다. 새 연봉은 {salary}.', fx: { coach: -2 }, pay: 1.1, term: 1 } },
    ],
  },
  {
    id: 'mk_hub',
    cat: '이적',
    title: '세계 지도',
    text: '에이전트가 테이블에 세계 지도를 펼친다. 색색의 핀이 꽂혀 있다. "관심을 보인 구단들입니다. 어느 쪽부터 보시겠습니까?" (지금 시장이 보는 나: {tier} · 예상 연봉 {market})',
    choices: [
      { label: '유럽 — 5대 리그', ok: { text: '유럽 지도가 확대된다.', next: 'mk_eu' } },
      { label: '유럽 — 그 밖의 리그', ok: { text: '5대 리그 바깥에도 축구에 미친 도시는 많다.', next: 'mk_eu2' } },
      { label: '아시아 · 중동 · 오세아니아', ok: { text: '지도가 동쪽으로 넘어간다.', next: 'mk_as' } },
      { label: '아메리카', ok: { text: '대서양 건너편이다.', next: 'mk_am' } },
      { label: '지금 팀과 다시 계약한다', need: { has: ['fa'] }, lock: '🔒 재계약은 계약이 끝나는 해에 할 수 있다', ok: { text: '지도를 접었다. 결국 돌아갈 곳은 여기다. 새 연봉은 {salary}.', fx: { coach: 6 }, pay: 1, term: 3 } },
      { label: '지도를 접는다', need: { not: ['fa'] }, lock: '🔒 계약이 끝났다 — 어딘가에는 사인해야 한다', ok: { text: '이번 시장은 그냥 보낸다.', fx: { stress: 2 } } },
    ],
  },
  {
    id: 'mk_eu',
    cat: '이적',
    title: '유럽 5대 리그',
    text: '에이전트가 핀을 하나씩 짚는다. "여기는 돈보다 무대입니다. 주전 자리는 약속 못 합니다."',
    choices: [
      { label: 'AFC 사우스코스트 — 프리미어리그', need: { min: { ovr: 76 }, away: ['w_eng'] }, lock: '🔒 AFC 사우스코스트 (프리미어리그) — "조금 더 지켜보겠다"', ok: { text: '남쪽 바닷가의 구단. 갈매기가 훈련장 위를 돈다. 경기는 생각보다 훨씬 빠르고, 비는 옆으로 내린다.', stage: 'w_eng', set: { coach: 48 }, fx: { fame: 8, homesick: 8 }, flag: ['c_eu'], news: '[오피셜] {hero}, 프리미어리그 AFC 사우스코스트 입단' } },
      { label: 'FC 롬바르디아 — 세리에 A', need: { min: { ovr: 73 }, away: ['w_ita'] }, lock: '🔒 FC 롬바르디아 (세리에 A) — 스카우트가 수첩만 적고 갔다', ok: { text: '전술 미팅이 훈련보다 길다. 수비수들은 웃으면서 발목을 찬다. 파스타는 진짜다.', stage: 'w_ita', set: { coach: 50 }, fx: { fame: 6, iq: 1 }, flag: ['c_eu'], news: '[오피셜] {hero}, 세리에 A FC 롬바르디아 이적' } },
      { label: 'SV 라인란트 — 분데스리가', need: { min: { ovr: 73 }, away: ['w_bun'] }, lock: '🔒 SV 라인란트 (분데스리가) — 아직 답이 없다', ok: { text: '관중석이 서서 노래한다. 90분 내내. 훈련은 정확히 10시에 시작해서 정확히 12시에 끝난다.', stage: 'w_bun', set: { coach: 52 }, fx: { fame: 6, phy: 1 }, flag: ['c_eu'], news: '[오피셜] {hero}, 분데스리가 SV 라인란트 입단' } },
      { label: 'CF 안달루시아 — 라리가', need: { min: { ovr: 71 }, away: ['w_esp'] }, lock: '🔒 CF 안달루시아 (라리가) — 관심은 있는데 예산이 없단다', ok: { text: '오렌지 나무가 늘어선 도시. 저녁 열 시에 경기가 시작하고, 자정에 저녁을 먹는다.', stage: 'w_esp', set: { coach: 55 }, fx: { fame: 5 }, flag: ['c_eu'], news: '[오피셜] {hero}, 라리가 CF 안달루시아 이적' } },
      { label: 'OC 리비에라 — 리그 1', need: { min: { ovr: 69 }, away: ['w_fra'] }, lock: '🔒 OC 리비에라 (리그 1) — 명단에 이름은 올라 있다', ok: { text: '훈련장에서 바다가 보인다. 리그는 거칠고, 젊고, 빠르다. 여기서 잘하면 어디든 간다.', stage: 'w_fra', set: { coach: 58 }, fx: { fame: 4 }, flag: ['c_eu'], news: '[오피셜] {hero}, 리그 1 OC 리비에라 이적' } },
      BACK,
    ],
  },
  {
    id: 'mk_eu2',
    cat: '이적',
    title: '유럽의 다른 길',
    text: '"빅리그로 가는 징검다리로 쓰는 선수도 있고, 여기서 왕이 되는 선수도 있습니다."',
    choices: [
      { label: 'SC 리스보아 — 포르투갈 1부', need: { min: { ovr: 66 }, away: ['w_por'] }, lock: '🔒 SC 리스보아 (포르투갈) — 영상만 요청해 왔다', ok: { text: '젊은 선수를 키워 비싸게 파는 것으로 유명한 구단. 스카우트 석이 관중석보다 붐빈다.', stage: 'w_por', set: { coach: 60 }, fx: { fame: 3, dri: 0.5 }, flag: ['c_eu'], news: '[오피셜] {hero}, 포르투갈 SC 리스보아 이적' } },
      { label: 'SK 보스포루스 — 튀르키예', need: { min: { ovr: 65 }, away: ['w_tur'] }, lock: '🔒 SK 보스포루스 (튀르키예) — 공항 마중은 아직 이르다', ok: { text: '공항에 팬 3천 명이 홍염을 들고 나왔다. 아직 한 경기도 안 뛰었는데 내 응원가가 있다.', stage: 'w_tur', set: { coach: 62 }, fx: { fame: 6, joy: 6 }, flag: ['c_eu'], news: '[오피셜] {hero}, 튀르키예 SK 보스포루스 입단… 공항 마비' } },
      { label: '글래스고 그린스 — 스코틀랜드', need: { min: { ovr: 62 }, away: ['w_sco'] }, lock: '🔒 글래스고 그린스 (스코틀랜드) — 스카우트가 다음 경기를 보러 온단다', ok: { text: '6만 명이 부르는 응원가에 소름이 돋았다. 우승은 당연하고, 더비에서 지면 한 달을 못 나간다.', stage: 'w_sco', set: { coach: 65 }, fx: { fame: 4, phy: 0.5 }, flag: ['c_eu'], news: '[오피셜] {hero}, 스코틀랜드 글래스고 그린스 이적' } },
      BACK,
    ],
  },
  {
    id: 'mk_as',
    cat: '이적',
    title: '아시아 · 중동 · 오세아니아',
    text: '"돈으로 보면 중동, 생활로 보면 일본과 호주입니다. 유럽 스카우트의 눈에서는 조금 멀어집니다."',
    choices: [
      { label: '알 도하 SC — 카타르', need: { min: { ovr: 62 }, away: ['w_qat'] }, lock: '🔒 알 도하 SC (카타르) — 이름값이 더 필요하다', ok: { text: '에어컨이 나오는 경기장. 관중은 적고 통장은 두껍다. 저녁마다 사막 쪽 하늘이 붉다.', stage: 'w_qat', set: { coach: 70 }, fx: { fame: -4, joy: -4, family: 8, nat: -4 }, flag: ['c_as'], news: '[오피셜] {hero}, 카타르 알 도하 SC 이적' } },
      { label: 'FC 간사이 — J1 리그', need: { min: { ovr: 61 }, away: ['w_jpn'] }, lock: '🔒 FC 간사이 (J1) — 외국인 선수 자리가 찼다', ok: { text: '잔디가 카펫 같다. 패스가 세 번 만에 골문 앞에 간다. 편의점 도시락이 생각보다 훌륭하다.', stage: 'w_jpn', set: { coach: 65 }, fx: { fame: 2, pas: 0.5 }, flag: ['c_as'], news: '[오피셜] {hero}, J1 FC 간사이 이적' } },
      { label: '상하이 드래곤즈 — 중국 슈퍼리그', need: { min: { ovr: 60 }, away: ['w_chn'] }, lock: '🔒 상하이 드래곤즈 (중국) — 통역부터 구하는 중이란다', ok: { text: '외국인 선수에게 모든 공이 온다. 모든 책임도 같이 온다.', stage: 'w_chn', set: { coach: 70 }, fx: { fame: -3, family: 6, nat: -3 }, flag: ['c_as'], news: '[오피셜] {hero}, 중국 상하이 드래곤즈 이적' } },
      { label: '시드니 하버 FC — A리그', need: { min: { ovr: 57 }, away: ['w_aus'] }, lock: '🔒 시드니 하버 FC (호주) — 답장이 없다', ok: { text: '훈련이 끝나면 다 같이 바다에 뛰어든다. 축구가 다시 재미있어졌다.', stage: 'w_aus', set: { coach: 70 }, fx: { joy: 15, stress: -10, fame: -3 }, flag: ['c_as'], news: '[오피셜] {hero}, 호주 A리그 시드니 하버 FC 이적' } },
      BACK,
    ],
  },
  {
    id: 'mk_am',
    cat: '이적',
    title: '아메리카',
    text: '"남쪽은 축구가 종교고, 북쪽은 축구가 쇼입니다. 어느 쪽이든 유럽과는 다른 인생입니다."',
    choices: [
      { label: '보카 델 수르 — 아르헨티나', need: { min: { ovr: 65 }, away: ['w_arg'] }, lock: '🔒 보카 델 수르 (아르헨티나) — 남미는 아직 나를 모른다', ok: { text: '경기장이 통째로 흔들린다. 진짜로 흔들린다. 종이 꽃가루가 눈처럼 내리고, 수비수는 인사 대신 태클을 한다.', stage: 'w_arg', set: { coach: 58 }, fx: { fame: 5, men: 1, homesick: 15 }, flag: ['c_am'], news: '[해외축구] {hero}, 아르헨티나 보카 델 수르 깜짝 이적' } },
      { label: '클루브 아스테카 — 리가 MX', need: { min: { ovr: 62 }, away: ['w_mex'] }, lock: '🔒 클루브 아스테카 (멕시코) — 고지대 적응부터 물어 왔다', ok: { text: '해발 2천 미터. 첫 훈련 10분 만에 숨이 찼다. 관중 8만 명이 파도를 탄다.', stage: 'w_mex', set: { coach: 62 }, fx: { fame: 3, phy: 0.5, homesick: 12 }, flag: ['c_am'], news: '[해외축구] {hero}, 멕시코 클루브 아스테카 입단' } },
      { label: '뉴욕 리버티 FC — MLS', need: { min: { ovr: 61 }, away: ['w_usa'] }, lock: '🔒 뉴욕 리버티 FC (MLS) — 마케팅팀이 인지도를 따지는 중이다', ok: { text: '원정 한 번에 비행기를 여섯 시간 탄다. 하프타임에 불꽃놀이를 한다. 유니폼은 잘 팔린다.', stage: 'w_usa', set: { coach: 68 }, fx: { fame: 4, joy: 6, nat: -3 }, flag: ['c_am'], news: '[오피셜] {hero}, MLS 뉴욕 리버티 FC 입단' } },
      BACK,
    ],
  },
  {
    id: 'ag_stay',
    cat: '에이전시',
    title: '남는다는 말',
    text: '이적 시장이 열렸다. 에이전트의 전화기는 조용하지 않다. 그래도 이번에는 움직이지 않기로 한다. 남는다는 말을 어떻게 전할까.',
    choices: [
      { label: '기자들 앞에서 "떠나지 않는다"', ok: { text: '"다음 시즌에도 이 유니폼을 입습니다." 팬들이 응원가를 한 소절 더 길게 불렀다.', fx: { fame: 2, coach: 2, mates: 1 } } },
      { label: '말 대신 훈련장에 제일 먼저 나간다', ok: { text: '아침 일곱 시의 훈련장에는 잔디 깎는 소리만 난다. 감독이 창문으로 내려다보고 있었다.', fx: { coach: 2, men: 0.5 } } },
      { label: '사실은 마음이 흔들린다', ok: { text: '에이전트에게 "일단 듣기만 하겠다"고 했다. 듣기만 하는 게 제일 어렵다.', fx: { stress: 3, joy: -2 }, flag: ['want_out'] } },
    ],
  },
  {
    id: 'ag_market',
    cat: '에이전시',
    title: '시장이 보는 나',
    text: '에이전트가 태블릿을 돌려 보여 준다. "지금 시장이 보는 선수님입니다." 선수 등급 {tier}. 예상 연봉 {market}. 지금 받는 돈은 {salary}.',
    choices: [
      {
        label: '관심 구단의 제안을 들어 본다',
        check: { stats: { tier: 1, fame: 0.5 }, dc: 30, boost: { agent: 6, agent2: 10 } },
        ok: { text: '"생각보다 많습니다." 에이전트가 가방에서 지도를 꺼냈다.', next: 'mk_hub' },
        fail: { text: '"지금은 다들 지켜보는 중입니다." 전화기는 조용했다.', fx: { stress: 3 } },
      },
      {
        label: '이 숫자를 들고 단장실에 간다',
        check: { stats: { tier: 1, men: 0.5, coach: 0.5 }, dc: 50 },
        ok: { text: '단장이 숫자를 보더니 계약서를 새로 뽑았다. 새 연봉은 {salary}.', pay: 1.15, term: 0 },
        fail: { text: '"다른 데 가고 싶다는 말로 들리는군." 단장실 공기가 싸늘해졌다.', fx: { coach: -8, stress: 4 } },
      },
      { label: '듣기만 한다', ok: { text: '숫자는 숫자일 뿐이다. 태블릿을 돌려줬다.', fx: { men: 0.5 } } },
    ],
  },
];

// 조건이 공개되지 않은 최고 엔딩의 단서. 채운 것만 내용이 드러난다.
export const golden: Pack['golden'] = {
  ending: 'golden',
  clues: [
    { id: 'g_tier', title: '정상의 공기', text: '선수 등급이 한 번이라도 가장 높은 곳에 닿았다.', when: { min: { tpeak: 80 } } },
    { id: 'g_gold', title: '목에 건 금빛', text: '태극마크를 달고 병역 문제를 풀었다.', when: { has: ['exempt'] } },
    { id: 'g_band', title: '팔에 두른 무게', text: '주장 완장을 찼다.', when: { has: ['captain'] } },
    { id: 'g_clutch', title: '마지막 키커', text: '모두가 피한 결정적 순간에 나서서, 해냈다.', when: { has: ['clutch_hero'] } },
    { id: 'g_bond', title: '혼자 오르는 산은 없다', text: '커리어가 끝나는 날까지 가족·동료·감독이 모두 곁에 있었다.', when: { min: { family: 60, mates: 60, coach: 60 } } },
    { id: 'g_skill', title: '발끝의 사전', text: '배울 수 있는 기술을 열여섯 가지 넘게 익혔다.', when: { min: { skills: 16 } } },
    { id: 'g_love', title: '관중석의 한 사람', text: '평생 응원해 줄 사람과 가정을 이뤘다.', when: { has: ['married'] } },
  ],
};
// 연애 이야기가 없는 선수 팩에서는 마지막 단서가 이것으로 바뀐다
export const goldenAlt = { id: 'g_rich', title: '숫자가 증명한다', text: '통산 수입이 1,000억 원을 넘었다.', when: { min: { earned: 1000 } } };
