/**
 * Resolves a root-relative public asset path (e.g. "/resume.pdf") against Vite's base URL,
 * so assets keep working when the site is deployed under a sub-folder (GitHub Pages).
 * Absolute URLs (https:, mailto:, data:) are returned unchanged.
 */
export function assetUrl(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
