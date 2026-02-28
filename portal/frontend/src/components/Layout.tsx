import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.75rem 1.5rem', background: '#1e293b',
        borderBottom: '1px solid #334155', flexShrink: 0,
      }}>
        <span
          style={{ fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', color: '#f1f5f9' }}
          onClick={() => navigate('/units')}
        >
          DevOps Practice Portal
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <>
              <img
                src={user.avatarUrl}
                alt={user.username}
                style={{ width: 28, height: 28, borderRadius: '50%' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{user.username}</span>
            </>
          )}
          <button
            onClick={() => void handleLogout()}
            style={{
              padding: '0.3rem 0.75rem', background: 'transparent',
              border: '1px solid #475569', color: '#94a3b8',
              borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}
