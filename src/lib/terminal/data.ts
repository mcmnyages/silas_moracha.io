// BUILD TIME ONLY (imported from .astro frontmatter). Never import this from a client script.
import { site } from '../../config/site';
import { skillGroups } from '../../data/skills';
import { projects } from '../../data/projects';
import { experience } from '../../data/experience';
import { getGitHubData } from '../github';
import { repoUrl, withBase } from '../url';
import { cv } from '../cv';
import type { TerminalData } from './types';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export async function getTerminalData(): Promise<TerminalData> {
  const gh = await getGitHubData();
  return {
    name: site.name,
    handle: site.handle,
    role: site.role,
    location: site.location,
    email: site.email,
    availability: site.availability,
    home: withBase('/'),
    socials: { ...site.socials },
    cv,
    skills: skillGroups,
    projects: projects.map((p) => ({
      slug: p.repo.toLowerCase(),
      title: p.title,
      url: repoUrl(site.handle, p.repo),
      liveUrl: p.liveUrl,
      category: p.category,
      description: p.description,
      stack: p.stack,
      highlights: p.highlights ?? [],
      featured: !!p.featured,
    })),
    experience: experience.map((e) => ({
      slug: slugify(e.company),
      role: e.role,
      company: e.company,
      period: e.period,
      summary: e.summary,
    })),
    stats: { repos: gh.publicRepos, memberSince: gh.memberSince, topLanguages: gh.languages.map((l) => l.name) },
  };
}
