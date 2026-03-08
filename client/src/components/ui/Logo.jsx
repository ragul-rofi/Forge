import { useTheme } from '../../hooks/useTheme'

export default function Logo({ height = 28, className = '' }) {
  const { theme } = useTheme()
  const src = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'

  return (
    <img
      src={src}
      alt="FORGE"
      style={{ height }}
      className={`block ${className}`}
      draggable={false}
    />
  )
}
