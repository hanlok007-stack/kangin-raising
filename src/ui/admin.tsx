// 관리자 설정(주인만 보는 화면)과 챕터 클리어·상점 안내
import { useState } from 'react';
import { chapters, LAST_CHAPTER } from '../data';
import { checkPin } from '../platform/admin';
import { NO_ADS, grantForTest, owned, purchase } from '../platform/billing';
import { flags, setFlag } from '../platform/flags';

export function PinGate(props: { onOk: () => void; onBack: () => void }) {
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);
  const submit = async () => {
    if (await checkPin(pin)) props.onOk();
    else setBad(true);
  };
  return (
    <main className="stack editor">
      <div className="card stack">
        <h2>관리자 확인</h2>
        <input type="password" autoFocus value={pin} placeholder="PIN" onChange={(e) => (setPin(e.target.value), setBad(false))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {bad && <p className="warn">PIN이 맞지 않습니다.</p>}
        <div className="cols">
          <button className="btn ghost" onClick={props.onBack}>
            돌아가기
          </button>
          <button className="btn" onClick={submit}>
            확인
          </button>
        </div>
      </div>
    </main>
  );
}

export function Admin(props: { chapter: number; onEditor: () => void; onUnlockAll: () => void; onReset: () => void; onBack: () => void }) {
  const [f, setF] = useState(flags);
  const toggle = (k: 'noAds' | 'webAds') => {
    if (k === 'noAds') grantForTest(!f.noAds);
    else setFlag(k, !f[k]);
    setF(flags());
  };
  return (
    <main className="stack editor">
      <button className="btn ghost" onClick={props.onBack}>
        ◀ 나가기
      </button>
      <div className="card stack">
        <h2>관리자 설정</h2>
        <p className="fine">이 기기에만 적용됩니다. 현재 열린 장: {Math.min(props.chapter, LAST_CHAPTER)} / {LAST_CHAPTER}</p>
        <button className="btn" onClick={props.onEditor}>
          🛠 이벤트·카테고리 편집자
        </button>
        <label className="check">
          <input type="checkbox" checked={f.noAds} onChange={() => toggle('noAds')} /> 광고 제거 패키지 보유 (결제 없이 테스트)
        </label>
        <label className="check">
          <input type="checkbox" checked={f.webAds} onChange={() => toggle('webAds')} /> 웹에서도 전면 광고 자리 보기
        </label>
        <button className="btn ghost" onClick={props.onUnlockAll}>
          모든 장 열기
        </button>
        <button className="btn ghost" onClick={props.onReset}>
          저장 데이터 초기화 (도감·진행·설정)
        </button>
      </div>
    </main>
  );
}

// 장을 넘겼을 때. 1장을 마친 뒤부터 광고 제거 패키지를 안내한다.
export function ChapterClear(props: { cleared: number; note?: string; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const done = chapters.find((c) => c.n === props.cleared);
  const next = chapters.find((c) => c.n === props.cleared + 1);
  const buy = async () => {
    const r = await purchase();
    setMsg(r === 'owned' ? '구매가 완료됐습니다. 이제 광고가 나오지 않습니다.' : r === 'cancelled' ? '구매를 취소했습니다.' : '앱 출시 후에 구매할 수 있습니다.');
  };
  return (
    <div className="adgate" role="dialog" aria-label="챕터 클리어">
      <div className="card clear">
        <p className="endtag">CHAPTER {props.cleared} CLEAR</p>
        <h2>{done?.title}</h2>
        {next ? (
          <p className="text">
            다음 장 — <b>{next.title}</b>
            <br />
            <small>{next.sub}</small>
          </p>
        ) : (
          <p className="text">모든 장을 마쳤습니다. 도감을 채우러 다시 돌아오세요.</p>
        )}
        {props.note && <p className="fine">{props.note}</p>}
        {!owned() && (
          <div className="shop">
            <b>{NO_ADS.title}</b>
            <small>{NO_ADS.desc}</small>
            <button className="btn" onClick={buy}>
              {NO_ADS.price}
            </button>
            {msg && <small>{msg}</small>}
          </div>
        )}
        <button className="btn hot" onClick={props.onClose}>
          계속 ▶
        </button>
      </div>
    </div>
  );
}
