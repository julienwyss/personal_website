type AppId = "terminal" | "linkedin" | "github" | "contact" | "explorer" | "writeup-viewer" | "image-viewer";
import { initContactApp } from './ContactApp';
import { initExplorer } from './WriteUpApp';
import { initWriteupViewer } from './WriteUpApp';
import { initImageViewer } from './WriteUpApp';

let zIndex = 10;
const app_open_start_left = 100;
const app_open_start_top = 100;
const app_offset = 30;

function isMobile(): boolean {
  return window.innerWidth < 768;
}

const windowLayer = document.getElementById("window-layer")!;

const apps: Record<AppId, () => HTMLElement> = {
  terminal: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      ${document.getElementById("terminal-template")?.innerHTML}
    `;
    return wrapper.firstElementChild as HTMLElement;
  },
  linkedin: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      ${document.getElementById("linkedin-template")?.innerHTML}
    `;
    return wrapper.firstElementChild as HTMLElement;
  },
  github: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      ${document.getElementById("github-template")?.innerHTML}
    `;
    return wrapper.firstElementChild as HTMLElement;
  },
  contact: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      ${document.getElementById("contact-template")?.innerHTML}
    `;
    return wrapper.firstElementChild as HTMLElement;
  },
  explorer: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = document.getElementById("explorer-template")?.innerHTML || "";
    return wrapper.firstElementChild as HTMLElement;
  },
  "writeup-viewer": () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = document.getElementById("viewer-template")?.innerHTML || "";
    return wrapper.firstElementChild as HTMLElement;
  },
  "image-viewer": () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = document.getElementById("image-viewer-template")?.innerHTML || "";
    return wrapper.firstElementChild as HTMLElement;
  },
};

(window as any).openApp = (appId: AppId, args?: any) => {
  const app = apps[appId];
  if (!app) return;

  const win = app();
  if (!win) return;

  const existingWindows = document.querySelectorAll('.app-window');

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const wrapColumnOffset = 60;
  const maxWraps = Math.max(1, Math.floor((screenWidth - app_open_start_left - 200) / wrapColumnOffset));

  let attempt = 0;
  let leftPos = 0;
  let topPos = 0;
  const maxAttempts = 500;

  while (attempt < maxAttempts) {
    const stepsPerCascade = Math.max(1, Math.floor((screenHeight - app_open_start_top - 200) / app_offset));
    const wrap = Math.floor(attempt / stepsPerCascade) % maxWraps;
    const step = attempt % stepsPerCascade;

    leftPos = app_open_start_left + (wrap * wrapColumnOffset) + (step * app_offset);
    topPos = app_open_start_top + (step * app_offset);

    let occupied = false;
    existingWindows.forEach((w: Element) => {
      const el = w as HTMLElement;
      const wLeft = parseInt(el.style.left || '0');
      const wTop = parseInt(el.style.top || '0');

      if (Math.abs(wLeft - leftPos) < 15 && Math.abs(wTop - topPos) < 15) {
        occupied = true;
      }
    });

    if (!occupied) {
      break;
    }

    attempt++;
  }

  if (isMobile()) {
    win.style.left = '0px';
    win.style.top = '0px';
    win.style.width = '100%';
    win.style.height = 'calc(100% - 56px)';
  } else {
    win.style.left = `${leftPos}px`;
    win.style.top = `${topPos}px`;
  }
  win.style.zIndex = String(zIndex++);

  windowLayer.appendChild(win);

  if (appId === 'contact') {
    initContactApp(win);
  }

  if (appId === 'linkedin') {
    const container = win.querySelector('.linkedin-container');
    if (container) {
      const badge = document.createElement('div');
      badge.className = 'badge-base LI-profile-badge';
      badge.setAttribute('data-locale', 'de_DE');
      badge.setAttribute('data-size', 'large');
      badge.setAttribute('data-theme', 'dark');
      badge.setAttribute('data-type', 'HORIZONTAL');
      badge.setAttribute('data-vanity', 'julien-wyss-39004028b');
      badge.setAttribute('data-version', 'v1');

      badge.style.display = 'block';
      badge.style.margin = '0 auto';

      container.appendChild(badge);

      if ((window as any).LIRenderAll) {
        (window as any).LIRenderAll();
      }
    }
  }

  if (appId === 'explorer') {
    initExplorer(win, args);
  }

  if (appId === 'writeup-viewer') {
    initWriteupViewer(win, args);
  }
  if (appId === 'image-viewer') {
    initImageViewer(win, args);
  }
  enableWindowControls(win);
};

function enableWindowControls(win: HTMLElement) {
  const titleBar = win.querySelector(".title-bar") as HTMLElement;
  const closeBtn = win.querySelector("#btn-close") as HTMLElement;
  const maxBtn = win.querySelector("#btn-maximize") as HTMLElement;
  const minBtn = win.querySelector("#btn-minimize") as HTMLElement;
  const minimizeBar = document.getElementById("minimize-bar")!;

  win.addEventListener("mousedown", () => {
    win.style.zIndex = String(zIndex++);
  });

  if (isMobile()) {
    maxBtn.style.display = 'none';
  }

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    if (isMobile()) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const taskbarWidth = 57;
    const titleBarHeight = titleBar.offsetHeight;
    const winWidth = win.offsetWidth;

    const newLeft = Math.max(taskbarWidth, Math.min(e.clientX - offsetX, window.innerWidth - winWidth));
    const newTop = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - titleBarHeight));

    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  closeBtn.addEventListener("click", () => {
    win.remove();
  });

  let minimizeTab: HTMLElement | null = null;

  minBtn.addEventListener("click", () => {
    const title = titleBar.querySelector("span")?.textContent || "App";

    win.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    win.style.opacity = "0";
    win.style.transform = "scale(0.9) translateY(20px)";

    setTimeout(() => {
      win.style.display = "none";
      win.style.transition = "";
      win.style.opacity = "";
      win.style.transform = "";
    }, 200);

    minimizeTab = document.createElement("div");
    minimizeTab.className = "pointer-events-auto flex items-center gap-2 bg-zinc-800 border border-zinc-700 border-b-0 rounded-t-md px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-700 transition-colors select-none max-w-[160px]";
    minimizeTab.innerHTML = `
      <span class="truncate flex-1">${title}</span>
      <button class="tab-close ml-1 text-zinc-500 hover:text-red-500 leading-none cursor-pointer transition-colors" title="Schließen">&#x2715;</button>
    `;

    minimizeTab.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("tab-close")) {
        win.remove();
        minimizeTab?.remove();
        minimizeTab = null;
        return;
      }
      win.style.display = "";
      win.style.zIndex = String(zIndex++);
      win.style.opacity = "0";
      win.style.transform = "scale(0.9) translateY(20px)";
      win.style.transition = "opacity 0.2s ease, transform 0.2s ease";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          win.style.opacity = "1";
          win.style.transform = "";
        });
      });

      setTimeout(() => {
        win.style.transition = "";
      }, 200);

      minimizeTab?.remove();
      minimizeTab = null;
    });

    minimizeBar.appendChild(minimizeTab);
  });

  let maximized = false;
  let prev: any = {};

  maxBtn.addEventListener("click", () => {
    if (!maximized) {
      prev = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };

      if (isMobile()) {
        Object.assign(win.style, {
          left: "0px",
          top: "0px",
          width: "100%",
          height: "calc(100% - 56px)",
        });
      } else {
        Object.assign(win.style, {
          left: "56px",
          top: "0",
          width: "calc(100% - 56px)",
          height: "100%",
        });
      }

      win.style.transition = "all 0.5s ease-in-out";
      maximized = true;
    } else {
      win.style.transition = "all 0.5s ease-in-out";
      Object.assign(win.style, prev);
      maximized = false;
    }
    setTimeout(() => {
      win.style.transition = "";
    }, 500);
  });
  enableResize(win);
}


function enableResize(win: HTMLElement) {
  const handles = win.querySelectorAll(".resize-handle");

  handles.forEach((handle) => {
    const el = handle as HTMLElement;
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startLeft = 0;
    let startTop = 0;

    el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;
    });

    document.addEventListener("mousemove", (e) => {
      if (!resizing) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (el.classList.contains("resize-r")) {
        win.style.width = `${Math.max(200, startWidth + dx)}px`;
      } else if (el.classList.contains("resize-b")) {
        win.style.height = `${Math.max(150, startHeight + dy)}px`;
      } else if (el.classList.contains("resize-rb")) {
        win.style.width = `${Math.max(200, startWidth + dx)}px`;
        win.style.height = `${Math.max(150, startHeight + dy)}px`;
      } else if (el.classList.contains("resize-l")) {
        const newWidth = Math.max(200, startWidth - dx);
        if (newWidth > 200) {
          win.style.width = `${newWidth}px`;
          win.style.left = `${startLeft + dx}px`;
        }
      } else if (el.classList.contains("resize-t")) {
        const newHeight = Math.max(150, startHeight - dy);
        if (newHeight > 150) {
          win.style.height = `${newHeight}px`;
          win.style.top = `${startTop + dy}px`;
        }
      } else if (el.classList.contains("resize-rt")) {
        win.style.width = `${Math.max(200, startWidth + dx)}px`;
        const newHeight = Math.max(150, startHeight - dy);
        if (newHeight > 150) {
          win.style.height = `${newHeight}px`;
          win.style.top = `${startTop + dy}px`;
        }
      } else if (el.classList.contains("resize-lb")) {
        const newWidth = Math.max(200, startWidth - dx);
        if (newWidth > 200) {
          win.style.width = `${newWidth}px`;
          win.style.left = `${startLeft + dx}px`;
        }
        win.style.height = `${Math.max(150, startHeight + dy)}px`;
      } else if (el.classList.contains("resize-lt")) {
        const newWidth = Math.max(200, startWidth - dx);
        const newHeight = Math.max(150, startHeight - dy);
        if (newWidth > 200) {
          win.style.width = `${newWidth}px`;
          win.style.left = `${startLeft + dx}px`;
        }
        if (newHeight > 150) {
          win.style.height = `${newHeight}px`;
          win.style.top = `${startTop + dy}px`;
        }
      }
    });

    document.addEventListener("mouseup", () => {
      resizing = false;
    });
  });
}

import('flowbite').then(({ initFlowbite }) => {
  initFlowbite();
});