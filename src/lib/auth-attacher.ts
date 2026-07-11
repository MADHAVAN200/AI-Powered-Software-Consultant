import { createMiddleware } from '@tanstack/react-start'
import { db } from './db'

export const attachLocalAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const { data } = await db.auth.getSession()
    const token = data.session?.access_token
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },
)
