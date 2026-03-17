import { Link, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'

const tabs = [
  { to: '/dashboard', label: 'MY ROADMAP' },
  { to: '/dashboard/progress', label: 'PROGRESS' },
  { to: '/dashboard/explore', label: 'EXPLORE' },
]

export default function DashboardNav({ onLogout, onSriniOpen }) {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
        <Link to="/" className="no-underline"><Logo height={22} /></Link>
        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="no-underline text-xs px-3 py-2"
              style={{
                color: pathname === tab.to ? 'var(--text)' : 'var(--muted2)',
                borderBottom: pathname === tab.to ? '2px solid var(--accent)' : '2px solid transparent',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSriniOpen}
            className="text-xs px-3 py-1.5"
            style={{ backgroundColor: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
          >
            Srini
          </button>
          <ThemeToggle />
          <button onClick={onLogout} className="text-xs" style={{ color: 'var(--muted)' }}>Logout</button>
        </div>
      </div>
    </nav>
  )
}
