/**
 * POSTER CARDS SYSTEM
 * Horizontal landscape poster cards with scroll snap
 * Creates cartas de colección experience for Top 3 teams
 */

// Override the displayResults function with poster card design
function displayResults(results, playerRating, hasLowCompatibility = false) {
    console.log(`🎯 Displaying ${results.length} HORIZONTAL POSTER CARDS for player rating ${playerRating}`);

    hideAllScreens();
    document.getElementById('resultPlayerRating').textContent = playerRating;

    const container = document.getElementById('resultsContainer');

    // Create horizontal poster cards container with scroll snap
    container.innerHTML = `
        <div class="poster-header">
            <h1 class="poster-title">${hasLowCompatibility ? '💡 TU ESTILO ES ÚNICO' : '⚽ ¡FICHAJE CONFIRMADO!'}</h1>
            <p class="poster-subtitle">${hasLowCompatibility ? 'Estos son los clubes donde mejor podrías adaptarte' : 'Top 3 equipos compatibles con tu estilo de juego'}</p>
        </div>

        <!-- Mobile Navigation Arrows -->
        <div class="poster-nav-arrows" id="posterNavArrows">
            <div class="poster-nav-arrow" id="navArrowLeft">←</div>
            <div class="poster-nav-arrow" id="navArrowRight">→</div>
        </div>

        <div class="poster-cards-container" id="posterCardsContainer">
            <!-- Poster cards will be injected here -->
        </div>

        <div class="poster-pagination" id="paginationDots">
            <!-- Pagination dots will be injected here -->
        </div>
    `;

    const posterContainer = document.getElementById('posterCardsContainer');
    const paginationContainer = document.getElementById('paginationDots');
    const medals = ['🥇', '🥈', '🥉'];

    // Build poster cards
    results.forEach((result, index) => {
        const posterCard = createPosterCard(result, playerRating, medals[index], index);
        posterContainer.appendChild(posterCard);

        // Add pagination dot with team color
        const dot = document.createElement('div');
        dot.className = 'pagination-dot';
        dot.dataset.index = index;
        dot.style.setProperty('--dot-color', getTeamColorFromTactics(result.team.name));
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            // Navigate to this card
            const targetIndex = parseInt(dot.dataset.index);
            const cardWidth = posterContainer.firstElementChild.offsetWidth;
            posterContainer.scrollTo({
                left: targetIndex * cardWidth,
                behavior: 'smooth'
            });
        });
        paginationContainer.appendChild(dot);
    });

    document.getElementById('resultsScreen').classList.add('active');

    // Initialize animations and swipe detection
    initializePosterAnimations(results);
    initializeSwipeDetection(posterContainer, paginationContainer);
}

/**
 * Create a horizontal poster card for a team
 */
function createPosterCard(result, playerRating, medal, index) {
    const team = result.team;
    const teamColor = getTeamColorFromTactics(team.name);
    const teamColors = getTeamColors(team.name);
    const stadiumBackground = getStadiumBackground(team.name);
    const teamLogoPath = getTeamLogoPath(team.name, team.league);
    const teamInitials = team.team_initials || getTeamInitials(team.name);

    // Get tactical stats
    const userTacticalStats = {
        wing_play: answers.wing_play || 50,
        possession: answers.possession || 50,
        counter_attack: answers.counter_attack || 50,
        aerial_balls: answers.aerial_balls || 50,
        high_press: answers.high_press || 50
    };

    const teamTactics = TEAM_TACTICS_DB[team.name.toLowerCase().trim()] || team.style;
    const teamTacticalStats = {
        wing_play: teamTactics.wing_play || 50,
        possession: teamTactics.possession || 50,
        counter_attack: teamTactics.counter_attack || 50,
        aerial_balls: teamTactics.aerial_balls || 50,
        high_press: teamTactics.high_press || 50
    };

    const radarChart = createTacticalRadar(userTacticalStats, teamTacticalStats);
    const challenge = getTacticalChallenge(userTacticalStats, teamTacticalStats);
    const managerAdvice = getManagerAdvice(team, result.tacticalMatch);
    const userFormation = answers.formation || '4-3-3';
    const formationSync = checkFormationSync(userFormation, team);

    // Status badge
    let statusBadge = '';
    if (result.tooDifficult) {
        statusBadge = '<span class="poster-status-badge difficult">MUY DIFÍCIL</span>';
    } else if (result.wouldStart) {
        statusBadge = '<span class="poster-status-badge starter">¡TITULAR!</span>';
    } else {
        statusBadge = '<span class="poster-status-badge substitute">SUPLENTE</span>';
    }

    // Position label
    const positionLabels = {
        'ST': 'Delantero centro', 'LW': 'Extremo izquierdo', 'RW': 'Extremo derecho',
        'CAM': 'Mediocampista ofensivo', 'CM': 'Mediocampista central', 'CDM': 'Mediocampo defensivo',
        'LB': 'Lateral izquierdo', 'LWB': 'Carrilero izquierdo', 'RB': 'Lateral derecho',
        'RWB': 'Carrilero derecho', 'CB': 'Defensa central'
    };

    const positionLabel = positionLabels[result.bestPosition.position] || result.bestPosition.position;
    const ratingDiff = result.ratingDiff >= 0 ? `+${result.ratingDiff}` : result.ratingDiff;

    // Create card element
    const card = document.createElement('div');
    card.className = 'poster-card camera-flash';
    card.dataset.index = index;

    // Set CSS variables for team colors - NEW ATMOSPHERIC SYSTEM
    card.style.setProperty('--team-primary', teamColor);
    card.style.setProperty('--team-glow', teamColors.glow);
    card.style.setProperty('--team-secondary', teamColors.secondary);
    card.style.setProperty('--team-color', teamColor);

    // NEW: Team accent color system for atmospheric backgrounds
    card.style.setProperty('--team-accent-color', teamColor);
    card.style.setProperty('--team-accent-color-bright', teamColors.secondary || teamColor);
    card.style.setProperty('--team-accent-color-glow', teamColors.glow || `${teamColor}66`);
    card.style.setProperty('--team-accent-color-dark', darkenColor(teamColor, 0.3));
    card.style.setProperty('--team-accent-color-faded', `${teamColor}1A`); // 10% opacity

    card.innerHTML = `
        <!-- Camera Flash Effect -->
        <div class="camera-flash-overlay"></div>

        <!-- Background Layers -->
        <div class="poster-background"></div>
        <div class="poster-background-blur"></div>
        <div class="poster-crest-watermark">
            ${teamLogoPath ? `<img src="${teamLogoPath}" alt="${team.name}" class="crest-watermark">` : `<div class="crest-watermark-text">${teamInitials}</div>`}
        </div>

        <!-- Neon Glow Border -->
        <div class="poster-neon-border"></div>

        <!-- Main Content - 3 Columns -->
        <div class="poster-content">
            <!-- LEFT COLUMN: Player Info -->
            <div class="poster-column poster-left">
                <div class="poster-section-title">TU PERFIL</div>
                <div class="poster-player-info">
                    <div class="poster-stat-row">
                        <span class="poster-stat-label">⭐ Tu Media</span>
                        <span class="poster-stat-value">${playerRating}</span>
                    </div>
                    <div class="poster-stat-row">
                        <span class="poster-stat-label">📍 Posición</span>
                        <span class="poster-stat-value">${positionLabel}</span>
                    </div>
                    <div class="poster-stat-row">
                        <span class="poster-stat-label">📊 Estado</span>
                        <span class="poster-stat-value">${statusBadge}</span>
                    </div>
                    <div class="poster-stat-row">
                        <span class="poster-stat-label">⚔️ vs</span>
                        <span class="poster-stat-value">${result.bestPosition.currentPlayer}</span>
                    </div>
                    <div class="poster-stat-row">
                        <span class="poster-stat-label">📈 Diferencia</span>
                        <span class="poster-stat-value">${ratingDiff}</span>
                    </div>
                </div>
                <div class="poster-stadium-info">
                    <span class="poster-city">${STADIUM_ATMOSPHERE[team.name.toLowerCase().trim()]?.city || ''}</span>
                    <span class="poster-weather">${STADIUM_ATMOSPHERE[team.name.toLowerCase().trim()]?.weather || ''}</span>
                </div>
            </div>

            <!-- CENTER COLUMN: Club Info -->
            <div class="poster-column poster-center">
                <div class="poster-medal">${medal}</div>
                <div class="poster-team-logo">
                    ${teamLogoPath ? `<img src="${teamLogoPath}" alt="${team.name}">` : `<div class="team-logo-circular">${teamInitials}</div>`}
                </div>
                <h2 class="poster-team-name">${team.name}</h2>
                <div class="poster-league-badge wax-seal">
                    <span>${team.league}</span>
                </div>

                <div class="poster-compatibility-score">
                    <div class="poster-score-number" data-animate-score="${result.finalScore.toFixed(0)}">0</div>
                    <div class="poster-score-label">% COMPATIBILIDAD</div>
                </div>

                <div class="poster-team-rating">${team.overall_level} OVR</div>

                ${formationSync.hasSync ? `
                <div class="poster-sync-badge golden-medal">
                    <div class="medal-ribbon"></div>
                    <span>${formationSync.label}</span>
                </div>
                ` : ''}
            </div>

            <!-- RIGHT COLUMN: Tactical Info -->
            <div class="poster-column poster-right">
                <div class="poster-section-title">ANÁLISIS TÁCTICO</div>

                <!-- Radar Chart -->
                <div class="poster-radar-container">
                    ${radarChart}
                </div>

                <!-- Tactical Challenge -->
                ${challenge.diff > 15 ? `
                <div class="poster-tactical-challenge">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-content">
                        <strong>DESAFÍO TÁCTICO</strong>
                        <p>Tu ${challenge.label} necesita adaptarse</p>
                        <small>"${challenge.advice}"</small>
                    </div>
                </div>
                ` : ''}

                <!-- Manager Advice -->
                <div class="poster-manager-quote">
                    <div class="quote-icon">🗣️</div>
                    <div class="quote-content">
                        <strong>CONSEJO DEL MISTER</strong>
                        <p>"${managerAdvice}"</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Initialize poster card animations
 */
function initializePosterAnimations(results) {
    // Animate compatibility scores
    results.forEach((result, index) => {
        setTimeout(() => {
            const scoreElement = document.querySelector(`[data-animate-score="${result.finalScore.toFixed(0)}"]`);
            if (scoreElement) {
                animateCounter(scoreElement, result.finalScore);
            }
        }, index * 200 + 500);
    });
}

/**
 * Initialize swipe detection for mobile
 */
function initializeSwipeDetection(container, paginationContainer) {
    let startX = 0;
    let currentScroll = 0;

    // Touch events for mobile swipe
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentScroll = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        const diff = startX - e.touches[0].clientX;
        container.scrollLeft = currentScroll + diff;
        updatePagination(container, paginationContainer);
    }, { passive: true });

    container.addEventListener('touchend', () => {
        snapToCard(container, paginationContainer);
    });

    container.addEventListener('scroll', () => {
        updatePagination(container, paginationContainer);
    });

    // Navigation arrows (mobile only)
    const leftArrow = document.getElementById('navArrowLeft');
    const rightArrow = document.getElementById('navArrowRight');

    if (leftArrow && rightArrow) {
        leftArrow.addEventListener('click', () => {
            navigateCard(container, paginationContainer, -1);
        });

        rightArrow.addEventListener('click', () => {
            navigateCard(container, paginationContainer, 1);
        });
    }
}

/**
 * Navigate to previous/next card
 */
function navigateCard(container, paginationContainer, direction) {
    const cardWidth = container.firstElementChild.offsetWidth;
    const currentIndex = Math.round(container.scrollLeft / cardWidth);
    const targetIndex = Math.max(0, Math.min(2, currentIndex + direction));

    container.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
    });

    updatePagination(container, paginationContainer);
}

/**
 * Snap to nearest card
 */
function snapToCard(container, paginationContainer) {
    const cardWidth = container.firstElementChild.offsetWidth;
    const scrollPosition = container.scrollLeft;
    const targetIndex = Math.round(scrollPosition / cardWidth);

    container.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
    });

    updatePagination(container, paginationContainer);
}

/**
 * Update pagination dots
 */
function updatePagination(container, paginationContainer) {
    const cardWidth = container.firstElementChild.offsetWidth;
    const currentIndex = Math.round(container.scrollLeft / cardWidth);

    const dots = paginationContainer.querySelectorAll('.pagination-dot');
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Auto-snap on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const container = document.getElementById('posterCardsContainer');
        if (container) {
            container.scrollLeft = 0;
        }
    }, 100);
});

/**
 * Helper: Darken a hex color by a percentage
 * Used for creating atmospheric gradient backgrounds
 */
function darkenColor(hexColor, percent) {
    // Remove # if present
    let color = hexColor.replace('#', '');

    // Parse RGB
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Darken by percentage
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));

    // Convert back to hex
    const toHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
