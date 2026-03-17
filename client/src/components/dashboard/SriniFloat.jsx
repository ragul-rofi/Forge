export default function SriniFloat({ onClick, activeCall = false }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-40"
      style={{
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: '999px',
        border: 'none',
        backgroundColor: activeCall ? '#f43f5e' : 'var(--accent)',
        color: 'var(--bg)',
        boxShadow: '0 0 0 0 rgba(129,140,248,0.5)',
        animation: 'srini-pulse 3s infinite',
      }}
      title={activeCall ? 'End Call' : 'Talk to Srini'}
      aria-label={activeCall ? 'End Call' : 'Talk to Srini'}
    >
      🎙
      <style>{`
        @keyframes srini-pulse {
          0% { box-shadow: 0 0 0 0 rgba(129,140,248,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(129,140,248,0); }
          100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
        }
      `}</style>
    </button>
  )
}
