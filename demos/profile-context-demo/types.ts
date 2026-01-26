export type UserRole = 'admin' | 'editor' | 'viewer'

export type UserProfile = {
  id: string
  name: string
  email: string
  bio: string
  avatarUrl: string
  role: UserRole
  createdAt: string
}

export type CurrentUser = {
  id: string
  role: UserRole
}
