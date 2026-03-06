type HelpLine = {
  text: string;
  color?: string;
  isCommand?: boolean;
};

const HELP_LINES_DESKTOP: HelpLine[] = [
  { text: 'willkommen.sh', isCommand: true },
  { text: '' },
  { text: '┌─────────────────────────────────────────┐', color: 'text-red-500' },
  { text: '│       WILLKOMMEN AUF MEINEM PORTFOLIO   │', color: 'text-red-500' },
  { text: '└─────────────────────────────────────────┘', color: 'text-red-500' },
  { text: '' },
  { text: 'Diese Seite funktioniert wie ein Desktop Betriebssystem.', color: 'text-zinc-300' },
  { text: 'Klicke auf ein Icon in der linken Taskleiste, um eine App zu öffnen.', color: 'text-zinc-300' },
  { text: 'Fenster können verschoben, vergrössert und minimiert werden.', color: 'text-zinc-300' },
  { text: 'Mehrere Fenster können gleichzeitig geöffnet sein.', color: 'text-zinc-300' },
  { text: '' },
  { text: '── APPS ──────────────────────────────────', color: 'text-zinc-500' },
  { text: '' },
  { text: '  [>_]  Terminal    – Infos  über mich', color: 'text-zinc-300' },
  { text: '  [📁]  WriteUps    – CTF Challenge Writeups', color: 'text-zinc-300' },
  { text: '  [✉]  Kontakt     – schreib mir eine Nachricht', color: 'text-zinc-300' },
  { text: '  [GH]  GitHub      – meine Repositories', color: 'text-zinc-300' },
  { text: '  [in]  LinkedIn    – mein Profil', color: 'text-zinc-300' },
  { text: '  [⚑]  CTFtime     – mein CTF Profil', color: 'text-zinc-300' },
  { text: '' },
  { text: '── TIPPS ─────────────────────────────────', color: 'text-zinc-500' },
  { text: '' },
  { text: '  • Fenster lassen sich per Drag verschieben.', color: 'text-zinc-400' },
  { text: '  • Am Rand eines Fensters kann die Grösse angepasst werden.', color: 'text-zinc-400' },
  { text: '  • Minimierte Apps erscheinen in der Leiste unten.', color: 'text-zinc-400' },
  { text: '' },
  { text: '  Dieses Fenster kann jederzeit geschlossen werden.', color: 'text-green-400' },
  { text: '' },
];

const HELP_LINES_MOBILE: HelpLine[] = [
  { text: 'willkommen.sh', isCommand: true },
  { text: '' },
  { text: '┌──────────────────────┐', color: 'text-red-500' },
  { text: '│  WILLKOMMEN AUF      │', color: 'text-red-500' },
  { text: '│  MEINEM PORTFOLIO    │', color: 'text-red-500' },
  { text: '└──────────────────────┘', color: 'text-red-500' },
  { text: '' },
  { text: 'Diese Seite funktioniert wie ein Desktop Betriebssystem.', color: 'text-zinc-300' },
  { text: 'Tippe auf ein Icon in der unteren Taskleiste, um eine App zu öffnen.', color: 'text-zinc-300' },
  { text: 'Fenster können minimiert und geschlossen werden.', color: 'text-zinc-300' },
  { text: '' },
  { text: '── APPS ──────────────────────────────────', color: 'text-zinc-500' },
  { text: '' },
  { text: '  [>_]  Terminal    – Infos über mich', color: 'text-zinc-300' },
  { text: '  [📁]  WriteUps    – CTF Challenge Writeups', color: 'text-zinc-300' },
  { text: '  [✉]  Kontakt     – schreib mir eine Nachricht', color: 'text-zinc-300' },
  { text: '  [GH]  GitHub      – meine Repositories', color: 'text-zinc-300' },
  { text: '  [in]  LinkedIn    – mein Profil', color: 'text-zinc-300' },
  { text: '  [⚑]  CTFtime     – mein CTF Profil', color: 'text-zinc-300' },
  { text: '' },
  { text: '── TIPPS ─────────────────────────────────', color: 'text-zinc-500' },
  { text: '' },
  { text: '  • Mehrere Apps können gleichzeitig geöffnet sein.', color: 'text-zinc-400' },
  { text: '  • Minimierte Apps erscheinen in der Leiste unten.', color: 'text-zinc-400' },
  { text: '' },
  { text: '  Dieses Fenster kann jederzeit geschlossen werden.', color: 'text-green-400' },
  { text: '' },
];

const TYPING_SPEED = 18;
const COMMAND_SPEED = 28;

export function initHelpApp(container: HTMLElement) {
  const terminal = container.querySelector('.help-terminal') as HTMLElement | null;
  const historyEl = container.querySelector('.help-history') as HTMLElement | null;

  if (!terminal || !historyEl) return;

  const lines = window.innerWidth < 768 ? HELP_LINES_MOBILE : HELP_LINES_DESKTOP;

  let totalDelay = 0;

  for (const line of lines) {
    if (!line.text) {
      const delay = totalDelay;
      window.setTimeout(() => {
        const empty = document.createElement('div');
        empty.className = 'h-4';
        historyEl.appendChild(empty);
        terminal.scrollTop = terminal.scrollHeight;
      }, delay);
      totalDelay += 40;
      continue;
    }

    const speed = line.isCommand ? COMMAND_SPEED : TYPING_SPEED;
    const animDuration = line.text.length * speed + 60;
    const delay = totalDelay;

    window.setTimeout(() => {
      const div = document.createElement('div');
      historyEl.appendChild(div);

      if (line.isCommand) {
        div.className = 'flex items-baseline gap-2';
        const prompt = document.createElement('span');
        prompt.className = 'text-green-400 shrink-0';
        prompt.textContent = 'user@portfolio:~$';
        div.appendChild(prompt);
      }

      const leadingSpaces = line.text.match(/^ */)?.[0].length ?? 0;
      const textContent = line.text.slice(leadingSpaces);

      const textSpan = document.createElement('span');
      textSpan.className = (line.color ?? 'text-zinc-400') + ' break-words min-w-0';
      textSpan.style.whiteSpace = 'pre-wrap';
      if (leadingSpaces > 0) {
        textSpan.style.display = 'block';
        textSpan.style.paddingLeft = `${leadingSpaces}ch`;
      }
      div.appendChild(textSpan);

      const cursor = document.createElement('span');
      cursor.className = 'inline-block w-2 h-4 bg-zinc-400 ml-1 align-middle';

      const textNode = document.createTextNode('');
      textSpan.appendChild(textNode);
      textSpan.appendChild(cursor);

      let i = 0;
      const iv = window.setInterval(() => {
        if (i < textContent.length) {
          textNode.nodeValue = textContent.slice(0, ++i);
          terminal.scrollTop = terminal.scrollHeight;
        } else {
          window.clearInterval(iv);
          cursor.remove();
          terminal.scrollTop = terminal.scrollHeight;
        }
      }, speed);
    }, delay);

    totalDelay += animDuration;
  }
}
