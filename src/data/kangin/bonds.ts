import type { GameEvent } from '../../engine/types';

// 감독·동료와의 관계가 바닥일 때 터지는 위기와, 아주 좋을 때 열리는 보상.
// 가족 쪽의 "축구 그만둬라"(f_dadban)와 짝을 이룬다. 모든 선수 팩이 물려받는다.
export const bonds: GameEvent[] = [
  {
    id: 'f_coach_b',
    cat: '위기',
    auto: 0.6,
    repeat: true,
    when: { age: [14, 99], max: { coach: 22 } },
    title: '2군 통보',
    text: '훈련장 게시판에 종이가 붙었다. 내 이름 옆에 "2군 합류". 코치가 미안한 얼굴로 말한다. "감독님 결정이다. 거기서 보여 줘라."',
    choices: [
      {
        label: '2군 경기에서 증명한다',
        check: { stats: { ovr: 1, men: 1 }, rel: -2 },
        ok: { text: '2군 세 경기에서 네 골. 마지막 경기는 감독이 직접 보러 왔다. "다음 주부터 1군 훈련에 나와라."', fx: { coach: 22, men: 1 } },
        fail: { text: '2군에서도 눈에 띄지 못했다. 버스는 낡았고 원정은 멀다.', fx: { coach: 6, joy: -10, stress: 8 } },
      },
      {
        label: '감독을 찾아가 이유를 묻는다',
        check: { stats: { men: 1, iq: 0.5 }, rel: 0 },
        ok: { text: '"훈련 태도." 감독이 영상 세 개를 틀었다. 어슬렁거리는 내가 찍혀 있었다. 할 말이 없었고, 그래서 고칠 수 있었다.', fx: { coach: 18, iq: 1 } },
        fail: { text: '"그걸 물어야 아나." 문이 닫혔다.', fx: { coach: -6, stress: 8 } },
      },
      { label: '에이전트를 불러 다른 팀을 알아본다', need: { has: ['pro', 'agent'] }, lock: '🔒 다른 팀을 알아본다 — 에이전트가 있는 프로 선수만', ok: { text: '에이전트가 전화기를 꺼냈다. "이런 날을 대비해서 명함을 모아 뒀죠."', fx: { coach: -3 }, next: 'mk_hub' } },
      { label: '훈련을 건너뛴다', ok: { text: '이틀을 쉬었다. 사흘째에는 사물함 위치가 바뀌어 있었다.', fx: { coach: -12, joy: 3 } } },
    ],
  },
  {
    id: 'f_coach_press',
    cat: '위기',
    weight: 3,
    when: { age: [17, 99], max: { coach: 30 }, min: { fame: 45 } },
    title: '이름 없는 저격',
    text: '기자회견에서 감독이 이름을 대지 않고 말했다. "재능만 믿고 뛰지 않는 선수는 내 팀에 필요 없다." 기자들이 일제히 관중석의 내 쪽을 쳐다봤다.',
    choices: [
      { label: '다음 날 훈련장에서 제일 먼저 뛴다', ok: { text: '말로 받아치지 않았다. 셔틀런 기록이 팀에서 두 번째였다. 감독은 아무 말도 하지 않았지만, 다음 명단에 이름이 있었다.', fx: { coach: 10, stamina: -10, joy: -4 } } },
      { label: 'SNS에 뜻 모를 글을 올린다', ok: { text: '"노력은 보려는 사람에게만 보인다." 좋아요가 10만 개 달렸다. 감독은 누르지 않았다.', fx: { coach: -12, fame: 5, mates: -4 } } },
      { label: '주장에게 중재를 부탁한다', need: { min: { mates: 50 } }, lock: '🔒 주장에게 부탁한다 — 동료들의 신뢰가 필요하다', ok: { text: '주장이 감독 방에 30분 있다가 나왔다. "한 번은 내가 막아 줬다. 두 번은 없다."', fx: { coach: 14, mates: -2 } } },
    ],
  },
  {
    id: 'f_mates_nopass',
    cat: '위기',
    auto: 0.6,
    repeat: true,
    when: { age: [10, 99], max: { mates: 18 } },
    title: '패스가 오지 않는다',
    text: '빈 공간으로 뛰어 들어가 손을 들었다. 공은 오지 않았다. 세 번째다. 우연이 아니다. 라커룸에 들어서자 떠들던 소리가 뚝 끊겼다.',
    choices: [
      { label: '먼저 사과하고 밥을 산다', ok: { text: '"내가 요즘 좀 그랬지. 미안하다. 오늘은 내가 산다." 고기 값이 꽤 나왔다. 다음 경기, 첫 패스가 내게 왔다.', fx: { mates: 22, stress: -4 } } },
      { label: '훈련에서 궂은일을 도맡는다', ok: { text: '콘을 나르고, 공을 줍고, 수비 가담을 두 배로 했다. 일주일 뒤 누군가 내 물통을 채워 놓았다.', fx: { mates: 14, coach: 3, stamina: -12 } } },
      {
        label: '혼자 해결한다',
        check: { stats: { dri: 1, sho: 1 }, rel: 6 },
        ok: { text: '공을 뺏어 혼자 몰고 가 넣었다. 골은 들어갔지만 달려오는 사람이 없었다.', fx: { fame: 5, mates: -4, coach: 4 }, goal: 1 },
        fail: { text: '혼자 끌다 뺏겼고, 그대로 실점했다. 감독이 교체 사인을 냈다.', fx: { mates: -6, coach: -8, stress: 8 } },
      },
    ],
  },
  {
    id: 'f_mates_locker',
    cat: '위기',
    auto: 0.8,
    repeat: true,
    when: { age: [13, 99], max: { mates: 8 } },
    title: '라커룸',
    text: '지고 들어온 라커룸. 고참이 물병을 바닥에 내던졌다. "너 하나 때문에 열 명이 뛰는 거다." 다들 나를 본다. 편들어 주는 사람이 없다.',
    choices: [
      {
        label: '고개를 숙이고 잘못을 인정한다',
        check: { stats: { men: 1 }, dc: 30 },
        ok: { text: '"…맞습니다. 제가 잘못했습니다." 긴 침묵 끝에 고참이 물병을 주워 내게 던졌다. "다음 경기부터 달라져라."', fx: { mates: 28, stress: -5 } },
        fail: { text: '사과는 너무 늦었다. 구단은 "선수단 분위기"를 이유로 계약을 정리했다.', end: 'loner' },
      },
      { label: '감독에게 중재를 부탁한다', need: { min: { coach: 50 } }, lock: '🔒 감독에게 부탁한다 — 감독의 신뢰가 필요하다', ok: { text: '감독이 선수단 전체를 모았다. 불편한 한 시간이었다. 끝날 때쯤 누군가 먼저 손을 내밀었다.', fx: { mates: 20, coach: -8 } } },
      { label: '"그럼 나 빼고 해 보든가"', ok: { text: '문을 닫고 나왔다. 다음 경기, 팀은 정말로 나 없이 했다. 그리고 이겼다.', end: 'loner' } },
    ],
  },
  {
    id: 'f_mates_youth',
    cat: '위기',
    weight: 3,
    when: { age: [9, 16], max: { mates: 25 } },
    title: '혼자 먹는 점심',
    text: '훈련이 끝난 식당. 아이들이 한 테이블에 몰려 앉았다. 내 옆자리만 비어 있다. 누가 작게 말한다. "쟤는 자기만 잘난 줄 알아."',
    choices: [
      { label: '식판을 들고 그 테이블로 간다', ok: { text: '"나도 껴도 돼?" 잠깐 조용하더니 한 명이 엉덩이를 옮겨 줬다. 그날 오후 훈련에서 처음으로 하이파이브를 했다.', fx: { mates: 15, joy: 5 } } },
      { label: '코치에게 말한다', ok: { text: '코치가 다음 날 훈련을 전부 2인 1조로 바꿨다. 어색했지만 끝날 때는 다들 웃고 있었다.', fx: { mates: 6, coach: 2 } } },
      { label: '상관없다, 공이 친구다', ok: { text: '혼자 벽에 공을 찼다. 벽은 패스를 정확히 돌려준다. 다만 벽과는 웃을 일이 없다.', fx: { dri: 1, men: 1, mates: -5, joy: -8 } } },
    ],
  },
  {
    id: 'c_mates_bond',
    cat: '동료',
    auto: 0.5,
    when: { age: [18, 99], min: { mates: 85 }, not: ['bonded'] },
    title: '버스 맨 뒷자리',
    text: '원정 버스 맨 뒷자리가 언제부터인가 내 자리가 됐다. 신인이 고민을 들고 오고, 외국인 선수가 통역 없이 말을 건다.',
    choices: [
      { label: '시즌 중에 팀 회식을 연다', ok: { text: '고깃집을 통째로 빌렸다. 그날 이후 경기장에서 눈만 마주쳐도 공이 온다.', fx: { mates: 3, joy: 8 }, skill: 'duo', flag: ['bonded'] } },
      { label: '후배의 개인 훈련을 봐준다', ok: { text: '가르치다 보니 내 축구가 정리됐다. 경기장에서 보이는 길이 하나 더 늘었다.', fx: { iq: 1 }, slot: 1, flag: ['bonded', 'mentor'] } },
    ],
  },
  {
    id: 'c_coach_trust',
    cat: '감독',
    auto: 0.5,
    when: { age: [18, 99], min: { coach: 90 }, not: ['trusted'] },
    title: '통째로 넘어온 전술판',
    text: '감독이 전술판을 내 앞으로 밀어 놓는다. "다음 경기, 공격은 네가 짜 봐라."',
    choices: [
      {
        label: '내 방식대로 짠다',
        check: { stats: { iq: 1 }, rel: 0 },
        ok: { text: '내가 그린 움직임 그대로 골이 났다. 벤치에서 감독이 코치에게 말하는 게 들렸다. "쟤는 나중에 감독 한다."', fx: { iq: 2, fame: 4 }, flag: ['trusted', 'coach_brain'] },
        fail: { text: '그림은 좋았는데 경기는 그림대로 흘러가지 않았다. 감독이 전술판을 조용히 가져갔다.', fx: { coach: -8, iq: 1 }, flag: ['trusted'] },
      },
      { label: '감독의 틀에서 한 가지만 바꾼다', ok: { text: '코너킥 하나를 바꿨고, 거기서 골이 났다. 감독이 엄지를 들었다.', fx: { iq: 1, coach: 3 }, flag: ['trusted'] } },
    ],
  },
];
