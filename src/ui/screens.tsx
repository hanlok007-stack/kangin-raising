import { useEffect, useRef, useState } from 'react';
import {
  advance,
  ageOf,
  agencyActions,
  availableActions,
  avgRating,
  butterflies,
  chance,
  choose,
  currentSit,
  eventOf,
  milestones,
  movesFor,
  ovr,
  playMove,
  partName,
  runPlan,
  slotAt,
  standing,
  startAgency,
  teamOf,
  test,
  titleOf,
  totalTurns,
  worldline,
  yearOf,
} from '../engine/engine';
import type { GameEvent, GameState, Pack } from '../engine/types';
import type { Meta } from '../store';
import { ArtCard, Avatar, Bar, Deltas, moodOf } from './widgets';

type Update = (s: GameState) => void;

const dateOf = (p: Pack, turn: number) => {
  const x = slotAt(p, turn);
  return `만 ${x.age}세 ${partName(x)} (${x.year})`;
};
const posName = (p: Pack, s: GameState) => (s.pos ? p.positions[s.pos].name : '포지션 미정');
const endAge = (p: Pack) => p.endAge;
const rateTone = (r: number) => (r >= 8 ? 'top' : r >= 7 ? 'hi' : r >= 6 ? 'mid' : 'lo');

export function Title(props: { pack: Pack; meta: Meta; hasSave: boolean; onNew: () => void; onContinue: () => void; onCodex: () => void; onLegend: () => void; onPick: () => void; onSecret: () => void; chapterLine: string }) {
  const { pack, meta, hasSave } = props;
  return (
    <main className="title">
      <div className="card logo" onClick={props.onSecret}>
        <Avatar age={pack.startAge} kit={pack.stages[pack.initStage].kit} mood="happy" />
        <h1>{pack.title}</h1>
        <p className="tag">{pack.tagline}</p>
      </div>
      <div className="menu">
        {hasSave && (
          <button className="btn hot" onClick={props.onContinue}>
            이어하기
          </button>
        )}
        <button className={hasSave ? 'btn' : 'btn hot'} onClick={props.onNew}>
          새 게임
        </button>
        <button className="btn ghost" onClick={props.onCodex}>
          도감
          <small>
            엔딩 {meta.endings.length}/{pack.endings.length} · 이벤트 {meta.events.length}/{pack.events.length}
          </small>
        </button>
        <button className="btn ghost" onClick={props.onLegend}>
          🏅 레전드 도감
          <small>굵직한 순간 {Object.values(meta.legend).reduce((a, x) => a + x.length, 0)}장 수집</small>
        </button>
        <button className="btn ghost slim" onClick={props.onPick}>
          👥 챕터 · 선수 <small>{props.chapterLine}</small>
        </button>
      </div>
      {hasSave && <p className="fine">새 게임을 시작하면 진행 중인 기록은 지워집니다.</p>}
      {meta.runs > 0 && (
        <p className="fine">
          플레이 {meta.runs}회 · 최고 점수 {meta.best}
        </p>
      )}
      <p className="fine disclaimer">{pack.disclaimer}</p>
    </main>
  );
}

export function PerkSelect(props: { pack: Pack; meta: Meta; onPick: (id: string | null) => void }) {
  const { pack, meta } = props;
  const n = meta.endings.length;
  return (
    <main className="stack">
      <div className="card">
        <h2>회차 특전</h2>
        <p className="sub">엔딩을 모을수록 새 특전이 열립니다. 하나만 고를 수 있습니다. (현재 엔딩 {n}개)</p>
        <div className="list">
          {pack.perks.map((k) => {
            const open = n >= k.unlock;
            return (
              <button key={k.id} className="choice" disabled={!open} onClick={() => props.onPick(k.id)}>
                <b>{open ? k.name : '🔒 ???'}</b>
                <span>{open ? k.desc : `엔딩 ${k.unlock}개 수집 시 해금`}</span>
              </button>
            );
          })}
          <button className="choice" onClick={() => props.onPick(null)}>
            <b>특전 없이 시작</b>
            <span>순정 그대로.</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export function Intro(props: { pack: Pack; onStart: () => void }) {
  const { pack } = props;
  const [i, setI] = useState(0);
  const last = i >= pack.intro.length - 1;
  return (
    <main className="stack">
      <div className="card intro">
        <p className="year">{pack.startYear}년</p>
        {pack.intro.slice(0, i + 1).map((t, j) => (
          <p key={j} className="line">
            {t}
          </p>
        ))}
      </div>
      <button className="btn hot" onClick={() => (last ? props.onStart() : setI(i + 1))}>
        {last ? '키우기 시작 ▶' : '다음 ▶'}
      </button>
    </main>
  );
}

function Hud({ pack, s }: { pack: Pack; s: GameState }) {
  const age = ageOf(pack, s);
  const rels = ['coach', 'family', 'mates', 'fame'];
  if (s.v.nat > 0) rels.push('nat');
  if (s.v.lang > 0) rels.push('lang');
  return (
    <aside className="card hud">
      <div className="who">
        <Avatar age={age} kit={pack.stages[s.stage].kit} mood={moodOf(s)} />
        <div>
          <div className="name">
            {pack.hero} <span>만 {age}세</span>
          </div>
          <div className="team">{teamOf(pack, s)}</div>
          <div className="team">{posName(pack, s)}</div>
          <div className="badges">
            <span className="badge ovr">OVR {Math.round(ovr(pack, s))}</span>
            <span className="badge">세계선 이탈 {worldline(pack, s)}%</span>
            {s.v.joy < 35 && <span className="badge bad">😡 언해피</span>}
            {age >= 17 && <span className={'exempt' in s.flags ? 'badge ok' : 'badge'}>{'exempt' in s.flags ? '병역특례 ✔' : '병역 미해결'}</span>}
          </div>
        </div>
      </div>
      <div className="gauges">
        <label>
          체력 <b>{Math.round(s.v.stamina)}</b>
          <Bar value={s.v.stamina} tone={s.v.stamina < 25 ? 'danger' : 'stamina'} />
        </label>
        <label>
          스트레스 <b>{Math.round(s.v.stress)}</b>
          <Bar value={s.v.stress} tone={s.v.stress > 70 ? 'danger' : 'stress'} />
        </label>
        <label>
          의욕 <b>{Math.round(s.v.joy)}</b>
          <Bar value={s.v.joy} tone={s.v.joy < 35 ? 'danger' : 'joy'} />
        </label>
      </div>
      <div className="stats">
        {pack.stats.map((st) => (
          <label key={st.key}>
            {st.label} <b>{Math.round(s.v[st.key])}</b>
            <Bar value={s.v[st.key]} />
          </label>
        ))}
      </div>
      <div className="rels">
        {rels.map((k) => (
          <label key={k}>
            {pack.labels[k]} <b>{Math.round(s.v[k])}</b>
            <Bar value={s.v[k]} tone="rel" />
          </label>
        ))}
      </div>
    </aside>
  );
}

function Plan({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  const [sel, setSel] = useState<string[]>([]);
  const list = availableActions(pack, s);
  const toggle = (id: string) =>
    setSel((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < pack.slots ? [...cur, id] : cur));
  const after = sel.reduce((v, id) => v + (pack.actions.find((a) => a.id === id)?.fx?.stamina ?? 0), s.v.stamina);
  const news = s.news[0]?.turn === s.turn - 1 ? s.news[0] : null;
  // 이 행동을 몇 번 더 하면 새 기술을 배우는가
  const toSkill = (id: string) => {
    const left = pack.moves.filter((m) => m.learn?.action === id && !s.skills.includes(m.id)).map((m) => m.learn!.n - (s.counts[id] ?? 0));
    return left.length ? Math.max(1, Math.min(...left)) : null;
  };
  const group = (kind: 'train' | 'life') => (
    <div className="actions">
      {list
        .filter((x) => x.action.kind === kind)
        .map(({ action: a, disabled }) => {
          const order = sel.indexOf(a.id);
          const rem = toSkill(a.id);
          return (
            <button key={a.id} className={order >= 0 ? 'action on' : 'action'} disabled={disabled} onClick={() => toggle(a.id)}>
              {order >= 0 && <em>{order + 1}</em>}
              <span className="icon">{a.icon}</span>
              <b>{a.name}</b>
              <small>
                {disabled ? '부상 중 불가' : a.desc}
                {rem != null && !disabled && <i> · 🎓 {rem}회</i>}
              </small>
            </button>
          );
        })}
    </div>
  );
  return (
    <div className="stack">
      {s.note && <p className="note">{s.note}</p>}
      {news && (
        <p className={`ticker ${news.tone}`}>
          📰 {news.text}
          {news.comment && <span>💬 {news.comment}</span>}
        </p>
      )}
      {s.injured > 0 && <p className="warn">🩹 부상 중 — 당분간 격한 훈련을 할 수 없다.</p>}
      {s.v.stamina < 30 && <p className="warn">⚠ 체력이 바닥이다. 이대로 훈련하면 효과도 없고 쓰러진다.</p>}
      {s.v.stress > 75 && <p className="warn">⚠ 스트레스가 위험 수위다.</p>}
      {s.v.joy < 40 && <p className="warn">😡 축구가 재미없어 보인다. 놀게 해 주지 않으면 딴마음을 먹는다.</p>}
      {s.v.coach < 30 && <p className="warn">⚠ 감독의 신뢰가 낮아 선발에서 밀린다. 더 떨어지면 명단에서 빠진다.</p>}
      <h3>
        이번 일정 <span>{pack.slots}개를 고르세요 · 🎓는 새 기술까지 남은 횟수</span>
      </h3>
      <h4>훈련</h4>
      {group('train')}
      <h4>생활</h4>
      {group('life')}
      <div className="sticky">
        <p className="fine">
          예상 체력 {Math.round(s.v.stamina)} → <b className={after < 25 ? 'neg' : ''}>{Math.round(Math.max(0, Math.min(100, after)))}</b>
        </p>
        <button className="btn hot" disabled={sel.length !== pack.slots} onClick={() => update(runPlan(pack, s, sel))}>
          진행 ▶ ({sel.length}/{pack.slots})
        </button>
      </div>
    </div>
  );
}

function ReportView({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  return (
    <div className="stack">
      <h3>훈련 결과</h3>
      {s.report.map((r, i) => {
        const a = pack.actions.find((x) => x.id === r.id)!;
        return (
          <div key={i} className={r.crit ? 'row crit' : 'row'}>
            <div className="rowhead">
              <span className="icon">{a.icon}</span>
              <b>{a.name}</b>
              {r.crit && <span className="tagx">✨ 각성!</span>}
            </div>
            <Deltas pack={pack} d={r.d} />
            {r.learned.map((id) => {
              const m = pack.moves.find((x) => x.id === id)!;
              return (
                <p key={id} className="learned">
                  🎓 새 기술 습득! {m.icon} <b>{m.name}</b> — {m.desc}
                </p>
              );
            })}
            {r.tired && <p className="warn">⚠ 지친 몸으로 무리했다. 몸 어딘가가 삐걱거린다.</p>}
          </div>
        );
      })}
      <button className="btn hot" onClick={() => update(advance(pack, s))}>
        경기장으로 ▶
      </button>
    </div>
  );
}

const KIND: Record<string, string> = { shot: '슛', pass: '패스', dribble: '드리블', keep: '안전', press: '수비' };

function MatchView({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  const mt = s.match!;
  const sit = currentSit(pack, s);
  const play = mt.plays.length > mt.shown ? mt.plays[mt.shown] : null;
  const shownSit = sit ?? (play ? pack.situations.find((x) => x.id === play.sit)! : null);
  const options = movesFor(pack, s);
  const last = mt.shown + 1 >= mt.sits.length;
  if (!shownSit) return null;
  return (
    <div className="stack scene">
      {s.note && <p className="note">{s.note}</p>}
      <div className="scoreboard">
        <b>{teamOf(pack, s)}</b>
        <span>vs</span>
        <b>{mt.opp}</b>
      </div>
      <div className="scenehead">
        <span className="cat match">⚽ 결정적 순간 {mt.shown + 1}/{mt.sits.length}</span>
        <span className="npc">{mt.sub ? '교체 투입' : mt.shown === 0 ? '전반' : '후반'}</span>
      </div>
      <ArtCard pack={pack} id={shownSit.id} />
      <h2>{shownSit.title}</h2>
      <p className="text">{shownSit.text}</p>
      {!play ? (
        <div className="list">
          {options.map(({ move: m, p }) => (
            <button key={m.id} className={m.learn ? 'choice skill' : 'choice'} onClick={() => update(playMove(pack, s, m.id))}>
              <b>
                {m.icon} {m.name}
                <small>
                  {KIND[m.kind] ?? m.kind} · {m.desc}
                  {m.learn && ' · 배운 기술'}
                </small>
              </b>
              <span className={p >= 0.6 ? 'pct hi' : p >= 0.35 ? 'pct mid' : 'pct lo'}>성공률 {Math.round(p * 100)}%</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={play.ok ? 'result ok' : 'result fail'}>
          <p className="picked">
            ▶ {pack.moves.find((m) => m.id === play.move)!.name} (성공률 {Math.round(play.p * 100)}%)
          </p>
          <p className={play.goal ? 'verdict goal' : 'verdict'}>{play.goal ? 'GOAL!' : play.assist ? '도움!' : play.ok ? '성공!' : '실패…'}</p>
          <p className="text">{play.text}</p>
          <button className="btn hot" onClick={() => update(advance(pack, s))}>
            {last ? '경기 종료 → 기록지 ▶' : '다음 장면 ▶'}
          </button>
        </div>
      )}
    </div>
  );
}

function SheetView({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  const mt = s.match!;
  const sh = mt.sheet!;
  const pct = sh.passes[1] ? Math.round((100 * sh.passes[0]) / sh.passes[1]) : 0;
  const rows: [string, string][] = [
    ['출전 시간', `${sh.minutes}분${mt.sub ? ' (교체)' : ''}`],
    ['골 / 도움', `${sh.goals} / ${sh.assists}`],
    ['슛 (유효)', `${sh.shots[0]} (${sh.shots[1]})`],
    ['패스 성공', `${sh.passes[0]}/${sh.passes[1]} (${pct}%)`],
    ['키패스', `${sh.keyPasses}`],
    ['드리블 성공', `${sh.dribbles[0]}/${sh.dribbles[1]}`],
  ];
  return (
    <div className="stack sheet">
      <h3>경기 기록지</h3>
      <div className="scoreboard big">
        <b>{teamOf(pack, s)}</b>
        <span className="score2">
          {sh.gf} : {sh.ga}
        </span>
        <b>{mt.opp}</b>
      </div>
      <div className="ratingbox">
        <div className={`rating ${rateTone(sh.rating)}`}>
          <small>평점</small>
          {sh.rating.toFixed(1)}
        </div>
        <div>
          {sh.mom && <p className="mom">🏅 경기 최우수 선수</p>}
          <p className="quote">감독 {sh.coach}</p>
          <p className="comment">💬 {sh.comment}</p>
        </div>
      </div>
      <table className="stat">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="plays">
        {mt.plays.map((pl, i) => (
          <li key={i} className={pl.ok ? 'ok' : 'fail'}>
            {pl.goal ? '⚽' : pl.assist ? '🅰️' : pl.ok ? '✔' : '✖'} {pack.situations.find((x) => x.id === pl.sit)!.title} — {pack.moves.find((m) => m.id === pl.move)!.name}
          </li>
        ))}
      </ul>
      <Deltas pack={pack} d={sh.d} />
      <button className="btn hot" onClick={() => update(advance(pack, s))}>
        다음 ▶
      </button>
    </div>
  );
}

function SceneView({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  const ev = eventOf(pack, s);
  if (!ev || !s.cur) return null;
  const cat = pack.cats[ev.cat];
  const npc = ev.npc ? pack.npcs.find((n) => n.id === ev.npc) : null;
  const res = s.cur.result;
  const open = ev.choices.map((c) => test(pack, s, c.need));
  const fly = butterflies(s, ev.when, ...ev.choices.filter((_, i) => open[i]).map((c) => c.need));
  const skill = res?.skill ? pack.moves.find((m) => m.id === res.skill) : null;
  return (
    <div className="stack scene event" key={ev.id}>
      <div className="banner" style={{ background: cat?.color }}>
        ⚡ {s.cur.back ? '에이전시' : '이벤트 발생'} · {cat?.icon} {ev.cat}
      </div>
      {s.note && !s.cur.back && <p className="note">{s.note}</p>}
      <ArtCard pack={pack} id={ev.id} cat={ev.cat} />
      <div className="scenehead">
        <h2>{ev.title}</h2>
        {npc && (
          <span className="npc">
            {npc.face} {npc.name}
          </span>
        )}
      </div>
      <p className="text">{ev.text}</p>
      {fly.length > 0 && <p className="fly">🦋 나비효과 — {fly.join(', ')}의 선택이 여기로 이어졌다.</p>}
      {!res ? (
        <div className="list">
          {ev.choices.map((c, i) => {
            if (!open[i])
              return (
                <button key={i} className="choice locked" disabled>
                  <b>🔒 다른 세계선의 선택지</b>
                </button>
              );
            const p = chance(pack, s, c);
            return (
              <button key={i} className="choice" onClick={() => update(choose(pack, s, i))}>
                <b>
                  {c.label}
                </b>
                {p != null && <span className={p >= 0.6 ? 'pct hi' : p >= 0.35 ? 'pct mid' : 'pct lo'}>성공률 {Math.round(p * 100)}%</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={res.ok ? 'result ok' : 'result fail'}>
          <p className="picked">▶ {res.label}</p>
          {res.p != null && <p className="verdict">{res.ok ? '성공!' : '실패…'}</p>}
          <p className="text">{res.text}</p>
          <Deltas pack={pack} d={res.d} />
          {skill && (
            <p className="learned">
              🎓 새 기술 습득! {skill.icon} <b>{skill.name}</b> — {skill.desc}
            </p>
          )}
          <button className="btn hot" onClick={() => update(advance(pack, s))}>
            {s.pendingEnd ? '그리고… ▶' : s.cur.back ? '계속 ▶' : '다음 ▶'}
          </button>
        </div>
      )}
    </div>
  );
}

function Agency({ pack, s, update }: { pack: Pack; s: GameState; update: Update }) {
  const list = agencyActions(pack, s);
  const idle = s.phase === 'plan';
  return (
    <div className="stack">
      <h3>
        에이전시 <span>일정 칸을 쓰지 않는다 · 한 턴에 하나 · 크게 얻거나 크게 잃는다</span>
      </h3>
      {!list.length && <p className="fine">아직은 운동장이 전부인 나이다. 만 11세부터 문이 열린다.</p>}
      {list.length > 0 && !idle && <p className="note">일정을 짜는 단계에서만 움직일 수 있다.</p>}
      {list.some((a) => a.used) && idle && <p className="note">이번 턴에는 이미 한 번 움직였다.</p>}
      <div className="list">
        {list.map(({ action: a, wait, used }) => (
          <button key={a.id} className="choice agency" disabled={!idle || used || wait > 0} onClick={() => update(startAgency(pack, s, a.id))}>
            <b>
              {a.icon} {a.name}
              <small>{a.desc}</small>
            </b>
            {wait > 0 && <span>{wait}턴 뒤 가능</span>}
          </button>
        ))}
      </div>
      <p className="fine">에이전트와 계약하면 이적 협상이 유리해진다. 나이와 상황에 따라 할 수 있는 일이 달라진다.</p>
    </div>
  );
}

const FIT = ['아직 멀다', '유망주 계약', '로테이션', '주전급'];

function WorldView({ pack, s }: { pack: Pack; s: GameState }) {
  const w = standing(pack, s);
  const me = Math.round(w.ovr);
  return (
    <div className="stack">
      <h3>
        세계 속의 나 <span>{pack.world.cohort} 기준 추정</span>
      </h3>
      <div className="grid3">
        <div>
          <b>{w.rank.toLocaleString()}위</b>
          <small>동갑내기 세계 순위</small>
        </div>
        <div>
          <b>{w.kr.toLocaleString()}위</b>
          <small>국내 순위</small>
        </div>
        <div>
          <b>{w.value >= 1 ? `${Math.round(w.value).toLocaleString()}억` : w.value > 0 ? `${Math.round(w.value * 10000).toLocaleString()}만` : '—'}</b>
          <small>{w.value > 0 ? '추정 시장가치(원)' : '시장가치 없음 (15세부터)'}</small>
        </div>
      </div>
      <div className="compare">
        <label>
          나 <b>{me}</b>
          <Bar value={w.ovr} tone="time" />
        </label>
        <label>
          원작 속 같은 나이의 {pack.hero} <b>{Math.round(w.real)}</b>
          <Bar value={w.real} tone="stamina" />
        </label>
        <label>
          또래 유망주 평균 <b>{Math.round(w.par)}</b>
          <Bar value={w.par} tone="rel" />
        </label>
      </div>
      <h3>
        리그 사다리 <span>세로선이 내 OVR · 막대는 그 리그 주전 수준</span>
      </h3>
      <div className="ladder">
        {w.leagues.map((l) => (
          <div key={l.id} className={l.here ? 'rung here' : 'rung'}>
            <div className="rungtop">
              <b>
                {l.name}
                {l.here && <i> ← 현재 소속</i>}
              </b>
              <span className={`fit f${l.fit}`}>{FIT[l.fit]}</span>
            </div>
            <Bar value={l.level} tone="league" mark={w.ovr} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Feed({ pack, s }: { pack: Pack; s: GameState }) {
  const met = pack.npcs.filter((n) => test(pack, s, n.when));
  return (
    <div className="stack">
      <h3>
        스포츠 뉴스 <span>많이 본 순</span>
      </h3>
      {s.news.length === 0 && <p className="fine">아직 기사가 없다. 세상은 이 아이를 모른다.</p>}
      {s.news.slice(0, 12).map((n, i) => (
        <div key={i} className={`row article ${n.tone}`}>
          <b>{n.text}</b>
          <small>{dateOf(pack, n.turn)}</small>
          {n.comment && <p className="comment">└ 💬 {n.comment}</p>}
        </div>
      ))}
      <h3>
        인물 <span>{met.length}명</span>
      </h3>
      {met.map((n) => (
        <div key={n.id} className="row person">
          <span className="face">{n.face}</span>
          <div>
            <b>{n.name}</b> <small>{n.role}</small>
            <p>{n.desc}</p>
            {n.rel && <Bar value={s.v[n.rel] ?? 0} tone="rel" />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Timeline({ pack, s }: { pack: Pack; s: GameState }) {
  const keyed = s.history.filter((h) => h.real !== undefined);
  if (!keyed.length) return <p className="fine">아직 세계선을 가른 선택이 없다.</p>;
  return (
    <ol className="timeline">
      {keyed.map((h, i) => (
        <li key={i} className={h.real ? 'same' : 'diff'}>
          <small>{dateOf(pack, h.turn)}</small>
          <b>「{h.title}」</b>
          <span>{h.label}</span>
          <em>{h.real ? '원작과 같은 선택' : '다른 세계선'}</em>
        </li>
      ))}
    </ol>
  );
}

function RealRoute({ pack, s }: { pack: Pack; s: GameState }) {
  const ms = milestones(pack, s);
  return (
    <ul className="route">
      {ms.map((m, i) => (
        <li key={i} className={m.done ? 'done' : m.past ? 'missed' : 'todo'}>
          <span>{m.done ? '✔' : m.past ? '✖' : '·'}</span>
          <small>{m.year}</small>
          {m.text}
        </li>
      ))}
    </ul>
  );
}

function Skills({ pack, s }: { pack: Pack; s: GameState }) {
  const learnable = pack.moves.filter((m) => m.learn);
  return (
    <div className="tags">
      {learnable.map((m) => {
        const has = s.skills.includes(m.id);
        const a = pack.actions.find((x) => x.id === m.learn!.action);
        return (
          <span key={m.id} className={has ? 'chip skillchip' : 'chip unknown'} title={m.desc}>
            {has ? `${m.icon} ${m.name}` : a ? `🔒 ${a.name} ${s.counts[a.id] ?? 0}/${m.learn!.n}` : '🔒 ???'}
          </span>
        );
      })}
    </div>
  );
}

function Record({ pack, s, onSlot }: { pack: Pack; s: GameState; onSlot?: () => void }) {
  const avg = avgRating(s);
  return (
    <div className="stack">
      <h3>통산 기록</h3>
      <div className="grid3 five">
        <div>
          <b>{s.rec.apps}</b>
          <small>주요 경기</small>
        </div>
        <div>
          <b>{s.rec.goals}</b>
          <small>골</small>
        </div>
        <div>
          <b>{s.rec.assists}</b>
          <small>도움</small>
        </div>
        <div>
          <b className={`rt ${rateTone(avg)}`}>{avg ? avg.toFixed(2) : '—'}</b>
          <small>평균 평점</small>
        </div>
        <div>
          <b>{s.rec.mom}</b>
          <small>MOM</small>
        </div>
      </div>
      <h3>최근 경기</h3>
      {s.log.length === 0 && <p className="fine">아직 치른 경기가 없다.</p>}
      {s.log.length > 0 && (
        <table className="stat log">
          <tbody>
            {s.log.map((g, i) => (
              <tr key={i}>
                <th>
                  {g.gf > g.ga ? '승' : g.gf < g.ga ? '패' : '무'} {g.gf}:{g.ga} <small>vs {g.opp}</small>
                </th>
                <td>
                  {g.goals > 0 && `⚽${g.goals} `}
                  {g.assists > 0 && `🅰️${g.assists} `}
                  <b className={`rt ${rateTone(g.rating)}`}>{g.rating.toFixed(1)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>
        기술 <span>{s.skills.length} / {pack.moves.filter((m) => m.learn).length} · 같은 훈련을 반복하면 열린다</span>
      </h3>
      <Skills pack={pack} s={s} />
      <p className="fine">
        경기 한 장면에 나오는 선택지는 {s.slots}개 (최대 {pack.moveSlots[1]}개). 배운 기술 중에서 무작위로 나온다.
      </p>
      {onSlot && s.slots < pack.moveSlots[1] && (
        <button className="btn" onClick={onSlot}>
          📺 광고 보고 선택지 +1
        </button>
      )}
      <h3>
        원작 연표 <span>✔ 이 세계선에서도 일어난 일</span>
      </h3>
      <RealRoute pack={pack} s={s} />
      <h3>
        세계선 <span>이탈률 {worldline(pack, s)}%</span>
      </h3>
      <Timeline pack={pack} s={s} />
    </div>
  );
}

type Tab = 'main' | 'agency' | 'world' | 'feed' | 'record';
const TABS: [Tab, string][] = [
  ['main', '일정'],
  ['agency', '에이전시'],
  ['world', '세계'],
  ['feed', '소식'],
  ['record', '기록'],
];

export function Game(props: { pack: Pack; s: GameState; update: Update; onExit: () => void; onSlot?: () => void; tag?: string }) {
  const { pack, s, update } = props;
  const [tab, setTab] = useState<Tab>('main');
  const panel = useRef<HTMLElement>(null);
  const step = `${s.turn}/${s.phase}/${s.cur?.id}/${!!s.cur?.result}/${s.match?.plays.length}/${s.match?.shown}`;
  // 진행될 때마다 본 화면으로 돌아오고, 패널 머리가 화면 위로 밀려나 있으면 다시 보이게 한다
  useEffect(() => {
    setTab('main');
    const el = panel.current;
    if (!el) return;
    el.scrollTop = 0; // 가로 화면에서는 패널이 따로 스크롤된다
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
  }, [step]);
  const age = ageOf(pack, s);
  return (
    <main className="game">
      <header className="card top">
        <div className="when">
          <b>
            만 {age}세 · {partName(slotAt(pack, s.turn))}
          </b>
          <small>
            {yearOf(pack, s)}년{props.tag && ` · ${props.tag}`}
          </small>
        </div>
        <div className="progress">
          <Bar value={(100 * s.turn) / totalTurns(pack)} tone="time" />
          <small>
            <span>{pack.startAge}세</span>
            <span>커리어 {Math.round((100 * s.turn) / totalTurns(pack))}%</span>
            <span>{endAge(pack)}세</span>
          </small>
        </div>
        <button className="mini" onClick={props.onExit}>
          저장 후 나가기
        </button>
      </header>
      <Hud pack={pack} s={s} />
      <section className="card panel" ref={panel}>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {id === 'main' && s.phase !== 'plan' ? '진행 중' : label}
            </button>
          ))}
        </nav>
        {tab === 'main' && s.phase === 'plan' && <Plan key={s.turn} pack={pack} s={s} update={update} />}
        {tab === 'main' && s.phase === 'report' && <ReportView pack={pack} s={s} update={update} />}
        {tab === 'main' && s.phase === 'match' && s.match && <MatchView pack={pack} s={s} update={update} />}
        {tab === 'main' && s.phase === 'sheet' && s.match?.sheet && <SheetView pack={pack} s={s} update={update} />}
        {tab === 'main' && s.phase === 'scene' && <SceneView pack={pack} s={s} update={update} />}
        {tab === 'agency' && <Agency pack={pack} s={s} update={update} />}
        {tab === 'world' && <WorldView pack={pack} s={s} />}
        {tab === 'feed' && <Feed pack={pack} s={s} />}
        {tab === 'record' && <Record pack={pack} s={s} onSlot={props.onSlot} />}
      </section>
    </main>
  );
}

export function Ending(props: { pack: Pack; s: GameState; meta: Meta; onAgain: () => void; onCodex: () => void; onRevive?: () => void; reviveFree?: boolean }) {
  const { pack, s, meta } = props;
  const e = pack.endings.find((x) => x.id === s.ending)!;
  const w = standing(pack, s);
  const cap = Math.min(99, s.pa / 2 + 2);
  // 마지막 턴을 넘긴 뒤에도 나이는 마지막 분기 기준으로 보여준다
  const lastTurn = Math.min(s.turn, totalTurns(pack) - 1);
  const age = slotAt(pack, lastTurn).age;
  const nextPerk = pack.perks.find((k) => k.unlock > meta.endings.length);
  const hit = milestones(pack, s).filter((m) => m.done).length;
  const avg = avgRating(s);
  return (
    <main className="stack ending">
      <div className={`card endcard tier-${e.tier}`}>
        <p className="endtag">
          ENDING · {e.tier}등급{e.real && ' · ORIGINAL ROUTE'}
        </p>
        <h1>{e.title}</h1>
        <Avatar age={age} kit={pack.stages[s.stage].kit} mood={e.tier === 'D' ? 'hurt' : e.tier === 'C' ? 'tired' : 'happy'} />
        <p className="text">{e.text}</p>
      </div>
      <div className="card">
        <p className="endtag">CAREER SCORE</p>
        <p className="score">
          {s.score} <small>/ 100</small>
        </p>
        <p className="honor">「{titleOf(pack, s.score)}」</p>
        <div className="grid3 five">
          <div>
            <b>{Math.round(w.ovr)}</b>
            <small>최종 OVR</small>
          </div>
          <div>
            <b>{s.rec.goals}</b>
            <small>골</small>
          </div>
          <div>
            <b>{s.rec.assists}</b>
            <small>도움</small>
          </div>
          <div>
            <b className={`rt ${rateTone(avg)}`}>{avg ? avg.toFixed(2) : '—'}</b>
            <small>평균 평점</small>
          </div>
          <div>
            <b>{w.rank.toLocaleString()}</b>
            <small>세계 순위</small>
          </div>
        </div>
        <p className="fine">
          {dateOf(pack, lastTurn)} · {teamOf(pack, s)} · {posName(pack, s)} · 기술 {s.skills.length}개
        </p>
        <p className="reveal">
          숨겨져 있던 잠재력 <b>PA {s.pa}</b> — 이 아이가 닿을 수 있던 한계는 {Math.round(cap)}, 그중 <b>{Math.round((100 * w.ovr) / cap)}%</b>를 꽃피웠다.
        </p>
      </div>
      <div className="card">
        <h3>
          원작 연표 <span>{hit} / {pack.realRoute.length} 일치</span>
        </h3>
        <RealRoute pack={pack} s={s} />
      </div>
      <div className="card">
        <h3>
          🦋 나비효과 <span>세계선 이탈률 {worldline(pack, s)}%</span>
        </h3>
        <Timeline pack={pack} s={s} />
      </div>
      {props.onRevive && (
        <div className="card revive">
          <h3>여기서 끝내기엔 아깝다</h3>
          <p className="sub">이번 턴이 시작되던 순간으로 돌아가 다시 고를 수 있습니다.</p>
          <button className="btn" onClick={props.onRevive}>
            {props.reviveFree ? '🚑 이번에는 그냥 봐준다 — 되돌리기' : '📺 광고 보고 되돌리기'}
          </button>
        </div>
      )}
      <div className="card">
        <p className="fine">
          엔딩 수집 {meta.endings.length} / {pack.endings.length} · 이벤트 {meta.events.length} / {pack.events.length}
          {nextPerk && ` · 다음 특전 「${nextPerk.name}」까지 엔딩 ${nextPerk.unlock - meta.endings.length}개`}
        </p>
        <div className="menu">
          <button className="btn hot" onClick={props.onAgain}>
            다시 키우기
          </button>
          <button className="btn ghost" onClick={props.onCodex}>
            도감
          </button>
        </div>
      </div>
    </main>
  );
}

// 아직 못 본 이벤트의 실마리
function hintOf(e: GameEvent): string {
  if (e.at) return `스토리 · ${e.at[0]}년 무렵`;
  if (e.auto) return '어떤 상태나 반복된 행동이 부른다';
  if (e.weight) return '운이 닿으면 만난다';
  return '어떤 선택의 결과로 이어진다';
}

export function Codex(props: { pack: Pack; meta: Meta; onBack: () => void }) {
  const { pack, meta } = props;
  const [tab, setTab] = useState<'event' | 'ending'>('event');
  const [cat, setCat] = useState<string | null>(null);
  const cats = Object.keys(pack.cats).filter((c) => pack.events.some((e) => e.cat === c));
  const got = (e: GameEvent) => meta.events.includes(e.id);
  const count = (c: string) => pack.events.filter((e) => e.cat === c && got(e)).length;
  const total = (c: string) => pack.events.filter((e) => e.cat === c).length;
  // 모은 것을 앞에, 못 모은 것을 뒤에
  const list = pack.events.filter((e) => !cat || e.cat === cat).sort((a, b) => +got(b) - +got(a));
  const pct = Math.round((100 * (meta.events.length + meta.endings.length)) / (pack.events.length + pack.endings.length));
  return (
    <main className="stack codex">
      <button className="btn ghost" onClick={props.onBack}>
        ◀ 돌아가기
      </button>
      <div className="card">
        <h2>
          도감 <span>수집률 {pct}%</span>
        </h2>
        <Bar value={pct} tone="time" />
        <nav className="tabs inner">
          <button className={tab === 'event' ? 'on' : ''} onClick={() => setTab('event')}>
            이벤트 {meta.events.length}/{pack.events.length}
          </button>
          <button className={tab === 'ending' ? 'on' : ''} onClick={() => setTab('ending')}>
            엔딩 {meta.endings.length}/{pack.endings.length}
          </button>
        </nav>
        {tab === 'event' && (
          <>
            <div className="tags">
              <button className={cat ? 'chip pick' : 'chip pick on'} onClick={() => setCat(null)}>
                전체
              </button>
              {cats.map((c) => (
                <button key={c} className={cat === c ? 'chip pick on' : 'chip pick'} onClick={() => setCat(c)} style={{ borderColor: pack.cats[c].color }}>
                  {pack.cats[c].icon} {c} {count(c)}/{total(c)}
                </button>
              ))}
            </div>
            <div className="cards">
              {list.map((e) => (
                <div key={e.id} className={got(e) ? 'ecard' : 'ecard locked'}>
                  <ArtCard pack={pack} id={e.id} cat={e.cat} small locked={!got(e)} />
                  <b>{got(e) ? e.title : '???'}</b>
                  <small>{got(e) ? `${pack.cats[e.cat]?.icon ?? ''} ${e.cat}` : hintOf(e)}</small>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'ending' && (
          <div className="list">
            {pack.endings.map((e) => {
              const has = meta.endings.includes(e.id);
              return (
                <div key={e.id} className={has ? `row tier-${e.tier}` : 'row unknown'}>
                  <b>{has ? `[${e.tier}] ${e.title}${e.real ? ' · ORIGINAL ROUTE' : ''}` : `[${e.tier}] ???`}</b>
                  <p>{has ? e.text : `힌트: ${e.hint}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
