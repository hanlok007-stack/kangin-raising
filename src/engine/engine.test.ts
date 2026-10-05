import { describe, expect, it } from 'vitest';
import { packs } from '../data';
import { kangin as pack } from '../data/kangin';
import { CLUB_IDS } from '../data/kangin/career';
import {
  advance,
  agencyActions,
  agencyDue,
  availableActions,
  avgRating,
  chance,
  choose,
  clues,
  eventOf,
  movesFor,
  newGame,
  offerOf,
  ovr,
  playMove,
  runPlan,
  standing,
  startAgency,
  tierName,
  wageAt,
  test as cond,
  timeline,
  totalTurns,
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

function play(seed: number, policy: Policy, pk = pack): GameState {
  const pack = pk;
  let s = newGame(pack, seed);
  for (let guard = 0; guard < 3000 && s.phase !== 'ending'; guard++) {
    if (s.phase === 'plan') {
      // 에이전시 미팅이 먼저인 턴에는 뭐라도 하나 해야 일정으로 넘어간다
      const ready = agencyActions(pack, s).filter((a) => !a.used && a.wait === 0).map((a) => a.action.id);
      const ag = policy.agency?.(s) ?? (agencyDue(pack, s) ? (ready.includes('ag_stay') ? 'ag_stay' : ready[0]) : null);
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
      if ((s.v.joy ?? 100) < 50) out.push(ok.includes('street') ? 'street' : 'friends');
      if (s.v.injury > 40 && ok.includes('rehab')) out.push('rehab');
      if (['es', 'bra', 'ned', 'ger', 'cat'].includes(s.stage) && s.v.lang < 60 && out.length < 2) out.push('lang');
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
      // 끝장나는 선택, 실제와 다르다고 표시된 선택, 팀을 옮기는 선택(이적 시장 구경 포함)은 되도록 피한다
      const calm = open.filter((x) => !x.c.ok.end && !x.c.fail?.end && x.c.ok.real !== false && !x.c.ok.stage && !x.c.ok.next?.startsWith('mk_'));
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

  it('모든 선수 팩이 온전하고 삽화가 빠짐없다', () => {
    for (const { pack: p } of packs) {
      expect(validate(p), p.id).toEqual([]);
      expect([...p.events, ...p.situations, ...p.realRoute].filter((x) => !p.art[x.id]).map((x) => x.id), p.id).toEqual([]);
    }
  });

  it('콘텐츠 목표를 채운다', () => {
    expect(pack.events.length).toBeGreaterThanOrEqual(180);
    expect(CLUB_IDS.length).toBeGreaterThanOrEqual(12);
    expect(pack.events.filter((e) => e.cat === '대표팀' && /^n_/.test(e.id)).length).toBeGreaterThanOrEqual(8);
    expect(pack.golden.clues.length).toBe(7);
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
    expect(t.counts.tech).toBe(6); // 반기 턴은 행동 하나가 두 분기 분량
  });

  it('같은 훈련을 반복하면 기술을 배우고, 경기 선택지가 늘어난다', () => {
    let s = newGame(pack, 5);
    s = { ...runPlan(pack, s, ['pass', 'tech', 'shoot']), phase: 'plan' as const };
    expect(s.skills).toEqual([]);
    s = { ...runPlan(pack, s, ['pass', 'tech', 'shoot']), phase: 'plan' as const };
    expect(s.skills).toEqual(expect.arrayContaining(['through', 'turn', 'curl']));
  });

  it('기술을 많이 배워도 한 장면의 선택지는 슬롯 수만큼만, 기본기 하나는 꼭 나온다', () => {
    for (let seed = 0; seed < 30; seed++) {
      const base = newGame(pack, seed);
      base.turn = 30;
      base.stage = 'val';
      base.skills = pack.moves.filter((m) => m.learn).map((m) => m.id);
      let s = advance(pack, runPlan(pack, base, ['tech', 'pass', 'rest']));
      while (s.phase === 'match') {
        const opts = movesFor(pack, s);
        if (opts.length) {
          expect(opts.length).toBeLessThanOrEqual(s.slots);
          expect(opts.some((o) => !o.move.learn)).toBe(true);
          s = playMove(pack, s, opts[0].move.id);
        } else s = advance(pack, s);
      }
    }
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
    s.turn = 12; // 만 12세
    const [first] = readyAgency(s);
    expect(first).toBeTruthy();
    s = startAgency(pack, s, first);
    expect(s.phase).toBe('scene');
    s = choose(pack, s, eventOf(pack, s)!.choices.length - 1);
    s = advance(pack, s);
    expect(s.phase).toBe('plan');
    expect(readyAgency(s)).toEqual([]);
  });

  it('유소년은 반기, 만 18세부터 분기, 서른부터 다시 반기로 흐른다', () => {
    const t = timeline(pack);
    expect(t[0]).toMatchObject({ year: 2007, age: 6, per: 2 });
    expect(t.filter((x) => x.age === 17).length).toBe(2);
    expect(t.filter((x) => x.age === 18).length).toBe(4);
    expect(t.filter((x) => x.age === 30).length).toBe(2);
    expect(t[t.length - 1].age).toBe(pack.endAge);
  });

  it('3분 안에 아이가 딴마음을 먹는다', () => {
    const s = play(77, smartPolicy(3));
    const whim = s.history.find((h) => h.title === '태권도 선수가 될래요');
    expect(whim).toBeTruthy();
    expect(whim!.turn).toBeLessThanOrEqual(6);
  });

  it('세계 순위는 능력이 오를수록 올라간다', () => {
    const s = newGame(pack, 13);
    const t = structuredClone(s);
    for (const st of pack.stats) t.v[st.key] += 30;
    expect(standing(pack, t).rank).toBeLessThan(standing(pack, s).rank);
  });
});

describe('프로 커리어', { timeout: 120000 }, () => {
  const focus = ['pass', 'tactic', 'tech', 'fk'];

  it('프로가 되면 연봉이 생기고, 해마다 협상하고, 계약이 끝나면 FA 시장에 나온다', () => {
    const s = play(1003, smartPolicy(3, { focus }));
    expect('pro' in s.flags).toBe(true);
    expect(s.pays.length).toBeGreaterThan(5);
    expect(s.earned).toBeGreaterThan(10);
    expect(s.history.some((h) => h.title === '연봉 협상')).toBe(true);
    expect(s.history.some((h) => h.title === 'FA — 시장에 나오다')).toBe(true);
  });

  it('에이전시 미팅이 먼저인 턴에는 일정이 진행되지 않고, 하나를 고르면 풀린다', () => {
    // 프로 첫해 3분기(계약 뒤 두 턴)까지 관리형으로 진행한다
    const pol = smartPolicy(3, { focus });
    let s = newGame(pack, 1003);
    for (let guard = 0; guard < 3000 && !agencyDue(pack, s); guard++) {
      expect(s.phase).not.toBe('ending');
      if (s.phase === 'plan') s = runPlan(pack, s, pol.plan(s));
      else if (s.phase === 'match') {
        const opts = movesFor(pack, s);
        s = opts.length ? playMove(pack, s, pol.move(s, opts)) : advance(pack, s);
      } else if (s.phase === 'scene' && !s.cur!.result) {
        const open = eventOf(pack, s)!.choices.map((c, i) => ({ c, i })).filter((x) => cond(pack, s, x.c.need));
        s = choose(pack, s, pol.pick(s, open));
      } else s = advance(pack, s);
    }
    expect(agencyDue(pack, s)).toBe(true);
    expect(runPlan(pack, s, ['rest', 'rest', 'rest'])).toEqual(s);
    s = startAgency(pack, s, 'ag_stay');
    s = advance(pack, choose(pack, s, 1));
    expect(s.phase).toBe('plan');
    expect(agencyDue(pack, s)).toBe(false);
    expect(runPlan(pack, s, ['rest', 'rest', 'rest']).phase).toBe('report');
  });

  it('숨은 손익비: 어려운 기술을 성공시키면 쉬운 기술보다 등급이 크게 오르고, 실패하면 깎인다', () => {
    const scout = (move: string, ok: boolean, p: number) => {
      const s = newGame(pack, 21);
      s.turn = 52;
      s.stage = 'val';
      s.flags.pro = '';
      s.v.tier = 40;
      for (const st of pack.stats) s.v[st.key] = 75;
      s.phase = 'match';
      const one = { sit: 'sit_open', move, ok, p, text: '', goal: false, assist: false };
      s.match = { opp: '', sub: false, sits: ['sit_open', 'sit_open'], offers: [[move], [move]], plays: [one, one], shown: 1 };
      return advance(pack, s).match!.sheet!.scout;
    };
    expect(scout('nutmeg', true, 0.4)).toBeGreaterThan(scout('keep', true, 0.9) + 1);
    expect(scout('nutmeg', false, 0.4)).toBeLessThan(scout('keep', false, 0.9));
  });

  it('등급이 높고 리그가 클수록 시장이 매기는 연봉이 오른다', () => {
    const s = newGame(pack, 5);
    s.turn = 60;
    s.flags.pro = '';
    s.stage = 'kl';
    s.v.tier = 30;
    const low = wageAt(pack, s);
    s.v.tier = 70;
    expect(wageAt(pack, s)).toBeGreaterThan(low * 2);
    expect(wageAt(pack, s, 'psg')).toBeGreaterThan(wageAt(pack, s, 'kl') * 3);
    expect(tierName(pack, s)).toBe('월드클래스');
    const club = pack.events.find((e) => e.id === 'mk_as')!.choices[1];
    expect(offerOf(pack, s, club)!.salary).toBeGreaterThan(0);
  });

  it('세계 지도를 따라가면 다른 대륙의 구단으로 옮겨 뛴다', () => {
    const s = play(1003, smartPolicy(3, { focus, choices: { y_fa: 0, mk_hub: 2, mk_as: 1 } }));
    expect(new Set(s.pays.map((x) => x.team)).size).toBeGreaterThan(2);
    expect('c_as' in s.flags).toBe(true);
    expect(s.pays.some((x) => x.team === 'FC 간사이')).toBe(true);
  });

  it('황금 루트는 단서 일곱 개를 모두 채운 판에서만 열린다', () => {
    const ready = (full: boolean) => {
      const s = newGame(pack, 8);
      s.turn = totalTurns(pack) - 3;
      s.stage = 'psg';
      for (const f of ['pro', 'm_psg', 'exempt', 'captain', 'clutch_hero', ...(full ? ['married'] : [])]) s.flags[f] = '';
      Object.assign(s.v, { tpeak: 85, family: 70, mates: 70, coach: 70 });
      s.skills = pack.moves.filter((m) => m.learn).map((m) => m.id);
      s.cur = { id: 'ag_retire', back: true };
      s.phase = 'scene';
      return advance(pack, choose(pack, s, 0)).ending;
    };
    expect(ready(true)).toBe('golden');
    expect(ready(false)).toBe('real');
    expect(clues(pack, newGame(pack, 1)).filter((c) => c.done).length).toBe(0);
  });

  it('다른 선수 팩도 연봉·이적 시장·세계 구단을 물려받고, 연애 단서는 다른 단서로 바뀐다', () => {
    for (const { pack: p } of packs.slice(1)) {
      for (const id of ['y_salary', 'y_fa', 'mk_hub', 'mk_eu', 'mk_as', 'mk_am', 'ag_stay', 'n_pk', 'f_mates_locker']) expect(p.events.some((e) => e.id === id), p.id + ' ' + id).toBe(true);
      for (const id of CLUB_IDS) expect(p.stages[id], p.id + ' ' + id).toBeTruthy();
      expect(p.events.some((e) => e.cat === '연애')).toBe(false);
      expect(p.actions.some((a) => a.id === 'date')).toBe(false);
      expect(p.golden.clues.map((c) => c.id)).toContain('g_rich');
      expect(p.events.find((e) => e.id === 'ag_offers')!.choices.some((c) => c.ok.next === 'mk_hub')).toBe(true);
    }
  });
});

describe('다른 선수 팩', { timeout: 180000 }, () => {
  for (const { pack: p } of packs.slice(1)) {
    it(p.hero + ': 실제 선택을 따라가면 REAL ROUTE에 닿을 수 있고, 무작위로 눌러도 끝까지 간다', () => {
      const tally: Record<string, number> = {};
      const trains = ['tech', 'pass', 'shoot', 'fk', 'tactic', 'team', 'phys', 'mental'];
      for (let i = 0; i < 40; i++) {
        const r = lcg(i);
        const follow = i % 2 === 1; // 홀수 판은 관리하며 실제 선택을, 짝수 판은 아무거나
        const pol: Policy = {
          plan: (s) => {
            const ok = availableActions(p, s)
              .filter((x) => !x.disabled)
              .map((x) => x.action.id);
            const out: string[] = [];
            if (follow) {
              if (s.v.stamina < 45) out.push('rest');
              if ((s.v.joy ?? 100) < 50) out.push('friends');
              if (s.v.stress > 55) out.push('family');
            }
            const pool = ok.filter((x) => !out.includes(x) && (!follow || trains.includes(x)));
            while (out.length < p.slots && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
            for (const x of ok) if (out.length < p.slots && !out.includes(x)) out.push(x);
            return out.slice(0, p.slots);
          },
          move: (_s, opts) => (follow ? [...opts].sort((x, y) => y.p - x.p)[0] : opts[Math.floor(r() * opts.length)]).move.id,
          pick: (_s, open) => {
            if (!follow) return open[Math.floor(r() * open.length)].i;
            const real = open.find((x) => x.c.ok.real === true);
            if (real) return real.i;
            const calm = open.filter((x) => !x.c.ok.end && !x.c.fail?.end && x.c.ok.real !== false && !x.c.ok.stage && !x.c.ok.next?.startsWith('mk_'));
            return (calm[0] ?? open[0]).i;
          },
        };
        const s = play(500 + i, pol, p);
        tally[s.ending!] = (tally[s.ending!] ?? 0) + 1;
      }
      console.log('[' + p.hero + '] ' + Object.entries(tally).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ' ' + v).join(' · '));
      expect(tally[p.endings.find((e) => e.real)!.id] ?? 0).toBeGreaterThan(0);
    });
  }
});

describe('자동 플레이 시뮬레이션', { timeout: 180000 }, () => {
  const N = 80;
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
    let tier = 0;
    let earned = 0;
    let gold = 0;
    let tmax = 0;
    const got: Record<string, number> = {};
    const finals: number[] = [];
    for (let i = 0; i < N; i++) {
      const s = play(1000 + i, mk(i));
      tally[s.ending!] = (tally[s.ending!] ?? 0) + 1;
      if (s.turn >= totalTurns(pack) || s.history.some((h) => h.title === '은퇴 기자회견')) finals.push(s.v.peak ?? 0);
      ovrSum += ovr(pack, s);
      scoreSum += s.score;
      seen += s.seen.length;
      wl += worldline(pack, s);
      ga += s.rec.goals + s.rec.assists;
      rate += avgRating(s);
      skills += s.skills.length;
      if ('exempt' in s.flags) exempt++;
      tier += s.v.tpeak ?? 0;
      earned += s.earned;
      gold += clues(pack, s).filter((c) => c.done).length;
      tmax = Math.max(tmax, s.v.tpeak ?? 0);
      for (const c of clues(pack, s)) if (c.done) got[c.id] = (got[c.id] ?? 0) + 1;
    }
    finals.sort((a, b) => a - b);
    const q = (f: number) => (finals.length ? finals[Math.floor(f * (finals.length - 1))].toFixed(1) : '-');
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    console.log(
      `[${name}] ${sorted.map(([k, v]) => `${k} ${v}`).join(' · ')}\n  완주 ${finals.length} · 완주자 OVR 10/50/90% ${q(0.1)}/${q(0.5)}/${q(0.9)} · 평균 OVR ${(ovrSum / N).toFixed(1)} · 점수 ${(scoreSum / N).toFixed(1)} · 이벤트 ${(seen / N).toFixed(1)}개 · 이탈 ${(wl / N).toFixed(0)}% · 공격포인트 ${(ga / N).toFixed(1)} · 평점 ${(rate / N).toFixed(2)} · 기술 ${(skills / N).toFixed(1)}개 · 병역특례 ${exempt} · 최고 등급점수 ${(tier / N).toFixed(0)} · 통산 수입 ${(earned / N).toFixed(0)}억 · 단서 ${(gold / N).toFixed(1)} (${Object.entries(got).map(([k, v]) => k.slice(2) + ' ' + v).join(', ')}) · 등급점수 최고 ${tmax.toFixed(0)}`,
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
    const fail = ['released', 'amateur', 'burnout', 'fallen', 'exhausted', 'outcast', 'quit'].reduce((a, k) => a + (tally[k] ?? 0), 0);
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
    expect((tally.burnout ?? 0) + (tally.fallen ?? 0) + (tally.exhausted ?? 0) + (tally.quit ?? 0)).toBeGreaterThan(N * 0.5);
  });
});
