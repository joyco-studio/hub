export type UserProfile = {
  id: string
  name: string
  email: string
  bio: string
  avatarUrl: string
  role: 'admin' | 'member' | 'guest'
  createdAt: string
}

export type ProfileContextType = {
  profile: UserProfile
  isAdmin: boolean
  isOwner: boolean
  displayName: string
  memberSince: string
}
