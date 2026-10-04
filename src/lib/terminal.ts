/**
 * Client-side logic for the interactive hero terminal.
 * Content comes from the same data files as the rest of the site (serialised into the page at build time),
 * so the terminal never drifts out of sync with the HTML sections.
 */
import { getTheme, setTheme } from './theme';

export interface TerminalData {
  name: string;
  handle: string;
  role: string;
  location: string;
  email: string;
  availability: string;
  socials: Record<string, string>;
  skills: { command: string; title: string; items: string[] }[];
  projects: { title: string; url: string; description: string; stack: string[] }[];
  experience: { role: string; company: string; period: string }[];
  stats: { repos: number; memberSince: number | null; topLanguages: string[] };
}

type Line = string; // trusted HTML built below; user input is always escaped
type Command = { desc: string; run: (args: string[]) => Line[] | void; hidden?: boolean };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const c = {
  accent: (s: string) => `<span class="text-accent">${s}</span>`,
  cyan: (s: string) => `<span class="text-fg">${s}</span>`,
  violet: (s: string) => `<span class="text-accent">${s}</span>`,
  muted: (s: string) => `<span class="text-muted">${s}</span>`,
  bold: (s: string) => `<span class="font-semibold text-fg">${s}</span>`,
  link: (href: string, label: string) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="text-fg underline decoration-dotted underline-offset-4 hover:text-accent">${esc(label)}</a>`,
};

const SECTIONS = ['about', 'experience', 'projects', 'security', 'skills', 'contact'];

export function initTerminal(root: HTMLElement, data: TerminalData) {
  const output = root.querySelector<HTMLElement>('[data-term-output]')!;
  const input = root.querySelector<HTMLInputElement>('[data-term-input]')!;
  const body = root.querySelector<HTMLElement>('[data-term-body]')!;

  const history: string[] = [];
  let cursor = 0;

  const files: Record<string, () => Line[]> = {
    'about.txt': () => commands.about.run([]) as Line[],
    'skills.md': () => commands.skills.run([]) as Line[],
    'contact.txt': () => commands.contact.run([]) as Line[],
  };

  const commands: Record<string, Command> = {
    help: {
      desc: 'list available commands',
      run: () => [
        c.muted('Available commands:'),
        ...Object.entries(commands)
          .filter(([, cmd]) => !cmd.hidden)
          .map(([name, cmd]) => `  ${c.accent(name.padEnd(12))}${c.muted(cmd.desc)}`),
        '',
        c.muted('Tip: use ↑/↓ for history and Tab to autocomplete.'),
      ],
    },
    whoami: {
      desc: 'who is this guy?',
      run: () => [`${c.bold(data.name)} ${c.muted(`(@${data.handle})`)}`, c.cyan(data.role), c.muted(`📍 ${data.location}`)],
    },
    about: {
      desc: 'a short bio',
      run: () => [
        `I'm ${c.bold(data.name)}, a ${c.accent(data.role.toLowerCase())}.`,
        'B.Sc. IT graduate (Maseno University, 2025) working across full-stack',
        'web development, cybersecurity and AI training data.',
        `${c.muted('status:')} ${c.accent(data.availability)}`,
      ],
    },
    skills: {
      desc: 'tech I work with',
      run: () =>
        data.skills.map((g) => `${c.accent(`[${g.command}]`.padEnd(12))}${g.items.map(esc).join(c.muted(' · '))}`),
    },
    projects: {
      desc: 'things I have built',
      run: () => [
        ...data.projects.flatMap((p) => [
          `${c.accent('▸')} ${c.link(p.url, p.title)} ${c.muted(`[${p.stack.slice(0, 3).join(', ')}]`)}`,
          `  ${c.muted(esc(p.description))}`,
        ]),
        '',
        `${c.muted('More:')} type ${c.accent('goto projects')} or ${c.accent('open github')}`,
      ],
    },
    experience: {
      desc: 'where I have worked',
      run: () => data.experience.map((e) => `${c.cyan(e.period.padEnd(20))}${c.bold(esc(e.role))} ${c.muted('@')} ${esc(e.company)}`),
    },
    contact: {
      desc: 'how to reach me',
      run: () => [
        `${c.muted('email   ')} ${c.link(`mailto:${data.email}`, data.email)}`,
        ...Object.entries(data.socials).map(([k, v]) => `${c.muted(k.padEnd(8))} ${c.link(v, v.replace(/^https?:\/\/(www\.)?/, ''))}`),
      ],
    },
    neofetch: {
      desc: 'system info, hacker style',
      run: () => {
        // Kept narrow so it fits the terminal on phones without wrapping.
        const art = [' ██████ ', '██      ', ' █████  ', '     ██ ', '██████  ', '        ', '        ', '        '];
        const info = [
          `${c.accent(data.handle)}${c.muted('@')}${c.accent('portfolio')}`,
          c.muted('─'.repeat(18)),
          `${c.cyan('OS')}     Kenya x86_64`,
          `${c.cyan('Role')}   Software Engineer`,
          `${c.cyan('Uptime')} ${data.stats.memberSince ? `${new Date().getFullYear() - data.stats.memberSince}+ yrs on GitHub` : 'always learning'}`,
          `${c.cyan('Repos')}  ${data.stats.repos || '20+'} public`,
          `${c.cyan('Langs')}  ${esc(data.stats.topLanguages.slice(0, 2).join(', ') || 'TypeScript, Python, Java')}`,
          `${c.cyan('Shell')}  curiosity --verbose`,
        ];
        return art.map((a, i) => `${c.accent(a)} ${info[i] ?? ''}`);
      },
    },
    ls: {
      desc: 'list files',
      run: () => [Object.keys(files).map((f) => c.cyan(f)).join('   ')],
    },
    cat: {
      desc: 'read a file, e.g. cat about.txt',
      run: ([file]) => {
        if (!file) return [c.muted('usage: cat <file>  (try `ls`)')];
        const f = files[file];
        return f ? f() : [`cat: ${esc(file)}: No such file or directory`];
      },
    },
    open: {
      desc: 'open a profile, e.g. open github',
      run: ([target]) => {
        const url = target && data.socials[target.toLowerCase()];
        if (!url) return [c.muted(`usage: open <${Object.keys(data.socials).join('|')}>`)];
        window.open(url, '_blank', 'noopener');
        return [c.muted(`opening ${esc(url)} ...`)];
      },
    },
    goto: {
      desc: 'scroll to a section',
      run: ([section]) => {
        if (!section || !SECTIONS.includes(section)) return [c.muted(`usage: goto <${SECTIONS.join('|')}>`)];
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        return [c.muted(`cd ~/${section}`)];
      },
    },
    theme: {
      desc: 'switch theme: theme [dark|light]',
      run: ([t]) => {
        const next = t === 'dark' || t === 'light' ? t : getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        return [c.muted(`theme set to ${next}`)];
      },
    },
    hire: {
      desc: 'the best command',
      run: () => {
        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 400);
        return [c.accent('Excellent choice.') + ' Taking you to the contact form ...'];
      },
    },
    echo: { desc: 'print text', run: (args) => [esc(args.join(' '))], hidden: true },
    date: { desc: 'current date', run: () => [new Date().toString()], hidden: true },
    history: { desc: 'command history', run: () => history.map((h, i) => `${c.muted(String(i + 1).padStart(3))}  ${esc(h)}`), hidden: true },
    sudo: {
      desc: '',
      hidden: true,
      run: () => [`${c.violet(data.handle)} is not in the sudoers file. This incident will be reported. 🚨`],
    },
    rm: { desc: '', hidden: true, run: () => [c.muted('Nice try. This portfolio is read-only. 😉')] },
    exit: { desc: '', hidden: true, run: () => [c.muted("There's no escape. Try `hire` instead.")] },
    clear: {
      desc: 'clear the screen',
      run: () => {
        output.innerHTML = '';
      },
    },
  };

  const print = (lines: Line[]) => {
    const frag = document.createDocumentFragment();
    for (const line of lines) {
      const div = document.createElement('div');
      div.className = 'whitespace-pre-wrap break-words';
      div.innerHTML = line || '&nbsp;';
      frag.appendChild(div);
    }
    output.appendChild(frag);
    body.scrollTop = body.scrollHeight;
  };

  const prompt = (cmd: string) =>
    `${c.accent(`${data.handle}@portfolio`)}${c.muted(':')}${c.muted('~')}${c.muted('$')} ${esc(cmd)}`;

  const run = (raw: string) => {
    const line = raw.trim();
    print([prompt(line)]);
    if (!line) return;
    history.push(line);
    cursor = history.length;
    const [name, ...args] = line.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (!cmd) {
      print([`command not found: ${esc(name)}. Type ${c.accent('help')} to see what I can do.`]);
      return;
    }
    const out = cmd.run(args);
    if (out) print(out);
  };

  root.querySelector('form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const value = input.value.trim().toLowerCase();
      if (!value) return;
      const matches = Object.keys(commands).filter((n) => !commands[n].hidden && n.startsWith(value));
      if (matches.length === 1) input.value = `${matches[0]} `;
      else if (matches.length > 1) print([prompt(input.value), matches.map(c.accent).join('   ')]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.innerHTML = '';
    }
  });

  // Clicking anywhere in the terminal focuses the prompt (unless selecting text or clicking a link).
  body.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a') || window.getSelection()?.toString()) return;
    input.focus({ preventScroll: true });
  });

  // Autoplay: type a few commands by itself on load; stops as soon as the visitor interacts.
  const queue = (root.dataset.autoplay ?? '').split('|').filter(Boolean);
  let interrupted = false;
  const stop = () => (interrupted = true);
  input.addEventListener('focus', stop, { once: true });
  input.addEventListener('keydown', stop, { once: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typeNext = (delay: number) => {
    const cmd = queue.shift();
    if (!cmd || interrupted) return;
    setTimeout(() => {
      let i = 0;
      const tick = () => {
        if (interrupted) return (input.value = '');
        input.value = cmd.slice(0, ++i);
        if (i < cmd.length) return void setTimeout(tick, reduceMotion ? 0 : 55 + Math.random() * 60);
        setTimeout(() => {
          if (interrupted) return (input.value = '');
          run(cmd);
          input.value = '';
          typeNext(1800);
        }, 350);
      };
      tick();
    }, delay);
  };
  if (queue.length) typeNext(1400);

  // Quick-command chips below the terminal.
  root.querySelectorAll<HTMLButtonElement>('[data-term-run]').forEach((btn) =>
    btn.addEventListener('click', () => {
      stop();
      run(btn.dataset.termRun!);
      input.focus({ preventScroll: true });
    }),
  );
}
