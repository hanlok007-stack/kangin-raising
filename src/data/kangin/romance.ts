import type { GameEvent } from '../../engine/types';

// 애인. 첫사랑(v_crush)이나 아나운서(c_date1 → f_love)로 시작한 인연이 이어지는 이야기다.
// lover 플래그가 있는 동안 "애인" 게이지가 보이고, 돌보지 않으면 조금씩 식는다.
// 곁에 있으면 스트레스가 풀리고 슬럼프를 버티게 해 주지만, 소홀하면 떠난다.
// 다른 선수 팩에는 넘어가지 않는다.
export const romance: GameEvent[] = [
  {
    id: 'v_long',
    cat: '연애',
    auto: 0.6,
    when: { has: ['lover'], not: ['ld', 'together', 'married'], min: { clubs: 2 } },
    title: '거긴 지금 몇 시야?',
    text: '팀을 옮기면서 사는 도시가 바뀌었다. 그 사람은 원래 도시에 남았다. 영상 통화 속 얼굴이 자꾸 끊긴다. "거긴 지금 몇 시야?"',
    choices: [
      { label: '쉬는 날마다 비행기를 탄다', ok: { text: '공항 직원이 얼굴을 외웠다. 마일리지가 쌓이고 다리는 무겁다. 그래도 마중 나온 얼굴을 보면 다 잊는다.', fx: { love: 15, stamina: -14, stress: -6 }, flag: ['ld'] } },
      {
        label: '"같이 가자"고 말한다',
        check: { stats: { love: 1 }, dc: 55 },
        ok: { text: '사흘 뒤에 답이 왔다. 사진 한 장. 싸 놓은 이삿짐이었다.', fx: { love: 20, joy: 10, homesick: -20 }, flag: ['together'] },
        fail: { text: '"내 일은? 내 삶은?" 맞는 말이었다. 통화가 일찍 끝났다.', fx: { love: -22, stress: 10 }, flag: ['ld'] },
      },
      { label: '매일 밤 같은 시간에 전화한다', ok: { text: '여덟 시간의 시차. 내 저녁이 그 사람의 새벽이다. 서로 졸면서 하는 통화가 하루의 끝이 됐다.', fx: { love: 8, men: 0.5 }, flag: ['ld'] } },
      { label: '시즌 중에는 연락을 줄이자고 한다', ok: { text: '"…그래, 네 축구가 먼저지." 목소리가 평소보다 반 톤 낮았다.', fx: { love: -25, coach: 3 }, flag: ['ld'] } },
    ],
  },
  {
    id: 'v_anniv',
    cat: '연애',
    weight: 4,
    when: { has: ['lover'], age: [17, 99] },
    title: '달력의 동그라미',
    text: '기념일이 원정 경기 날과 겹쳤다. 달력에 동그라미를 친 건 석 달 전인데, 깨달은 건 어젯밤이다.',
    choices: [
      {
        label: '골 세리머니로 대신한다',
        check: { stats: { sho: 1, dri: 1 }, rel: 4 },
        ok: { text: '골을 넣고 유니폼 안의 티셔츠를 보여 줬다. 날짜와 하트. 옐로카드를 받았다. 싸게 막았다.', fx: { love: 18, fame: 4 }, goal: 1 },
        fail: { text: '골은 없었고, 준비한 티셔츠는 아무도 보지 못했다.', fx: { love: -10, stress: 5 } },
      },
      { label: '꽃과 손편지를 보낸다', ok: { text: '글씨가 엉망이라 세 번을 다시 썼다. 답장은 사진이었다. 편지를 냉장고에 붙여 놓았다.', fx: { love: 12, joy: 3 } } },
      { label: '경기에 집중한다', ok: { text: '경기는 이겼다. 휴대폰에는 읽지 않은 메시지 하나. "오늘 무슨 날인지 알아?"', fx: { love: -18, stress: 6 } } },
    ],
  },
  {
    id: 'v_scandal',
    cat: '연애',
    weight: 3,
    when: { has: ['lover'], min: { fame: 50 }, not: ['public'] },
    title: '열애설',
    text: '아침부터 휴대폰이 터질 듯 울린다. "[단독] {hero}, 열애 중". 사진 속 모자 쓴 사람은 누가 봐도 나다. 구단 홍보팀이 묻는다. "어떻게 할까요?"',
    choices: [
      { label: '인정한다', ok: { text: '"좋은 만남을 이어 가고 있습니다." 하루 종일 시끄러웠고, 그 사람은 저녁에 웃으며 말했다. "이제 모자 안 써도 되겠다."', fx: { love: 15, fame: 5, stress: 6 }, flag: ['public'], news: '[공식] {hero} 측 "좋은 만남 이어 가는 중"' } },
      { label: '"사생활입니다"', ok: { text: '기자들은 아쉬워했고, 기사는 사흘 만에 식었다.', fx: { love: -6, stress: 4 }, flag: ['public'] } },
      { label: '부인한다', ok: { text: '기사는 조용해졌다. 그 사람도 조용해졌다.', fx: { love: -25, fame: -3 } } },
    ],
  },
  {
    id: 'v_comfort',
    cat: '연애',
    auto: 0.5,
    repeat: true,
    when: { has: ['lover'], min: { love: 50 }, max: { joy: 40 } },
    title: '져도 돼',
    text: '세 경기째 부진하다. 불 꺼진 방에 앉아 있는데 초인종이 울린다. 그 사람이 떡볶이를 들고 서 있다. "져도 돼. 근데 굶지는 마."',
    choices: [
      { label: '같이 먹는다', ok: { text: '축구 얘기는 한마디도 하지 않았다. 다 먹고 나니 내일 훈련에 가고 싶어졌다.', fx: { joy: 22, stress: -18, love: 6 } } },
      { label: '혼자 있고 싶다고 한다', ok: { text: '문 앞에 떡볶이만 놓고 갔다. 식은 떡볶이를 혼자 먹었다. 그래도 맛있었다.', fx: { love: -12, men: 1, joy: 6 } } },
    ],
  },
  {
    id: 'v_parents',
    cat: '연애',
    weight: 3,
    when: { has: ['lover'], age: [21, 99], min: { love: 60 }, not: ['met_parents'] },
    title: '반찬 열두 가지',
    text: '그 사람이 처음으로 우리 집에 왔다. 엄마는 반찬을 열두 가지 차렸고, 아빠는 헛기침만 한다.',
    choices: [
      { label: '아빠와 그 사람을 축구 얘기로 엮는다', ok: { text: '알고 보니 그 사람이 아빠보다 오프사이드를 잘 알았다. 아빠가 처음으로 웃었다.', fx: { family: 10, love: 10 }, flag: ['met_parents'] } },
      { label: '엄마의 질문 세례를 대신 막는다', ok: { text: '"엄마, 그건 내가 대답할게." 식탁 밑에서 그 사람이 내 손을 꼭 잡았다.', fx: { love: 12, family: 4 }, flag: ['met_parents'] } },
    ],
  },
  {
    id: 'v_propose',
    cat: '연애',
    auto: 0.5,
    repeat: true,
    when: { has: ['lover'], age: [25, 99], min: { love: 75 }, not: ['married'] },
    title: '서랍 속의 반지',
    text: '서랍 속에 반지 상자가 석 달째 들어 있다. 시즌이 끝났다. 더 미룰 핑계가 없다.',
    choices: [
      {
        label: '불 꺼진 경기장 센터서클에서',
        check: { stats: { love: 1, men: 0.5 }, dc: 58 },
        ok: { text: '구장 관리인에게 조명 하나만 켜 달라고 부탁했다. 센터서클에서 무릎을 꿇었다. 대답은 내 질문이 끝나기도 전에 나왔다.', fx: { love: 20, joy: 25, stress: -20, men: 2, fame: 4 }, flag: ['married'], news: '[화제] {hero} 결혼 발표… "가장 든든한 응원단이 생겼다"' },
        fail: { text: '"지금은 아니야. 네가 싫어서가 아니라." 반지는 다시 서랍으로 들어갔다.', fx: { love: -15, stress: 10 } },
      },
      {
        label: '집에서, 떡볶이를 먹다가',
        check: { stats: { love: 1 }, dc: 50 },
        ok: { text: '"우리 결혼할까?" "떡볶이 먹다가?" "응." "…그래." 세상에서 제일 싱거운 프러포즈였고, 둘 다 그게 좋았다.', fx: { love: 20, joy: 25, stress: -20, men: 1 }, flag: ['married'], news: '[화제] {hero} 결혼 발표… "떡볶이 먹다가 청혼"' },
        fail: { text: '"…떡볶이 먹다가?" 분위기가 아니었다. 다음에 다시 하기로 했다.', fx: { love: -8, stress: 5 } },
      },
      { label: '아직은 축구가 먼저다', ok: { text: '서랍을 닫았다. 그 사람은 서랍 안에 뭐가 있는지 이미 알고 있다.', fx: { love: -20, men: 1 } } },
    ],
  },
  {
    id: 'v_baby',
    cat: '연애',
    auto: 0.35,
    when: { has: ['married'], age: [27, 99], not: ['dad'] },
    title: '새벽 네 시의 복도',
    text: '새벽 네 시, 분만실 앞 복도. 오후에는 경기가 있다. 그런 건 지금 하나도 중요하지 않다. 문 너머에서 울음소리가 들렸다.',
    choices: [
      {
        label: '경기를 뛰고 골을 아이에게 바친다',
        check: { stats: { men: 1, ovr: 1 }, rel: 3 },
        ok: { text: '잠은 한 시간 잤다. 골을 넣고 공을 유니폼 안에 넣었다. 관중석이 전부 알아봤다.', fx: { fame: 6, joy: 25, stamina: -15 }, goal: 1, flag: ['dad'] },
        fail: { text: '다리가 말을 듣지 않았다. 그래도 종료 휘슬이 울리자마자 병원으로 달렸다.', fx: { joy: 15, stamina: -20 }, flag: ['dad'] },
      },
      { label: '감독에게 하루만 달라고 한다', ok: { text: '"가라. 축구는 내일도 있다." 작은 손이 내 손가락 하나를 쥐었다. 우승컵보다 무거웠다.', fx: { joy: 30, family: 10, coach: -3 }, flag: ['dad'] } },
    ],
  },
  {
    id: 'v_home',
    cat: '연애',
    weight: 3,
    when: { has: ['married'], max: { love: 40 } },
    title: '식탁 위의 쪽지',
    text: '원정, 합숙, 대표팀 소집. 한 달에 집에서 자는 날이 엿새다. 식탁 위에 쪽지가 있다. "우리 얼굴은 TV로만 보네."',
    choices: [
      { label: '휴가를 내고 둘이 여행을 간다', ok: { text: '사흘 동안 휴대폰을 껐다. 감독의 부재중 전화가 네 통 와 있었다. 후회하지 않는다.', fx: { love: 28, joy: 10, coach: -5, stress: -10 } } },
      { label: '집에 있는 날만큼은 축구를 끈다', ok: { text: '경기 영상 대신 드라마를 같이 봤다. 주인공이 누군지 몰라 세 번을 물었다.', fx: { love: 15, stress: -5 } } },
      { label: '"시즌 끝나면"이라고 답한다', ok: { text: '쪽지 밑에 답을 적었다. 다음 날 쪽지는 그대로 있었다.', fx: { love: -12, stress: 6 } } },
    ],
  },
  {
    id: 'v_breakup',
    cat: '연애',
    auto: 0.7,
    repeat: true,
    when: { has: ['lover'], max: { love: 8 }, not: ['married'] },
    title: '우리 얘기 좀 해',
    text: '마지막으로 제대로 통화한 게 언제인지 기억나지 않는다. 메시지가 왔다. "우리 얘기 좀 해."',
    choices: [
      {
        label: '붙잡는다',
        check: { stats: { men: 1 }, dc: 62 },
        ok: { text: '"한 번만 더." 말보다 표정을 봐 준 것 같다. 달력에 쉬는 날을 전부 표시했다.', fx: { love: 35 } },
        fail: { text: '"축구랑 사귀는 것 같았어." 틀린 말이 아니어서 더 붙잡지 못했다.', fx: { stress: 25, joy: -15 }, flag: ['ex'], unflag: ['lover', 'gf', 'partner', 'ld', 'together', 'gf_slack', 'gf_team'] },
      },
      { label: '놓아준다', ok: { text: '카페에서 조용히 헤어졌다. 그날 저녁 훈련장에서 프리킥을 백 개 찼다. 몇 개가 들어갔는지는 모른다.', fx: { stress: 18, joy: -10, men: 2 }, flag: ['ex'], unflag: ['lover', 'gf', 'partner', 'ld', 'together', 'gf_slack', 'gf_team'] } },
    ],
  },
  {
    id: 'v_again',
    cat: '연애',
    weight: 2,
    when: { has: ['ex'], not: ['lover', 'dating', 'again'], age: [23, 99] },
    title: '다시, 누군가',
    text: '유소년 축구교실 봉사활동. 아이들 틈에서 호루라기를 부는 자원봉사자가 있다. 내가 누군지 모르는 눈치다. "거기 키 큰 분, 콘 좀 날라 주세요."',
    choices: [
      { label: '콘을 나르고, 끝나고 커피를 산다', ok: { text: '직업을 묻기에 "공 차는 일"이라고 했다. 일주일 뒤 그 사람이 메시지를 보냈다. "TV에 나오던데요? 왜 말 안 했어요."', fx: { joy: 12, stress: -8 }, set: { love: 45 }, flag: ['lover', 'again'] } },
      { label: '아이들과 공만 차다 온다', ok: { text: '여섯 살짜리에게 알까기를 당했다. 오랜만에 소리 내어 웃었다.', fx: { joy: 8 }, flag: ['again'] } },
    ],
  },
];
