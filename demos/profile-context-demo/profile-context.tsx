'use client'

import { createContext, useContext, useMemo } from 'react'
import type { UserProfile } from './types'

type ProfileContextType = {
  profile: UserProfile
  isAdmin: boolean
  isOwner: boolean
  displayName: string
  memberSince: string
}

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
