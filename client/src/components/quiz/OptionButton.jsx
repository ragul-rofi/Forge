import { useState } from 'react'

export default function OptionButton({ letter, text, selected, previouslySelected, onClick, disabled }) {
  const [hovering, setHovering] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-full text-left p-4 border transition-all duration-120 cursor-pointer"
      style={{
        backgroundColor: selected
          ? 'var(--surface3)'
          : previouslySelected
            ? 'var(--surface2)'
            : hovering
              ? 'var(--surface2)'
              : 'var(--surface)',
        borderColor: selected ? 'var(--text)' : previouslySelected ? 'var(--muted)' : 'var(--border)',
        borderRadius: '2px',
        opacity: disabled && !selected ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="font-mono text-xs mt-0.5 shrink-0"
          style={{ color: previouslySelected ? 'var(--text)' : 'var(--muted)' }}
        >
          {letter.toUpperCase()}
        </span>
        <span className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {text}
        </span>
        {previouslySelected && (
          <span className="ml-auto text-[10px] font-mono shrink-0 mt-0.5" style={{ color: 'var(--muted)' }}>
            selected
          </span>
        )}
      </div>
    </button>
  )
}
