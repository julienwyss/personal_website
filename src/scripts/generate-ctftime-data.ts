import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'src/data/ctftime.json');

const PROFILE = {
  handle: 'R3d_4lch3m1st',
  real_name: 'Julien Wyss',
  profile_url: 'https://ctftime.org/user/225872',
  member_since: 'Mai 2025',
};

const TEAMS: { id: number; name: string }[] = [
  { id: 383106, name: 'Fondue Overflow' },
  { id: 382455, name: 'FRHACK' },
];

const YEARS_TO_FETCH = [2024, 2025];

function ctftimeHeaders(): Record<string, string> {
  return {
    'Accept': 'application/json',
    'User-Agent': 'personal-website-portfolio-generator',
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: ctftimeHeaders() });
  if (!res.ok) {
    throw new Error(`CTFtime request failed (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}

async function fetchTeam(teamId: number) {
  console.log(`  Fetching team ${teamId}...`);
  try {
    return await fetchJson<any>(`https://ctftime.org/api/v1/teams/${teamId}/`);
  } catch (e) {
    console.warn(`  Warning: Could not fetch team ${teamId}: ${e}`);
    return null;
  }
}

async function fetchResultsForYear(year: number): Promise<any[]> {
  console.log(`  Fetching results for ${year}...`);
  try {
    const data = await fetchJson<any>(`https://ctftime.org/api/v1/results/${year}/`);
    return Object.entries(data).map(([eventId, result]: [string, any]) => ({
      event_id: parseInt(eventId),
      ...result,
    }));
  } catch (e) {
    console.warn(`  Warning: Could not fetch results for ${year}: ${e}`);
    return [];
  }
}

async function fetchEventDetails(eventId: number) {
  try {
    return await fetchJson<any>(`https://ctftime.org/api/v1/events/${eventId}/`);
  } catch (e) {
    console.warn(`  Warning: Could not fetch event ${eventId}: ${e}`);
    return null;
  }
}

async function main() {
  console.log('Generating CTFtime data...');

  const teamData: Record<number, any> = {};
  for (const team of TEAMS) {
    const data = await fetchTeam(team.id);
    if (data) teamData[team.id] = data;
  }

  const teamIds = new Set(TEAMS.map(t => t.id));
  const participatedEvents: {
    event_id: number;
    team_id: number;
    team_name: string;
    place: number;
    points: number;
  }[] = [];
  const seenEventIds = new Set<number>();

  for (const year of YEARS_TO_FETCH) {
    const results = await fetchResultsForYear(year);

    for (const result of results) {
      if (!Array.isArray(result.scores)) continue;

      for (const score of result.scores) {
        const tid: number = score.team?.id ?? score.team_id;
        if (teamIds.has(tid) && !seenEventIds.has(result.event_id)) {
          seenEventIds.add(result.event_id);
          participatedEvents.push({
            event_id: result.event_id,
            team_id: tid,
            team_name: score.team?.name ?? TEAMS.find(t => t.id === tid)?.name ?? String(tid),
            place: score.place ?? null,
            points: score.points ?? null,
          });
        }
      }
    }
  }

  console.log(`  Found ${participatedEvents.length} participated events.`);

  const events: any[] = [];
  for (const entry of participatedEvents) {
    console.log(`  Fetching event details for event ${entry.event_id}...`);
    const details = await fetchEventDetails(entry.event_id);
    if (details) {
      events.push({
        id: entry.event_id,
        name: details.title ?? details.name ?? `Event ${entry.event_id}`,
        url: `https://ctftime.org/event/${entry.event_id}`,
        ctf_url: details.url ?? null,
        format: details.format ?? null,
        location: details.location ?? null,
        start: details.start ?? null,
        finish: details.finish ?? null,
        weight: details.weight ?? null,
        team_id: entry.team_id,
        team_name: entry.team_name,
        place: entry.place,
        points: entry.points,
      });
    } else {
      events.push({
        id: entry.event_id,
        name: `Event ${entry.event_id}`,
        url: `https://ctftime.org/event/${entry.event_id}`,
        team_id: entry.team_id,
        team_name: entry.team_name,
        place: entry.place,
        points: entry.points,
      });
    }
    await new Promise(r => setTimeout(r, 250));
  }

  events.sort((a, b) => {
    if (a.start && b.start) return new Date(b.start).getTime() - new Date(a.start).getTime();
    return 0;
  });

  const teams = TEAMS.map(t => {
    const data = teamData[t.id];
    return {
      id: t.id,
      name: data?.name ?? t.name,
      url: `https://ctftime.org/team/${t.id}`,
      country: data?.country ?? null,
      website: data?.academic === false ? (data?.website ?? null) : (data?.website ?? null),
      rating: data?.rating ?? {},
      aliases: data?.aliases ?? [],
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    ...PROFILE,
    teams,
    events,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`CTFtime data written to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Failed to generate CTFtime data:', err);
  process.exit(1);
});
