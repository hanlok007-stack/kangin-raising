// 브라우저 저장소: 진행 중 세이브 1개 + 회차를 넘어 유지되는 도감 + 편집자 화면에서 고친 데이터.
import { milestones } from './engine/engine';
import type { GameState, Pack } from './engine/types';

export interface Meta {
  events: string[];
  endings: string[];
  runs: number;
  best: number;
  legend: Record<string, string[]>; // 선수별로 모은 레전드 카드(연표 id)
  unlocked: boolean; // 첫 선수를 프로에 데뷔시키면 다른 선수가 열린다
}

// 편집자 화면에서 바꿀 수 있는 팩의 부분
export type Custom = Pick<Pack, 'cats' | 'events' | 'art'>;

const SAVE = 'kangin.save.v3';
const CKPT = 'kangin.ckpt.v3';
const META = 'kangin.meta.v1';
const CUSTOM = 'kangin.custom.v1';
const PICK = 'kangin.pick.v1';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간이 막혀 있어도 게임은 계속된다
  }
}

export const loadSave = () => read<GameState>(SAVE);
export const saveGame = (s: GameState) => write(SAVE, s);
export const clearSave = () => write(SAVE, null);

// 턴이 시작될 때의 상태. 망했을 때 "되돌리기"가 돌아가는 지점이다
export const loadCkpt = () => read<GameState>(CKPT);
export const saveCkpt = (s: GameState | null) => write(CKPT, s);

export const loadCustom = () => read<Custom>(CUSTOM);
export const saveCustom = (c: Custom | null) => write(CUSTOM, c);

export const loadPick = () => read<string>(PICK);
export const savePick = (id: string) => write(PICK, id);

export const loadMeta = (): Meta => ({ events: [], endings: [], runs: 0, best: 0, legend: {}, unlocked: false, ...read<Meta>(META) });

// 상태에서 새로 발견한 이벤트·엔딩·레전드 카드를 도감에 합친다. 바뀐 게 없으면 같은 객체를 돌려준다.
export function mergeMeta(meta: Meta, p: Pack, s: GameState, wasEnded: boolean): Meta {
  const events = s.seen.filter((id) => !meta.events.includes(id));
  const have = meta.legend[p.id] ?? [];
  const cards = milestones(p, s)
    .filter((m) => m.done && !have.includes(m.id))
    .map((m) => m.id);
  const newEnding = !!s.ending && !wasEnded;
  const unlock = !meta.unlocked && 'pro' in s.flags;
  if (!events.length && !cards.length && !newEnding && !unlock) return meta;
  const next: Meta = { ...meta, events: [...meta.events, ...events], legend: { ...meta.legend, [p.id]: [...have, ...cards] }, unlocked: meta.unlocked || unlock };
  if (newEnding) {
    next.runs = meta.runs + 1;
    next.best = Math.max(meta.best, s.score);
    if (!meta.endings.includes(s.ending!)) next.endings = [...meta.endings, s.ending!];
  }
  write(META, next);
  return next;
}
