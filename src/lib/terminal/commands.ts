// LOGIC ONLY. Commands never touch the DOM; they return lines and talk to the shell through `Ctx`.
// To add a command, append one object to `commands`. Nothing else changes.
import { getTheme, setTheme } from '../theme';
import { c, esc, type Line } from './format';
import type { TerminalData } from './types';

export interface Ctx {
  data: TerminalData;
  /** Current directory: '' is home (~), otherwise a section name. */
  cwd: string;
  setCwd(dir: string): void;
  /** The page URL path. Visitor-controlled: always escape it. */
  path: string;
  /** True on the 404 page, where sections live on another page. */
  notFound: boolean;
  history: string[];
  clear(): void;
  /** Scroll to a section (or the top) if it's on this page, otherwise navigate home. */
  go(section?: string): void;
}

export interface Command {
  name: string;
  aliases?: string[];
  help: string;
  hidden?: boolean;
  /** Tab-completion candidates for the argument being typed. */
  complete?(ctx: Ctx, partial: string): string[];
  run(ctx: Ctx, args: string[], raw: string): Line[] | void;
}

export const SECTIONS = ['about', 'experience', 'projects', 'security', 'skills', 'education', 'certificates', 'contact'];

const FLAG_B64 = 'ZmxhZ3s0MDRfbjB0X2YwdW5kX2J1dF95MHVfZjB1bmRfbTN9';
const FLAG = 'flag{404_n0t_f0und_but_y0u_f0und_m3}';

// ---------- Content shared by commands and files ----------

const about = (d: TerminalData): Line[] => [
  `I'm ${c.bold(esc(d.name))}, a ${c.accent(esc(d.role.toLowerCase()))}.`,
  'B.Sc. IT graduate (Maseno University, 2025) working across full-stack',
  'web development, cybersecurity and AI training data.',
  `${c.muted('status:')} ${c.accent(esc(d.availability))}`,
];

const skills = (d: TerminalData): Line[] =>
  d.skills.map((g) => `${c.accent(esc(`[${g.command}]`.padEnd(12)))}${g.items.map(esc).join(c.muted(' · '))}`);

const contact = (d: TerminalData): Line[] => [
  `${c.muted('email   ')} ${c.link(`mailto:${d.email}`, d.email)}`,
  ...Object.entries(d.socials).map(([k, v]) => `${c.muted(k.padEnd(8))} ${c.link(v, v.replace(/^https?:\/\/(www\.)?/, ''))}`),
];

const projectFile = (p: TerminalData['projects'][number]): Line[] => [
  c.bold(`# ${esc(p.title)}`),
  c.muted(`${esc(p.category)} · ${p.stack.map(esc).join(', ')}`),
  '',
  esc(p.description),
  ...(p.highlights.length ? ['', ...p.highlights.map((h) => `${c.accent('-')} ${esc(h)}`)] : []),
  '',
  `${c.muted('repo ')} ${c.link(p.url, p.url.replace('https://', ''))}`,
  ...(p.liveUrl ? [`${c.muted('live ')} ${c.link(p.liveUrl, p.liveUrl.replace('https://', ''))}`] : []),
];

const jobFile = (e: TerminalData['experience'][number]): Line[] => [
  `${c.fg(esc(e.period))}  ${c.bold(esc(e.role))} ${c.muted('@')} ${esc(e.company)}`,
  c.muted(esc(e.summary)),
];

// ---------- A tiny read-only filesystem: ~ holds a few files plus one directory per section ----------

type File = () => Line[];

function tree(d: TerminalData): Record<string, Record<string, File>> {
  const dirs: Record<string, Record<string, File>> = Object.fromEntries(SECTIONS.map((s) => [s, {}]));
  dirs.projects = Object.fromEntries(d.projects.map((p) => [`${p.slug}.md`, () => projectFile(p)]));
  dirs.experience = Object.fromEntries(d.experience.map((e) => [`${e.slug}.log`, () => jobFile(e)]));
  return {
    ...dirs,
    '': {
      'about.txt': () => about(d),
      'skills.md': () => skills(d),
      'contact.txt': () => contact(d),
      'flag.txt': () => [FLAG_B64, c.muted('Looks encoded. Try: echo &lt;that&gt; | base64 -d')],
    },
  };
}

type Node = { kind: 'dir'; dir: string } | { kind: 'file'; name: string; read: File };

/** Resolve `arg` against the current directory. Handles ~, /, . and .. */
function lookup(ctx: Ctx, arg = ''): Node | null {
  const parts = /^[~/]/.test(arg) ? [] : ctx.cwd ? [ctx.cwd] : [];
  for (const seg of arg.replace(/^~\/?|^\//, '').split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  const fs = tree(ctx.data);
  const [a, b] = parts;
  if (parts.length === 0) return { kind: 'dir', dir: '' };
  if (parts.length === 1 && a in fs && a !== '') return { kind: 'dir', dir: a };
  if (parts.length === 1 && fs[''][a]) return { kind: 'file', name: a, read: fs[''][a] };
  if (parts.length === 2 && fs[a]?.[b] && a !== '') return { kind: 'file', name: b, read: fs[a][b] };
  return null;
}

const entries = (ctx: Ctx, dir: string) => {
  const fs = tree(ctx.data);
  return dir ? Object.keys(fs[dir]) : [...SECTIONS.map((s) => `${s}/`), ...Object.keys(fs[''])];
};

/** Completion candidates for a path argument, e.g. `projects/se` → `projects/secure-cloud.md`. */
function completePath(ctx: Ctx, partial: string, dirsOnly = false) {
  const prefix = partial.slice(0, partial.lastIndexOf('/') + 1);
  const node = lookup(ctx, prefix);
  if (node?.kind !== 'dir') return [];
  return entries(ctx, node.dir)
    .filter((e) => !dirsOnly || e.endsWith('/'))
    .map((e) => prefix + e);
}

export const displayDir = (cwd: string) => (cwd ? `~/${cwd}` : '~');

// ---------- Commands ----------

export const commands: Command[] = [
  {
    name: 'help',
    help: 'list available commands',
    run: () => [
      c.muted('Available commands:'),
      ...commands.filter((cmd) => !cmd.hidden).map((cmd) => `  ${c.accent(cmd.name.padEnd(12))}${c.muted(esc(cmd.help))}`),
      '',
      c.muted('Tip: ↑/↓ for history, Tab to autocomplete. There is a flag somewhere.'),
    ],
  },
  {
    name: 'whoami',
    help: 'who is this guy?',
    run: ({ data: d }) => [`${c.bold(esc(d.name))} ${c.muted(`(@${esc(d.handle)})`)}`, c.fg(esc(d.role)), c.muted(esc(d.location))],
  },
  { name: 'about', help: 'a short bio', run: ({ data }) => about(data) },
  { name: 'skills', help: 'tech I work with', run: ({ data }) => skills(data) },
  {
    name: 'projects',
    help: 'things I have built',
    run: ({ data }) => [
      ...data.projects
        .filter((p) => p.featured)
        .flatMap((p) => [
          `${c.accent('▸')} ${c.link(p.url, p.title)} ${c.muted(`[${p.stack.slice(0, 3).map(esc).join(', ')}]`)}`,
          `  ${c.muted(esc(p.description))}`,
        ]),
      '',
      `${c.muted('More:')} ${c.accent('ls projects')}, ${c.accent('cat projects/&lt;name&gt;.md')} or ${c.accent('open github')}`,
    ],
  },
  {
    name: 'experience',
    help: 'where I have worked',
    run: ({ data }) => data.experience.map((e) => `${c.fg(esc(e.period.padEnd(20)))}${c.bold(esc(e.role))} ${c.muted('@')} ${esc(e.company)}`),
  },
  { name: 'contact', help: 'how to reach me', run: ({ data }) => contact(data) },
  {
    name: 'neofetch',
    help: 'system info, hacker style',
    run: ({ data: d }) => {
      // Kept narrow so it fits the terminal on phones without wrapping.
      const art = [' ██████ ', '██      ', ' █████  ', '     ██ ', '██████  ', '        ', '        ', '        '];
      const info = [
        `${c.accent(esc(d.handle))}${c.muted('@')}${c.accent('portfolio')}`,
        c.muted('─'.repeat(18)),
        `${c.fg('OS')}     Kenya x86_64`,
        `${c.fg('Role')}   Software Engineer`,
        `${c.fg('Uptime')} ${d.stats.memberSince ? `${new Date().getFullYear() - d.stats.memberSince}+ yrs on GitHub` : 'always learning'}`,
        `${c.fg('Repos')}  ${d.stats.repos || '20+'} public`,
        `${c.fg('Langs')}  ${esc(d.stats.topLanguages.slice(0, 2).join(', ') || 'TypeScript, Python, Java')}`,
        `${c.fg('Shell')}  curiosity --verbose`,
      ];
      return art.map((a, i) => `${c.accent(a)} ${info[i] ?? ''}`);
    },
  },
  {
    name: 'ls',
    help: 'list files, e.g. ls projects',
    complete: (ctx, partial) => completePath(ctx, partial, true),
    run: (ctx, [arg]) => {
      const node = lookup(ctx, arg);
      if (!node) return [`ls: cannot access '${esc(arg)}': No such file or directory`];
      if (node.kind === 'file') return [c.fg(esc(node.name))];
      const items = entries(ctx, node.dir);
      if (!items.length)
        return [c.muted(`nothing to list: ${esc(node.dir)} is rendered on the page${ctx.cwd === node.dir ? '.' : `. Try ${c.accent(`cd ${esc(node.dir)}`)}`}`)];
      return [
        items
          .map((e) => (e.endsWith('/') ? c.link(`${ctx.data.home}#${e.slice(0, -1)}`, e, false) : c.fg(esc(e))))
          .join('   '),
      ];
    },
  },
  {
    name: 'cd',
    aliases: ['goto'],
    help: 'jump to a section, e.g. cd projects',
    complete: (ctx, partial) => completePath(ctx, partial, true),
    run: (ctx, [arg]) => {
      const node = lookup(ctx, arg);
      if (!node) return [`cd: no such file or directory: ${esc(arg)}`];
      if (node.kind === 'file') return [`cd: not a directory: ${esc(arg)}`];
      ctx.setCwd(node.dir);
      ctx.go(node.dir || undefined);
    },
  },
  {
    name: 'cat',
    help: 'read a file, e.g. cat about.txt',
    complete: (ctx, partial) => completePath(ctx, partial),
    run: (ctx, [arg]) => {
      if (!arg) return [c.muted('usage: cat &lt;file&gt;  (try `ls`)')];
      const node = lookup(ctx, arg);
      if (!node) return [`cat: ${esc(arg)}: No such file or directory`];
      if (node.kind === 'dir') return [`cat: ${esc(arg)}: Is a directory`];
      return node.read();
    },
  },
  {
    name: 'pwd',
    help: 'print working directory',
    run: (ctx) =>
      ctx.notFound
        ? [esc(ctx.path), c.muted('(404, no such file or directory)')]
        : [`/home/${esc(ctx.data.handle)}${ctx.cwd ? `/${ctx.cwd}` : ''}`],
  },
  {
    name: 'open',
    help: 'open a profile, e.g. open github',
    complete: (ctx) => Object.keys(ctx.data.socials),
    run: ({ data }, [target]) => {
      const url = target && data.socials[target.toLowerCase()];
      if (!url) return [c.muted(`usage: open &lt;${Object.keys(data.socials).join('|')}&gt;`)];
      window.open(url, '_blank', 'noopener');
      return [c.muted(`opening ${esc(url)} ...`)];
    },
  },
  {
    name: 'cv',
    help: 'download my CV (PDF)',
    run: ({ data }) => {
      if (!data.cv) return [c.muted('No CV published yet. Try `contact` instead.')];
      const a = document.createElement('a');
      a.href = data.cv.href;
      a.download = data.cv.downloadName;
      a.click();
      return [`${c.muted('downloading')} ${c.link(data.cv.href, esc(data.cv.downloadName))} ...`];
    },
  },
  {
    name: 'theme',
    help: 'switch theme: theme [dark|light]',
    complete: () => ['dark', 'light'],
    run: (_, [t]) => {
      const next = t === 'dark' || t === 'light' ? t : getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      return [c.muted(`theme set to ${next}`)];
    },
  },
  {
    name: 'hire',
    help: 'the best command',
    run: (ctx) => {
      setTimeout(() => ctx.go('contact'), 400);
      return [`${c.accent('Excellent choice.')} Taking you to the contact form ...`];
    },
  },
  {
    name: 'echo',
    help: 'print text (pipes into base64 work)',
    hidden: true,
    run: (_, args, raw) => {
      // Supports `echo <text> | base64` and `echo <text> | base64 -d`, which is all the flag needs.
      const pipe = raw.match(/^echo\s+(.*?)\s*\|\s*base64(\s+(?:-d|--decode))?\s*$/);
      if (!pipe) return [esc(args.join(' '))];
      const text = pipe[1].replace(/^(['"])(.*)\1$/, '$2');
      try {
        const out = pipe[2] ? atob(text) : btoa(text);
        if (out === FLAG) return [c.accent(FLAG), c.muted('Nice work. Type `hire` if you want to talk.')];
        return [esc(out)];
      } catch {
        return ['base64: invalid input'];
      }
    },
  },
  { name: 'date', help: 'current date', hidden: true, run: () => [new Date().toString()] },
  {
    name: 'history',
    help: 'command history',
    hidden: true,
    run: ({ history }) => history.map((h, i) => `${c.muted(String(i + 1).padStart(3))}  ${esc(h)}`),
  },
  {
    name: 'ping',
    help: 'ping a host',
    hidden: true,
    run: ({ notFound }, [host = 'localhost']) => [
      `PING ${esc(host)}: 56 data bytes`,
      ...(notFound
        ? [c.muted('Request timeout for icmp_seq 0')]
        : [0, 1, 2].map((i) => `64 bytes from ${esc(host)}: icmp_seq=${i} ttl=64 time=${(0.3 + Math.random() * 0.4).toFixed(3)} ms`)),
    ],
  },
  {
    name: 'sudo',
    help: '',
    hidden: true,
    run: ({ data }) => [`${c.accent(esc(data.handle))} is not in the sudoers file. This incident will be reported.`],
  },
  { name: 'rm', help: '', hidden: true, run: () => [c.muted('Nice try. This portfolio is read-only.')] },
  {
    name: 'exit',
    aliases: ['home', 'logout'],
    help: '',
    hidden: true,
    run: (ctx) => {
      if (!ctx.notFound) return [c.muted("There's no escape. Try `hire` instead.")];
      ctx.go();
    },
  },
  { name: 'clear', help: 'clear the screen', run: (ctx) => ctx.clear() },
];

export const findCommand = (name: string) => commands.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
