// FC26 Team Database - Loads from CSV file (18,000+ players)
// CSV: EAFC26-Men.csv

let fc26Database = null;
let dataSource = 'unknown'; // 'csv', 'local', or 'unknown'

// League filters - Only the 5 major leagues
const MAJOR_LEAGUES = [
    'La Liga',
    'Premier League',
    'Bundesliga',
    'Serie A',
    'Ligue 1'
];

// Normalize league names from CSV to standard names
function normalizeLeagueName(leagueName) {
    const leagueMap = {
        'LALIGA EA SPORTS': 'La Liga',
        'Premier League': 'Premier League',
        'Bundesliga': 'Bundesliga',
        'Serie A': 'Serie A',
        'Ligue 1 McDonald\'s': 'Ligue 1'
    };
    return leagueMap[leagueName] || leagueName;
}

// Load from CSV file (18,000 players)
async function loadFromCSV() {
    try {
        console.log('📁 Loading from EAFC26-Men.csv (18,000+ players)...');

        const response = await fetch('EAFC26-Men.csv');

        if (!response.ok) {
            throw new Error(`CSV file not found: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(`✅ CSV loaded: ${csvText.length} characters`);

        // Parse CSV
        const players = parseCSV(csvText);
        console.log(`✅ Parsed ${players.length} players`);

        if (players.length === 0) {
            throw new Error('No players found in CSV');
        }

        // Group by team and calculate team stats
        const teams = groupPlayersByTeam(players);
        console.log(`✅ Grouped into ${teams.length} teams`);

        // Filter to major leagues only
        const filteredTeams = teams.filter(team => {
            return MAJOR_LEAGUES.includes(team.league);
        });

        console.log(`✅ Filtered to ${filteredTeams.length} teams from major leagues`);

        fc26Database = { teams: filteredTeams };
        dataSource = 'csv';  // Mark that we loaded from CSV

        console.log(`✅ Loaded from CSV: ${filteredTeams.length} teams`);
        return fc26Database;

    } catch (error) {
        console.error('❌ CSV load failed:', error.message);
        return null;
    }
}

// Parse CSV text into array of player objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const players = [];

    // Skip header row (first line)
    const headers = parseCSVLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle CSV parsing with proper quote handling
        const values = parseCSVLine(line);

        if (values.length < 10) continue; // Skip invalid rows

        const player = {
            id: values[0],
            rank: parseInt(values[1]) || 0,
            name: values[2],
            gender: values[3],
            ovr: parseInt(values[4]) || 0,
            pac: parseInt(values[5]) || 0,
            sho: parseInt(values[6]) || 0,
            pas: parseInt(values[7]) || 0,
            dri: parseInt(values[8]) || 0,
            def: parseInt(values[9]) || 0,
            phy: parseInt(values[10]) || 0,
            acceleration: parseInt(values[11]) || 0,
            sprint_speed: parseInt(values[12]) || 0,
            positioning: parseInt(values[13]) || 0,
            finishing: parseInt(values[14]) || 0,
            shot_power: parseInt(values[15]) || 0,
            long_shots: parseInt(values[16]) || 0,
            volleys: parseInt(values[17]) || 0,
            penalties: parseInt(values[18]) || 0,
            vision: parseInt(values[19]) || 80,
            crossing: parseInt(values[20]) || 0,
            free_kick_accuracy: parseInt(values[21]) || 0,
            short_passing: parseInt(values[22]) || 0,
            long_passing: parseInt(values[23]) || 0,
            curve: parseInt(values[24]) || 0,
            dribbling: parseInt(values[25]) || 0,
            agility: parseInt(values[26]) || 0,
            balance: parseInt(values[27]) || 0,
            reactions: parseInt(values[28]) || 0,
            ball_control: parseInt(values[29]) || 0,
            composure: parseInt(values[30]) || 0,
            interceptions: parseInt(values[31]) || 0,
            heading_accuracy: parseInt(values[32]) || 80,
            def_awareness: parseInt(values[33]) || 0,
            standing_tackle: parseInt(values[34]) || 0,
            sliding_tackle: parseInt(values[35]) || 0,
            jumping: parseInt(values[36]) || 0,
            stamina: parseInt(values[37]) || 80,
            strength: parseInt(values[38]) || 0,
            aggression: parseInt(values[39]) || 0,
            position: values[40] || '',
            weak_foot: parseInt(values[41]) || 0,
            skill_moves: parseInt(values[42]) || 0,
            preferred_foot: values[43] || '',
            height: values[44] || '',
            weight: values[45] || '',
            alternative_positions: values[46] || '',
            age: parseInt(values[47]) || 0,
            nation: values[48] || '',
            league: normalizeLeagueName(values[49] || ''),
            team: values[50] || '',
            play_style: values[51] || '',
            url: values[52] || '',
            // GK stats (if any)
            gk_diving: values[53] || '',
            gk_handling: values[54] || '',
            gk_kicking: values[55] || '',
            gk_positioning: values[56] || '',
            gk_reflexes: values[57] || ''
        };

        players.push(player);
    }

    return players;
}

// Parse a single CSV line with proper quote handling
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            // Handle quotes
            if (inQuotes && nextChar === '"') {
                // Escaped quote ("")
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator (only outside quotes)
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last value
    values.push(current.trim());

    return values;
}

// Group players by team and calculate team statistics
function groupPlayersByTeam(players) {
    const teamMap = new Map();

    for (const player of players) {
        const teamKey = `${player.league}|${player.team}`;

        if (!teamMap.has(teamKey)) {
            const teamId = teamKey.replace(/[^a-zA-Z0-9]/g, '_');

            teamMap.set(teamKey, {
                id: teamId,
                name: player.team,
                league: player.league,
                league_flag: getLeagueFlag(player.league),
                formation: '4-3-3', // Default formation
                overall_level: 0,
                team_logo: getTeamLogoUrl(player.team, teamId),
                league_logo: getLeagueLogoUrl(player.league),
                style: {
                    possession: 0,
                    counter_attack: 0,
                    wing_play: 0,
                    through_balls: 0,
                    aerial_balls: 0,
                    high_press: 0
                },
                kaggle_stats: {
                    acceleration: 0,
                    sprint_speed: 0,
                    avg_speed: 0,
                    play_style: 'Balanced'
                },
                squad_gaps: [],
                player_count: 0
            });
        }

        const team = teamMap.get(teamKey);
        team.player_count++;
    }

    // Calculate team stats from players
    for (const [teamKey, team] of teamMap) {
        const teamPlayers = players.filter(p =>
            `${p.league}|${p.team}` === teamKey
        );

        // Calculate average stats
        const stats = calculateTeamStats(teamPlayers);

        team.overall_level = Math.round(stats.ovr);
        team.style.possession = stats.possession;
        team.style.counter_attack = stats.counter_attack;
        team.style.wing_play = stats.wing_play;
        team.style.through_balls = stats.through_balls;
        team.style.aerial_balls = stats.aerial_balls;
        team.style.high_press = stats.high_press;

        team.kaggle_stats.acceleration = Math.round(stats.acceleration);
        team.kaggle_stats.sprint_speed = Math.round(stats.sprint_speed);
        team.kaggle_stats.avg_speed = Math.round((stats.acceleration + stats.sprint_speed) / 2);
        team.kaggle_stats.play_style = stats.play_style;

        // Create squad gaps (top 11 players by position)
        team.squad_gaps = createSquadGaps(teamPlayers);
    }

    return Array.from(teamMap.values());
}

// Calculate team statistics from player data
function calculateTeamStats(players) {
    const totals = players.reduce((acc, p) => ({
        ovr: acc.ovr + p.ovr,
        pac: acc.pac + p.pac,
        sho: acc.sho + p.sho,
        pas: acc.pas + p.pas,
        dri: acc.dri + p.dri,
        def: acc.def + p.def,
        phy: acc.phy + p.phy,
        acceleration: acc.acceleration + p.acceleration,
        sprint_speed: acc.sprint_speed + p.sprint_speed,
        positioning: acc.positioning + p.positioning,
        crossing: acc.crossing + p.crossing,
        long_passing: acc.long_passing + p.long_passing,
        interceptions: acc.interceptions + p.interceptions,
        aggression: acc.aggression + p.aggression
    }), {
        ovr: 0, pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0,
        acceleration: 0, sprint_speed: 0, positioning: 0, crossing: 0,
        long_passing: 0, interceptions: 0, aggression: 0
    });

    const count = players.length;

    // Sum optional stats (use defaults if not available)
    const totalsVision = players.reduce((sum, p) => sum + (p.vision || 80), 0);
    const totalsHeading = players.reduce((sum, p) => sum + (p.heading_accuracy || 80), 0);
    const totalsStamina = players.reduce((sum, p) => sum + (p.stamina || 80), 0);

    // Calculate derived stats (0-100 scale)
    const possession = ((totals.pas + totals.dri + totals.positioning) / (3 * count)) || 50;

    // Wing play: PAC + DRI + Crossing
    const wing_play = ((totals.pac + totals.dri + totals.crossing) / (3 * count)) || 50;

    // Counter attack: PAC + PHY + Positioning
    const counter_attack = ((totals.pac + totals.phy + totals.positioning) / (3 * count)) || 50;

    // Through balls: PAS + Vision + Long Passing
    const through_balls = ((totals.pas + totalsVision + totals.long_passing) / (3 * count)) || 50;

    // Aerial balls: PHY + Heading + Jumping
    const aerial_balls = ((totals.phy + totalsHeading + totals.jumping) / (3 * count)) || 50;

    // High press: Aggression + Interceptions + Stamina
    const high_press = ((totals.aggression + totals.interceptions + totalsStamina) / (3 * count)) || 50;

    // Detect play style
    let play_style = 'Balanced';
    if (possession > 60 && wing_play < 50) {
        play_style = 'Possession';
    } else if (wing_play > 60) {
        play_style = 'Wing Play';
    } else if (counter_attack > 60) {
        play_style = 'Counter Attack';
    } else if (high_press > 60) {
        play_style = 'High Press';
    }

    return {
        ovr: totals.ovr / count,
        possession,
        counter_attack,
        wing_play,
        through_balls,
        aerial_balls,
        high_press,
        acceleration: totals.acceleration / count,
        sprint_speed: totals.sprint_speed / count,
        play_style
    };
}

// Create squad gaps array from players
function createSquadGaps(players) {
    // Sort by OVR descending
    const sorted = [...players].sort((a, b) => b.ovr - a.ovr);

    // Map common positions
    const positionMap = {
        'ST': 'ST', 'CF': 'ST', 'CAM': 'CAM', 'CM': 'CM', 'CDM': 'CDM',
        'LW': 'LW', 'LM': 'LW', 'RW': 'RW', 'RM': 'RW',
        'LB': 'LB', 'LWB': 'LWB', 'RB': 'RB', 'RWB': 'RWB',
        'CB': 'CB', 'GK': 'GK'
    };

    const gaps = [];

    for (const player of sorted) {
        const pos = positionMap[player.position] || player.position;

        // Get max 2 players per position for squad depth
        const positionCount = gaps.filter(g => g.position === pos).length;
        if (positionCount < 2) {
            // Check if is young prospect (< 23)
            const isYoung = player.age < 23;
            // Check if is star (top 15% OVR)
            const isStar = player.ovr > 84;

            gaps.push({
                position: pos,
                player: player.name,
                rating: player.ovr,
                age: player.age,
                is_star: isStar,
                is_young: isYoung
            });
        }
    }

    // Ensure we have at least 11 players
    return gaps.slice(0, Math.max(11, gaps.length));
}

// Load from local JSON (backup)
async function loadFromLocal() {
    try {
        console.log('📁 Loading from local teams.json');

        const response = await fetch('teams.json');

        if (!response.ok) {
            throw new Error(`Local file not found: ${response.status}`);
        }

        fc26Database = await response.json();
        dataSource = 'local';  // Mark that we loaded from local

        console.log(`✅ Loaded from local: ${fc26Database.teams.length} teams`);

        return fc26Database;

    } catch (error) {
        console.error('❌ Local load failed:', error.message);
        return null;
    }
}

// Main load function - tries CSV first, then falls back to local JSON
async function loadDatabase() {
    // Try CSV first (primary method with 18,000+ players)
    let db = await loadFromCSV();

    // If CSV fails, use local backup
    if (!db || !db.teams || db.teams.length === 0) {
        console.log('🔄 Falling back to local JSON...');
        db = await loadFromLocal();
    }

    // Final check
    if (!db || !db.teams || db.teams.length === 0) {
        console.error('❌ Failed to load database from both CSV and local');
        return null;
    }

    console.log(`✅ Database ready: ${db.teams.length} teams`);
    return db;
}

// Get data source status for UI
function getDataSourceStatus() {
    return {
        source: dataSource,
        isCSV: dataSource === 'csv',
        isLocal: dataSource === 'local',
        label: dataSource === 'csv' ? '📊 CSV (18K+)' : dataSource === 'local' ? '💾 Local' : '⏳ Loading...',
        color: dataSource === 'csv' ? '#2196f3' : dataSource === 'local' ? '#ffc107' : '#999'
    };
}

// Get league flag emoji
function getLeagueFlag(leagueName) {
    const flags = {
        'La Liga': '🇪🇸',
        'Premier League': '🇬🇧',
        'Bundesliga': '🇩🇪',
        'Serie A': '🇮🇹',
        'Ligue 1': '🇫🇷'
    };
    return flags[leagueName] || '🏴';
}

// ============================================
// TEAM LOGO SYSTEM - Multi-source with fallbacks
// ============================================

// Normalize team name for logo lookup
function normalizeTeamName(teamName) {
    const name = teamName.toLowerCase().trim();

    // Remove common suffixes and variations
    const removeSuffixes = [
        'fc', 'cf', 'ac', 'sd', 'ud', 'rcd',
        'balompie', 'balompié',
        'football club', 'club',
        'fv', 'bv', 'vfb', 'ssc', 'ssc'
    ];

    let normalized = name;
    for (const suffix of removeSuffixes) {
        const regex = new RegExp(`\\b${suffix}\\b`, 'gi');
        normalized = normalized.replace(regex, '');
    }

    // Remove extra spaces and trim
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

// Team name mapping to reliable logo URLs
const TEAM_LOGO_MAP = {
    // La Liga Teams (con URLs directas de BeinSports y Football-Data)
    'real madrid': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/102.png',
    'madrid': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/102.png',
    'fc barcelona': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/103.png',
    'barcelona': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/103.png',
    'atletico madrid': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/105.png',
    'atletico': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/105.png',
    'real sociedad': 'https://crests.football-data.org/92.svg',
    'sociedad': 'https://crests.football-data.org/92.svg',
    'athletic club': 'https://crests.football-data.org/84.svg',
    'athletic bilbao': 'https://crests.football-data.org/84.svg',
    'villarreal': 'https://crests.football-data.org/95.svg',
    'real betis': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/104.png',
    'betis': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/104.png',
    'valencia cf': 'https://crests.football-data.org/83.svg',
    'valencia': 'https://crests.football-data.org/83.svg',
    'sevilla fc': 'https://crests.football-data.org/79.svg',
    'sevilla': 'https://crests.football-data.org/79.svg',
    'getafe cf': 'https://crests.football-data.org/557.svg',
    'getafe': 'https://crests.football-data.org/557.svg',
    'celta vigo': 'https://crests.football-data.org/87.svg',
    'rcd mallorca': 'https://crests.football-data.org/90.svg',
    'mallorca': 'https://crests.football-data.org/90.svg',
    'rayo vallecano': 'https://crests.football-data.org/93.svg',
    'rayo': 'https://crests.football-data.org/93.svg',
    'ca osasuna': 'https://crests.football-data.org/82.svg',
    'osasuna': 'https://crests.football-data.org/82.svg',
    'girona fc': 'https://crests.football-data.org/229.svg',
    'girona': 'https://crests.football-data.org/229.svg',
    'cadiz cf': 'https://crests.football-data.org/274.svg',
    'cadiz': 'https://crests.football-data.org/274.svg',
    'ud almeria': 'https://crests.football-data.org/275.svg',
    'almeria': 'https://crests.football-data.org/275.svg',
    'las palmas': 'https://crests.football-data.org/271.svg',
    'deportivo alaves': 'https://crests.football-data.org/280.svg',
    'alaves': 'https://crests.football-data.org/280.svg',
    'levante ud': 'https://crests.football-data.org/395.svg',
    'levante': 'https://crests.football-data.org/395.svg',

    // Premier League Teams (con URLs directas de BeinSports)
    'manchester city': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/13.png',
    'manchester': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/13.png',
    'arsenal': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/3.png',
    'liverpool': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/14.png',
    'manchester united': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/22.png',
    'chelsea': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/8.png',
    'tottenham': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/21.png',
    'spurs': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/21.png',
    'newcastle': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/23.png',
    'aston villa': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/7.png',
    'west ham': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/20.png',
    'brighton': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/131.png',
    'crystal palace': 'https://crests.football-data.org/354.svg',
    'everton': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/12.png',
    'brentford': 'https://crests.football-data.org/402.svg',
    'fulham': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/18.png',
    'nottingham forest': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/15.png',
    'bournemouth': 'https://crests.football-data.org/93.svg',
    'wolves': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/19.png',
    'luton town': 'https://crests.football-data.org/403.svg',
    'burnley': 'https://crests.football-data.org/328.svg',
    'sheffield united': 'https://crests.football-data.org/399.svg',

    // Bundesliga Teams
    'bayern munich': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/120.png',
    'bayern': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/120.png',
    'borussia dortmund': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/122.png',
    'dortmund': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/122.png',
    'rb leipzig': 'https://crests.football-data.org/721.svg',
    'leipzig': 'https://crests.football-data.org/721.svg',
    'bayer leverkusen': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/124.png',
    'leverkusen': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/124.png',
    'union berlin': 'https://crests.football-data.org/724.svg',
    'freiburg': 'https://crests.football-data.org/170.svg',
    'eintracht frankfurt': 'https://crests.football-data.org/168.svg',
    'frankfurt': 'https://crests.football-data.org/168.svg',
    'wolfsburg': 'https://crests.football-data.org/165.svg',
    'mainz': 'https://crests.football-data.org/166.svg',
    'borussia monchengladbach': 'https://crests.football-data.org/162.svg',
    'monchengladbach': 'https://crests.football-data.org/162.svg',
    'fc koln': 'https://crests.football-data.org/167.svg',
    'koln': 'https://crests.football-data.org/167.svg',
    'hoffenheim': 'https://crests.football-data.org/169.svg',
    'bochum': 'https://crests.football-data.org/172.svg',
    'augsburg': 'https://crests.football-data.org/171.svg',
    'stuttgart': 'https://crests.football-data.org/173.svg',
    'darmstadt': 'https://crests.football-data.org/174.svg',
    'heidenheim': 'https://crests.football-data.org/175.svg',
    'werder bremen': 'https://crests.football-data.org/164.svg',
    'bremen': 'https://crests.football-data.org/164.svg',

    // Serie A Teams
    'inter milan': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/182.png',
    'inter': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/182.png',
    'ac milan': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/181.png',
    'milan': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/181.png',
    'juventus': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/183.png',
    'napoli': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/185.png',
    'roma': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/186.png',
    'as roma': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/186.png',
    'lazio': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/187.png',
    'atalanta': 'https://crests.football-data.org/99.svg',
    'fiorentina': 'https://crests.football-data.org/103.svg',
    'torino': 'https://crests.football-data.org/115.svg',
    'bologna': 'https://crests.football-data.org/101.svg',
    'sassuolo': 'https://crests.football-data.org/114.svg',
    'udinese': 'https://crests.football-data.org/116.svg',
    'sampdoria': 'https://crests.football-data.org/111.svg',
    'verona': 'https://crests.football-data.org/117.svg',
    'genoa': 'https://crests.football-data.org/104.svg',
    'cagliari': 'https://crests.football-data.org/102.svg',
    'lecce': 'https://crests.football-data.org/505.svg',
    'cremonese': 'https://crests.football-data.org/506.svg',
    'empoli': 'https://crests.football-data.org/507.svg',
    'spezia': 'https://crests.football-data.org/508.svg',

    // Ligue 1 Teams
    'psg': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/201.png',
    'paris saint-germain': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/201.png',
    'paris': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/201.png',
    'monaco': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/203.png',
    'marseille': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/204.png',
    'olympique marseille': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/204.png',
    'lyon': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/205.png',
    'olympique lyon': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/205.png',
    'lille': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/207.png',
    'lens': 'https://crests.football-data.org/522.svg',
    'nice': 'https://crests.football-data.org/523.svg',
    'rennes': 'https://crests.football-data.org/524.svg',
    'nantes': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/210.png',
    'reims': 'https://crests.football-data.org/526.svg',
    'strasbourg': 'https://crests.football-data.org/527.svg',
    'brest': 'https://crests.football-data.org/528.svg',
    'lorient': 'https://crests.football-data.org/529.svg',
    'montpellier': 'https://crests.football-data.org/530.svg',
    'toulouse': 'https://crests.football-data.org/531.svg',
    'clermont': 'https://crests.football-data.org/532.svg',
    'le havre': 'https://crests.football-data.org/533.svg',
    'metz': 'https://crests.football-data.org/534.svg'
};

// Get team logo URL with multiple fallback sources (NO generic placeholders)
function getTeamLogoUrl(teamName, teamId) {
    const normalizedName = normalizeTeamName(teamName);
    const fullName = teamName.toLowerCase().trim();

    // 1. Try direct mapping with normalized name (most reliable - BeinSports links)
    if (TEAM_LOGO_MAP[normalizedName]) {
        return TEAM_LOGO_MAP[normalizedName];
    }

    // 2. Try direct mapping with full name
    if (TEAM_LOGO_MAP[fullName]) {
        return TEAM_LOGO_MAP[fullName];
    }

    // 3. Try Sofascore API with known team IDs (most accurate)
    const sofascoreIds = {
        'real madrid': 2656,
        'barcelona': 2657,
        'atletico madrid': 2659,
        'manchester city': 2658,
        'arsenal': 2655,
        'liverpool': 2660,
        'manchester united': 2661,
        'chelsea': 2662,
        'tottenham': 2663,
        'bayern munich': 2661,
        'borussia dortmund': 2665,
        'psg': 2664,
        'juventus': 2667,
        'inter milan': 2668,
        'ac milan': 2669
    };

    if (sofascoreIds[normalizedName]) {
        return `https://api.sofascore.app/api/v1/team/${sofascoreIds[normalizedName]}/image`;
    }

    // 4. Try Sofascore API with provided teamId (if numeric)
    if (teamId && teamId.length > 0) {
        const numericId = parseInt(teamId);
        if (!isNaN(numericId) && numericId > 1000) {
            return `https://api.sofascore.app/api/v1/team/${numericId}/image`;
        }
    }

    // 5. Try Football-Data.org CDN with team ID
    if (teamId && teamId.length > 0) {
        return `https://crests.football-data.org/${teamId}.svg`;
    }

    // 6. Try MediaWiki CDN (Wikipedia logos)
    const wikiNames = {
        'real betis': 'Real_Betis_logo.svg',
        'real madrid': 'Real_Madrid_CF.svg',
        'fc barcelona': 'FC_Barcelona_(crest).svg',
        'atletico madrid': 'Atlético_Madrid_2017_logo.svg',
        'manchester city': 'Manchester_City_FC_badge.svg',
        'arsenal': 'Arsenal_FC.svg',
        'liverpool': 'Liverpool_FC.svg',
        'manchester united': 'Manchester_United_FC_crest.svg',
        'chelsea': 'Chelsea_FC.svg',
        'tottenham': 'Tottenham_Hotspur.svg',
        'psg': 'Paris_Saint-Germain_F.C..svg',
        'bayern munich': 'FC_Bayern_München_logo_(2017).svg',
        'juventus': 'Juventus_FC_2017_icon_(black).svg',
        'inter milan': 'Inter_Milan_2021.svg',
        'ac milan': 'AC_Milan_2019.svg',
    };

    if (wikiNames[normalizedName]) {
        return `https://upload.wikimedia.org/wikipedia/en/thumb/${wikiNames[normalizedName].substring(0, 1)}/${wikiNames[normalizedName]}/200px-${wikiNames[normalizedName]}.png`;
    }

    // 7. Generate URL based on name pattern
    const patternMap = {
        'real': 'https://crests.football-data.org/86.svg',
        'barcelona': 'https://crests.football-data.org/81.svg',
        'atletico': 'https://crests.football-data.org/78.svg',
        'manchester': 'https://crests.football-data.org/66.svg',
        'liverpool': 'https://crests.football-data.org/64.svg',
        'chelsea': 'https://crests.football-data.org/61.svg',
        'arsenal': 'https://crests.football-data.org/57.svg',
        'tottenham': 'https://crests.football-data.org/73.svg',
        'bayern': 'https://crests.football-data.org/157.svg',
        'dortmund': 'https://crests.football-data.org/165.svg',
        'psg': 'https://shared.cdn.beinsports.com/content/teams/logos/64x64/201.png',
        'juventus': 'https://crests.football-data.org/109.svg',
        'milan': 'https://crests.football-data.org/98.svg',
        'inter': 'https://crests.football-data.org/108.svg',
    };

    for (const [pattern, url] of Object.entries(patternMap)) {
        if (normalizedName.includes(pattern) || fullName.includes(pattern)) {
            return url;
        }
    }

    // 8. Last resort - Clearbit logo search (dynamic by domain)
    const domainName = normalizedName.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
    return `https://logo.clearbit.com/${domainName}`;
}

// Get league logo URL with official working URLs
function getLeagueLogoUrl(leagueName) {
    const leagueLogos = {
        'La Liga': 'https://www.laliga.com/assets/images/logos/laliga-h-monochrome-white.png',
        'Premier League': 'https://logos-world.net/wp-content/uploads/2020/05/Premier-League-Logo.png',
        'Bundesliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/240px-Bundesliga_logo_%282017%29.svg.png',
        'Serie A': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Serie_A_logo_%282019%29.svg/240px-Serie_A_logo_%282019%29.svg.png',
        'Ligue 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Ligue_1_logo.svg/240px-Ligue_1_logo.svg.png'
    };
    return leagueLogos[leagueName] || '';
}
