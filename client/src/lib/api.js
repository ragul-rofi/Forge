export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL

  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/+$/, '')
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
