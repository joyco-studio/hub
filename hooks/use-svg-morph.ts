'use client'

import { useState, useCallback } from 'react'

export interface UseSvgMorphOptions {
  totalSteps: number
  initialStep?: number
}

export interface UseSvgMorphReturn {
  step: number
  setStep: (step: number) => void
  next: () => void
  prev: () => void
  isFirst: boolean
  isLast: boolean
}

export function useSvgMorph({
  totalSteps,
  initialStep = 0,
}: UseSvgMorphOptions): UseSvgMorphReturn {
  const [step, setStepRaw] = useState(initialStep)

  const clamp = useCallback(
    (value: number) => Math.max(0, Math.min(value, totalSteps - 1)),
    [totalSteps]
  )

  const setStep = useCallback(
    (value: number) => setStepRaw(clamp(value)),
    [clamp]
  )

  const next = useCallback(
    () => setStepRaw((s) => clamp(s + 1)),
    [clamp]
  )

  const prev = useCallback(
    () => setStepRaw((s) => clamp(s - 1)),
    [clamp]
  )

  return {
    step,
    setStep,
    next,
    prev,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
  }
}
