export interface Education {
  title: string;
  institution: string;
  url?: string;
  period: string;
  detail: string;
  link?: { label: string; url: string };
}

export const education: Education[] = [
  {
    title: 'B.Sc. Information Technology',
    institution: 'Maseno University',
    url: 'https://www.maseno.ac.ke',
    period: 'Graduated Nov 2025',
    detail: 'Second Class Honours (Upper Division).',
  },
  {
    title: 'Networking & Cybersecurity',
    institution: 'Cisco Networking Academy',
    url: 'https://www.netacad.com',
    period: 'Certifications',
    detail: 'Networking and cybersecurity courses with verified digital badges.',
    link: { label: 'View badges on Credly', url: 'https://www.credly.com/users/silas-moracha' },
  },
  {
    title: 'Programming Certificates',
    institution: 'SoloLearn',
    url: 'https://www.sololearn.com',
    period: 'Certifications',
    detail: 'Multiple programming-language certificates from self-paced courses.',
    link: { label: 'View profile', url: 'https://www.sololearn.com/profile/23761992' },
  },
  {
    title: 'Full Stack Open',
    institution: 'University of Helsinki',
    url: 'https://fullstackopen.com',
    period: 'Ongoing',
    detail: 'React, Node.js, GraphQL, TypeScript, testing, CI/CD and containers.',
    link: { label: 'View coursework', url: 'https://github.com/mcmnyages/fullstackopen' },
  },
];

export const testimonial = {
  quote: 'I can attest to the good work done in designing my website.',
  author: 'Odikie Naibra',
  title: 'CEO, Chokecity Entertainment',
};
