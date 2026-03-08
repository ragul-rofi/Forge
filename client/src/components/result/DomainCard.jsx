import { DOMAIN_COLORS, DOMAIN_NAMES } from '../../lib/constants'

export default function DomainCard({ domain, large = false }) {
  const color = DOMAIN_COLORS[domain] || '#888'
  const name = DOMAIN_NAMES[domain] || domain

  return (
    <div
      className={`text-center ${large ? 'py-6' : 'py-3'}`}
    >
      <h3
        className={`font-[800] tracking-tight ${large ? 'text-3xl md:text-5xl' : 'text-xl'}`}
        style={{ color }}
      >
        {name}
      </h3>
    </div>
  )
}
