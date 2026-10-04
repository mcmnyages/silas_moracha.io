/**
 * Build-time GitHub data. Runs once per build (never in the visitor's browser), so the
 * results are baked into static HTML that search engines can read. The deploy workflow
 * rebuilds weekly to keep it fresh. Any failure (offline, rate limit) degrades gracefully.
 */
import { site } from '../config/site';

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  topics: string[];
}

export interface GitHubData {
  publicRepos: number;
  followers: number;
  memberSince: number | null;
  repos: Repo[];
  /** Share of original (non-fork) repos per primary language, largest first. */
  languages: { name: string; count: number; percent: number }[];
}

const EMPTY: GitHubData = { publicRepos: 0, followers: 0, memberSince: null, repos: [], languages: [] };

let cached: Promise<GitHubData> | undefined;

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${site.handle}-portfolio-build`,
  };
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`GitHub API ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

async function load(): Promise<GitHubData> {
  try {
    type ApiUser = { public_repos: number; followers: number; created_at: string };
    type ApiRepo = {
      name: string;
      description: string | null;
      html_url: string;
      homepage: string | null;
      language: string | null;
      stargazers_count: number;
      pushed_at: string;
      fork: boolean;
      archived: boolean;
      topics?: string[];
    };

    const [user, apiRepos] = await Promise.all([
      gh<ApiUser>(`/users/${site.handle}`),
      gh<ApiRepo[]>(`/users/${site.handle}/repos?per_page=100&sort=pushed`),
    ]);

    const original = apiRepos.filter((r) => !r.fork && !r.archived);

    const counts = new Map<string, number>();
    for (const r of original) {
      if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
    const languages = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 1000) / 10 }));

    return {
      publicRepos: user.public_repos,
      followers: user.followers,
      memberSince: new Date(user.created_at).getFullYear(),
      languages,
      repos: original.map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        topics: r.topics ?? [],
      })),
    };
  } catch (err) {
    console.warn(`[github] Falling back to empty data: ${(err as Error).message}`);
    return EMPTY;
  }
}

/** Memoised so every component in a build shares one set of API calls. */
export function getGitHubData(): Promise<GitHubData> {
  cached ??= load();
  return cached;
}

