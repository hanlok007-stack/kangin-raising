import { describe, expect, it } from 'vitest';
import { kangin as pack } from '../data/kangin';
import {
  advance,
  agencyActions,
  availableActions,
  avgRating,
  chance,
  choose,
  eventOf,
  movesFor,
  newGame,
  ovr,
  playMove,
  runPlan,
  standing,
  startAgency,
  test as cond,
  worldline,
} from './engine';
import type { Choice, GameState, Move } from './types';
import { validate } from './validate';

type Policy = {
  plan: (s: GameState) => string[];
  move: (s: GameState, opts: { move: Move; p: number }[]) => string;
  pick: (s: GameState, open: { c: Choice; i: number }[]) => number;
  agency?: (s: GameState) => string | null;
};

// 결정적 난수 (정책용 — 게임 난수와 분리)
function lcg(seed: number) {
  let x = seed >>> 0;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function play(seed: number, policy: Policy): GameState {
  let s = newGame(pack, seed);
  for (let guard = 0; guard < 3000 && s.phase !== 'ending'; guard++) {
    if (s.phase === 'plan') {
      const ag = policy.agency?.(s);
      const t = ag ? startAgency(pack, s, ag) : s;
      s = t.phase === 'scene' ? t : runPlan(pack, s, policy.plan(s));
    } else if (s.phase === 'match') {
      const opts = movesFor(pack, s);
      s = opts.length ? playMove(pack, s, policy.move(s, opts)) : advance(pack, s);
    } else if (s.phase === 'scene' && !s.cur!.result) {
      const ev = eventOf(pack, s)!;
      const open = ev.choices.map((c, i) => ({ c, i })).filter((x) => cond(pack, s, x.c.need));
      expect(open.length, `${ev.id}: 고를 수 있는 선택지가 없음`).toBeGreaterThan(0);
      s = choose(pack, s, policy.pick(s, open));
    } else s = advance(pack, s);
  }
  expect(s.phase).toBe('ending');
  return s;
}

const ids = (s: GameState) =>
  availableActions(pack, s)
    .filter((a) => !a.disabled)
    .map((a) => a.action.id);
const readyAgency = (s: GameState) =>
  agencyActions(pack, s)
    .filter((a) => !a.used && a.wait === 0)
    .map((a) => a.action.id);

// 아무거나 누르는 플레이어
const randomPolicy = (seed: number): Policy => {
  const r = lcg(seed);
  return {
    plan: (s) => {
      const pool = ids(s);
      const out: string[] = [];
      while (out.length < pack.slots && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
      return out;
    },
    move: (_s, opts) => opts[Math.floor(r() * opts.length)].move.id,
    pick: (_s, open) => open[Math.floor(r() * open.length)].i,
    agency: (s) => {
      const pool = readyAgency(s);
      return pool.length && r() < 0.25 ? pool[Math.floor(r() * pool.length)] : null;
    },
  };
};

// 체력·스트레스를 관리하며 실제 루트를 따라가는 플레이어
const smartPolicy = (seed: number, opts: { focus?: string[]; choices?: Record<string, number> } = {}): Policy => {
  const r = lcg(seed);
  const trains = ['tech', 'pass', 'shoot', 'fk', 'tactic', 'team', 'mental', 'phys'];
  return {
    plan: (s) => {
      const ok = ids(s);
      const out: string[] = [];
      let stamina = s.v.stamina;
      if (s.v.stress > 55 && ok.includes('family')) out.push('family');
      if (s.v.injury > 40 && ok.includes('rehab')) out.push('rehab');
      if (['es', 'bra'].includes(s.stage) && s.v.lang < 60) out.push('lang');
      const pool = trains.filter((t) => ok.includes(t));
      while (out.length < pack.slots) {
        if (stamina < 45 && !out.includes('rest')) {
          out.push('rest');
          stamina += 40;
          continue;
        }
        const rest = pool.filter((t) => !out.includes(t));
        if (!rest.length) {
          out.push(ok.find((t) => !out.includes(t))!);
          continue;
        }
        const fav = rest.filter((t) => opts.focus?.includes(t));
        const from = fav.length && r() < 0.75 ? fav : rest;
        out.push(from[Math.floor(r() * from.length)]);
        stamina -= 13;
      }
      return out.slice(0, pack.slots);
    },
    // 기대 평점이 가장 높은 기술
    move: (_s, list) =>
      list
        .map((o) => ({ id: o.move.id, v: o.p * (o.move.rate + (o.move.goal ?? 0) * 0.9 + (o.move.assist ?? 0) * 0.6) + (1 - o.p) * o.move.miss }))
        .sort((a, b) => b.v - a.v)[0].id,
    pick: (s, open) => {
      const forced = opts.choices?.[s.cur!.id];
      if (forced != null && open.some((x) => x.i === forced)) return forced;
      const real = open.find((x) => x.c.ok.real === true);
      if (real) return real.i;
      // 끝장나는 선택, 실제와 다르다고 표시된 선택, 팀을 옮기는 선택은 되도록 피한다
      const calm = open.filter((x) => !x.c.ok.end && !x.c.fail?.end && x.c.ok.real !== false && !x.c.ok.stage);
      const safe = calm.length ? calm : open.filter((x) => !x.c.ok.end && !x.c.fail?.end);
      const best = (safe.length ? safe : open)
        .map((x) => ({ i: x.i, p: chance(pack, s, x.c) ?? 0.9 }))
        .sort((a, b) => b.p - a.p)[0];
      return best.i;
    },
  };
};

describe('데이터 무결성', () => {
  it('팩에 끊어진 참조가 없다', () => {
    expect(validate(pack)).toEqual([]);
  });

  it('모든 이벤트와 경기 장면에 삽화가 있다', () => {
    const missing = [...pack.events, ...pack.situations].filter((x) => !pack.art[x.id]).map((x) => x.id);
    expect(missing).toEqual([]);
  });

  it('콘텐츠 목표를 채운다', () => {
    expect(pack.events.length).toBeGreaterThanOrEqual(120);
    expect(pack.actions.filter((a) => a.kind === 'train').length).toBeGreaterThanOrEqual(10);
    expect(pack.actions.filter((a) => a.kind === 'agency').length).toBeGreaterThanOrEqual(8);
    expect(pack.moves.filter((m) => m.learn).length).toBeGreaterThanOrEqual(15);
    expect(pack.endings.length).toBeGreaterThanOrEqual(25);
    expect(Object.keys(pack.cats).length).toBeGreaterThanOrEqual(15);
  });

  it('팩은 JSON으로 왕복해도 같다 (편집자 내보내기/가져오기)', () => {
    expect(JSON.parse(JSON.stringify(pack))).toEqual(pack);
  });
});

describe('엔진', () => {
  it('같은 시드와 같은 입력은 같은 결과를 낸다', () => {
    expect(play(42, smartPolicy(7))).toEqual(play(42, smartPolicy(7)));
  });

  it('입력 상태를 건드리지 않는다', () => {
    const s = newGame(pack, 1);
    const snap = structuredClone(s);
    runPlan(pack, s, ['tech', 'pass', 'rest']);
    expect(s).toEqual(snap);
  });

  it('훈련하면 능력치가 오르고 체력이 줄어든다', () => {
    const s = newGame(pack, 3);
    const t = runPlan(pack, s, ['tech', 'tech', 'tech']);
    expect(t.v.dri).toBeGreaterThan(s.v.dri);
    expect(t.v.stamina).toBeLessThan(s.v.stamina);
    expect(t.counts.tech).toBe(3);
  });

  it('같은 훈련을 반복하면 기술을 배우고, 경기 선택지가 늘어난다', () => {
    let s = newGame(pack, 5);
    for (let i = 0; i < 2; i++) s = { ...runPlan(pack, s, ['pass', 'tech', 'shoot']), phase: 'plan' as const };
    expect(s.skills).toEqual([]);
    for (let i = 0; i < 2; i++) s = { ...runPlan(pack, s, ['pass', 'tech', 'shoot']), phase: 'plan' as const };
    expect(s.skills).toEqual(expect.arrayContaining(['through', 'turn', 'curl']));
  });

  it('경기는 기록지와 평점을 남긴다', () => {
    let s = advance(pack, runPlan(pack, newGame(pack, 9), ['tech', 'pass', 'rest']));
    expect(s.phase).toBe('match');
    while (s.phase === 'match') {
      const opts = movesFor(pack, s);
      s = opts.length ? playMove(pack, s, opts[0].move.id) : advance(pack, s);
    }
    expect(s.phase).toBe('sheet');
    const sh = s.match!.sheet!;
    expect(sh.rating).toBeGreaterThanOrEqual(3);
    expect(sh.rating).toBeLessThanOrEqual(10);
    expect(sh.passes[1]).toBeGreaterThan(0);
    expect(s.log.length).toBe(1);
  });

  it('에이전시 행동은 한 분기에 하나만, 끝나면 일정 화면으로 돌아온다', () => {
    let s = newGame(pack, 11);
    s.turn = 24; // 만 12세
    const [first] = readyAgency(s);
    expect(first).toBeTruthy();
    s = startAgency(pack, s, first);
    expect(s.phase).toBe('scene');
    s = choose(pack, s, eventOf(pack, s)!.choices.length - 1);
    s = advance(pack, s);
    expect(s.phase).toBe('plan');
    expect(readyAgency(s)).toEqual([]);
  });

  it('세계 순위는 능력이 오를수록 올라간다', () => {
    const s = newGame(pack, 13);
    const t = structuredClone(s);
    for (const st of pack.stats) t.v[st.key] += 30;
    expect(standing(pack, t).rank).toBeLessThan(standing(pack, s).rank);
  });
});

describe('자동 플레이 시뮬레이션', { timeout: 180000 }, () => {
  const N = 120;
  const run = (name: string, mk: (seed: number) => Policy) => {
    const tally: Record<string, number> = {};
    let ovrSum = 0;
    let scoreSum = 0;
    let seen = 0;
    let wl = 0;
    let ga = 0;
    let rate = 0;
    let skills = 0;
    let exempt = 0;
    const finals: number[] = [];
    for (let i = 0; i < N; i++) {
      const s = play(1000 + i, mk(i));
      tally[s.ending!] = (tally[s.ending!] ?? 0) + 1;
      if (s.turn >= pack.totalTurns) finals.push(ovr(pack, s));
      ovrSum += ovr(pack, s);
      scoreSum += s.score;
      seen += s.seen.length;
      wl += worldline(s);
      ga += s.rec.goals + s.rec.assists;
      rate += avgRating(s);
      skills += s.skills.length;
      if ('exempt' in s.flags) exempt++;
    }
    finals.sort((a, b) => a - b);
    const q = (f: number) => (finals.length ? finals[Math.floor(f * (finals.length - 1))].toFixed(1) : '-');
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    console.log(
      `[${name}] ${sorted.map(([k, v]) => `${k} ${v}`).join(' · ')}\n  완주 ${finals.length} · 완주자 OVR 10/50/90% ${q(0.1)}/${q(0.5)}/${q(0.9)} · 평균 OVR ${(ovrSum / N).toFixed(1)} · 점수 ${(scoreSum / N).toFixed(1)} · 이벤트 ${(seen / N).toFixed(1)}개 · 이탈 ${(wl / N).toFixed(0)}% · 공격포인트 ${(ga / N).toFixed(1)} · 평점 ${(rate / N).toFixed(2)} · 기술 ${(skills / N).toFixed(1)}개 · 병역특례 ${exempt}`,
    );
    return tally;
  };

  it('무작위 플레이도 끝까지 가고, 망하는 길이 다양하다', () => {
    const tally = run('무작위', randomPolicy);
    expect(Object.keys(tally).length).toBeGreaterThanOrEqual(10);
  });

  it('실제 선택을 따라가며 잘 관리하면 높은 확률로 REAL ROUTE에 닿는다', () => {
    const tally = run('실제 루트', (i) => smartPolicy(i, { focus: ['pass', 'tactic', 'tech', 'fk'] }));
    expect(tally.real ?? 0).toBeGreaterThan(N * 0.5);
    expect(tally.real ?? 0).toBeLessThan(N * 0.95);
  });

  it('훈련을 고르게만 해도 프로는 된다', () => {
    const tally = run('관리형', (i) => smartPolicy(i));
    const fail = ['released', 'amateur', 'burnout', 'fallen', 'exhausted', 'outcast'].reduce((a, k) => a + (tally[k] ?? 0), 0);
    expect(fail).toBeLessThan(N * 0.35);
  });

  it('한국에 남아도 프로의 길이 있다', () => {
    const tally = run('국내 잔류', (i) => smartPolicy(i, { focus: ['pass', 'tactic', 'tech', 'fk'], choices: { s_spain: 1, s_kr_second: 1 } }));
    expect((tally.kking ?? 0) + (tally.pro ?? 0)).toBeGreaterThan(N * 0.3);
  });

  it('빅클럽 제안을 쥐고 가면 프리미어리그 세계선이 열린다', () => {
    const tally = run('야망형', (i) => smartPolicy(i, { focus: ['pass', 'tactic', 'tech', 'fk'], choices: { s_bigclub: 0, s_contract: 1 } }));
    expect((tally.epl_star ?? 0) + (tally.ballon ?? 0) + (tally.bench ?? 0) + (tally.pro ?? 0)).toBeGreaterThan(0);
  });

  it('쉬지 않고 몰아붙이면 무너진다', () => {
    const base = smartPolicy(1);
    const grind: Policy = { ...base, plan: (s) => ['phys', 'shoot', 'tech', 'pass', 'tactic'].filter((t) => ids(s).includes(t)).slice(0, pack.slots) };
    const tally = run('혹사형', () => grind);
    expect((tally.burnout ?? 0) + (tally.fallen ?? 0) + (tally.exhausted ?? 0)).toBeGreaterThan(N * 0.5);
  });
});
