import fs from 'fs';
import path from 'path';

const username = "julienwyss";
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/github.json');

async function fetchGithubData() {
  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`);
    const profile = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    const repos = await reposRes.json();

    const data = { profile, repos };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log("GitHub data generated.");
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
  }
}

fetchGithubData();