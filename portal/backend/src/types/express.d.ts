import 'express'

declare global {
  namespace Express {
    interface User {
      id: number
      username: string
      avatarUrl: string
    }
  }
}
