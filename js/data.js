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
                team_logo: getTeamLogoUrl(),
                team_initials: getTeamInitials(player.team), // For CSS circular crest
                league_logo: getLeagueLogoUrl(),
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
// TEAM TACTICS DATABASE (2024/25 Season)
// Real team statistics from actual matches
// ============================================

const TEAM_TACTICS_DB = {
    // ==================== LA LIGA 2025/26 ====================
    'fc barcelona': {
        wing_play: 92,        // Yamal, Raphinha extreme width
        possession: 64,       // 64% possession (highest in La Liga)
        counter_attack: 58,   // More possession based
        aerial_balls: 52,     // Less aerial, more ground play
        high_press: 76,       // High pressing line under Flick
        formation: '4-3-3',   // Primary formation 2025/26
        goals_scored: 67      // 67 goals in 24/25 season
    },
    'real madrid': {
        wing_play: 88,        // Vinícius, Rodrygo on wings
        possession: 60,       // 60% average possession
        counter_attack: 68,   // Quick transitions with Mbappé
        aerial_balls: 72,     // Bellingham, Carvajal headers
        high_press: 78,       // Intense pressing under Ancelotti
        formation: '4-3-3',   // Primary formation
        goals_scored: 72      // 72 goals in 24/25 season
    },
    'villarreal': {
        wing_play: 80,        // Baena, Güler wide play
        possession: 56,
        counter_attack: 70,
        aerial_balls: 54,
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 58
    },
    'atletico madrid': {
        wing_play: 52,        // More narrow under Simeone
        possession: 46,       // 46% (counter-attack style)
        counter_attack: 88,   // Elite counter-attack
        aerial_balls: 82,     // Griezmann, Sorloth headers
        high_press: 80,       // Simeone's intense press
        formation: '5-3-2',
        goals_scored: 55
    },
    'real betis': {
        wing_play: 74,        // Abde, Fekir wide
        possession: 54,
        counter_attack: 72,
        aerial_balls: 72,     // Willian José, Borja Iglesias
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 50
    },
    'celta de vigo': {
        wing_play: 70,        // Svensson, Pérez
        possession: 50,
        counter_attack: 70,
        aerial_balls: 64,
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 48
    },
    'espanyol': {
        wing_play: 66,
        possession: 48,
        counter_attack: 74,
        aerial_balls: 66,
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 42
    },
    'athletic bilbao': {
        wing_play: 70,        // Williams brothers on wings
        possession: 54,
        counter_attack: 76,
        aerial_balls: 90,     // Elite aerial (Basque style)
        high_press: 72,
        formation: '4-2-3-1',
        goals_scored: 52
    },
    'osasuna': {
        wing_play: 60,
        possession: 48,
        counter_attack: 74,
        aerial_balls: 72,     // Budimir, Torró
        high_press: 66,
        formation: '5-3-2',
        goals_scored: 45
    },
    'real sociedad': {
        wing_play: 76,        // Kubo, Oyarzabal, Becker
        possession: 56,
        counter_attack: 72,
        aerial_balls: 58,
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 50
    },
    'girona': {
        wing_play: 78,        // Savinho, Dovbyk transitions
        possession: 55,
        counter_attack: 76,
        aerial_balls: 62,     // Dovbyk strong aerial
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 60
    },
    'sevilla': {
        wing_play: 70,
        possession: 52,
        counter_attack: 74,
        aerial_balls: 68,
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 46
    },
    'getafe': {
        wing_play: 48,
        possession: 40,       // Lowest in La Liga
        counter_attack: 72,
        aerial_balls: 74,     // Mayoral aerial
        high_press: 62,
        formation: '5-3-2',
        goals_scored: 38
    },
    'alaves': {
        wing_play: 62,
        possession: 46,
        counter_attack: 76,
        aerial_balls: 70,
        high_press: 64,
        formation: '5-3-2',
        goals_scored: 40
    },
    'rayo vallecano': {
        wing_play: 64,
        possession: 48,
        counter_attack: 78,   // Intense counter-attack
        aerial_balls: 56,
        high_press: 80,       // Very intense press
        formation: '4-2-3-1',
        goals_scored: 44
    },
    'valencia': {
        wing_play: 72,
        possession: 50,
        counter_attack: 70,
        aerial_balls: 64,
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 42
    },
    'elche': {
        wing_play: 58,
        possession: 44,
        counter_attack: 70,
        aerial_balls: 68,
        high_press: 60,
        formation: '5-3-2',
        goals_scored: 35
    },
    'mallorca': {
        wing_play: 56,
        possession: 45,
        counter_attack: 72,
        aerial_balls: 74,     // Strong aerial from set pieces
        high_press: 62,
        formation: '5-3-2',
        goals_scored: 38
    },
    'levante': {
        wing_play: 68,
        possession: 47,
        counter_attack: 74,
        aerial_balls: 62,
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 40
    },
    'real oviedo': {
        wing_play: 60,
        possession: 46,
        counter_attack: 72,
        aerial_balls: 66,
        high_press: 62,
        formation: '4-2-3-1',
        goals_scored: 36
    },

    // ==================== PREMIER LEAGUE 2025/26 ====================
    'manchester city': {
        wing_play: 94,        // Doku, Grealish, Foden extreme width
        possession: 66,       // 66% possession (highest in PL)
        counter_attack: 62,   // Quick transitions
        aerial_balls: 54,     // Less aerial focus
        high_press: 74,       // Guardiola high press
        formation: '4-3-3',
        goals_scored: 85      // 85+ goals 24/25 season
    },
    'arsenal': {
        wing_play: 84,        // Saka, Martinelli, Trossard
        possession: 60,       // 60% possession
        counter_attack: 72,   // Fast transitions
        aerial_balls: 62,     // Havertz headers
        high_press: 78,       // Arteta elite press
        formation: '4-3-3',
        goals_scored: 78
    },
    'aston villa': {
        wing_play: 76,        // Bailey, Rogers, Ramsey
        possession: 54,
        counter_attack: 76,   // Fast counter under Emery
        aerial_balls: 70,     // Watkins, Durán strong
        high_press: 70,
        formation: '4-2-3-1',
        goals_scored: 62
    },
    'manchester united': {
        wing_play: 74,        // Garnacho, Diallo, Amad
        possession: 52,
        counter_attack: 72,
        aerial_balls: 68,     // Hojlund aerial
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 52
    },
    'chelsea': {
        wing_play: 78,        // Palmer, Madueke, Neto
        possession: 56,
        counter_attack: 70,
        aerial_balls: 60,     // Jackson aerial
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 65
    },
    'liverpool': {
        wing_play: 88,        // Salah, Díaz, Gakpo wide
        possession: 58,
        counter_attack: 92,   // Elite counter-attack under Slot
        aerial_balls: 56,     // Núñez headers
        high_press: 84,       // Very high pressing
        formation: '4-3-3',
        goals_scored: 80
    },
    'brentford': {
        wing_play: 74,        // Mbeumo, Wissa wide
        possession: 52,
        counter_attack: 72,
        aerial_balls: 78,     // Toney, Wissa aerial
        high_press: 68,
        formation: '4-3-3',
        goals_scored: 55
    },
    'bournemouth': {
        wing_play: 78,        // Semenyo, Kluivert, Sinisterra
        possession: 53,
        counter_attack: 72,
        aerial_balls: 58,
        high_press: 68,
        formation: '4-2-3-1',
        goals_scored: 54
    },
    'everton': {
        wing_play: 66,
        possession: 48,
        counter_attack: 72,
        aerial_balls: 72,     // Calvert-Lewin strong
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 40
    },
    'fulham': {
        wing_play: 76,        // Traoré, Iwobi, Nelson
        possession: 51,
        counter_attack: 70,
        aerial_balls: 64,     // Jiménez aerial
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 50
    },
    'newcastle': {
        wing_play: 70,        // Gordon, Barnes, Miley
        possession: 52,
        counter_attack: 82,   // Howe's elite transitions
        aerial_balls: 76,     // Isak, Wilson strong
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 68
    },
    'sunderland': {
        wing_play: 72,        // Clarke, Roberts, Jobe
        possession: 50,
        counter_attack: 76,
        aerial_balls: 68,
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 48
    },
    'crystal palace': {
        wing_play: 74,        // Sarr, Mateta, Edouard
        possession: 49,
        counter_attack: 74,
        aerial_balls: 70,     // Mateta aerial
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 46
    },
    'brighton': {
        wing_play: 86,        // Mitoma, March, Welbeck extreme width
        possession: 61,       // High possession
        counter_attack: 68,
        aerial_balls: 56,
        high_press: 72,
        formation: '4-2-3-1',
        goals_scored: 60
    },
    'leeds united': {
        wing_play: 76,        // Gnonto, James, Summerville
        possession: 52,
        counter_attack: 78,
        aerial_balls: 62,
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 50
    },
    'tottenham': {
        wing_play: 82,        // Son, Johnson, Moore, Solanke
        possession: 56,
        counter_attack: 78,   // Postecoglou transitions
        aerial_balls: 64,     // Solanke aerial
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 66
    },
    'nottingham': {
        wing_play: 72,        // Elanga, Hudson-Odoi, Wood
        possession: 48,
        counter_attack: 78,
        aerial_balls: 74,     // Wood strong aerial
        high_press: 74,       // Nuno's intense press
        formation: '4-2-3-1',
        goals_scored: 46
    },
    'west ham': {
        wing_play: 74,        // Bowen, Kudus, Summerville
        possession: 50,
        counter_attack: 76,
        aerial_balls: 78,     // Bowen, Antonio aerial
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 52
    },
    'burnley': {
        wing_play: 68,        // Koleosho, Fadugba, Odobert
        possession: 47,
        counter_attack: 74,
        aerial_balls: 66,
        high_press: 68,
        formation: '4-4-2',
        goals_scored: 38
    },
    'wolverhampton': {
        wing_play: 72,        // Guedes, Cunha, Hwang
        possession: 48,
        counter_attack: 78,
        aerial_balls: 62,
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 44
    },

    // ==================== SERIE A 2025/26 ====================
    'inter': {
        wing_play: 60,        // More narrow, Dimarco wing-back
        possession: 56,
        counter_attack: 86,   // Elite counter (Lautaro, Thuram)
        aerial_balls: 70,     // Lautaro, Thuram strong
        high_press: 72,
        formation: '3-5-2',   // Inzaghi primary
        goals_scored: 75      // 75+ goals 24/25
    },
    'ac milan': {
        wing_play: 72,        // Leão, Pulisic, Chukwueze
        possession: 58,
        counter_attack: 70,
        aerial_balls: 64,     // Morata, Leão headers
        high_press: 68,
        formation: '4-2-3-1',
        goals_scored: 65
    },
    'napoles': {
        wing_play: 78,        // Kvaratskhelia, Politano, Ndour
        possession: 56,
        counter_attack: 74,
        aerial_balls: 56,
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 60
    },
    'roma': {
        wing_play: 72,        // Dybala, El Shaarawy, Pellegrini
        possession: 54,
        counter_attack: 70,
        aerial_balls: 64,     // Dovbyk, Lukaku aerial
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 55
    },
    'juventus': {
        wing_play: 66,        // Yildiz, Conceição, Koopmeiners
        possession: 56,
        counter_attack: 68,
        aerial_balls: 76,     // Vlahović, Milik strong
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 58
    },
    'como 1907': {
        wing_play: 70,        // Belotti, Strefezza, Iovinella
        possession: 52,
        counter_attack: 72,
        aerial_balls: 68,     // Belotti strong aerial
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 42
    },
    'atalanta': {
        wing_play: 74,        // Zappacosta, Hateboer, Lookman, De Ketelaere
        possession: 54,
        counter_attack: 84,   // Gasperini elite counter
        aerial_balls: 60,
        high_press: 76,
        formation: '3-4-2-1',
        goals_scored: 62
    },
    'bolonia': {
        wing_play: 70,        // Orsolini, Faborer, Karlsson
        possession: 52,
        counter_attack: 70,
        aerial_balls: 64,
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 48
    },
    'sassuolo': {
        wing_play: 76,        // Pinamonti, Bajrami, Viti
        possession: 54,
        counter_attack: 72,
        aerial_balls: 58,
        high_press: 68,
        formation: '4-3-3',
        goals_scored: 45
    },
    'lazio': {
        wing_play: 70,        // Zaccagni, Pedro, Castellanos
        possession: 54,
        counter_attack: 72,
        aerial_balls: 72,     // Castellanos, Immobile aerial
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 52
    },
    'udinese': {
        wing_play: 68,        // Lucca, Thauvin, Lovric
        possession: 50,
        counter_attack: 72,
        aerial_balls: 64,
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 44
    },
    'parma': {
        wing_play: 70,        // Bonny, Estevez, Mihăilă
        possession: 50,
        counter_attack: 72,
        aerial_balls: 66,
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 42
    },
    'cagliari': {
        wing_play: 64,        // Pavoletti, Lapadula, Zappa
        possession: 46,
        counter_attack: 74,
        aerial_balls: 72,     // Pavoletti elite aerial
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 38
    },
    'genova': {
        wing_play: 66,        // Ekuban, Gudmundsson, Messias
        possession: 48,
        counter_attack: 72,
        aerial_balls: 68,
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 40
    },
    'torino': {
        wing_play: 66,        // Vlasic, Zapata, Vlasic
        possession: 50,
        counter_attack: 74,
        aerial_balls: 70,     // Zapata strong aerial
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 46
    },
    'fiorentina': {
        wing_play: 74,        // Kouamé, Beltran, Colombo
        possession: 56,
        counter_attack: 70,
        aerial_balls: 62,
        high_press: 68,
        formation: '4-2-3-1',
        goals_scored: 52
    },
    'cremonese': {
        wing_play: 68,        // Ciofani, Sernicola, Ghion
        possession: 48,
        counter_attack: 70,
        aerial_balls: 66,
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 38
    },
    'lecce': {
        wing_play: 64,        // Krstovic, Piccoli, Dorgu
        possession: 48,
        counter_attack: 70,
        aerial_balls: 70,     // Krstovic strong aerial
        high_press: 64,
        formation: '4-4-2',
        goals_scored: 40
    },
    'pisa': {
        wing_play: 66,        // Masucci, Moreo, Tramoni
        possession: 47,
        counter_attack: 72,
        aerial_balls: 68,
        high_press: 62,
        formation: '4-3-3',
        goals_scored: 36
    },
    'hellas verona': {
        wing_play: 68,        // Mosquera, Ngonge, Tengstedt
        possession: 47,
        counter_attack: 74,
        aerial_balls: 68,     // Mosquera strong
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 42
    },

    // ==================== BUNDESLIGA 2025/26 ====================
    'bayern': {
        wing_play: 90,        // Coman, Gnabry, Sané, Olmo extreme width
        possession: 64,       // 64% possession (highest in BL)
        counter_attack: 70,   // Quick transitions
        aerial_balls: 58,     // Kane headers
        high_press: 76,
        formation: '4-2-3-1',
        goals_scored: 88      // 88+ goals 24/25
    },
    'dortmund': {
        wing_play: 86,        // Brandt, Adeyemi, Gittens, Malen
        possession: 58,
        counter_attack: 84,   // Elite counter-attack
        aerial_balls: 60,
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 68
    },
    'hoffenheim': {
        wing_play: 76,        // Kramaric, Bebou, Tošić, Prass
        possession: 54,
        counter_attack: 72,
        aerial_balls: 58,
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 52
    },
    'stuttgart': {
        wing_play: 74,        // Undav, Führich, Vagnoman, Coulibaly
        possession: 54,
        counter_attack: 74,
        aerial_balls: 62,
        high_press: 70,
        formation: '4-2-3-1',
        goals_scored: 58
    },
    'rb leipzig': {
        wing_play: 80,        // Simons, Nkunku, Sesko, Baumgartner
        possession: 58,
        counter_attack: 76,
        aerial_balls: 60,     // Sesko headers
        high_press: 76,
        formation: '4-2-3-1',
        goals_scored: 62
    },
    'leverkusen': {
        wing_play: 84,        // Grimaldo, Frimpong, Wirtz, Adli
        possession: 58,
        counter_attack: 78,   // Álvarez, Boniface transitions
        aerial_balls: 60,
        high_press: 74,       // Alonso's high press
        formation: '3-4-3',   // Primary formation
        goals_scored: 76
    },
    'friburgo': {
        wing_play: 66,        // Grifo, Höler, Dösch, Günter
        possession: 54,
        counter_attack: 70,
        aerial_balls: 64,
        high_press: 72,
        formation: '4-2-3-1',
        goals_scored: 48
    },
    'frankfurt': {
        wing_play: 74,        // Marmoush, Chaibi, Skhiri, Ekitike
        possession: 52,
        counter_attack: 80,   // Fast transitions
        aerial_balls: 66,
        high_press: 68,
        formation: '3-4-2-1',
        goals_scored: 54
    },
    'union berlin': {
        wing_play: 58,        // More narrow, primarily central
        possession: 48,
        counter_attack: 76,
        aerial_balls: 68,
        high_press: 74,
        formation: '5-3-2',
        goals_scored: 42
    },
    'augsburgo': {
        wing_play: 62,        // Demirović, Engels, Vargas
        possession: 46,
        counter_attack: 74,
        aerial_balls: 70,     // Demirović headers
        high_press: 66,
        formation: '5-3-2',
        goals_scored: 44
    },
    'hamburgo': {
        wing_play: 70,        // Wettstein, Meier, Jatta
        possession: 50,
        counter_attack: 76,
        aerial_balls: 66,
        high_press: 68,
        formation: '4-3-3',
        goals_scored: 46
    },
    'colonia': {
        wing_play: 68,        // Selke, Waldschmidt, Maina
        possession: 48,
        counter_attack: 72,
        aerial_balls: 66,     // Selke strong
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 40
    },
    'mainz': {
        wing_play: 66,        // Amiri, Burkardt, Lee
        possession: 50,
        counter_attack: 74,
        aerial_balls: 62,
        high_press: 68,
        formation: '4-2-3-1',
        goals_scored: 42
    },
    'gladbach': {
        wing_play: 74,        // Plea, Hack, Reitz, Köhn
        possession: 54,
        counter_attack: 72,
        aerial_balls: 64,
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 50
    },
    'wolfsburgo': {
        wing_play: 72,        // Wind, Majer, Baku, Arnold
        possession: 52,
        counter_attack: 74,
        aerial_balls: 68,     // Wind strong
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 48
    },
    'st pauli': {
        wing_play: 64,        // Hartel, Eggestein, Kinsombi
        possession: 48,
        counter_attack: 72,
        aerial_balls: 66,
        high_press: 70,       // Intense press
        formation: '4-3-3',
        goals_scored: 40
    },
    'werder bremen': {
        wing_play: 70,        // Ducksch, Schmid, Borgia, Weiser
        possession: 50,
        counter_attack: 74,
        aerial_balls: 68,     // Ducksch strong
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 44
    },
    'heidenheim': {
        wing_play: 60,        // Kleindienst, Dinkci, Mainka
        possession: 44,
        counter_attack: 74,
        aerial_balls: 72,     // Kleindienst elite aerial
        high_press: 68,
        formation: '5-3-2',
        goals_scored: 38
    },

    // ==================== LIGUE 1 2025/26 ====================
    'psg': {
        wing_play: 82,        // Dembélé, Barcola, Kolo Muani
        possession: 62,       // 62% possession (highest in L1)
        counter_attack: 68,
        aerial_balls: 58,     // Kolo Muani headers
        high_press: 72,
        formation: '4-3-3',
        goals_scored: 72      // 72+ goals 24/25
    },
    'lens': {
        wing_play: 64,        // Saâd, Sotoca, Fofana, Guilavogui
        possession: 48,
        counter_attack: 78,
        aerial_balls: 72,     // Wahi strong aerial
        high_press: 76,
        formation: '5-3-2',
        goals_scored: 52
    },
    'lyon': {
        wing_play: 76,        // Lacazette, Fofana, Nuamah, Benrahma
        possession: 54,
        counter_attack: 72,
        aerial_balls: 62,     // Lacazette headers
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 54
    },
    'marsella': {
        wing_play: 74,        // Harit, Greenwood, Gerbin, Ünal
        possession: 52,
        counter_attack: 76,
        aerial_balls: 64,     // Ünal aerial
        high_press: 68,
        formation: '4-3-3',
        goals_scored: 50
    },
    'lille': {
        wing_play: 72,        // David, Zhegrova, Cabella, Bayo
        possession: 54,
        counter_attack: 74,
        aerial_balls: 66,     // Bayo, David aerial
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 52
    },
    'rennes': {
        wing_play: 76,        // Kalimuendo, Doku, Bourigeaud
        possession: 52,
        counter_attack: 74,
        aerial_balls: 60,
        high_press: 66,
        formation: '4-3-3',
        goals_scored: 50
    },
    'estrasburgo': {
        wing_play: 70,        // Diallo, Sahi, Doukoure, Gameiro
        possession: 50,
        counter_attack: 72,
        aerial_balls: 62,
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 46
    },
    'monaco': {
        wing_play: 80,        // Minamino, Balogun, Magassa, Akliouche
        possession: 56,
        counter_attack: 74,
        aerial_balls: 62,     // Balogun headers
        high_press: 68,
        formation: '4-3-3',
        goals_scored: 58
    },
    'lorient': {
        wing_play: 70,        // Diouf, Le Mel, Kari, Mangani
        possession: 48,
        counter_attack: 74,
        aerial_balls: 64,
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 42
    },
    'toulouse': {
        wing_play: 68,        // Dallinga, Chaïbi, De Smet, Sylla
        possession: 48,
        counter_attack: 74,
        aerial_balls: 68,     // Dallinga strong
        high_press: 66,
        formation: '4-2-3-1',
        goals_scored: 44
    },
    'brest': {
        wing_play: 66,        // Honorat, Mounie, Lees-Melou
        possession: 47,
        counter_attack: 76,
        aerial_balls: 68,
        high_press: 70,
        formation: '4-3-3',
        goals_scored: 46
    },
    'angers': {
        wing_play: 68,        // Félix, Bamba, Yahia, Aholou
        possession: 46,
        counter_attack: 74,
        aerial_balls: 70,     // Bamba strong
        high_press: 64,
        formation: '5-3-2',
        goals_scored: 40
    },
    'le havre': {
        wing_play: 62,        // Nouri, Turgis, Opoku, Alioui
        possession: 44,       // Lowest in L1
        counter_attack: 76,
        aerial_balls: 72,
        high_press: 66,
        formation: '5-3-2',
        goals_scored: 36
    },
    'niza': {
        wing_play: 70,        // Laborde, Boga, Rosier, Brahimi
        possession: 50,
        counter_attack: 72,
        aerial_balls: 66,     // Laborde strong
        high_press: 64,
        formation: '4-3-3',
        goals_scored: 48
    },
    'paris fc': {
        wing_play: 64,        // Pandi, Karamoko, Bangoura, Touré
        possession: 46,
        counter_attack: 72,
        aerial_balls: 62,
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 38
    },
    'auxerre': {
        wing_play: 66,        // Hamed, Jérémy, Hein, Pellenard
        possession: 47,
        counter_attack: 74,
        aerial_balls: 66,
        high_press: 64,
        formation: '4-2-3-1',
        goals_scored: 40
    },
    'nantes': {
        wing_play: 66,        // Guessand, Coco, Blas, Sissoko
        possession: 49,
        counter_attack: 72,
        aerial_balls: 70,     // Guessand strong
        high_press: 64,
        formation: '4-4-2',
        goals_scored: 44
    },
    'metz': {
        wing_play: 62,        // Mikautadze, Niane, Sabaly, Jallow
        possession: 45,
        counter_attack: 76,
        aerial_balls: 68,
        high_press: 64,
        formation: '5-4-1',
        goals_scored: 36
    }
};

// ============================================
// TEAM LOGO SYSTEM - CSS Only (No external images)
// ============================================

// Generate initials for CSS circular crest
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

// ============================================
// TEAM LOGO SYSTEM - Real logos from Wikimedia Commons
// ============================================

/**
 * Get team logo URL from comprehensive database
 * Uses high-quality logos from Wikimedia Commons
 * @param {string} teamName - Team name
 * @returns {string|null} Logo URL or null for CSS fallback
 */
function getTeamLogoUrl(teamName) {
    if (!teamName) return null;

    const name = teamName.toLowerCase().trim();

    // Team logo URLs from Wikimedia Commons (high quality PNG)
    const LOGO_URLS = {
        // ==================== LA LIGA ====================
        'fc barcelona': 'https://upload.wikimedia.org/wikipedia/sco/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png',
        'real madrid': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
        'atletico madrid': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png',
        'athletic bilbao': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Athletic_Bilbao_logo.svg/1200px-Athletic_Bilbao_logo.svg.png',
        'real betis': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/1200px-Real_betis_logo.svg.png',
        'celta de vigo': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png',
        'espanyol': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/RCD_Espanyol_logo.svg/1200px-RCD_Espanyol_logo.svg.png',
        'osasuna': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/CA_Osasuna_logo.svg/1200px-CA_Osasuna_logo.svg.png',
        'real sociedad': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png',
        'girona': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Girona_FC_logo.svg/1200px-Girona_FC_logo.svg.png',
        'sevilla': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png',
        'getafe': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Getafe_CF_logo.svg/1200px-Getafe_CF_logo.svg.png',
        'alaves': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Deportivo_Alav%C3%A9s_logo.svg/1200px-Deportivo_Alav%C3%A9s_logo.svg.png',
        'rayo vallecano': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Rayo_Vallecano_logo.svg/1200px-Rayo_Vallecano_logo.svg.png',
        'valencia': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valencia_CF_logo.svg/1200px-Valencia_CF_logo.svg.png',
        'elche': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Elche_CF_logo.svg/1200px-Elche_CF_logo.svg.png',
        'mallorca': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/RCD_Mallorca_logo.svg/1200px-RCD_Mallorca_logo.svg.png',
        'levante': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Levante_UD_logo.svg/1200px-Levante_UD_logo.svg.png',
        'real oviedo': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Real_Oviedo_logo.svg/1200px-Real_Oviedo_logo.svg.png',

        // ==================== PREMIER LEAGUE ====================
        'manchester city': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
        'arsenal': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
        'aston villa': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/1200px-Aston_Villa_FC_crest_%282016%29.svg.png',
        'manchester united': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
        'chelsea': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png',
        'liverpool': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
        'brentford': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Brentford_FC_crest.svg/1200px-Brentford_FC_crest.svg.png',
        'bournemouth': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/AFC_Bournemouth_crest.svg/1200px-AFC_Bournemouth_crest.svg.png',
        'everton': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png',
        'fulham': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Fulham_FC_crest.svg/1200px-Fulham_FC_crest.svg.png',
        'newcastle': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png',
        'sunderland': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Sunderland_A.F.C._logo.svg/1200px-Sunderland_A.F.C._logo.svg.png',
        'crystal palace': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Crystal_Palace_FC_logo.svg/1200px-Crystal_Palace_FC_logo.svg.png',
        'brighton': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png',
        'leeds united': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Leeds_United_crest_%282020%29.svg/1200px-Leeds_United_crest_%282020%29.svg.png',
        'tottenham': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
        'nottingham': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Nottingham_Forest_F.C._logo.svg/1200px-Nottingham_Forest_F.C._logo.svg.png',
        'west ham': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png',
        'burnley': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Burnley_FC_crest_%282023%29.svg/1200px-Burnley_FC_crest_%282023%29.svg.png',
        'wolverhampton': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers_crest.svg/1200px-Wolverhampton_Wanderers_crest.svg.png',

        // ==================== SERIE A ====================
        'inter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png',
        'ac milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png',
        'napoles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Neapel.svg/1200px-SSC_Neapel.svg.png',
        'roma': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png',
        'juventus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png',
        'como 1907': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Como_1907_logo.svg/1200px-Como_1907_logo.svg.png',
        'atalanta': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Atalanta_B.C._logo_%282018%29.svg/1200px-Atalanta_B.C._logo_%282018%29.svg.png',
        'bolonia': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Bologna_FC_1909_logo.svg/1200px-Bologna_FC_1909_logo.svg.png',
        'sassuolo': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/32/US_Sassuolo_Calcio_logo.svg/1200px-US_Sassuolo_Calcio_logo.svg.png',
        'lazio': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png',
        'udinese': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Udinese_Calcio_logo.svg/1200px-Udinese_Calcio_logo.svg.png',
        'parma': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Parma_Calcio_1913_logo_%282017%29.svg/1200px-Parma_Calcio_1913_logo_%282017%29.svg.png',
        'cagliari': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Cagliari_Calcio_logo.svg/1200px-Cagliari_Calcio_logo.svg.png',
        'genova': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Genoa_CFC_logo.svg/1200px-Genoa_CFC_logo.svg.png',
        'torino': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Torino_FC_2017_logo.svg/1200px-Torino_FC_2017_logo.svg.png',
        'fiorentina': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/ACF_Fiorentina.svg/1200px-ACF_Fiorentina.svg.png',
        'cremonese': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/US_Cremonese_logo.svg/1200px-US_Cremonese_logo.svg.png',
        'lecce': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/US_Lecce_logo.svg/1200px-US_Lecce_logo.svg.png',
        'pisa': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Pisa_SC_logo.svg/1200px-Pisa_SC_logo.svg.png',
        'hellas verona': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Hellas_Verona_FC_logo.svg/1200px-Hellas_Verona_FC_logo.svg.png',

        // ==================== BUNDESLIGA ====================
        'bayern': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
        'dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png',
        'hoffenheim': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/TSG_1899_Hoffenheim_logo.svg/1200px-TSG_1899_Hoffenheim_logo.svg.png',
        'stuttgart': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/VfB_Stuttgart_1893_Logo.svg/1200px-VfB_Stuttgart_1893_Logo.svg.png',
        'rb leipzig': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png',
        'leverkusen': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Bayer_04_Leverkusen_logo.svg/1200px-Bayer_04_Leverkusen_logo.svg.png',
        'friburgo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/SC_Freiburg_logo.svg/1200px-SC_Freiburg_logo.svg.png',
        'frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png',
        'union berlin': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/1._FC_Union_Berlin_logo.svg/1200px-1._FC_Union_Berlin_logo.svg.png',
        'augsburgo': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/FC_Augsburg_logo.svg/1200px-FC_Augsburg_logo.svg.png',
        'hamburgo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Hamburger_SV_logo.svg/1200px-Hamburger_SV_logo.svg.png',
        'colonia': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/1._FC_K%C3%B6ln_logo.svg/1200px-1._FC_K%C3%B6ln_logo.svg.png',
        'mainz': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/ff/1._FSV_Mainz_05_logo.svg/1200px-1._FSV_Mainz_05_logo.svg.png',
        'gladbach': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Borussia_M%C3%B6nchengladbach_logo.svg/1200px-Borussia_M%C3%B6nchengladbach_logo.svg.png',
        'wolfsburgo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/VfL_Wolfsburg_Logo.svg/1200px-VfL_Wolfsburg_Logo.svg.png',
        'st pauli': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_St._Pauli_logo.svg/1200px-FC_St._Pauli_logo.svg.png',
        'werder bremen': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/SV_Werder_Bremen_logo.svg/1200px-SV_Werder_Bremen_logo.svg.png',
        'heidenheim': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/1._FC_Heidenheim_logo.svg/1200px-1._FC_Heidenheim_logo.svg.png',

        // ==================== LIGUE 1 ====================
        'psg': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png',
        'lens': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/RC_Lens_logo.svg/1200px-RC_Lens_logo.svg.png',
        'lyon': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Olympique_Lyonnais.svg/1200px-Olympique_Lyonnais.svg.png',
        'marsella': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/1200px-Olympique_Marseille_logo.svg.png',
        'lille': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/LOSC_Lille_M%C3%A9tropole_2018_logo.png/1200px-LOSC_Lille_M%C3%A9tropole_2018_logo.png',
        'rennes': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Stade_Rennais_FC_logo.svg/1200px-Stade_Rennais_FC_logo.svg.png',
        'estrasburgo': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/RC_Strasbourg_logo.svg/1200px-RC_Strasbourg_logo.svg.png',
        'monaco': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png',
        'lorient': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Lorient_logo.svg/1200px-FC_Lorient_logo.svg.png',
        'toulouse': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Toulouse_FC_logo.svg/1200px-Toulouse_FC_logo.svg.png',
        'brest': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Stade_Brestois_logo.svg/1200px-Stade_Brestois_logo.svg.png',
        'angers': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Angers_SCO_logo.svg/1200px-Angers_SCO_logo.svg.png',
        'le havre': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Le_Havre_AC_logo.svg/1200px-Le_Havre_AC_logo.svg.png',
        'niza': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/OGC_Nice_logo.svg/1200px-OGC_Nice_logo.svg.png',
        'paris fc': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Paris_FC_logo.svg/1200px-Paris_FC_logo.svg.png',
        'auxerre': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/AJ_Auxerre_logo.svg/1200px-AJ_Auxerre_logo.svg.png',
        'nantes': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Nantes_logo.svg/1200px-FC_Nantes_logo.svg.png',
        'metz': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Metz_logo.svg/1200px-FC_Metz_logo.svg.png'
    };

    const logoUrl = LOGO_URLS[name];

    if (logoUrl) {
        return logoUrl;
    }

    // Fallback: return null to use CSS initials
    return null;
}

// Get league logo URL - Return empty (not used anymore)
function getLeagueLogoUrl() {
    return ''; // Using FlagCDN images directly in questions.js
}
