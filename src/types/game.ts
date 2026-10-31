/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type GameTheme = 'OCEAN' | 'SNOW';

export type CameraViewMode = 'CHASE' | 'RETRO_TOP' | 'FIRST_PERSON' | 'CINEMATIC';

export interface CharacterConfig {
  id: string;
  name: string;
  subtitle: string;
  suitColor: number;
  skinColor: number;
  hairColor: number;
  boardColor: number;
  boardStripeColor: number;
  type: 'human' | 'penguin' | 'yeti';
}

export type ObstacleType = 
  | 'ROCK' 
  | 'CORAL' 
  | 'BUOY' 
  | 'ISLAND' 
  | 'WHIRLPOOL'
  | 'PINE_TREE' 
  | 'SNOW_ROCK' 
  | 'ICE_CHASM'
  | 'SLALOM_FLAG';

export type ItemType = 'STAR' | 'BOOST' | 'HEART';

export type RampType = 'STANDARD_RAMP' | 'MEGA_RAMP';

export interface ActiveObstacle {
  id: number;
  type: ObstacleType;
  x: number;
  z: number;
  radius: number;
  rotationY: number;
  scale: number;
}

export interface ActiveItem {
  id: number;
  type: ItemType;
  x: number;
  z: number;
  radius: number;
  collected: boolean;
  bobPhase: number;
}

export interface ActiveRamp {
  id: number;
  type: RampType;
  x: number;
  z: number;
  width: number;
  length: number;
  height: number;
}

export type MonsterState = 'DORMANT' | 'WARNING' | 'HUNTING' | 'RETREATING';

export interface MonsterData {
  state: MonsterState;
  x: number;
  z: number;
  targetX: number;
  speed: number;
  distanceToPlayer: number;
  attackTimer: number;
  surfaceRatio: number; // 0 to 1
  warningCountdown: number;
  activeType: 'KRAKEN' | 'YETI';
}

export interface GameMetrics {
  score: number;
  distance: number;
  highScore: number;
  lives: number;
  maxLives: number;
  speed: number;
  boostMeter: number;
  isBoosting: boolean;
  isInAir: boolean;
  airTricksCount: number;
  monstersEscaped: number;
  theme: GameTheme;
  character: CharacterConfig;
  cameraMode: CameraViewMode;
}
