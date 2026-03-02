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
    const ranks = ['TOP 1', 'TOP 2', 'TOP 3'];
    let renderErrors = 0;

    // Build poster cards
    results.forEach((result, index) => {
        try {
            const posterCard = createPosterCard(result, playerRating, ranks[index] || `TOP ${index + 1}`, index);
            posterContainer.appendChild(posterCard);
        } catch (err) {
            renderErrors++;
            console.error('❌ Error rendering poster card:', result?.team?.name, err);

            // Fallback card so UI never goes blank
            const fallback = document.createElement('div');
            fallback.className = 'poster-card';
            fallback.innerHTML = `
                <div class="poster-background"></div>
                <div class="poster-background-blur"></div>
                <div class="poster-neon-border"></div>
                <div class="poster-rank-bar rank-${index + 1}">
                    <span class="rank-left">RECOMENDACIÓN</span>
                    <span class="rank-right">TOP ${index + 1}</span>
                </div>
                <div class="poster-content">
                    <div class="poster-column poster-center">
                        <div class="poster-rank-badge"><span class="rank-kicker">TOP</span><span class="rank-num">${index + 1}</span></div>
                        <h2 class="poster-team-name">${result?.team?.name || 'Equipo'}</h2>
                        <div class="poster-league-badge wax-seal"><span>${result?.team?.league || ''}</span></div>
                        <div class="poster-compatibility-score">
                            <div class="poster-score-number">--</div>
                            <div class="poster-score-label">ERROR DE RENDER</div>
                        </div>
                        <div style="margin-top: 10px; color: rgba(255,255,255,0.75); font-size: 0.85rem; text-align:center;">
                            Revisa consola para detalles.
                        </div>
                    </div>
                </div>
            `;
            posterContainer.appendChild(fallback);
        }

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

    // Show a small diagnostic note if any card failed to render
    if (renderErrors > 0) {
        const header = container.querySelector('.poster-header');
        if (header) {
            const note = document.createElement('div');
            note.style.cssText = 'margin-top:10px;color:rgba(255,255,255,0.65);font-size:0.85rem;';
            note.textContent = `⚠️ ${renderErrors} carta(s) no se pudieron renderizar.`;
            header.appendChild(note);
        }
    }

    // If less than 3 results, explain why (usually: only teams with local SVG logos allowed)
    if (results.length < 3) {
        const header = container.querySelector('.poster-header');
        if (header) {
            const note = document.createElement('div');
            note.style.cssText = 'margin-top:10px;color:rgba(255,255,255,0.7);font-size:0.9rem;line-height:1.4;';
            note.textContent = `ℹ️ Solo se muestran equipos con escudo local (SVG). Encontré ${results.length} opción(es) con logo disponible.`;
            header.appendChild(note);
        }
    }

    document.getElementById('resultsScreen').classList.add('active');

    // Initialize animations and swipe detection
    initializePosterAnimations(results);
    initializeSwipeDetection(posterContainer, paginationContainer);

    // Hydrate venue meta (city/stadium/temp) using local venues.json + Open-Meteo.
    // NOTE: Background is now club-colored + crest watermark (more reliable than stadium photos).
    hydrateVenueAndBackground(results, posterContainer);
}

const venueCache = new Map();

async function wikidataSearchId(query) {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.search?.[0]?.id || null;
}

async function wikidataGetVenueCityStadium(qid) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(qid)}&props=claims&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const ent = data?.entities?.[qid];
    const claims = ent?.claims || {};

    const getFirstQ = (prop) => {
        const arr = claims?.[prop];
        const v = arr?.[0]?.mainsnak?.datavalue?.value;
        return v?.['numeric-id'] ? `Q${v['numeric-id']}` : null;
    };

    const venueQ = getFirstQ('P115'); // home venue (stadium)
    const cityQ = getFirstQ('P159');  // headquarters location (city)

    const labelsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${[venueQ, cityQ].filter(Boolean).join('|')}&props=labels&languages=es|en&format=json&origin=*`;
    const labelsRes = await fetch(labelsUrl);
    const labelsData = labelsRes.ok ? await labelsRes.json() : null;

    const getLabel = (qid2) => {
        if (!qid2 || !labelsData?.entities?.[qid2]) return '';
        const e = labelsData.entities[qid2];
        return e.labels?.es?.value || e.labels?.en?.value || '';
    };

    return {
        stadium: getLabel(venueQ),
        city: getLabel(cityQ)
    };
}

async function getCurrentTempForCity(city) {
    if (!city) return '';
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) return '';
        const geo = await geoRes.json();
        const hit = geo?.results?.[0];
        if (!hit?.latitude || !hit?.longitude) return '';

        const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m&timezone=auto`;
        const wxRes = await fetch(wxUrl);
        if (!wxRes.ok) return '';
        const wx = await wxRes.json();
        const t = wx?.current?.temperature_2m;
        if (!Number.isFinite(t)) return '';
        return `${Math.round(t)}°C ahora`;
    } catch {
        return '';
    }
}

async function getCurrentTempForCoords(lat, lon) {
    try {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '';
        const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`;
        const wxRes = await fetch(wxUrl);
        if (!wxRes.ok) return '';
        const wx = await wxRes.json();
        const t = wx?.current?.temperature_2m;
        if (!Number.isFinite(t)) return '';
        return `${Math.round(t)}°C ahora`;
    } catch {
        return '';
    }
}

async function hydrateVenueAndBackground(results, containerEl) {
    // Only 3 calls typically; cache per session.
    const cards = containerEl.querySelectorAll('.poster-card');
    await Promise.all(results.map(async (r, idx) => {
        const team = r.team;
        const card = cards[idx];
        if (!team || !card) return;

        const key = `${team.name}|${team.league}`;
        if (!venueCache.has(key)) {
            venueCache.set(key, (async () => {
                // Prefer local venues.json attached metadata (should cover all 96 teams)
                let meta = {
                    city: r.venueMeta?.city || '',
                    stadium: r.venueMeta?.stadium || '',
                    weather: r.venueMeta?.weather || '',
                    lat: r.venueMeta?.lat ?? null,
                    lon: r.venueMeta?.lon ?? null
                };

                // If something is missing, try Wikidata as a last-resort (only for this card)
                if (!meta.city || !meta.stadium) {
                    const qid = await wikidataSearchId(team.name);
                    if (qid) {
                        const base = await wikidataGetVenueCityStadium(qid);
                        meta.city = meta.city || base.city || '';
                        meta.stadium = meta.stadium || base.stadium || '';
                    }
                }

                // Weather: prefer coords (fast), else city geocoding
                const temp = await getCurrentTempForCoords(meta.lat, meta.lon) || await getCurrentTempForCity(meta.city);
                meta.weather = temp || meta.weather || '';
                return meta;
            })());
        }

        const meta = await venueCache.get(key);
        const cityEl = card.querySelector('[data-venue-city]');
        const wxEl = card.querySelector('[data-venue-weather]');
        const stadiumEl = card.querySelector('[data-venue-stadium]');
        if (cityEl) cityEl.textContent = meta.city || '';
        if (wxEl) wxEl.textContent = meta.weather || '';
        if (stadiumEl) stadiumEl.textContent = meta.stadium || '';

        // Background is handled via crest watermark + club gradients (no external images needed).
    }));
}

/**
 * Create a horizontal poster card for a team
 */
function createPosterCard(result, playerRating, medal, index) {
    const team = result.team;
    const teamColor = getTeamColorFromTactics(team.name);
    const teamColors = getTeamColors(team.name);
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
    let managerAdvice = getManagerAdvice(team, result.tacticalMatch);
    if (result.hasEliteCompetition) {
        managerAdvice = 'Tendrías competencia de élite, serías suplente. Gánate el puesto en entrenamientos y minutos de rotación.';
    }
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
    // World-class highlight (golden border)
    const leagueId = getLeagueId(team.league);
    const worldClass = (team.overall_level >= 88) || (leagueId && isTop4Team(team, leagueId));

    card.className = 'poster-card camera-flash' + (worldClass ? ' world-class' : '');
    card.dataset.index = index;

    // Choose a strong accent color for glow/background (avoid pure white accents)
    const normalizeHex = (hex) => {
        if (!hex) return null;
        const h = hex.trim();
        if (!h.startsWith('#')) return null;
        if (h.length === 7) return h;
        return null;
    };
    const hexToRgb = (hex) => {
        const h = hex.replace('#', '');
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16)
        };
    };
    const luminance = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        // sRGB relative luminance approximation
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };
    const toRgba = (hex, a) => {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const primaryHex = normalizeHex(teamColors.primary) || normalizeHex(teamColor) || '#667eea';
    let secondaryHex = normalizeHex(teamColors.secondary) || '#764ba2';

    // Deterministic accent fallback (for black/white clubs like Fulham where secondary is pure black)
    const hashHue = (s) => {
        const str = (s || '').toString();
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
        return h % 360;
    };
    const hslToHex = (H, S, L) => {
        S /= 100; L /= 100;
        const k = n => (n + H / 30) % 12;
        const a = S * Math.min(L, 1 - L);
        const f = n => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
        return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    };
    const fallbackAccent = hslToHex(hashHue(team.name), 78, 52);

    const lumP = luminance(primaryHex);
    const lumS = luminance(secondaryHex);

    // Pick an accent that keeps typography readable (never pure black as accent)
    let accentHex = primaryHex;
    if (lumP > 0.92) {
        // Primary is white-ish; use secondary only if it's not too dark
        accentHex = lumS < 0.14 ? fallbackAccent : secondaryHex;
    } else if (lumP < 0.10 && lumS < 0.10) {
        // Both dark -> use fallback
        accentHex = fallbackAccent;
    }

    // If secondary is also too close to black/white, replace secondary for background variety
    if (lumS < 0.08 || lumS > 0.95) {
        secondaryHex = hslToHex((hashHue(team.name) + 48) % 360, 74, 46);
    }
    const glowRgba = teamColors.glow || toRgba(accentHex, 0.55);

    // Set CSS variables for team colors - NEW ATMOSPHERIC SYSTEM
    card.style.setProperty('--team-primary', accentHex);
    card.style.setProperty('--team-glow', glowRgba);
    card.style.setProperty('--team-secondary', secondaryHex);
    card.style.setProperty('--team-color', accentHex);

    // NEW: Team accent color system for atmospheric backgrounds
    card.style.setProperty('--team-accent-color', accentHex);
    card.style.setProperty('--team-accent-color-bright', secondaryHex);
    card.style.setProperty('--team-accent-color-glow', glowRgba);
    card.style.setProperty('--team-accent-color-dark', darkenColor(accentHex, 0.3));
    card.style.setProperty('--team-accent-color-faded', toRgba(accentHex, 0.14)); // ~14% opacity
    card.style.setProperty('--crest-bg', teamLogoPath ? `url("${teamLogoPath}")` : 'none');
    // Stronger, club-driven background palette (keeps legibility via overlay in CSS)
    card.style.setProperty('--club-grad-a', toRgba(accentHex, 0.58));
    card.style.setProperty('--club-grad-b', toRgba(secondaryHex, 0.48));
    card.style.setProperty('--club-deep', toRgba(darkenColor(accentHex, 0.48), 0.80));

    // Watermark tuning (must remain subtle per spec: 5%–10%)
    const accentLum = luminance(accentHex);
    const wmOpacity = accentLum < 0.22 ? 0.10 : 0.08;
    const wmFilter = accentLum < 0.22
        ? 'invert(1) grayscale(100%) contrast(1.25) brightness(1.55) blur(1.2px)'
        : 'grayscale(100%) contrast(1.25) brightness(1.55) blur(1.2px)';
    card.style.setProperty('--watermark-opacity', wmOpacity.toString());
    card.style.setProperty('--watermark-filter', wmFilter);

    const rankNum = index + 1;
    card.innerHTML = `
        <!-- Camera Flash Effect -->
        <div class="camera-flash-overlay"></div>

        <!-- Background Layers -->
        <div class="poster-background"></div>
        <div class="poster-background-blur"></div>

        <!-- Neon Glow Border -->
        <div class="poster-neon-border"></div>

        <!-- Rank Bar -->
        <div class="poster-rank-bar rank-${rankNum}">
            <span class="rank-left">RECOMENDACIÓN</span>
            <span class="rank-right">TOP ${rankNum}</span>
        </div>

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
                    <span class="poster-city" data-venue-city>${result?.venueMeta?.city || STADIUM_ATMOSPHERE[team.name.toLowerCase().trim()]?.city || ''}</span>
                    <span class="poster-stadium" data-venue-stadium>${result?.venueMeta?.stadium || ''}</span>
                    <span class="poster-weather" data-venue-weather>${result?.venueMeta?.weather || STADIUM_ATMOSPHERE[team.name.toLowerCase().trim()]?.weather || ''}</span>
                </div>
            </div>

            <!-- CENTER COLUMN: Club Info -->
            <div class="poster-column poster-center">
                <div class="poster-team-logo">
                    ${teamLogoPath ? `<img src="${teamLogoPath}" alt="${team.name}">` : `<div class="team-logo-circular">${teamInitials}</div>`}
                </div>
                <h2 class="poster-team-name">${team.name}</h2>
                <div class="poster-league-badge wax-seal">
                    <span>${team.league}</span>
                </div>

                <div class="poster-market-row">
                    <span class="market-pill role">${result.role || 'Rotación'}</span>
                    <span class="market-pill value">${result.marketValue || '€--'}</span>
                </div>

                <div class="poster-fit-row">
                    <span class="fit-pill">FIT ATRIBUTOS: <strong>${Math.round(result.attributeFit ?? 0)}%</strong></span>
                    ${Array.isArray(result.attributeWorst) && result.attributeWorst.length ? `<span class="fit-pill subtle">A mejorar: ${result.attributeWorst.slice(0,2).join(' / ')}</span>` : ''}
                </div>

                <div class="poster-compatibility-score">
                    <div class="poster-score-number" data-score-target="${(result.compatibilityPercent ?? result.finalScore).toFixed(0)}">0</div>
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
    // Animate compatibility scores (by element, not by value)
    const scoreEls = document.querySelectorAll('.poster-score-number[data-score-target]');
    scoreEls.forEach((el, index) => {
        const target = parseInt(el.dataset.scoreTarget || '0', 10);
        setTimeout(() => {
            if (Number.isFinite(target)) {
                animateCounter(el, target);
            }
        }, index * 200 + 450);
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
