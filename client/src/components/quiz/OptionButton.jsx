import { useState } from 'react'

export default function OptionButton({ letter, text, selected, previouslySelected, onClick, disabled }) {
  const [hovering, setHovering] = useState(false)
  const activeBg = 'var(--accent)14'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-full text-left p-4 md:p-4 border cursor-pointer"
      style={{
        backgroundColor: selected
          ? activeBg
          : previouslySelected
            ? 'var(--surface2)'
            : hovering
              ? 'var(--surface3)'
              : 'var(--surface2)',
        borderColor: selected ? 'var(--accent)' : hovering ? 'var(--border2)' : previouslySelected ? 'var(--muted)' : 'var(--border)',
        borderWidth: selected ? 2 : 1,
        borderRadius: 'var(--radius)',
        opacity: disabled && !selected ? 0.5 : 1,
        minHeight: 56,
        transition: 'all 120ms ease',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-xs font-semibold mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
          style={{ 
            color: selected || hovering ? 'var(--text)' : 'var(--muted)',
            backgroundColor: previouslySelected ? 'var(--text)' : 'var(--surface3)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {letter.toUpperCase()}
        </span>
        <span
          className="text-sm leading-relaxed flex-1 min-w-0"
          style={{ color: selected || hovering ? 'var(--text)' : 'var(--muted2)', fontSize: 14 }}
        >
          {text}
        </span>
        {previouslySelected && (
          <span className="ml-auto text-xs shrink-0 mt-0.5" style={{ color: 'var(--muted)' }}>
            your pick
          </span>
        )}
      </div>
    </button>
  )
}
