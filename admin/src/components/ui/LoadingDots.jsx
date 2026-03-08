export default function LoadingDots() {
  return (
    <div className="loading-dots flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
    </div>
  )
}
