(window as any).typewriterEffect = function (container: HTMLElement) {
  const lines = container.querySelectorAll('.terminal-line');

  let globalDelay = 0;

  lines.forEach((line, index) => {
    const element = line as HTMLElement;
    const text = element.getAttribute('data-text') || '';
    const prompt = element.getAttribute('data-prompt') || '';
    const promptColor = element.getAttribute('data-prompt-color') || 'text-zinc-400';
    const textColor = element.getAttribute('data-text-color') || 'text-zinc-300';
    const keepCursor = element.getAttribute('data-keep-cursor') === 'true';

    setTimeout(() => {
      element.classList.add('typing');
      element.innerHTML = '';

      if (prompt) {
        const promptSpan = document.createElement('span');
        promptSpan.className = `${promptColor}`;
        promptSpan.textContent = prompt;
        element.appendChild(promptSpan);
      }

      const typewriter = document.createElement('span');
      typewriter.className = `terminal-typewriter ${textColor}`;
      element.appendChild(typewriter);

      if (text === '') {
        if (keepCursor) {
          const cursor = document.createElement('span');
          cursor.className = 'terminal-cursor';
          cursor.innerHTML = '_';
          element.appendChild(cursor);
        }
      } else {
        const tempCursor = document.createElement('span');
        tempCursor.className = 'terminal-cursor';
        tempCursor.innerHTML = '_';
        element.appendChild(tempCursor);

        let letterCount = 0;
        const typingInterval = setInterval(() => {
          if (letterCount < text.length) {
            typewriter.textContent = text.substring(0, letterCount + 1);
            letterCount++;
          } else {
            clearInterval(typingInterval);
            tempCursor.remove();
            if (keepCursor) {
              const permanentCursor = document.createElement('span');
              permanentCursor.className = 'terminal-cursor';
              permanentCursor.innerHTML = '_';
              element.appendChild(permanentCursor);
            }
          }
        }, 45);
      }

    }, globalDelay);

    globalDelay += (text.length * 45) + 100;
  });
};

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const button = target.closest('.tab-button');

  if (!button) return;

  const targetTab = button.getAttribute('data-tab');
  const terminalApp = button.closest('.app-window');

  if (!terminalApp) return;

  const tabButtons = terminalApp.querySelectorAll('.tab-button');
  const tabContents = terminalApp.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.classList.remove('bg-zinc-900', 'border-zinc-700', 'text-zinc-100');
    btn.classList.add('bg-zinc-800', 'border-transparent', 'text-zinc-400');
  });

  button.classList.remove('bg-zinc-800', 'border-transparent', 'text-zinc-400');
  button.classList.add('bg-zinc-900', 'border-zinc-700', 'text-zinc-100');

  tabContents.forEach(content => {
    content.classList.add('hidden');
    content.querySelectorAll('.terminal-line').forEach((line: Element) => {
      const el = line as HTMLElement;
      el.classList.remove('typing');
      el.innerHTML = '';
    });
  });

  const targetContent = terminalApp.querySelector(`[data-tab-content="${targetTab}"]`) as HTMLElement;
  if (targetContent) {
    targetContent.classList.remove('hidden');
    setTimeout(() => (window as any).typewriterEffect(targetContent), 100);
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        const element = node as HTMLElement;
        const firstTab = element.querySelector('.tab-content:not(.hidden)') as HTMLElement;
        if (firstTab && firstTab.querySelector('.terminal-line')) {
          setTimeout(() => (window as any).typewriterEffect(firstTab), 200);
        }
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});