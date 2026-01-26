'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'
import { ProfileProvider, useProfileContext } from './profile-context'
import type { CurrentUser, UserProfile } from './types'
import { EyeIcon } from 'lucide-react'

// --- UI Components (using context) ---
function ProfileHeader() {
  const { displayName, isAdmin, memberSince, profile } = useProfileContext()

  return (
    <div className="flex items-start gap-4">
      <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-medium">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold">{displayName}</h2>
          {isAdmin && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Admin View
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{profile.email}</p>
        <p className="text-muted-foreground text-xs">
          Member since {memberSince}
        </p>
      </div>
    </div>
  )
}

function ProfileBio() {
  const { profile } = useProfileContext()

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium">Bio</h3>
      <p className="text-muted-foreground text-sm">{profile.bio}</p>
    </div>
  )
}

function ProfileActions() {
  const { isOwner, isAdmin } = useProfileContext()

  return (
    <div className="flex gap-2">
      <button className="bg-muted hover:bg-muted/80 rounded-md border border-transparent px-3 py-1.5 text-sm transition-colors">
        Share Profile
      </button>
      {isOwner && (
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md border border-transparent px-3 py-1.5 text-sm transition-colors">
          Edit Profile
        </button>
      )}
      {isAdmin && !isOwner && (
        <button className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/20">
          Ban User
        </button>
      )}
    </div>
  )
}

// --- Demo ---
const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Jane Cooper',
  email: 'jane@example.com',
  bio: 'Senior Developer at Acme Corp. Passionate about React, TypeScript, and clean architecture patterns.',
  avatarUrl: '',
  role: 'editor',
  createdAt: '2023-03-15T00:00:00.000Z',
}

export function ProfileContextDemo() {
  const [viewAs, setViewAs] = React.useState<'owner' | 'admin' | 'visitor'>(
    'owner'
  )

  const currentUser: CurrentUser =
    viewAs === 'owner'
      ? { id: mockProfile.id, role: mockProfile.role }
      : viewAs === 'admin'
        ? { id: 'admin-user', role: 'admin' }
        : { id: 'visitor-user', role: 'viewer' }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-6">
      {/* View switcher */}
      <div className="space-y-2">
        <div className="bg-muted/50 inline-flex rounded-lg p-1">
          {(['owner', 'admin', 'visitor'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setViewAs(role)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                viewAs === role
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {viewAs === role && <EyeIcon className="size-4" />}
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Profile card */}
      <ProfileProvider profile={mockProfile} currentUser={currentUser}>
        <div className="bg-card border-border space-y-4 rounded-xl border p-4">
          <ProfileHeader />
          <ProfileBio />
          <ProfileActions />
        </div>
      </ProfileProvider>
    </div>
  )
}

export default ProfileContextDemo
