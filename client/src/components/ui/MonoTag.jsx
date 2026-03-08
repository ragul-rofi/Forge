export default function MonoTag({ children, className = '' }) {
  return (
    <span className={`section-label ${className}`}>
      {children}
    </span>
  )
}
