import { useMemo, useState } from 'react';
import { chapterOf, chapters, LAST_CHAPTER, packs, reached } from './data';
import { addSlot, newGame, revive, yearOf } from './engine/engine';
import type { GameState, Pack } from './engine/types';
import { validate } from './engine/validate';
import { adFree, interstitialDue, reviveNeedsAd } from './platform/ads';
import { flags, setFlag } from './platform/flags';
import { clearSave, loadCkpt, loadCustom, loadMeta, loadPick, loadSave, mergeMeta, resetAll, saveCkpt, saveCustom, saveGame, savePick, type Custom, type Meta } from './store';
import { Admin, ChapterClear, PinGate } from './ui/admin';
import { Editor } from './ui/editor';
import { AdGate, Legend, PackSelect } from './ui/extra';
import { Codex, Ending, Game, Intro, PerkSelect, Title } from './ui/screens';

type View = 'title' | 'perk' | 'intro' | 'game' | 'codex' | 'editor' | 'legend' | 'pick' | 'pin' | 'admin';
type Ad = 'revive' | 'slot' | 'inter';

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
  const [, rerender] = useState(0);
  const openTo = flags().allChapters ? 99 : meta.chapter;
  const [pickId, setPickId] = useState(() => {
    const id = loadPick();
    return packs.some((x) => x.pack.id === id && x.chapter <= (flags().allChapters ? 99 : loadMeta().chapter)) ? id! : first.id;
  });
  const [custom, setCustom] = useState<Custom | null>(loadCustom);
  const base = packs.find((x) => x.pack.id === pickId)!.pack;
  const pack = useMemo(() => withCustom(base, custom), [base, custom]);
  const [s, setS] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('title');
  const [back, setBack] = useState<View>('title');
  const [perk, setPerk] = useState<string | null>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [clear, setClear] = useState<number | null>(null);
  const [taps, setTaps] = useState(0);
  const [hint, setHint] = useState(true);
  const saved = (p: Pack) => {
    const sv = usable(p, loadSave());
    return sv && !sv.ending ? sv : null;
  };
  const [hasSave, setHasSave] = useState(() => !!saved(pack));
  const chapter = s ? chapterOf(pack.id, yearOf(pack, s)) : 1;

  // 모든 상태 변화가 지나가는 길목: 자동 저장 + 도감·챕터 갱신 + 턴 시작 지점 기억
  const update = (next: GameState) => {
    const final = !!next.ending && !!pack.endings.find((e) => e.id === next.ending)?.final;
    const nm = mergeMeta(meta, pack, next, !!s?.ending, reached(pack.id, yearOf(pack, next), final));
    if (nm.chapter > meta.chapter) setClear(nm.chapter - 1);
    setMeta(nm);
    const newTurn = next.phase === 'plan' && !next.cur && (!s || s.turn !== next.turn || s.phase === 'ending');
    if (newTurn) {
      saveCkpt(next);
      if (s && interstitialDue(chapterOf(pack.id, yearOf(pack, next)), next.turn)) setAd('inter');
    }
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

  // 되돌리기: 도중에 망한 판을 그 턴이 시작되던 순간으로. 1장의 첫 번째만 무료, 그 뒤로는 광고.
  const ckpt = s?.ending && !pack.endings.find((e) => e.id === s.ending)?.final ? usable(pack, loadCkpt()) : null;
  const ckptChapter = ckpt ? chapterOf(pack.id, yearOf(pack, ckpt)) : 1;
  const reviveFree = !!ckpt && !reviveNeedsAd(ckptChapter, ckpt.revived);
  const doRevive = () => {
    if (!ckpt) return;
    const r = revive(ckpt);
    saveCkpt(r);
    saveGame(r);
    setS(r);
    setHasSave(true);
  };
  // 광고 보상. 광고 제거 패키지가 있으면 광고 자리를 건너뛰고 바로 준다
  const reward = (kind: Ad) => {
    if (kind === 'revive') doRevive();
    if (kind === 'slot' && s) update(addSlot(pack, s));
  };
  const ask = (kind: Ad) => (adFree() ? reward(kind) : setAd(kind));

  let screen;
  if (view === 'pin') screen = <PinGate onOk={() => setView('admin')} onBack={() => setView('title')} />;
  else if (view === 'admin')
    screen = (
      <Admin
        chapter={openTo}
        onBack={() => setView('title')}
        onEditor={() => setView('editor')}
        onUnlockAll={() => {
          setFlag('allChapters', true);
          rerender((x) => x + 1);
        }}
        onReset={() => {
          resetAll();
          location.reload();
        }}
      />
    );
  else if (view === 'editor')
    screen = (
      <Editor
        base={first}
        pack={withCustom(first, custom)}
        custom={!!custom}
        onBack={() => setView('admin')}
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
  else if (view === 'legend') screen = <Legend packs={packs} meta={meta} openTo={openTo} onBack={() => setView(back)} />;
  else if (view === 'pick') screen = <PackSelect packs={packs} meta={meta} openTo={openTo} current={pickId} onPick={choosePack} onBack={() => setView('title')} />;
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
        <Ending pack={pack} s={s} meta={meta} onAgain={newRun} onCodex={() => open('codex')} onRevive={ckpt ? () => (reviveFree ? doRevive() : ask('revive')) : undefined} reviveFree={reviveFree || adFree()} />
      ) : (
        <Game pack={pack} s={s} update={update} onExit={() => setView('title')} onSlot={() => ask('slot')} tag={`${chapter}장`} />
      );
  else
    screen = (
      <Title
        pack={pack}
        meta={meta}
        hasSave={hasSave}
        chapterLine={`${Math.min(openTo, LAST_CHAPTER)}장까지 열림 · ${chapters[Math.min(openTo, LAST_CHAPTER) - 1].title}`}
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
        onSecret={() => {
          // 로고를 일곱 번 누르면 관리자 확인으로
          if (taps + 1 >= 7) {
            setTaps(0);
            setView('pin');
          } else setTaps(taps + 1);
        }}
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
      {clear != null && <ChapterClear cleared={clear} onClose={() => setClear(null)} />}
      {ad && (
        <AdGate
          onDone={(ok) => {
            const kind = ad;
            setAd(null);
            if (ok) reward(kind);
          }}
        />
      )}
    </>
  );
}
