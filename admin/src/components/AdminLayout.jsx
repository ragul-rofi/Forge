import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { LayoutDashboard, Users, FileQuestion, Map, BarChart3, LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'
import Badge from './ui/Badge'
import Logo from './ui/Logo'
import { useState } from 'react'

const navLinks = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/questions', label: 'Questions', icon: FileQuestion },
  { to: '/roadmaps', label: 'Roadmaps', icon: Map },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const { signOut } = useAdmin()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
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
            <Logo height={22} />
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
                  `px-3 py-1.5 rounded-md text-sm font-medium no-underline transition-colors inline-flex items-center gap-1.5 ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                })}
              >
                <link.icon size={15} />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-white/5 hidden md:inline-flex items-center gap-1.5"
              style={{ color: 'var(--muted)' }}
            >
              <LogOut size={15} />
              Logout
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1"
              style={{ color: 'var(--text)' }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm no-underline ${isActive ? 'bg-white/10' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                })}
              >
                <link.icon size={15} />
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)' }}
            >
              <LogOut size={15} />
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
