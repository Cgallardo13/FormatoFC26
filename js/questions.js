// Questions Configuration
const questions = [
    {
        id: "league",
        title: "¿En qué liga quieres jugar?",
        description: "Selecciona tu liga preferida (solo una)",
        type: "league_selection",
        options: [
            { id: "la_liga", name: "La Liga", flag: "🇪🇸" },
            { id: "premier_league", name: "Premier League", flag: "🇬🇧" },
            { id: "bundesliga", name: "Bundesliga", flag: "🇩🇪" },
            { id: "serie_a", name: "Serie A", flag: "🇮🇹" },
            { id: "ligue_1", name: "Ligue 1", flag: "🇫🇷" }
        ]
    },
    {
        id: "formation",
        title: "¿Qué formación prefieres?",
        description: "Elige tu formación favorita para jugar",
        type: "formation_selection",
        options: [
            { id: "4_3_3", name: "4-3-3", description: "Clásica y equilibrada" },
            { id: "4_2_3_1", name: "4-2-3-1", description: "Mediocampo creativo" },
            { id: "3_5_2", name: "3-5-2", description: "Dominio en el medio" },
            { id: "5_3_2", name: "5-3-2", description: "Defensa sólida" },
            { id: "4_4_2", name: "4-4-2", description: "Dos delanteros" },
            { id: "custom", name: "✏️ Otra / Personalizada", description: "Escribe tu propia formación" }
        ]
    },
    {
        id: "position",
        title: "¿En qué posición juegas?",
        description: "Selecciona tu posición principal para analizar tu competición directa",
        type: "position_selection",
        options: [
            { id: "ST", name: "Delantero centro (ST)", icon: "⚽" },
            { id: "LW", name: "Extremo izquierdo (LW)", icon: "🏃" },
            { id: "RW", name: "Extremo derecho (RW)", icon: "🏃" },
            { id: "CAM", name: "Mediocampista ofensivo (CAM)", icon: "🎯" },
            { id: "CM", name: "Mediocampista central (CM)", icon: "🛡️" },
            { id: "CDM", name: "Mediocentro defensivo (CDM)", icon: "🛡️" },
            { id: "LB", name: "Lateral izquierdo (LB)", icon: "🏃" },
            { id: "RB", name: "Lateral derecho (RB)", icon: "🏃" },
            { id: "CB", name: "Defensa central (CB)", icon: "🧱" },
            { id: "GK", name: "Portero (GK)", icon: "🧤" }
        ]
    },
    {
        id: "wing_play",
        title: "¿Juegas por las bandas?",
        description: "¿Qué tanto te gusta usar los extremos?",
        type: "slider",
        min_label: "Centro",
        max_label: "Bandas",
        min: 0,
        max: 100,
        default: 50
    },
    {
        id: "possession",
        title: "¿Te gusta tener la pelota?",
        description: "¿Qué tanto prefieres mantener la posesión?",
        type: "slider",
        min_label: "Poco",
        max_label: "Mucho",
        min: 0,
        max: 100,
        default: 50
    },
    {
        id: "counter_attack",
        title: "¿Juegas al contraataque?",
        description: "¿Qué tanto usas transiciones rápidas?",
        type: "slider",
        min_label: "Poco",
        max_label: "Mucho",
        min: 0,
        max: 100,
        default: 50
    },
    {
        id: "aerial_balls",
        title: "¿Juegas con pelotas altas?",
        description: "¿Qué tanto usas centros y pelotas aéreas?",
        type: "slider",
        min_label: "Juego rasos",
        max_label: "Juego aéreo",
        min: 0,
        max: 100,
        default: 50
    },
    {
        id: "high_press",
        title: "¿Cómo presionas?",
        description: "¿Prefieres presionar alto o esperar atrás?",
        type: "slider",
        min_label: "Esperar atrás",
        max_label: "Presión alta",
        min: 0,
        max: 100,
        default: 50
    },
    {
        id: "age",
        title: "¿Cuántos años tiene tu jugador?",
        description: "La edad afecta tu potencial de desarrollo y oportunidades",
        type: "slider",
        min_label: "16",
        max_label: "40",
        min: 16,
        max: 40,
        default: 21,
        unit: "años"
    },
    {
        id: "game_mode",
        title: "🎮 ¿Cuál es tu objetivo?",
        description: "Define cómo quieres que funcione la recomendación",
        type: "game_mode_selection",
        options: [
            {
                id: "rtg",
                name: "🌟 Promesa (RTG)",
                description: "Equipos pequeños para crecer, desarrollar y ser estrella",
                icon: "🌟"
            },
            {
                id: "star",
                name: "⭐ Fichaje Estrella",
                description: "Equipos de élite donde ya eres mejor que el titular",
                icon: "⭐"
            }
        ]
    },
    {
        id: "attributes",
        title: "📊 Tus Atributos (Estilo EAFC)",
        description: "Define tus 6 stats principales para análisis preciso",
        type: "attributes_selection",
        default: {
            pac: 75,
            sho: 70,
            pas: 68,
            dri: 72,
            def: 60,
            phy: 65
        }
    }
];

// Question State
let currentQuestionIndex = 0;

function getDefaultAnswers() {
    return {
        league: [],  // exactly ONE league ID when selected
        formation: null,
        position: null,
        wing_play: 50,
        possession: 50,
        counter_attack: 50,
        aerial_balls: 50,
        high_press: 50,
        age: 21,
        game_mode: null, // 'rtg' or 'star'
        attributes: {
            pac: 75,
            sho: 70,
            pas: 68,
            dri: 72,
            def: 60,
            phy: 65
        }
    };
}

let answers = getDefaultAnswers();

// Reset helper (used by ui.js restart button)
function resetInterviewState() {
    answers = getDefaultAnswers();
    currentQuestionIndex = 0;
}

// Initialize questions
function initQuestions() {
    loadQuestion(0);
}

// Load a specific question
function loadQuestion(index) {
    const question = questions[index];
    const container = document.getElementById('questionContainer');

    // Update progress
    const progress = ((index + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('totalQuestions').textContent = questions.length;

    // Build question HTML
    let html = `
        <div class="question-title">${question.title}</div>
        <div class="question-description">${question.description}</div>
    `;

    if (question.type === 'league_selection') {
        html += '<div class="league-grid">';
        question.options.forEach(option => {
            const isSelected = answers.league.includes(option.id);

            // FlagCDN URLs - Direct and stable
            const flagUrls = {
                'la_liga': 'https://flagcdn.com/w160/es.png',
                'premier_league': 'https://flagcdn.com/w160/gb.png',
                'bundesliga': 'https://flagcdn.com/w160/de.png',
                'serie_a': 'https://flagcdn.com/w160/it.png',
                'ligue_1': 'https://flagcdn.com/w160/fr.png'
            };

            const flagUrl = flagUrls[option.id] || '';

            html += `
                <div class="league-option ${isSelected ? 'selected' : ''}"
                     onclick="selectLeague('${option.id}')">
                    <div class="league-card">
                        <div class="league-flag-container">
                            <img src="${flagUrl}" class="league-flag-full" alt="${option.name}">
                        </div>
                        <div class="league-label">${option.name}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'formation_selection') {
        html += '<div class="formation-options">';

        // Show custom formation if it exists and is not one of the presets
        const customFormation = answers.formation && !question.options.some(opt => opt.id === answers.formation);
        if (customFormation) {
            const formationDisplay = answers.formation.replace(/_/g, '-');
            html += `
                <div class="formation-option selected"
                     onclick="selectFormation('${answers.formation}')">
                    <div class="formation-name">✏️ ${formationDisplay}</div>
                    <div class="formation-desc">Tu formación personalizada</div>
                </div>
            `;
        }

        question.options.forEach(option => {
            const isSelected = answers.formation === option.id;
            html += `
                <div class="formation-option ${isSelected ? 'selected' : ''}"
                     onclick="selectFormation('${option.id}')">
                    <div class="formation-name">${option.name}</div>
                    <div class="formation-desc">${option.description}</div>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'position_selection') {
        html += '<div class="position-options">';
        question.options.forEach(option => {
            const isSelected = answers.position === option.id;
            html += `
                <div class="position-option ${isSelected ? 'selected' : ''}"
                     onclick="selectPosition('${option.id}')">
                    <div class="position-icon">${option.icon}</div>
                    <div class="position-name">${option.name}</div>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'slider') {
        const currentValue = answers[question.id] || question.default;
        const unit = question.unit || '%';
        html += `
            <div class="slider-options">
                <div class="slider-labels">
                    <span>${question.min_label}</span>
                    <span>${question.max_label}</span>
                </div>
                <input type="range"
                       min="${question.min}"
                       max="${question.max}"
                       value="${currentValue}"
                       class="slider"
                       id="slider_${question.id}"
                       oninput="updateSliderValue('${question.id}', this.value, '${unit}')">
                <div class="slider-value" id="sliderValue_${question.id}">${currentValue}${unit}</div>
            </div>
        `;
    } else if (question.type === 'game_mode_selection') {
        html += '<div class="game-mode-options">';
        question.options.forEach(option => {
            const isSelected = answers.game_mode === option.id;
            html += `
                <div class="game-mode-option ${isSelected ? 'selected' : ''}"
                     onclick="selectGameMode('${option.id}')">
                    <div class="game-mode-icon">${option.icon}</div>
                    <div class="game-mode-name">${option.name}</div>
                    <div class="game-mode-desc">${option.description}</div>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'attributes_selection') {
        const attrs = answers.attributes || question.default;
        html += `
            <div class="attributes-container">
                <div class="attr-presets">
                    <div class="attr-presets-title">Perfiles Pro (1 click)</div>
                    <div class="attr-presets-grid">
                        <button class="preset-btn" onclick="applyAttributePreset('winger')">🏃 Extremo Veloz</button>
                        <button class="preset-btn" onclick="applyAttributePreset('striker')">🎯 9 de Área</button>
                        <button class="preset-btn" onclick="applyAttributePreset('playmaker')">🧠 Playmaker</button>
                        <button class="preset-btn" onclick="applyAttributePreset('box2box')">🔁 Box-to-box</button>
                        <button class="preset-btn" onclick="applyAttributePreset('destroyer')">🛡️ Destroyer</button>
                        <button class="preset-btn" onclick="applyAttributePreset('fullback')">⚡ Lateral Moderno</button>
                        <button class="preset-btn" onclick="applyAttributePreset('cb')">🧱 Central Fuerte</button>
                    </div>
                    <div class="attr-presets-note">Tip: Puedes ajustar cada stat después.</div>
                </div>

                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">⚡</span>
                        <span class="attr-name">PAC</span>
                        <span class="attr-full">Ritmo</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.pac}"
                               class="attr-input" id="attr_pac"
                               oninput="updateAttribute('pac', this.value)">
                        <span class="attr-value" id="val_pac">${attrs.pac}</span>
                    </div>
                </div>
                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">🎯</span>
                        <span class="attr-name">SHO</span>
                        <span class="attr-full">Tiro</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.sho}"
                               class="attr-input" id="attr_sho"
                               oninput="updateAttribute('sho', this.value)">
                        <span class="attr-value" id="val_sho">${attrs.sho}</span>
                    </div>
                </div>
                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">🎯</span>
                        <span class="attr-name">PAS</span>
                        <span class="attr-full">Pase</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.pas}"
                               class="attr-input" id="attr_pas"
                               oninput="updateAttribute('pas', this.value)">
                        <span class="attr-value" id="val_pas">${attrs.pas}</span>
                    </div>
                </div>
                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">🏃</span>
                        <span class="attr-name">DRI</span>
                        <span class="attr-full">Regate</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.dri}"
                               class="attr-input" id="attr_dri"
                               oninput="updateAttribute('dri', this.value)">
                        <span class="attr-value" id="val_dri">${attrs.dri}</span>
                    </div>
                </div>
                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">🛡️</span>
                        <span class="attr-name">DEF</span>
                        <span class="attr-full">Defensa</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.def}"
                               class="attr-input" id="attr_def"
                               oninput="updateAttribute('def', this.value)">
                        <span class="attr-value" id="val_def">${attrs.def}</span>
                    </div>
                </div>
                <div class="attribute-row">
                    <div class="attr-label">
                        <span class="attr-icon">💪</span>
                        <span class="attr-name">PHY</span>
                        <span class="attr-full">Físico</span>
                    </div>
                    <div class="attr-slider">
                        <input type="range" min="50" max="99" value="${attrs.phy}"
                               class="attr-input" id="attr_phy"
                               oninput="updateAttribute('phy', this.value)">
                        <span class="attr-value" id="val_phy">${attrs.phy}</span>
                    </div>
                </div>
                <div class="attr-total">
                    Total: <span id="attr_total">${Math.round((attrs.pac + attrs.sho + attrs.pas + attrs.dri + attrs.def + attrs.phy) / 6)}</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // CRITICAL: Protect sliders from triggering swipe navigation on mobile
    // Add event listeners to all range inputs to prevent touch propagation
    const sliders = container.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        // Prevent touch events from propagating to document-level swipe handlers
        slider.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            e.stopPropagation();
        }, { passive: true });

        // Also prevent pointer events for better compatibility
        slider.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        }, { passive: true });

        slider.addEventListener('pointermove', (e) => {
            e.stopPropagation();
        }, { passive: true });

        slider.addEventListener('pointerup', (e) => {
            e.stopPropagation();
        }, { passive: true });
    });

    // Update buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').textContent = index === questions.length - 1 ? 'Finalizar' : 'Siguiente →';

    currentQuestionIndex = index;
}

// Select league (SINGLE selection - radio button behavior)
function selectLeague(leagueId) {
    // CRITICAL: Single league selection - replace entire array
    answers.league = [leagueId];

    console.log(`✅ League selected: ${leagueId}`);

    // Re-render to update UI
    loadQuestion(currentQuestionIndex);
}

// Select formation
function selectFormation(formationId) {
    if (formationId === 'custom') {
        showCustomFormationInput();
    } else {
        answers.formation = formationId;
        // Re-render to update UI
        loadQuestion(currentQuestionIndex);
    }
}

// Show custom formation input
function showCustomFormationInput() {
    const container = document.getElementById('questionContainer');

    container.innerHTML = `
        <div class="question-title">Escribe tu formación personalizada</div>
        <div class="question-description">Usa el formato: defensa-medio-delantero (ej: 4-3-3, 3-5-2)</div>

        <div class="custom-formation-container">
            <input
                type="text"
                id="customFormationInput"
                class="custom-formation-input"
                placeholder="4-3-3"
                maxlength="20"
                onkeypress="handleFormationKeypress(event)"
            >
            <div class="formation-examples">
                <span class="example-label">Ejemplos:</span>
                <span class="example-tag" onclick="setFormationExample('4_1_4_1')">4-1-4-1</span>
                <span class="example-tag" onclick="setFormationExample('3_4_2_1')">3-4-2-1</span>
                <span class="example-tag" onclick="setFormationExample('5_2_1_2')">5-2-1-2</span>
            </div>
            <div id="formationError" class="formation-error"></div>
        </div>

        <div class="button-group" style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="cancelCustomFormation()">
                ← Cancelar
            </button>
            <button class="btn btn-primary" onclick="submitCustomFormation()">
                Confirmar ✓
            </button>
        </div>
    `;
}

// Handle enter key in formation input
function handleFormationKeypress(event) {
    if (event.key === 'Enter') {
        submitCustomFormation();
    }
}

// Set formation example
function setFormationExample(formation) {
    document.getElementById('customFormationInput').value = formation.replace(/_/g, '-');
    document.getElementById('formationError').textContent = '';
}

// Validate custom formation format
function validateCustomFormation(formationStr) {
    // Remove spaces and convert to array
    const cleanStr = formationStr.replace(/\s/g, '');
    const parts = cleanStr.split('-');

    // Check format: must have 3-4 parts with numbers
    if (parts.length < 3 || parts.length > 4) {
        return {
            valid: false,
            error: 'Formato inválido. Debe tener 3-4 líneas (ej: 4-3-3 o 4-2-3-1)'
        };
    }

    // Check each part is a number
    const numbers = [];
    for (let part of parts) {
        const num = parseInt(part);
        if (isNaN(num) || num < 0 || num > 10) {
            return {
                valid: false,
                error: 'Cada línea debe ser un número del 0-10'
            };
        }
        numbers.push(num);
    }

    // Check total equals 10
    const total = numbers.reduce((a, b) => a + b, 0);
    if (total !== 10) {
        return {
            valid: false,
            error: `Táctica inválida: La formación suma ${total} jugadores (debe ser 10, sin portero)`
        };
    }

    return {
        valid: true,
        formationId: numbers.join('_'),
        formationName: numbers.join('-')
    };
}

// Submit custom formation
function submitCustomFormation() {
    const input = document.getElementById('customFormationInput');
    const errorDiv = document.getElementById('formationError');

    const validation = validateCustomFormation(input.value);

    if (!validation.valid) {
        errorDiv.textContent = validation.error;
        errorDiv.style.color = '#f44336';
        input.style.borderColor = '#f44336';
        return;
    }

    // Success - save formation
    answers.formation = validation.formationId;
    errorDiv.textContent = '';

    // Re-render to update UI
    loadQuestion(currentQuestionIndex);
}

// Cancel custom formation
function cancelCustomFormation() {
    loadQuestion(currentQuestionIndex);
}

// Select position
function selectPosition(positionId) {
    answers.position = positionId;

    // Re-render to update UI
    loadQuestion(currentQuestionIndex);
}

// Update slider value
function updateSliderValue(questionId, value, unit = '%') {
    answers[questionId] = parseInt(value);
    document.getElementById(`sliderValue_${questionId}`).textContent = value + unit;
}

// Select game mode (RTG or Star)
function selectGameMode(modeId) {
    answers.game_mode = modeId;
    // Re-render to update UI
    loadQuestion(currentQuestionIndex);
}

// Update player attribute
function updateAttribute(attr, value) {
    answers.attributes[attr] = parseInt(value);
    document.getElementById(`val_${attr}`).textContent = value;

    // Update total average
    const attrs = answers.attributes;
    const total = Math.round((attrs.pac + attrs.sho + attrs.pas + attrs.dri + attrs.def + attrs.phy) / 6);
    document.getElementById('attr_total').textContent = total;
}

function applyAttributePreset(presetId) {
    const presets = {
        winger: { pac: 92, sho: 78, pas: 78, dri: 90, def: 55, phy: 68, style: { wing_play: 90, counter_attack: 70, possession: 55, aerial_balls: 25, high_press: 55 } },
        striker: { pac: 86, sho: 92, pas: 70, dri: 80, def: 52, phy: 86, style: { wing_play: 55, counter_attack: 72, possession: 45, aerial_balls: 78, high_press: 50 } },
        playmaker: { pac: 78, sho: 76, pas: 92, dri: 88, def: 60, phy: 70, style: { wing_play: 55, counter_attack: 40, possession: 88, aerial_balls: 30, high_press: 55 } },
        box2box: { pac: 82, sho: 78, pas: 84, dri: 82, def: 78, phy: 82, style: { wing_play: 55, counter_attack: 55, possession: 65, aerial_balls: 45, high_press: 72 } },
        destroyer: { pac: 72, sho: 62, pas: 76, dri: 70, def: 90, phy: 88, style: { wing_play: 40, counter_attack: 50, possession: 55, aerial_balls: 55, high_press: 82 } },
        fullback: { pac: 88, sho: 68, pas: 78, dri: 80, def: 86, phy: 80, style: { wing_play: 78, counter_attack: 55, possession: 60, aerial_balls: 35, high_press: 75 } },
        cb: { pac: 70, sho: 55, pas: 68, dri: 62, def: 92, phy: 92, style: { wing_play: 35, counter_attack: 50, possession: 52, aerial_balls: 70, high_press: 70 } }
    };
    const p = presets[presetId];
    if (!p) return;

    // Set attributes
    answers.attributes = { pac: p.pac, sho: p.sho, pas: p.pas, dri: p.dri, def: p.def, phy: p.phy };

    // Optionally tune style sliders (keeps it "pro" and more accurate)
    if (p.style) {
        answers.wing_play = p.style.wing_play;
        answers.counter_attack = p.style.counter_attack;
        answers.possession = p.style.possession;
        answers.aerial_balls = p.style.aerial_balls;
        answers.high_press = p.style.high_press;
    }

    // Reflect in UI sliders if present
    const setUI = (key, val) => {
        const el = document.getElementById(`attr_${key}`);
        const v = document.getElementById(`val_${key}`);
        if (el) el.value = val;
        if (v) v.textContent = val;
    };
    setUI('pac', p.pac);
    setUI('sho', p.sho);
    setUI('pas', p.pas);
    setUI('dri', p.dri);
    setUI('def', p.def);
    setUI('phy', p.phy);

    const total = document.getElementById('attr_total');
    if (total) total.textContent = Math.round((p.pac + p.sho + p.pas + p.dri + p.def + p.phy) / 6);
}

// Previous question
function prevQuestion(event) {
    // Prevent double-click and event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Prevent multiple rapid clicks
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn && prevBtn.disabled) return;

    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
}

// Next question
function nextQuestion(event) {
    // Prevent double-click and event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Prevent multiple rapid clicks
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn && nextBtn.disabled) return;

    // Validate current answer
    const question = questions[currentQuestionIndex];

    if (question.type === 'league_selection' && answers.league.length !== 1) {
        alert('Por favor selecciona exactamente una liga');
        return;
    }

    if (question.type === 'formation_selection' && !answers.formation) {
        alert('Por favor selecciona una formación');
        return;
    }

    if (question.type === 'position_selection' && !answers.position) {
        alert('Por favor selecciona tu posición');
        return;
    }

    if (question.type === 'game_mode_selection' && !answers.game_mode) {
        alert('Por favor selecciona tu modo de juego');
        return;
    }

    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        // All questions answered, proceed to analysis
        showLoading();
    }
}

// Show loading screen
async function showLoading() {
    hideAllScreens();
    document.getElementById('loadingScreen').classList.add('active');

    // Simulate loading and analyze
    setTimeout(async () => {
        await analyzeResults();
    }, 2000);
}

// Hide all screens
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}
