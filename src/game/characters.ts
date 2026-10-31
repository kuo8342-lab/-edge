/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterConfig } from '../types/game';

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'classic-surfer',
    name: 'Edge 經典衝浪客',
    subtitle: '原汁原味的復古衝浪手，轉向平穩靈巧',
    suitColor: 0x00d2d3,
    skinColor: 0xffdbac,
    hairColor: 0xe58e26,
    boardColor: 0xff3838,
    boardStripeColor: 0xffffff,
    type: 'human'
  },
  {
    id: 'cyber-racer',
    name: '疾速浪者 Kai',
    subtitle: '高科技潛水裝與流線型碳纖板',
    suitColor: 0x1e272e,
    skinColor: 0xd2a679,
    hairColor: 0x2ed573,
    boardColor: 0x00cec9,
    boardStripeColor: 0xff4757,
    type: 'human'
  },
  {
    id: 'tux-penguin',
    name: '極地企鵝 Tux',
    subtitle: '身手敏捷的小企鵝，滑雪與衝浪雙棲明星',
    suitColor: 0x2f3542,
    skinColor: 0xffa502,
    hairColor: 0xffffff,
    boardColor: 0xffa502,
    boardStripeColor: 0x2ed573,
    type: 'penguin'
  },
  {
    id: 'groovy-yeti',
    name: '酷玩小雪怪 Snowy',
    subtitle: '戴著墨鏡的雪人同族，想衝破海怪防線',
    suitColor: 0xf1f2f6,
    skinColor: 0x70a1ff,
    hairColor: 0xffffff,
    boardColor: 0x9b59b6,
    boardStripeColor: 0xf1c40f,
    type: 'yeti'
  }
];
