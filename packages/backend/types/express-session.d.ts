import 'express-session'
import type { Session } from 'express-session'

declare module 'express-session' {
  interface SessionData {
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
  }
}

import { Request } from "express"

declare module "express" { 
  export interface Request {
    session: Session & Partial<SessionData>
  }
}