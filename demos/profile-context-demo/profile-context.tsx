'use client'

import { createContext, useContext, useMemo } from 'react'
import type { CurrentUser, UserProfile } from './types'

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
  currentUser,
  children,
}: {
  profile: UserProfile
  currentUser: CurrentUser
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({
      profile,
      isAdmin: currentUser.role === 'admin',
      isOwner: profile.id === currentUser.id,
      displayName: profile.name || profile.email.split('@')[0],
      memberSince: new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    }),
    [profile, currentUser]
  )

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}
