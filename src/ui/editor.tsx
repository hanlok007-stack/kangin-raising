// 편집자 화면: 이벤트 카테고리와 이벤트를 브라우저에서 고친다.
// 저장하면 이 브라우저에만 적용되고, 내보낸 JSON을 src/data/kangin/custom.json 에 넣으면 배포판 전체에 적용된다.
import { useState } from 'react';
import type { Art, Category, GameEvent, Pack } from '../engine/types';
import { validate } from '../engine/validate';
import type { Custom } from '../store';
import { ArtCard, BGS } from './widgets';

type Mode = 'at' | 'auto' | 'weight' | 'none';
const modeOf = (e: GameEvent): Mode => (e.at ? 'at' : e.auto ? 'auto' : e.weight ? 'weight' : 'none');
const MODES: [Mode, string][] = [
  ['at', '스토리 (정해진 시기)'],
  ['auto', '자동 (조건이 맞으면)'],
  ['weight', '랜덤'],
  ['none', '연쇄 전용 (다른 이벤트·에이전시가 호출)'],
];

const TEMPLATE: GameEvent = {
  id: 'my_event',
  cat: '황당',
  title: '새 이벤트',
  text: '무슨 일이 일어났다.',
  weight: 3,
  choices: [
    { label: '받아들인다', ok: { text: '그렇게 됐다.', fx: { stress: -5 } } },
    { label: '도전한다', check: { stats: { men: 1 }, rel: 0 }, ok: { text: '해냈다.', fx: { men: 2 } }, fail: { text: '망했다.', fx: { stress: 10 } } },
  ],
};

function EventForm(props: {
  pack: Pack;
  ev: GameEvent;
  art: Art;
  cats: Record<string, Category>;
  isNew: boolean;
  onApply: (ev: GameEvent, art: Art, prevId: string) => string | null;
  onDelete: () => void;
  onClone: () => void;
  onClose: () => void;
}) {
  const { ev } = props;
  const [id, setId] = useState(ev.id);
  const [title, setTitle] = useState(ev.title);
  const [cat, setCat] = useState(ev.cat);
  const [text, setText] = useState(ev.text);
  const [mode, setMode] = useState<Mode>(modeOf(ev));
  const [year, setYear] = useState(ev.at?.[0] ?? props.pack.startYear);
  const [quarter, setQuarter] = useState(ev.at?.[1] ?? 1);
  const [auto, setAuto] = useState(ev.auto ?? 0.6);
  const [weight, setWeight] = useState(ev.weight ?? 3);
  const [repeat, setRepeat] = useState(!!ev.repeat);
  const [when, setWhen] = useState(JSON.stringify(ev.when ?? {}, null, 1));
  const [choices, setChoices] = useState(JSON.stringify(ev.choices, null, 1));
  const [bg, setBg] = useState(props.art[0]);
  const [emoji, setEmoji] = useState(props.art[1]);
  const [cap, setCap] = useState(props.art[2]);
  const [err, setErr] = useState<string | null>(null);

  const apply = () => {
    let w: GameEvent['when'];
    let ch: GameEvent['choices'];
    try {
      w = JSON.parse(when || '{}');
      ch = JSON.parse(choices);
    } catch (e) {
      setErr(`JSON 형식 오류: ${(e as Error).message}`);
      return;
    }
    const next: GameEvent = { id: id.trim(), cat, title, text, choices: ch };
    if (ev.npc) next.npc = ev.npc;
    if (w && Object.keys(w).length) next.when = w;
    if (mode === 'at') next.at = [year, quarter];
    if (mode === 'auto') next.auto = auto;
    if (mode === 'weight') next.weight = weight;
    if (repeat) next.repeat = true;
    setErr(props.onApply(next, [bg, emoji, cap], ev.id));
  };

  const preview: Pack = { ...props.pack, art: { ...props.pack.art, [id]: [bg, emoji, cap] } };
  return (
    <div className="stack form">
      <button className="mini" onClick={props.onClose}>
        ◀ 목록으로
      </button>
      <ArtCard pack={preview} id={id} cat={cat} />
      <label>
        ID {props.isNew ? '(영문·숫자·밑줄)' : '(고정)'}
        <input value={id} disabled={!props.isNew} onChange={(e) => setId(e.target.value)} />
      </label>
      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        카테고리
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {Object.entries(props.cats).map(([k, c]) => (
            <option key={k} value={k}>
              {c.icon} {k}
            </option>
          ))}
        </select>
      </label>
      <label>
        본문
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="cols">
        <label>
          삽화 배경
          <select value={bg} onChange={(e) => setBg(e.target.value)}>
            {BGS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          이모지
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        </label>
      </div>
      <label>
        짤 문구
        <input value={cap} onChange={(e) => setCap(e.target.value)} />
      </label>
      <label>
        발생 방식
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          {MODES.map(([m, l]) => (
            <option key={m} value={m}>
              {l}
            </option>
          ))}
        </select>
      </label>
      {mode === 'at' && (
        <div className="cols">
          <label>
            연도
            <input type="number" value={year} onChange={(e) => setYear(+e.target.value)} />
          </label>
          <label>
            분기 (1~4)
            <input type="number" min={1} max={4} value={quarter} onChange={(e) => setQuarter(+e.target.value)} />
          </label>
        </div>
      )}
      {mode === 'auto' && (
        <label>
          분기마다 발생할 확률 (0~1)
          <input type="number" step={0.1} min={0} max={1} value={auto} onChange={(e) => setAuto(+e.target.value)} />
        </label>
      )}
      {mode === 'weight' && (
        <label>
          가중치 (클수록 자주)
          <input type="number" step={1} min={1} value={weight} onChange={(e) => setWeight(+e.target.value)} />
        </label>
      )}
      <label className="check">
        <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} /> 여러 번 발생할 수 있음
      </label>
      <label>
        발생 조건 (JSON) <small>예: {'{"age":[18,99],"min":{"n_media":3},"has":["pro"]}'}</small>
        <textarea rows={3} className="code" value={when} onChange={(e) => setWhen(e.target.value)} />
      </label>
      <label>
        선택지 (JSON) <small>label, need, check{'{stats, dc|rel}'}, ok/fail{'{text, fx, flag, next, end, stage, skill}'}</small>
        <textarea rows={12} className="code" value={choices} onChange={(e) => setChoices(e.target.value)} />
      </label>
      {err && <p className="warn">{err}</p>}
      <div className="cols">
        <button className="btn" onClick={apply}>
          적용
        </button>
        <button className="btn ghost" onClick={props.onClone}>
          복제
        </button>
        <button className="btn ghost" onClick={props.onDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}

export function Editor(props: { base: Pack; pack: Pack; custom: boolean; onSave: (c: Custom | null) => void; onBack: () => void }) {
  const { base } = props;
  const [cats, setCats] = useState(() => structuredClone(props.pack.cats));
  const [events, setEvents] = useState(() => structuredClone(props.pack.events));
  const [art, setArt] = useState(() => structuredClone(props.pack.art));
  const [tab, setTab] = useState<'events' | 'cats'>('events');
  const [sel, setSel] = useState<string | null>(null);
  const [fresh, setFresh] = useState<GameEvent | null>(null); // 아직 목록에 없는 새 이벤트
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [newCat, setNewCat] = useState('');

  const draft: Pack = { ...base, cats, events, art };
  const touch = () => {
    setDirty(true);
    setMsg([]);
  };
  const usedBy = (c: string) => events.filter((e) => e.cat === c).length;

  const applyEvent = (ev: GameEvent, a: Art, prevId: string): string | null => {
    if (!/^[A-Za-z0-9_]+$/.test(ev.id)) return 'ID는 영문·숫자·밑줄만 쓸 수 있습니다.';
    if (fresh && events.some((e) => e.id === ev.id)) return `이미 있는 ID입니다: ${ev.id}`;
    const list = fresh ? [...events, ev] : events.map((e) => (e.id === prevId ? ev : e));
    const problems = validate({ ...draft, events: list }).filter((p) => p.startsWith(ev.id));
    if (problems.length) return problems.join(' / ');
    setEvents(list);
    setArt({ ...art, [ev.id]: a });
    setFresh(null);
    setSel(ev.id);
    touch();
    return null;
  };

  const save = () => {
    const problems = validate(draft);
    setMsg(problems.length ? problems : ['저장했습니다. 다음 새 게임부터 적용됩니다.']);
    if (!problems.length) {
      props.onSave({ cats, events, art });
      setDirty(false);
    }
  };
  const reset = () => {
    setCats(structuredClone(base.cats));
    setEvents(structuredClone(base.events));
    setArt(structuredClone(base.art));
    setSel(null);
    setFresh(null);
    setDirty(false);
    setMsg(['기본값으로 되돌렸습니다.']);
    props.onSave(null);
  };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ cats, events, art }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const c = JSON.parse(await file.text()) as Partial<Custom>;
      if (!c.cats || !Array.isArray(c.events) || !c.art) throw new Error('cats, events, art 가 모두 있어야 합니다.');
      setCats(c.cats);
      setEvents(c.events);
      setArt(c.art);
      setSel(null);
      setFresh(null);
      setDirty(true);
      setMsg(['가져왔습니다. "저장"을 눌러야 적용됩니다.']);
    } catch (e) {
      setMsg([`가져오기 실패: ${(e as Error).message}`]);
    }
  };

  const current = fresh ?? events.find((e) => e.id === sel) ?? null;
  const shown = events.filter((e) => (!filter || e.cat === filter) && (!q || e.title.includes(q) || e.id.includes(q) || e.text.includes(q)));

  return (
    <main className="stack editor">
      <div className="card">
        <div className="cols">
          <button className="btn ghost" onClick={props.onBack}>
            ◀ 나가기
          </button>
          <button className={dirty ? 'btn hot' : 'btn'} onClick={save}>
            저장{dirty ? ' ●' : ''}
          </button>
        </div>
        <div className="cols tools">
          <button className="mini" onClick={exportJson}>
            JSON 내보내기
          </button>
          <label className="mini filebtn">
            JSON 가져오기
            <input type="file" accept="application/json,.json" onChange={(e) => importJson(e.target.files?.[0])} />
          </label>
          <button className="mini" onClick={reset}>
            기본값으로
          </button>
        </div>
        <p className="fine">
          {props.custom ? '지금 이 브라우저는 수정한 데이터로 게임을 실행합니다.' : '기본 데이터를 쓰고 있습니다.'} 저장은 이 브라우저에만 적용됩니다. 모두에게 적용하려면 내보낸 파일을
          <code> src/data/kangin/custom.json </code>에 넣고 다시 배포하세요.
        </p>
        {msg.map((m, i) => (
          <p key={i} className={m.startsWith('저장') || m.startsWith('기본값') || m.startsWith('가져왔') ? 'note' : 'warn'}>
            {m}
          </p>
        ))}
      </div>

      <div className="card">
        <nav className="tabs inner">
          <button className={tab === 'events' ? 'on' : ''} onClick={() => setTab('events')}>
            이벤트 {events.length}
          </button>
          <button className={tab === 'cats' ? 'on' : ''} onClick={() => setTab('cats')}>
            카테고리 {Object.keys(cats).length}
          </button>
        </nav>

        {tab === 'cats' && (
          <div className="stack">
            <p className="fine">빈도 배율을 올리면 그 카테고리의 랜덤·자동 이벤트가 더 자주 나옵니다. 0이면 나오지 않습니다(스토리 이벤트는 그대로).</p>
            {Object.entries(cats).map(([name, c]) => (
              <div key={name} className="catrow" style={{ borderLeftColor: c.color }}>
                <input className="tiny" value={c.icon} aria-label="아이콘" onChange={(e) => (setCats({ ...cats, [name]: { ...c, icon: e.target.value } }), touch())} />
                <b>
                  {name} <small>{usedBy(name)}개</small>
                </b>
                <input type="color" value={c.color} aria-label="색" onChange={(e) => (setCats({ ...cats, [name]: { ...c, color: e.target.value } }), touch())} />
                <label>
                  ×
                  <input className="tiny" type="number" step={0.1} min={0} max={5} value={c.rate} onChange={(e) => (setCats({ ...cats, [name]: { ...c, rate: +e.target.value } }), touch())} />
                </label>
                <button
                  className="mini"
                  disabled={usedBy(name) > 0}
                  title={usedBy(name) > 0 ? '이벤트가 남아 있는 카테고리는 지울 수 없습니다' : ''}
                  onClick={() => {
                    const { [name]: _, ...rest } = cats;
                    setCats(rest);
                    touch();
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
            <div className="cols">
              <input placeholder="새 카테고리 이름" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
              <button
                className="btn"
                disabled={!newCat.trim() || !!cats[newCat.trim()]}
                onClick={() => {
                  setCats({ ...cats, [newCat.trim()]: { icon: '⭐', color: '#888888', rate: 1 } });
                  setNewCat('');
                  touch();
                }}
              >
                추가
              </button>
            </div>
          </div>
        )}

        {tab === 'events' && current && (
          <EventForm
            key={fresh ? '__new' : current.id}
            pack={draft}
            ev={current}
            art={art[current.id] ?? ['pitch', cats[current.cat]?.icon ?? '⚽', '']}
            cats={cats}
            isNew={!!fresh}
            onApply={applyEvent}
            onClose={() => (setSel(null), setFresh(null))}
            onClone={() => (setFresh({ ...structuredClone(current), id: `${current.id}_copy`, at: undefined }), setSel(null))}
            onDelete={() => {
              if (!fresh) {
                const list = events.filter((e) => e.id !== current.id);
                const problems = validate({ ...draft, events: list });
                if (problems.length) {
                  setMsg([`지울 수 없습니다 — ${problems[0]}`]);
                  return;
                }
                setEvents(list);
                touch();
              }
              setSel(null);
              setFresh(null);
            }}
          />
        )}

        {tab === 'events' && !current && (
          <div className="stack">
            <div className="cols">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">모든 카테고리</option>
                {Object.entries(cats).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.icon} {k} ({usedBy(k)})
                  </option>
                ))}
              </select>
              <input placeholder="검색" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button className="btn" onClick={() => setFresh({ ...structuredClone(TEMPLATE), cat: filter || TEMPLATE.cat })}>
              + 새 이벤트
            </button>
            <div className="list">
              {shown.map((e) => (
                <button key={e.id} className="choice evrow" onClick={() => setSel(e.id)} style={{ borderLeft: `8px solid ${cats[e.cat]?.color ?? '#888'}` }}>
                  <b>
                    {cats[e.cat]?.icon} {e.title}
                    <small>
                      {e.id} · {e.cat}
                    </small>
                  </b>
                  <span>{e.at ? `${e.at[0]}년 ${e.at[1]}분기` : e.auto ? `자동 ${Math.round(e.auto * 100)}%` : e.weight ? `랜덤 ×${e.weight}` : '연쇄'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
