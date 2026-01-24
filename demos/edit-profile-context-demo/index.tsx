'use client'

import * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  EditProfileProvider,
  useEditProfileContext,
} from './edit-profile-context'
import type { ProfileFormState } from './types'

// --- UI Components ---
function EditProfileForm() {
  const { formState, errors, onChange } = useEditProfileContext()

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

function EditProfileActions() {
  const { hasChanges, isSaving, onSave, onReset } = useEditProfileContext()

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onReset}
        disabled={!hasChanges || isSaving}
        className={cn(
          'text-muted-foreground text-sm transition-colors',
          hasChanges && !isSaving
            ? 'hover:text-foreground cursor-pointer'
            : 'cursor-not-allowed opacity-50'
        )}
      >
        Reset
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
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

function ChangeIndicator() {
  const { hasChanges, formState, initialData } = useEditProfileContext()

  return (
    <div
      className={cn(
        'rounded-lg p-3 transition-colors',
        hasChanges ? 'bg-amber-500/10' : 'bg-muted/30'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'size-2 rounded-full transition-colors',
            hasChanges ? 'bg-amber-500' : 'bg-muted-foreground/30'
          )}
        />
        <p className="text-xs font-medium">
          {hasChanges ? 'Unsaved changes' : 'No changes'}
        </p>
      </div>
      {hasChanges && (
        <div className="text-muted-foreground mt-2 space-y-1 font-mono text-xs">
          {formState.name !== initialData.name && (
            <p>
              name: &quot;{initialData.name}&quot; → &quot;{formState.name}
              &quot;
            </p>
          )}
          {formState.bio !== initialData.bio && (
            <p>bio: changed ({formState.bio.length} chars)</p>
          )}
        </div>
      )}
    </div>
  )
}

// --- Demo ---
const initialProfile: ProfileFormState = {
  name: 'Jane Cooper',
  bio: 'Senior Developer at Acme Corp.',
}

export function EditProfileContextDemo() {
  const [savedData, setSavedData] = useState(initialProfile)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (data: ProfileFormState) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSavedData(data)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-6">
      {/* Success toast */}
      {showSuccess && (
        <div className="animate-in slide-in-from-top-2 fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2">
          <p className="text-sm font-medium text-green-600">Profile saved!</p>
        </div>
      )}

      <EditProfileProvider initialData={savedData} onSubmit={handleSubmit}>
        <div className="bg-card border-border space-y-4 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full text-lg font-medium">
              {savedData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold">Edit Profile</h2>
              <p className="text-muted-foreground text-sm">
                Update your profile information
              </p>
            </div>
          </div>

          <EditProfileForm />
          <EditProfileActions />
        </div>

        <ChangeIndicator />
      </EditProfileProvider>

      {/* Tips */}
      <div className="text-muted-foreground space-y-1 text-xs">
        <p>Try:</p>
        <ul className="list-inside list-disc space-y-0.5 pl-2">
          <li>Edit fields to see change tracking</li>
          <li>Clear the name field to see validation</li>
          <li>Type more than 200 characters in bio</li>
          <li>Click Reset to restore original values</li>
        </ul>
      </div>
    </div>
  )
}

export default EditProfileContextDemo
