import { useState } from 'react'

export default function OptionButton({ letter, text, selected, previouslySelected, onClick, disabled }) {
  const [hovering, setHovering] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-full text-left p-4 border transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: selected
          ? 'var(--surface3)'
          : previouslySelected
            ? 'var(--surface2)'
            : hovering
              ? 'var(--surface2)'
              : 'var(--surface)',
        borderColor: selected ? 'var(--text)' : previouslySelected ? 'var(--muted)' : 'var(--border)',
        borderRadius: 'var(--radius)',
        opacity: disabled && !selected ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-xs font-semibold mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
          style={{ 
            color: previouslySelected ? 'var(--bg)' : 'var(--muted)',
            backgroundColor: previouslySelected ? 'var(--text)' : 'var(--surface3)',
          }}
        >
          {letter.toUpperCase()}
        </span>
        <span className="text-sm leading-relaxed flex-1 min-w-0" style={{ color: 'var(--text)' }}>
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
