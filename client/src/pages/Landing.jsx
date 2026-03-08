import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-[800] tracking-tighter" style={{ color: 'var(--text)' }}>
          FORGE
        </span>
        <ThemeToggle />
      </nav>

      {/* Hero Section */}
      <section className="fade-in flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 md:pt-28 md:pb-32">
        <span className="section-label mb-6">STUDENT CAREER PROFILER</span>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-[800] tracking-tight leading-none mb-8">
          <span style={{ color: 'var(--muted)' }}>Don't find your path.</span>
          <br />
          <span style={{ color: 'var(--text)' }}>Forge it.</span>
        </h1>

        <p className="text-base max-w-md mb-10" style={{ color: 'var(--muted)' }}>
          12 questions. No jargon. No guessing. Just an honest look at
          who you are — and where that actually leads in tech.
        </p>

        {/* Stat chips */}
        <div className="flex items-center gap-3 mb-10 flex-wrap justify-center">
          <StatChip>8 DOMAINS</StatChip>
          <span style={{ color: 'var(--border2)' }}>|</span>
          <StatChip>3 PATHS</StatChip>
          <span style={{ color: 'var(--border2)' }}>|</span>
          <StatChip>REAL SALARY DATA</StatChip>
        </div>

        {/* CTA */}
        <Link to="/quiz" className="btn-primary text-lg px-10 py-4 no-underline inline-block mb-4">
          Find My Path →
        </Link>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Takes 4–12 minutes. No signup required to start.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            title="No tech knowledge needed"
            description="Questions are about how you think, not what you know."
          />
          <FeatureCard
            title="Honest about difficulty and salary"
            description="We show you real numbers and real timelines. No hype."
          />
          <FeatureCard
            title="A roadmap, not a list"
            description="You leave with phases, certifications, and one next step."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          FORGE · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}

function StatChip({ children }) {
  return (
    <span
      className="font-mono text-[10px] tracking-[0.15em] px-3 py-1.5 border"
      style={{ borderColor: 'var(--border2)', color: 'var(--muted2)', borderRadius: '2px' }}
    >
      {children}
    </span>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="card">
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        {description}
      </p>
    </div>
  )
}
