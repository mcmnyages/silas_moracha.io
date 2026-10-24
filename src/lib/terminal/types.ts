// TYPES ONLY. Shared by the build-time data builder and the in-browser shell.

/** Everything the shell knows about the site. Serialised into the page at build time. */
export interface TerminalData {
  name: string;
  handle: string;
  role: string;
  location: string;
  email: string;
  availability: string;
  /** Site root with the deploy base, e.g. `/silas_moracha.io/`. */
  home: string;
  socials: Record<string, string>;
  skills: { command: string; title: string; items: string[] }[];
  projects: {
    slug: string;
    title: string;
    url: string;
    liveUrl?: string;
    category: string;
    description: string;
    stack: string[];
    highlights: string[];
    featured: boolean;
  }[];
  experience: { slug: string; role: string; company: string; period: string; summary: string }[];
  stats: { repos: number; memberSince: number | null; topLanguages: string[] };
}
