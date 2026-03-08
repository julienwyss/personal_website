import fs from 'fs';
import path from 'path';

const ACCOUNTS = ["julienwyss", "the-redalchemist"];
const COLLAB_REPOS = [
  { owner: "mocatex", repo: "vault-guard" },
];
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/github.json');

type GithubRepo = {
  name: string;
  html_url: string;
  description?: string | null;
  language?: string | null;
  stargazers_count: number;
  updated_at?: string;
  languages_url?: string;
  owner?: { login: string };
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
    const accountData: Array<{ username: string; profile: any; repos: any[] }> = [];

    for (const username of ACCOUNTS) {
      console.log(`Fetching data for ${username}...`);
      const profile = await githubFetchJson<any>(`https://api.github.com/users/${username}`);
      const repos = await githubFetchJson<any[]>(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      accountData.push({ username, profile, repos });
    }

    const reposByName = new Map<string, GithubRepo & { account: string }>();
    for (const { username, repos } of accountData) {
      for (const repo of repos) {
        const key = repo.name.toLowerCase();
        if (!reposByName.has(key)) {
          reposByName.set(key, { ...repo, account: username });
        } else {
          const existing = reposByName.get(key)!;
          if (!(existing as any).accounts) {
            (existing as any).accounts = [(existing as any).account, username];
          } else if (!(existing as any).accounts.includes(username)) {
            (existing as any).accounts.push(username);
          }
        }
      }
    }

    const mergedRepos = Array.from(reposByName.values())
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });

    const { totals: languageBytes, totalBytes: languageBytesTotal } = await aggregateLanguagesByBytes(mergedRepos);

    const collabRepos: any[] = [];
    for (const { owner, repo } of COLLAB_REPOS) {
      try {
        const repoData = await githubFetchJson<any>(`https://api.github.com/repos/${owner}/${repo}`);
        collabRepos.push({ ...repoData, type: 'collab' });
        console.log(`Fetched collab repo: ${owner}/${repo}`);
      } catch (e) {
        console.warn(`Could not fetch collab repo ${owner}/${repo}:`, e);
      }
    }

    const primaryProfile = accountData[0].profile;
    const accounts = accountData.map(({ username, profile }) => ({
      login: profile.login,
      html_url: profile.html_url,
      created_at: profile.created_at,
      public_repos: profile.public_repos,
      followers: profile.followers,
    }));

    const data = {
      generatedAt: new Date().toISOString(),
      profile: primaryProfile,
      accounts,
      repos: mergedRepos,
      collabRepos,
      languageBytes,
      languageBytesTotal
    };

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`GitHub data generated. ${mergedRepos.length} repos merged from ${ACCOUNTS.length} accounts.`);
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
  }
}

fetchGithubData();