type AppId = "terminal";

let zIndex = 10;

const app_open_start_left = 100;
const app_open_start_top = 100;
const app_offset = 30;
let app_open_count = 0;

const windowLayer = document.getElementById("window-layer")!;

const apps: Record<AppId, () => HTMLElement> = {
  terminal: () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      ${document.getElementById("terminal-template")?.innerHTML}
    `;
    return wrapper.firstElementChild as HTMLElement;
  },
};

(window as any).openApp = (appId: AppId) => {
  const app = apps[appId];
  if (!app) return;

  const win = app();

  const leftPos = app_open_start_left + app_offset * app_open_count;
  const topPos = app_open_start_top + app_offset * app_open_count;

  win.style.left = `${leftPos}px`;
  win.style.top = `${topPos}px`;
  win.style.zIndex = String(zIndex++);

  app_open_count++;
  if (leftPos > window.innerWidth - 400 || topPos > window.innerHeight - 300) {
    app_open_count = 0;
  }

  enableWindowControls(win);
  windowLayer.appendChild(win);
};

function enableWindowControls(win: HTMLElement) {
  const titleBar = win.querySelector(".title-bar") as HTMLElement;
  const closeBtn = win.querySelector("#btn-close") as HTMLElement;
  const maxBtn = win.querySelector("#btn-maximize") as HTMLElement;

  win.addEventListener("mousedown", () => {
    win.style.zIndex = String(zIndex++);
  });

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  closeBtn.addEventListener("click", () => {
    win.remove();
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

      Object.assign(win.style, {
        left: "56px",
        top: "0",
        width: "calc(100% - 56px)",
        height: "100%",
      });

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