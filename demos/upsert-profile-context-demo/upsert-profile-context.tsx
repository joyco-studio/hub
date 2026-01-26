'use client'

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react'
import type { ProfileFormState } from './types'

type UpsertProfileContextType = {
  formState: ProfileFormState
  initialData: ProfileFormState
  isCreateMode: boolean
  hasChanges: boolean
  isSaving: boolean
  errors: Partial<Record<keyof ProfileFormState, string>>
  onChange: (field: keyof ProfileFormState, value: string) => void
  onSave: () => void
  onReset: () => void
}

const UpsertProfileContext = createContext<UpsertProfileContextType | null>(
  null
)

export function useUpsertProfileContext() {
  const ctx = useContext(UpsertProfileContext)
  if (!ctx) throw new Error('Must be used within UpsertProfileProvider')
  return ctx
}

const defaultFormState: ProfileFormState = {
  name: '',
  bio: '',
}

export function UpsertProfileProvider({
  initialData,
  onSubmit,
  children,
}: {
  initialData?: Partial<ProfileFormState> // Optional for create mode
  onSubmit: (data: ProfileFormState) => Promise<void>
  children: React.ReactNode
}) {
  // Merge defaults with any provided initial data
  const startingData: ProfileFormState = {
    ...defaultFormState,
    ...initialData,
  }

  const isCreateMode = !initialData || Object.keys(initialData).length === 0

  const [formState, setFormState] = useState<ProfileFormState>(startingData)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormState, string>>
  >({})
  const isDiscardedRef = useRef(false)

  // For create: hasChanges = any field filled out
  // For edit: hasChanges = any field different from initial
  const hasChanges = useMemo(() => {
    if (isCreateMode) {
      return formState.name.trim() !== '' || formState.bio.trim() !== ''
    }
    return JSON.stringify(formState) !== JSON.stringify(startingData)
  }, [formState, startingData, isCreateMode])

  const validate = useCallback(
    (data: ProfileFormState) => {
      const newErrors: Partial<Record<keyof ProfileFormState, string>> = {}
      if (!data.name.trim()) {
        newErrors.name = 'Name is required'
      }
      if (data.bio.length > 200) {
        newErrors.bio = 'Bio must be 200 characters or less'
      }
      return newErrors
    },
    []
  )

  const onChange = useCallback(
    (field: keyof ProfileFormState, value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    []
  )

  const onSave = useCallback(async () => {
    const validationErrors = validate(formState)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)
    try {
      await onSubmit(formState)
    } finally {
      setIsSaving(false)
    }
  }, [formState, onSubmit, validate])

  const onReset = useCallback(() => {
    setFormState(startingData)
    setErrors({})
    isDiscardedRef.current = true
  }, [startingData])

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isSaving && !isDiscardedRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges, isSaving])

  const value = useMemo(
    () => ({
      formState,
      initialData: startingData,
      isCreateMode,
      hasChanges,
      isSaving,
      errors,
      onChange,
      onSave,
      onReset,
    }),
    [
      formState,
      startingData,
      isCreateMode,
      hasChanges,
      isSaving,
      errors,
      onChange,
      onSave,
      onReset,
    ]
  )

  return (
    <UpsertProfileContext.Provider value={value}>
      {children}
    </UpsertProfileContext.Provider>
  )
}
