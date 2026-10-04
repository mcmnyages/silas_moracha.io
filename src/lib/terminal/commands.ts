// LOGIC ONLY. Commands never touch the DOM; they talk to the shell through `Ctx`.
// To add a command, append one object to `commands`. Nothing else changes.

export interface Ctx {
  print(text: string, cls?: string): void;
  links(names: string[]): void;
  go(url: string): void;
  clear(): void;
  home: string;
  handle: string;
  name: string;
  path: string;
}

export interface Command {
  name: string;
  aliases?: string[];
  help: string;
  run(ctx: Ctx, args: string[], raw: string): void;
}

export const sections = ['about', 'experience', 'projects', 'security', 'skills', 'contact'];

const FLAG_B64 = 'ZmxhZ3s0MDRfbjB0X2YwdW5kX2J1dF95MHVfZjB1bmRfbTN9';
const FLAG = 'flag{404_n0t_f0und_but_y0u_f0und_m3}';

export const commands: Command[] = [
  {
    name: 'help',
    help: 'list commands',
    run: (ctx) => commands.forEach((c) => ctx.print(`${c.name.padEnd(8)} ${c.help}`)),
  },
  {
    name: 'ls',
    help: 'list sections of this site',
    run: (ctx) => ctx.links(sections),
  },
  {
    name: 'cd',
    help: 'jump to a section, e.g. cd projects',
    run: (ctx, args) => {
      const target = (args[0] ?? '').replace(/\/$/, '');
      if (!target || ['~', '..', '/'].includes(target)) ctx.go(ctx.home);
      else if (sections.includes(target)) ctx.go(`${ctx.home}#${target}`);
      else ctx.print(`cd: no such file or directory: ${target}`, 'text-muted');
    },
  },
  {
    name: 'pwd',
    help: 'show the path that failed',
    run: (ctx) => {
      ctx.print(ctx.path);
      ctx.print('(404, no such file or directory)', 'text-muted');
    },
  },
  {
    name: 'whoami',
    help: 'who built this',
    run: (ctx) => ctx.print(`${ctx.name} (@${ctx.handle}), software engineer and security enthusiast`),
  },
  {
    name: 'cat',
    help: 'read a file',
    run: (ctx, args) => {
      if (args[0] === 'flag.txt') {
        ctx.print(FLAG_B64);
        ctx.print('Looks encoded. Try: echo <that> | base64 -d', 'text-muted');
      } else if (!args[0]) ctx.print('cat: missing file operand', 'text-muted');
      else ctx.print(`cat: ${args[0]}: No such file or directory`, 'text-muted');
    },
  },
  {
    name: 'echo',
    help: 'print text',
    run: (ctx, args, raw) => {
      if (/base64\s+(-d|--decode)/.test(raw) && raw.includes(FLAG_B64)) {
        ctx.print(FLAG, 'text-accent');
        ctx.print('Nice work. Type `hire` if you want to talk.', 'text-muted');
      } else ctx.print(args.join(' '));
    },
  },
  {
    name: 'sudo',
    help: 'try it',
    run: (ctx) => ctx.print(`${ctx.handle} is not in the sudoers file. This incident will be reported.`),
  },
  {
    name: 'ping',
    help: 'ping a host',
    run: (ctx, args) => {
      ctx.print(`PING ${args[0] ?? 'page'} (404.404.404.404): 56 data bytes`);
      ctx.print('Request timeout for icmp_seq 0', 'text-muted');
    },
  },
  {
    name: 'hire',
    help: 'go to the contact section',
    run: (ctx) => ctx.go(`${ctx.home}#contact`),
  },
  {
    name: 'home',
    aliases: ['exit'],
    help: 'go to the home page',
    run: (ctx) => ctx.go(ctx.home),
  },
  {
    name: 'clear',
    help: 'clear the screen',
    run: (ctx) => ctx.clear(),
  },
];