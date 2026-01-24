'use client'

import * as React from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { ProfileContextType, UserProfile } from './types'

const ProfileContext = createContext<ProfileContextType | null>(null)

export function useProfileContext() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('Must be used within ProfileProvider')
  return ctx
}

export function ProfileProvider({
  profile,
  currentUserId,
  children,
}: {
  profile: UserProfile
  currentUserId: string
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({
      profile,
      isAdmin: profile.role === 'admin',
      isOwner: profile.id === currentUserId,
      displayName: profile.name || profile.email.split('@')[0],
      memberSince: new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    }),
    [profile, currentUserId]
  )

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}
