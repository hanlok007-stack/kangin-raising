// 선수 선택, 레전드 도감, 광고 자리
import { useEffect, useState } from 'react';
import type { Pack } from '../engine/types';
import { AD_SECONDS, rewarded } from '../platform/ads';
import type { Meta } from '../store';
import { ArtCard, Avatar } from './widgets';

type Entry = { pack: Pack; chapter: number };

export function PackSelect(props: { packs: Entry[]; meta: Meta; openTo: number; current: string; onPick: (id: string) => void; onBack: () => void }) {
  const { meta } = props;
  return (
    <main className="stack">
      <button className="btn ghost" onClick={props.onBack}>
        ◀ 돌아가기
      </button>
      <div className="card">
        <h2>누구를 키울까</h2>
        <p className="sub">장을 넘길 때마다 새 선수가 열립니다. 선수를 바꾸면 진행 중이던 판은 지워집니다.</p>
        <div className="list">
          {props.packs.map(({ pack, chapter }) => {
            const open = props.openTo >= chapter;
            const got = meta.legend[pack.id]?.length ?? 0;
            return (
              <button key={pack.id} className={pack.id === props.current ? 'choice pick on' : 'choice pick'} disabled={!open} onClick={() => props.onPick(pack.id)}>
                <Avatar age={pack.startAge + 6} kit={pack.stages[pack.initStage].kit} mood="happy" />
                <b>
                  {open ? pack.title : '🔒 ???'}
                  <small>{open ? pack.tagline : `${chapter - 1}장을 마치면 열린다`}</small>
                  {open && (
                    <small>
                      {pack.startYear}년 만 {pack.startAge}세부터 · 레전드 카드 {got}/{pack.realRoute.length}
                    </small>
                  )}
                </b>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// 선수별 굵직한 순간(실제 커리어의 장면)을 카드로 모은다
export function Legend(props: { packs: Entry[]; meta: Meta; openTo: number; onBack: () => void }) {
  const { meta } = props;
  const total = props.packs.reduce((a, x) => a + x.pack.realRoute.length, 0);
  const have = Object.values(meta.legend).reduce((a, x) => a + x.length, 0);
  return (
    <main className="stack codex">
      <button className="btn ghost" onClick={props.onBack}>
        ◀ 돌아가기
      </button>
      <div className="card">
        <h2>
          레전드 도감 <span>{have} / {total}</span>
        </h2>
        <p className="sub">원작의 명장면을 내 손으로 다시 만들면 카드가 열립니다.</p>
      </div>
      {props.packs.map(({ pack, chapter }) => {
        const open = props.openTo >= chapter;
        const got = meta.legend[pack.id] ?? [];
        return (
          <div key={pack.id} className="card">
            <h3>
              {open ? pack.hero : '🔒 ???'} <span>{open ? `${got.length} / ${pack.realRoute.length}` : `${chapter - 1}장을 마치면 열린다`}</span>
            </h3>
            {open && (
              <div className="cards legend">
                {pack.realRoute.map((m) => {
                  const has = got.includes(m.id);
                  return (
                    <div key={m.id} className={has ? 'ecard gold' : 'ecard locked'}>
                      <ArtCard pack={pack} id={m.id} small locked={!has} />
                      <b>{has ? m.text : '???'}</b>
                      <small>{m.year}년</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}

// 보상형 광고 자리. 웹에서는 안내 화면만 보여 주고, 앱에서는 platform/ads.ts가 실제 광고를 띄운다.
export function AdGate(props: { onDone: (ok: boolean) => void }) {
  const [left, setLeft] = useState(AD_SECONDS);
  useEffect(() => {
    let alive = true;
    const tick = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    rewarded().then((ok) => alive && props.onDone(ok));
    return () => {
      alive = false;
      clearInterval(tick);
    };
    // 한 번만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="adgate" role="dialog" aria-label="광고">
      <div className="card">
        <p className="endtag">광고 자리</p>
        <p className="text">앱으로 출시되면 이 자리에 보상형 광고가 나옵니다.</p>
        <p className="score">{left}</p>
        <button className="mini" onClick={() => props.onDone(false)}>
          그만두기
        </button>
      </div>
    </div>
  );
}
