'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  UpsertProfileProvider,
  useUpsertProfileContext,
} from './upsert-profile-context'
import type { ProfileFormState } from './types'

// --- UI Components ---
function ProfileForm() {
  const { formState, errors, onChange } = useUpsertProfileContext()

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={formState.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={cn(
            'border-border bg-background w-full rounded-md border px-3 py-2 text-sm outline-none',
            'focus:ring-ring focus:ring-2',
            errors.name && 'border-red-500 focus:ring-red-500/30'
          )}
          placeholder="Your name"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={formState.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={3}
          className={cn(
            'border-border bg-background w-full resize-none rounded-md border px-3 py-2 text-sm outline-none',
            'focus:ring-ring focus:ring-2',
            errors.bio && 'border-red-500 focus:ring-red-500/30'
          )}
          placeholder="Tell us about yourself"
        />
        <div className="flex items-center justify-between">
          {errors.bio ? (
            <p className="text-xs text-red-500">{errors.bio}</p>
          ) : (
            <span />
          )}
          <p
            className={cn(
              'text-muted-foreground text-xs',
              formState.bio.length > 200 && 'text-red-500'
            )}
          >
            {formState.bio.length}/200
          </p>
        </div>
      </div>
    </div>
  )
}

function ProfileActions() {
  const { isCreateMode, hasChanges, isSaving, onSave, onReset } =
    useUpsertProfileContext()

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={!hasChanges || isSaving}
          className={cn(
            'text-muted-foreground bg-muted rounded-md px-4 py-2 text-sm transition-colors',
            hasChanges && !isSaving
              ? 'hover:text-foreground cursor-pointer'
              : 'cursor-not-allowed opacity-50'
          )}
        >
          {isCreateMode ? 'Clear' : 'Reset'}
        </button>
        <button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            'bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors',
            hasChanges && !isSaving
              ? 'hover:bg-primary/90'
              : 'cursor-not-allowed opacity-50'
          )}
        >
          {isSaving
            ? isCreateMode
              ? 'Creating...'
              : 'Saving...'
            : isCreateMode
              ? 'Create Profile'
              : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// --- Demo ---
type Mode = 'create' | 'edit'

const existingProfile: ProfileFormState = {
  name: 'Jane Cooper',
  bio: 'Senior Developer at Acme Corp.',
}

export function UpsertProfileContextDemo() {
  const [mode, setMode] = useState<Mode>('edit')
  const [profiles, setProfiles] = useState<ProfileFormState[]>([
    existingProfile,
  ])
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Key to force re-mount when switching modes
  const [formKey, setFormKey] = useState(0)

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setFormKey((k) => k + 1) // Reset form state
  }

  const handleSubmit = async (data: ProfileFormState) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (mode === 'create') {
      setProfiles((prev) => [...prev, data])
      setSuccessMessage('Profile created!')
    } else {
      setProfiles((prev) => prev.map((p, i) => (i === 0 ? data : p)))
      setSuccessMessage('Profile saved!')
    }

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)

    // After creating, switch to edit mode with the new profile
    if (mode === 'create') {
      setMode('edit')
      setFormKey((k) => k + 1)
    }
  }

  // Get initial data based on mode
  const initialData = mode === 'edit' ? profiles[0] : undefined

  return (
    <div className="relative mx-auto w-full max-w-md space-y-4 p-6">
      {/* Success toast */}
      {showSuccess && (
        <div className="animate-in slide-in-from-top-2 absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 backdrop-blur-lg">
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="bg-muted flex rounded-lg p-1">
        <button
          onClick={() => handleModeChange('create')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'create'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Create New
        </button>
        <button
          onClick={() => handleModeChange('edit')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'edit'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Edit Existing
        </button>
      </div>

      {/* Same form, different initial data */}
      <UpsertProfileProvider
        key={formKey}
        initialData={initialData}
        onSubmit={handleSubmit}
      >
        <div className="bg-card border-border space-y-4 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full text-lg font-medium">
              {mode === 'edit' ? (
                profiles[0].name.charAt(0).toUpperCase()
              ) : (
                <span className="text-muted-foreground">?</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold">
                {mode === 'create' ? 'Create Profile' : 'Edit Profile'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === 'create'
                  ? 'Fill in your profile information'
                  : 'Update your profile information'}
              </p>
            </div>
          </div>

          <ProfileForm />
          <ProfileActions />
        </div>
      </UpsertProfileProvider>
    </div>
  )
}

export default UpsertProfileContextDemo
