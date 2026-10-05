// 팩 무결성 검사. 테스트와 편집자 화면이 같이 쓴다. 문제가 없으면 빈 배열.
import type { Choice, Cond, Outcome, Pack } from './types';

const outcomes = (c: Choice): Outcome[] => (c.fail ? [c.ok, c.fail] : [c.ok]);
const dup = (ids: string[]) => ids.filter((x, i) => ids.indexOf(x) !== i);

export function validate(p: Pack): string[] {
  const out: string[] = [];
  const events = new Set(p.events.map((e) => e.id));
  const endings = new Set(p.endings.map((e) => e.id));
  const moves = new Set(p.moves.map((m) => m.id));
  const actions = new Set(p.actions.map((a) => a.id));
  const leagues = new Set(p.world.leagues.map((l) => l.id));

  for (const id of dup(p.events.map((e) => e.id))) out.push(`이벤트 id 중복: ${id}`);
  for (const id of dup(p.endings.map((e) => e.id))) out.push(`엔딩 id 중복: ${id}`);
  for (const id of dup(p.actions.map((a) => a.id))) out.push(`행동 id 중복: ${id}`);
  for (const id of dup(p.moves.map((m) => m.id))) out.push(`기술 id 중복: ${id}`);

  const made = new Set<string>(['fa']); // fa는 엔진이 만든다
  const used = new Set<string>();
  const anyOf: string[][] = [];
  const scan = (c?: Cond) => {
    c?.has?.forEach((f) => used.add(f));
    if (c?.any) anyOf.push(c.any);
  };
  const checkStage = (where: string, c?: Cond) => c?.stage?.forEach((st) => p.stages[st] || out.push(`${where}: 없는 스테이지 ${st}`));

  for (const e of p.events) {
    if (!e.title) out.push(`${e.id}: 제목이 없음`);
    if (!p.cats[e.cat]) out.push(`${e.id}: 없는 카테고리 "${e.cat}"`);
    if (e.npc && !p.npcs.some((n) => n.id === e.npc)) out.push(`${e.id}: 없는 인물 ${e.npc}`);
    if (!Array.isArray(e.choices) || !e.choices.length) {
      out.push(`${e.id}: 선택지가 없음`);
      continue;
    }
    scan(e.when);
    checkStage(e.id, e.when);
    for (const c of e.choices) {
      if (!c.label || !c.ok?.text) out.push(`${e.id}: 선택지에 문구나 결과가 없음`);
      if (c.check && !c.fail) out.push(`${e.id} "${c.label}": 판정이 있는데 실패 결과가 없음`);
      scan(c.need);
      checkStage(e.id, c.need);
      for (const o of outcomes(c)) {
        if (!o) continue;
        o.flag?.forEach((f) => made.add(f));
        if (o.next && !events.has(o.next)) out.push(`${e.id}: 없는 이벤트로 이어짐 ${o.next}`);
        if (o.end && o.end !== '@final' && !endings.has(o.end)) out.push(`${e.id}: 없는 엔딩 ${o.end}`);
        if (o.stage && !p.stages[o.stage]) out.push(`${e.id}: 없는 스테이지 ${o.stage}`);
        if (o.pos && !p.positions[o.pos]) out.push(`${e.id}: 없는 포지션 ${o.pos}`);
        if (o.skill && !moves.has(o.skill)) out.push(`${e.id}: 없는 기술 ${o.skill}`);
      }
    }
  }
  for (const g of p.gates) {
    for (const r of g.rules) {
      scan(r.when);
      r.flag?.forEach((f) => made.add(f));
      if (r.stage && !p.stages[r.stage]) out.push(`관문: 없는 스테이지 ${r.stage}`);
      if (r.end && !endings.has(r.end)) out.push(`관문: 없는 엔딩 ${r.end}`);
    }
  }
  for (const a of p.actions) {
    scan(a.when);
    if (a.kind === 'agency' && (!a.event || !events.has(a.event))) out.push(`행동 ${a.id}: 없는 이벤트 ${a.event}`);
  }
  for (const m of p.moves) if (m.learn && m.learn.action !== 'event' && !actions.has(m.learn.action)) out.push(`기술 ${m.id}: 없는 행동 ${m.learn.action}`);
  for (const s of p.situations) if (!s.kinds.some((k) => p.moves.some((m) => m.kind === k && !m.learn && !m.only))) out.push(`경기 장면 ${s.id}: 쓸 수 있는 기본기가 없음`);
  for (const [id, st] of Object.entries(p.stages)) if (!leagues.has(st.league)) out.push(`스테이지 ${id}: 없는 리그 ${st.league}`);
  p.endings.forEach((e) => scan(e.when));
  p.npcs.forEach((n) => scan(n.when));
  p.drift.forEach((d) => scan(d.when));
  p.realRoute.forEach((m) => scan(m.when));
  p.golden.clues.forEach((c) => scan(c.when));
  for (const id of [p.career.salary, p.career.fa]) if (!events.has(id)) out.push(`커리어: 없는 이벤트 ${id}`);
  if (!endings.has(p.golden.ending)) out.push(`황금 루트: 없는 엔딩 ${p.golden.ending}`);
  for (const f of used) if (!made.has(f)) out.push(`플래그 "${f}"를 조건에 쓰지만 만드는 곳이 없음`);
  for (const g of anyOf) if (!g.some((f) => made.has(f))) out.push(`플래그 ${g.join('/')} 중 만들어지는 것이 없음`);
  return out;
}
