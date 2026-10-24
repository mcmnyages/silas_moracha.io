// Output helpers. A `Line` is trusted HTML: anything from data or the visitor must go through `esc`.

export type Line = string;

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

export const c = {
  accent: (s: string) => `<span class="text-accent">${s}</span>`,
  fg: (s: string) => `<span class="text-fg">${s}</span>`,
  muted: (s: string) => `<span class="text-muted">${s}</span>`,
  bold: (s: string) => `<span class="font-semibold text-fg">${s}</span>`,
  /** External links open in a new tab; in-site links (e.g. `#projects`) don't. */
  link: (href: string, label: string, external = true) =>
    `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="text-fg underline decoration-dotted underline-offset-4 hover:text-accent">${esc(label)}</a>`,
};
