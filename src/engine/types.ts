// 엔진 타입. 엔진은 스탯 이름이나 이벤트 내용을 모른다 — 전부 캐릭터 팩(Pack)이 정한다.
// 팩은 함수 없이 JSON으로 직렬화 가능한 데이터만 담는다 (편집자 화면에서 내보내기/가져오기).
// 엔진이 예약한 변수 키: stamina, stress, injury, coach, fame, nat, mates, tier(선수 등급 점수), tpeak(최고 등급 점수)
// 계산값: ovr, age, n_<행동id>(그 행동을 한 횟수), salary, earned, contract(남은 계약 연수), skills(배운 기술 수), clubs(거친 팀 수)
// 엔진이 만드는 플래그: fa (계약이 끝나 시장에 나와 있는 동안)

export type Fx = Record<string, number>;

export interface Cond {
  stage?: string[]; // 이 중 하나
  age?: [number, number]; // [최소, 최대] 포함
  has?: string[]; // 플래그 전부 보유
  any?: string[]; // 플래그 중 하나 이상 보유
  not?: string[]; // 플래그 하나도 없음
  away?: string[]; // 지금 이 스테이지에 있지 않음
  min?: Fx;
  max?: Fx;
}

export interface Outcome {
  text: string;
  fx?: Fx;
  set?: Fx; // 절대값으로 덮어쓰기 (이적 후 감독 신뢰 초기화 등)
  flag?: string[];
  unflag?: string[];
  next?: string; // 이어질 이벤트 id
  end?: string; // 즉시 엔딩 id
  stage?: string; // 스테이지 전환
  pos?: string; // 포지션 확정
  skill?: string; // 기술 습득
  slot?: number; // 경기 선택지 슬롯 추가
  injure?: number; // 부상 턴 수
  goal?: number;
  assist?: number;
  news?: string;
  real?: boolean; // 세계선 분기: 실제 커리어와 같은 선택이면 true
  pay?: number; // 연봉을 시장가 × pay로 다시 정한다 (stage가 있으면 새 팀 기준)
  term?: number; // 계약 기간(년). pay와 함께 쓴다
}

export interface Check {
  stats: Fx; // 변수별 가중치
  dc?: number; // 절대 난이도
  rel?: number; // 현재 스테이지 난이도 대비 보정 (dc가 없을 때)
  trait?: string; // 팩의 특성 보너스
  boost?: Fx; // 플래그를 갖고 있으면 더해지는 보너스
}

export interface Choice {
  label: string;
  need?: Cond;
  lock?: string; // 조건이 안 맞아 잠겼을 때 보여 줄 문구 (없으면 "다른 세계선의 선택지")
  check?: Check; // 있으면 fail도 있어야 한다
  ok: Outcome;
  fail?: Outcome;
}

export interface GameEvent {
  id: string;
  cat: string; // 카테고리 id (Pack.cats)
  title: string;
  text: string;
  npc?: string;
  when?: Cond;
  at?: [number, number]; // [연도, 분기] 고정 스토리 이벤트
  auto?: number; // 조건이 맞으면 이 확률로 스스로 발생 (행동 반복·위기 이벤트)
  weight?: number; // 랜덤 풀 가중치
  repeat?: boolean;
  choices: Choice[];
}

export interface Category {
  icon: string;
  color: string;
  rate: number; // 이 카테고리의 랜덤·자동 이벤트 빈도 배율
}

export type Art = [bg: string, emoji: string, caption: string];

export interface ActionDef {
  id: string;
  kind: 'train' | 'life' | 'agency';
  icon: string;
  name: string;
  desc: string;
  when?: Cond;
  gain?: Fx; // 성장 배율이 적용되는 스탯 기본치
  fx?: Fx; // 그대로 적용
  physical?: boolean; // 부상 중 불가, 체력이 낮으면 부상 위험
  event?: string; // agency: 누르면 바로 열리는 이벤트
  cool?: number; // agency: 재사용 대기 턴
}

// 경기에서 쓰는 기술. learn이 없으면 처음부터 쓸 수 있는 기본기다.
export interface Move {
  id: string;
  kind: string; // shot | pass | dribble | keep | press
  icon: string;
  name: string;
  desc: string;
  stats: Fx;
  rel: number;
  trait?: string;
  only?: string[]; // 이 태그가 붙은 상황에서만 쓸 수 있다
  learn?: { action: string; n: number }; // 이 행동을 n번 하면 습득
  passive?: { kind?: string; tag?: string; add: number }; // 선택지가 아니라 판정 보정
  goal?: number; // 성공했을 때 골로 이어질 확률
  assist?: number; // 성공했을 때 도움으로 이어질 확률
  rate: number; // 성공 시 평점 변화
  miss: number; // 실패 시 평점 변화 (음수)
  fame?: number;
  ok: string;
  fail: string;
}

export interface Situation {
  id: string;
  when?: Cond;
  slot?: 'sub' | 'last'; // 교체 투입 전용 / 경기 막판 전용
  title: string;
  text: string;
  kinds: string[]; // 가능한 기술 종류
  tags?: string[];
  mod?: Fx; // 종류별 난이도 보정
}

export interface StageDef {
  name: string;
  league: string; // Pack.world.leagues의 id
  teams: [number, string][]; // [이 나이부터, 팀 이름]
  kit: [string, string]; // [상의, 하의]
  curve: [number, number][]; // [나이, 경쟁 수준] 선형 보간
  facility: number;
  opps: string[];
}

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface EndingDef {
  id: string;
  tier: Tier;
  title: string;
  text: string;
  hint: string;
  final?: boolean; // 마지막 턴에 조건 순서대로 판정
  when?: Cond;
  real?: boolean;
}

export interface Npc {
  id: string;
  name: string;
  role: string;
  desc: string;
  face: string;
  rel?: string;
  when?: Cond;
}

export interface Perk {
  id: string;
  name: string;
  desc: string;
  unlock: number; // 필요한 엔딩 수집 개수
  fx?: Fx;
  mult?: Fx;
  pa?: number;
}

// 특정 턴에 도달하면 조건 순서대로 판정해 스테이지를 옮기거나 엔딩을 낸다 (프로 진입 등)
export interface Gate {
  at: [number, number]; // [연도, 분기]
  rules: { when?: Cond; stage?: string; end?: string; set?: Fx; flag?: string[]; news?: string }[];
}

export interface Milestone {
  id: string; // 레전드 도감 카드 id (삽화는 Pack.art[id])
  year: number;
  text: string;
  when: Cond;
}

export interface World {
  cohort: string;
  leagues: { id: string; name: string; level: number; pay?: number }[]; // pay: 실력 대비 돈을 더 주는 리그의 배율
  par: [number, number][]; // 나이별 평범한 유망주의 OVR
  real: [number, number][]; // 실제 세계선의 추정 OVR
}

export interface Pack {
  id: string;
  title: string;
  hero: string;
  tagline: string;
  disclaimer: string;
  intro: string[];
  startYear: number;
  startAge: number;
  given: string; // 이름만 (부를 때)
  foot: string; // 주발 — 다른 선수 팩을 만들 때 문구를 바꾸는 데 쓴다
  calendar: [number, number][]; // [이 나이부터, 1년에 몇 턴] — 시기마다 턴 길이가 다르다
  endAge: number; // 이 나이까지 진행한다 (은퇴)
  slots: number;
  eventRate: number;
  realBonus: number; // 실제 커리어와 같은 선택의 판정 보정 (세계선 수렴)
  stats: { key: string; label: string }[];
  labels: Record<string, string>;
  hidden: string[]; // 변화를 플레이어에게 보여주지 않는 변수
  negative: string[]; // 오를수록 나쁜 변수
  init: Fx;
  initStage: string;
  pa: [number, number];
  growth: [number, number][]; // [나이, 배율] 선형 보간
  gainScale: number; // 훈련 성장량 전체 배율 (밸런스 손잡이)
  matchHard: number; // 경기 판정 난이도 보정 (밸런스 손잡이)
  checkHard: number; // 이벤트 판정 난이도 보정 — 스테이지 수준에 견주는 판정(rel)에만 붙는다
  moveSlots: [number, number]; // 경기 한 장면에 나오는 선택지 수 [기본, 최대]
  // 프로 커리어: flag가 생기면 연봉·계약·선수 등급이 굴러가고, every턴마다 에이전시 미팅이 먼저 온다
  career: {
    flag: string;
    salary: string; // 해마다 여는 연봉 협상 이벤트
    fa: string; // 계약이 끝난 해에 여는 FA 시장 이벤트
    every: number;
    tiers: [number, string][]; // [최소 등급 점수, 이름] 내림차순
    news: string; // 계약 기사 문구
  };
  // 조건이 공개되지 않은 최고 엔딩과, 그 조건을 하나씩 암시하는 단서
  golden: { ending: string; clues: { id: string; title: string; text: string; when: Cond }[] };
  aptitude: Fx; // 스탯별 성장 적성, 비스탯은 증가량 배율
  traits: Fx;
  baseWeights: Fx;
  positions: Record<string, { name: string; w: Fx; bonus: string[] }>;
  stages: Record<string, StageDef>;
  actions: ActionDef[];
  moves: Move[];
  situations: Situation[];
  cats: Record<string, Category>;
  events: GameEvent[];
  art: Record<string, Art>;
  endings: EndingDef[];
  gates: Gate[];
  drift: { when?: Cond; fx: Fx; perTurn?: boolean }[]; // 기본은 분기당 변화량, perTurn이면 턴당
  npcs: Npc[];
  perks: Perk[];
  world: World;
  realRoute: Milestone[];
  comments: { good: string[]; bad: string[] };
  headlines: { goal: string[]; assist: string[]; good: string[]; bad: string[] };
  text: { injured: string; benched: string; dropped: string; goal: string; saved: string; assist: string; coach: [number, string][] };
  titles: [number, string][]; // [최소 점수, 칭호] 내림차순
  scoring: {
    ovr: number;
    vars: Fx;
    goal: number;
    assist: number;
    recCap: number;
    tier: Record<Tier, number>;
    flags: Fx;
  };
}

export interface Result {
  ok: boolean;
  label: string;
  text: string;
  d: Fx;
  p: number | null;
  skill?: string;
  signed?: { salary: number; until: number }; // 이 선택으로 맺은 계약
}

export interface Report {
  id: string;
  d: Fx;
  crit: boolean;
  tired: boolean;
  learned: string[];
}

export interface NewsItem {
  turn: number;
  text: string;
  tone: 'good' | 'bad';
  comment?: string;
}

export interface HistoryItem {
  turn: number;
  title: string;
  label: string;
  real?: boolean;
}

export interface Play {
  sit: string;
  move: string;
  ok: boolean;
  p: number;
  text: string;
  goal: boolean;
  assist: boolean;
}

// 경기 기록지
export interface Sheet {
  gf: number;
  ga: number;
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
  shots: [number, number]; // [슛, 유효슛]
  passes: [number, number]; // [성공, 시도]
  dribbles: [number, number]; // [성공, 시도]
  keyPasses: number;
  mom: boolean;
  coach: string; // 감독 한마디
  comment: string; // 팬 댓글
  d: Fx;
  scout: number; // 등급 점수 변화 (화면에는 방향만 보여 준다)
}

export interface MatchState {
  opp: string;
  sub: boolean;
  sits: string[];
  offers: string[][]; // 장면마다 이번에 고를 수 있는 기술 (슬롯 수만큼 무작위)
  plays: Play[];
  shown: number; // 결과까지 확인한 장면 수
  sheet?: Sheet;
}

export interface MatchLog {
  turn: number;
  team: string;
  opp: string;
  gf: number;
  ga: number;
  rating: number;
  goals: number;
  assists: number;
}

export type Phase = 'plan' | 'report' | 'match' | 'sheet' | 'scene' | 'ending';

export interface GameState {
  packId: string;
  rng: number;
  turn: number;
  phase: Phase;
  stage: string;
  v: Fx;
  mult: Fx;
  pa: number;
  pos: string | null;
  perk: string | null;
  flags: Record<string, string>; // 플래그 → 생긴 계기("2010년 「…」")
  counts: Fx; // 행동 id → 한 횟수
  skills: string[];
  slots: number; // 경기 한 장면에 나오는 선택지 수
  cool: Fx; // 에이전시 행동 id → 다시 쓸 수 있는 턴
  agencyTurn: number; // 마지막으로 에이전시 행동을 한 턴
  salary: number; // 연봉 (억 원). 프로가 되기 전에는 0
  earned: number; // 통산 수입 (억 원)
  until: number; // 계약이 끝나는 해
  fa: boolean; // 계약이 끝나 시장에 나와 있다
  pays: { year: number; team: string; salary: number }[]; // 계약 이력
  seen: string[];
  evCount: number; // 이번 턴에 본 이벤트 수
  revived: boolean; // 되돌리기를 이미 썼는가
  queue: string[];
  injured: number;
  rec: { apps: number; goals: number; assists: number; rating: number; mom: number };
  log: MatchLog[];
  history: HistoryItem[];
  news: NewsItem[];
  report: Report[];
  match: MatchState | null;
  cur: { id: string; back?: boolean; result?: Result } | null; // 열려 있는 이벤트. back: 에이전시에서 열림
  note: string | null;
  pendingEnd: string | null;
  ending: string | null;
  score: number;
}
