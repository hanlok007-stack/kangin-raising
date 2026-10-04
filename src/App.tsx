import { useMemo, useState } from 'react';
import { packs } from './data';
import { newGame, revive } from './engine/engine';
import type { GameState, Pack } from './engine/types';
import { validate } from './engine/validate';
import { clearSave, loadCkpt, loadCustom, loadMeta, loadPick, loadSave, mergeMeta, saveCkpt, saveCustom, saveGame, savePick, type Custom, type Meta } from './store';
import { Editor } from './ui/editor';
import { AdGate, Legend, PackSelect } from './ui/extra';
import { Codex, Ending, Game, Intro, PerkSelect, Title } from './ui/screens';

type View = 'title' | 'perk' | 'intro' | 'game' | 'codex' | 'editor' | 'legend' | 'pick';

const first = packs[0].pack;

// 편집자 화면에서 고친 데이터(첫 번째 팩 전용)가 깨져 있으면 기본 데이터로 돌아간다
function withCustom(base: Pack, c: Custom | null): Pack {
  if (!c || base !== first) return base;
  const p = { ...base, ...c };
  return validate(p).length ? base : p;
}

function usable(pack: Pack, s: GameState | null): GameState | null {
  if (!s || s.packId !== pack.id || !pack.stages[s.stage]) return null;
  if (s.cur && !pack.events.some((e) => e.id === s.cur!.id)) return null;
  return s;
}

export default function App() {
  const [meta, setMeta] = useState<Meta>(loadMeta);
  const [pickId, setPickId] = useState(() => {
    const id = loadPick();
    return packs.some((x) => x.pack.id === id && (!x.locked || loadMeta().unlocked)) ? id! : first.id;
  });
  const [custom, setCustom] = useState<Custom | null>(loadCustom);
  const base = packs.find((x) => x.pack.id === pickId)!.pack;
  const pack = useMemo(() => withCustom(base, custom), [base, custom]);
  const [s, setS] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('title');
  const [back, setBack] = useState<View>('title');
  const [perk, setPerk] = useState<string | null>(null);
  const [ad, setAd] = useState(false);
  const [hint, setHint] = useState(true);
  const saved = (p: Pack) => {
    const sv = usable(p, loadSave());
    return sv && !sv.ending ? sv : null;
  };
  const [hasSave, setHasSave] = useState(() => !!saved(pack));

  // 모든 상태 변화가 지나가는 길목: 자동 저장 + 도감 갱신 + 턴 시작 지점 기억
  const update = (next: GameState) => {
    setMeta(mergeMeta(meta, pack, next, !!s?.ending));
    if (next.phase === 'plan' && !next.cur && (!s || s.turn !== next.turn || s.phase === 'ending')) saveCkpt(next);
    setS(next);
    if (next.ending) clearSave();
    else saveGame(next);
    setHasSave(!next.ending);
  };

  const start = () => {
    saveCkpt(null);
    update(newGame(pack, (Date.now() ^ (Math.random() * 0x7fffffff)) | 0, perk));
    setView('game');
  };
  const open = (v: View) => {
    setBack(view);
    setView(v);
  };
  const newRun = () => {
    setPerk(null);
    setView(meta.endings.length >= Math.min(...pack.perks.map((k) => k.unlock)) ? 'perk' : 'intro');
  };
  const choosePack = (id: string) => {
    if (id !== pickId) {
      clearSave();
      saveCkpt(null);
      setS(null);
      savePick(id);
      setPickId(id);
      setHasSave(false);
    }
    setView('title');
  };

  // 되돌리기: 도중에 망한 판에서, 한 번만, 그 턴이 시작되던 순간으로
  const ckpt = s?.ending && !s.revived && s.turn < 9999 ? usable(pack, loadCkpt()) : null;
  const canRevive = !!ckpt && !ckpt.revived && !pack.endings.find((e) => e.id === s!.ending)?.final;

  let screen;
  if (view === 'editor')
    screen = (
      <Editor
        base={first}
        pack={withCustom(first, custom)}
        custom={!!custom}
        onBack={() => setView('title')}
        onSave={(c) => {
          saveCustom(c);
          setCustom(c);
          // 데이터가 바뀌면 진행 중이던 판은 이어갈 수 없다
          clearSave();
          saveCkpt(null);
          setS(null);
          setHasSave(false);
        }}
      />
    );
  else if (view === 'legend') screen = <Legend packs={packs} meta={meta} onBack={() => setView(back)} />;
  else if (view === 'pick') screen = <PackSelect packs={packs} meta={meta} current={pickId} onPick={choosePack} onBack={() => setView('title')} />;
  else if (view === 'codex') screen = <Codex pack={pack} meta={meta} onBack={() => setView(back)} />;
  else if (view === 'perk')
    screen = (
      <PerkSelect
        pack={pack}
        meta={meta}
        onPick={(id) => {
          setPerk(id);
          setView('intro');
        }}
      />
    );
  else if (view === 'intro') screen = <Intro pack={pack} onStart={start} />;
  else if (view === 'game' && s)
    screen =
      s.phase === 'ending' ? (
        <Ending pack={pack} s={s} meta={meta} onAgain={newRun} onCodex={() => open('codex')} onRevive={canRevive ? () => setAd(true) : undefined} />
      ) : (
        <Game pack={pack} s={s} update={update} onExit={() => setView('title')} />
      );
  else
    screen = (
      <Title
        pack={pack}
        meta={meta}
        hasSave={hasSave}
        onNew={newRun}
        onContinue={() => {
          const sv = saved(pack);
          if (sv) {
            setS(sv);
            setView('game');
          }
        }}
        onCodex={() => open('codex')}
        onLegend={() => open('legend')}
        onPick={() => setView('pick')}
        onEditor={() => setView('editor')}
      />
    );

  return (
    <>
      {hint && (
        <button className="rotate" onClick={() => setHint(false)}>
          📱 가로로 돌리면 더 넓게 볼 수 있어요 ✕
        </button>
      )}
      {screen}
      {ad && (
        <AdGate
          onDone={(ok) => {
            setAd(false);
            if (ok && ckpt) {
              const r = revive(ckpt);
              saveCkpt(r);
              saveGame(r);
              setS(r);
              setHasSave(true);
            }
          }}
        />
      )}
    </>
  );
}
