// 다른 선수 팩을 만든다. 이강인 팩의 공용 콘텐츠(훈련, 경기 기술, 일상·위기·변덕 이벤트)를 물려받고,
// 선수 고유의 것(스테이지, 스토리, 관문, 엔딩, 연표)만 새로 쓴다.
import type { Choice, Cond, EndingDef, GameEvent, Outcome, Pack } from '../engine/types';
import { kangin } from './kangin';

export type LegendSpec = Pick<
  Pack,
  'id' | 'title' | 'hero' | 'given' | 'foot' | 'tagline' | 'intro' | 'startYear' | 'startAge' | 'calendar' | 'endAge' | 'init' | 'initStage' | 'pa' | 'aptitude' | 'traits' | 'stages' | 'gates' | 'realRoute' | 'world'
> & {
  story: GameEvent[]; // 고유 이벤트 (스토리 + 이적 시장 ag_offers)
  finals: EndingDef[]; // 고유 엔딩 (은퇴 시 판정, 공용 엔딩보다 먼저)
  art: Pack['art'];
  abroad: string[]; // 외국어·향수병이 적용되는 스테이지
  positions?: Pack['positions'];
  npcs?: Pack['npcs'];
  scoreFlags: Record<string, number>;
};

// 이강인에게만 맞는 내용이 든 공용 후보는 뺀다
const LOCAL = ['슛돌이', '발렌시아', '스페인', '메스타야', '파코', '다니', '인천'];
const outs = (c: Choice): Outcome[] => (c.fail ? [c.ok, c.fail] : [c.ok]);

export function legend(spec: LegendSpec): Pack {
  const stages = new Set(Object.keys(spec.stages));
  // 스테이지 조건을 이 팩에 맞게 고친다. 축구하는 모든 곳을 뜻하던 긴 목록은 조건을 없애고, 나머지는 있는 곳만 남긴다.
  const fit = (c?: Cond): Cond | undefined | null => {
    if (!c?.stage) return c;
    if (c.stage.length >= 8) return { ...c, stage: undefined };
    const keep = c.stage.filter((x) => stages.has(x));
    return keep.length ? { ...c, stage: keep } : null;
  };
  const text = (x: unknown) =>
    JSON.parse(
      JSON.stringify(x)
        .replaceAll('옛날에 슛돌이 나왔던 애라며', '옛날에 공 좀 찼다며')
        .replaceAll('슛돌이로 방송을 시작한 아이가 방송으로 돌아왔다.', '운동장을 누비던 선수가 마이크 앞에 앉았다.')
        .replaceAll('팬들은 그걸 \\"슛돌이 스텝\\"이라고 부른다.', '팬들은 그 스텝을 따라 춘다.')
        .replaceAll('발렌시아에서 배운 파에야로', '원정길에 배운 요리로')
        .replaceAll('이강인', spec.hero)
        .replaceAll('강인', spec.given)
        .replaceAll('왼발', spec.foot),
    );

  const ownIds = new Set(spec.story.map((e) => e.id));
  let pool: GameEvent[] = kangin.events
    .filter((e) => !e.at && !ownIds.has(e.id) && e.cat !== '연애' && !/^(s_|l_|x_)/.test(e.id) && !LOCAL.some((w) => JSON.stringify(e).includes(w)))
    .flatMap((e) => {
      const when = fit(e.when);
      if (when === null) return [];
      const choices = e.choices.flatMap((c) => {
        const need = fit(c.need);
        if (need === null || outs(c).some((o) => o.stage && !stages.has(o.stage))) return [];
        return [{ ...c, need }];
      });
      return choices.length ? [{ ...e, when, choices }] : [];
    });

  // 이 팩에서 만들어지지 않는 플래그·이벤트·엔딩에 기대는 것을 걷어낸다 (두 번 돌면 안정된다)
  const endings: EndingDef[] = [...spec.finals, ...(text(kangin.endings) as EndingDef[]).filter((e) => !e.real && !['ballon', 'epl_star', 'psg_star', 'laliga_star', 'samba', 'kking', 'leftgod', 'euro_star', 'bench', 'journeyman', 'college', 'scholar', 'tv_star', 'released'].includes(e.id))];
  const endIds = new Set(endings.map((e) => e.id));
  for (let pass = 0; pass < 3; pass++) {
    const all = [...spec.story, ...pool];
    const ids = new Set(all.map((e) => e.id));
    const made = new Set<string>(spec.gates.flatMap((g) => g.rules.flatMap((r) => r.flag ?? [])));
    for (const e of all) for (const c of e.choices) for (const o of outs(c)) o.flag?.forEach((f) => made.add(f));
    const can = (c?: Cond) => (c?.has ?? []).every((f) => made.has(f)) && (!c?.any || c.any.some((f) => made.has(f)));
    pool = pool.flatMap((e) => {
      if (!can(e.when)) return [];
      const choices = e.choices.filter((c) => can(c.need) && outs(c).every((o) => (!o.next || ids.has(o.next)) && (!o.end || o.end === '@final' || endIds.has(o.end))));
      return choices.length ? [{ ...e, choices }] : [];
    });
  }

  const npcs = [...kangin.npcs.filter((n) => ['mom', 'dad', 'minsu', 'agent', 'reporter', 'shark', 'owner'].includes(n.id)), ...(spec.npcs ?? [])];
  const npcIds = new Set(npcs.map((n) => n.id));
  // 물려받은 이벤트만 문구를 바꾼다. 고유 스토리는 쓴 그대로 둔다
  const events = [...spec.story, ...(text(pool) as GameEvent[])].map((e) => (e.npc && !npcIds.has(e.npc) ? { ...e, npc: undefined } : e));
  const evIds = new Set(events.map((e) => e.id));

  return {
    ...kangin,
    ...spec,
    world: { ...spec.world, leagues: kangin.world.leagues },
    positions: { ...kangin.positions, ...spec.positions },
    actions: (text(kangin.actions) as Pack['actions']).flatMap((a) => {
      const when = fit(a.when);
      return when === null || (a.event && !evIds.has(a.event)) ? [] : [{ ...a, when }];
    }),
    moves: text(kangin.moves),
    situations: kangin.situations.flatMap((x) => {
      const when = fit(x.when);
      return when === null ? [] : [{ ...x, when: x.id === 'sit_big' ? { age: [18, 99] as [number, number] } : when }];
    }),
    events,
    endings,
    art: { ...kangin.art, ...spec.art },
    npcs,
    drift: [
      ...kangin.drift.filter((d) => !d.when?.stage && !d.when?.has),
      { when: { stage: spec.abroad }, fx: { lang: 3 } },
      { when: { stage: spec.abroad, max: { lang: 59.99 } }, fx: { homesick: 4 } },
    ],
    scoring: { ...kangin.scoring, flags: spec.scoreFlags },
  };
}
