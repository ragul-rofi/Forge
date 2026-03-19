export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL

  if (typeof raw === 'string' && raw.trim()) {
    const normalized = raw.trim().replace(/\/+$/, '')

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        const parsed = new URL(normalized)
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          return ''
        }
      } catch {
        return normalized
      }
    }

    return normalized
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3001'
  }

  return ''
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}
