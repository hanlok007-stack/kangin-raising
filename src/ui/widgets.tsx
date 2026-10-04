import type { Fx, GameState, Pack } from '../engine/types';

export type Mood = 'happy' | 'tired' | 'stressed' | 'hurt';

export function moodOf(s: GameState): Mood {
  if (s.injured > 0) return 'hurt';
  if (s.v.stamina < 25) return 'tired';
  if (s.v.stress > 70 || s.v.joy < 35) return 'stressed';
  return 'happy';
}

const INK = '#1d1d1b';
const SKIN = '#fbd7b0';

// 나이에 따라 자라는 2등신 캐릭터. 공은 언제나 왼발 앞에 있다.
export function Avatar({ age, kit, mood }: { age: number; kit: [string, string]; mood: Mood }) {
  const k = 0.62 + Math.min(16, Math.max(0, age - 6)) * 0.024;
  return (
    <svg viewBox="0 0 100 120" className="avatar" role="img" aria-label="선수 캐릭터">
      <ellipse cx="52" cy="114" rx="30" ry="4" fill="#0002" />
      <g transform={`translate(50 114) scale(${k}) translate(-50 -114)`}>
        <rect x="40" y="86" width="8" height="24" rx="3" fill={SKIN} stroke={INK} strokeWidth="2" />
        <rect x="52" y="86" width="8" height="24" rx="3" fill={SKIN} stroke={INK} strokeWidth="2" />
        <rect x="40" y="99" width="8" height="9" fill={kit[0]} stroke={INK} strokeWidth="2" />
        <rect x="52" y="99" width="8" height="9" fill={kit[0]} stroke={INK} strokeWidth="2" />
        <ellipse cx="43" cy="111" rx="7" ry="3.5" fill={INK} />
        <ellipse cx="58" cy="111" rx="7" ry="3.5" fill={INK} />
        <rect x="24" y="54" width="10" height="22" rx="5" fill={kit[0]} stroke={INK} strokeWidth="2" />
        <rect x="66" y="54" width="10" height="22" rx="5" fill={kit[0]} stroke={INK} strokeWidth="2" />
        <rect x="36" y="76" width="28" height="15" rx="4" fill={kit[1]} stroke={INK} strokeWidth="2" />
        <rect x="32" y="52" width="36" height="29" rx="8" fill={kit[0]} stroke={INK} strokeWidth="2" />
        <circle cx="50" cy="32" r="22" fill={SKIN} stroke={INK} strokeWidth="2" />
        <path d="M27 31 Q28 7 50 8 Q72 7 73 31 Q63 19 50 20 Q37 19 27 31Z" fill={INK} />
        {mood === 'happy' && (
          <>
            <circle cx="42" cy="35" r="2.6" fill={INK} />
            <circle cx="58" cy="35" r="2.6" fill={INK} />
            <circle cx="37" cy="41" r="3.2" fill="#ff9d9d" opacity="0.7" />
            <circle cx="63" cy="41" r="3.2" fill="#ff9d9d" opacity="0.7" />
            <path d="M43 42 Q50 49 57 42" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {mood === 'tired' && (
          <>
            <path d="M38 35 h7 M55 35 h7" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <path d="M46 45 h8" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <path d="M70 22 q3 5 0 7 q-3 -2 0 -7z" fill="#6ec5ff" stroke={INK} strokeWidth="1" />
          </>
        )}
        {mood === 'stressed' && (
          <>
            <path d="M37 29 l8 3 M63 29 l-8 3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <circle cx="42" cy="36" r="2.4" fill={INK} />
            <circle cx="58" cy="36" r="2.4" fill={INK} />
            <path d="M44 46 Q50 41 56 46" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {mood === 'hurt' && (
          <>
            <path d="M38 33 l6 3 -6 3 M62 33 l-6 3 6 3" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <path d="M45 46 q5 -3 10 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <rect x="29" y="20" width="42" height="7" rx="2" fill="#fff" stroke={INK} strokeWidth="1.5" />
          </>
        )}
        <circle cx="74" cy="106" r="8" fill="#fff" stroke={INK} strokeWidth="2" />
        <path d="M74 101.5 l4 3 -1.5 4.5 h-5 l-1.5 -4.5z" fill={INK} />
      </g>
    </svg>
  );
}

export function Bar({ value, tone = 'stat', mark }: { value: number; tone?: string; mark?: number }) {
  return (
    <div className="bar">
      <i className={tone} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      {mark != null && <u style={{ left: `${Math.max(0, Math.min(100, mark))}%` }} />}
    </div>
  );
}

export const BGS = ['pitch', 'stadium', 'home', 'studio', 'school', 'spain', 'night', 'hospital', 'air', 'city', 'brazil', 'office', 'army', 'cafe', 'dream'];

// 이벤트·경기 장면의 삽화. 배경 테마 위에 이모지를 올리고 짤 문구를 붙인다.
export function ArtCard({ pack, id, cat, small, locked }: { pack: Pack; id: string; cat?: string; small?: boolean; locked?: boolean }) {
  const a = pack.art[id] ?? ['pitch', (cat && pack.cats[cat]?.icon) || '⚽', ''];
  return (
    <div className={`art bg-${locked ? 'locked' : a[0]}${small ? ' small' : ''}`} aria-hidden={small}>
      <span className="emo">{locked ? '❓' : a[1]}</span>
      {!small && !locked && a[2] && <span className="cap">{a[2]}</span>}
    </div>
  );
}

// 변화량 칩. 숨김 변수는 보여주지 않는다.
export function Deltas({ pack, d }: { pack: Pack; d: Fx }) {
  const items = Object.entries(d).filter(([k, v]) => !pack.hidden.includes(k) && Math.abs(v) >= 0.05);
  if (!items.length) return null;
  return (
    <div className="deltas">
      {items.map(([k, v], i) => {
        const good = (v > 0) !== pack.negative.includes(k);
        const n = Math.abs(v) >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
        return (
          <span key={k} className={good ? 'chip good' : 'chip bad'} style={{ animationDelay: `${i * 60}ms` }}>
            {pack.labels[k] ?? k} {v > 0 ? '+' : ''}
            {n}
          </span>
        );
      })}
    </div>
  );
}
