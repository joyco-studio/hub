'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { GameSnapshot, GameState } from './types'
import { formatScore } from './utils'

// ============================================================================
// Context
// ============================================================================

interface BrickBreakerUIContextValue {
  snapshot: GameSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  nextLevel: () => void
}

const BrickBreakerUIContext = React.createContext<BrickBreakerUIContextValue | null>(null)

export function useBrickBreakerUI() {
  const context = React.useContext(BrickBreakerUIContext)
  if (!context) {
    throw new Error('BrickBreaker UI components must be used within BrickBreakerRoot')
  }
  return context
}

export const BrickBreakerUIProvider = BrickBreakerUIContext.Provider

// ============================================================================
// HUD Components
// ============================================================================

interface ScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show combo multiplier */
  showCombo?: boolean
}

export function BrickBreakerScore({
  showCombo = true,
  className,
  ...props
}: ScoreProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-score"
      className={cn('flex flex-col', className)}
      {...props}
    >
      <span className="text-foreground font-semibold tabular-nums">
        {formatScore(snapshot.score)}
      </span>
      {showCombo && snapshot.combo > 0 && snapshot.state === 'playing' && (
        <span className="text-muted-foreground text-xs tabular-nums">
          ×{snapshot.combo + 1}
        </span>
      )}
    </div>
  )
}

interface HighScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label prefix */
  label?: string
}

export function BrickBreakerHighScore({
  label = 'HI',
  className,
  ...props
}: HighScoreProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-highscore"
      className={cn('text-muted-foreground tabular-nums', className)}
      {...props}
    >
      {label} {formatScore(snapshot.highScore)}
    </div>
  )
}

interface LevelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show total levels */
  showTotal?: boolean
  /** Label prefix */
  label?: string
}

export function BrickBreakerLevel({
  showTotal = true,
  label = 'LVL',
  className,
  ...props
}: LevelProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-level"
      className={cn('text-muted-foreground tabular-nums', className)}
      {...props}
    >
      {label} {snapshot.level}{showTotal && `/${snapshot.totalLevels}`}
    </div>
  )
}

interface LivesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render function for each life indicator */
  renderLife?: (index: number, isActive: boolean) => React.ReactNode
}

export function BrickBreakerLives({
  renderLife,
  className,
  ...props
}: LivesProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultRenderLife = (index: number) => (
    <span
      key={index}
      className="bg-foreground/80 size-2 rounded-sm"
    />
  )

  return (
    <div
      data-slot="brick-breaker-lives"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {Array.from({ length: snapshot.lives }, (_, i) =>
        renderLife ? renderLife(i, true) : defaultRenderLife(i)
      )}
    </div>
  )
}

// ============================================================================
// Canvas Slot - marks where the canvas should render
// ============================================================================

export interface BrickBreakerCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional class names for the canvas wrapper */
  className?: string
}

/**
 * Slot component that marks where the game canvas should be rendered.
 * Use this to control canvas placement within your layout.
 * Props are passed to the canvas wrapper div.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BrickBreakerCanvas(props: BrickBreakerCanvasProps) {
  // This is a marker component - actual canvas is rendered by BrickBreaker
  // The props are read by BrickBreaker and applied to the canvas wrapper
  return null
}

// Internal marker to identify canvas slot
BrickBreakerCanvas.displayName = 'BrickBreakerCanvas'

// ============================================================================
// HUD Container
// ============================================================================

interface HUDProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerHUD({ children, className, ...props }: HUDProps) {
  return (
    <div
      data-slot="brick-breaker-hud"
      className={cn(
        'flex shrink-0 items-center justify-between p-4 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Overlay Components
// ============================================================================

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerOverlay({ children, className, ...props }: OverlayProps) {
  const { snapshot } = useBrickBreakerUI()

  if (snapshot.state === 'playing') return null

  return (
    <div
      data-slot="brick-breaker-overlay"
      data-state={snapshot.state}
      className={cn(
        'bg-background/90 pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

BrickBreakerOverlay.displayName = 'BrickBreakerOverlay'

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export function BrickBreakerTitle({ children, className, ...props }: TitleProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultTitles: Record<GameState, string> = {
    idle: 'BRICK BREAKER',
    playing: '',
    paused: 'PAUSED',
    won: 'YOU WIN!',
    lost: 'GAME OVER',
    levelComplete: 'LEVEL COMPLETE!',
  }

  return (
    <h2
      data-slot="brick-breaker-title"
      className={cn('text-foreground text-2xl font-bold tracking-tight', className)}
      {...props}
    >
      {children ?? defaultTitles[snapshot.state]}
    </h2>
  )
}

interface MessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export function BrickBreakerMessage({ children, className, ...props }: MessageProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultMessages: Partial<Record<GameState, string>> = {
    idle: 'Click or press Space to start',
    paused: 'Press Space to resume',
    won: snapshot.score >= snapshot.highScore ? 'NEW HIGH SCORE!' : undefined,
    lost: `Score: ${formatScore(snapshot.score)}`,
    levelComplete: `Score: ${formatScore(snapshot.score)}`,
  }

  const message = children ?? defaultMessages[snapshot.state]
  if (!message) return null

  return (
    <p
      data-slot="brick-breaker-message"
      className={cn('text-muted-foreground mt-2', className)}
      {...props}
    >
      {message}
    </p>
  )
}

interface HintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export function BrickBreakerHint({ children, className, ...props }: HintProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultHints: Partial<Record<GameState, string>> = {
    won: 'Press R to play again',
    lost: 'Press R to try again',
    levelComplete: 'Click to continue',
  }

  const hint = children ?? defaultHints[snapshot.state]
  if (!hint) return null

  return (
    <p
      data-slot="brick-breaker-hint"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    >
      {hint}
    </p>
  )
}

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerScoreDisplay({ children, className, ...props }: ScoreDisplayProps) {
  const { snapshot } = useBrickBreakerUI()

  if (snapshot.state === 'idle' || snapshot.state === 'playing') return null

  return (
    <div
      data-slot="brick-breaker-score-display"
      className={cn('text-foreground mt-4 text-lg font-medium', className)}
      {...props}
    >
      {children ?? `Score: ${formatScore(snapshot.score)}`}
    </div>
  )
}

// ============================================================================
// Action Button
// ============================================================================

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export function BrickBreakerActionButton({
  children,
  className,
  onClick,
  ...props
}: ActionButtonProps) {
  const { snapshot, startGame, resumeGame, resetGame, nextLevel } = useBrickBreakerUI()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    
    switch (snapshot.state) {
      case 'idle':
        startGame()
        break
      case 'paused':
        resumeGame()
        break
      case 'won':
      case 'lost':
        resetGame()
        setTimeout(startGame, 100)
        break
      case 'levelComplete':
        nextLevel()
        break
    }
  }

  const defaultLabels: Partial<Record<GameState, string>> = {
    idle: 'Start Game',
    paused: 'Resume',
    won: 'Play Again',
    lost: 'Try Again',
    levelComplete: 'Next Level',
  }

  if (snapshot.state === 'playing') return null

  return (
    <button
      type="button"
      data-slot="brick-breaker-action"
      className={cn(
        'bg-foreground text-background hover:bg-foreground/90 mt-6 rounded-md px-6 py-2 text-sm font-medium transition-colors',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children ?? defaultLabels[snapshot.state]}
    </button>
  )
}

// ============================================================================
// Default UI Preset
// ============================================================================

export function BrickBreakerDefaultUI() {
  return (
    <>
      <BrickBreakerHUD>
        <BrickBreakerScore />
        <BrickBreakerLevel />
        <BrickBreakerHighScore />
      </BrickBreakerHUD>
      
      <BrickBreakerLives className="absolute bottom-4 left-4" />
      
      <BrickBreakerOverlay>
        <BrickBreakerTitle />
        <BrickBreakerMessage />
        <BrickBreakerHint />
      </BrickBreakerOverlay>
    </>
  )
}

