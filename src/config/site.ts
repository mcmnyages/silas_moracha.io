/**
 * Single source of truth for who you are and how people reach you.
 * Change something here and it updates everywhere: hero, terminal, footer, SEO tags and structured data.
 */

export const site = {
  name: 'Silas Moracha',
  handle: 'mcmnyages',
  role: 'Software Engineer & Cybersecurity Enthusiast',
  roles: [
    'Software Engineer',
    'Security Researcher',
    'CTF Player',
    'AI Training Data Specialist',
    'Full-Stack Developer',
  ],
  tagline:
    'I build secure, fast web applications, break things in CTFs to learn how they work, and help train the AI models of tomorrow.',
  location: 'Eldoret, Kenya',
  email: 'morachasilas@gmail.com',
  availability: 'Open to software engineering & security roles',

  seo: {
    title: 'Silas Moracha | Software Engineer & Cybersecurity Enthusiast',
    description:
      'Portfolio of Silas Moracha, a software engineer from Kenya working across full-stack web development (React, Node.js, TypeScript), cybersecurity and CTFs, and AI training data. B.Sc. IT, Maseno University.',
    keywords: [
      'Silas Moracha',
      'mcmnyages',
      'software engineer Kenya',
      'cybersecurity',
      'CTF',
      'full-stack developer',
      'React',
      'TypeScript',
      'Node.js',
      'AI training data',
      'Maseno University',
    ],
  },

  socials: {
    github: 'https://github.com/mcmnyages',
    linkedin: 'https://www.linkedin.com/in/mcmnyages',
    x: 'https://x.com/McMnyages',
    instagram: 'https://www.instagram.com/mcmnyages',
  },

  /**
   * Contact form: create a free access key at https://web3forms.com (it is safe to expose publicly)
   * and paste it here. While empty, the contact section shows a direct email button instead of the form.
   */
  web3formsAccessKey: 'a89de0ad-cee5-458b-ba61-52399a5a47ad',
} as const;

export type Site = typeof site;
