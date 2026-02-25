type Step = {
  key: string;
  prompt?: string | null;
  text?: string;
  type?: 'input';
  isCommand?: boolean;
  autoAdvance?: boolean;
  persistent?: boolean;
};

export function initContactApp(container: HTMLElement) {
  const history = container.querySelector('.contact-history') as HTMLElement | null;
  const activeLine = container.querySelector('.contact-active-line') as HTMLElement | null;
  const promptLabel = container.querySelector('.contact-prompt') as HTMLElement | null;
  const input = container.querySelector('.contact-input') as HTMLInputElement | null;
  const honeypot = container.querySelector('.contact-honeypot') as HTMLInputElement | null;
  const terminalContainer = container.querySelector('.contact-terminal') as HTMLElement | null;

  if (!history || !activeLine || !promptLabel || !input || !terminalContainer) {
    console.error('Contact App: Missing required elements.');
    return;
  }

  const historyEl = history;
  const activeLineEl = activeLine;
  const promptLabelEl = promptLabel;
  const inputEl = input;
  const terminalEl = terminalContainer;

  const scrollToBottom = () => {
    terminalEl.scrollTop = terminalEl.scrollHeight;
  };

  terminalEl.addEventListener('click', () => inputEl.focus());
  terminalEl.addEventListener('touchend', (e) => {
    const target = e.target as HTMLElement;
    if (target !== inputEl) inputEl.focus();
  });

  inputEl.addEventListener('focus', () => {
    setTimeout(() => scrollToBottom(), 350);
  });

  let currentStep = 0;
  let formData = { name: '', email: '', message: '', access_key: '' };
  let verificationResult = 0;

  const COMMAND_TYPING_SPEED = 30;
  const OUTPUT_TYPING_SPEED = 20;

  const steps: Step[] = [
    { key: 'cmd', prompt: 'user@portfolio:~$', text: './contactForm.sh', isCommand: true, persistent: true },
    { key: 'start', prompt: null, text: 'Initializing contact protocol...', persistent: true },
    { key: 'intro', prompt: null, text: '--- CONTACT FORM WIZARD v1.0 ---', persistent: true },
    { key: 'name', prompt: 'Enter your name:', type: 'input' },
    { key: 'email', prompt: 'Enter your email:', type: 'input' },
    { key: 'message', prompt: 'Enter your message:', type: 'input' },
    { key: 'verify', prompt: 'Security Check:', type: 'input' },
    { key: 'confirm', prompt: 'Send message? [Y/n]:', type: 'input' },
    { key: 'sending', prompt: null, text: 'Sending data packages...', autoAdvance: false },
    { key: 'retry', prompt: 'Retry? [Y/n]:', type: 'input' },
    { key: 'done', prompt: null, text: 'Message sent successfully! Closing connection.' }
  ];

  const getStepIndex = (key: string) => steps.findIndex(s => s.key === key);

  function addLine(text: string, isCommand = false, customClass = ''): HTMLElement {
    const div = document.createElement('div');
    div.className = 'typing-line flex items-center flex-wrap';
    historyEl.insertBefore(div, activeLineEl);

    if (isCommand) {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'text-green-400 mr-2';
      promptSpan.textContent = 'user@portfolio:~$ ';
      div.appendChild(promptSpan);

      const typewriter = document.createElement('span');
      typewriter.className = 'text-zinc-100';
      div.appendChild(typewriter);

      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor ml-1 bg-zinc-400 w-2 h-4 inline-block';
      div.appendChild(cursor);

      let letterCount = 0;
      const typingInterval = window.setInterval(() => {
        if (letterCount < text.length) {
          typewriter.textContent = text.substring(0, letterCount + 1);
          letterCount++;
          scrollToBottom();
        } else {
          window.clearInterval(typingInterval);
          cursor.remove();
        }
      }, COMMAND_TYPING_SPEED);
    } else {
      div.className = `${customClass || 'text-zinc-400'} typing-line`;

      const typewriter = document.createElement('span');
      div.appendChild(typewriter);

      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor ml-1 bg-zinc-400 w-2 h-4 inline-block';
      div.appendChild(cursor);

      let letterCount = 0;
      const typingInterval = window.setInterval(() => {
        if (letterCount < text.length) {
          typewriter.textContent = text.substring(0, letterCount + 1);
          letterCount++;
          scrollToBottom();
        } else {
          window.clearInterval(typingInterval);
          cursor.remove();
        }
      }, OUTPUT_TYPING_SPEED);
    }

    scrollToBottom();
    return div;
  }

  function nextStep() {
    if (currentStep >= steps.length) return;
    const step = steps[currentStep] as Step;

    window.setTimeout(() => {
      if (step.type === 'input') {
        activeLineEl.classList.remove('hidden');

        if (step.key === 'verify') {
          const numA = Math.floor(Math.random() * 10) + 1;
          const numB = Math.floor(Math.random() * 10) + 1;
          verificationResult = numA + numB;
          promptLabelEl.textContent = `[SECURITY] ${numA} + ${numB}:`;
          promptLabelEl.className = 'contact-prompt font-bold text-yellow-500 mr-2';
        } else {
          promptLabelEl.textContent = step.prompt || '';
          promptLabelEl.className = 'contact-prompt font-bold text-zinc-100 mr-2';
        }

        inputEl.value = '';
        inputEl.focus();
        scrollToBottom();
        return;
      }

      activeLineEl.classList.add('hidden');
      const line = addLine(step.text || '', !!step.isCommand);
      if (step.persistent) line.dataset.persistent = 'true';

      if (step.autoAdvance === false) return;

      const typingSpeed = step.isCommand ? COMMAND_TYPING_SPEED : OUTPUT_TYPING_SPEED;
      const animationDuration = ((step.text || '').length * typingSpeed) + 300;

      window.setTimeout(() => {
        currentStep++;
        nextStep();
      }, animationDuration);
    }, 50);
  }

  const resetWizard = () => {
    Array.from(historyEl.children).forEach(child => {
      const el = child as HTMLElement;
      const isPersistent = el.dataset?.persistent === 'true';
      if (child !== activeLineEl && !isPersistent) child.remove();
    });

    formData = { name: '', email: '', message: '', access_key: '' };
    verificationResult = 0;

    inputEl.value = '';
    if (honeypot) honeypot.value = '';

    activeLineEl.classList.add('hidden');
    currentStep = getStepIndex('name');

    window.setTimeout(() => nextStep(), 150);
  };

  const submitForm = () => {
    const apiKey = import.meta.env.PUBLIC_WEB3FORMS_KEY as string;
    formData.access_key = apiKey;

    window.setTimeout(() => {
      if (honeypot && honeypot.value.trim() !== '') {
        currentStep = getStepIndex('done');
        nextStep();
        return;
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => {
          if (res.ok) {
            currentStep = getStepIndex('done');
            nextStep();
          } else {
            addLine('Error: Server refused connection.', false, 'text-red-400');
            currentStep = getStepIndex('retry');
            nextStep();
          }
        })
        .catch(() => {
          addLine('Network Error: Packet lost.', false, 'text-red-400');
          currentStep = getStepIndex('retry');
          nextStep();
        });
    }, 1500);
  };

  inputEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const step = steps[currentStep];
    const value = inputEl.value.trim();

    if (!step) return;
    if (!value && step.key !== 'confirm' && step.key !== 'retry') return;

    activeLineEl.classList.add('hidden');

    if (step.key === 'verify') {
      if (parseInt(value, 10) !== verificationResult) {
        addLine('[ERROR] Verification failed. Try Again.', false, 'text-red-500 font-bold');
        window.setTimeout(() => nextStep(), 800);
        return;
      }

      const historyLine = document.createElement('div');
      historyLine.className = 'flex items-baseline gap-2 h-5';
      const secLabel = document.createElement('span');
      secLabel.className = 'text-yellow-500 leading-none h-5 flex items-center';
      secLabel.textContent = '[SECURITY]';
      const secValue = document.createElement('span');
      secValue.className = 'text-zinc-300 leading-none h-5 flex items-center';
      secValue.textContent = value;
      const secOk = document.createElement('span');
      secOk.className = 'text-green-500 leading-none h-5 flex items-center';
      secOk.textContent = '✓ Verified';
      historyLine.append(secLabel, secValue, secOk);
      historyEl.insertBefore(historyLine, activeLineEl);
      scrollToBottom();

      currentStep++;
      nextStep();
      return;
    }

    if (step.key === 'name') formData.name = value;
    if (step.key === 'email') formData.email = value;
    if (step.key === 'message') formData.message = value;

    if (step.key !== 'verify') {
      const historyLine = document.createElement('div');
      historyLine.className = 'flex items-baseline gap-2 h-5';
      const qMark = document.createElement('span');
      qMark.className = 'text-cyan-400 leading-none h-5 flex items-center';
      qMark.textContent = '?';
      const promptSpan = document.createElement('span');
      promptSpan.className = 'font-bold text-zinc-100 leading-none h-5 flex items-center';
      promptSpan.textContent = step.prompt ?? '';
      const valueSpan = document.createElement('span');
      valueSpan.className = 'text-zinc-300 leading-none h-5 flex items-center';
      valueSpan.textContent = value;
      historyLine.append(qMark, promptSpan, valueSpan);
      historyEl.insertBefore(historyLine, activeLineEl);
      scrollToBottom();
    }

    if (step.key === 'retry') {
      const normalized = value.toLowerCase();
      if (normalized === 'y' || value === '') {
        resetWizard();
      } else if (normalized === 'n') {
        addLine('Aborted by user.', false, 'text-yellow-500');
      } else {
        addLine("Please answer with 'y' or 'n'.", false, 'text-yellow-500');
        currentStep = getStepIndex('retry');
        window.setTimeout(() => nextStep(), 300);
      }
      return;
    }

    if (step.key === 'confirm') {
      if (value.toLowerCase() === 'y' || value === '') {
        currentStep = getStepIndex('sending');
        nextStep();
        submitForm();
      } else {
        addLine('Aborted by user.', false, 'text-yellow-500');
        currentStep = getStepIndex('retry');
        window.setTimeout(() => nextStep(), 300);
      }
      return;
    }

    currentStep++;
    nextStep();
  });

  nextStep();
}
