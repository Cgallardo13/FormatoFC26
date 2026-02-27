// Analyzer Module - Local Intelligent Analysis (No API needed)

// ============================================
// CONFIGURATION
// ============================================

// Elite team threshold
const ELITE_TEAM_MIN_RATING = 85;
const ELITE_PLAYER_MIN_RATING = 86;

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
 * Find best competitor for user's position in team (using CSV data)
 */
function analyzeRealCompetition(playerRating, userPosition, team) {
    // Find all players in user's position
    const positionPlayers = team.squad_gaps.filter(p => p.position === userPosition);

    // Position mapping for similar positions
    const positionMap = {
        'ST': ['CF', 'CAM'],
        'CF': ['ST', 'CAM'],
        'CAM': ['CM', 'CF'],
        'CM': ['CDM', 'CAM'],
        'CDM': ['CM', 'CB'],
        'LW': ['LM', 'RW'],
        'RW': ['RM', 'LW'],
        'LM': ['LW', 'LB'],
        'RM': ['RW', 'RB'],
        'LB': ['LWB', 'CB'],
        'RB': ['RWB', 'CB'],
        'LWB': ['LB', 'LM'],
        'RWB': ['RB', 'RM'],
        'CB': ['CDM']
    };

    let allCompetitors = [...positionPlayers];

    // Add players from similar positions
    const similarPositions = positionMap[userPosition] || [];
    similarPositions.forEach(similarPos => {
        const similarPlayers = team.squad_gaps.filter(p => p.position === similarPos);
        allCompetitors = [...allCompetitors, ...similarPlayers];
    });

    // Sort by rating (highest first)
    allCompetitors.sort((a, b) => b.rating - a.rating);

    // Get the strongest competitor
    const strongestCompetitor = allCompetitors[0] || {
        player: 'Nadie',
        rating: 0,
        age: 25,
        is_star: false
    };

    // Calculate competition type
    const ratingDiff = playerRating - strongestCompetitor.rating;
    let competitionType;
    let competitionText;

    if (ratingDiff > 5) {
        competitionType = 'STAR';
        competitionText = `Serías la ESTRELLA 💫, superando a ${strongestCompetitor.player} (${strongestCompetitor.rating})`;
    } else if (ratingDiff >= 2) {
        competitionType = 'STARTER';
        competitionText = `Serías TITULAR 🟢, superando a ${strongestCompetitor.player} (${strongestCompetitor.rating})`;
    } else if (ratingDiff >= -2) {
        competitionType = 'BATTLE';
        competitionText = `Llegarías a PELEAR el puesto ⚔️ contra ${strongestCompetitor.player} (${strongestCompetitor.rating}), el equipo necesita rotación de élite`;
    } else if (ratingDiff >= -5) {
        competitionType = 'ROTATION';
        competitionText = `Serías SUPLENTE de élite 🔄, compitiendo con ${strongestCompetitor.player} (${strongestCompetitor.rating})`;
    } else {
        competitionType = 'BENCH';
        competitionText = `Serías suplente por ahora 😔, ${strongestCompetitor.player} (${strongestCompetitor.rating}) es muy superior`;
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
 * Filter teams by player rating tier
 */
function filterTeamsByPlayerTier(playerRating, teams) {
    // If player is elite (86+), prioritize elite teams
    if (playerRating >= ELITE_PLAYER_MIN_RATING) {
        const eliteTeams = teams.filter(t => t.overall_level >= ELITE_TEAM_MIN_RATING);
        const otherTeams = teams.filter(t => t.overall_level < ELITE_TEAM_MIN_RATING);

        eliteTeams.sort((a, b) => b.overall_level - a.overall_level);
        otherTeams.sort((a, b) => b.overall_level - a.overall_level);

        if (eliteTeams.length >= 3) {
            return eliteTeams.slice(0, Math.min(10, eliteTeams.length));
        } else {
            return [...eliteTeams, ...otherTeams.slice(0, 10 - eliteTeams.length)];
        }
    }

    // For regular players, return all teams sorted by rating
    return teams.sort((a, b) => b.overall_level - a.overall_level);
}

/**
 * Generate dynamic analysis based on team and player stats
 */
function generateDynamicAnalysis(result, playerRating) {
    const team = result.team;
    const competition = result.competition;

    // Get team's key stats
    const teamSpeed = Math.round((team.style.wing_play + team.style.counter_attack) / 2);
    const teamPossession = team.style.possession;
    const teamPhysical = team.style.aerial_balls;

    // Get user's preferences
    const userSpeed = (answers.wing_play + answers.counter_attack) / 2;
    const userPossession = answers.possession;

    // 5 analysis templates with different focuses
    const templates = [
        // Template 1: Speed focus
        {
            condition: teamSpeed > 70 && userSpeed > 60,
            template: `⚡ **Explosión en velocidad**: Tu ritmo PAC ${userSpeed.toFixed(0)} encaja con el estilo de ${team.name} (${teamSpeed} de PAC de equipo). ${competition.competitionText}.`
        },
        // Template 2: Possession focus
        {
            condition: teamPossession > 70 && userPossession > 60,
            template: `🎯 **Maestros de la posesión**: Con ${teamPossession}% de control, ${team.name} busca tu visión (${userPossession} de POS). ${competition.competitionText}.`
        },
        // Template 3: Physical battle
        {
            condition: teamPhysical > 70 && answers.aerial_balls > 60,
            template: `💪 **Dominio aéreo garantizado**: Tu fuerza (${answers.aerial_balls}) + el estilo físico de ${team.name} (${teamPhysical}) = match perfecto. ${competition.competitionText}.`
        },
        // Template 4: Young prospect opportunity
        {
            condition: competition.ratingDiff < 0 && answers.age < 23,
            template: `🌟 **Proyecto del futuro**: Con tus ${answers.age} años, ${team.name} es tu mejor opción. ${competition.competitionText}. Tiempo de formarte.`
        },
        // Template 5: Elite team battle
        {
            condition: team.overall_level >= 85 && playerRating >= 86,
            template: `👑 **Batalla de estrellas**: ${team.name} (${team.overall_level} de media) necesita tu nivel (${playerRating}). ${competition.competitionText}. El stage es tuyo.`
        }
    ];

    // Find matching template
    const matchingTemplate = templates.find(t => t.condition);

    if (matchingTemplate) {
        return matchingTemplate.template;
    }

    // Default template
    return `🎯 **Fit táctico**: ${team.name} busca tu perfil. ${competition.competitionText}`;
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

    const playerRating = parseInt(document.getElementById('playerRating').value) || 80;
    const playerAge = answers.age || 21;

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

    // Filter teams by player tier
    const teamsByTier = filterTeamsByPlayerTier(playerRating, fc26Database.teams);

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

    // Get top 3 results
    const top3 = teamAnalysis.slice(0, 3);

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
    hideAllScreens();

    document.getElementById('resultPlayerRating').textContent = playerRating;

    const container = document.getElementById('resultsContainer');

    const medals = ['🥇', '🥈', '🥉'];
    const rankLabels = ['RECOMENDACIÓN #1', 'RECOMENDACIÓN #2', 'RECOMENDACIÓN #3'];

    let html = '';

    results.forEach((result, index) => {
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
            ? `<img src="${team.league_logo}" alt="${team.league}" class="league-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none">${team.league_flag}</span>`
            : `<span>${team.league_flag}</span>`;

        // Team logo
        const teamLogoHtml = team.team_logo
            ? `<img src="${team.team_logo}" alt="${team.name}" class="team-logo-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDQ5ZjM3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNMTIgMnwxMCAxMC0xMCAxME0yIDEybDEwIDEwLTEwIi8+PC9zdmc+'">`
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
