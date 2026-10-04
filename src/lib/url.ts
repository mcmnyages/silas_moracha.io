/** Prefix a site-relative path with the configured base (e.g. `/silas_moracha.io`). */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export const repoUrl = (handle: string, repo: string) => `https://github.com/${handle}/${repo}`;
