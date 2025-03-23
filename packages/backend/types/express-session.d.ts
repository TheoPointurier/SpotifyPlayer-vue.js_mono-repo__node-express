import 'express-session'

declare module 'express-session' {
  interface SessionData {
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    expiresAt?: number
  }
}

