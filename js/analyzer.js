// Analyzer Module - Matches player style with teams

// Calculate style compatibility score
function calculateStyleCompatibility(userStyle, teamStyle) {
    let totalDiff = 0;
    let weights = {
        possession: 1.2,
        counter_attack: 1.2,  // Now independent
        wing_play: 1.3,
        through_balls: 1.1,
        aerial_balls: 0.9,
        high_press: 1.0
    };

    // Calculate weighted differences
    for (let key in userStyle) {
        if (teamStyle[key] !== undefined) {
            const diff = Math.abs(userStyle[key] - teamStyle[key]);
            totalDiff += diff * weights[key];
        }
    }

    // Convert difference to compatibility score (0-100)
    const maxPossibleDiff = 100 * Object.values(weights).reduce((a, b) => a + b, 0);
    const compatibility = 100 - (totalDiff / maxPossibleDiff * 100);

    return Math.max(0, Math.min(100, compatibility));
}

// Find best position for player in a team
function findBestPosition(playerRating, squadGaps) {
    let bestPosition = null;
    let lowestRating = 999;
    let lowestStarRating = 999;

    // First, try to find a position where player can be a star (rating > current by 5+)
    for (let current of squadGaps) {
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
    }

    // If no star opportunity, find the weakest position
    for (let current of squadGaps) {
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

    // If all positions are stars, find the weakest star
    if (!bestPosition) {
        for (let current of squadGaps) {
            if (current.rating < lowestStarRating) {
                lowestStarRating = current.rating;
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
        // If starting, player develops faster
        return Math.min(15, Math.max(5, baseGrowth + 7));
    } else {
        // If on bench, slower development
        return Math.min(12, Math.max(3, baseGrowth + 3));
    }
}

// Check if position is too difficult (7+ point difference)
function isPositionTooDifficult(playerRating, currentRating) {
    const diff = currentRating - playerRating;
    return diff > 7;
}

// Find players in specific position (for user's selected position)
function findPlayersInPosition(squadGaps, position) {
    return squadGaps.filter(player => player.position === position);
}

// Get competition for specific position
function getPositionCompetition(playerRating, squadGaps, userPosition) {
    const playersInPosition = findPlayersInPosition(squadGaps, userPosition);

    // If no players in that position, find best fit
    if (playersInPosition.length === 0) {
        return findBestPosition(playerRating, squadGaps);
    }

    // Find the strongest player in that position (main competition)
    let strongestPlayer = playersInPosition[0];
    for (let player of playersInPosition) {
        if (player.rating > strongestPlayer.rating) {
            strongestPlayer = player;
        }
    }

    return {
        position: strongestPlayer.position,
        currentPlayer: strongestPlayer.player,
        currentRating: strongestPlayer.rating,
        currentAge: strongestPlayer.age || 25,
        is_star: strongestPlayer.is_star,
        is_young: strongestPlayer.is_young || false
    };
}

// Calculate generational replacement bonus
function calculateGenerationalBonus(bestPosition, playerRating, playerAge) {
    // If the current player is NOT young (old player) and you're close to their rating
    if (!bestPosition.is_young && bestPosition.is_star) {
        const ratingDiff = Math.abs(playerRating - bestPosition.currentRating);
        const currentAge = bestPosition.currentAge || 25;

        // EPIC BONUS: Young prospect (<20) vs Veteran star (>32)
        if (playerAge < 20 && currentAge > 32) {
            if (ratingDiff <= 5) {
                return 25; // LEGENDARY bonus - Future star replacing legend
            } else if (ratingDiff <= 10) {
                return 18; // Very high bonus
            } else if (ratingDiff <= 15) {
                return 10; // Good bonus
            }
        }
        // YOUNG PLAYER BONUS: If you're under 20 and competing with a veteran
        else if (playerAge < 20) {
            if (ratingDiff <= 5) {
                return 20; // EPIC bonus for young prospect replacing old star
            } else if (ratingDiff <= 10) {
                return 12; // High bonus
            } else if (ratingDiff <= 15) {
                return 5; // Medium bonus
            }
        } else {
            // Regular player bonus
            if (ratingDiff <= 5) {
                return 15; // Big bonus for generational replacement
            } else if (ratingDiff <= 10) {
                return 8; // Medium bonus
            } else if (ratingDiff <= 15) {
                return 3; // Small bonus
            }
        }
    }

    return 0; // No bonus
}

// Map league IDs to team league
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

// Show EPIC loading screen
function showEpicLoadingScreen() {
    hideAllScreens();
    document.getElementById('loadingScreen').classList.add('active');
}

// Formation position mapping - Maps formation numbers to positions
const FORMATION_POSITIONS = {
    // Classic formations
    '4_3_3': ['GK', 'CB', 'CB', 'CB', 'CB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '4_2_3_1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'CAM', 'CAM', 'CAM', 'ST'],
    '3_5_2': ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'CAM', 'CAM', 'LW', 'RW', 'ST', 'ST'],
    '5_3_2': ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'LW', 'RW'],
    '4_4_2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],

    // Custom formations (will be generated dynamically)
};

// Get positions for a formation
function getFormationPositions(formationId) {
    // If it's a custom formation, generate positions dynamically
    if (formationId.includes('_')) {
        const parts = formationId.split('_').map(Number);
        const positions = [];

        // Start with GK
        positions.push('GK');

        // Defense (first number)
        for (let i = 0; i < parts[0]; i++) {
            if (parts[0] === 5) {
                // 5 defenders: CB, CB, CB, LB, RB
                if (i === 0) positions.push('CB');
                else if (i === 1) positions.push('CB');
                else if (i === 2) positions.push('CB');
                else if (i === 3) positions.push('LB');
                else positions.push('RB');
            } else if (parts[0] === 4) {
                // 4 defenders: LB, CB, CB, RB or CB, CB, CB, CB
                if (i === 0) positions.push('LB');
                else if (i === 1) positions.push('CB');
                else if (i === 2) positions.push('CB');
                else positions.push('RB');
            } else if (parts[0] === 3) {
                // 3 defenders: CB, CB, CB
                positions.push('CB');
            }
        }

        // Midfield (second number, or second + third for 4 numbers)
        if (parts.length === 4) {
            // 4-number format (e.g., 4-1-2-1): DM, CM, CM, AM
            const dm = parts[1];
            const cm = parts[2];
            const am = parts[3];

            for (let i = 0; i < dm; i++) positions.push('CDM');
            for (let i = 0; i < cm; i++) positions.push('CM');
            for (let i = 0; i < am; i++) positions.push('CAM');
        } else {
            // 3-number format: all midfielders
            const midCount = parts[1];
            for (let i = 0; i < midCount; i++) {
                if (midCount >= 5) {
                    // Many midfielders - mix of CM, CAM, CDM
                    if (i === 0) positions.push('CDM');
                    else if (i === midCount - 1) positions.push('CAM');
                    else positions.push('CM');
                } else if (midCount === 3) {
                    positions.push('CM');
                } else if (midCount === 2) {
                    positions.push('CDM');
                    positions.push('CAM');
                } else {
                    positions.push('CM');
                }
            }
        }

        // Attack (last number)
        for (let i = 0; i < parts[parts.length - 1]; i++) {
            if (parts[parts.length - 1] === 2) {
                positions.push(i === 0 ? 'LW' : 'RW');
            } else if (parts[parts.length - 1] === 1) {
                positions.push('ST');
            } else if (parts[parts.length - 1] === 3) {
                positions.push(i === 0 ? 'LW' : (i === 1 ? 'ST' : 'RW'));
            }
        }

        return positions;
    }

    // Return predefined positions
    return FORMATION_POSITIONS[formationId] || FORMATION_POSITIONS['4_4_2'];
}

// Main analysis function
async function analyzeResults() {
    // Show EPIC loading screen immediately
    showEpicLoadingScreen();

    // Ensure database is loaded (wait if still loading in background)
    if (!fc26Database) {
        console.log('⏳ Waiting for database...');
        await loadDatabase();
    }

    const playerRating = parseInt(document.getElementById('playerRating').value) || 80;
    const playerAge = answers.age || 21; // Get player age from answers

    // Build user style preferences - counter_attack is now independent
    const userStyle = {
        possession: answers.possession,
        counter_attack: answers.counter_attack,  // No longer inverse
        wing_play: answers.wing_play,
        through_balls: 50 + (answers.possession - 50) * 0.5, // Derived from possession
        aerial_balls: answers.aerial_balls,
        high_press: answers.high_press
    };

    // Filter teams by selected leagues
    let selectedLeagues = answers.league;
    if (selectedLeagues.length === 0) {
        // If no league selected, use all
        selectedLeagues = ['la_liga', 'premier_league', 'bundesliga', 'serie_a', 'ligue_1'];
    }

    // Analyze each team
    const teamAnalysis = fc26Database.teams
        .filter(team => {
            const teamLeagueId = getLeagueId(team.league);
            return selectedLeagues.includes(teamLeagueId);
        })
        .map(team => {
            // Calculate style compatibility
            const styleMatch = calculateStyleCompatibility(userStyle, team.style);

            // Find competition in user's position (or best position if not specified)
            const bestPosition = answers.position
                ? getPositionCompetition(playerRating, team.squad_gaps, answers.position)
                : findBestPosition(playerRating, team.squad_gaps);

            // Determine if player would start
            const wouldStart = playerRating > bestPosition.currentRating;

            // Check if position is too difficult (7+ point gap)
            const tooDifficult = isPositionTooDifficult(playerRating, bestPosition.currentRating);

            // Calculate growth potential
            const growthPotential = calculateGrowthPotential(
                playerRating,
                team.overall_level,
                wouldStart
            );

            // Calculate generational replacement bonus
            const generationalBonus = calculateGenerationalBonus(bestPosition, playerRating, playerAge);

            // Calculate difficulty penalty
            const difficultyPenalty = tooDifficult ? -25 : 0;

            // Calculate final score
            // Weight: 40% style match, 35% starting opportunity, 25% growth potential + bonuses
            let startingBonus;
            if (tooDifficult) {
                startingBonus = 5; // Very low bonus for too difficult positions
            } else if (wouldStart) {
                startingBonus = 35; // High bonus for starting
            } else if (playerRating >= bestPosition.currentRating - 2) {
                startingBonus = 20; // Medium bonus for being close
            } else {
                startingBonus = 10; // Low bonus
            }

            const finalScore = (styleMatch * 0.40) + startingBonus + (growthPotential * 0.25) + (generationalBonus * 0.15) + (difficultyPenalty * 0.30);

            return {
                team: team,
                styleMatch: styleMatch,
                bestPosition: bestPosition,
                wouldStart: wouldStart,
                ratingDiff: playerRating - bestPosition.currentRating,
                growthPotential: growthPotential,
                generationalBonus: generationalBonus,
                tooDifficult: tooDifficult,
                finalScore: Math.max(0, finalScore) // Ensure score doesn't go negative
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore);

    // Get top 3 results
    const top3 = teamAnalysis.slice(0, 3);

    // Display results
    displayResults(top3, playerRating, playerAge, userStyle);
}

// Display results on screen
function displayResults(results, playerRating, playerAge, userStyle) {
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

        // Determine if elite team (rating > 82)
        const isElite = team.overall_level > 82;
        const eliteClass = isElite ? 'elite-team' : '';

        // League logo with fallback emoji
        const leagueLogoHtml = team.league_logo
            ? `<img src="${team.league_logo}" alt="${team.league}" class="league-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none">${team.league_flag}</span>`
            : `<span>${team.league_flag}</span>`;

        // Team logo with fallback
        const teamLogoHtml = team.team_logo
            ? `<img src="${team.team_logo}" alt="${team.name}" class="team-logo-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDQ5ZjM3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNMTIgMnwxMCAxMC0xMCAxME0yIDEybDEwIDEwIDEwLTEwIi8+PC9zdmc+'">`
            : '';

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

                <div class="result-details">
                    <div class="result-detail-row">
                        <span class="result-detail-label">Posición ideal:</span>
                        <span class="result-detail-value">${positionLabels[result.bestPosition.position] || result.bestPosition.position}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Jugador actual:</span>
                        <span class="result-detail-value">${result.bestPosition.currentPlayer} (${result.bestPosition.currentRating})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">👤 Tu competencia directa:</span>
                        <span class="result-detail-value">${result.bestPosition.currentPlayer}, ${result.bestPosition.currentAge || '?'} años</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Tu media:</span>
                        <span class="result-detail-value">${playerRating} (${ratingDiffText})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Tu edad:</span>
                        <span class="result-detail-value">${playerAge} años</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Estado:</span>
                        <span class="result-detail-value">${statusText}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Estilo de juego:</span>
                        <span class="result-detail-value">${result.styleMatch.toFixed(0)}% compatible</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Potencial de crecimiento:</span>
                        <span class="result-detail-value">+${result.growthPotential.toFixed(1)} puntos</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Formación del equipo:</span>
                        <span class="result-detail-value">${team.formation}</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    document.getElementById('resultsScreen').classList.add('active');

    // Get AI feedback and display it
    displayAIFeedback(results);
}

// ============================================
// GEMINI AI INTEGRATION
// ============================================

// Gemini API configuration
// IMPORTANT: In production (Netlify), the API key is stored in environment variables
// and accessed securely via Netlify Functions. No key is exposed in client code.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Detect if running on Netlify
const isNetlify = window.location.hostname.includes('netlify.app') ||
                  window.location.hostname === 'localhost'; // Also true for Netlify dev

// Export for test API function
function getGeminiAPIKey() {
    // Return empty - key is now in Netlify environment variables
    return '';
}

function getGeminiAPIURL() {
    return GEMINI_API_URL;
}

/**
 * Get AI feedback from Gemini based on user's style description
 * @param {Array} top3Results - Top 3 team analysis results
 * @returns {Promise<string>} AI analysis text
 */
async function getAIFeedback(top3Results) {
    // Get user's style description from textarea
    const userStyleText = document.getElementById('geminiStyle')?.value || '';

    // If no user input, return simulated analysis immediately
    if (!userStyleText.trim()) {
        console.log('ℹ️  No user style description provided, using simulated analysis');
        return generateSimulatedAnalysis(top3Results, userStyleText);
    }

    // Try to call Gemini API with 15-second timeout
    try {
        console.log('🤖 Calling Gemini API...');

        const prompt = buildGeminiPrompt(top3Results, userStyleText);
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        let response;
        let useNetlifyFunction = false;

        // Method 1: Use Netlify Function (secure, production)
        if (isNetlify) {
            try {
                console.log('🔐 Using Netlify Function for secure Gemini API call');
                useNetlifyFunction = true;

                // Create AbortController for timeout (15 seconds)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    console.warn('⏰ Gemini API timeout after 15 seconds');
                }, 15000);

                response = await fetch('/.netlify/functions/gemini-proxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

            } catch (netlifyError) {
                console.warn('⚠️  Netlify Function failed, falling back to direct call:', netlifyError.message);
                useNetlifyFunction = false;
            }
        }

        // Method 2: Direct call (for local development without Netlify)
        if (!useNetlifyFunction && !isNetlify) {
            console.log('🔓 Using direct Gemini API call (development mode)');
            const API_KEY = prompt('Enter your Gemini API key (or leave empty for simulated analysis):\n\nGet your key from: https://aistudio.google.com/app/apikey');

            if (!API_KEY || API_KEY.trim().length < 20) {
                console.log('ℹ️  No API key provided, using simulated analysis');
                return generateSimulatedAnalysis(top3Results, userStyleText);
            }

            // Create AbortController for timeout (15 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn('⏰ Gemini API timeout after 15 seconds');
            }, 15000);

            response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
        }

        // Check response
        if (!response) {
            throw new Error('No response received');
        }

        console.log(`📡 Gemini response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Gemini API error (${response.status}):`, errorText);

            // Specific error handling
            if (response.status === 400) {
                console.warn('⚠️  Bad request - check prompt format');
            } else if (response.status === 401 || response.status === 403) {
                console.warn('⚠️  Authentication failed - Check GEMINI_API_KEY in Netlify environment variables');
            } else if (response.status === 429) {
                console.warn('⚠️  Rate limit exceeded - too many requests');
            } else if (response.status === 500) {
                console.warn('⚠️  Netlify Function error - Check server logs');
            }

            return generateSimulatedAnalysis(top3Results, userStyleText);
        }

        const data = await response.json();
        console.log('✅ Gemini API response received');

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            console.warn('⚠️  Gemini response format unexpected:', data);
            return generateSimulatedAnalysis(top3Results, userStyleText);
        }

        console.log(`✅ AI analysis generated successfully (${useNetlifyFunction ? 'via Netlify Function' : 'direct'})`);
        return aiResponse;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⏰ Gemini API timed out after 15 seconds, using simulated analysis');
        } else {
            console.error('❌ Gemini API error:', error.message);
        }
        return generateSimulatedAnalysis(top3Results, userStyleText);
    }
}

/**
 * Build prompt for Gemini API
 */
function buildGeminiPrompt(top3Results, userStyleText) {
    let teamDescriptions = top3Results.map((result, index) => {
        // Get play style metrics for deeper analysis
        const teamSpeed = (result.team.style.wing_play + result.team.style.counter_attack) / 2;
        const teamPhysical = result.team.style.aerial_balls;
        const teamPossession = result.team.style.possession;

        // Kaggle stats if available
        const kaggleStats = result.team.kaggle_stats;
        const hasKaggleData = kaggleStats && kaggleStats.avg_speed > 0;

        return `${index + 1}. ${result.team.name} (${result.team.league})
           - Score: ${result.finalScore.toFixed(0)}/100
           - Compatibilidad de estilo: ${result.styleMatch.toFixed(0)}%
           ${hasKaggleData ? `- 📊 DATOS KAGGLE:
             • Aceleración del equipo: ${kaggleStats.acceleration}/99
             • Velocidad de sprint: ${kaggleStats.sprint_speed}/99
             • Velocidad promedio: ${kaggleStats.avg_speed.toFixed(0)}/99` : ''}
           - Velocidad táctica: ${teamSpeed.toFixed(0)}/100 (juego por bandas + contraataque)
           - Fuerza física: ${teamPhysical}/100 (juego aéreo)
           - Posesión: ${teamPossession}/100
           - Tu posición: ${result.bestPosition.position}
           - Tu competencia directa: ${result.bestPosition.currentPlayer}
             • Rating: ${result.bestPosition.currentRating} | Edad: ${result.bestPosition.currentAge} años
             ${result.bestPosition.is_star ? '• ⭐ Es jugador estrella del equipo' : ''}
           - Tu situación: ${result.wouldStart ? '🟢 Serías TITULAR' : result.ratingDiff >= -3 ? '🟡 Competiría de cerca' : '🔴 Serías suplente'}
           ${result.generationalBonus > 0 ? `- ✨ BONO relevo generacional: +${result.generationalBonus} puntos (tienes ${answers.age || 21} años vs ${result.bestPosition.currentAge} años del titular)` : ''}
           - Potencial de crecimiento: +${result.growthPotential.toFixed(1)} puntos
           - Formación típica: ${result.team.formation}`;
    }).join('\n\n');

    const playerAge = answers.age || 21;
    const playerRating = document.getElementById('playerRating')?.value || 80;

    return `Eres un experto analista de EA Sports FC 26, especializado en encontrar el equipo perfecto para cada perfil de jugador.

📊 PERFIL DEL JUGADOR:
- Rating: ${playerRating}
- Edad: ${playerAge} años
- Estilo de juego descrito: "${userStyleText}"

📋 Análisis solicitado:
El jugador busca un equipo donde pueda desarrollarse. Compara su estilo de juego descrito con las estadísticas reales de velocidad (aceleración y sprint), fuerza física y estilo de posesión de estos equipos.

${teamDescriptions}

🎯 Tu tarea:
Analiza específicamente:
1. Si el estilo descrito coincide con la VELOCIDAD REAL del equipo (datos de aceleración y sprint)
2. Si su edad (${playerAge}) vs la edad del titular crea una oportunidad de relevo generacional
3. Cuál de los 3 equipos le permitirá jugar más minutos basado en su descripción de estilo

Responde en español, máximo 200 palabras. Usa emojis y sé muy específico sobre por qué estos equipos funcionan con su estilo descrito.`;
}

/**
 * Generate simulated AI analysis (placeholder)
 */
function generateSimulatedAnalysis(top3Results, userStyleText) {
    const hasUserInput = userStyleText.trim().length > 0;
    const stylePreview = hasUserInput
        ? `"${userStyleText.substring(0, 50)}${userStyleText.length > 50 ? '...' : ''}"`
        : 'sin descripción de estilo';

    let analysis = `🤖 **Análisis de Gemini AI**

Estas son mis recomendaciones basadas en tu perfil:

`;

    top3Results.forEach((result, index) => {
        const reasons = [];
        const diff = result.ratingDiff;

        // Build personalized reasons
        if (result.wouldStart) {
            reasons.push('serías titular inmediatamente');
        } else if (diff >= -3) {
            reasons.push('competirías de cerca por el puesto');
        }

        if (result.styleMatch >= 75) {
            reasons.push('tu estilo coincide perfectamente');
        } else if (result.styleMatch >= 60) {
            reasons.push('buen ajuste de estilo');
        }

        if (result.generationalBonus > 0) {
            reasons.push('gran oportunidad de relevo generacional');
        }

        if (result.growthPotential > 8) {
            reasons.push('alto potencial de desarrollo');
        }

        const reasonText = reasons.length > 0
            ? reasons.slice(0, 2).join(', ')
            : 'equipo competitivo';

        analysis += `${index + 1}. **${result.team.name}** (${result.team.league})
   - Score: ${result.finalScore.toFixed(0)}/100
   - ¿Por qué? ${reasonText}
   - Competencia: ${result.bestPosition.currentPlayer} (${result.bestPosition.currentRating}, ${result.bestPosition.currentAge} años)

`;
    });

    if (hasUserInput) {
        analysis += `📝 Basado en tu estilo: ${stylePreview}`;
    } else {
        analysis += `💡 *Tip: Describe tu estilo de juego en la pantalla de inicio para obtener análisis más personalizados de Gemini*`;
    }

    return analysis;
}

/**
 * Display AI feedback on results screen
 */
async function displayAIFeedback(top3Results) {
    const container = document.getElementById('resultsContainer');

    // Create AI feedback section
    const aiSection = document.createElement('div');
    aiSection.className = 'ai-feedback-section';
    aiSection.style.cssText = `
        background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 25, 45, 0.95) 100%);
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 20px;
        padding: 25px;
        margin-top: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(102, 126, 234, 0.1);
        animation: slideIn 0.6s ease;
    `;

    // Show loading message first
    aiSection.innerHTML = `
        <div style="text-align: center; color: #667eea;">
            <div style="font-size: 2rem; margin-bottom: 10px;">🤖</div>
            <div style="font-weight: 600;">Gemini está analizando tu perfil...</div>
        </div>
    `;

    container.appendChild(aiSection);

    // Get AI feedback (async)
    const feedback = await getAIFeedback(top3Results);

    // Update with actual feedback
    aiSection.innerHTML = `
        <div style="white-space: pre-line; line-height: 1.6; color: #a0a5b9;">
            ${feedback}
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(102, 126, 234, 0.2); font-size: 0.8rem; color: #667eea; text-align: center; font-weight: 600;">
            ⚡ Powered by Gemini AI | Integración activa
        </div>
    `;
}
