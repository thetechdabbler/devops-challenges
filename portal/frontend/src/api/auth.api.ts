import { request } from './client'

export interface User {
  id: number
  username: string
  avatarUrl: string
}

export async function fetchMe(): Promise<User> {
  return request<User>('/api/me')
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
