import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { character, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Character', path: '/character' },
    { label: 'Rewards', path: '/rewards' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top navigation */}
      <nav
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            letterSpacing: '0.15em',
            color: 'var(--color-gold)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          Zivara
        </span>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <span
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  borderBottom: isActive ? '1px solid var(--color-gold)' : '1px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.color = 'var(--color-text)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                {item.label}
              </span>
            )
          })}
        </div>

        {/* Character info and logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {character && (
            <span
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}
            >
              {character.name}
              <span
                style={{
                  marginLeft: '0.5rem',
                  color: 'var(--color-gold-dim)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  fontStyle: 'normal',
                }}
              >
                TL {character.totalLevel}
              </span>
            </span>
          )}
          <span
            onClick={handleLogout}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--color-red-bright)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-faint)')
            }
          >
            Leave
          </span>
        </div>
      </nav>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}