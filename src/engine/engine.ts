// 게임 규칙. 모든 공개 함수는 (pack, state) → 새 state 인 순수 함수다.
import type { Choice, Cond, Fx, GameEvent, GameState, Move, Outcome, Pack, Sheet, Situation } from './types';

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const clone = (s: GameState): GameState => structuredClone(s);

// mulberry32 — 시드가 state 안에 있어 세이브/로드·테스트에서 결과가 재현된다
function rand(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T>(s: GameState, xs: T[]): T => xs[Math.floor(rand(s) * xs.length)];

export function interp(curve: [number, number][], x: number): number {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    if (x <= curve[i][0]) {
      const [x0, y0] = curve[i - 1];
      const [x1, y1] = curve[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return curve[curve.length - 1][1];
}

// 턴 길이는 시기마다 다르다 (유소년은 반기, 전성기는 분기). 팩의 calendar로 전체 일정을 펼친다.
export interface Slot {
  year: number;
  age: number;
  part: number;
  per: number;
}
const lines = new WeakMap<Pack, Slot[]>();
export function timeline(p: Pack): Slot[] {
  let t = lines.get(p);
  if (!t) {
    t = [];
    for (let age = p.startAge; age <= p.endAge; age++) {
      let per = p.calendar[0][1];
      for (const [from, n] of p.calendar) if (age >= from) per = n;
      for (let part = 0; part < per; part++) t.push({ year: p.startYear + age - p.startAge, age, part, per });
    }
    lines.set(p, t);
  }
  return t;
}
export const totalTurns = (p: Pack) => timeline(p).length;
export const slotAt = (p: Pack, turn: number) => timeline(p)[Math.max(0, Math.min(turn, timeline(p).length - 1))];
const slot = (p: Pack, s: GameState) => slotAt(p, s.turn);
export const yearOf = (p: Pack, s: GameState) => slot(p, s).year;
export const ageOf = (p: Pack, s: GameState) => slot(p, s).age;
// 이번 턴이 몇 분기 분량인가
export const spanOf = (p: Pack, s: GameState) => 4 / slot(p, s).per;
export const partName = (x: Slot) => (x.per === 4 ? x.part + 1 + '분기' : x.per === 2 ? (x.part ? '하반기' : '상반기') : '');
const ageExact = (p: Pack, s: GameState) => slot(p, s).age + slot(p, s).part / slot(p, s).per;
// [연도, 분기]가 속한 턴 번호. 일정 밖이면 -1
export const turnAt = (p: Pack, at: [number, number]) => timeline(p).findIndex((x) => x.year === at[0] && x.part === Math.floor(((at[1] - 1) * x.per) / 4));

export function teamOf(p: Pack, s: GameState): string {
  const age = ageOf(p, s);
  let name = '';
  for (const [from, n] of p.stages[s.stage].teams) if (age >= from) name = n;
  return name;
}

const isStat = (p: Pack, k: string) => p.stats.some((st) => st.key === k);

export function ovr(p: Pack, s: GameState): number {
  const w = s.pos ? p.positions[s.pos].w : p.baseWeights;
  let sum = 0;
  let tot = 0;
  for (const k in w) {
    sum += (s.v[k] ?? 0) * w[k];
    tot += w[k];
  }
  return sum / tot;
}

export function getVar(p: Pack, s: GameState, k: string): number {
  if (k === 'ovr') return ovr(p, s);
  if (k === 'age') return ageOf(p, s);
  if (k.startsWith('n_')) return s.counts[k.slice(2)] ?? 0;
  if (k === 'salary') return s.salary;
  if (k === 'earned') return s.earned;
  if (k === 'contract') return s.salary > 0 ? s.until - yearOf(p, s) : 0;
  if (k === 'skills') return s.skills.length;
  if (k === 'clubs') return new Set(s.pays.map((x) => x.team)).size;
  return s.v[k] ?? 0;
}

export function test(p: Pack, s: GameState, c?: Cond): boolean {
  if (!c) return true;
  if (c.stage && !c.stage.includes(s.stage)) return false;
  if (c.age) {
    const a = ageOf(p, s);
    if (a < c.age[0] || a > c.age[1]) return false;
  }
  if (c.has && !c.has.every((f) => f in s.flags)) return false;
  if (c.any && !c.any.some((f) => f in s.flags)) return false;
  if (c.not && c.not.some((f) => f in s.flags)) return false;
  if (c.away && c.away.includes(s.stage)) return false;
  if (c.min) for (const k in c.min) if (getVar(p, s, k) < c.min[k]) return false;
  if (c.max) for (const k in c.max) if (getVar(p, s, k) > c.max[k]) return false;
  return true;
}

// 조건이 요구하는 플래그가 언제 생겼는지 — UI의 "나비효과" 표시용
export function butterflies(s: GameState, ...conds: (Cond | undefined)[]): string[] {
  const out = new Set<string>();
  for (const c of conds) for (const f of [...(c?.has ?? []), ...(c?.any ?? [])]) if (s.flags[f]) out.add(s.flags[f]);
  return [...out];
}

export const difficulty = (p: Pack, s: GameState) => interp(p.stages[s.stage].curve, ageExact(p, s));

// 변화를 적용하고 실제로 바뀐 양을 out에 누적한다.
// 비스탯 변수의 증가분에는 s.mult 배율이 붙는다 (예: 스트레스를 덜 받는 특전).
function applyFx(p: Pack, s: GameState, fx: Fx, out: Fx) {
  for (const k in fx) {
    const stat = isStat(p, k);
    let d = fx[k];
    if (d > 0 && !stat && s.mult[k] != null) d *= s.mult[k];
    const old = s.v[k] ?? 0;
    const nv = clamp(old + d, stat ? 1 : 0, stat ? 99 : 100);
    s.v[k] = nv;
    if (nv !== old) out[k] = (out[k] ?? 0) + (nv - old);
  }
}

function applySet(s: GameState, set: Fx | undefined, out: Fx) {
  for (const k in set) {
    const old = s.v[k] ?? 0;
    s.v[k] = set[k];
    if (set[k] !== old) out[k] = (out[k] ?? 0) + (set[k] - old);
  }
}

function pushNews(s: GameState, text: string, tone: 'good' | 'bad', comment?: string) {
  s.news.unshift({ turn: s.turn, text, tone, comment });
  if (s.news.length > 40) s.news.length = 40;
}

/* ───────── 프로 커리어: 선수 등급, 연봉, 계약 ───────── */

export const careerOn = (p: Pack, s: GameState) => p.career.flag in s.flags;

// 억 원 단위 금액을 읽기 좋게 다듬는다
const money = (x: number) => (x >= 10 ? Math.round(x) : Math.max(0.3, Math.round(x * 10) / 10));
export const won = (x: number) =>
  x >= 1 ? `${x >= 10 ? Math.round(x).toLocaleString('ko-KR') : x.toFixed(1)}억 원` : `${Math.round(x * 10000).toLocaleString('ko-KR')}만 원`;

const leagueOf = (p: Pack, stage: string) => p.world.leagues.find((l) => l.id === p.stages[stage].league)!;
const leagueBase = (l: { level: number; pay?: number }) => 10 ** ((l.level - 60) / 18) * (l.pay ?? 1);

// 선수 등급 (유망주 → … → 레전드). 프로가 되기 전에는 맨 아래 등급이다
export function tierName(p: Pack, s: GameState): string {
  const t = careerOn(p, s) ? (s.v.tier ?? 0) : 0;
  for (const [min, name] of p.career.tiers) if (t >= min) return name;
  return p.career.tiers[p.career.tiers.length - 1][1];
}

// 그 팀(스테이지)에서 지금의 나에게 시장이 매기는 연봉 (억 원)
export function wageAt(p: Pack, s: GameState, stage = s.stage): number {
  const age = ageOf(p, s);
  const ageK = age <= 20 ? 0.7 : age <= 23 ? 0.9 : age <= 30 ? 1 : age <= 32 ? 0.85 : 0.65;
  return leagueBase(leagueOf(p, stage)) * (0.5 + ((s.v.tier ?? 0) / 25) ** 1.5) * (1 + (s.v.fame ?? 0) / 400) * ageK;
}

// 계약서에 사인한다. mult: 시장가 대비 배율, years: 0이면 계약 기간은 그대로. FA는 이적료가 없는 만큼 더 받는다
function sign(p: Pack, s: GameState, mult: number, years: number, floor = 0) {
  s.salary = money(Math.max(wageAt(p, s) * mult * (s.fa ? 1.2 : 1), floor));
  if (years > 0 || s.fa) s.until = yearOf(p, s) + Math.max(1, years);
  s.fa = false;
  delete s.flags.fa;
  s.agencyTurn = Math.max(s.agencyTurn, s.turn);
  s.pays.push({ year: yearOf(p, s), team: teamOf(p, s), salary: s.salary });
  if (s.pays.length > 40) s.pays.shift();
}

// 이 선택지를 고르면 받게 될 연봉과 계약 기간 (이적·계약 선택지에만 값이 있다)
export function offerOf(p: Pack, s: GameState, c: Choice): { salary: number; years: number } | null {
  const o = c.ok;
  if (!careerOn(p, s) || (o.pay == null && (!o.stage || o.stage === s.stage))) return null;
  const k = s.fa ? 1.2 : 1;
  const w = wageAt(p, s, o.stage ?? s.stage) * k;
  return { salary: money(o.pay != null ? w * o.pay : Math.max(w, s.salary * 0.6)), years: o.term ?? (o.pay != null ? 2 : 3) }; // years 0: 계약 기간은 그대로
}

// 등급 점수는 최근 경기의 "급"을 따라 움직인다: 뛰는 무대 + 평점 + 어려운 기술을 성공시킨 정도
function tierStep(p: Pack, s: GameState, perf: number): number {
  const old = s.v.tier ?? 0;
  const cap = careerOn(p, s) ? 100 : 19;
  s.v.tier = clamp(old + Math.min(0.5, 0.12 * spanOf(p, s)) * (clamp(perf, 0, cap) - old), 0, 100);
  s.v.tpeak = Math.max(s.v.tpeak ?? 0, s.v.tier);
  return s.v.tier - old;
}
const stageClass = (p: Pack, s: GameState) => clamp((difficulty(p, s) - 45) * 1.6, 0, 70);

// 황금 루트 단서: 조건을 채운 것만 내용이 드러난다
export const clues = (p: Pack, s: GameState) => p.golden.clues.map((c) => ({ ...c, done: test(p, s, c.when) }));

// 화면 문구의 {토큰}을 지금 상태로 채운다
export const fillText = (p: Pack, s: GameState, t: string) =>
  t
    .replaceAll('{hero}', p.hero)
    .replaceAll('{team}', teamOf(p, s))
    .replaceAll('{age}', String(ageOf(p, s)))
    .replaceAll('{salary}', won(s.salary))
    .replaceAll('{market}', won(money(wageAt(p, s))))
    .replaceAll('{offer}', won(money(wageAt(p, s) * 0.9)))
    .replaceAll('{earned}', won(s.earned))
    .replaceAll('{until}', String(s.until))
    .replaceAll('{tier}', tierName(p, s));
const fill = fillText;

export function newGame(p: Pack, seed: number, perkId: string | null = null): GameState {
  const s: GameState = {
    packId: p.id,
    rng: seed | 0,
    turn: 0,
    phase: 'plan',
    stage: p.initStage,
    v: { ...p.init },
    mult: { ...p.aptitude },
    pa: 0,
    pos: null,
    perk: perkId,
    flags: {},
    counts: {},
    skills: [],
    slots: p.moveSlots[0],
    cool: {},
    agencyTurn: -1,
    salary: 0,
    earned: 0,
    until: 0,
    fa: false,
    pays: [],
    seen: [],
    evCount: 0,
    revived: false,
    queue: [],
    injured: 0,
    rec: { apps: 0, goals: 0, assists: 0, rating: 0, mom: 0 },
    log: [],
    history: [],
    news: [],
    report: [],
    match: null,
    cur: null,
    note: null,
    pendingEnd: null,
    ending: null,
    score: 0,
  };
  s.pa = Math.round(p.pa[0] + rand(s) * (p.pa[1] - p.pa[0]));
  const perk = p.perks.find((x) => x.id === perkId);
  if (perk) {
    if (perk.fx) applyFx(p, s, perk.fx, {});
    if (perk.mult) for (const k in perk.mult) s.mult[k] = (s.mult[k] ?? 1) * perk.mult[k];
    if (perk.pa) s.pa += perk.pa;
  }
  return s;
}

export function availableActions(p: Pack, s: GameState) {
  return p.actions
    .filter((a) => a.kind !== 'agency' && test(p, s, a.when))
    .map((a) => ({ action: a, disabled: !!a.physical && s.injured > 0 }));
}

// 에이전시 행동: 한 분기에 하나, 행동마다 재사용 대기가 있다
export function agencyActions(p: Pack, s: GameState) {
  return p.actions
    .filter((a) => a.kind === 'agency' && test(p, s, a.when))
    .map((a) => ({ action: a, wait: Math.max(0, (s.cool[a.id] ?? 0) - s.turn), used: s.agencyTurn === s.turn }));
}

// 프로 구간(분기 턴)에는 every턴마다 에이전시 미팅이 일정보다 먼저다
export function agencyDue(p: Pack, s: GameState): boolean {
  return (
    s.phase === 'plan' &&
    careerOn(p, s) &&
    slot(p, s).per >= 4 &&
    s.turn - s.agencyTurn >= p.career.every &&
    agencyActions(p, s).some((a) => a.wait === 0 && !a.used)
  );
}

export function startAgency(p: Pack, s0: GameState, id: string): GameState {
  const s = clone(s0);
  const x = agencyActions(p, s).find((a) => a.action.id === id);
  if (s.phase !== 'plan' || !x || x.wait > 0 || x.used || !x.action.event) return s;
  s.cool[id] = s.turn + (x.action.cool ?? 4);
  s.agencyTurn = s.turn;
  s.counts[id] = (s.counts[id] ?? 0) + 1;
  s.cur = { id: x.action.event, back: true };
  s.phase = 'scene';
  return s;
}

// 일정 실행: 행동을 순서대로 적용하고 훈련 결과 리포트를 남긴다
export function runPlan(p: Pack, s0: GameState, ids: string[]): GameState {
  const s = clone(s0);
  if (agencyDue(p, s)) return s;
  const sp = spanOf(p, s);
  const g = p.gainScale * sp * interp(p.growth, ageOf(p, s)) * (s.pa / 175) * p.stages[s.stage].facility;
  const cap = Math.min(99, s.pa / 2 + 2);
  const bonus = s.pos ? p.positions[s.pos].bonus : [];
  s.report = [];
  s.note = null;
  for (const id of ids) {
    const a = p.actions.find((x) => x.id === id);
    if (!a || a.kind === 'agency') continue;
    const d: Fx = {};
    let cond = 0.55 + (0.45 * s.v.stamina) / 100;
    if (s.v.stress > 70) cond *= 0.8;
    if ((s.v.joy ?? 100) < 35) cond *= 0.8; // 언해피: 마음이 떠나면 훈련도 겉돈다
    const tired = !!a.physical && s.v.stamina < 25;
    const crit = !!a.gain && rand(s) < 0.1;
    if (a.gain) {
      for (const k in a.gain) {
        const dim = Math.max(0.12, 1 - (s.v[k] / cap) ** 2);
        const delta =
          a.gain[k] * g * (s.mult[k] ?? 1) * (bonus.includes(k) ? 1.2 : 1) * cond * dim * (crit ? 2 : 1) * (0.85 + rand(s) * 0.3);
        applyFx(p, s, { [k]: delta }, d);
      }
    }
    if (a.fx) applyFx(p, s, a.fx, d);
    if (tired) applyFx(p, s, { injury: 8 }, d);
    // 같은 행동을 반복하면 새 기술이 열린다
    const n = (s.counts[id] = (s.counts[id] ?? 0) + sp);
    const learned = p.moves.filter((m) => m.learn?.action === id && n >= m.learn.n && !s.skills.includes(m.id)).map((m) => m.id);
    s.skills.push(...learned);
    s.report.push({ id, d, crit, tired, learned });
  }
  s.phase = 'report';
  return s;
}

/* ───────── 경기 ───────── */

const moveById = (p: Pack, id: string) => p.moves.find((m) => m.id === id)!;
const sitById = (p: Pack, id: string) => p.situations.find((x) => x.id === id)!;

function startMatch(p: Pack, s: GameState): GameState {
  s.match = null;
  s.evCount = 0;
  if (s.injured > 0) {
    s.note = p.text.injured;
    if (careerOn(p, s)) tierStep(p, s, stageClass(p, s) - 8);
    return toEvent(p, s);
  }
  if (s.v.coach < 10) {
    applyFx(p, s, { stress: 6, joy: -5 }, {});
    s.note = p.text.dropped;
    if (careerOn(p, s)) tierStep(p, s, stageClass(p, s) - 14);
    return toEvent(p, s);
  }
  const sub = s.v.coach < 30 && rand(s) < 0.65;
  const elig = p.situations.filter((x) => test(p, s, x.when));
  const open = elig.filter((x) => !x.slot);
  if (!open.length) return toEvent(p, s);
  let sits: string[];
  if (sub) {
    const pool = elig.filter((x) => x.slot === 'sub');
    sits = [pick(s, pool.length ? pool : open).id];
    s.note = p.text.benched;
  } else {
    const a = pick(s, open);
    const last = elig.filter((x) => x.slot === 'last');
    const rest = open.filter((x) => x.id !== a.id);
    const b = last.length && rand(s) < 0.4 ? pick(s, last) : pick(s, rest.length ? rest : open);
    sits = [a.id, b.id];
  }
  s.match = { opp: pick(s, p.stages[s.stage].opps), sub, sits, offers: sits.map((id) => offer(p, s, sitById(p, id))), plays: [], shown: 0 };
  s.phase = 'match';
  return s;
}

// 이 장면에서 쓸 수 있는 기술: 기본기 + 배운 기술
const usable = (p: Pack, s: GameState, sit: Situation) =>
  p.moves.filter((m) => !m.passive && sit.kinds.includes(m.kind) && (!m.learn || s.skills.includes(m.id)) && (!m.only || m.only.some((t) => sit.tags?.includes(t))));

// 그중 슬롯 수만큼만 무작위로 내놓는다. 기본기 하나는 꼭 낀다.
function offer(p: Pack, s: GameState, sit: Situation): string[] {
  const all = usable(p, s, sit);
  if (all.length <= s.slots) return all.map((m) => m.id);
  const bag = [...all];
  const out: Move[] = [];
  while (out.length < s.slots) out.push(bag.splice(Math.floor(rand(s) * bag.length), 1)[0]);
  if (out.every((m) => m.learn)) out[out.length - 1] = pick(s, all.filter((m) => !m.learn));
  return out.map((m) => m.id);
}

// 선택지 슬롯을 하나 늘린다 (광고 보상)
export function addSlot(p: Pack, s0: GameState): GameState {
  const s = clone(s0);
  s.slots = Math.min(p.moveSlots[1], s.slots + 1);
  return s;
}

function moveChance(p: Pack, s: GameState, sit: Situation, m: Move): number {
  let sum = 0;
  let tot = 0;
  for (const k in m.stats) {
    sum += getVar(p, s, k) * m.stats[k];
    tot += m.stats[k];
  }
  let score = sum / tot + (m.trait ? (p.traits[m.trait] ?? 0) : 0) + (s.v.stamina - 50) / 12;
  for (const id of s.skills) {
    const ps = moveById(p, id)?.passive;
    if (ps && (!ps.kind || ps.kind === m.kind) && (!ps.tag || sit.tags?.includes(ps.tag))) score += ps.add;
  }
  // 동료들과 사이가 좋으면 패스가 통하고, 나쁘면 받아 주는 사람이 없다
  if (m.kind === 'pass') score += clamp(((s.v.mates ?? 50) - 50) / 10, -4, 4);
  const target = difficulty(p, s) + p.matchHard + m.rel + (sit.mod?.[m.kind] ?? 0);
  return clamp(0.5 + (score - target) / 45, 0.05, 0.95);
}

// 지금 선택을 기다리는 경기 장면 (결과를 보여주는 중이면 null)
export function currentSit(p: Pack, s: GameState): Situation | null {
  const mt = s.match;
  if (!mt || mt.sheet || mt.plays.length > mt.shown || mt.plays.length >= mt.sits.length) return null;
  return sitById(p, mt.sits[mt.plays.length]);
}

// 이번 장면에 나온 선택지와 성공률
export function movesFor(p: Pack, s: GameState): { move: Move; p: number }[] {
  const sit = currentSit(p, s);
  if (!sit) return [];
  const ids = s.match!.offers[s.match!.plays.length];
  return p.moves.filter((m) => ids.includes(m.id)).map((m) => ({ move: m, p: moveChance(p, s, sit, m) }));
}

export function playMove(p: Pack, s0: GameState, id: string): GameState {
  const s = clone(s0);
  const sit = currentSit(p, s);
  const x = movesFor(p, s).find((o) => o.move.id === id);
  if (!sit || !x || !s.match) return s;
  const m = x.move;
  const ok = rand(s) < x.p;
  let goal = false;
  let assist = false;
  if (ok) {
    if (m.goal && rand(s) < m.goal) goal = true;
    else if (m.assist && rand(s) < m.assist) assist = true;
  }
  // 슛은 성공해도 골키퍼에게 막힐 수 있다
  const tail = goal ? p.text.goal : assist ? p.text.assist : m.kind === 'shot' ? p.text.saved : '';
  const text = ok ? `${m.ok} ${tail}`.trim() : m.fail;
  s.match.plays.push({ sit: sit.id, move: m.id, ok, p: x.p, text, goal, assist });
  return s;
}

function makeSheet(p: Pack, s: GameState) {
  const mt = s.match!;
  const D = difficulty(p, s);
  const o = ovr(p, s);
  const minutes = mt.sub ? 18 + Math.floor(rand(s) * 15) : 90;
  const frac = minutes / 90;
  let rating = 6.0 + clamp((o - D) / 15, -0.6, 0.6) + (rand(s) - 0.5) * 0.5;
  let goals = 0;
  let assists = 0;
  let key = 0;
  let shots = 0;
  let onT = 0;
  let dTry = 0;
  let dWon = 0;
  let fame = 0;
  let leak = 0;
  let bold = 0; // 숨은 손익: 어려운 기술일수록 성공의 값이 크고, 실패하면 그만큼 잃는다
  const fx: Fx = { iq: 0.15 * frac, men: 0.1 * frac };
  for (const pl of mt.plays) {
    const m = moveById(p, pl.move);
    rating += (pl.ok ? m.rate : m.miss) * 0.65;
    bold += pl.ok ? m.rate * (1.3 - pl.p) * 16 : m.miss * 8;
    if (pl.goal) {
      goals++;
      rating += 0.6;
    }
    if (pl.assist) {
      assists++;
      rating += 0.5;
    }
    if (m.kind === 'shot' || pl.goal) {
      shots++;
      if (pl.ok) onT++;
    }
    if (m.kind === 'pass' && pl.ok) key++;
    if (m.kind === 'dribble') {
      dTry++;
      if (pl.ok) dWon++;
    }
    if (m.kind === 'press' && !pl.ok) leak++;
    if (pl.ok) {
      const main = Object.keys(m.stats)[0];
      if (isStat(p, main)) fx[main] = (fx[main] ?? 0) + 0.2;
      fame += m.fame ?? 0;
    }
  }
  // 선택하지 않은 나머지 시간의 기록
  const pTry = Math.round(frac * (22 + s.v.iq / 4 + rand(s) * 12));
  const pMade = Math.round(pTry * clamp(0.62 + (s.v.pas - D) / 120 + (rand(s) - 0.5) * 0.08, 0.5, 0.97));
  shots += Math.floor(rand(s) * 2.3 * frac);
  const extra = Math.floor(rand(s) * 3.5 * frac);
  dTry += extra;
  dWon += Math.round(extra * clamp(0.5 + (s.v.dri - D) / 60, 0.2, 0.9));
  const t = rand(s);
  const gf = goals + assists + (t < 0.45 ? 0 : t < 0.8 ? 1 : 2);
  const r = rand(s);
  const ga = (r < 0.35 ? 0 : r < 0.75 ? 1 : r < 0.95 ? 2 : 3) + leak;
  rating += gf > ga ? 0.3 : gf < ga ? -0.2 : 0;
  rating = clamp(Math.round(rating * 10) / 10, 3, 10);
  const mom = rating >= 8.5 && gf >= ga;
  const pro = ageOf(p, s) >= 17 ? 1.5 : 1;

  fx.coach = clamp((rating - 6.7) * 5, -8, 8) * (mt.sub ? 0.7 : 1);
  fx.fame = (goals * 2 + assists + (mom ? 3 : 0) + fame) * pro - (rating < 5 ? 1 : 0);
  if (rating < 5.5) fx.stress = 6;
  else if (rating >= 8) fx.stress = -5;
  if (ageOf(p, s) >= 14) fx.nat = rating >= 8 ? 2 : rating >= 7 ? 0.7 : 0;
  fx.joy = (rating >= 7.5 ? 3 : rating < 5.5 ? -3 : 0) - (mt.sub ? 2 : 0);
  const d: Fx = {};
  applyFx(p, s, fx, d);

  const good = rating >= 6.5;
  const coach = p.text.coach.find(([min]) => rating >= min)?.[1] ?? '';
  const comment = pick(s, good ? p.comments.good : p.comments.bad);
  const scout = tierStep(p, s, stageClass(p, s) + (rating - 6.5) * 8 + clamp(bold, -10, 18) - (mt.sub ? 5 : 0));
  const sheet: Sheet = { gf, ga, minutes, rating, goals, assists, shots: [shots, onT], passes: [pMade, pTry], dribbles: [dWon, dTry], keyPasses: key, mom, coach, comment, d, scout };
  mt.sheet = sheet;

  s.rec.apps++;
  s.rec.goals += goals;
  s.rec.assists += assists;
  s.rec.rating += rating;
  if (mom) s.rec.mom++;
  s.log.unshift({ turn: s.turn, team: teamOf(p, s), opp: mt.opp, gf, ga, rating, goals, assists });
  if (s.log.length > 12) s.log.length = 12;

  // 눈에 띄는 경기는 기사가 된다. 인지도가 높을수록 자주.
  if ((rating >= 8 || rating <= 5 || goals > 0) && rand(s) < 0.3 + (s.v.fame ?? 0) / 150) {
    const h = p.headlines;
    const pool = rating <= 5 ? h.bad : goals ? h.goal : assists ? h.assist : h.good;
    pushNews(s, fill(p, s, pick(s, pool)), rating <= 5 ? 'bad' : 'good', comment);
  }
  s.phase = 'sheet';
}

/* ───────── 이벤트 ───────── */

function pickEvent(p: Pack, s: GameState, extra = false): GameEvent | null {
  const byId = (id: string) => p.events.find((e) => e.id === id);
  const rate = (e: GameEvent) => p.cats[e.cat]?.rate ?? 1;
  const fresh = (e: GameEvent) => (e.repeat ? e.id !== s.cur?.id : !s.seen.includes(e.id));
  // 1) 때가 된 스토리 이벤트 (다른 이벤트에 밀려도 1년 안에는 발생)
  const story = p.events.find((e) => {
    if (!e.at || s.seen.includes(e.id)) return false;
    const due = turnAt(p, e.at);
    const late = s.turn - due;
    return due >= 0 && late >= 0 && late < Math.max(2, slot(p, s).per) && test(p, s, e.when);
  });
  if (story) return story;
  // 2) 지난 선택이 예약한 연쇄 이벤트
  while (s.queue.length) {
    const e = byId(s.queue.shift()!);
    if (e) return e;
  }
  // 3) 상태·행동 반복이 부르는 이벤트 (번아웃, 부상, 반복 행동의 결과 등)
  for (const e of p.events) if (e.auto && fresh(e) && test(p, s, e.when) && rand(s) < e.auto * rate(e)) return e;
  // 4) 랜덤 풀
  if (rand(s) > (extra ? 0.6 : p.eventRate)) return null;
  const pool = p.events.filter((e) => e.weight && fresh(e) && test(p, s, e.when));
  let total = pool.reduce((a, e) => a + e.weight! * rate(e), 0);
  if (!total) return null;
  total *= rand(s);
  for (const e of pool) {
    total -= e.weight! * rate(e);
    if (total <= 0) return e;
  }
  return pool[pool.length - 1];
}

function toEvent(p: Pack, s: GameState): GameState {
  const e = pickEvent(p, s);
  if (!e) return endTurn(p, s);
  s.cur = { id: e.id };
  s.phase = 'scene';
  return s;
}

// 커리어를 끝까지 마쳤을 때의 엔딩: final 엔딩을 위에서부터 판정
function finalEnding(p: Pack, s: GameState): string {
  const gold = p.golden.ending;
  if (p.golden.clues.length && clues(p, s).every((c) => c.done) && p.endings.some((x) => x.id === gold)) return gold;
  const e = p.endings.find((x) => x.final && x.id !== gold && test(p, s, x.when));
  return e ? e.id : p.endings[p.endings.length - 1].id;
}

function finish(p: Pack, s: GameState, id: string): GameState {
  s.ending = id;
  s.phase = 'ending';
  s.cur = null;
  s.match = null;
  s.score = score(p, s);
  return s;
}

function endTurn(p: Pack, s: GameState): GameState {
  const sp = spanOf(p, s);
  for (const dr of p.drift) {
    if (!test(p, s, dr.when)) continue;
    const fx: Fx = {};
    for (const k in dr.fx) fx[k] = dr.fx[k] * (dr.perTurn ? 1 : sp);
    applyFx(p, s, fx, {});
  }
  s.v.peak = Math.max(s.v.peak ?? 0, ovr(p, s));
  s.earned += (s.salary * sp) / 4;
  s.injured = Math.max(0, s.injured - sp);
  s.evCount = 0;
  s.turn++;
  s.cur = null;
  s.match = null;
  s.report = [];
  for (const g of p.gates) {
    if (turnAt(p, g.at) !== s.turn) continue;
    const r = g.rules.find((x) => test(p, s, x.when));
    if (!r) continue;
    if (r.end) return finish(p, s, r.end);
    const origin = `${yearOf(p, s)}년`;
    for (const f of r.flag ?? []) if (!(f in s.flags)) s.flags[f] = origin;
    if (r.stage) s.stage = r.stage;
    applySet(s, r.set, {});
    if (r.news) pushNews(s, fill(p, s, r.news), 'good');
  }
  if (s.turn >= totalTurns(p)) return finish(p, s, finalEnding(p, s));
  s.phase = 'plan';
  if (careerOn(p, s) && slot(p, s).part === 0) openYear(p, s);
  return s;
}

// 새해 첫 턴: 프로 첫해는 신인 계약, 계약이 끝난 해는 FA 시장, 그 밖에는 연봉 협상으로 한 해를 연다
function openYear(p: Pack, s: GameState) {
  if (!s.salary) {
    sign(p, s, 0.8, 3);
    pushNews(s, fill(p, s, p.career.news), 'good');
    return;
  }
  const up = yearOf(p, s) >= s.until;
  if (up) {
    s.fa = true;
    s.flags.fa = `${yearOf(p, s)}년 계약 만료`;
  }
  const id = up ? p.career.fa : p.career.salary;
  if (!p.events.some((e) => e.id === id)) return;
  s.agencyTurn = s.turn;
  s.cur = { id, back: true };
  s.phase = 'scene';
}

export const eventOf = (p: Pack, s: GameState): GameEvent | null => (s.cur ? (p.events.find((e) => e.id === s.cur!.id) ?? null) : null);

export function chance(p: Pack, s: GameState, c: Choice): number | null {
  if (!c.check) return null;
  const { stats, dc, rel, trait, boost } = c.check;
  let sum = 0;
  let tot = 0;
  for (const k in stats) {
    sum += getVar(p, s, k) * stats[k];
    tot += stats[k];
  }
  let score = sum / tot + (trait ? (p.traits[trait] ?? 0) : 0) + (s.v.stamina - 50) / 12;
  for (const f in boost) if (f in s.flags) score += boost[f];
  const target = dc ?? difficulty(p, s) + (rel ?? 0) + p.checkHard;
  // 실제 커리어와 같은 선택은 세계선이 수렴하려는 힘을 받는다
  return clamp(0.5 + (score - target) / 45 + (c.ok.real ? p.realBonus : 0), 0.05, 0.95);
}

// 열려 있는 이벤트의 선택지를 고른다
export function choose(p: Pack, s0: GameState, idx: number): GameState {
  const s = clone(s0);
  const ev = eventOf(p, s);
  if (!ev || !s.cur || s.cur.result) return s;
  const c = ev.choices[idx];
  if (!c || !test(p, s, c.need)) return s;
  const pr = chance(p, s, c);
  const ok = pr == null || rand(s) < pr;
  const o: Outcome = ok ? c.ok : (c.fail ?? c.ok);
  const d: Fx = {};
  const wasPro = careerOn(p, s);
  const from = s.stage;
  const paid = s.pays.length;
  if (o.fx) applyFx(p, s, o.fx, d);
  applySet(s, o.set, d);
  const origin = `${yearOf(p, s)}년 「${ev.title}」`;
  for (const f of o.flag ?? []) if (!(f in s.flags)) s.flags[f] = origin;
  for (const f of o.unflag ?? []) delete s.flags[f];
  if (o.stage) s.stage = o.stage;
  if (o.pos) s.pos = o.pos;
  if (o.skill && !s.skills.includes(o.skill)) s.skills.push(o.skill);
  if (o.slot) s.slots = Math.min(p.moveSlots[1], s.slots + o.slot);
  if (o.injure) s.injured = Math.max(s.injured, o.injure);
  if (o.next) s.queue.push(o.next);
  if (o.goal) s.rec.goals += o.goal;
  if (o.assist) s.rec.assists += o.assist;
  if (o.end) s.pendingEnd = o.end === '@final' ? finalEnding(p, s) : o.end; // '@final': 은퇴 선언
  if (o.news) pushNews(s, fill(p, s, o.news), ok ? 'good' : 'bad');
  // 프로라면 팀을 옮기거나 계약 조건이 걸린 선택은 새 계약으로 이어진다
  if (careerOn(p, s)) {
    if (o.pay != null) sign(p, s, o.pay, o.term ?? 2);
    else if (!wasPro) sign(p, s, 0.8, 3);
    else if (s.stage !== from) sign(p, s, 1, o.term ?? 3, s.salary * 0.6);
    if (s.pays.length > paid && wasPro) pushNews(s, fill(p, s, p.career.news), 'good');
  }
  if (!s.seen.includes(ev.id)) s.seen.push(ev.id);
  s.history.push({ turn: s.turn, title: ev.title, label: c.label, real: o.real });
  s.cur.result = { ok, label: c.label, text: o.text, d, p: pr, skill: o.skill, signed: s.pays.length > paid ? { salary: s.salary, until: s.until } : undefined };
  return s;
}

// "다음" 버튼: 리포트 → 경기 장면들 → 기록지 → 이벤트 → 분기 마감
export function advance(p: Pack, s0: GameState): GameState {
  const s = clone(s0);
  if (s.phase === 'report') return startMatch(p, s);
  if (s.phase === 'match' && s.match && s.match.plays.length > s.match.shown) {
    s.match.shown++;
    if (s.match.shown >= s.match.sits.length) makeSheet(p, s);
    return s;
  }
  if (s.phase === 'sheet') return toEvent(p, s);
  if (s.phase === 'scene' && s.cur?.result) {
    if (s.pendingEnd) return finish(p, s, s.pendingEnd);
    // 방금 선택이 부른 이벤트(이적 시장의 다음 장 등)는 기다리지 않고 바로 연다
    while (s.queue.length) {
      const id = s.queue.shift()!;
      if (p.events.some((e) => e.id === id)) {
        s.cur = { id, back: s.cur.back };
        return s;
      }
    }
    if (!s.cur.back) {
      // 턴이 긴 시기(반기)에는 한 턴에 이벤트가 두 번까지 온다
      s.evCount++;
      if (s.evCount < (slot(p, s).per <= 2 ? 2 : 1)) {
        const e = pickEvent(p, s, true);
        if (e) {
          s.cur = { id: e.id };
          return s;
        }
      }
      return endTurn(p, s);
    }
    // 에이전시에서 연 이벤트가 끝나면 일정 화면으로
    s.cur = null;
    s.phase = 'plan';
    return s;
  }
  return s;
}

/* ───────── 요약·조망 ───────── */

// 세계선 이탈률: 실제와 달랐던 핵심 선택 + 실제 연표에서 놓친 일
export function worldline(p: Pack, s: GameState): number {
  const keyed = s.history.filter((h) => h.real !== undefined);
  const ms = milestones(p, s).filter((m) => m.past);
  const total = keyed.length + ms.length;
  if (!total) return 0;
  return Math.round((100 * (keyed.filter((h) => !h.real).length + ms.filter((m) => !m.done).length)) / total);
}

// 광고 보상 등으로 턴 시작 지점에서 다시 한 번. 난수를 틀어 같은 결과가 반복되지 않게 한다
export function revive(s0: GameState): GameState {
  const s = clone(s0);
  s.rng = (s.rng ^ 0x9e3779b9) | 0;
  s.revived = true;
  s.v.stamina = Math.max(s.v.stamina, 60);
  s.v.stress = Math.min(s.v.stress, 50);
  s.v.coach = Math.max(s.v.coach, 30);
  s.v.injury = Math.min(s.v.injury ?? 0, 30);
  if (s.v.joy != null) s.v.joy = Math.max(s.v.joy, 55);
  return s;
}

export const avgRating = (s: GameState) => (s.rec.apps ? s.rec.rating / s.rec.apps : 0);

export function score(p: Pack, s: GameState): number {
  const sc = p.scoring;
  const e = p.endings.find((x) => x.id === s.ending);
  let x = ovr(p, s) * sc.ovr;
  for (const k in sc.vars) x += getVar(p, s, k) * sc.vars[k];
  x += Math.min(sc.recCap, s.rec.goals * sc.goal + s.rec.assists * sc.assist);
  if (e) x += sc.tier[e.tier];
  for (const f in sc.flags) if (f in s.flags) x += sc.flags[f];
  return Math.round(clamp(x, 0, 100));
}

export function titleOf(p: Pack, sc: number): string {
  for (const [min, t] of p.titles) if (sc >= min) return t;
  return p.titles[p.titles.length - 1][1];
}

// 세계 축구 속 현재 위치: 동갑내기 추정 순위, 시장가치, 리그별 통할 수준
export function standing(p: Pack, s: GameState) {
  const age = ageExact(p, s);
  const o = ovr(p, s);
  const par = interp(p.world.par, age);
  const rank = Math.max(1, Math.round(200000 / 10 ** ((o - par) / 4)));
  const eur = age < 15 ? 0 : 10 ** ((o - 40) / 12.5) * 1e4 * (age <= 19 ? 1.4 : 1.2) * (1 + (s.v.fame ?? 0) / 200);
  const here = p.stages[s.stage].league;
  return {
    wage: careerOn(p, s) ? wageAt(p, s) : 0,
    leagueAvg: leagueBase(leagueOf(p, s.stage)) * 2.4, // 그 리그 주전급의 평균 연봉 (억 원)
    ovr: o,
    par,
    real: interp(p.world.real, age),
    rank,
    kr: Math.max(1, Math.round(rank / 55)),
    value: (eur * 1450) / 1e8, // 억 원
    leagues: p.world.leagues.map((l) => ({
      ...l,
      here: l.id === here,
      fit: o >= l.level ? 3 : o >= l.level - 6 ? 2 : o >= l.level - 12 ? 1 : 0,
    })),
  };
}

// 실제 커리어 연표와 지금 세계선의 대조
export function milestones(p: Pack, s: GameState) {
  const year = yearOf(p, s);
  return p.realRoute.map((m) => ({ ...m, done: test(p, s, m.when), past: year > m.year || s.phase === 'ending' }));
}
