export interface Achievement {
  title: string;
  event: string;
  year: string;
  description: string;
}

export interface Platform {
  name: string;
  url?: string;
  note: string;
}

export const achievements: Achievement[] = [
  {
    title: '3rd Place · Bootcamp Team',
    event: 'Communications Authority of Kenya Cyber Security Bootcamp & Hackathon',
    year: '2023',
    description:
      'Placed third as a team at the national bootcamp and hackathon run with the Kenya Cyber Security & Forensics Association (KCSFA).',
  },
];

export const ctfPlatforms: Platform[] = [
  { name: 'Hack The Box', url: 'https://www.hackthebox.com', note: 'Boxes & offensive security' },
  { name: 'TryHackMe', url: 'https://tryhackme.com', note: 'Rooms & learning paths' },
  { name: 'picoCTF', url: 'https://picoctf.org', note: 'Jeopardy-style challenges' },
  { name: 'Hellbound Hackers', url: 'https://www.hellboundhackers.org', note: 'Web & crypto challenges' },
  { name: 'Huntress CTF', note: 'Annual Cybersecurity Awareness Month CTF' },
  { name: 'Safaricom CTF', note: 'In-person competition' },
  { name: 'I&M Bank CTF', note: 'Corporate CTF event' },
  { name: 'Hacktober', note: 'Multiple company CTFs' },
];

export const securityFocus = [
  'Web application security & OWASP Top 10',
  'Secure authentication and session design',
  'Forensics, OSINT and metadata analysis',
  'Preparing for CEH and OSCP certifications',
];
