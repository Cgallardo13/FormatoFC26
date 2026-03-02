import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const teamsPath = path.join(root, 'teams.json');
const outPath = path.join(root, 'venues.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normKey(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function leagueId(leagueName) {
  const n = (leagueName || '').toString().toLowerCase();
  if (n.includes('la liga') || n.includes('laliga')) return 'la_liga';
  if (n.includes('premier')) return 'premier_league';
  if (n.includes('bundesliga')) return 'bundesliga';
  if (n.includes('serie a')) return 'serie_a';
  if (n.includes('ligue 1') || n.includes('ligue1')) return 'ligue_1';
  return '';
}

// Manual overrides for clubs where Wikidata often returns training grounds or outdated venues.
// Key format: `${leagueId}:${normKey(teamName)}`
const VENUE_OVERRIDES = {
  'la_liga:fc barcelona': { stadium: 'Spotify Camp Nou', city: 'Barcelona' },
  'la_liga:athletic club': { stadium: 'San Mamés', city: 'Bilbao' },
  'la_liga:villarreal': { stadium: 'Estadio de la Cerámica', city: 'Vila-real' },
  'la_liga:sevilla fc': { stadium: 'Estadio Ramón Sánchez-Pizjuán', city: 'Sevilla' },
  'la_liga:real betis': { stadium: 'Estadio Benito Villamarín', city: 'Sevilla' },
  'la_liga:girona fc': { stadium: 'Estadi Montilivi', city: 'Girona' },
  'la_liga:ca osasuna': { stadium: 'Estadio El Sadar', city: 'Pamplona' },
  'la_liga:rayo vallecano': { stadium: 'Estadio de Vallecas', city: 'Madrid' },
  'la_liga:cadiz cf': { stadium: 'Estadio Nuevo Mirandilla', city: 'Cádiz' },
  'la_liga:levante ud': { stadium: 'Estadio Ciutat de València', city: 'Valencia' },
  'bundesliga:bayern munich': { stadium: 'Allianz Arena', city: 'Múnich' },
  'bundesliga:borussia dortmund': { stadium: 'Signal Iduna Park', city: 'Dortmund' },
  'bundesliga:freiburg': { stadium: 'Europa-Park Stadion', city: 'Freiburg im Breisgau' },
  'bundesliga:eintracht frankfurt': { stadium: 'Deutsche Bank Park', city: 'Frankfurt' },
  'bundesliga:stuttgart': { stadium: 'Mercedes-Benz Arena (Stuttgart)', city: 'Stuttgart' },
  'bundesliga:bochum': { stadium: 'Vonovia Ruhrstadion', city: 'Bochum' },
  'bundesliga:darmstadt': { stadium: 'Merck-Stadion am Böllenfalltor', city: 'Darmstadt' },
  'premier_league:manchester city': { stadium: 'Etihad Stadium', city: 'Manchester' },
  'premier_league:manchester united': { stadium: 'Old Trafford', city: 'Manchester' },
  'premier_league:arsenal': { stadium: 'Emirates Stadium', city: 'Londres' },
  'premier_league:liverpool': { stadium: 'Anfield', city: 'Liverpool' },
  'serie_a:inter milan': { stadium: 'San Siro', city: 'Milán' },
  'serie_a:ac milan': { stadium: 'San Siro', city: 'Milán' },
  'serie_a:roma': { stadium: 'Stadio Olimpico', city: 'Roma' },
  'serie_a:lazio': { stadium: 'Stadio Olimpico', city: 'Roma' },
  'serie_a:verona': { stadium: 'Stadio Marcantonio Bentegodi', city: 'Verona' },
  'serie_a:spezia': { stadium: 'Stadio Alberto Picco', city: 'La Spezia' },
  'ligue_1:psg': { stadium: 'Parc des Princes', city: 'París' }
  ,
  'ligue_1:monaco': { stadium: 'Stade Louis II', city: 'Mónaco' },
  'ligue_1:nice': { stadium: 'Allianz Riviera', city: 'Niza' },
  'ligue_1:reims': { stadium: 'Stade Auguste-Delaune', city: 'Reims' },
  'ligue_1:nantes': { stadium: 'Stade de la Beaujoire', city: 'Nantes' },
  'ligue_1:brest': { stadium: 'Stade Francis-Le Blé', city: 'Brest' },
  'ligue_1:lorient': { stadium: 'Stade du Moustoir', city: 'Lorient' }
};

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'FormatoFC26 build_venues/1.0 (local script)' },
  });
  if (res.status === 429) {
    const err = new Error(`HTTP 429 for ${url}`);
    err.code = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

async function wbSearch(query) {
  const url =
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query
    )}&language=en&format=json&origin=*`;
  return await fetchJson(url);
}

async function wbGetEntities(ids, props) {
  const url =
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
      ids.join('|')
    )}&props=${encodeURIComponent(props)}&languages=es|en&format=json&origin=*`;
  return await fetchJson(url);
}

async function withRetry(fn, { tries = 6, baseDelayMs = 1200 } = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      const code = e?.code || (String(e?.message || '').includes('HTTP 429') ? 429 : null);
      if (attempt >= tries || code !== 429) throw e;
      const wait = baseDelayMs * Math.pow(1.6, attempt - 1);
      process.stdout.write(`⏳ Rate limit (429). Waiting ${Math.round(wait)}ms...\n`);
      await sleep(wait);
    }
  }
}

function pickBestClub(searchResults) {
  const arr = searchResults?.search || [];
  if (!arr.length) return null;

  const score = (item) => {
    const d = (item.description || '').toLowerCase();
    let s = 0;
    if (d.includes('association football club')) s += 10;
    if (d.includes('football club')) s += 8;
    if (d.includes('football team')) s += 6;
    if (d.includes('sports club')) s += 4;
    if (d.includes('stadium')) s -= 5;
    if (d.includes('player')) s -= 8;
    if (d.includes('song') || d.includes('album')) s -= 10;
    return s;
  };

  return [...arr].sort((a, b) => score(b) - score(a))[0] || arr[0];
}

function pickBestStadium(searchResults) {
  const arr = searchResults?.search || [];
  if (!arr.length) return null;

  const score = (item) => {
    const d = (item.description || '').toLowerCase();
    let s = 0;
    if (d.includes('stadium')) s += 10;
    if (d.includes('football')) s += 4;
    if (d.includes('arena')) s += 4;
    if (d.includes('venue')) s += 3;
    if (d.includes('city')) s -= 2;
    if (d.includes('player')) s -= 8;
    return s;
  };

  return [...arr].sort((a, b) => score(b) - score(a))[0] || arr[0];
}

function scoreVenueLabel(label, description) {
  const l = (label || '').toLowerCase();
  const d = (description || '').toLowerCase();
  let s = 0;
  if (l.includes('stadium') || l.includes('arena') || l.includes('estadio') || l.includes('field')) s += 10;
  if (d.includes('stadium') || d.includes('arena') || d.includes('football stadium')) s += 10;
  if (l.includes('camp nou') || l.includes('bernab') || l.includes('anfield') || l.includes('old trafford')) s += 2;
  if (l.includes('ciudad deportiva') || l.includes('training') || l.includes('instalaciones') || l.includes('sports city')) s -= 12;
  if (d.includes('training ground') || d.includes('training')) s -= 12;
  return s;
}

function getFirstEntityQ(claims, prop) {
  const v = claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
  const id = v?.['numeric-id'];
  return id ? `Q${id}` : null;
}

function getCoordsFromEntity(entity) {
  const c = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  if (!c) return null;
  if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
    return { lat: c.latitude, lon: c.longitude };
  }
  return null;
}

function getLabel(entity) {
  return entity?.labels?.es?.value || entity?.labels?.en?.value || '';
}

async function resolveVenue(teamName) {
  // 1) Find club QID
  const q1 = await withRetry(() => wbSearch(`${teamName} football club`));
  const bestClub = pickBestClub(q1) || pickBestClub(await withRetry(() => wbSearch(teamName)));
  const clubQ = bestClub?.id || null;
  if (!clubQ) return { clubQ: null };

  // 2) Read claims to get stadium + city
  const clubEnt = (await withRetry(() => wbGetEntities([clubQ], 'claims')))?.entities?.[clubQ];
  const stadiumQs = (clubEnt?.claims?.P115 || [])
    .map((c) => {
      const v = c?.mainsnak?.datavalue?.value;
      const id = v?.['numeric-id'];
      return id ? `Q${id}` : null;
    })
    .filter(Boolean);
  const cityQ = getFirstEntityQ(clubEnt?.claims, 'P159'); // headquarters location

  // 3) Stadium candidate A (club P115 list)
  let finalStadiumQ = null;
  let bestScore = -999;
  if (stadiumQs.length) {
    const ent = await withRetry(() => wbGetEntities(stadiumQs, 'labels|descriptions|claims'));
    const scored = stadiumQs
      .map((qid) => {
        const e = ent?.entities?.[qid];
        const label = getLabel(e);
        const desc = e?.descriptions?.en?.value || e?.descriptions?.es?.value || '';
        return { qid, label, desc, score: scoreVenueLabel(label, desc), coords: getCoordsFromEntity(e) };
      })
      .sort((a, b) => b.score - a.score);
    finalStadiumQ = scored?.[0]?.qid || null;
    bestScore = scored?.[0]?.score ?? bestScore;
  }

  // 4) Stadium candidate B (explicit search) — often better than P115
  const qSt = pickBestStadium(await withRetry(() => wbSearch(`${teamName} stadium`)));
  const searchStadiumQ = qSt?.id || null;
  if (searchStadiumQ) {
    const ent = await withRetry(() => wbGetEntities([searchStadiumQ], 'labels|descriptions|claims'));
    const e = ent?.entities?.[searchStadiumQ];
    const label = getLabel(e);
    const desc = e?.descriptions?.en?.value || e?.descriptions?.es?.value || '';
    const s = scoreVenueLabel(label, desc);
    if (!finalStadiumQ || s > bestScore) {
      finalStadiumQ = searchStadiumQ;
      bestScore = s;
    }
  }

  // 5) Fetch labels + coords
  const want = [finalStadiumQ, cityQ].filter(Boolean);
  let stadiumLabel = '';
  let cityLabel = '';
  let coords = null;
  if (want.length) {
    const ent = await withRetry(() => wbGetEntities(want, 'labels|claims'));
    const stadiumEnt = finalStadiumQ ? ent?.entities?.[finalStadiumQ] : null;
    const cityEnt = cityQ ? ent?.entities?.[cityQ] : null;
    stadiumLabel = stadiumEnt ? getLabel(stadiumEnt) : '';
    cityLabel = cityEnt ? getLabel(cityEnt) : '';
    coords = getCoordsFromEntity(cityEnt) || getCoordsFromEntity(stadiumEnt) || null;
  }

  return {
    clubQ,
    stadium: stadiumLabel,
    city: cityLabel,
    lat: coords?.lat ?? null,
    lon: coords?.lon ?? null,
  };
}

async function run() {
  const teamsJson = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));
  const teams = teamsJson?.teams || [];
  console.log(`Teams: ${teams.length}`);

  // Resume if existing file exists
  let out = { generatedAt: new Date().toISOString(), venues: {} };
  if (fs.existsSync(outPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      if (prev?.venues) out.venues = prev.venues;
    } catch {}
  }

  for (const team of teams) {
    const lid = leagueId(team.league);
    const key = `${lid}:${normKey(team.name)}`;
    const override = VENUE_OVERRIDES[key];
    const existing = out.venues[key];

    if (override?.stadium) {
      out.venues[key] = {
        teamName: team.name,
        league: team.league,
        leagueId: lid,
        stadium: override.stadium,
        city: override.city || existing?.city || '',
        lat: existing?.lat ?? null,
        lon: existing?.lon ?? null,
        clubQ: existing?.clubQ || null,
      };
      process.stdout.write(`🛠️ Override: ${team.name} -> ${override.stadium}\n`);
      out.generatedAt = new Date().toISOString();
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
      continue;
    }

    if (existing?.stadium && existing?.city) {
      process.stdout.write(`↩️ Skip (ok): ${team.name}\n`);
      continue;
    }

    try {
      const v = await resolveVenue(team.name);
      out.venues[key] = {
        teamName: team.name,
        league: team.league,
        leagueId: lid,
        stadium: v.stadium || existing?.stadium || '',
        city: v.city || existing?.city || '',
        lat: v.lat ?? existing?.lat ?? null,
        lon: v.lon ?? existing?.lon ?? null,
        clubQ: v.clubQ || existing?.clubQ || null,
      };
      process.stdout.write(`✅ ${team.name} -> ${out.venues[key].stadium || '(no stadium)'}\n`);
    } catch (e) {
      out.venues[key] = {
        teamName: team.name,
        league: team.league,
        leagueId: lid,
        stadium: existing?.stadium || '',
        city: existing?.city || '',
        lat: existing?.lat ?? null,
        lon: existing?.lon ?? null,
        clubQ: existing?.clubQ || null,
        error: String(e?.message || e),
      };
      process.stdout.write(`⚠️ ${team.name} failed: ${e?.message || e}\n`);
    }

    // Write incremental progress
    out.generatedAt = new Date().toISOString();
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
    await sleep(700);
  }

  console.log(`Wrote ${outPath}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


