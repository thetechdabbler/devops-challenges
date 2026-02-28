import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function ProtectedRoute() {
  const { user, loading, fetchMe } = useAuthStore()

  useEffect(() => {
    if (loading) void fetchMe()
  }, [loading, fetchMe])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}
