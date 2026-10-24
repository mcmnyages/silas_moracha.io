// BEHAVIOUR ONLY. Wires a piece of markup to the command registry.
// It finds its elements by data-attributes, so the hero terminal and the 404 shell share one engine:
//   [data-terminal]      root; data-autoplay="cmd|cmd", data-mode="404"
//   [data-term-data]     JSON TerminalData (rendered at build time)
//   [data-term-output]   where lines are printed
//   [data-term-body]     the scrolling box (defaults to the output)
//   [data-term-input]    the prompt input, inside a <form>
//   [data-term-cwd]      updated with the current directory
//   [data-term-status]   set to "ready" after the boot sequence
//   [data-term-run]      buttons that run a command on click

import { commands, displayDir, findCommand, type Ctx } from './commands';
import { c, esc, type Line } from './format';
import type { TerminalData } from './types';
import { bootLines } from '../../data/terminalLines';

const commonPrefix = (words: string[]) =>
  words.reduce((acc, w) => {
    let i = 0;
    while (i < acc.length && acc[i] === w[i]) i++;
    return acc.slice(0, i);
  });

export function mountShell(root: HTMLElement, data: TerminalData) {
  const output = root.querySelector<HTMLElement>('[data-term-output]');
  const input = root.querySelector<HTMLInputElement>('[data-term-input]');
  if (!output || !input) return;
  const body = root.querySelector<HTMLElement>('[data-term-body]') ?? output;
  const status = root.querySelector<HTMLElement>('[data-term-status]');
  const notFound = root.dataset.mode === '404';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const promptLine = (cmd: string) =>
    `${c.accent(`${esc(data.handle)}@portfolio`)}${c.muted(`:${displayDir(ctx.cwd)}$`)} ${esc(cmd)}`;

  const ctx: Ctx = {
    data,
    cwd: '',
    setCwd(dir) {
      ctx.cwd = dir;
      root.querySelectorAll('[data-term-cwd]').forEach((el) => (el.textContent = displayDir(dir)));
    },
    path: window.location.pathname,
    notFound,
    history: [],
    clear: () => (output.innerHTML = ''),
    go(section) {
      const target = document.getElementById(section ?? 'top');
      if (target) return target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      const url = `${data.home}${section ? `#${section}` : ''}`;
      print([c.muted(`redirecting to ${esc(url)} ...`)]);
      window.setTimeout(() => (window.location.href = url), reduced ? 0 : 450);
    },
  };

  let cursor = 0;
  const run = (raw: string) => {
    const line = raw.trim();
    print([promptLine(line)]);
    if (!line) return;
    ctx.history.push(line);
    cursor = ctx.history.length;
    const [name, ...args] = line.split(/\s+/);
    const cmd = findCommand(name.toLowerCase());
    if (!cmd) return print([`command not found: ${esc(name)}. Type ${c.accent('help')} to see what I can do.`]);
    const out = cmd.run(ctx, args, line);
    if (out) print(out);
  };

  const complete = () => {
    const value = input.value;
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1];
    if (parts.length === 1 && !last) return;
    const pool =
      parts.length === 1
        ? commands.filter((cmd) => !cmd.hidden).map((cmd) => cmd.name)
        : (findCommand(parts[0].toLowerCase())?.complete?.(ctx, last) ?? []);
    const matches = pool.filter((p) => p.startsWith(last));
    if (!matches.length) return;
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0].endsWith('/') ? matches[0] : `${matches[0]} `;
    } else {
      const common = commonPrefix(matches);
      if (common === last) print([promptLine(value), matches.map((m) => c.accent(esc(m))).join('   ')]);
      parts[parts.length - 1] = common;
    }
    input.value = parts.join(' ');
  };

  root.querySelector('form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    const { history } = ctx;
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
      complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      ctx.clear();
    }
  });

  // Clicking anywhere in the terminal focuses the prompt (unless selecting text or clicking a link/button).
  root.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a, button') || window.getSelection()?.toString()) return;
    input.focus({ preventScroll: true });
  });

  // Quick-command chips.
  root.querySelectorAll<HTMLButtonElement>('[data-term-run]').forEach((btn) =>
    btn.addEventListener('click', () => {
      stopAutoplay();
      run(btn.dataset.termRun!);
      input.focus({ preventScroll: true });
    }),
  );

  // Autoplay: type a few commands by itself on load; stops as soon as the visitor interacts.
  const queue = (root.dataset.autoplay ?? '').split('|').filter(Boolean);
  let interrupted = false;
  const stopAutoplay = () => (interrupted = true);
  input.addEventListener('focus', stopAutoplay, { once: true });
  input.addEventListener('keydown', stopAutoplay, { once: true });
  const typeNext = (delay: number) => {
    const cmd = queue.shift();
    if (!cmd || interrupted) return;
    setTimeout(() => {
      let i = 0;
      const tick = () => {
        if (interrupted) return (input.value = '');
        input.value = cmd.slice(0, ++i);
        if (i < cmd.length) return void setTimeout(tick, reduced ? 0 : 55 + Math.random() * 60);
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

  // 404 boot sequence: "scan" the missing route, then hand over the prompt.
  if (notFound) {
    const boot = bootLines(ctx.path, window.location.origin).map(([t, cls]) => (cls ? `<span class="${cls}">${esc(t)}</span>` : esc(t)));
    const finish = () => {
      if (status) status.textContent = 'ready';
      input.focus({ preventScroll: true });
    };
    if (reduced) {
      print(boot);
      finish();
    } else {
      let i = 0;
      const tick = () => {
        if (i >= boot.length) return finish();
        print([boot[i++]]);
        window.setTimeout(tick, 260);
      };
      tick();
    }
  }
}

/** Mount every terminal on the page once. Safe to call from several components. */
export function mountAll() {
  document.querySelectorAll<HTMLElement>('[data-terminal]:not([data-mounted])').forEach((root) => {
    const json = root.querySelector('[data-term-data]')?.textContent;
    if (!json) return;
    root.dataset.mounted = '';
    mountShell(root, JSON.parse(json) as TerminalData);
  });
}
