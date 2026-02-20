# 🖥️ Julien's OS-Style Portfolio

Welcome to my interactive, linux desktop themed personal portfolio! This project is designed to look and feel like a modern operating system right in your browser.

**Access the Website:** [julien-wyss.ch](https://julien-wyss.ch/) 

## Features

This portfolio isn't just a static page; it's a fully functional web-based desktop environment:

* **Custom Window Manager:** Draggable, resizable, and minimizable application windows tailored for both desktop and mobile views.
* **Animated Terminal:** A simulated command-line interface featuring animated typing effects, skill progress bars, and tabbed navigation.
* **CTF Writeup Explorer & Viewer:** A custom-built file explorer that reads dynamically from my Github Repository for CTF WriteUp's and dsiplays them. It renders Markdown files seamlessly using `marked` and includes syntax highlighting.
* **Image Viewer:** An integrated image viewer with zoom and pan capabilities for challenge screenshots.
* **CLI Contact Form:** A interactive, terminal-looking contact form wizard powered by Web3Forms.
* **GitHub & LinkedIn Integrations:** Live fetching of GitHub repositories and language statistics, plus an integrated LinkedIn badge.

## Tech Stack

* **Framework:** [Astro](https://astro.build/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Flowbite](https://flowbite.com/)
* **Language:** TypeScript / HTML / CSS
* **Markdown Parsing:** `marked`, `DOMPurify`, and `highlight.js`
* **Form Handling:** Web3Forms API