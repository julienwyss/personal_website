export function initContactApp(container: HTMLElement) {
    const history = container.querySelector('.contact-history') as HTMLElement;
    const activeLine = container.querySelector('.contact-active-line') as HTMLElement;
    const promptLabel = container.querySelector('.contact-prompt') as HTMLElement;
    const input = container.querySelector('.contact-input') as HTMLInputElement;
    const honeypot = container.querySelector('.contact-honeypot') as HTMLInputElement;
    const terminalContainer = container.querySelector('.contact-terminal') as HTMLElement;

    if (!history || !activeLine || !input) {
        console.error("Contact App: Missing required elements.");
        return;
    }

    terminalContainer.addEventListener('click', () => input.focus());
    terminalContainer.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      if (target !== input) input.focus();
    });

    input.addEventListener('focus', () => {
      setTimeout(() => scrollToBottom(), 350);
    });

    let currentStep = 0;
    let formData = { name: '', email: '', message: '', access_key: '' };
    let verificationResult = 0;

    const steps = [
        { key: 'cmd', prompt: "user@portfolio:~$", text: "./contactForm.sh", isCommand: true },
        { key: 'start', prompt: null, text: "Initializing contact protocol..." },
        { key: 'intro', prompt: null, text: "--- CONTACT FORM WIZARD v1.0 ---" },
        { key: 'name', prompt: "Enter your name:", type: "input" },
        { key: 'email', prompt: "Enter your email:", type: "input" },
        { key: 'message', prompt: "Enter your message:", type: "input" },
        { key: 'verify', prompt: "Security Check:", type: "input" },
        { key: 'confirm', prompt: "Send message? [Y/n]:", type: "input" },
        
        { key: 'sending', prompt: null, text: "Sending data packages...", autoAdvance: false },
        
        { key: 'done', prompt: null, text: "Message sent successfully! Closing connection." }
    ];

    const scrollToBottom = () => {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    };

    function addLine(text: string, isCommand = false, customClass = "") {
        const div = document.createElement('div');
        div.className = 'typing-line flex items-center flex-wrap';
        history.insertBefore(div, activeLine);

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
            const typingInterval = setInterval(() => {
                if (letterCount < text.length) {
                    typewriter.textContent = text.substring(0, letterCount + 1);
                    letterCount++;
                    scrollToBottom();
                } else {
                    clearInterval(typingInterval);
                    cursor.remove();
                }
            }, 45);
        } else {
            div.className = `${customClass || 'text-zinc-400'} typing-line`;
            
            const typewriter = document.createElement('span');
            div.appendChild(typewriter);

            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor ml-1 bg-zinc-400 w-2 h-4 inline-block';
            div.appendChild(cursor);

            let letterCount = 0;
            const typingInterval = setInterval(() => {
                if (letterCount < text.length) {
                    typewriter.textContent = text.substring(0, letterCount + 1);
                    letterCount++;
                    scrollToBottom();
                } else {
                    clearInterval(typingInterval);
                    cursor.remove();
                }
            }, 30);
        }
        scrollToBottom();
    }

    function nextStep() {
        if (currentStep >= steps.length) return;
        const step = steps[currentStep] as any;

        setTimeout(() => {
            if (step.type === 'input') {
                activeLine.classList.remove('hidden');
                
                if (step.key === 'verify') {
                   const numA = Math.floor(Math.random() * 10) + 1;
                   const numB = Math.floor(Math.random() * 10) + 1;
                   verificationResult = numA + numB;
                   promptLabel.textContent = `[SECURITY] ${numA} + ${numB}:`;
                   promptLabel.className = "contact-prompt font-bold text-yellow-500 mr-2"; 
                } else {
                   promptLabel.textContent = step.prompt || '';
                   promptLabel.className = "contact-prompt font-bold text-zinc-100 mr-2";
                }

                input.value = '';
                input.focus();
                scrollToBottom();
            }
            else {
                activeLine.classList.add('hidden');
                addLine(step.text || '', step.isCommand);

                if (step.autoAdvance === false) {
                    return; 
                }

                const typingSpeed = step.isCommand ? 45 : 30;
                const animationDuration = ((step.text || '').length * typingSpeed) + 300;

                setTimeout(() => {
                    currentStep++;
                    nextStep();
                }, animationDuration);
            }
        }, 100);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const value = input.value.trim();
            const step = steps[currentStep];

            if (!value && step.key !== 'confirm') return;

            activeLine.classList.add('hidden');

            if (step.key === 'verify') {
                if (parseInt(value) !== verificationResult) {
                    addLine(`[ERROR] Verification failed. Try Again.`, false, "text-red-500 font-bold");
                    setTimeout(() => nextStep(), 2000);
                    return;
                } else {
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
                    history.insertBefore(historyLine, activeLine);
                    scrollToBottom();
                    currentStep++;
                    nextStep();
                    return;
                }
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
                history.insertBefore(historyLine, activeLine);
                scrollToBottom();
            }

            if (step.key === 'confirm') {
                if (value.toLowerCase() === 'y' || value === '') {
                    currentStep++;
                    nextStep();

                    const apiKey = "035f6d55-197b-4b4c-b967-6a81609e49af";
                    formData.access_key = apiKey;

                    setTimeout(() => {
                        if (honeypot && honeypot.value.trim() !== '') {
                            currentStep++;
                            nextStep();
                            return;
                        }

                        fetch("https://api.web3forms.com/submit", { 
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(formData)
                        })
                        .then(res => {
                            if (res.ok) {
                                currentStep++;
                                nextStep(); 
                            } else {
                                addLine("Error: Server refused connection.", false, "text-red-400");
                            }
                        })
                        .catch(err => {
                            addLine("Network Error: Packet lost.", false, "text-red-400");
                        });
                    }, 1500);

                } else {
                    addLine("Aborted by user.", false, "text-yellow-500");
                }
            } else {
                currentStep++;
                nextStep();
            }
        }
    });

    nextStep();
}