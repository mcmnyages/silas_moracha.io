// BEHAVIOUR ONLY. Wires a piece of markup to the command registry.
// It finds its elements by data-attributes, so it works with any markup that has them.

import { commands, sections, type Ctx } from './commands';
import { bootLines } from '../../data/terminalLines';

export interface ShellOptions {
  home: string;
  handle: string;
  name: string;
}

export function mountShell(root: HTMLElement, opts: ShellOptions) {
  const log = root.querySelector<HTMLElement>('[data-log]');
  const input = root.querySelector<HTMLInputElement>('[data-input]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  if (!log || !input) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = window.location.pathname;

  // Everything is written with textContent. The path is user-controlled, so never use innerHTML.
  const print = (text: string, cls = '') => {
    const row = document.createElement('div');
    row.textContent = text;
    if (cls) row.className = cls;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  };

  const echoCommand = (text: string) => {
    const row = document.createElement('div');
    const who = document.createElement('span');
    who.className = 'text-accent';
    who.textContent = `${opts.handle}@portfolio`;
    const sep = document.createElement('span');
    sep.className = 'text-muted';
    sep.textContent = ':~$ ';
    row.append(who, sep, document.createTextNode(text));
    log.appendChild(row);
  };

  const ctx: Ctx = {
    print,
    links(names) {
      const row = document.createElement('div');
      row.className = 'flex flex-wrap gap-x-4';
      names.forEach((n) => {
        const a = document.createElement('a');
        a.href = `${opts.home}#${n}`;
        a.textContent = `${n}/`;
        row.appendChild(a);
      });
      const flag = document.createElement('span');
      flag.className = 'text-muted';
      flag.textContent = 'flag.txt';
      row.appendChild(flag);
      log.appendChild(row);
    },
    go(url) {
      print(`redirecting to ${url}`, 'text-muted');
      window.setTimeout(() => (window.location.href = url), reduced ? 0 : 450);
    },
    clear: () => (log.textContent = ''),
    home: opts.home,
    handle: opts.handle,
    name: opts.name,
    path,
  };

  const run = (raw: string) => {
    const line = raw.trim();
    if (!line) return;
    echoCommand(line);
    const [name, ...args] = line.split(/\s+/);
    const cmd = commands.find((c) => c.name === name || c.aliases?.includes(name));
    if (cmd) cmd.run(ctx, args, line);
    else print(`${name}: command not found. Type help.`, 'text-muted');
  };

  // Boot sequence, then hand over the prompt.
  const finish = () => {
    if (status) status.textContent = 'ready';
    input.focus({ preventScroll: true });
  };
  const boot = bootLines(path, window.location.origin);
  if (reduced) {
    boot.forEach(([t, c]) => print(t, c));
    finish();
  } else {
    let i = 0;
    const tick = () => {
      if (i >= boot.length) return finish();
      print(boot[i][0], boot[i][1]);
      i += 1;
      window.setTimeout(tick, 260);
    };
    tick();
  }

  // History (up/down) and tab completion.
  const history: string[] = [];
  let cursor = 0;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = input.value;
      if (v.trim()) {
        history.push(v);
        cursor = history.length;
      }
      input.value = '';
      run(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cursor > 0) input.value = history[--cursor] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor = Math.min(cursor + 1, history.length);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(/\s+/);
      const last = parts[parts.length - 1];
      const pool = parts.length === 1 ? commands.map((c) => c.name) : sections;
      const hit = pool.find((p) => last && p.startsWith(last));
      if (hit) {
        parts[parts.length - 1] = hit;
        input.value = parts.join(' ');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      ctx.clear();
    }
  });

  root.addEventListener('click', () => input.focus());
}