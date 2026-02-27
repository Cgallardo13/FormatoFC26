// UI Module - Handles all interface interactions

// Track database loading state
let isDatabaseLoading = false;

// Initialize app - load database first
async function initApp() {
    const db = await loadDatabase();
    if (!db) {
        console.error('Failed to load database');
        // Don't show alert, just log and continue with local fallback
        console.warn('⚠️ Database load failed, will try fallback');
        return false;
    }
    console.log('✅ Database loaded:', db.teams.length, 'teams');

    // Update data source status badge
    updateDataSourceStatus();

    return true;
}

// Start the interview - NON BLOCKING
async function startInterview(event) {
    // Prevent double-click and event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const playerRating = document.getElementById('playerRating').value;

    if (!playerRating || playerRating < 50 || playerRating > 99) {
        alert('Por favor ingresa una media válida (50-99)');
        return;
    }

    // IMMEDIATELY show questions - don't wait for database
    hideAllScreens();
    document.getElementById('questionsScreen').classList.add('active');

    // Initialize questions
    initQuestions();

    // Load database in background if not loaded
    if (!fc26Database && !isDatabaseLoading) {
        isDatabaseLoading = true;

        // Show "Synchronizing..." message immediately
        updateDataSourceStatus();

        console.log('🔄 Loading database in background...');

        // Load async without blocking
        initApp().finally(() => {
            isDatabaseLoading = false;
            updateDataSourceStatus(); // Update badge with final status
            console.log('✅ Background load complete');
        });
    }
}

// Restart the analysis
function restart(event) {
    // Prevent double-click and event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Reset all answers
    answers = {
        league: [],
        formation: null,
        position: null,
        wing_play: 50,
        possession: 50,
        counter_attack: 50,
        aerial_balls: 50,
        high_press: 50,
        age: 21
    };

    currentQuestionIndex = 0;

    // Show welcome screen
    hideAllScreens();
    document.getElementById('welcomeScreen').classList.add('active');

    // Reset player rating input
    document.getElementById('playerRating').value = 80;
}

// Helper function to hide all screens
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Add CSS styles for formation options (not included in main CSS)
const style = document.createElement('style');
style.textContent = `
    .formation-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 20px;
    }

    .formation-option {
        background: rgba(30, 35, 55, 0.6);
        border: 2px solid rgba(212, 175, 55, 0.2);
        border-radius: 15px;
        padding: 18px;
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(5px);
    }

    .formation-option:hover {
        border-color: #d4af37;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }

    .formation-option.selected {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%);
        border-color: #d4af37;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1);
    }

    .formation-name {
        font-family: 'Rajdhani', sans-serif;
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #ffffff;
    }

    .formation-desc {
        font-size: 0.85rem;
        opacity: 0.8;
        color: #a0a5b9;
    }
`;
document.head.appendChild(style);

// Prevent scrolling on mobile (iOS fix)
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('input[type="range"]')) return;
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Add swipe gesture support for questions (mobile)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    if (!document.getElementById('questionsScreen').classList.contains('active')) return;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next question
            nextQuestion();
        } else {
            // Swipe right - previous question
            prevQuestion();
        }
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (document.getElementById('questionsScreen').classList.contains('active')) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            nextQuestion();
        } else if (e.key === 'ArrowLeft') {
            prevQuestion();
        }
    }
});

// Console welcome message
console.log('%c⚽ FC26 Team Finder', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cEncuentra tu equipo perfecto en FC26', 'font-size: 12px; color: #764ba2;');
console.log('%cHecho con ❤️ para los gamers', 'font-size: 10px; color: #999;');

// Update data source status badge
function updateDataSourceStatus() {
    const status = getDataSourceStatus();
    const badge = document.getElementById('dataSourceStatus');

    if (badge) {
        badge.textContent = status.label;
        badge.style.display = 'block';
        badge.className = 'status-badge ' + status.source;
    }
}

// Show data source info
function showDataSourceInfo() {
    const status = getDataSourceStatus();

    let message = '';
    if (status.isAPI) {
        message = '✅ Datos cargados desde la API oficial\n\nLos datos están actualizados en tiempo real desde:\nhttps://api.msmc.cc/eafc/';
    } else if (status.isLocal) {
        message = '⚠️ Usando datos locales (backup)\n\nLa API no está disponible temporalmente.\nLos datos se cargaron desde teams.json';
    } else {
        message = '⏳ Cargando datos...';
    }

    alert(message);
}

// Test CSV and Logos only (NO APIs)
async function testCSVLoading() {
    const btn = document.querySelector('.test-api-btn');
    const originalText = btn.textContent;

    try {
        btn.textContent = '🔄 Testing...';
        btn.disabled = true;

        console.log('🧪 Starting CSV & Logos test...');

        // Test 1: EAFC26-Men.csv (PRIMARY DATA SOURCE)
        console.log('Test 1: EAFC26-Men.csv (18,000+ players)...');
        let csvStatus = '❌ Failed';
        let csvError = '';
        let playerCount = 0;

        try {
            const csvResponse = await fetch('EAFC26-Men.csv');

            if (csvResponse.ok) {
                const csvText = await csvResponse.text();
                const lines = csvText.split('\n').length;
                playerCount = lines - 1; // Subtract header
                csvStatus = `✅ OK (${playerCount.toLocaleString()} players)`;
                console.log(`✅ EAFC26-Men.csv found! ${playerCount} players`);
            } else {
                csvError = `HTTP ${csvResponse.status}`;
                console.warn(`⚠️  CSV not found: ${csvResponse.status}`);
            }
        } catch (err) {
            csvError = err.message;
            console.warn('❌ CSV error:', err.message);
        }

        // Test 2: Team Logos
        console.log('Test 2: Team Logos...');
        let logoStatus = '❌ Failed';
        let logoError = '';
        let testedLogos = 0;
        let workingLogos = 0;

        if (fc26Database && fc26Database.teams && fc26Database.teams.length > 0) {
            const testTeams = fc26Database.teams.slice(0, 10); // Test first 10 teams

            for (const team of testTeams) {
                testedLogos++;
                const logoUrl = team.team_logo;

                try {
                    const logoResponse = await fetch(logoUrl, { method: 'HEAD' });
                    if (logoResponse.ok) {
                        workingLogos++;
                        console.log(`✅ ${team.name}: ${logoUrl}`);
                    } else {
                        console.warn(`⚠️  ${team.name}: HTTP ${logoResponse.status}`);
                    }
                } catch (err) {
                    console.warn(`❌ ${team.name}: ${err.message}`);
                }
            }

            if (workingLogos > 0) {
                logoStatus = `✅ OK (${workingLogos}/${testedLogos} working)`;
            } else {
                logoError = 'No logos loaded';
                logoStatus = '❌ Failed';
            }
        } else {
            logoError = 'Database not loaded';
        }

        // Test 3: League Logos
        console.log('Test 3: League Logos...');
        let leagueStatus = '❌ Failed';
        let leagueError = '';
        const testedLeagues = [
            { name: 'La Liga', url: 'https://www.laliga.com/assets/images/logos/laliga-h-monochrome-white.png' },
            { name: 'Premier League', url: 'https://www.premierleague.com/resources/rebrand/v7.129.0/i/elements/pl-main-logo.png' },
            { name: 'Bundesliga', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/240px-Bundesliga_logo_%282017%29.svg.png' }
        ];

        let workingLeagues = 0;

        for (const league of testedLeagues) {
            try {
                const response = await fetch(league.url, { method: 'HEAD' });
                if (response.ok) {
                    workingLeagues++;
                    console.log(`✅ ${league.name}: Working`);
                } else {
                    console.warn(`⚠️  ${league.name}: HTTP ${response.status}`);
                }
            } catch (err) {
                console.warn(`❌ ${league.name}: ${err.message}`);
            }
        }

        if (workingLeagues > 0) {
            leagueStatus = `✅ OK (${workingLeagues}/${testedLeagues.length} working)`;
        } else {
            leagueError = 'All league logos failed';
        }

        // Build comprehensive report
        const report = `
📊 DIAGNÓSTICO CSV Y LOGOS (Sin APIs)

━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EAFC26-Men.csv (18,000+ jugadores)
Estado: ${csvStatus}
${csvError ? `Error: ${csvError}` : ''}
${playerCount > 0 ? `✅ Base de datos con ${playerCount.toLocaleString()} jugadores` : ''}

🎨 Logos de Equipos
Estado: ${logoStatus}
${logoError ? `Error: ${logoError}` : ''}
${workingLogos > 0 ? `✅ ${workingLogos}/${testedLogos} logos funcionando` : ''}

🏆 Logos de Ligas
Estado: ${leagueStatus}
${leagueError ? `Error: ${leagueError}` : ''}
${workingLeagues > 0 ? `✅ ${workingLeagues}/${testedLeagues.length} ligas con logos` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMEN:
${csvStatus.includes('✅')
    ? `✅ CSV Cargado: ${playerCount.toLocaleString()} jugadores disponibles`
    : '❌ CSV no encontrado - Requiere EAFC26-Men.csv en la raíz'}

${logoStatus.includes('✅')
    ? `✅ Logos de equipos funcionando (${workingLogos}/${testedLogos})`
    : '⚠️ Logos de equipos no cargan correctamente'}

${leagueStatus.includes('✅')
    ? '✅ Logos de ligas funcionando (LaLiga, Premier, Bundesliga)'
    : '⚠️ Logos de ligas no disponibles'}

━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ESTADO DEL SISTEMA:
${csvStatus.includes('✅') && logoStatus.includes('✅') && leagueStatus.includes('✅')
    ? '✅ SISTEMA COMPLETO: CSV + Logos listos para usar'
    : '⚠️ Revisa los errores arriba para completar la configuración'}

🚀 Análisis: LOCAL (Sin APIs)
${csvStatus.includes('✅')
    ? '✅ Recomendaciones basadas en datos reales de FC26'
    : '❌ Análisis no disponible sin CSV'}
        `.trim();

        alert(report);
        console.log('✅ CSV & Logos test complete');

    } catch (error) {
        console.error('Test error:', error);
        alert(`❌ Error en test: ${error.message}`);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
