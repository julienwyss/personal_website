import path from 'path';
import fs from 'fs';

const WRITEUPS_DIR = path.join(process.cwd(), 'public/writeups'); 
const OUTPUT_FILE = path.join(process.cwd(), 'public/writeups.json');

const IGNORED = ['.git', '.github', 'TemplateScripts', 'README.md'];

function getFileStructure(dir: string, relativePath: string = ''): unknown[] {
  if (!fs.existsSync(dir)) return [];
  

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const structure = [];

  for (const entry of entries) {
    if (IGNORED.includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relativeEntryPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      structure.push({
        name: entry.name,
        type: 'directory',
        path: relativeEntryPath,
        children: getFileStructure(fullPath, relativeEntryPath)
      });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      structure.push({
        name: entry.name,
        type: 'file',
        path: relativeEntryPath,
        extension: ext,
        size: fs.statSync(fullPath).size
      });
    }
  }

  return structure;
}

if (!fs.existsSync(WRITEUPS_DIR)) {
    fs.mkdirSync(WRITEUPS_DIR, { recursive: true });
}

const data = getFileStructure(WRITEUPS_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
console.log("Generated writeups index.");