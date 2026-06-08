'use client'

import * as React from 'react'
import { createWorld, skipToNextLevel, startLoop, stepWorld, type LoopHandle } from './engine'
import { renderWorld, type ResolvedColors } from './render'
import { storage } from './utils'
import { GAME_CONSTANTS, KEY_BINDINGS } from './config'
import type { FlyPlaneConfig, GameState, HudState, InputState, World } from './types'

function emptyInput(): InputState {
  return { up: false, down: false, left: false, right: false, fire: false }
}

function hudFromWorld(world: World): HudState {
  return {
    score: world.score,
    lives: world.lives,
    level: world.level,
    highScore: world.highScore,
    phase: world.phase,
  }
}

interface UseFlyPlaneOptions {
  config: FlyPlaneConfig
  getColors: () => ResolvedColors
  onScoreChange?: (score: number) => void
  onStateChange?: (state: GameState) => void
  onGameEnd?: (result: { score: number; level: number }) => void
}

export interface UseFlyPlaneReturn {
  hud: HudState
  start: () => void
  togglePause: () => void
  attachCanvas: (canvas: HTMLCanvasElement | null) => void
}

export function useFlyPlane({
  config,
  getColors,
  onScoreChange,
  onStateChange,
  onGameEnd,
}: UseFlyPlaneOptions): UseFlyPlaneReturn {
  const [hud, setHud] = React.useState<HudState>({
    score: 0,
    lives: config.player.startLives,
    level: 1,
    highScore: storage.getHighScore(),
    phase: 'idle',
  })

  const worldRef = React.useRef<World | null>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const loopRef = React.useRef<LoopHandle | null>(null)
  const inputRef = React.useRef<InputState>(emptyInput())
  const lastHudRef = React.useRef<HudState>(hud)
  const configRef = React.useRef(config)
  const getColorsRef = React.useRef(getColors)
  const cbRef = React.useRef({ onScoreChange, onStateChange, onGameEnd })

  React.useEffect(() => {
    configRef.current = config
  }, [config])
  React.useEffect(() => {
    getColorsRef.current = getColors
  }, [getColors])
  React.useEffect(() => {
    cbRef.current = { onScoreChange, onStateChange, onGameEnd }
  }, [onScoreChange, onStateChange, onGameEnd])

  const pushHudIfChanged = React.useCallback((world: World): void => {
    const next = hudFromWorld(world)
    const prev = lastHudRef.current
    if (
      next.score !== prev.score ||
      next.lives !== prev.lives ||
      next.level !== prev.level ||
      next.highScore !== prev.highScore ||
      next.phase !== prev.phase
    ) {
      const cbs = cbRef.current
      if (next.score !== prev.score) cbs.onScoreChange?.(next.score)
      if (next.phase !== prev.phase) cbs.onStateChange?.(next.phase)
      if (next.phase === 'gameOver' && prev.phase !== 'gameOver') {
        storage.setHighScore(next.highScore)
        cbs.onGameEnd?.({ score: next.score, level: next.level })
      }
      lastHudRef.current = next
      setHud(next)
    }
  }, [])

  const attachCanvas = React.useCallback((canvas: HTMLCanvasElement | null): void => {
    ctxRef.current = canvas ? canvas.getContext('2d') : null
  }, [])

  const togglePause = React.useCallback((): void => {
    const world = worldRef.current
    if (!world) return
    if (world.phase === 'playing') world.phase = 'paused'
    else if (world.phase === 'paused') world.phase = 'playing'
    pushHudIfChanged(world)
  }, [pushHudIfChanged])

  const start = React.useCallback((): void => {
    const world = createWorld(storage.getHighScore(), configRef.current)
    worldRef.current = world
    lastHudRef.current = hudFromWorld(world)
    inputRef.current = emptyInput()
    cbRef.current.onStateChange?.('playing')
    setHud(lastHudRef.current)
  }, [])

  React.useEffect(() => {
    const matches = (codes: readonly string[], code: string) => codes.includes(code)
    const setKey = (code: string, pressed: boolean): boolean => {
      const input = inputRef.current
      if (matches(KEY_BINDINGS.up, code)) {
        input.up = pressed
        return true
      }
      if (matches(KEY_BINDINGS.down, code)) {
        input.down = pressed
        return true
      }
      if (matches(KEY_BINDINGS.left, code)) {
        input.left = pressed
        return true
      }
      if (matches(KEY_BINDINGS.right, code)) {
        input.right = pressed
        return true
      }
      if (matches(KEY_BINDINGS.fire, code)) {
        input.fire = pressed
        return true
      }
      return false
    }

    const onKeyDown = (e: KeyboardEvent): void => {
      if (matches(KEY_BINDINGS.pause, e.code)) {
        togglePause()
        e.preventDefault()
        return
      }
      // Dev-only level skip (stripped from production builds).
      if (process.env.NODE_ENV === 'development' && matches(KEY_BINDINGS.skip, e.code)) {
        const world = worldRef.current
        if (world && world.phase === 'playing') {
          skipToNextLevel(world, configRef.current)
          pushHudIfChanged(world)
        }
        e.preventDefault()
        return
      }
      if (setKey(e.code, true)) e.preventDefault()
    }
    const onKeyUp = (e: KeyboardEvent): void => {
      if (setKey(e.code, false)) e.preventDefault()
    }
    const onVisibility = (): void => {
      const world = worldRef.current
      if (document.hidden && world && world.phase === 'playing') {
        world.phase = 'paused'
        pushHudIfChanged(world)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVisibility)

    loopRef.current = startLoop(
      (fixedStep) => {
        const world = worldRef.current
        if (world && world.phase === 'playing') {
          stepWorld(world, inputRef.current, fixedStep, configRef.current)
          pushHudIfChanged(world)
        }
      },
      () => {
        const world = worldRef.current
        const ctx = ctxRef.current
        if (world && ctx) renderWorld(ctx, world, getColorsRef.current())
      },
      GAME_CONSTANTS.fixedStep,
      GAME_CONSTANTS.maxStepsPerFrame
    )

    return () => {
      loopRef.current?.stop()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [togglePause, pushHudIfChanged])

  return { hud, start, togglePause, attachCanvas }
}
