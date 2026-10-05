import type { GameEvent } from '../../engine/types';

const KR = ['kr', 'school'];

// 한눈팔면 커리어가 끝나는 위기들. 잘못 고르면 엔딩 → 되돌리기(광고)로 이어진다.
// 같은 사건이 오히려 약이 되는 길도 섞어 둔다. 연애 이벤트는 다른 선수 팩으로 넘어가지 않는다.
export const crisis: GameEvent[] = [
  {
    id: 'v_crush',
    cat: '연애',
    weight: 4,
    when: { age: [16, 21], not: ['gf', 'crushed', 'dating', 'partner', 'lover'] },
    title: '첫사랑',
    text: '경기장 관중석 맨 앞줄에 매번 같은 사람이 앉아 있다. 오늘은 눈이 마주쳤다. 공이 발에서 자꾸 떨어진다.',
    choices: [
      {
        label: '경기가 끝나고 말을 건다',
        check: { stats: { men: 1 }, rel: -2 },
        ok: { text: '"저… 다음 경기도 오실 거죠?" 그 사람이 웃었다. 다음 경기에서 두 골을 넣었다.', fx: { joy: 18, men: 1, stress: -8 }, set: { love: 45 }, flag: ['gf', 'lover'] },
        fail: { text: '말을 더듬다가 사인만 해 주고 왔다. 이불을 찼다.', fx: { joy: -6, stress: 6 }, flag: ['crushed'] },
      },
      { label: '골로 대답한다', ok: { text: '그 사람이 보는 앞에서 넣은 골. 세리머니는 관중석 쪽이었다. 그걸로 충분했다.', fx: { men: 1.5, joy: 6 }, flag: ['crushed'] } },
    ],
  },
  {
    id: 'v_gf_cheer',
    cat: '연애',
    auto: 0.5,
    when: { has: ['gf'], not: ['gf_cheer'] },
    title: '관중석의 그 사람',
    text: '요즘 몸이 가볍다. 훈련이 끝나면 전화할 사람이 있고, 경기 날에는 관중석에 찾아볼 얼굴이 있다. 감독이 고개를 갸웃한다. "너 요즘 왜 이렇게 잘하냐?"',
    choices: [
      { label: '"비밀입니다"', ok: { text: '비밀은 일주일 만에 라커룸 전체에 퍼졌다. 놀림은 받았지만 평점은 올랐다.', fx: { men: 3, joy: 12, coach: 5, mates: 4 }, flag: ['gf_cheer'] } },
      { label: '여자친구에게 고맙다고 말한다', ok: { text: '"네 덕분이야." "아니, 네가 잘하는 거야." 서로 우기다가 웃었다.', fx: { men: 2, joy: 18, stress: -10 }, flag: ['gf_cheer'] } },
    ],
  },
  {
    id: 'v_gf_drift',
    cat: '연애',
    auto: 0.4,
    when: { has: ['gf'], not: ['gf_slack', 'gf_team'] },
    title: '오늘 훈련 빠지면 안 돼?',
    text: '놀이공원 표가 두 장 생겼다고 한다. 하필 오늘은 전술 훈련 날이다. 휴대폰이 계속 울린다.',
    choices: [
      { label: '훈련을 빠진다', ok: { text: '롤러코스터는 재밌었다. 다음 날 감독은 내 이름을 부르지 않았다. 다음 주에도 빠질 핑계를 찾고 있는 나를 발견했다.', fx: { joy: 14, coach: -10, dri: -1, pas: -1 }, flag: ['gf_slack'] } },
      { label: '훈련 끝나고 달려간다', ok: { text: '야간 개장에 겨우 맞췄다. 회전목마 하나 탔지만 둘 다 웃었다.', fx: { joy: 8, men: 1, stamina: -8 }, flag: ['gf_team'] } },
      { label: '훈련장에 데려온다', ok: { text: '관중석에서 지켜보는 눈이 있으니 평소보다 두 배로 뛰었다. 감독이 말했다. "매일 데려와라."', fx: { phy: 1, joy: 10, coach: 5 }, flag: ['gf_team'] } },
    ],
  },
  {
    id: 'f_gf_quit',
    cat: '위기',
    auto: 0.6,
    when: { has: ['gf_slack'], max: { coach: 45 } },
    title: '축구보다 네가 좋아',
    text: '훈련을 빠진 게 벌써 다섯 번째다. 벤치에도 못 앉는다. 여자친구가 조심스럽게 묻는다. "너 요즘 축구 얘기를 안 해. 괜찮은 거야?"',
    choices: [
      { label: '"축구 그만두려고"', ok: { text: '말하고 나니 속이 시원했다. 그리고 조금 무서웠다.', end: 'love' } },
      {
        label: '정신을 차린다',
        check: { stats: { men: 1 }, rel: 0 },
        ok: { text: '"미안. 나 다시 제대로 해 볼게." 그 사람이 먼저 훈련 가방을 들어 줬다.', fx: { men: 3, coach: 10, joy: 5 }, unflag: ['gf_slack'], flag: ['gf_team'] },
        fail: { text: '다짐은 사흘을 못 갔다. 사물함에서 내 이름표가 떼어졌다.', end: 'love' },
      },
    ],
  },
  {
    id: 'f_grade',
    cat: '위기',
    weight: 3,
    when: { stage: KR, age: [12, 17], max: { iq: 40 } },
    title: '최저 학력 미달',
    text: '성적표를 본 교감 선생님이 감독을 불렀다. 학생 선수는 일정 성적을 넘지 못하면 대회에 나갈 수 없다. 전국대회가 다음 달이다.',
    choices: [
      { label: '보충 수업을 듣는다', ok: { text: '방과 후 교실에 혼자 남았다. 분수 나눗셈이 수비 넷보다 어렵다. 그래도 대회에는 나간다.', fx: { iq: 2, stress: 8, joy: -6, stamina: -8 } } },
      { label: '"축구만 잘하면 되잖아요"', ok: { text: '출전 정지. 스카우트들이 온 전국대회를 관중석에서 봤다.', fx: { coach: -15, fame: -8, stress: 10, joy: -10 } } },
    ],
  },
  {
    id: 'f_phone',
    cat: '위기',
    weight: 3,
    when: { age: [12, 99], min: { stress: 45 } },
    title: '새벽 세 시의 휴대폰',
    text: '영상 하나만 보고 자려고 했다. 정신을 차리니 창밖이 밝다. 오늘은 결승전이고, 버스는 20분 뒤에 떠난다.',
    choices: [
      {
        label: '세수만 하고 뛰어나간다',
        check: { stats: { phy: 1, men: 1 }, rel: 0 },
        ok: { text: '버스에서 20분 자고, 경기에서는 아무 일 없었다는 듯 뛰었다. 운이 좋았다.', fx: { stamina: -20, men: 1 } },
        fail: { text: '전반 30분에 다리가 풀렸다. 감독이 교체 사인을 보내며 고개를 저었다.', fx: { stamina: -25, coach: -12, stress: 10 } },
      },
      { label: '그날부터 휴대폰을 거실에 둔다', ok: { text: '결승전은 엉망이었지만 그 뒤로 아침이 달라졌다.', fx: { coach: -5, men: 2, stress: -8 } } },
    ],
  },
  {
    id: 'f_fracture',
    cat: '위기',
    auto: 0.5,
    when: { min: { injury: 45 }, max: { stamina: 30 }, not: ['fracture'] },
    title: '피로 골절',
    text: '정강이가 며칠째 아프다. 참고 뛰었는데 오늘은 디딜 때마다 찌릿하다. 트레이너가 엑스레이 사진을 들고 온다. "금이 갔다. 지금 멈추면 6주, 더 뛰면 장담 못 한다."',
    choices: [
      { label: '멈춘다', ok: { text: '깁스를 하고 관중석에 앉았다. 6주가 6년 같았다. 그래도 뼈는 붙었다.', fx: { injury: -40, joy: -8, stamina: 30 }, injure: 2, flag: ['fracture'] } },
      {
        label: '진통제를 먹고 뛴다',
        check: { stats: { phy: 1 }, rel: 8 },
        ok: { text: '버텼다. 대회는 끝났고 다리는 아직 붙어 있다. 다시는 이러지 않기로 했다.', fx: { coach: 6, injury: 15, men: 1 }, flag: ['fracture'] },
        fail: { text: '경기 중에 "딱" 소리가 났다. 완전히 부러졌다. 의사는 복귀 시점을 말해 주지 않았다.', end: 'fallen' },
      },
    ],
  },
  {
    id: 'f_dadban',
    cat: '위기',
    npc: 'dad',
    auto: 0.8,
    repeat: true,
    when: { max: { family: 12 } },
    title: '축구 그만둬라',
    text: '집에 들어서자 아빠가 식탁에 앉아 있다. 식사 때 얼굴을 본 게 언제인지 모르겠다. "이럴 거면 그만둬라. 가족도 모르는 놈이 축구는 해서 뭐 하냐."',
    choices: [
      {
        label: '잘못했다고 말한다',
        check: { stats: { men: 1, joy: 0.5 }, dc: 30 },
        ok: { text: '한참 침묵이 흘렀다. 엄마가 찌개를 데웠다. 오랜만에 셋이 밥을 먹었다.', fx: { family: 30, stress: -10 } },
        fail: { text: '말이 엇나갔다. 아빠가 축구 가방을 현관 밖에 내놓았다.', end: 'quit' },
      },
      { label: '이번 주말은 집에 있겠다고 한다', ok: { text: '훈련 대신 아빠 가게 일을 도왔다. 아빠는 끝까지 말이 없다가, 저녁에 축구화를 닦아 놓았다.', fx: { family: 25, coach: -4, joy: 5 } } },
      { label: '문을 닫고 방에 들어간다', ok: { text: '다음 날 구단에 아빠의 전화가 갔다. "우리 애 이제 안 보냅니다."', end: 'quit' } },
    ],
  },
  {
    id: 'f_weight',
    cat: '위기',
    weight: 3,
    when: { has: ['ramen'], age: [13, 99] },
    title: '체지방 측정의 날',
    text: '트레이너가 측정표를 보며 안경을 고쳐 쓴다. "지난달보다 4% 늘었네. 야식 먹니?" 뒤에서 감독이 듣고 있다.',
    choices: [
      { label: '솔직히 말하고 식단을 받는다', ok: { text: '닭가슴살, 고구마, 브로콜리. 밤 11시의 라면 냄새가 세상에서 가장 큰 유혹이 됐다.', fx: { phy: 1.5, joy: -8, coach: 3 }, unflag: ['ramen'] } },
      { label: '"근육입니다"', ok: { text: '감독이 웃지 않았다. 다음 날부터 훈련 전 운동장 열 바퀴가 추가됐다.', fx: { coach: -10, stamina: -15, stress: 6 } } },
    ],
  },
  {
    id: 'f_ambush',
    cat: '위기',
    weight: 2,
    when: { age: [9, 15], min: { n_street: 3 } },
    title: '골목의 유리창',
    text: '막축구를 하다 찬 공이 정확히 문구점 유리창을 뚫었다. 왼발 감아차기였다. 주인 아저씨가 빗자루를 들고 나온다.',
    choices: [
      { label: '남아서 사과한다', ok: { text: '한 달 동안 방과 후에 가게를 쓸었다. 아저씨는 그 뒤로 경기 때마다 응원을 온다.', fx: { men: 2, family: -3, stamina: -6, fame: 2 } } },
      {
        label: '도망친다',
        check: { stats: { phy: 1, dri: 1 }, rel: 4 },
        ok: { text: '인생 최고 속도. 아저씨는 세 골목 만에 포기했다. 그런데 유니폼 등에 이름이 써 있었다.', fx: { phy: 1, family: -8, stress: 6 } },
        fail: { text: '첫 번째 모퉁이에서 잡혔다. 부모님이 불려 왔고, 한 달간 외출 금지다.', fx: { family: -12, joy: -10, stress: 8 } },
      },
    ],
  },
];
