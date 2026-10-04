export interface SkillGroup {
  title: string;
  /** Short command-style label shown in the card header. */
  command: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    command: 'lang',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'PHP', 'SQL', 'C', 'C++'],
  },
  {
    title: 'Frontend',
    command: 'frontend',
    items: ['React', 'Vue', 'Angular', 'Astro', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3'],
  },
  {
    title: 'Backend & Data',
    command: 'backend',
    items: ['Node.js', 'Express', 'Django', 'GraphQL', 'REST APIs', 'Prisma', 'PostgreSQL', 'MySQL', 'SQLite'],
  },
  {
    title: 'Security',
    command: 'security',
    items: ['Kali Linux', 'Burp Suite', 'Wireshark', 'OWASP Top 10', 'ExifTool', 'JWT & Auth', 'Secure Coding'],
  },
  {
    title: 'AI & Agents',
    command: 'ai',
    items: ['Google ADK', 'Vertex AI', 'Genkit', 'RAG', 'Encord', 'AI Evaluation', 'Data Annotation'],
  },
  {
    title: 'DevOps & Tools',
    command: 'devops',
    items: ['Git', 'GitHub Actions', 'Docker', 'Docker Compose', 'Linux', 'Vercel', 'VS Code'],
  },
];
