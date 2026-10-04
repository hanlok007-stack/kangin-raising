// 고를 수 있는 선수 팩과 챕터 진행. 팩은 패러디 표기로 바꿔서 내보낸다.
import type { Pack } from '../engine/types';
import { kangin } from './kangin';
import { park } from './park';
import { parody } from './parody';
import { son } from './son';

// chapter: 이 장까지 열려 있어야 고를 수 있다
export const packs: { pack: Pack; chapter: number }[] = [
  { pack: parody(kangin), chapter: 1 },
  { pack: parody(son), chapter: 3 },
  { pack: parody(park), chapter: 4 },
];

// 1장은 짧고 빠르게 — 여기서 재미를 붙이고, 같은 판이 그대로 2장으로 이어진다.
export const chapters = [
  { n: 1, pack: 'kangin', title: `${packs[0].pack.hero} · 슛둥이 시절`, sub: '방송국 오디션에서 유학 결정까지' },
  { n: 2, pack: 'kangin', title: `${packs[0].pack.hero} · 유럽 사가`, sub: '낯선 땅의 아카데미에서 별들의 팀까지' },
  { n: 3, pack: 'son', title: packs[1].pack.hero, sub: packs[1].pack.tagline },
  { n: 4, pack: 'park', title: packs[2].pack.hero, sub: packs[2].pack.tagline },
];
export const LAST_CHAPTER = chapters.length;

// 지금 이 판이 몇 장인가 (광고 빈도 등에 쓴다)
export function chapterOf(packId: string, year: number): number {
  if (packId === 'kangin') return year < 2012 ? 1 : 2;
  return packId === 'son' ? 3 : 4;
}

// 이 판의 진행으로 몇 장까지 열리는가. final: 커리어를 끝까지 마친 엔딩인가
export function reached(packId: string, year: number, final: boolean): number {
  if (packId === 'kangin') return year >= 2024 || final ? 3 : year >= 2012 ? 2 : 1;
  if (packId === 'son') return year >= 2026 || final ? 4 : 3;
  return final ? LAST_CHAPTER + 1 : 4;
}
