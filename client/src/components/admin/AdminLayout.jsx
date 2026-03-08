import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'
import ThemeToggle from '../ui/ThemeToggle'
import Badge from '../ui/Badge'
import { useState } from 'react'

const navLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/questions', label: 'Questions' },
  { to: '/admin/analytics', label: 'Analytics' },
]

export default function AdminLayout() {
  const { signOut } = useAdmin()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Admin Navbar */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-[800] tracking-tighter" style={{ color: 'var(--text)' }}>
              FORGE
            </span>
            <Badge color="#a78bfa">ADMIN</Badge>
          </div>

          {/* Center — Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium no-underline transition-colors ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-white/5 hidden md:block"
              style={{ color: 'var(--muted)' }}
            >
              Logout
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1"
              style={{ color: 'var(--text)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm no-underline ${isActive ? 'bg-white/10' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)' }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
