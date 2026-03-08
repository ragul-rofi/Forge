import { DOMAIN_COLORS } from '../../lib/constants'

export default function DomainDot({ domain, size = 8 }) {
  const color = DOMAIN_COLORS[domain] || '#888'

  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  )
}
