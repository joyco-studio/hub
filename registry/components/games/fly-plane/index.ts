export { FlyPlane } from './fly-plane'
export { useFlyPlane } from './use-fly-plane'
export type { UseFlyPlaneReturn } from './use-fly-plane'
export { DEFAULT_CONFIG, DEFAULT_COLORS, GAME_CONSTANTS, KEY_BINDINGS, CANVAS } from './config'
export { mergeConfig, resolveCssColor, formatScore, storage } from './utils'
export type {
  FlyPlaneProps,
  FlyPlaneConfig,
  FlyPlaneColors,
  GameState,
  HudState,
  DeepPartial,
  World,
  Enemy,
  Boss,
  Bullet,
  Particle,
  Player,
} from './types'
export { renderWorld } from './render'
export type { ResolvedColors } from './render'
