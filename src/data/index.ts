// 고를 수 있는 선수 팩. needs가 있는 팩은 그 조건을 채워야 열린다.
import type { Pack } from '../engine/types';
import { kangin } from './kangin';
import { park } from './park';
import { son } from './son';

export const packs: { pack: Pack; face: string; locked: boolean }[] = [
  { pack: kangin, face: '🦇', locked: false },
  { pack: son, face: '🐓', locked: true },
  { pack: park, face: '👹', locked: true },
];
