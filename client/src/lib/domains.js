import { DOMAIN_COLORS, DOMAIN_NAMES } from './constants'

export const DOMAINS = Object.keys(DOMAIN_NAMES).map(key => ({
  key,
  name: DOMAIN_NAMES[key],
  color: DOMAIN_COLORS[key],
}))

export function getDomainColor(domain) {
  return DOMAIN_COLORS[domain] || '#666666'
}

export function getDomainName(domain) {
  return DOMAIN_NAMES[domain] || domain
}
