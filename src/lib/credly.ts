/**
 * Build-time Credly badges, read from the public profile feed. Like the GitHub data, this
 * runs once per build, so new badges appear after the next (weekly) deploy. Any failure
 * degrades to an empty list and the section shows just the profile link.
 */
import { site } from '../config/site';

export interface Badge {
  id: string;
  name: string;
  issuer: string;
  /** ISO date, YYYY-MM-DD. */
  issuedAt: string;
  url: string;
  image: string;
}

const user = site.socials.credly.split('/').filter(Boolean).pop()!;

let cached: Promise<Badge[]> | undefined;

async function load(): Promise<Badge[]> {
  try {
    type ApiBadge = {
      id: string;
      issued_at_date: string;
      expires_at_date: string | null;
      state: string;
      public: boolean;
      image_url: string;
      badge_template: { name: string; issuer?: { entities?: { entity: { name: string } }[] } };
    };

    const res = await fetch(`https://www.credly.com/users/${user}/badges.json?page_size=48`, {
      headers: { Accept: 'application/json', 'User-Agent': `${site.handle}-portfolio-build` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Credly responded ${res.status}`);
    const { data } = (await res.json()) as { data: ApiBadge[] };

    const today = new Date().toISOString().slice(0, 10);
    return data
      .filter((b) => b.public && b.state === 'accepted' && !(b.expires_at_date && b.expires_at_date < today))
      .sort((a, b) => b.issued_at_date.localeCompare(a.issued_at_date))
      .map((b) => ({
        id: b.id,
        name: b.badge_template.name,
        issuer: b.badge_template.issuer?.entities?.[0]?.entity.name ?? '',
        issuedAt: b.issued_at_date,
        url: `https://www.credly.com/badges/${b.id}`,
        // Credly's resizer keeps the download small (~25 KB instead of ~100 KB).
        image: b.image_url.replace('images.credly.com/images/', 'images.credly.com/size/220x220/images/'),
      }));
  } catch (err) {
    console.warn(`[credly] Falling back to no badges: ${(err as Error).message}`);
    return [];
  }
}

/** Memoised so every component in a build shares one request. */
export function getCredlyBadges(): Promise<Badge[]> {
  cached ??= load();
  return cached;
}
