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
            const teamLogoUrl = getTeamLogoUrl(player.team, teamId);

            teamMap.set(teamKey, {
                id: teamId,
                name: player.team,
                league: player.league,
                league_flag: getLeagueFlag(player.league),
                formation: '4-3-3', // Default formation
                overall_level: 0,
                team_logo: teamLogoUrl,
                team_initials: getTeamInitials(player.team), // For CSS fallback
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
// SOFASCORE API - Logo System
// Single source of truth for ALL logos
// ============================================

// Sofascore IDs for Leagues
const SOFASCORE_LEAGUE_IDS = {
    'La Liga': 8,
    'Premier League': 17,
    'Bundesliga': 35,
    'Serie A': 23,
    'Ligue 1': 34
};

// Sofascore IDs for ALL Teams from 5 Major Leagues (2026 Season)
const SOFASCORE_TEAM_IDS = {
    // ==================== LA LIGA (Spain) - League ID: 8 ====================
    'real madrid': 2829,
    'madrid': 2829,
    'fc barcelona': 2817,
    'barcelona': 2817,
    'atletico madrid': 2836,
    'atletico': 2836,
    'real sociedad': 2824,
    'sociedad': 2824,
    'athletic club': 2825,
    'athletic bilbao': 2825,
    'bilbao': 2825,
    'girona fc': 2905,
    'girona': 2905,
    'real betis': 2816,
    'betis': 2816,
    'villarreal': 2819,
    'valencia cf': 2828,
    'valencia': 2828,
    'sevilla fc': 2832,
    'sevilla': 2832,
    'ca osasuna': 2820,
    'osasuna': 2820,
    'getafe cf': 2859,
    'getafe': 2859,
    'celta vigo': 2821,
    'celta': 2821,
    'rayo vallecano': 2818,
    'rayo': 2818,
    'las palmas': 2831,
    'rcd mallorca': 2822,
    'mallorca': 2822,
    'deportivo alaves': 2885,
    'alaves': 2885,
    'leganes': 2845,
    'real valladolid': 2830,
    'valladolid': 2830,
    'rcd espanyol': 2814,
    'espanyol': 2814,

    // ==================== PREMIER LEAGUE (England) - League ID: 17 ====================
    'manchester city': 17,
    'manchester': 17,
    'man city': 17,
    'arsenal': 42,
    'liverpool': 31,
    'aston villa': 40,
    'tottenham': 33,
    'spurs': 33,
    'chelsea': 38,
    'manchester united': 35,
    'manchester utd': 35,
    'man utd': 35,
    'newcastle': 39,
    'newcastle united': 39,
    'west ham': 37,
    'west ham united': 37,
    'brighton': 30,
    'brighton and hove albion': 30,
    'wolves': 3,
    'wolverhampton': 3,
    'everton': 48,
    'bournemouth': 34,
    'afc bournemouth': 34,
    'fulham': 43,
    'crystal palace': 7,
    'brentford': 50,
    'nottingham forest': 14,
    'nottingham': 14,
    'leicester city': 26,
    'leicester': 26,
    'ipswich town': 11,
    'ipswich': 11,
    'southampton': 27,

    // ==================== BUNDESLIGA (Germany) - League ID: 35 ====================
    'bayer leverkusen': 2681,
    'leverkusen': 2681,
    'bayern munich': 2672,
    'bayern': 2672,
    'bayern münchen': 2672,
    'borussia dortmund': 2673,
    'dortmund': 2673,
    'rb leipzig': 2677,
    'leipzig': 2677,
    'eintracht frankfurt': 2671,
    'frankfurt': 2671,
    'vfb stuttgart': 2674,
    'stuttgart': 2674,
    'tsg hoffenheim': 2679,
    'hoffenheim': 2679,
    '1 fc heidenheim': 5882,
    'heidenheim': 5882,
    'sc freiburg': 2678,
    'freiburg': 2678,
    'werder bremen': 2675,
    'bremen': 2675,
    'vfl wolfsburg': 2684,
    'wolfsburg': 2684,
    'fc augsburg': 2683,
    'augsburg': 2683,
    'borussia monchengladbach': 2670,
    'monchengladbach': 2670,
    'borussia mönchengladbach': 2670,
    '1 fsv mainz 05': 2690,
    'mainz': 2690,
    'mainz 05': 2690,
    '1 fc union berlin': 28250,
    'union berlin': 28250,
    'vfl bochum': 2682,
    'bochum': 2682,
    'fc st pauli': 2689,
    'st pauli': 2689,
    'holstein kiel': 2691,
    'kiel': 2691,
    'hamburger sv': 2692,
    'hamburg': 2692,

    // ==================== SERIE A (Italy) - League ID: 23 ====================
    'inter milan': 2697,
    'inter': 2697,
    'ac milan': 2692,
    'milan': 2692,
    'juventus': 2687,
    'juve': 2687,
    'atalanta': 2686,
    'as roma': 2702,
    'roma': 2702,
    'lazio': 2701,
    'ssc napoli': 2714,
    'napoli': 2714,
    'ac fiorentina': 2693,
    'fiorentina': 2693,
    'torino fc': 2696,
    'torino': 2696,
    'bologna fc': 2685,
    'bologna': 2685,
    'genoa': 2713,
    'genoa cfc': 2713,
    'ac monza': 2729,
    'monza': 2729,
    'hellas verona': 2704,
    'verona': 2704,
    'udinese': 2695,
    'udinese calcio': 2695,
    'cagliari': 2719,
    'cagliari calcio': 2719,
    'us lecce': 2699,
    'lecce': 2699,
    'empoli': 2705,
    'empoli fc': 2705,
    'parma': 2688,
    'parma calcio': 2688,
    'como': 2711,
    'como 1907': 2711,
    'venezia': 2708,
    'venezia fc': 2708,

    // ==================== LIGUE 1 (France) - League ID: 34 ====================
    'psg': 1644,
    'paris saint-germain': 1644,
    'paris': 1644,
    'as monaco': 1617,
    'monaco': 1617,
    'losc lille': 1629,
    'lille': 1629,
    'stade brestois': 1645,
    'brest': 1645,
    'ogc nice': 1639,
    'nice': 1639,
    'olympique lyon': 1616,
    'lyon': 1616,
    'rc lens': 1635,
    'lens': 1635,
    'olympique marseille': 1631,
    'marseille': 1631,
    'stade de reims': 1620,
    'reims': 1620,
    'stade rennais': 1651,
    'rennes': 1651,
    'toulouse fc': 1643,
    'toulouse': 1643,
    'montpellier': 1641,
    'rc strasbourg': 1659,
    'strasbourg': 1659,
    'fc nantes': 1647,
    'nantes': 1647,
    'le havre ac': 1661,
    'le havre': 1661,
    'aj auxerre': 1625,
    'auxerre': 1625,
    'angers': 1614,
    'angers sco': 1614,
    'saint-etienne': 1619,
    'as saint-etienne': 1619
};

// Normalize team name for logo lookup
function normalizeTeamName(teamName) {
    const name = teamName.toLowerCase().trim();
    return name;
}

// Generate initials for CSS fallback crest
function getTeamInitials(teamName) {
    const name = teamName.toLowerCase().trim();

    // Common abbreviations
    const commonAbbr = {
        'real madrid': 'RMA',
        'fc barcelona': 'FCB',
        'atletico madrid': 'ATM',
        'manchester city': 'MCI',
        'manchester united': 'MUN',
        'arsenal': 'ARS',
        'liverpool': 'LIV',
        'chelsea': 'CHE',
        'tottenham': 'TOT',
        'bayern munich': 'BAY',
        'borussia dortmund': 'BVB',
        'inter milan': 'INT',
        'ac milan': 'MIL',
        'juventus': 'JUV',
        'psg': 'PSG',
        'paris saint-germain': 'PSG'
    };

    if (commonAbbr[name]) {
        return commonAbbr[name];
    }

    // Generate initials from name
    const words = teamName.toUpperCase().split(/\s+/);

    // For "FC TeamName" or "TeamName FC", use first letters
    if (words.length === 1) {
        // Single word: use first 2-3 letters
        return words[0].substring(0, Math.min(3, words[0].length));
    } else if (words.length === 2) {
        // Two words: use first letter of each
        return words[0][0] + words[1][0];
    } else {
        // Three or more: use first letter of first 2 words
        return words[0][0] + words[1][0];
    }
}

// Google Focus Proxy - For CORS and caching
const GOOGLE_FOCUS_PROXY = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=';

// Get team logo URL using Sofascore API with Google Focus Proxy
function getTeamLogoUrl(teamName, teamId) {
    const normalizedName = normalizeTeamName(teamName);

    // 1. Try exact match from our comprehensive mapping
    if (SOFASCORE_TEAM_IDS[normalizedName]) {
        const sofascoreUrl = `https://api.sofascore.app/api/v1/team/${SOFASCORE_TEAM_IDS[normalizedName]}/image`;
        return GOOGLE_FOCUS_PROXY + encodeURIComponent(sofascoreUrl);
    }

    // 2. Try to find by partial match (e.g., "madrid" matches "real madrid")
    for (const [key, id] of Object.entries(SOFASCORE_TEAM_IDS)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            const sofascoreUrl = `https://api.sofascore.app/api/v1/team/${id}/image`;
            return GOOGLE_FOCUS_PROXY + encodeURIComponent(sofascoreUrl);
        }
    }

    // 3. Fallback to teamId if it's a valid Sofascore ID
    if (teamId && teamId.length > 0) {
        const numericId = parseInt(teamId);
        if (!isNaN(numericId) && numericId > 0) {
            const sofascoreUrl = `https://api.sofascore.app/api/v1/team/${numericId}/image`;
            return GOOGLE_FOCUS_PROXY + encodeURIComponent(sofascoreUrl);
        }
    }

    // 4. Last resort: Return null to trigger CSS fallback with initials
    console.warn(`⚠️ Team not found in Sofascore mapping: ${teamName}`);
    return null; // Will trigger CSS initials fallback
}

// Get league logo URL using Sofascore API with Google Focus Proxy
function getLeagueLogoUrl(leagueName) {
    if (SOFASCORE_LEAGUE_IDS[leagueName]) {
        const sofascoreUrl = `https://api.sofascore.app/api/v1/unique-tournament/${SOFASCORE_LEAGUE_IDS[leagueName]}/image`;
        return GOOGLE_FOCUS_PROXY + encodeURIComponent(sofascoreUrl);
    }
    console.warn(`⚠️ League not found in Sofascore mapping: ${leagueName}`);
    return '';
}
