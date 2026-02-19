type TimerId = number;

class AnimationManager {
  private timeouts = new Set<TimerId>();
  private intervals = new Set<TimerId>();

  clearAll(): void {
    this.timeouts.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timeouts.clear();
    this.intervals.clear();
  }

  setTimeout(callback: () => void, delay: number): TimerId {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      callback();
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  setInterval(callback: () => void, delay: number): TimerId {
    const id = window.setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  clearInterval(id: TimerId): void {
    window.clearInterval(id);
    this.intervals.delete(id);
  }
}

const animationManager = new AnimationManager();
const TYPING_SPEED = 45;

interface LineConfig {
  text: string;
  prompt: string;
  promptColor: string;
  textColor: string;
  keepCursor: boolean;
}

class TypewriterRenderer {
  constructor(private container: HTMLElement) {}

  run(): void {
    animationManager.clearAll();

    const lines = this.getLines();
    const progressBars = this.getProgressBars();

    let delay = this.renderStandardLines(lines.standard);
    delay += this.renderProgressBars(progressBars, delay);
    this.renderCursorLines(lines.withCursor, delay);
  }

  private getLines() {
    const all = Array.from(
      this.container.querySelectorAll<HTMLElement>('.terminal-line')
    );

    const standard: HTMLElement[] = [];
    const withCursor: HTMLElement[] = [];

    all.forEach(line =>
      this.getLineConfig(line).keepCursor
        ? withCursor.push(line)
        : standard.push(line)
    );

    return { standard, withCursor };
  }

  private getProgressBars(): HTMLElement[] {
    return Array.from(
      this.container.querySelectorAll<HTMLElement>('.terminal-progress-bar')
    );
  }

  private getLineConfig(element: HTMLElement): LineConfig {
    return {
      text: element.dataset.text ?? '',
      prompt: element.dataset.prompt ?? '',
      promptColor: element.dataset.promptColor ?? 'text-zinc-400',
      textColor: element.dataset.textColor ?? 'text-zinc-300',
      keepCursor: element.dataset.keepCursor === 'true'
    };
  }

  private renderStandardLines(lines: HTMLElement[]): number {
    let delay = 0;

    lines.forEach(line => {
      const config = this.getLineConfig(line);

      animationManager.setTimeout(() => {
        this.renderTypingLine(line, config);
      }, delay);

      delay += config.text.length * TYPING_SPEED + 100;
    });

    return delay;
  }

  private renderCursorLines(lines: HTMLElement[], startDelay: number): void {
    let delay = startDelay;

    lines.forEach(line => {
      const config = this.getLineConfig(line);

      animationManager.setTimeout(() => {
        this.renderTypingLine(line, config, true);
      }, delay);

      delay += config.text.length * TYPING_SPEED + 100;
    });
  }

  private renderTypingLine(
    element: HTMLElement,
    config: LineConfig,
    permanentCursor = false
  ): void {
    element.classList.add('typing');
    element.innerHTML = '';

    if (config.prompt) {
      element.appendChild(this.createSpan(config.prompt, config.promptColor));
    }

    const textSpan = this.createSpan('', `terminal-typewriter ${config.textColor}`);
    element.appendChild(textSpan);

    if (!config.text) {
      if (permanentCursor) element.appendChild(this.createCursor());
      return;
    }

    const cursor = this.createCursor();
    element.appendChild(cursor);

    let index = 0;

    const interval = animationManager.setInterval(() => {
      if (index < config.text.length) {
        textSpan.textContent = config.text.slice(0, ++index);
      } else {
        animationManager.clearInterval(interval);
        cursor.remove();
        if (permanentCursor) element.appendChild(this.createCursor());
      }
    }, TYPING_SPEED);
  }

  private renderProgressBars(bars: HTMLElement[], baseDelay: number): number {
    let maxTime = 0;

    bars.forEach((bar, index) => {
      const skill = bar.dataset.skill ?? '';
      const level = this.normalizeLevel(Number(bar.dataset.level ?? 0));
      const width = this.calculateBarWidth();
      const filledLength = Math.round((level / 5) * width);

      const fillSpeed = this.random(60, 120);
      const startOffset = this.random(0, 1200);
      const listingDelay = index * 20;

      const setupDelay = baseDelay + listingDelay;
      const fillDelay = setupDelay + startOffset;
      const animationTime = startOffset + filledLength * fillSpeed + 200;

      maxTime = Math.max(maxTime, animationTime);

      animationManager.setTimeout(
        () => this.setupProgressBar(bar, skill, width),
        setupDelay
      );

      animationManager.setTimeout(
        () =>
          this.animateProgressBar(bar, filledLength, width, level, fillSpeed),
        fillDelay
      );
    });

    return maxTime;
  }

  private setupProgressBar(
    element: HTMLElement,
    skill: string,
    width: number
  ): void {
    element.classList.add('typing');
    element.innerHTML = '';

    element.appendChild(
      this.createSpan(
        skill + '\u00A0'.repeat(Math.max(0, 20 - skill.length)),
        'text-purple-400'
      )
    );

    element.appendChild(this.createSpan('[', 'text-zinc-500'));

    const barSpan = this.createSpan('\u00A0'.repeat(width), 'text-green-400');
    element.appendChild(barSpan);

    element.appendChild(this.createSpan('] ', 'text-zinc-500'));
    element.appendChild(this.createSpan('1/5', 'text-zinc-400'));
  }

  private animateProgressBar(
    element: HTMLElement,
    filledLength: number,
    width: number,
    level: number,
    speed: number
  ): void {
    const barSpan = element.querySelector<HTMLElement>('.text-green-400');
    const ratingSpan = element.querySelector<HTMLElement>('.text-zinc-400');

    if (!barSpan || !ratingSpan) return;

    let current = 0;

    const interval = animationManager.setInterval(() => {
      if (current <= filledLength) {
        barSpan.textContent =
          '|'.repeat(current) +
          '\u00A0'.repeat(Math.max(0, width - current));

        const normalized = Math.min(
          5,
          Math.max(1, Math.ceil((current / width) * 5))
        );

        ratingSpan.textContent = `${normalized}/5`;
        current++;
      } else {
        animationManager.clearInterval(interval);
        barSpan.textContent =
          '|'.repeat(filledLength) +
          '\u00A0'.repeat(Math.max(0, width - filledLength));
        ratingSpan.textContent = `${level}/5`;
      }
    }, speed);
  }

  private calculateBarWidth(): number {
    const charWidth = 8;
    const reserved = 30;
    const available = Math.floor(this.container.offsetWidth / charWidth);
    return Math.max(10, Math.min(80, available - reserved));
  }

  private normalizeLevel(level: number): number {
    return Math.min(5, Math.max(1, level));
  }

  private createSpan(text: string, className: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  private createCursor(): HTMLSpanElement {
    return this.createSpan('_', 'terminal-cursor');
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

(window as any).typewriterEffect = (container: HTMLElement) =>
  new TypewriterRenderer(container).run();

class TabController {
  constructor() {
    document.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(e: Event): void {
    const target = (e.target as HTMLElement).closest('.tab-button');
    if (!target) return;

    const tab = target.getAttribute('data-tab');
    const app = target.closest('.app-window');
    if (!app || !tab) return;

    this.resetTabs(app);
    this.activateTab(target);

    const content = app.querySelector<HTMLElement>(
      `[data-tab-content="${tab}"]`
    );

    if (content) {
      content.classList.remove('hidden');
      setTimeout(() => (window as any).typewriterEffect(content), 100);
    }
  }

  private resetTabs(app: Element): void {
    app.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('bg-zinc-900', 'border-zinc-700', 'text-zinc-100');
      btn.classList.add('bg-zinc-800', 'border-transparent', 'text-zinc-400');
    });

    app.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
      content
        .querySelectorAll<HTMLElement>(
          '.terminal-line, .terminal-progress-bar'
        )
        .forEach(el => {
          el.classList.remove('typing');
          el.innerHTML = '';
        });
    });
  }

  private activateTab(button: Element): void {
    button.classList.remove(
      'bg-zinc-800',
      'border-transparent',
      'text-zinc-400'
    );
    button.classList.add('bg-zinc-900', 'border-zinc-700', 'text-zinc-100');
  }
}

new TabController();

new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      const element = node as HTMLElement;
      const activeTab = element.querySelector<HTMLElement>(
        '.tab-content:not(.hidden)'
      );

      if (activeTab?.querySelector('.terminal-line')) {
        setTimeout(
          () => (window as any).typewriterEffect(activeTab),
          200
        );
      }
    });
  });
}).observe(document.body, { childList: true, subtree: true });
