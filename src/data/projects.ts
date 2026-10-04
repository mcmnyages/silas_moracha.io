export type ProjectCategory = 'Full-Stack' | 'Security' | 'AI / ML' | 'Mobile' | 'Web';

export interface Project {
  title: string;
  /** Repository name on GitHub (under site.handle). */
  repo: string;
  description: string;
  category: ProjectCategory;
  stack: string[];
  /** Short bullet points about what makes the project interesting. */
  highlights?: string[];
  liveUrl?: string;
  /** Extra related repositories, e.g. course parts. */
  related?: { label: string; repo: string }[];
  featured?: boolean;
}

/**
 * Hand-picked projects. Anything not listed here can still appear under
 * "Latest from GitHub", which is fetched automatically at build time.
 */
export const projects: Project[] = [
  {
    title: 'SecureCloud',
    repo: 'secure-cloud',
    description:
      'A personal cloud storage platform built security-first: authenticated uploads, hashed credentials and a type-safe data layer.',
    category: 'Security',
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'JWT'],
    highlights: [
      'JWT authentication with bcrypt password hashing',
      'Multipart file uploads with per-user storage quotas',
      'Type-safe ORM over PostgreSQL with Prisma',
    ],
    liveUrl: 'https://secure-cloud-delta.vercel.app',
    featured: true,
  },
  {
    title: 'Full Stack Open',
    repo: 'fullstackopen',
    description:
      'Coursework from the University of Helsinki’s Full Stack Open: modern web apps end to end, from React UIs to Node APIs, databases, testing and deployment.',
    category: 'Full-Stack',
    stack: ['React', 'Node.js', 'Express', 'GraphQL', 'TypeScript', 'Testing', 'CI/CD'],
    highlights: [
      'REST and GraphQL APIs with authentication',
      'State management, testing and deployment pipelines',
    ],
    related: [
      { label: 'GraphQL', repo: 'part8-GraphQL-' },
      { label: 'TypeScript', repo: 'fs-typescript' },
      { label: 'State management', repo: 'fullstackopen-part6' },
    ],
    featured: true,
  },
  {
    title: 'AI Agents with Google ADK',
    repo: 'ai-agents-adk',
    description:
      'Exploring agentic workflows and tool-calling patterns with Google’s Agent Development Kit, including a companion web front end.',
    category: 'AI / ML',
    stack: ['Python', 'Google ADK', 'AI Agents', 'Tool Calling'],
    related: [{ label: 'Companion app', repo: 'companion-python-ADK-' }],
    featured: true,
  },
  {
    title: 'WonderBot',
    repo: 'wonderbot-vertex-AI-',
    description: 'A conversational AI chatbot built on Google Cloud’s Vertex AI platform.',
    category: 'AI / ML',
    stack: ['Python', 'Vertex AI', 'Google Cloud', 'LLMs'],
    featured: true,
  },
  {
    title: 'RAG with Firebase Genkit',
    repo: 'codelab-ai-genkit-rag',
    description:
      'Retrieval-augmented generation pipeline that grounds gen-AI features in your own data, built with Genkit and Next.js.',
    category: 'AI / ML',
    stack: ['TypeScript', 'Genkit', 'Next.js', 'RAG', 'Vertex AI'],
  },
  {
    title: 'CIT-415 Final Year Projects',
    repo: 'CIT-415-Year-4',
    description:
      'Final-year university projects covering system design and practical IT solutions as full web applications.',
    category: 'Web',
    stack: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS'],
    liveUrl: 'https://cit-415-year-4.vercel.app',
  },
  {
    title: 'Android Projects',
    repo: 'Android_Studio_Projects',
    description:
      'Native Android apps, from first principles up to database-backed applications using SQLite.',
    category: 'Mobile',
    stack: ['Java', 'Android SDK', 'SQLite'],
  },
  {
    title: 'World Database Explorer',
    repo: 'WORLD_MySQL',
    description:
      'Querying and visualising MySQL’s sample “world” database: schema exploration, SQL practice and data modelling.',
    category: 'Full-Stack',
    stack: ['MySQL', 'TypeScript', 'SQL'],
  },
  {
    title: 'Chokecity Entertainment',
    repo: 'chokecity.io',
    description: 'Client website for an entertainment and media company, designed and built from scratch.',
    category: 'Web',
    stack: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://mcmnyages.github.io/chokecity.io/',
  },
];
