// Analyzer Module - Local Intelligent Analysis (No API needed)

// ============================================
// CONFIGURATION
// ============================================

// Elite team and player thresholds
const ELITE_TEAM_MIN_RATING = 85;
const ELITE_PLAYER_MIN_RATING = 86;
const SUPER_ELITE_PLAYER_RATING = 88; // 88+ gets special elite team treatment

// List of elite teams to prioritize for 88+ players
const ELITE_TEAMS = [
    'Real Madrid', 'FC Barcelona', 'Manchester City', 'Liverpool', 'Arsenal',
    'Bayern Munich', 'PSG', 'Inter', 'AC Milan', 'Juventus'
];

// ============================================
// CORE ANALYSIS FUNCTIONS
// ============================================

// Calculate style compatibility score
function calculateStyleCompatibility(userStyle, teamStyle) {
    let totalDiff = 0;
    let weights = {
        possession: 1.2,
        counter_attack: 1.2,
        wing_play: 1.3,
        through_balls: 1.1,
        aerial_balls: 0.9,
        high_press: 1.0
    };

    for (let key in userStyle) {
        if (teamStyle[key] !== undefined) {
            const diff = Math.abs(userStyle[key] - teamStyle[key]);
            totalDiff += diff * weights[key];
        }
    }

    const maxPossibleDiff = 100 * Object.values(weights).reduce((a, b) => a + b, 0);
    const compatibility = 100 - (totalDiff / maxPossibleDiff * 100);

    return Math.max(0, Math.min(100, compatibility));
}

// Find best position for player in a team
function findBestPosition(playerRating, squadGaps) {
    let bestPosition = null;
    let lowestRating = 999;

    for (const current of squadGaps) {
        if (!current.is_star && playerRating > current.rating + 4) {
            return {
                position: current.position,
                currentPlayer: current.player,
                currentRating: current.rating,
                currentAge: current.age || 25,
                is_star: current.is_star,
                is_young: current.is_young || false
            };
        }

        if (current.is_star) continue;

        if (current.rating < lowestRating) {
            lowestRating = current.rating;
            bestPosition = {
                position: current.position,
                currentPlayer: current.player,
                currentRating: current.rating,
                currentAge: current.age || 25,
                is_star: current.is_star,
                is_young: current.is_young || false
            };
        }
    }

    if (!bestPosition) {
        for (const current of squadGaps) {
            if (current.rating < lowestRating) {
                lowestRating = current.rating;
                bestPosition = {
                    position: current.position,
                    currentPlayer: current.player,
                    currentRating: current.rating,
                    currentAge: current.age || 25,
                    is_star: current.is_star,
                    is_young: current.is_young || false
                };
            }
        }
    }

    return bestPosition;
}

// Calculate growth potential
function calculateGrowthPotential(playerRating, teamOverall, wouldStart) {
    const baseGrowth = (teamOverall - playerRating) * 0.3;

    if (wouldStart) {
        return Math.min(15, Math.max(5, baseGrowth + 7));
    } else {
        return Math.min(12, Math.max(3, baseGrowth + 3));
    }
}

// Calculate generational replacement bonus
function calculateGenerationalBonus(bestPosition, playerRating, playerAge) {
    if (!bestPosition.is_young && bestPosition.is_star) {
        const ratingDiff = Math.abs(playerRating - bestPosition.currentRating);
        const currentAge = bestPosition.currentAge || 25;

        if (playerAge < 20 && currentAge > 32) {
            if (ratingDiff <= 5) return 25;
            else if (ratingDiff <= 10) return 18;
            else if (ratingDiff <= 15) return 10;
        } else if (playerAge < 20) {
            if (ratingDiff <= 5) return 20;
            else if (ratingDiff <= 10) return 12;
            else if (ratingDiff <= 15) return 5;
        } else {
            if (ratingDiff <= 5) return 15;
            else if (ratingDiff <= 10) return 8;
            else if (ratingDiff <= 15) return 3;
        }
    }

    return 0;
}

// ============================================
// LOCAL INTELLIGENT ANALYSIS
// ============================================

/**
 * Find best competitor for user's position in team (using CSV data) - ROBUST VERSION
 */
function analyzeRealCompetition(playerRating, userPosition, team) {
    // Safety check: ensure squad_gaps exists
    if (!team.squad_gaps || !Array.isArray(team.squad_gaps) || team.squad_gaps.length === 0) {
        console.warn(`⚠️ Team ${team.name} has no squad_gaps data`);
        return {
            competitor: { player: 'Plantilla desconocida', rating: 75, age: 25, is_star: false },
            ratingDiff: playerRating - 75,
            competitionType: 'UNKNOWN',
            competitionText: `Tu ${playerRating} vs plantilla promedio (75)`,
            wouldStart: playerRating >= 75
        };
    }

    console.log(`🔍 Analyzing ${team.name} for position ${userPosition} (squad: ${team.squad_gaps.length} players)`);

    // Find all players in user's position
    const positionPlayers = team.squad_gaps.filter(p => p.position === userPosition);

    // Position mapping for similar positions (EXPANDED)
    const positionMap = {
        'ST': ['CF', 'CAM'],
        'CF': ['ST', 'CAM'],
        'CAM': ['CM', 'CF'],
        'CM': ['CDM', 'CAM', 'CB'],
        'CDM': ['CM', 'CB'],
        'LW': ['LM', 'RW'],
        'RW': ['RM', 'LW'],
        'LM': ['LW', 'LB'],
        'RM': ['RW', 'RB'],
        'LB': ['LWB', 'CB'],
        'RB': ['RWB', 'CB'],
        'LWB': ['LB', 'LM'],
        'RWB': ['RB', 'RM'],
        'CB': ['CDM', 'CM'],
        'GK': ['GK']
    };

    let allCompetitors = [...positionPlayers];

    // Add players from similar positions
    const similarPositions = positionMap[userPosition] || [];
    similarPositions.forEach(similarPos => {
        const similarPlayers = team.squad_gaps.filter(p => p.position === similarPos);
        allCompetitors = [...allCompetitors, ...similarPlayers];
    });

    // If still no competitors found, use ALL players from team
    if (allCompetitors.length === 0) {
        console.warn(`⚠️ No players found for position ${userPosition}, using all players`);
        allCompetitors = [...team.squad_gaps];
    }

    // Sort by rating (highest first)
    allCompetitors.sort((a, b) => b.rating - a.rating);

    // Get the strongest competitor
    const strongestCompetitor = allCompetitors[0] || {
        player: 'Jugador promedio',
        rating: 75,
        age: 25,
        is_star: false
    };

    console.log(`✅ Found competitor: ${strongestCompetitor.player} (${strongestCompetitor.rating})`);

    // Calculate competition type with specific stat analysis
    const ratingDiff = playerRating - strongestCompetitor.rating;
    let competitionType;
    let competitionText;

    if (ratingDiff > 5) {
        competitionType = 'STAR';
        competitionText = `Con tu media de ${playerRating}, superas la efectividad de ${strongestCompetitor.player} (${strongestCompetitor.rating}) por ${ratingDiff} puntos`;
    } else if (ratingDiff >= 2) {
        competitionType = 'STARTER';
        competitionText = `Tu nivel ${playerRating} supera a ${strongestCompetitor.player} (${strongestCompetitor.rating}) - serías titular indiscutible`;
    } else if (ratingDiff >= -2) {
        competitionType = 'BATTLE';
        if (playerRating >= 88) {
            competitionText = `Con tus ${playerRating}, llega a competir por el puesto contra ${strongestCompetitor.player} (${strongestCompetitor.rating}) - equipo élite necesita rotación`;
        } else {
            competitionText = `Tu ${playerRating} iguala a ${strongestCompetitor.player} (${strongestCompetitor.rating}) - pelea el puesto directa`;
        }
    } else if (ratingDiff >= -5) {
        competitionType = 'ROTATION';
        competitionText = `Tu ${playerRating} compite con ${strongestCompetitor.player} (${strongestCompetitor.rating}) - suplente de élite con minutos`;
    } else {
        competitionType = 'BENCH';
        competitionText = `${strongestCompetitor.player} (${strongestCompetitor.rating}) supera tu ${playerRating} por ${Math.abs(ratingDiff)} puntos - llega al nivel del equipo primero`;
    }

    return {
        competitor: strongestCompetitor,
        ratingDiff: ratingDiff,
        competitionType: competitionType,
        competitionText: competitionText,
        wouldStart: ratingDiff >= 0
    };
}

/**
 * Filter teams by player rating tier AND game mode (RTG vs Star) - RELAXED FILTERS
 */
function filterTeamsByPlayerTier(playerRating, teams, gameMode) {
    const gameModeType = gameMode || 'star'; // 'rtg' or 'star'

    console.log(`🔍 Filter: Rating=${playerRating}, Mode=${gameModeType}, Total Teams=${teams.length}`);

    // RTG MODE: Small teams to grow (RELAXED - always returns teams)
    if (gameModeType === 'rtg') {
        // Try to find teams where player can be STAR, but don't filter too much
        const growthTeams = teams.filter(team => {
            const bestPlayer = team.squad_gaps.reduce((best, p) =>
                p.rating > best.rating ? p : best, { rating: 0 }
            );
            // Much more lenient: player >= best player (not +3)
            return playerRating >= bestPlayer.rating - 2;
        });

        // Sort by team rating (ascending - smaller teams first)
        growthTeams.sort((a, b) => a.overall_level - b.overall_level);

        console.log(`🌟 RTG Mode: ${growthTeams.length} growth teams found`);

        // ALWAYS return at least 10 teams, fill with ALL teams sorted by rating if needed
        if (growthTeams.length >= 10) {
            return growthTeams.slice(0, 10);
        } else {
            // Add all other teams sorted by rating (ascending for RTG)
            const allOtherTeams = teams
                .filter(t => !growthTeams.includes(t))
                .sort((a, b) => a.overall_level - b.overall_level);
            const result = [...growthTeams, ...allOtherTeams];
            console.log(`✅ RTG Mode: Returning ${Math.min(10, result.length)} teams total`);
            return result.slice(0, 10);
        }
    }

    // STAR MODE: Elite teams where player is already good (RELAXED)
    if (gameModeType === 'star') {
        // SUPER ÉLITE (88+): Prioritize REAL elite teams but don't be too strict
        if (playerRating >= SUPER_ELITE_PLAYER_RATING) {
            const superEliteTeams = teams.filter(t =>
                ELITE_TEAMS.some(eliteName => t.name.includes(eliteName))
            );

            const otherEliteTeams = teams.filter(t =>
                t.overall_level >= ELITE_TEAM_MIN_RATING &&
                !ELITE_TEAMS.some(eliteName => t.name.includes(eliteName))
            );

            const allOtherTeams = teams.filter(t =>
                !superEliteTeams.includes(t) && !otherEliteTeams.includes(t)
            );

            superEliteTeams.sort((a, b) => b.overall_level - a.overall_level);
            otherEliteTeams.sort((a, b) => b.overall_level - a.overall_level);
            allOtherTeams.sort((a, b) => b.overall_level - a.overall_level);

            // Combine but ensure we always have 10 teams
            let result = [...superEliteTeams, ...otherEliteTeams];
            if (result.length < 10) {
                result.push(...allOtherTeams.slice(0, 10 - result.length));
            }

            console.log(`👑 Super Elite Mode: ${result.length} teams (Elite: ${superEliteTeams.length})`);
            return result.slice(0, 10);
        }
        // ÉLITE (86-87): High-rated teams
        else if (playerRating >= ELITE_PLAYER_MIN_RATING) {
            const eliteTeams = teams.filter(t => t.overall_level >= ELITE_TEAM_MIN_RATING);
            const allOtherTeams = teams.filter(t => t.overall_level < ELITE_TEAM_MIN_RATING);

            eliteTeams.sort((a, b) => b.overall_level - a.overall_level);
            allOtherTeams.sort((a, b) => b.overall_level - a.overall_level);

            let result = [...eliteTeams];
            if (result.length < 10) {
                result.push(...allOtherTeams.slice(0, 10 - result.length));
            }

            console.log(`⭐ Elite Mode: ${result.length} teams (Elite: ${eliteTeams.length})`);
            return result.slice(0, 10);
        }
    }

    // For regular players, return all teams sorted by rating (RELAXED)
    const result = teams.sort((a, b) => b.overall_level - a.overall_level);
    console.log(`✅ Regular Mode: Returning ${Math.min(10, result.length)} teams`);
    return result.slice(0, 10);
}

/**
 * Generate dynamic analysis based on team and player stats - Uses attributes vs team average
 */
function generateDynamicAnalysis(result, playerRating) {
    const team = result.team;
    const competition = result.competition;

    // Get player's specific stats from answers.attributes
    const attrs = answers.attributes || {
        pac: 75, sho: 70, pas: 68, dri: 72, def: 60, phy: 65
    };

    const playerPAC = attrs.pac;
    const playerSHO = attrs.sho;
    const playerPAS = attrs.pas;
    const playerDRI = attrs.dri;
    const playerDEF = attrs.def;
    const playerPHY = attrs.phy;

    // Calculate team's average stats from squad_gaps
    const teamStats = calculateTeamAverageStats(team.squad_gaps);

    // Get team's style stats
    const teamPossession = team.style.possession;
    const teamPhysical = team.style.aerial_balls;

    // 10 analysis templates with attribute vs team average comparisons
    const templates = [
        // Template 1: PAC vs team average
        {
            condition: playerPAC > teamStats.pac + 5,
            template: `⚡ Tu velocidad (${playerPAC}) sería un arma letal en ${team.name} - superas el promedio del equipo (${teamStats.pac})`
        },
        // Template 2: SHO vs team average
        {
            condition: playerSHO > teamStats.sho + 5,
            template: `🎯 Con tu tiro (${playerSHO}), superas la efectividad promedio de ${team.name} (${teamStats.sho})`
        },
        // Template 3: PAS vs team average
        {
            condition: playerPAS > teamStats.pas + 5 && teamPossession > 70,
            template: `🎯 Tu pase (${playerPAS}) encaja perfecto en ${team.name} - mejor que el promedio (${teamStats.pas})`
        },
        // Template 4: DRI vs team average
        {
            condition: playerDRI > teamStats.dri + 5,
            template: `🏃 Tu regate (${playerDRI}) explotaría en ${team.name} - superas su promedio (${teamStats.dri})`
        },
        // Template 5: DEF vs team average (for defenders)
        {
            condition: playerDEF > teamStats.def + 5 && (answers.position?.includes('B') || answers.position === 'CDM'),
            template: `🛡️ Tu defensa (${playerDEF}) domina en ${team.name} - muy superior al promedio (${teamStats.def})`
        },
        // Template 6: PHY vs team average
        {
            condition: playerPHY > teamStats.phy + 5 && teamPhysical > 70,
            template: `💪 Tu físico (${playerPHY}) sería clave en ${team.name} - superas al promedio (${teamStats.phy})`
        },
        // Template 7: Elite team with high stats
        {
            condition: team.overall_level >= 85 && playerRating >= 88,
            template: `👑 ${team.name} (${team.overall_level}) necesita tu nivel ${playerRating}. ${competition.competitionText}`
        },
        // Template 8: RTG mode - growth opportunity
        {
            condition: answers.game_mode === 'rtg' && playerRating > competition.competitor.rating + 3,
            template: `🌟 Serías la ESTRELLA en ${team.name} - perfecto para desarrollar tu carrera`
        },
        // Template 9: Star mode - ready for elite
        {
            condition: answers.game_mode === 'star' && playerRating >= teamStats.ovr - 2,
            template: `⭐ ${team.name} es ideal para ti - ya estás al nivel del equipo (${teamStats.ovr})`
        },
        // Template 10: Default competition analysis
        {
            condition: true,
            template: competition.competitionText
        }
    ];

    // Find first matching template
    const matchingTemplate = templates.find(t => t.condition);
    return matchingTemplate.template;
}

/**
 * Calculate team's average stats from squad_gaps (handles missing player stats)
 */
function calculateTeamAverageStats(squadGaps) {
    if (!squadGaps || squadGaps.length === 0) {
        return { pac: 70, sho: 70, pas: 70, dri: 70, def: 70, phy: 70, ovr: 75 };
    }

    console.log(`📊 Calculating team average for ${squadGaps.length} players`);

    const sum = squadGaps.reduce((acc, player) => {
        // Try to get individual stats, fallback to rating
        const playerPac = player.pac || player.PAC || player.rating || 70;
        const playerSho = player.sho || player.SHO || player.rating || 70;
        const playerPas = player.pas || player.PAS || player.rating || 70;
        const playerDri = player.dri || player.DRI || player.rating || 70;
        const playerDef = player.def || player.DEF || player.rating || 70;
        const playerPhy = player.phy || player.PHY || player.rating || 70;

        return {
            pac: acc.pac + playerPac,
            sho: acc.sho + playerSho,
            pas: acc.pas + playerPas,
            dri: acc.dri + playerDri,
            def: acc.def + playerDef,
            phy: acc.phy + playerPhy,
            ovr: acc.ovr + player.rating
        };
    }, { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0, ovr: 0 });

    const count = squadGaps.length;
    const avg = {
        pac: Math.round(sum.pac / count),
        sho: Math.round(sum.sho / count),
        pas: Math.round(sum.pas / count),
        dri: Math.round(sum.dri / count),
        def: Math.round(sum.def / count),
        phy: Math.round(sum.phy / count),
        ovr: Math.round(sum.ovr / count)
    };

    console.log(`✅ Team average: PAC=${avg.pac}, SHO=${avg.sho}, PAS=${avg.pas}, DRI=${avg.dri}, DEF=${avg.def}, PHY=${avg.phy}, OVR=${avg.ovr}`);

    return avg;
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

async function analyzeResults() {
    showEpicLoadingScreen();

    // Ensure database is loaded
    if (!fc26Database) {
        console.log('⏳ Waiting for database...');
        await loadDatabase();
    }

    // CRITICAL: Verify database loaded successfully
    if (!fc26Database || !fc26Database.teams || fc26Database.teams.length === 0) {
        console.error('❌ DATABASE NOT LOADED OR EMPTY!');
        alert('Error: No se pudo cargar la base de datos. Asegúrate de que EAFC26-Men.csv esté en la carpeta.');
        hideAllScreens();
        document.getElementById('welcomeScreen').classList.add('active');
        return;
    }

    console.log(`✅ Database loaded: ${fc26Database.teams.length} teams available`);

    const playerRating = parseInt(document.getElementById('playerRating').value) || 80;
    const playerAge = answers.age || 21;

    console.log(`👤 Player: Rating=${playerRating}, Age=${playerAge}, Position=${answers.position}, GameMode=${answers.game_mode}`);

    const userStyle = {
        possession: answers.possession,
        counter_attack: answers.counter_attack,
        wing_play: answers.wing_play,
        through_balls: 50 + (answers.possession - 50) * 0.5,
        aerial_balls: answers.aerial_balls,
        high_press: answers.high_press
    };

    // Filter teams by selected leagues
    let selectedLeagues = answers.league;
    if (selectedLeagues.length === 0) {
        selectedLeagues = ['la_liga', 'premier_league', 'bundesliga', 'serie_a', 'ligue_1'];
    }

    console.log(`🏆 Selected Leagues: ${selectedLeagues.join(', ')}`);

    // Filter teams by player tier AND game mode
    const gameMode = answers.game_mode || 'star';
    const teamsByTier = filterTeamsByPlayerTier(playerRating, fc26Database.teams, gameMode);

    console.log(`🔍 Teams after tier filter: ${teamsByTier.length}`);

    // Analyze each team
    const teamAnalysis = teamsByTier
        .filter(team => {
            const teamLeagueId = getLeagueId(team.league);
            return selectedLeagues.includes(teamLeagueId);
        })
        .map(team => {
            const styleMatch = calculateStyleCompatibility(userStyle, team.style);

            // Analyze real competition using CSV data
            const userPosition = answers.position || findBestPosition(playerRating, team.squad_gaps).position;
            const competition = analyzeRealCompetition(playerRating, userPosition, team);

            const wouldStart = competition.wouldStart;
            const tooDifficult = competition.ratingDiff < -7;

            const growthPotential = calculateGrowthPotential(
                playerRating,
                team.overall_level,
                wouldStart
            );

            const bestPosition = {
                currentAge: competition.competitor.age,
                is_young: answers.age < 23,
                is_star: competition.competitor.is_star
            };
            const generationalBonus = calculateGenerationalBonus(bestPosition, playerRating, playerAge);

            const difficultyPenalty = tooDifficult ? -25 : 0;

            let startingBonus;
            if (tooDifficult) {
                startingBonus = 5;
            } else if (wouldStart) {
                startingBonus = 35;
            } else if (competition.ratingDiff >= -2) {
                startingBonus = 20;
            } else {
                startingBonus = 10;
            }

            const finalScore = (styleMatch * 0.40) + startingBonus + (growthPotential * 0.25) + (generationalBonus * 0.15) + (difficultyPenalty * 0.30);

            return {
                team: team,
                styleMatch: styleMatch,
                bestPosition: {
                    position: userPosition,
                    currentPlayer: competition.competitor.player,
                    currentRating: competition.competitor.rating,
                    currentAge: competition.competitor.age,
                    is_star: competition.competitor.is_star
                },
                competition: competition,
                wouldStart: wouldStart,
                ratingDiff: competition.ratingDiff,
                growthPotential: growthPotential,
                generationalBonus: generationalBonus,
                tooDifficult: tooDifficult,
                finalScore: Math.max(0, finalScore)
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore);

    console.log(`📊 Team Analysis Complete: ${teamAnalysis.length} teams analyzed`);

    // CRITICAL: Ensure we always have at least 3 results
    if (teamAnalysis.length === 0) {
        console.error('❌ NO TEAMS FOUND - This should not happen!');
        alert('No se encontraron equipos que coincidan con tus criterios. Intenta con diferentes opciones.');
        hideAllScreens();
        document.getElementById('welcomeScreen').classList.add('active');
        return;
    }

    // Get top 3 results (or fewer if not enough teams)
    const top3 = teamAnalysis.slice(0, Math.min(3, teamAnalysis.length));
    console.log(`✅ Top ${top3.length} results selected`);

    // Display results
    displayResults(top3, playerRating);
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function getLeagueId(leagueName) {
    const leagueMap = {
        'La Liga': 'la_liga',
        'Premier League': 'premier_league',
        'Bundesliga': 'bundesliga',
        'Serie A': 'serie_a',
        'Ligue 1': 'ligue_1'
    };
    return leagueMap[leagueName] || '';
}

function showEpicLoadingScreen() {
    hideAllScreens();
    document.getElementById('loadingScreen').classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Display results on screen
function displayResults(results, playerRating) {
    console.log(`🎯 Displaying ${results.length} results for player rating ${playerRating}`);

    // CRITICAL: Check if we have results
    if (!results || results.length === 0) {
        console.error('❌ NO RESULTS TO DISPLAY!');
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #d4af37;">⚠️ No se encontraron resultados</h2>
                <p style="color: #a0a5b9;">Intenta con diferentes opciones de liga o posición.</p>
                <button class="btn btn-primary" onclick="restart()" style="margin-top: 20px;">
                    ← Volver a intentar
                </button>
            </div>
        `;
        hideAllScreens();
        document.getElementById('resultsScreen').classList.add('active');
        return;
    }

    hideAllScreens();

    document.getElementById('resultPlayerRating').textContent = playerRating;

    const container = document.getElementById('resultsContainer');

    const medals = ['🥇', '🥈', '🥉'];
    const rankLabels = ['RECOMENDACIÓN #1', 'RECOMENDACIÓN #2', 'RECOMENDACIÓN #3'];

    let html = '';

    results.forEach((result, index) => {
        console.log(`📊 Result #${index + 1}: ${result.team.name} (Score: ${result.finalScore.toFixed(0)})`);
        const medal = medals[index];
        const rankLabel = rankLabels[index];
        const team = result.team;

        const positionLabels = {
            'ST': 'Delantero centro',
            'LW': 'Extremo izquierdo',
            'RW': 'Extremo derecho',
            'CAM': 'Mediocampista ofensivo',
            'CM': 'Mediocampista central',
            'CDM': 'Mediocampo defensivo',
            'LB': 'Lateral izquierdo',
            'LWB': 'Carrilero izquierdo',
            'RB': 'Lateral derecho',
            'RWB': 'Carrilero derecho',
            'CB': 'Defensa central'
        };

        let statusText;
        let statusClass;

        if (result.tooDifficult) {
            statusText = '<span class="suplente-badge">Muy Difícil</span>';
            statusClass = 'too-difficult';
        } else if (result.wouldStart) {
            statusText = '<span class="titular-badge">¡Serías TITULAR!</span>';
            statusClass = 'starting';
        } else {
            statusText = '<span class="suplente-badge">Serías SUPLENTE</span>';
            statusClass = 'substitute';
        }

        const ratingDiffText = result.ratingDiff >= 0
            ? `+${result.ratingDiff} de diferencia`
            : `${result.ratingDiff} de diferencia`;

        const difficultyWarning = result.tooDifficult
            ? '<div class="difficulty-warning">⚠️ Diferencia de más de 7 puntos con el titular. Sería muy difícil jugar aquí.</div>'
            : '';

        const generationalBonusText = result.generationalBonus > 0
            ? `<div class="generational-bonus">✨ +${result.generationalBonus} bono por relevo generacional</div>`
            : '';

        const isElite = team.overall_level > 82;
        const eliteClass = isElite ? 'elite-team' : '';

        // League logo with fallback
        const leagueLogoHtml = team.league_logo
            ? `<img src="${team.league_logo}" alt="${team.league}" class="league-logo-img" style="width:40px;height:40px;object-fit:contain;margin-right:8px;background:rgba(255,255,255,0.1);border-radius:8px;padding:4px;" onerror="this.style.display='none';">`
            : '';

        // Team logo with BETTER fallback
        const teamLogoHtml = team.team_logo
            ? `<img src="${team.team_logo}" alt="${team.name}" class="team-logo-img" style="width:50px;height:50px;object-fit:contain;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=random&color=fff';">`
            : '';

        // Dynamic analysis
        const dynamicAnalysis = generateDynamicAnalysis(result, playerRating);

        html += `
            <div class="result-card ${statusClass} ${eliteClass}" style="animation-delay: ${index * 0.2}s">
                <div class="result-header">
                    <span class="result-rank">${medal}</span>
                    ${teamLogoHtml}
                    <div class="result-team-info">
                        <div class="result-team-name">${team.name}</div>
                        <div class="result-league">${leagueLogoHtml} ${team.league}</div>
                    </div>
                    <div class="team-rating-badge ${isElite ? 'elite-rating' : ''}">
                        ${team.overall_level}
                    </div>
                </div>

                <div class="result-score">
                    <div class="result-score-value">${result.finalScore.toFixed(0)}</div>
                    <div class="result-score-label">Score de compatibilidad</div>
                </div>

                ${difficultyWarning}
                ${generationalBonusText}

                <div class="result-analysis">
                    ${dynamicAnalysis}
                </div>

                <div class="result-details">
                    <div class="result-detail-row">
                        <span class="result-detail-label">Posición ideal:</span>
                        <span class="result-detail-value">${positionLabels[result.bestPosition.position] || result.bestPosition.position}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Tu competencia directa:</span>
                        <span class="result-detail-value">${result.bestPosition.currentPlayer} (${result.bestPosition.currentRating})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Tu media:</span>
                        <span class="result-detail-value">${playerRating} (${ratingDiffText})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Estado:</span>
                        <span class="result-detail-value">${statusText}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Potencial de crecimiento:</span>
                        <span class="result-detail-value">+${result.growthPotential.toFixed(1)} puntos</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-label">Estilo del equipo:</span>
                        <span class="result-detail-value">${result.styleMatch.toFixed(0)}% compatible</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    document.getElementById('resultsScreen').classList.add('active');

    // Display local analysis
    displayLocalAnalysis(results);
}

// Display local intelligent analysis
function displayLocalAnalysis(results) {
    const container = document.getElementById('resultsContainer');

    // Create analysis section
    const analysisSection = document.createElement('div');
    analysisSection.className = 'ai-feedback-section';
    analysisSection.style.cssText = `
        background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 25, 45, 0.95) 100%);
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 20px;
        padding: 25px;
        margin-top: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(102, 126, 234, 0.1);
        animation: slideIn 0.6s ease;
    `;

    const playerRating = parseInt(document.getElementById('playerRating').value) || 80;

    let analysis = `🧠 **Análisis Inteligente (100% Local)**\n\n`;
    analysis += `Estas son mis recomendaciones basadas en tus ${answers.age || 21} años y media de ${playerRating}:\n\n`;

    results.forEach((result, index) => {
        analysis += `${index + 1}. **${result.team.name}** (${result.team.league})\n`;
        analysis += `   - Score: ${result.finalScore.toFixed(0)}/100\n`;
        analysis += `   - ${result.competition.competitionText}\n`;
        analysis += `   - PAC del equipo: ${Math.round((result.team.style.wing_play + result.team.style.counter_attack) / 2)} | Tu PAC: ${Math.round((answers.wing_play + answers.counter_attack) / 2)}\n\n`;
    });

    analysis += `💡 *Análisis generado automáticamente usando datos de 18,000+ jugadores del CSV. Sin APIs externas.*`;

    analysisSection.innerHTML = `
        <div style="white-space: pre-line; line-height: 1.6; color: #a0a5b9;">
            ${analysis}
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(102, 126, 234, 0.2); font-size: 0.8rem; color: #667eea; text-align: center; font-weight: 600;">
            🧠 Powered by Local Analysis | CSV Data (18K+ players)
        </div>
    `;

    container.appendChild(analysisSection);
}
