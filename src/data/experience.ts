export interface Experience {
  role: string;
  company: string;
  companyUrl?: string;
  period: string;
  type: 'Full-time' | 'Contract' | 'Freelance' | 'Leadership';
  summary: string;
  highlights: string[];
  stack: string[];
}

/** Newest first. */
export const experience: Experience[] = [
  {
    role: 'Software Engineering Expert',
    company: 'AfterQuery (YC W25)',
    period: '2026 · Present',
    type: 'Contract',
    summary: 'Building and reviewing technical benchmark data used to evaluate frontier AI models.',
    highlights: [
      'Authored multi-artifact reasoning tasks combining required, distractor and conflicting evidence.',
      'Produced evidence-grounded benchmark submissions mixing workspace artifacts with open-web research.',
      'Completed prompt-rewrite qualification tasks to strict quality rubrics.',
    ],
    stack: ['AI Evaluation', 'Benchmarking', 'Technical Writing', 'Research'],
  },
  {
    role: 'AI Video Annotator',
    company: 'Atlas Capture',
    period: '2026',
    type: 'Contract',
    summary:
      'Egocentric video annotation for a Vision-Language-Action (VLA) model training pipeline.',
    highlights: [
      'Annotated egocentric video in Encord following structured captioning and segmentation standards.',
      'Consistently met accuracy and productivity targets on production training data.',
    ],
    stack: ['Encord', 'Computer Vision', 'Data Annotation', 'VLA Models'],
  },
  {
    role: 'Frontend Developer',
    company: 'SecretStartup',
    period: 'May 2025 · Jan 2026',
    type: 'Full-time',
    summary: 'Built responsive web application interfaces and wired them to backend services.',
    highlights: [
      'Integrated REST APIs and connected the frontend to backend services.',
      'Improved UI/UX across the product for a smoother user experience.',
      'Shipped responsive, mobile-first features with the wider engineering team.',
    ],
    stack: ['React', 'JavaScript', 'REST APIs', 'Responsive Design'],
  },
  {
    role: 'Cybersecurity Lead',
    company: 'Google Developer Student Clubs · Maseno',
    period: 'University',
    type: 'Leadership',
    summary: 'Led the cybersecurity track of the Maseno University developer community.',
    highlights: [],
    stack: ['Community', 'Security Awareness', 'CTFs'],
  },
  {
    role: 'Web Designer & Developer',
    company: 'Chokecity Entertainment',
    companyUrl: 'https://mcmnyages.github.io/chokecity.io/',
    period: '2023',
    type: 'Freelance',
    summary: 'Designed and built the company website for an entertainment and media brand.',
    highlights: ['Delivered a responsive marketing site from design to deployment.'],
    stack: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
  },
];
