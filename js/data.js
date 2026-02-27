// FC26 Team Database - Loads from API or falls back to local JSON
// API: https://api.msmc.cc/eafc/

let fc26Database = null;
let dataSource = 'unknown'; // 'api' or 'local' or 'unknown'

// League filters - Only the 5 major leagues
const MAJOR_LEAGUES = [
    'La Liga',
    'Premier League',
    'Bundesliga',
    'Serie A',
    'Ligue 1'
];

// Load from API
async function loadFromAPI() {
    try {
        console.log('🌐 Attempting to fetch from API: https://api.msmc.cc/eafc/');

        // Try multiple endpoints for flexibility
        const endpoints = [
            'https://api.msmc.cc/eafc/teams',
            'https://api.msmc.cc/eafc/',
            'https://api.msmc.cc/eafc/teams.json'
        ];

        let apiData = null;
        let lastError = null;

        for (let endpoint of endpoints) {
            try {
                console.log(`🔄 Trying endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                });

                if (response.ok) {
                    apiData = await response.json();
                    console.log(`✅ Success from: ${endpoint}`);
                    break;
                }
            } catch (err) {
                console.warn(`❌ Endpoint failed: ${endpoint} - ${err.message}`);
                lastError = err;
                continue;
            }
        }

        if (!apiData) {
            throw new Error(`All endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
        }

        // Filter and transform data
        const filteredTeams = filterMajorLeagues(apiData);

        if (filteredTeams.length === 0) {
            console.warn('⚠️  API returned data but no teams from major leagues');
            return null;
        }

        fc26Database = { teams: filteredTeams };
        dataSource = 'api';  // Mark that we loaded from API

        console.log(`✅ Loaded from API: ${filteredTeams.length} teams from major leagues`);

        return fc26Database;

    } catch (error) {
        console.warn('⚠️  API load failed:', error.message);
        // Silently return null - don't show alert
        return null;
    }
}

// Filter teams from major leagues only
function filterMajorLeagues(apiData) {
    // The API might return data in different formats
    // Adjust this based on actual API response structure
    const teams = Array.isArray(apiData) ? apiData : (apiData.teams || apiData.data || []);

    return teams.filter(team => {
        return MAJOR_LEAGUES.includes(team.league);
    }).map(transformTeamData);
}

// Transform API data to our format
// ADAPTABLE: Edit this function when API format changes
// Expected API fields (flexible mapping):
//   - id/team_id: Team identifier
//   - name/team_name: Team name
//   - league: League name
//   - formation: Formation (4-3-3, etc.)
//   - overall/rating: Team strength (50-99)
//   - possession, counter_attack, wing_play, etc.: Style stats (0-100)
//   - squad/players/players_array: Array of player objects
// Kaggle dataset fields:
//   - acceleration, sprint_speed: Player speed stats
//   - age: Player age
//   - play_style: How the player/team plays
function transformTeamData(apiTeam) {
    // Log sample for debugging when API comes online
    if (window.DEBUG_API) {
        console.log('🔍 Raw API team data:', apiTeam);
    }

    // Calculate team speed from Kaggle fields (acceleration + sprint_speed)
    const teamAcceleration = getNumberField(apiTeam, ['acceleration', 'team_acceleration', 'avg_acceleration'], 70);
    const teamSprintSpeed = getNumberField(apiTeam, ['sprint_speed', 'team_sprint_speed', 'avg_sprint_speed'], 70);
    const calculatedSpeed = (teamAcceleration + teamSprintSpeed) / 2;

    // Flexible field mapping with fallbacks
    const team = {
        // Team identification
        id: getStringField(apiTeam, ['id', 'team_id', 'slug', 'short_name']),
        name: getStringField(apiTeam, ['name', 'team_name', 'full_name', 'club_name']),
        league: getStringField(apiTeam, ['league', 'league_name', 'competition']),
        league_flag: getLeagueFlag(getStringField(apiTeam, ['league', 'league_name', 'competition'])),


        // Tactical info
        formation: getStringField(apiTeam, ['formation', 'default_formation', 'lineup'], '4-3-3'),
        overall_level: getNumberField(apiTeam, ['overall', 'rating', 'team_rating', 'strength'], 75),

        // Play style (0-100)
        style: {
            possession: getNumberField(apiTeam, ['possession', 'possession_style', 'possession_rate'], 50),
            counter_attack: getNumberField(apiTeam, ['counter_attack', 'counter', 'transition'], 50),
            wing_play: getNumberField(apiTeam, ['wing_play', 'wings', 'wide_play'], 50),
            through_balls: getNumberField(apiTeam, ['through_balls', 'passing', 'through_pass'], 50),
            aerial_balls: getNumberField(apiTeam, ['aerial_balls', 'aerial', 'crossing'], 50),
            high_press: getNumberField(apiTeam, ['high_press', 'press', 'pressing_style'], 50)
        },

        // Kaggle dataset stats - for deeper analysis
        kaggle_stats: {
            acceleration: teamAcceleration,
            sprint_speed: teamSprintSpeed,
            avg_speed: calculatedSpeed,
            play_style: getStringField(apiTeam, ['play_style', 'playing_style', 'style'], 'Balanced')
        },

        // Squad data
        squad_gaps: transformSquadData(apiTeam.squad || apiTeam.players || apiTeam.players_array || apiTeam.squad_list || [])
    };

    // Log transformed data for debugging
    if (window.DEBUG_API) {
        console.log('✅ Transformed team:', team.name, '|', team.squad_gaps.length, 'players');
    }

    return team;
}

// Helper: Get string field from multiple possible keys
function getStringField(obj, keys, defaultValue = 'Unknown') {
    for (let key of keys) {
        if (obj[key] && typeof obj[key] === 'string') {
            return obj[key];
        }
    }
    return defaultValue;
}

// Helper: Get number field from multiple possible keys
function getNumberField(obj, keys, defaultValue = 50) {
    for (let key of keys) {
        if (obj[key] && typeof obj[key] === 'number') {
            return obj[key];
        }
        // Try parsing as number
        if (obj[key]) {
            const parsed = parseInt(obj[key]);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return defaultValue;
}

// Transform squad data to array format
// ADAPTABLE: Edit this function when API player format changes
// Expected player fields (flexible mapping):
//   - position/pos: Player position (ST, LW, RW, etc.)
//   - rating/overall: Player rating (50-99)
//   - name/player_name: Player name
//   - age: Player age (used for is_young calculation)
//   - is_star/star: Boolean, is this player a star?
//   - is_young/young: Boolean, is this a young prospect?
function transformSquadData(apiSquad) {
    if (!Array.isArray(apiSquad)) {
        console.warn('⚠️  Squad data is not an array:', typeof apiSquad);
        return [];
    }

    return apiSquad.map((player, index) => {
        // Debug first player
        if (window.DEBUG_API && index === 0) {
            console.log('🔍 Raw API player data:', player);
        }

        const age = getNumberField(player, ['age', 'player_age', 'years'], 25);
        const position = getStringField(player, ['position', 'pos', 'role', 'best_position'], 'ST');

        const transformedPlayer = {
            position: position,
            rating: getNumberField(player, ['rating', 'overall', 'score', 'potential'], 75),
            player: getStringField(player, ['name', 'player_name', 'full_name', 'short_name'], 'Unknown'),
            age: age,
            is_star: getBooleanField(player, ['is_star', 'star', 'key_player', 'starter'], false),
            is_young: getBooleanField(player, ['is_young', 'young', 'prospect'], age <= 21)
        };

        // Debug first transformed player
        if (window.DEBUG_API && index === 0) {
            console.log('✅ Transformed player:', transformedPlayer);
        }

        return transformedPlayer;
    });
}

// Helper: Get boolean field from multiple possible keys
function getBooleanField(obj, keys, defaultValue = false) {
    for (let key of keys) {
        if (obj[key] !== undefined) {
            // Handle various boolean representations
            if (typeof obj[key] === 'boolean') {
                return obj[key];
            }
            if (obj[key] === 1 || obj[key] === '1' || obj[key] === 'true' || obj[key] === 'yes') {
                return true;
            }
            if (obj[key] === 0 || obj[key] === '0' || obj[key] === 'false' || obj[key] === 'no') {
                return false;
            }
        }
    }
    return defaultValue;
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

// Main load function - tries API first, falls back to local
async function loadDatabase() {
    // Try API first
    let db = await loadFromAPI();

    // If API fails, use local backup
    if (!db || !db.teams || db.teams.length === 0) {
        console.log('🔄 Falling back to local data...');
        db = await loadFromLocal();
    }

    // Final check
    if (!db || !db.teams || db.teams.length === 0) {
        console.error('❌ Failed to load database from both API and local');
        return null;
    }

    console.log(`✅ Database ready: ${db.teams.length} teams`);
    return db;
}

// Export for direct access (legacy support)
// This will be populated after loadDatabase() completes

// Get data source status for UI
function getDataSourceStatus() {
    return {
        source: dataSource,
        isAPI: dataSource === 'api',
        isLocal: dataSource === 'local',
        label: dataSource === 'api' ? '🌐 API' : dataSource === 'local' ? '💾 Local' : '⏳ Loading...',
        color: dataSource === 'api' ? '#4caf50' : dataSource === 'local' ? '#ffc107' : '#999'
    };
}

// ============================================
// API TESTING & DEBUGGING TOOLS
// ============================================

// Enable debug mode: Set window.DEBUG_API = true in console
// This will log the raw API response and transformed data
function enableDebugMode() {
    window.DEBUG_API = true;
    console.log('%c🔍 DEBUG MODE ENABLED', 'font-size: 14px; font-weight: bold; color: #ff9800;');
    console.log('%cAPI response will be logged in detail', 'font-size: 12px; color: #999;');
    console.log('%cTo disable: window.DEBUG_API = false', 'font-size: 12px; color: #999;');
}

// Test API endpoint and show raw response
async function testAPIEndpoint() {
    console.log('🧪 Testing API endpoint...');

    try {
        const response = await fetch('https://api.msmc.cc/eafc/teams');
        const data = await response.json();

        console.log('✅ API Response received!');
        console.log('📊 Response structure:', {
            isArray: Array.isArray(data),
            keys: Object.keys(data),
            sampleItem: Array.isArray(data) && data.length > 0 ? data[0] : data,
            totalItems: Array.isArray(data) ? data.length : (data.teams || data.data || []).length
        });

        return data;
    } catch (error) {
        console.error('❌ API test failed:', error);
        return null;
    }
}

// Quick format check helper - Call this when API is live
function checkAPIFormat() {
    console.log('%c🔍 Checking API format...', 'font-weight: bold; color: #667eea;');

    enableDebugMode();
    testAPIEndpoint().then(data => {
        if (data) {
            console.log('%c✅ API is working!', 'font-weight: bold; color: #4caf50;');
            console.log('%c📝 Next steps:', 'font-weight: bold; color: #ff9800;');
            console.log('   1. Review the logged data above');
            console.log('   2. Update transformTeamData() if field names differ');
            console.log('   3. Update transformSquadData() if player fields differ');
            console.log('   4. Test with window.DEBUG_API = false when ready');
        }
    });
}
