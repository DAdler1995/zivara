import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

function CrossedSwordsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="16" y2="16" />
      <line x1="16" y1="2" x2="2" y2="16" />
      <line x1="2" y1="5" x2="5" y2="2" />
      <line x1="16" y1="5" x2="13" y2="2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2L3 5v5c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V5L9 2z" />
    </svg>
  )
}

function CoinBagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 5C6.5 3.6 7.6 2.5 9 2.5s2.5 1.1 2.5 2.5" />
      <ellipse cx="9" cy="12" rx="5" ry="4" />
      <line x1="9" y1="10" x2="9" y2="14" />
      <line x1="7" y1="12" x2="11" y2="12" />
    </svg>
  )
}

function LeaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3H5a1 1 0 00-1 1v10a1 1 0 001 1h6" />
      <polyline points="13,11 16,8 13,5" />
      <line x1="16" y1="8" x2="7" y2="8" />
    </svg>
  )
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
    { label: 'Dashboard', path: '/dashboard', icon: <CrossedSwordsIcon /> },
    { label: 'Character', path: '/character', icon: <ShieldIcon /> },
    { label: 'Rewards', path: '/rewards', icon: <CoinBagIcon /> },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">

      {/* Desktop top nav — hidden on mobile */}
      <nav className="hidden md:flex bg-[var(--color-surface)] border-b border-[var(--color-border)] px-8 items-center justify-between h-14 sticky top-0 z-[100]">
        <span
          className="font-display text-xl tracking-[0.15em] text-[var(--color-gold)] cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Zivara
        </span>

        <div className="flex gap-8 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <span
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`font-display text-xs tracking-[0.1em] uppercase font-semibold cursor-pointer pb-0.5 border-b transition-colors duration-150 ${
                  isActive
                    ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
                    : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)]'
                }`}
              >
                {item.label}
              </span>
            )
          })}
        </div>

        <div className="flex items-center gap-5">
          {character && (
            <span className="text-[var(--color-text-muted)] text-sm italic">
              {character.name}
              <span className="ml-2 text-[var(--color-gold-dim)] font-display text-xs not-italic">
                TL {character.totalLevel}
              </span>
            </span>
          )}
          <span
            onClick={handleLogout}
            className="font-display text-[0.75rem] tracking-[0.1em] uppercase text-[var(--color-text-faint)] cursor-pointer transition-colors duration-150 hover:text-[var(--color-red-bright)]"
          >
            Leave
          </span>
        </div>
      </nav>

      {/* Mobile top bar — hidden on desktop */}
      <div className="flex md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] h-11 items-center justify-between px-4 sticky top-0 z-[100]">
        <span
          className="font-display text-lg tracking-[0.15em] text-[var(--color-gold)] cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Zivara
        </span>
        {character && (
          <span className="text-[var(--color-text-muted)] text-sm italic">
            {character.name}
            <span className="ml-2 text-[var(--color-gold-dim)] font-display text-xs not-italic">
              TL {character.totalLevel}
            </span>
          </span>
        )}
      </div>

      {/* Page content */}
      <main className="flex-1 px-4 pt-4 pb-[76px] md:px-8 md:pt-8 md:pb-8 w-full max-w-[1100px] mx-auto">
        {children}
      </main>

      {/* Mobile bottom tab bar — hidden on desktop */}
      <nav
        className="mobile-bottom-nav bg-[var(--color-surface)] border-t border-[var(--color-border)] z-[100]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center h-[60px] gap-1 border-none bg-transparent cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--color-gold)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {item.icon}
              <span className="font-display text-xs tracking-widest uppercase font-semibold">
                {item.label}
              </span>
            </button>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center h-[60px] gap-1 border-none bg-transparent cursor-pointer text-[var(--color-text-faint)] hover:text-[var(--color-red-bright)] transition-colors duration-150"
        >
          <LeaveIcon />
          <span className="font-display text-xs tracking-widest uppercase font-semibold">
            Leave
          </span>
        </button>
      </nav>
    </div>
  )
}
