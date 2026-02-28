import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function AuthCallbackPage() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMe().then(() => {
      const user = useAuthStore.getState().user
      if (user) navigate('/units', { replace: true })
      else navigate('/?error=auth_failed', { replace: true })
    }).catch(() => navigate('/?error=auth_failed', { replace: true }))
  }, [fetchMe, navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f172a', color: '#94a3b8',
    }}>
      Signing in…
    </div>
  )
}
