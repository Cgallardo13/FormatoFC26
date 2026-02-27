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

// Test all API connections
async function testAllConnections() {
    const btn = document.querySelector('.test-api-btn');
    const originalText = btn.textContent;

    try {
        btn.textContent = '🔄 Testing...';
        btn.disabled = true;

        console.log('🧪 Starting API connection tests...');

        // Test 1: MSMC API
        console.log('Test 1: MSMC API...');
        let msmcStatus = '❌ Failed';
        let msmcError = '';

        try {
            const msmcResponse = await fetch('https://api.msmc.cc/eafc/', {
                method: 'GET',
                mode: 'cors'
            });

            if (msmcResponse.ok) {
                msmcStatus = '✅ OK';
                console.log('✅ MSMC API is reachable');
            } else {
                msmcError = `HTTP ${msmcResponse.status}`;
                console.warn(`⚠️ MSMC API returned: ${msmcResponse.status}`);
            }
        } catch (err) {
            msmcError = err.message;
            console.warn('❌ MSMC API error:', err.message);
        }

        // Test 2: Gemini API
        console.log('Test 2: Gemini API...');
        let geminiStatus = '❌ Failed';
        let geminiError = '';

        try {
            const apiKey = typeof getGeminiAPIKey === 'function' ? getGeminiAPIKey() : GEMINI_API_KEY;

            // Test with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'test' }] }]
                    }),
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (geminiResponse.ok || geminiResponse.status === 400) {
                // 400 means API is working but key might be invalid - that's OK for connectivity test
                geminiStatus = '✅ OK';
                console.log('✅ Gemini API is reachable');
            } else {
                geminiError = `HTTP ${geminiResponse.status}`;
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                geminiError = 'Timeout (3s)';
            } else {
                geminiError = err.message;
            }
            console.warn('❌ Gemini API error:', err.message);
        }

        // Build report
        const report = `
🔧 DIAGNÓSTICO DE CONEXIONES

━━━━━━━━━━━━━━━━━━━━━━━━━

📡 MSMC API (https://api.msmc.cc/eafc/)
Estado: ${msmcStatus}
${msmcError ? `Error: ${msmcError}` : ''}

🤖 Gemini API
Estado: ${geminiStatus}
${geminiError ? `Error: ${geminiError}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

${msmcStatus === '✅ OK' && geminiStatus === '✅ OK'
    ? '✅ TODAS LAS CONEXIONES FUNCIONAN'
    : '⚠️ Algunas conexiones fallaron - Revisa la consola para más detalles'}
        `.trim();

        alert(report);
        console.log('✅ Connection test complete');

    } catch (error) {
        console.error('Test error:', error);
        alert(`❌ Error en test: ${error.message}`);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
