export function slugifyProfileName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function createProfileSlug(name, fallback = 'collector') {
  const normalized = slugifyProfileName(name);
  return normalized || fallback;
}

export function getPublicProfileSlugFromPath(pathname = '') {
  const match = pathname.match(/^\/collection\/([^/]+)\/?$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export function buildPublicProfilePath(slug) {
  return `/collection/${encodeURIComponent(slug)}`;
}

export function buildPublicProfileUrl(slug, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return `${origin}${buildPublicProfilePath(slug)}`;
}
