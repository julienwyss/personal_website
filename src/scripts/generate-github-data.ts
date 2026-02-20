import fs from 'fs';
import path from 'path';

const username = "julienwyss";
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/github.json');

type GithubRepo = {
  languages_url?: string;
};

function githubHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'personal-website-generator'
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function githubFetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: githubHeaders() });
  const json = (await res.json()) as any;

  if (!res.ok) {
    const msg = json?.message ? `: ${json.message}` : '';
    throw new Error(`GitHub request failed (${res.status})${msg}`);
  }

  return json as T;
}

async function aggregateLanguagesByBytes(repos: GithubRepo[]) {
  const totals: Record<string, number> = {};

  for (const repo of repos) {
    if (!repo.languages_url) continue;
    const repoLangs = await githubFetchJson<Record<string, number>>(repo.languages_url);

    for (const [lang, bytes] of Object.entries(repoLangs)) {
      totals[lang] = (totals[lang] ?? 0) + (typeof bytes === 'number' ? bytes : 0);
    }
  }

  const totalBytes = Object.values(totals).reduce((sum, v) => sum + v, 0);
  return { totals, totalBytes };
}

async function fetchGithubData() {
  try {
    const profile = await githubFetchJson<any>(`https://api.github.com/users/${username}`);
    const repos = await githubFetchJson<any[]>(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);

    const { totals: languageBytes, totalBytes: languageBytesTotal } = await aggregateLanguagesByBytes(repos);

    const data = {
      generatedAt: new Date().toISOString(),
      profile,
      repos,
      languageBytes,
      languageBytesTotal
    };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log("GitHub data generated.");
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
  }
}

fetchGithubData();