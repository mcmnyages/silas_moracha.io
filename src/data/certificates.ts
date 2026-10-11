import type { ImageMetadata } from 'astro';
import maseno from '../assets/certificates/maseno-bsc-it.jpg';
import fsoTypescript from '../assets/certificates/fso-typescript.jpg';
import fsoGraphql from '../assets/certificates/fso-graphql.jpg';
import ccsk from '../assets/certificates/csa-ccsk.jpg';
import pcap from '../assets/certificates/cisco-pcap.jpg';
import itEssentials from '../assets/certificates/cisco-it-essentials.jpg';
import huntress from '../assets/certificates/huntress-ctf-2025.jpg';

export const certCategories = ['Development', 'Security', 'Networking'] as const;
export type CertCategory = 'Degree' | (typeof certCategories)[number];

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuerUrl?: string;
  /** ISO date (YYYY-MM-DD or YYYY-MM); used for sorting and display. */
  date: string;
  category: CertCategory;
  /** Scan or export of the certificate (src/assets/certificates, ~2000px wide JPG). */
  image: ImageMetadata;
  summary: string;
  skills?: string[];
  /** Public page where anyone can check the certificate is genuine. */
  verifyUrl?: string;
  /** Credential / validation ID printed on the certificate. */
  credentialId?: string;
  /**
   * Link to the original file, e.g. a Google Drive share link
   * (Drive → Share → General access: "Anyone with the link" → Copy link).
   */
  driveUrl?: string;
  /** Shown in the main tree. Others are listed compactly under "Also completed". */
  featured?: boolean;
}

/**
 * To add a certificate: drop a JPG/PNG into src/assets/certificates, import it above
 * and add an entry here. Order doesn't matter; the site sorts newest first.
 * Set `featured: true` for the ones that matter most; the rest are listed compactly.
 */
export const degree: Certificate = {
  id: 'maseno-bsc-it',
  title: 'B.Sc. Information Technology',
  issuer: 'Maseno University',
  issuerUrl: 'https://www.maseno.ac.ke',
  date: '2025-11-14',
  category: 'Degree',
  image: maseno,
  summary: 'Second Class Honours (Upper Division), conferred at the congregation on 14 November 2025.',
  skills: ['Software engineering', 'Networking', 'Databases', 'Information security'],
};

const list: Certificate[] = [
  {
    id: 'fso-typescript',
    title: 'Full Stack Open: TypeScript',
    issuer: 'University of Helsinki',
    issuerUrl: 'https://fullstackopen.com',
    date: '2026-10-11',
    category: 'Development',
    image: fsoTypescript,
    summary: 'Typing React front ends and Node.js/Express back ends end to end. 1 ECTS credit.',
    skills: ['TypeScript', 'React', 'Node.js'],
    verifyUrl: 'https://courses.mooc.fi/certificates/validate/6jjghxmmqpj7dnu',
    credentialId: '6jjghxmmqpj7dnu',
    featured: true,
  },
  {
    id: 'fso-graphql',
    title: 'Full Stack Open: GraphQL',
    issuer: 'University of Helsinki',
    issuerUrl: 'https://fullstackopen.com',
    date: '2026-10-11',
    category: 'Development',
    image: fsoGraphql,
    summary: 'GraphQL servers with Apollo, schemas, mutations, subscriptions and client-side caching. 1 ECTS credit.',
    skills: ['GraphQL', 'Apollo', 'React'],
    verifyUrl: 'https://courses.mooc.fi/certificates/validate/2w2gcxh8qem3p3t',
    credentialId: '2w2gcxh8qem3p3t',
    featured: true,
  },
  {
    id: 'huntress-ctf-2025',
    title: 'Huntress Capture the Flag 2025',
    issuer: 'Huntress',
    issuerUrl: 'https://www.huntress.com',
    date: '2025-10',
    category: 'Security',
    image: huntress,
    summary: 'Month-long CTF: 10 of 65 challenges solved, ranked 2,148 of 6,869 teams (9,791 players).',
    skills: ['CTF', 'Blue team', 'Problem solving'],
    featured: true,
  },
  {
    id: 'csa-ccsk',
    title: 'CCSK v4.1 Foundation Training',
    issuer: 'Cloud Security Alliance',
    issuerUrl: 'https://cloudsecurityalliance.org',
    date: '2023-10-01',
    category: 'Security',
    image: ccsk,
    summary: 'Cloud security fundamentals: shared responsibility, governance, data security and cloud architecture.',
    skills: ['Cloud security', 'Governance', 'Risk'],
    featured: true,
  },
  {
    id: 'cisco-pcap',
    title: 'PCAP: Programming Essentials in Python',
    issuer: 'Cisco Networking Academy · OpenEDG Python Institute',
    issuerUrl: 'https://www.netacad.com',
    date: '2023-09-24',
    category: 'Development',
    image: pcap,
    summary: 'Python from the ground up: data structures, modules, exceptions, generators, closures and OOP.',
    skills: ['Python', 'OOP'],
  },
  {
    id: 'cisco-it-essentials',
    title: 'IT Essentials: PC Hardware and Software',
    issuer: 'Cisco Networking Academy',
    issuerUrl: 'https://www.netacad.com',
    date: '2022-06-17',
    category: 'Networking',
    image: itEssentials,
    summary: 'Building, maintaining and troubleshooting computers, operating systems and small networks.',
    skills: ['Hardware', 'Windows & Linux', 'LAN'],
    verifyUrl: 'https://www.credly.com/users/silas-moracha',
  },
];

export const certificates = [...list].sort((a, b) => b.date.localeCompare(a.date));
export const featuredCertificates = certificates.filter((c) => c.featured);
export const otherCertificates = certificates.filter((c) => !c.featured);

/** Profiles that hold further verified credentials. */
export const credentialProfiles = [
  { label: 'Cisco badges on Credly', url: 'https://www.credly.com/users/silas-moracha' },
  { label: 'SoloLearn certificates', url: 'https://www.sololearn.com/profile/23761992' },
  { label: 'Full Stack Open coursework', url: 'https://github.com/mcmnyages/fullstackopen' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2025-11-14' → '14 Nov 2025', '2025-10' → 'Oct 2025'. */
export function formatCertDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return [d, MONTHS[m - 1], y].filter(Boolean).join(' ');
}
