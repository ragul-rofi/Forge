import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Target, BarChart3, Map, Zap,
  Cloud, Code2, BrainCircuit, ShieldCheck,
  Palette, Network, Briefcase, DatabaseZap,
} from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../lib/constants'

const DOMAINS = Object.entries(DOMAIN_NAMES).map(([key, name]) => ({
  key,
  name,
  color: DOMAIN_COLORS[key],
}))

const DOMAIN_META = {
  cloud:      { icon: Cloud,       tagline: 'Build what runs the internet' },
  fullstack:  { icon: Code2,       tagline: 'Frontend to backend, end to end' },
  data:       { icon: DatabaseZap, tagline: 'Turn numbers into decisions' },
  ai:         { icon: BrainCircuit,tagline: 'Teach machines to think' },
  cyber:      { icon: ShieldCheck, tagline: 'Defend what others build' },
  design:     { icon: Palette,     tagline: 'Shape how people experience tech' },
  networking: { icon: Network,     tagline: 'Connect everything, everywhere' },
  business:   { icon: Briefcase,   tagline: 'Lead products and teams' },
}

const STEPS = [
  { num: '01', title: 'Answer honestly', desc: 'No right or wrong. Just how you actually think.' },
  { num: '02', title: 'We read the signals', desc: 'What you enjoy, avoid, and naturally lean toward.' },
  { num: '03', title: 'Get your domain', desc: 'A real match — with salary data, roadmap, and next step.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-[800] tracking-tighter" style={{ color: 'var(--text)' }}>
          FORGE
        </span>
        <ThemeToggle />
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        <DomainOrbit />

        <RevealOnScroll>
          <span className="text-sm font-medium mb-8 block" style={{ color: 'var(--muted)' }}>Student Career Profiler</span>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-[800] tracking-tight leading-[0.95] mb-8 relative z-10">
            <span style={{ color: 'var(--muted2)' }}>Don't find</span>
            <br />
            <span style={{ color: 'var(--muted2)' }}>your path.</span>
            <br />
            <span className="relative" style={{ color: 'var(--text)' }}>
              Forge it
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="var(--text)" strokeWidth="2" fill="none" opacity="0.3" />
              </svg>
            </span>
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={160}>
          <p className="text-base md:text-lg max-w-lg mb-12 leading-relaxed relative z-10" style={{ color: 'var(--muted)' }}>
            12 questions. No jargon. No guessing.<br className="hidden md:block" />
            Just an honest look at who you are — and where that leads in tech.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={240}>
          <Link to="/quiz" className="btn-primary text-base md:text-lg px-12 py-4 no-underline inline-block relative z-10 group">
            <span className="inline-flex items-center gap-2">
              Find My Path
              <ArrowRight size={18} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
          <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
            No sign-up required · Takes 4–12 min
          </p>
        </RevealOnScroll>
      </section>

      {/* How it works */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
          <RevealOnScroll>
            <h2 className="text-3xl md:text-4xl font-[800] tracking-tight mb-16" style={{ color: 'var(--text)' }}>
              How it works
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map((step, i) => (
              <RevealOnScroll key={step.num} delay={i * 100}>
                <div className="relative">
                  <span className="text-[64px] md:text-[80px] font-[800] leading-none block mb-3"
                    style={{ color: 'var(--border)', opacity: 0.5 }}>
                    {step.num}
                  </span>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {step.desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Domain showcase */}
      <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl font-[800] tracking-tight mb-4" style={{ color: 'var(--text)' }}>
            8 domains you could land in
          </h2>
          <p className="text-sm mb-12 max-w-md" style={{ color: 'var(--muted)' }}>
            Each one comes with real salary data, difficulty ratings, and a phase-by-phase roadmap.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DOMAINS.map((d, i) => (
            <RevealOnScroll key={d.key} delay={i * 60}>
              <DomainShowcard domain={d} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* What you get section */}
      <section className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
          <RevealOnScroll>
            <h2 className="text-3xl md:text-4xl font-[800] tracking-tight mb-16" style={{ color: 'var(--text)' }}>
              Not just a label. A real plan.
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-4">
            <RevealOnScroll delay={0}>
              <ResultPreviewCard
                icon={<Target size={20} strokeWidth={1.5} />}
                title="Your domain match"
                desc="Based on how you think — not what you know. Primary + secondary domain."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <ResultPreviewCard
                icon={<BarChart3 size={20} strokeWidth={1.5} />}
                title="Real salary ranges"
                desc="No hype. Actual entry, mid, and senior numbers for your domain in India."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={160}>
              <ResultPreviewCard
                icon={<Map size={20} strokeWidth={1.5} />}
                title="Phase-by-phase roadmap"
                desc="Certifications, tools, and projects — broken into 3 clear phases."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={240}>
              <ResultPreviewCard
                icon={<Zap size={20} strokeWidth={1.5} />}
                title="One concrete next step"
                desc="Not a list. A single thing you can do this week to start."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Three paths preview */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl font-[800] tracking-tight mb-4" style={{ color: 'var(--text)' }}>
            Pick your starting point
          </h2>
          <p className="text-sm mb-12 max-w-md" style={{ color: 'var(--muted)' }}>
            Whether you're lost, exploring, or already have a direction — there's a mode for you.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-4">
          <RevealOnScroll delay={0}>
            <PathCard
              label="NO IDEA"
              title="Start from scratch"
              desc="12 questions · ~5 min"
              detail="Figure out who you are first."
            />
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <PathCard
              label="ROUGH IDEA"
              title="Go deeper"
              desc="25 questions · ~12 min"
              detail="Cut through the noise."
            />
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <PathCard
              label="ALREADY DECIDED"
              title="Test my choice"
              desc="8 questions · ~4 min"
              detail="Honest fit check."
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight leading-[1.05] mb-6" style={{ color: 'var(--text)' }}>
              Stop scrolling.<br />Start building.
            </h2>
            <p className="text-base mb-10 max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
              You already know you're curious. That's enough.
            </p>
            <Link to="/quiz" className="btn-primary text-base md:text-lg px-12 py-4 no-underline inline-block group">
              <span className="inline-flex items-center gap-2">
                Take the Quiz
                <ArrowRight size={18} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            FORGE · {new Date().getFullYear()}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Built for students who don't settle.
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ——— Sub-components ——— */

function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function DomainOrbit() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ opacity: 0.12 }}>
      {DOMAINS.map((d, i) => {
        const angle = (i / DOMAINS.length) * Math.PI * 2
        const radius = 260
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <div
            key={d.key}
            className="absolute rounded-full animate-pulse"
            style={{
              width: 10 + (i % 3) * 6,
              height: 10 + (i % 3) * 6,
              backgroundColor: d.color,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '3s',
            }}
          />
        )
      })}
      <div
        className="absolute rounded-full border"
        style={{
          width: 520,
          height: 520,
          borderColor: 'var(--border)',
          opacity: 0.5,
        }}
      />
    </div>
  )
}

function DomainShowcard({ domain }) {
  const [hovered, setHovered] = useState(false)
  const meta = DOMAIN_META[domain.key]
  const Icon = meta.icon

  return (
    <div
      className="card cursor-default group relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: '28px 24px', minHeight: 160 }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${domain.color}22 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Decorative grid dots */}
      <div className="absolute bottom-3 right-3 grid grid-cols-3 gap-1 transition-opacity duration-500"
        style={{ opacity: hovered ? 0.15 : 0.05 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: domain.color }} />
        ))}
      </div>

      {/* Icon container */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: hovered ? `${domain.color}18` : 'var(--surface)',
          border: `1px solid ${hovered ? `${domain.color}30` : 'var(--border)'}`,
        }}
      >
        <Icon
          size={20}
          strokeWidth={1.5}
          className="transition-colors duration-300"
          style={{ color: hovered ? domain.color : 'var(--muted2)' }}
        />
      </div>

      {/* Name */}
      <h3
        className="text-sm font-semibold mb-1.5 transition-colors duration-300"
        style={{ color: hovered ? 'var(--text)' : 'var(--muted2)' }}
      >
        {domain.name}
      </h3>

      {/* Tagline */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        {meta.tagline}
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 w-full h-[2px] transition-all duration-500"
        style={{
          backgroundColor: domain.color,
          opacity: hovered ? 0.8 : 0,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
        }}
      />
    </div>
  )
}

function ResultPreviewCard({ icon, title, desc }) {
  return (
    <div className="card flex gap-4 items-start" style={{ padding: '24px' }}>
      <div className="shrink-0 mt-0.5" style={{ color: 'var(--muted2)' }}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
      </div>
    </div>
  )
}

function PathCard({ label, title, desc, detail }) {
  return (
    <div className="card flex flex-col h-full" style={{ padding: '24px' }}>
      <span className="text-xs font-medium mb-3 block" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--muted2)' }}>{desc}</p>
      <p className="text-sm mt-auto" style={{ color: 'var(--muted)' }}>{detail}</p>
    </div>
  )
}
