export async function initExplorer(container: HTMLElement, initialPath?: string) {
    const grid = container.querySelector('#file-grid') as HTMLElement;
    const addressBar = container.querySelector('#address-bar') as HTMLElement;
    const btnUp = container.querySelector('#btn-up') as HTMLButtonElement;

    let fileSystem: any[] = [];
    let currentPathStack: any[] = [];

    try {
        const res = await fetch(`${import.meta.env.BASE_URL}writeups.json`);
        if (!res.ok) throw new Error("Index not found");
        fileSystem = await res.json();
        if (initialPath) {
            navigateToPath(initialPath);
        } else {
            renderCurrentView();
        }
    } catch (e) {
        grid.innerHTML = '<div class="text-red-500 text-sm p-4 col-span-full text-center">Failed to load writeups.json.</div>';
    }

    function navigateToPath(pathStr: string) {
        const parts = pathStr.split('/').filter(Boolean);
        currentPathStack = [];
        let current = fileSystem;
        for (const part of parts) {
            const folder = current.find((item: any) => item.type === 'directory' && item.name === part);
            if (!folder) break;
            currentPathStack.push(folder);
            current = folder.children || [];
        }
        renderCurrentView();
    }

    function renderCurrentView() {
        grid.innerHTML = '';

        let itemsToShow = fileSystem;
        if (currentPathStack.length > 0) {
            const currentFolder = currentPathStack[currentPathStack.length - 1];
            itemsToShow = currentFolder.children || [];
        }

        const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
        const isImage = (name: string) => IMAGE_EXTS.some(ext => name.toLowerCase().endsWith(ext));

        const filteredItems = itemsToShow
            .filter((item: any) => item.type === 'directory' || item.name.endsWith('.md') || isImage(item.name))
            .sort((a: any, b: any) => {
                const rank = (item: any) => {
                    if (item.type === 'directory') return 0;
                    if (item.name.toLowerCase() === 'readme.md') return 1;
                    if (item.name.endsWith('.md')) return 2;
                    return 3;
                };
                return rank(a) - rank(b);
            });

        if (filteredItems.length === 0) {
            grid.innerHTML = '<div class="text-zinc-600 text-xs col-span-full text-center mt-4">This folder is empty.</div>';
        }

        filteredItems.forEach((item: any) => {
            const el = document.createElement('div');
            el.className = "flex flex-col items-center gap-2 p-2 hover:bg-zinc-800 rounded cursor-pointer group text-center transition-colors";

            const iconDiv = document.createElement('div');
            if (item.type === 'directory') {
                iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#facc15" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400 fill-yellow-500/20"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`;
            } else if (isImage(item.name)) {
                iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_6px_#c084fc] transition-colors"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
            } else {
                const isReadme = item.name.toLowerCase() === 'readme.md';
                iconDiv.innerHTML = isReadme
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-green-400 group-hover:text-green-300 transition-colors drop-shadow-[0_0_6px_#4ade80]"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_6px_#22d3ee] transition-colors"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`;
            }

            const label = document.createElement('span');
            label.className = "text-xs break-words w-full line-clamp-2 leading-tight group-hover:text-white";
            label.textContent = item.name.replace('.md', '');

            el.append(iconDiv, label);

            el.onclick = () => {
                if (item.type === 'directory') {
                    currentPathStack.push(item);
                    renderCurrentView();
                } else if (isImage(item.name)) {
                    (window as any).openApp('image-viewer', item.path);
                } else {
                    (window as any).openApp('writeup-viewer', item.path);
                }
            };

            grid.appendChild(el);
        });

        updateToolbar();
    }

    function updateToolbar() {
        const pathNames = currentPathStack.map((p: any) => p.name).join('/');
        addressBar.textContent = pathNames ? `/${pathNames}` : '/';
        btnUp.disabled = currentPathStack.length === 0;
    }

    btnUp.onclick = () => {
        if (currentPathStack.length === 0) return;
        currentPathStack.pop();
        renderCurrentView();
    };
}


import { marked } from 'marked';
import hljs from 'highlight.js';

export async function initWriteupViewer(container: HTMLElement, filePath: string) {
    const contentDiv = container.querySelector('#viewer-content') as HTMLElement;
    const titleSpan = container.querySelector('#viewer-title') as HTMLElement;

    if (!filePath) {
        contentDiv.innerHTML = '<div class="text-red-400 p-4">Error: No file specified.</div>';
        return;
    }

    const cleanPath = filePath.replace(/\\/g, '/');
    const fileName = cleanPath.split('/').pop();
    titleSpan.textContent = fileName || 'Unknown File';

    try {
        const fileUrl = `${import.meta.env.BASE_URL}writeups/${cleanPath}`;
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`File not found: ${fileUrl}`);

        const markdown = await res.text();

        const cleanMarkdown = markdown.replace(/^---[\s\S]*?---/, '');

        const renderer = new marked.Renderer();
        const folderPath = cleanPath.substring(0, cleanPath.lastIndexOf('/'));

        renderer.image = ({ href, title, text }) => {
            if (href.startsWith('http') || href.startsWith('//')) {
                return `<img src="${href}" alt="${text}" title="${title || ''}" class="cursor-zoom-in rounded shadow-lg my-4 max-w-full" onclick="window.openApp('image-viewer', '${href}')">`;
            }
            const relPath = `${folderPath}/${href}`;
            const fullImgPath = `${import.meta.env.BASE_URL}writeups/${relPath}`;
            return `<img src="${fullImgPath}" alt="${text}" title="${title || ''}" class="cursor-zoom-in rounded shadow-lg my-4 max-w-full" onclick="window.openApp('image-viewer', '${relPath}')">`;
        };

        renderer.link = ({ href, title, text }) => {
            if (!href) return `<a>${text}</a>`;
            if (!href.startsWith('http') && !href.startsWith('//')) {
                const cleanHref = href.replace(/\/$/, '');
                if (cleanHref.endsWith('.md')) {
                    const targetPath = folderPath ? `${folderPath}/${cleanHref}` : cleanHref;
                    return `<a href="#" title="${title || ''}" onclick="event.preventDefault(); window.openApp('writeup-viewer', '${targetPath}')" class="text-cyan-400 hover:underline">${text}</a>`;
                }
                const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleanHref);
                if (!hasExtension) {
                    const targetFolder = folderPath ? `${folderPath}/${cleanHref}` : cleanHref;
                    return `<a href="#" title="${title || ''}" onclick="event.preventDefault(); window.openApp('explorer', '${targetFolder}')" class="text-yellow-400 hover:underline">${text}</a>`;
                }
            }
            return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">${text}</a>`;
        };

        const html = await marked.parse(cleanMarkdown, { renderer });
        contentDiv.innerHTML = html;

        contentDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });

    } catch (e: any) {
        console.error(e);
        contentDiv.innerHTML = `
        <div style="color: #ff7b72; padding: 20px;">
            <h3>Error loading writeup</h3>
            <p>${e.message}</p>
        </div>`;
    }
}