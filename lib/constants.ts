const FALLBACK_URL = "http://localhost:3000"
const _VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_URL
const VERCEL_URL = _VERCEL_URL && `https://${_VERCEL_URL}`

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || VERCEL_URL || FALLBACK_URL