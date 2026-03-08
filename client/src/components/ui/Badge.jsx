export default function Badge({ children, color, className = '' }) {
  const style = color
    ? { backgroundColor: `${color}15`, color, borderColor: `${color}40` }
    : {}

  return (
    <span
      className={`tag ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
