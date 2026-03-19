export default function Badge({ children, color, className = '', style: customStyle }) {
  const style = color
    ? { backgroundColor: `${color}15`, color, borderColor: `${color}40` }
    : { ...(customStyle || {}) }

  const mergedStyle = customStyle && color ? { ...style, ...customStyle } : style

  return (
    <span
      className={`tag ${className}`}
      style={mergedStyle}
    >
      {children}
    </span>
  )
}
