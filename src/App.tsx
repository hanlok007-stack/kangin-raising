import { useMemo, useState } from 'react';
import { kangin as base } from './data/kangin';
import { newGame } from './engine/engine';
import type { GameState, Pack } from './engine/types';
import { validate } from './engine/validate';
import { clearSave, loadCustom, loadMeta, loadSave, mergeMeta, saveCustom, saveGame, type Custom, type Meta } from './store';
import { Editor } from './ui/editor';
import { Codex, Ending, Game, Intro, PerkSelect, Title } from './ui/screens';

type View = 'title' | 'perk' | 'intro' | 'game' | 'codex' | 'editor';

// 편집자 화면에서 고친 데이터가 깨져 있으면 기본 데이터로 돌아간다
function withCustom(c: Custom | null): Pack {
  if (!c) return base;
  const p = { ...base, ...c };
  return validate(p).length ? base : p;
}

function validSave(pack: Pack): GameState | null {
  const s = loadSave();
  if (!s || s.packId !== pack.id || s.ending || !pack.stages[s.stage]) return null;
  if (s.cur && !pack.events.some((e) => e.id === s.cur!.id)) return null;
  return s;
}

export default function App() {
  const [custom, setCustom] = useState<Custom | null>(loadCustom);
  const pack = useMemo(() => withCustom(custom), [custom]);
  const [meta, setMeta] = useState<Meta>(loadMeta);
  const [s, setS] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('title');
  const [back, setBack] = useState<View>('title');
  const [perk, setPerk] = useState<string | null>(null);
  const [hasSave, setHasSave] = useState(() => !!validSave(pack));

  // 모든 상태 변화가 지나가는 길목: 자동 저장 + 도감 갱신
  const update = (next: GameState) => {
    setMeta(mergeMeta(meta, next, !!s?.ending));
    setS(next);
    if (next.ending) clearSave();
    else saveGame(next);
    setHasSave(!next.ending);
  };

  const start = () => {
    update(newGame(pack, (Date.now() ^ (Math.random() * 0x7fffffff)) | 0, perk));
    setView('game');
  };
  const openCodex = () => {
    setBack(view);
    setView('codex');
  };
  const newRun = () => {
    setPerk(null);
    setView(meta.endings.length >= Math.min(...pack.perks.map((k) => k.unlock)) ? 'perk' : 'intro');
  };

  if (view === 'editor')
    return (
      <Editor
        base={base}
        pack={pack}
        custom={pack !== base}
        onBack={() => setView('title')}
        onSave={(c) => {
          saveCustom(c);
          setCustom(c);
          // 데이터가 바뀌면 진행 중이던 판은 이어갈 수 없다
          clearSave();
          setS(null);
          setHasSave(false);
        }}
      />
    );
  if (view === 'codex') return <Codex pack={pack} meta={meta} onBack={() => setView(back)} />;
  if (view === 'perk')
    return (
      <PerkSelect
        pack={pack}
        meta={meta}
        onPick={(id) => {
          setPerk(id);
          setView('intro');
        }}
      />
    );
  if (view === 'intro') return <Intro pack={pack} onStart={start} />;
  if (view === 'game' && s) {
    if (s.phase === 'ending') return <Ending pack={pack} s={s} meta={meta} onAgain={newRun} onCodex={openCodex} />;
    return <Game pack={pack} s={s} update={update} onExit={() => setView('title')} />;
  }
  return (
    <Title
      pack={pack}
      meta={meta}
      hasSave={hasSave}
      onNew={newRun}
      onContinue={() => {
        const sv = validSave(pack);
        if (sv) {
          setS(sv);
          setView('game');
        }
      }}
      onCodex={openCodex}
      onEditor={() => setView('editor')}
    />
  );
}
