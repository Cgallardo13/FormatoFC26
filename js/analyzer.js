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
// MANAGER DATABASE - Professional Styles 2025/26
// ============================================
const MANAGER_STYLES = {
    'fc barcelona': {
        name: 'Hansi Flick',
        style: 'Juego de Posicion Aleman',
        philosophy: 'Posesion absoluta, presion intensa, transiciones rapidas',
        keyPhrase: 'El futbol total de Flick exige control y ritmo alto'
    },
    'real madrid': {
        name: 'Carlo Ancelotti',
        style: 'Alta Dinamica',
        philosophy: 'Transiciones letales, flexibilidad tactica, momentos de clase',
        keyPhrase: 'Ancelotti permite la libertad creativa en los ultimos 30 metros'
    },
    'atletico madrid': {
        name: 'Diego Simeone',
        style: 'Cholismo',
        philosophy: 'Defensa de hierro, contraataque quirurgico, sacrificio total',
        keyPhrase: 'El Cholo exige intensidad defensiva y letalidad al contraataque'
    },
    'athletic bilbao': {
        name: 'Ernesto Valverde',
        style: 'Pragmatismo Vasco',
        philosophy: 'Juego aereo, banda intensa, organizacion defensiva',
        keyPhrase: 'Valverde maximiza el estilo fisico y aerial de los leones'
    },
    'manchester city': {
        name: 'Pep Guardiola',
        style: 'Juego de Posicion',
        philosophy: 'Posesion extrema, posicionamiento coordinado, presion alta',
        keyPhrase: 'Guardiola requiere inteligencia tactica y movimiento constante'
    },
    'arsenal': {
        name: 'Mikel Arteta',
        style: 'Pepismo 2.0',
        philosophy: 'Combos cortos, presion intensa, versatilidad ofensiva',
        keyPhrase: 'Arteta busca jugadores tecnicos con capacidad de presion'
    },
    'liverpool': {
        name: 'Arne Slot',
        style: 'Rock & Roll Football 2.0',
        philosophy: 'Transiciones explosivas, pressing amplio, ataque directo',
        keyPhrase: 'Slot mantiene la intensidad del Klopppressing con mas estructura'
    },
    'aston villa': {
        name: 'Unai Emery',
        style: 'Tactica Europea',
        philosophy: 'Organizacion defensiva, contraedicion precisa, set pieces',
        keyPhrase: 'Emery requiere disciplina tactica y letalidad en las transiciones'
    },
    'bayern': {
        name: 'Vincent Kompany',
        style: 'Posesion Vertical',
        philosophy: 'Construccion audaz, presion alta, sangre fria',
        keyPhrase: 'Kompany quiere valentia con el balon y estructura defensiva'
    },
    'dortmund': {
        name: 'Nuri Sahin',
        style: 'Dortmund Pressing',
        philosophy: 'Ataque de ritmo alto, transiciones rapidas, intensidad',
        keyPhrase: 'Sahin mantiene la filosofia de presion historica del club'
    },
    'leverkusen': {
        name: 'Xabi Alonso',
        style: 'Tiki-Taka Aleman',
        philosophy: 'Posesion dinamica, wing-backs ofensivos, transiciones dobles',
        keyPhrase: 'Alonso busca laterales tecnicos y mediocampistas versatiles'
    },
    'inter': {
        name: 'Simone Inzaghi',
        style: '3-5-2 Letal',
        philosophy: 'Lateralidad offensiva, transiciones rapidas, equilibrio',
        keyPhrase: 'Inzaghi busca mediocampistas completos y extremos tacticos'
    },
    'juventus': {
        name: 'Thiago Motta',
        style: '2-7-2 Revolucionario',
        philosophy: 'Posesion extrema, mediocampistas creativos, presion alta',
        keyPhrase: 'Motta busca futbolistas inteligentes que entiendan el espacio'
    },
    'napoles': {
        name: 'Antonio Conte',
        style: 'Conteball',
        philosophy: '3-4-2-1, presion asfixiante, contraataque quirurgico',
        keyPhrase: 'Conte requiere disciplina tactica absoluta y mentalidad ganadora'
    },
    'atalanta': {
        name: 'Gian Piero Gasperini',
        style: 'Gasperiniball',
        philosophy: 'Pressing maniquo, wing-backs ofensivos, libertad creativa',
        keyPhrase: 'Gasperini demanda atletas con resistencia y tecnica'
    },
    'psg': {
        name: 'Luis Enrique',
        style: 'Posesion Radical',
        philosophy: 'Posesion extrema, diagonales ofensivas, rotacion constante',
        keyPhrase: 'Luis Enrique busca jugadores tecnicos sin miedo al riesgo'
    },
    'monaco': {
        name: 'Adi Hutter',
        style: 'Grenoble Pressing',
        philosophy: 'Presion alta, juego directo, transiciones explosivas',
        keyPhrase: 'Hutter requiere intensidad y verticalidad constante'
    }
};

// ============================================
// STADIUM ATMOSPHERE DATABASE (2025/26)
// ============================================
const STADIUM_ATMOSPHERE = {
    'fc barcelona': {
        city: 'Barcelona',
        atmosphere: 'El Campnou vibra con la Pasión catalana. El cante te exigirá entrega total desde el primer minuto.',
        weather: 'Juegos soleados, 22°C promedio'
    },
    'real madrid': {
        city: 'Madrid',
        atmosphere: 'Santiago Bernabéu es un templo del fútbol. La afición conoce el fútbol y juzga cada acción.',
        weather: 'Continental, 20°C promedio'
    },
    'atletico madrid': {
        city: 'Madrid',
        atmosphere: 'El Cívitas Metropolitano es una fortaleza. La grada vive cada balón como si fuera el último.',
        weather: 'Continental, 20°C promedio'
    },
    'athletic bilbao': {
        city: 'Bilbao',
        atmosphere: 'San Mamés es una cauldron purpura. La insistencia de los seguidadores te hará dar el 110%.',
        weather: 'Lluvias frecuentes, 17°C promedio'
    },
    'manchester city': {
        city: 'Manchester',
        atmosphere: 'Etihad Stadium es moderno pero exigente. Los fans de City conocen su fútbol y aplauden el juego inteligente.',
        weather: 'Lluvioso, 13°C promedio'
    },
    'manchester united': {
        city: 'Manchester',
        atmosphere: 'Old Trafford es el Teatro de los Sueños. La presión de la historia te persigue, pero también te inspira.',
        weather: 'Lluvioso, 13°C promedio'
    },
    'liverpool': {
        city: 'Liverpool',
        atmosphere: 'Anfield es más que un estadio, es una religión. You\'ll Never Walk Alone no es solo una canción, es una amenaza.',
        weather: 'Costero lluvioso, 11°C promedio'
    },
    'arsenal': {
        city: 'London',
        atmosphere: 'El Emirates es elegante pero exigente. Los Gooners valoran el fútbol atractivo y posicional.',
        weather: 'Lluvias moderadas, 14°C promedio'
    },
    'chelsea': {
        city: 'London',
        atmosphere: 'Stamford Bridge es una mezcla de pasión y modernidad. Los fans quieren ver compromiso total.',
        weather: 'Lluvias moderadas, 14°C promedio'
    },
    'tottenham': {
        city: 'London',
        atmosphere: 'Tottenham Hotspur Stadium tiene una base de fans muy pasional. El norte de Londres no acepta menos que todo.',
        weather: 'Lluvias moderadas, 14°C promedio'
    },
    'bayern': {
        city: 'Munich',
        atmosphere: 'Allianz Arena es la catedral del fútbol alemán. La eficiencia y la profesionalidad se esperan en cada jugada.',
        weather: 'Continental fresco, 11°C promedio'
    },
    'dortmund': {
        city: 'Dortmund',
        atmosphere: 'Signal Iduna Park es la Yellow Wall. 80,000 hinchas cantando al unísono crean una atmósfera irrepetible.',
        weather: 'Continental lluvioso, 10°C promedio'
    },
    'juventus': {
        city: 'Turin',
        atmosphere: 'Allianz Stadium es elegante pero demandante. La Bianconeri espera victorias y estilo.',
        weather: 'Continental, 15°C promedio'
    },
    'inter': {
        city: 'Milan',
        atmosphere: 'San Siro es histórico y fascinante. La Curva Nord exige pasión y resultados.',
        weather: 'Continental húmedo, 16°C promedio'
    },
    'ac milan': {
        city: 'Milan',
        atmosphere: 'San Siro compartido es majestuoso. Los rossoneri valoran el bel gioco y la técnica.',
        weather: 'Continental húmedo, 16°C promedio'
    },
    'napoles': {
        city: 'Naples',
        atmosphere: 'Diego Maradona es un volcán de pasión. El fútbol napolitano es más que deporte, es religión.',
        weather: 'Mediterráneo soleado, 20°C promedio'
    },
    'roma': {
        city: 'Rome',
        atmosphere: 'Stadio Olimpico es eterno. La Roma requiere carattere e gloria en cada presentación.',
        weather: 'Mediterráneo soleado, 20°C promedio'
    },
    'aston villa': {
        city: 'Birmingham',
        atmosphere: 'Villa Park es tradición pura. Tu agresividad en la marca te hará un favorito de la grada.',
        weather: 'Nublado, 12°C promedio'
    },
    'everton': {
        city: 'Liverpool',
        atmosphere: 'Goodison Park es una fortaleza. Los toffees exigen lealtad y esfuerzo en cada balón.',
        weather: 'Costero lluvioso, 11°C promedio'
    },
    'newcastle': {
        city: 'Newcastle',
        atmosphere: 'St James\' Park es electrizante. Los Geordies son apasionados y leales hasta la muerte.',
        weather: 'Costero frío, 9°C promedio'
    },
    'leverkusen': {
        city: 'Leverkusen',
        atmosphere: 'BayArena es moderno y vibrante. La obra de Alonso ha convertido a la afición en creyente.',
        weather: 'Continental moderado, 13°C promedio'
    },
    'frankfurt': {
        city: 'Frankfurt',
        atmosphere: 'Deutsche Bank Park es intenso. Los fans exigen intensidad y presion constante.',
        weather: 'Continental moderado, 13°C promedio'
    },
    'inter': {
        city: 'Milan',
        atmosphere: 'San Siro es histórico y fascinante. La Curva Nord exige pasión y resultados.',
        weather: 'Continental húmedo, 16°C promedio'
    },
    'bayer leverkusen': {
        city: 'Leverkusen',
        atmosphere: 'BayArena es moderno y vibrante. La obra de Alonso ha convertido a la afición en creyente.',
        weather: 'Continental moderado, 13°C promedio'
    },
    'rb leipzig': {
        city: 'Leipzig',
        atmosphere: 'Red Bull Arena es energía pura. Los fans exigen intensidad y velocidad.',
        weather: 'Continental fresco, 11°C promedio'
    },
    'wolfsburg': {
        city: 'Wolfsburg',
        atmosphere: 'Volkswagen Arena es moderno pero exigente. La afición valora el esfuerzo.',
        weather: 'Continental nublado, 12°C promedio'
    },
    'eintracht frankfurt': {
        city: 'Frankfurt',
        atmosphere: 'Deutsche Bank Park es intenso. La Waldstadim es una fortaleza.',
        weather: 'Continental moderado, 13°C promedio'
    },
    'union berlin': {
        city: 'Berlin',
        atmosphere: 'Stadion An der Alten Försterei es auténtico. Los fans exigen garra.',
        weather: 'Continental fresco, 10°C promedio'
    },
    'freiburg': {
        city: 'Freiburg',
        atmosphere: 'Europa-Park Stadion es acogedor pero competitivo. Fútbol intenso.',
        weather: 'Continental lluvioso, 11°C promedio'
    },
    'bayer 04 leverkusen': {
        city: 'Leverkusen',
        atmosphere: 'BayArena es moderno y vibrante. La obra de Alonso ha convertido a la afición en creyente.',
        weather: 'Continental moderado, 13°C promedio'
    },
    'atalanta': {
        city: 'Bergamo',
        atmosphere: 'Gewiss Stadium es una olla a presión. Gasperini exige intensidad máxima.',
        weather: 'Alpino fresco, 14°C promedio'
    },
    'lazio': {
        city: 'Rome',
        atmosphere: 'Stadio Olimpico en Roma es eterno. La Lazio requiere passion.',
        weather: 'Mediterráneo soleado, 20°C promedio'
    },
    'napoli': {
        city: 'Naples',
        atmosphere: 'Diego Maradona es un volcán de pasión. El fútbol napolitano es más que deporte, es religión.',
        weather: 'Mediterráneo soleado, 20°C promedio'
    },
    'fiorentina': {
        city: 'Florence',
        atmosphere: 'Artemio Franchi es elegante y apasionado. La Fiorentina valora el bel gioco.',
        weather: 'Continental suave, 17°C promedio'
    },
    'torino': {
        city: 'Turin',
        atmosphere: 'Stadio Olimpico Grande Torino es Working Class. Los fans exigen lucha.',
        weather: 'Continental, 14°C promedio'
    },
    'psg': {
        city: 'Paris',
        atmosphere: 'Parc des Princes es glamour y presión. El exigente público parisino busca perfección.',
        weather: 'Templado, 15°C promedio'
    },
    'as monaco': {
        city: 'Monaco',
        atmosphere: 'Louis II es exclusivo pero tranquilo. Un ambiente diferente al resto.',
        weather: 'Costero soleado, 18°C promedio'
    },
    'marseille': {
        city: 'Marseille',
        atmosphere: 'Vélodrome es ebullición pura. Los fans son apasionados y exigentes.',
        weather: 'Mediterráneo, 19°C promedio'
    },
    'lyon': {
        city: 'Lyon',
        atmosphere: 'Groupama Stadium es moderno. La afición valora el juego ofensivo.',
        weather: 'Continental suave, 16°C promedio'
    },
    'lille': {
        city: 'Lille',
        atmosphere: 'Pierre Mauroy es el hogar del norte. Fans trabajadores y leales.',
        weather: 'Norte lluvioso, 12°C promedio'
    },
    'nice': {
        city: 'Nice',
        atmosphere: 'Allianz Riviera es moderno y bonito. Ambiente relajado pero competitivo.',
        weather: 'Costero soleado, 18°C promedio'
    },
    'west ham': {
        city: 'London',
        atmosphere: 'London Stadium es moderno. Los Hammers son tradicionales y apasionados.',
        weather: 'Lluvias moderadas, 14°C promedio'
    },
    'brighton': {
        city: 'Brighton',
        atmosphere: 'Amex Stadium es moderno y elegante. Los Seagulls valoran el fútbol técnico.',
        weather: 'Costero ventoso, 13°C promedio'
    },
    'villa': {
        city: 'Birmingham',
        atmosphere: 'Villa Park es tradición pura. Tu agresividad en la marca te hará un favorito de la grada.',
        weather: 'Nublado, 12°C promedio'
    },
    'real sociedad': {
        city: 'San Sebastian',
        atmosphere: 'Reale Arena es elegante y exigente. La afición conoce el fútbol.',
        weather: 'Costero lluvioso, 16°C promedio'
    },
    'real betis': {
        city: 'Seville',
        atmosphere: 'Benito Villamarin es pasión andaluza. Los fans exigen alegría y juego.',
        weather: 'Andaluz soleado, 22°C promedio'
    },
    'sevilla': {
        city: 'Seville',
        atmosphere: 'Ramon Sanchez Pizjuan es una fortaleza. El calor y la pasión son extremos.',
        weather: 'Andaluz caluroso, 24°C promedio'
    },
    'valencia': {
        city: 'Valencia',
        atmosphere: 'Mestalla es histórico y exigente. Los fans valencianistas son leales.',
        weather: 'Mediterráneo, 20°C promedio'
    },
    'real sociedad': {
        city: 'San Sebastian',
        atmosphere: 'Reale Arena es elegante y exigente. La afición conoce el fútbol.',
        weather: 'Costero lluvioso, 16°C promedio'
    },
    'celta vigo': {
        city: 'Vigo',
        atmosphere: 'Balaídos es auténtico. Los Celtistas exigen garra y lucha.',
        weather: 'Gallego lluvioso, 15°C promedio'
    },
    'espanyol': {
        city: 'Barcelona',
        atmosphere: 'Cornella-El Prat es moderno pero humilde. Los pericos buscan superación.',
        weather: 'Mediterráneo, 20°C promedio'
    }
};

// ============================================
// STADIUM/CITY BACKGROUND IMAGES - DYNAMIC UNSPLASH
// Keywords for generating unique atmospheric background images
// ============================================
const STADIUM_BACKGROUNDS = {
    // La Liga
    'fc barcelona': 'sagrada,familia,barcelona,catalonia',
    'real madrid': 'madrid,skyline,santiago,bernabeu,spain',
    'atletico madrid': 'madrid,wanda,metropolitano,spain',
    'athletic club': 'bilbao,san,mames,guggenheim,basque',
    'athletic bilbao': 'bilbao,guggenheim,basque,country',
    'sevilla': 'seville,ramon,sanchez,pizjuan,spain',
    'valencia': 'valencia,arts,science,mestalla,spain',
    'villarreal': 'villarreal,ceramica,spain,mediterranean',
    'real betis': 'seville,betis,villamarin,andalusia',
    'real sociedad': 'san,sebastian,real,arena,basque',
    'celta vigo': 'vigo,balaidos,galicia,spain',
    'real valladolid': 'valladolid,jose,zorrilla,spain',

    // Premier League
    'manchester city': 'manchester,etihad,skyline,england',
    'manchester united': 'manchester,old,trafford,england',
    'liverpool': 'liverpool,anfield,mersey,england',
    'arsenal': 'london,emirates,ben,parliament',
    'chelsea': 'london,stamford,bridge,england',
    'tottenham': 'london,hotspur,white,hart_lane',
    'aston villa': 'birmingham,villa,park,england',
    'newcastle': 'newcastle,st,james,park,england',
    'everton': 'liverpool,goodison,park,england',
    'west ham': 'london,london,stadium,olympic',
    'brighton': 'brighton,amex,england,seaside',
    'leicester': 'leicester,king,power,england',

    // Bundesliga
    'bayern munich': 'munich,allianz,arena,germany,bavaria',
    'bayern': 'munich,germany,skyline,night',
    'borussia dortmund': 'dortmund,signal,iduna,germany',
    'dortmund': 'dortmund,westfalen,germany,industrial',
    'bayer leverkusen': 'leverkusen,bay,arena,germany',
    'leverkusen': 'germany,stadium,modern,rhein',
    'rb leipzig': 'leipzig,red,bull,arena,germany',
    'union berlin': 'berlin,olympiastadion,germany',
    'eintracht frankfurt': 'frankfurt,deutsch,bank,park',
    'vfl wolfsburg': 'wolfsburg,volkswagen,arena',
    'freiburg': 'freiburg,black,forest,germany',
    'hoffenheim': 'sinsheim,rhein,neckar,arena',
    'stuttgart': 'stuttgart,mercedes,benz,arena',
    'borussia monchengladbach': 'monchengladbach,germany,stadium',

    // Serie A
    'juventus': 'turin,juventus,stadium,italy',
    'inter milan': 'milan,san,siro,italy,cathedral',
    'inter': 'milan,duomo,italy,night,city',
    'ac milan': 'milan,san,siro,italy,fashion',
    'milan': 'milan,italy,galleria,duomo',
    'napoli': 'naples,diego,maradona,italy,vesuvius',
    'roma': 'rome,colosseum,olympic,stadium,italy',
    'atalanta': 'bergamo,italy,gewiss,stadium',
    'lazio': 'rome,olympic,italy,stadium',
    'fiorentina': 'florence,italy,arte,michele,cupola',
    'torino': 'turin,italy,alps,mountains',

    // Ligue 1
    'psg': 'paris,eiffel,tower,parc,des,princes,france',
    'paris saint-germain': 'paris,prince,park,france',
    'olympique marseille': 'marseille,velodrome,old,port,france',
    'marseille': 'marseille,france,mediterranean,calanque',
    'olympique lyon': 'lyon,groupama,stadium,france,rhone',
    'lyon': 'lyon,france,city,historic,night',
    'as monaco': 'monaco,louis,stadium,principality',
    'monaco': 'monaco,mediterranean,principality,luxury',
    'lille': 'lille,pierre,mauroy,france',
    'nice': 'nice,france,azur,coast,promenade,angel',
    'rennes': 'rennes,france,brittany,roazhon,park',
    'montpellier': 'montpellier,france,sun,mediterranean',
    'strasbourg': 'strasbourg,france,cathedral,europe,parliament'
};

/**
 * Get DYNAMIC stadium/city background image from Unsplash
 * Returns a different atmospheric image each time using random seed
 * @param {string} teamName - The team name
 * @returns {string} - Dynamic Unsplash image URL
 */
function getStadiumBackground(teamName) {
    const normalizedName = teamName.toLowerCase().trim();
    const keywords = STADIUM_BACKGROUNDS[normalizedName];

    if (!keywords) {
        // Fallback to generic stadium/city keywords
        const fallbackKeywords = 'stadium,football,soccer,city,night';
        const randomSeed = Math.floor(Math.random() * 1000);
        return `https://source.unsplash.com/1600x900/?${encodeURIComponent(fallbackKeywords)}&sig=${randomSeed}`;
    }

    // Generate random seed for variety - different image each time
    // This ensures that even for the same team, the background changes
    const randomSeed = Math.floor(Math.random() * 10000);

    // Build Unsplash Source URL with parameters
    // - Size: 1600x900 for HD quality
    // - Random seed: ensures different image each time
    // Keywords: city-specific (e.g., "paris,eiffel,tower" for PSG)
    const unsplashUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}&sig=${randomSeed}`;

    console.log(`🖼️ Dynamic background for ${teamName}: ${unsplashUrl}`);

    return unsplashUrl;
}

// ============================================
// TACTICAL RADAR CHART GENERATOR
// ============================================
/**
 * Create a tactical radar chart (spider web) comparing user vs team stats
 * @param {Object} userStats - User's tactical stats from sliders
 * @param {Object} teamStats - Team's tactical stats from TEAM_TACTICS_DB
 * @returns {string} SVG HTML of radar chart
 */
function createTacticalRadar(userStats, teamStats) {
    const metrics = [
        { key: 'wing_play', label: 'Bandas', user: userStats.wing_play, team: teamStats.wing_play },
        { key: 'possession', label: 'Posesión', user: userStats.possession, team: teamStats.possession },
        { key: 'counter_attack', label: 'Contraataque', user: userStats.counter_attack, team: teamStats.counter_attack },
        { key: 'aerial_balls', label: 'Aéreo', user: userStats.aerial_balls, team: teamStats.aerial_balls },
        { key: 'high_press', label: 'Presión', user: userStats.high_press, team: teamStats.high_press }
    ];

    // Radar chart dimensions
    const size = 200;
    const center = size / 2;
    const radius = size / 2 - 30;
    const angleStep = (Math.PI * 2) / metrics.length;

    // Generate polygon points
    let userPoints = '';
    let teamPoints = '';
    let axisLines = '';
    let labels = '';

    metrics.forEach((metric, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        // Axis line
        axisLines += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;

        // Label
        const labelX = center + (radius + 15) * Math.cos(angle);
        const labelY = center + (radius + 15) * Math.sin(angle);
        labels += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="#a0a5b9" font-size="9">${metric.label}</text>`;

        // User point
        const userValue = metric.user / 100;
        const userX = center + (radius * userValue) * Math.cos(angle);
        const userY = center + (radius * userValue) * Math.sin(angle);
        userPoints += `${userX},${userY} `;

        // Team point
        const teamValue = metric.team / 100;
        const teamX = center + (radius * teamValue) * Math.cos(angle);
        const teamY = center + (radius * teamValue) * Math.sin(angle);
        teamPoints += `${teamX},${teamY} `;
    });

    return `
        <div style="display: flex; justify-content: center; margin: 15px 0;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow: visible;">
                <!-- Background circle -->
                <circle cx="${center}" cy="${center}" r="${radius}" fill="rgba(102, 126, 234, 0.1)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

                <!-- Axis lines -->
                ${axisLines}

                <!-- Team polygon (blue) -->
                <polygon points="${teamPoints.trim()}" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" stroke-width="2"/>

                <!-- User polygon (green) -->
                <polygon points="${userPoints.trim()}" fill="rgba(34, 197, 94, 0.4)" stroke="#22c55e" stroke-width="2"/>

                <!-- Points -->
                ${metrics.map((metric, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const userValue = metric.user / 100;
                    const teamValue = metric.team / 100;
                    const userX = center + (radius * userValue) * Math.cos(angle);
                    const userY = center + (radius * userValue) * Math.sin(angle);
                    const teamX = center + (radius * teamValue) * Math.cos(angle);
                    const teamY = center + (radius * teamValue) * Math.sin(angle);
                    return `
                        <circle cx="${userX}" cy="${userY}" r="3" fill="#22c55e"/>
                        <circle cx="${teamX}" cy="${teamY}" r="3" fill="#3b82f6"/>
                    `;
                }).join('')}

                <!-- Labels -->
                ${labels}

                <!-- Legend -->
                <text x="${center}" y="${size + 20}" text-anchor="middle" fill="#a0a5b9" font-size="8">
                    <tspan x="${center}" dy="0">🟢 Tu estilo</tspan>
                    <tspan x="${center}" dy="12">🔵 Estilo equipo</tspan>
                </text>
            </svg>
        </div>
    `;
}

/**
 * Get tactical challenge (worst-fitting stat with advice)
 * @param {Object} userStats - User's tactical stats
 * @param {Object} teamStats - Team's tactical stats
 * @returns {Object} Challenge info with label, diff, and advice
 */
function getTacticalChallenge(userStats, teamStats) {
    const metrics = [
        {
            key: 'wing_play',
            label: 'juego por bandas',
            advice: 'Entrena desmarques y centros. El DT espera que abras el campo.',
            icon: '🏃'
        },
        {
            key: 'possession',
            label: 'posesión estática',
            advice: 'Mejora tu primer toque y p cortos. El sistema exige control.',
            icon: '⚽'
        },
        {
            key: 'counter_attack',
            label: 'transiciones ofensivas',
            advice: 'Practica aceleraciones tras recuperación. Verticalización clave.',
            icon: '⚡'
        },
        {
            key: 'aerial_balls',
            label: 'juego aéreo',
            advice: 'Trabaja timing de salto y ubicación. Los centros son vitales.',
            icon: '✈️'
        },
        {
            key: 'high_press',
            label: 'presión alta',
            advice: 'Entrena interceptaciones y anticipación. Defender desde arriba.',
            icon: '🔥'
        }
    ];

    // Find metric with biggest difference
    let worstMetric = metrics[0];
    let maxDiff = 0;

    metrics.forEach(metric => {
        const diff = Math.abs(userStats[metric.key] - teamStats[metric.key]);
        if (diff > maxDiff) {
            maxDiff = diff;
            worstMetric = metric;
        }
    });

    return {
        ...worstMetric,
        diff: maxDiff
    };
}

/**
 * Get manager's specific advice based on team and tactical match
 * @param {Object} team - Team data
 * @param {number} tacticalMatch - Tactical compatibility score
 * @returns {string} Manager advice
 */
function getManagerAdvice(team, tacticalMatch) {
    const teamName = team.name.toLowerCase().trim();
    const manager = MANAGER_STYLES[teamName];

    if (!manager) {
        return 'Adapta tu estilo al sistema del equipo. La profesionalidad es clave.';
    }

    if (tacticalMatch >= 85) {
        return `${manager.keyPhrase}`;
    } else if (tacticalMatch >= 70) {
        return `${manager.name}: "${manager.philosophy.split('.')[0]}."`;
    } else {
        return `Para el ${manager.style} de ${manager.name}, necesitas ajustar tu estilo.`;
    }
}

/**
 * Check if user's formation syncs with team's preferred formation
 * @param {string} userFormation - User's formation (e.g., "4-3-3")
 * @param {Object} team - Team data
 * @returns {Object} Sync status and label
 */
function checkFormationSync(userFormation, team) {
    const userFormationNormal = userFormation.replace(/_/g, '-');
    const teamName = team.name.toLowerCase().trim();
    const teamPrefs = TEAM_FORMATION_PREFERENCES[teamName];

    if (!teamPrefs) {
        return { hasSync: false, label: '' };
    }

    const exactMatch = teamPrefs.preferred.some(f => f === userFormationNormal);

    if (exactMatch) {
        return {
            hasSync: true,
            label: '✦ SINCRONÍA TÁCTICA ✦'
        };
    }

    // Check for similar formation
    const userParts = userFormationNormal.split('-').map(Number);
    const hasSimilar = teamPrefs.preferred.some(pref => {
        const prefParts = pref.split('-').map(Number);
        return userParts.every((part, i) => Math.abs(part - (prefParts[i] || 0)) <= 1);
    });

    if (hasSimilar) {
        return {
            hasSync: true,
            label: '✦ FORMACIÓN COMPATIBLE ✦'
        };
    }

    return { hasSync: false, label: '' };
}

/**
 * Animate counter from 0 to target value
 * @param {HTMLElement} element - Element containing the number
 * @param {number} target - Target value
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeOut);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Flash effect when complete
            element.style.transition = 'text-shadow 0.3s ease';
            element.style.textShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
            setTimeout(() => {
                element.style.textShadow = 'none';
            }, 300);
        }
    }

    requestAnimationFrame(update);
}

// ============================================
// TEAM COLORS FOR DYNAMIC GLOW EFFECTS
// ============================================

/**
 * Get team's primary and secondary colors for glow effects
 * @param {string} teamName - The team name
 * @returns {Object} - { primary: hex, secondary: hex, glow: rgba }
 */
function getTeamColors(teamName) {
    const normalizedName = teamName.toLowerCase().trim();

    const teamColors = {
        // ==================== LA LIGA ====================
        'fc barcelona': { primary: '#A50044', secondary: '#004D98', glow: 'rgba(165, 0, 68, 0.6)' },
        'barcelona': { primary: '#A50044', secondary: '#004D98', glow: 'rgba(165, 0, 68, 0.6)' },
        'real madrid': { primary: '#FFFFFF', secondary: '#1A1A1A', glow: 'rgba(255, 255, 255, 0.5)' },
        'atletico madrid': { primary: '#CB3524', secondary: '#3355A3', glow: 'rgba(203, 53, 36, 0.6)' },
        'athletic club': { primary: '#EE2523', secondary: '#FFFFFF', glow: 'rgba(238, 37, 35, 0.6)' },
        'athletic bilbao': { primary: '#EE2523', secondary: '#FFFFFF', glow: 'rgba(238, 37, 35, 0.6)' },
        'real betis': { primary: '#0BB363', secondary: '#FFFFFF', glow: 'rgba(11, 179, 99, 0.6)' },
        'sevilla': { primary: '#D40E2A', secondary: '#FFFFFF', glow: 'rgba(212, 14, 42, 0.6)' },
        'valencia': { primary: '#FFFFFF', secondary: '#000000', glow: 'rgba(255, 255, 255, 0.5)' },
        'villarreal': { primary: '#FFE500', secondary: '#004790', glow: 'rgba(255, 229, 0, 0.6)' },
        'real sociedad': { primary: '#0067B1', secondary: '#FFFFFF', glow: 'rgba(0, 103, 177, 0.6)' },
        'celta vigo': { primary: '#E03028', secondary: '#FFFFFF', glow: 'rgba(224, 48, 40, 0.6)' },

        // ==================== PREMIER LEAGUE ====================
        'manchester city': { primary: '#6CABDD', secondary: '#1C2C5B', glow: 'rgba(108, 171, 221, 0.6)' },
        'manchester united': { primary: '#DA291C', secondary: '#000000', glow: 'rgba(218, 41, 28, 0.6)' },
        'liverpool': { primary: '#C8102E', secondary: '#00B2A9', glow: 'rgba(200, 16, 46, 0.6)' },
        'arsenal': { primary: '#EF0107', secondary: '#FFFFFF', glow: 'rgba(239, 1, 7, 0.6)' },
        'chelsea': { primary: '#034694', secondary: '#DBA111', glow: 'rgba(3, 70, 148, 0.6)' },
        'tottenham': { primary: '#132257', secondary: '#FFFFFF', glow: 'rgba(19, 34, 87, 0.6)' },
        'aston villa': { primary: '#95BFE5', secondary: '#680A7F', glow: 'rgba(149, 191, 229, 0.6)' },
        'newcastle': { primary: '#000000', secondary: '#FFFFFF', glow: 'rgba(0, 0, 0, 0.6)' },
        'everton': { primary: '#003399', secondary: '#FFFFFF', glow: 'rgba(0, 51, 153, 0.6)' },
        'west ham': { primary: '#7A263A', secondary: '#00A650', glow: 'rgba(122, 38, 58, 0.6)' },
        'brighton': { primary: '#0057B8', secondary: '#FFFFFF', glow: 'rgba(0, 87, 184, 0.6)' },
        'leicester': { primary: '#003090', secondary: '#FDBE00', glow: 'rgba(0, 48, 144, 0.6)' },
        'leeds': { primary: '#FFCD00', secondary: '#FFFFFF', glow: 'rgba(255, 205, 0, 0.6)' },

        // ==================== BUNDESLIGA ====================
        'bayern munich': { primary: '#DC052D', secondary: '#FFFFFF', glow: 'rgba(220, 5, 45, 0.6)' },
        'bayern': { primary: '#DC052D', secondary: '#FFFFFF', glow: 'rgba(220, 5, 45, 0.6)' },
        'borussia dortmund': { primary: '#FDE100', secondary: '#000000', glow: 'rgba(253, 225, 0, 0.6)' },
        'dortmund': { primary: '#FDE100', secondary: '#000000', glow: 'rgba(253, 225, 0, 0.6)' },
        'bayer leverkusen': { primary: '#E32221', secondary: '#000000', glow: 'rgba(227, 34, 33, 0.6)' },
        'leverkusen': { primary: '#E32221', secondary: '#000000', glow: 'rgba(227, 34, 33, 0.6)' },
        'rb leipzig': { primary: '#DD0741', secondary: '#FFFFFF', glow: 'rgba(221, 7, 65, 0.6)' },
        'union berlin': { primary: '#E30613', secondary: '#FFFFFF', glow: 'rgba(227, 6, 19, 0.6)' },
        'eintracht frankfurt': { primary: '#E1000F', secondary: '#000000', glow: 'rgba(225, 0, 15, 0.6)' },
        'vfl wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF', glow: 'rgba(101, 179, 46, 0.6)' },
        'wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF', glow: 'rgba(101, 179, 46, 0.6)' },
        'freiburg': { primary: '#E30613', secondary: '#000000', glow: 'rgba(227, 6, 19, 0.6)' },
        'hoffenheim': { primary: '#1A3B8C', secondary: '#006CB6', glow: 'rgba(26, 59, 140, 0.6)' },
        'stuttgart': { primary: '#E32219', secondary: '#000000', glow: 'rgba(227, 34, 25, 0.6)' },

        // ==================== SERIE A ====================
        'juventus': { primary: '#000000', secondary: '#FFFFFF', glow: 'rgba(0, 0, 0, 0.6)' },
        'inter milan': { primary: '#0068A8', secondary: '#000000', glow: 'rgba(0, 104, 168, 0.6)' },
        'inter': { primary: '#0068A8', secondary: '#000000', glow: 'rgba(0, 104, 168, 0.6)' },
        'ac milan': { primary: '#FB090B', secondary: '#000000', glow: 'rgba(251, 9, 11, 0.6)' },
        'milan': { primary: '#FB090B', secondary: '#000000', glow: 'rgba(251, 9, 11, 0.6)' },
        'napoli': { primary: '#12A0D7', secondary: '#FFFFFF', glow: 'rgba(18, 160, 215, 0.6)' },
        'roma': { primary: '#8E1F2F', secondary: '#F0BC26', glow: 'rgba(142, 31, 47, 0.6)' },
        'atalanta': { primary: '#1E71B8', secondary: '#FFFFFF', glow: 'rgba(30, 113, 184, 0.6)' },
        'lazio': { primary: '#87CEEB', secondary: '#FFFFFF', glow: 'rgba(135, 206, 235, 0.6)' },
        'fiorentina': { primary: '#6B2E8A', secondary: '#FFFFFF', glow: 'rgba(107, 46, 138, 0.6)' },
        'torino': { primary: '#8B0000', secondary: '#F4F6FF', glow: 'rgba(139, 0, 0, 0.6)' },

        // ==================== LIGUE 1 ====================
        'psg': { primary: '#004170', secondary: '#DA291C', glow: 'rgba(0, 65, 112, 0.6)' },
        'paris saint-germain': { primary: '#004170', secondary: '#DA291C', glow: 'rgba(0, 65, 112, 0.6)' },
        'olympique marseille': { primary: '#0094DA', secondary: '#FFFFFF', glow: 'rgba(0, 148, 218, 0.6)' },
        'marseille': { primary: '#0094DA', secondary: '#FFFFFF', glow: 'rgba(0, 148, 218, 0.6)' },
        'olympique lyon': { primary: '#004170', secondary: '#0097D2', glow: 'rgba(0, 65, 112, 0.6)' },
        'lyon': { primary: '#004170', secondary: '#0097D2', glow: 'rgba(0, 65, 112, 0.6)' },
        'as monaco': { primary: '#E6173F', secondary: '#FFFFFF', glow: 'rgba(230, 23, 63, 0.6)' },
        'monaco': { primary: '#E6173F', secondary: '#FFFFFF', glow: 'rgba(230, 23, 63, 0.6)' },
        'lille': { primary: '#E30613', secondary: '#FFFFFF', glow: 'rgba(227, 6, 19, 0.6)' },
        'nice': { primary: '#000000', secondary: '#E30613', glow: 'rgba(0, 0, 0, 0.6)' },
        'rennes': { primary: '#E30613', secondary: '#000000', glow: 'rgba(227, 6, 19, 0.6)' }
    };

    return teamColors[normalizedName] || { primary: '#667eea', secondary: '#764ba2', glow: 'rgba(102, 126, 234, 0.6)' };
}

/**
 * Get team's color from TEAM_TACTICS_DB or getTeamColors
 * Used for CSS variable --team-color
 * @param {string} teamName - The team name
 * @returns {string} - Team color hex
 */
function getTeamColorFromTactics(teamName) {
    const normalizedName = teamName.toLowerCase().trim();

    // First check TEAM_TACTICS_DB if it has color
    if (TEAM_TACTICS_DB[normalizedName]?.color) {
        return TEAM_TACTICS_DB[normalizedName].color;
    }

    // Fallback to getTeamColors primary color
    const colors = getTeamColors(teamName);
    return colors.primary;
}

/**
 * Get icon for different stat types
 * @param {string} type - The type of stat
 * @returns {string} - Emoji icon
 */
function getStatIcon(type) {
    const icons = {
        'position': '📍',
        'competition': '⚔️',
        'rating': '⭐',
        'status': '📋',
        'growth': '📈',
        'style': '🎨',
        'formation': '📋',
        'manager': '🗣️',
        'tactical': '🎯',
        'potential': '🔥'
    };
    return icons[type] || '📊';
}

// ============================================
// TEAM LOGO MAPPING - Links team names to SVG files
// ============================================

/**
 * Get the logo path for a team based on its name and league
 * @param {string} teamName - The team name from database
 * @param {string} league - The league name
 * @returns {string|null} - Logo path or null if not found
 */
function getTeamLogoPath(teamName, league) {
    const normalizedName = teamName.toLowerCase().trim();

    // Mapping from database team names to actual SVG filenames
    const teamLogoMap = {
        // ==================== LA LIGA ====================
        'fc barcelona': 'Fútbol Club Barcelona.svg',
        'real madrid': 'Real madrid.svg',
        'atletico madrid': 'Club Atlético de Madrid.svg',
        'athletic club': 'Athletic Club(Bilbao).svg',
        'athletic bilbao': 'Athletic Club(Bilbao).svg',
        'real betis': 'Real Betis Balompié.svg',
        'real sociedad': 'Real Sociedad de Fútbol.svg',
        'real valladolid': 'Real Valladolid Club de Fútbol.svg',
        'celta vigo': 'Real Club Celta de Vigo.svg',
        'celta de vigo': 'Real Club Celta de Vigo.svg',
        'sevilla': 'Sevilla Fútbol Club.svg',
        'valencia': 'Valencia.svg',
        'villarreal': 'Villareal.svg',
        'getafe': 'Getafe.svg',
        'granada': 'Granada Club de Fútbol.svg',
        'levante': 'Levante.svg',
        'osasuna': 'Club Atlético Osasuna.svg',
        'cadiz': 'Cádiz Club de Fútbol.svg',
        'alaves': 'Deportivo Alavés.svg',
        'elche': 'Elche Club de Fútbol.svg',
        'eibar': 'Sociedad Deportiva Eibar.svg',
        'huesca': 'Sociedad Deportiva Huesca.svg',

        // ==================== PREMIER LEAGUE ====================
        'manchester city': 'Manchester City F.C..svg',
        'manchester united': 'Manchester United F.C..svg',
        'liverpool': 'Liverpool F.C..svg',
        'arsenal': 'Arsenal F.C..svg',
        'chelsea': 'Chelsea F.C..svg',
        'tottenham': 'Tottenham Hotspur F.C..svg',
        'aston villa': 'Aston Villa F.C..svg',
        'newcastle': 'Newcastle United F.C..svg',
        'everton': 'Everton F.C..svg',
        'west ham': 'West Ham United F.C..svg',
        'brighton': 'Brighton & Hove Albion F.C..svg',
        'leicester': 'Leicester City F.C..svg',
        'leeds': 'Leeds United F.C..svg',
        'wolves': 'Wolverhampton Wanderers F.C..svg',
        'fulham': 'Fulham F.C..svg',
        'crystal palace': 'Crystal Palace F.C..svg',
        'southampton': 'Southampton F.C..svg',
        'burnley': 'Burnley F.C..svg',
        'west brom': 'West Bromwich Albion F.C..svg',
        'sheffield united': 'Sheffield United F.C..svg',

        // ==================== BUNDESLIGA ====================
        'bayern munich': 'Fußball-Club Bayern München e.V..svg',
        'bayern': 'Fußball-Club Bayern München e.V..svg',
        'borussia dortmund': 'Ballspielverein Borussia 09 e.V. Dortmund,.svg',
        'dortmund': 'Ballspielverein Borussia 09 e.V. Dortmund,.svg',
        'bayer leverkusen': 'Bayer 04 Leverkusen Fußball GmbH.svg',
        'leverkusen': 'Bayer 04 Leverkusen Fußball GmbH.svg',
        'rb leipzig': 'RasenBallsport Leipzig e. V..svg',
        'union berlin': '1. Fußballclub Union Berlin e. V.svg',
        'eintracht frankfurt': 'Eintracht Frankfurt e.V..svg',
        'frankfurt': 'Eintracht Frankfurt e.V..svg',
        'vfl wolfsburg': 'VfL Wolfsburg-Fußball GmbH.svg',
        'wolfsburg': 'VfL Wolfsburg-Fußball GmbH.svg',
        'freiburg': 'Sport-Club Freiburg e.V..svg',
        'hoffenheim': 'Turn-und Sportgemeinschaft 1899 Hoffenheim e.V..svg',
        'stuttgart': 'Verein für Bewegungsspiele Stuttgart 1893 e. V..svg',
        'borussia monchengladbach': 'Borussia Verein-für Leibesübungen Mönchengladbach.svg',
        'bayer 04': 'Bayer 04 Leverkusen Fußball GmbH.svg',
        'fc koln': 'Fußball-Club Köln 0107 e. V.(Colonia).svg',
        'mainz': '1. Fußball- und Sportverein Mainz 05 e.V..svg',
        'augsburg': 'Fußball-Club Augsburg 1907 e. V..svg',
        'hertha berlin': 'Hertha Berliner Sport-Club von 1892 e.V..svg',
        'bremen': 'Sportverein Werder Bremen von 1899 e. V..svg',
        'arminia': 'Arminia Bielefeld.svg',
        'schalke': 'Fußball-Club Gelsenkirchen-Schalke 04 e.V..svg',

        // ==================== SERIE A ====================
        'juventus': 'Juventus Football Club.svg',
        'inter milan': 'Football Club Internazionale Milano.svg',
        'inter': 'Football Club Internazionale Milano.svg',
        'ac milan': 'Associazione Calcio Milan.svg',
        'milan': 'Associazione Calcio Milan.svg',
        'napoli': 'Società Sportiva Calcio Napoli.svg',
        'roma': 'Associazione Sportiva Roma.svg',
        'atalanta': 'Atalanta Bergamasca Calcio.svg',
        'lazio': 'Società Sportiva Lazio.svg',
        'fiorentina': 'ACF Fiorentina.svg',
        'torino': 'Torino Football Club.svg',
        'bologna': 'Bologna Football Club 1909.svg',
        'sassuolo': 'Unione Sportiva Sassuolo Calcio.svg',
        'sampdoria': 'Unione Calcio Sampdoria.svg',
        'udinese': 'Udinese Calcio.svg',
        'spezia': 'Spezia Calcio.svg',
        'verona': 'Hellas Verona Football Club.svg',
        'genoa': 'Genoa Cricket and Football Club.svg',
        'cagliari': 'Cagliari Calcio.svg',
        'parma': 'Parma Calcio 1913 Club.svg',
        'crotone': 'F.C. Crotone.svg',
        'benevento': 'Benevento Calcio.svg',

        // ==================== LIGUE 1 ====================
        'psg': 'Paris Saint-Germain Football Club.svg',
        'paris saint-germain': 'Paris Saint-Germain Football Club.svg',
        'olympique marseille': 'Olympique De Marseille.svg',
        'marseille': 'Olympique De Marseille.svg',
        'olympique lyon': 'Olympique Lyonnais.svg',
        'lyon': 'Olympique Lyonnais.svg',
        'as monaco': 'Association sportive de Monaco football club.svg',
        'monaco': 'Association sportive de Monaco football club.svg',
        'lille': 'LOSC Lille.svg',
        'nice': 'Olympique Gymnaste Club de Nice.svg',
        'rennes': 'Stade Rennais Football Club (SRFC).svg',
        'strasbourg': 'Racing Club de Strasbourg Alsace.svg',
        'lens': 'Racing Club de Lens.svg',
        'montpellier': 'Montpellier Hérault Sport Club.svg',
        'brest': 'Stade Brestois 29.svg',
        'reims': 'Stade de Reims.svg',
        'nantes': 'Football Club de Nantes.svg',
        'bordeaux': 'Football Club des Girondins de Bordeaux.svg',
        'metz': 'Football Club de Metz.svg',
        'lorient': 'Football Club de Lorient.svg',
        'dijon': 'Dijon Football Côte d\'Or.svg',
        'nimes': 'Nîmes Olympique.svg',
        'angiers': 'Angers Sporting club De l\'Ouest.svg',
        'saint-etienne': 'Association Sportive de Saint-Étienne Loire.svg'
    };

    // Get the filename from the map
    const logoFilename = teamLogoMap[normalizedName];

    if (!logoFilename) {
        console.log(`⚠️ No logo found for: ${normalizedName} (${league})`);
        return null;
    }

    // Map league to folder path
    // NOTE: Logos are in root folders, NOT in a "logos" folder
    // NOTE: "United Kindom" is the actual folder name in the repo (typo preserved)
    let leagueFolder = '';
    if (league === 'La Liga') {
        leagueFolder = 'Espana/Primera División de España';
    } else if (league === 'Premier League') {
        // IMPORTANT: Repo has "United Kindom" (with typo), NOT "United Kingdom"
        leagueFolder = 'United Kindom/Premier League';
    } else if (league === 'Bundesliga') {
        leagueFolder = 'Alemania/Bundesliga';
    } else if (league === 'Serie A') {
        leagueFolder = 'Italia/Serie A';
    } else if (league === 'Ligue 1') {
        leagueFolder = 'Francia/Ligue 1';
    } else {
        // Fallback for unknown leagues
        leagueFolder = `${league}`;
    }

    // Encode the filename to handle spaces, accents, and special characters
    // This ensures URLs work correctly in mobile browsers and Netlify
    const encodedFilename = encodeURIComponent(logoFilename);

    // Construct ABSOLUTE path from root (works on Netlify and all environments)
    const logoPath = `/${leagueFolder}/${encodedFilename}`;

    console.log(`✅ Logo path for ${teamName} (${league}): ${logoPath}`);
    console.log(`📁 Original filename: ${logoFilename}`);
    console.log(`🔐 Encoded filename: ${encodedFilename}`);
    return logoPath;
}

// Generate initials for CSS fallback crest
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

    // Find all players in user's EXACT position only (no similar positions)
    const positionPlayers = team.squad_gaps.filter(p => p.position === userPosition);

    // If no exact matches, ONLY then try similar positions as fallback
    let allCompetitors = [...positionPlayers];

    if (allCompetitors.length === 0) {
        console.warn(`⚠️ No exact matches for position ${userPosition}, trying similar positions`);

        // Position mapping for similar positions (FALLBACK ONLY)
        const positionMap = {
            'ST': ['CF'],
            'CF': ['ST'],
            'CAM': ['CM'],
            'CM': ['CAM', 'CDM'],
            'CDM': ['CM'],
            'LW': ['LM'],
            'RW': ['RM'],
            'LM': ['LW'],
            'RM': ['RW'],
            'LB': ['LWB'],
            'RB': ['RWB'],
            'LWB': ['LB'],
            'RWB': ['RB'],
            'CB': ['CDM'],
            'GK': ['GK']
        };

        // Add players from SIMILAR positions only (removed CAM from ST, CB from CM, etc.)
        const similarPositions = positionMap[userPosition] || [];
        similarPositions.forEach(similarPos => {
            const similarPlayers = team.squad_gaps.filter(p => p.position === similarPos);
            allCompetitors = [...allCompetitors, ...similarPlayers];
        });
    }

    // If still no competitors found, use ALL players from team
    if (allCompetitors.length === 0) {
        console.warn(`⚠️ No players found for position ${userPosition}, using all players`);
        allCompetitors = [...team.squad_gaps];
    }

    // Sort by rating (highest first)
    allCompetitors.sort((a, b) => b.rating - a.rating);

    // Get the strongest competitor (STAR PLAYER in this position)
    const strongestCompetitor = allCompetitors[0] || {
        player: 'Jugador promedio',
        rating: 75,
        age: 25,
        is_star: false
    };

    // Mark as STAR if rating is elite (85+ for position starters)
    strongestCompetitor.is_star = strongestCompetitor.rating >= 85;

    console.log(`✅ Found ${strongestCompetitor.is_star ? '⭐ STAR PLAYER' : 'competitor'}: ${strongestCompetitor.player} (${strongestCompetitor.rating} OVR, ${strongestCompetitor.age} anos)`);

    // Get manager info for professional analysis
    const teamName = team.name.toLowerCase().trim();
    const manager = MANAGER_STYLES[teamName];
    const managerName = manager ? manager.name : 'el DT';

    // Calculate competition type with specific stat analysis
    const ratingDiff = playerRating - strongestCompetitor.rating;
    let competitionType;
    let competitionText;

    if (ratingDiff > 5) {
        competitionType = 'STAR';
        competitionText = `Con tu ${playerRating} OVR, superas al ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR) por ${ratingDiff} puntos. Eres la estrella de esta posicion para ${managerName}.`;
    } else if (ratingDiff >= 2) {
        competitionType = 'STARTER';
        competitionText = `Tu ${playerRating} OVR supera al ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR). Serias titular indiscutible bajo el mando de ${managerName}.`;
    } else if (ratingDiff >= -2) {
        competitionType = 'BATTLE';
        if (playerRating >= 88) {
            competitionText = `Con tus ${playerRating} OVR, compites directamente con el ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR). ${managerName} valorara tu nivel mundial en la rotacion.`;
        } else {
            competitionText = `Tu ${playerRating} OVR iguala al ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR). Pelea el puesto en los planes de ${managerName}.`;
        }
    } else if (ratingDiff >= -5) {
        competitionType = 'ROTATION';
        competitionText = `El ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR) esta una fase por encima de tu ${playerRating} OVR. Llegas como suplente de lujo con minutos garantizados.`;
    } else {
        competitionType = 'BENCH';
        competitionText = `El ${strongestCompetitor.is_star ? 'crack ' : ''}${strongestCompetitor.player} (${strongestCompetitor.rating} OVR) es el dueno de la posicion con ${Math.abs(ratingDiff)} puntos sobre tu ${playerRating} OVR. Necesitas desarrollarte antes de aspirar al sistema de ${managerName}.`;
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
 * Filter teams by player rating tier AND game mode (RTG vs Star) - GUARANTEED RESULTS
 */
function filterTeamsByPlayerTier(playerRating, teams, gameMode) {
    const gameModeType = gameMode || 'star'; // 'rtg' or 'star'

    console.log(`🔍 Filter: Rating=${playerRating}, Mode=${gameModeType}, Total Teams=${teams.length}`);

    // RTG MODE: Small teams to grow (SUPER RELAXED - ALWAYS returns teams)
    if (gameModeType === 'rtg') {
        // NO FILTERS AT ALL - just sort by rating ascending (worst teams first for RTG)
        const sortedTeams = [...teams].sort((a, b) => a.overall_level - b.overall_level);
        console.log(`🌟 RTG Mode: Returning ALL ${Math.min(10, sortedTeams.length)} teams (worst to best)`);
        return sortedTeams.slice(0, 10);
    }

    // STAR MODE: Elite teams where player is already good (GUARANTEED RESULTS)
    if (gameModeType === 'star') {
        // SUPER ÉLITE (88+): Prioritize REAL elite teams
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

            // Combine but GUARANTEE at least 3 teams
            let result = [...superEliteTeams, ...otherEliteTeams];
            if (result.length < 3) {
                result.push(...allOtherTeams.slice(0, 3 - result.length));
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

            // GUARANTEE at least 3 teams
            let result = [...eliteTeams];
            if (result.length < 3) {
                result.push(...allOtherTeams.slice(0, 3 - result.length));
            }

            console.log(`⭐ Elite Mode: ${result.length} teams (Elite: ${eliteTeams.length})`);
            return result.slice(0, 10);
        }
    }

    // For LOW-RATED players: Return ALL teams sorted by rating (best teams first)
    // GUARANTEE at least 3 teams NO MATTER WHAT
    const sortedTeams = [...teams].sort((a, b) => b.overall_level - a.overall_level);
    const result = sortedTeams.slice(0, Math.max(3, Math.min(10, sortedTeams.length)));

    console.log(`✅ Regular Mode: Returning ${result.length} teams (GUARANTEED minimum 3)`);
    return result;
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

    console.log(`👤 Player: Rating=${playerRating}, Age=${playerAge}, Position=${answers.position}, Formation=${answers.formation}, GameMode=${answers.game_mode}`);

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
    let teamsByTier = filterTeamsByPlayerTier(playerRating, fc26Database.teams, gameMode);

    console.log(`🔍 Teams after tier filter: ${teamsByTier.length}`);

    // CRITICAL: Ensure we ALWAYS have at least 3 teams to analyze
    // If not enough teams in selected leagues, expand to all major leagues
    let teamAnalysis = teamsByTier
        .filter(team => {
            const teamLeagueId = getLeagueId(team.league);
            return selectedLeagues.includes(teamLeagueId);
        })
        .map(team => {
            // Get user's selected formation
            const userFormationId = answers.formation || '4_3_3';

            const styleMatch = calculateStyleCompatibility(userStyle, team.style);
            const formationMatch = calculateFormationCompatibility(userFormationId, team);
            const tacticalMatch = calculateTacticalCompatibility(team); // NEW: Uses TEAM_TACTICS_DB

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

            // Calculate final score with ALL factors including REAL tactical data
            const finalScore = (styleMatch * 0.20) + (formationMatch * 0.15) + (tacticalMatch * 0.25) + startingBonus + (growthPotential * 0.15) + (generationalBonus * 0.10) + (difficultyPenalty * 0.25);

            return {
                team: team,
                styleMatch: styleMatch,
                tacticalMatch: tacticalMatch, // NEW: Real tactical compatibility using TEAM_TACTICS_DB
                formationMatch: formationMatch,
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

    // EXPANSION LOGIC: If we have less than 3 teams, expand to other leagues
    if (teamAnalysis.length < 3) {
        console.log(`⚠️ Only ${teamAnalysis.length} teams found. Expanding to all major leagues...`);

        const allLeagues = ['la_liga', 'premier_league', 'bundesliga', 'serie_a', 'ligue_1'];
        const additionalLeagues = allLeagues.filter(league => !selectedLeagues.includes(league));

        console.log(`🌍 Expanding to: ${additionalLeagues.join(', ')}`);

        // Analyze teams from additional leagues
        const additionalTeams = teamsByTier
            .filter(team => {
                const teamLeagueId = getLeagueId(team.league);
                return additionalLeagues.includes(teamLeagueId);
            })
            .map(team => {
                const userFormationId = answers.formation || '4_3_3';
                const styleMatch = calculateStyleCompatibility(userStyle, team.style);
                const formationMatch = calculateFormationCompatibility(userFormationId, team);
                const tacticalMatch = calculateTacticalCompatibility(team);
                const userPosition = answers.position || findBestPosition(playerRating, team.squad_gaps).position;
                const competition = analyzeRealCompetition(playerRating, userPosition, team);
                const wouldStart = competition.wouldStart;
                const tooDifficult = competition.ratingDiff < -7;
                const growthPotential = calculateGrowthPotential(playerRating, team.overall_level, wouldStart);
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

                const finalScore = (styleMatch * 0.20) + (formationMatch * 0.15) + (tacticalMatch * 0.25) + startingBonus + (growthPotential * 0.15) + (generationalBonus * 0.10) + (difficultyPenalty * 0.25);

                return {
                    team: team,
                    styleMatch: styleMatch,
                    tacticalMatch: tacticalMatch,
                    formationMatch: formationMatch,
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

        // Merge results
        teamAnalysis = [...teamAnalysis, ...additionalTeams]
            .sort((a, b) => b.finalScore - a.finalScore);

        console.log(`✅ After expansion: ${teamAnalysis.length} teams available`);
    }

    console.log(`📊 Team Analysis Complete: ${teamAnalysis.length} teams analyzed`);

    // CRITICAL: ALWAYS show top 3 results, NO MATTER THE SCORE
    // This ensures users always get recommendations
    const top3 = teamAnalysis.slice(0, Math.min(3, teamAnalysis.length));
    console.log(`✅ Top ${top3.length} results selected`);

    // Check if results have low compatibility for fallback messaging
    const hasLowCompatibility = top3.length > 0 && top3[0].finalScore < 50;
    console.log(hasLowCompatibility ? '⚠️ Low compatibility scores - using fallback messaging' : '✅ Good compatibility scores');

    // Display results with compatibility warning if needed
    displayResults(top3, playerRating, hasLowCompatibility);
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
function displayResults(results, playerRating, hasLowCompatibility = false) {
    console.log(`🎯 Displaying ${results.length} results for player rating ${playerRating}`);
    console.log(`📊 Has low compatibility: ${hasLowCompatibility}`);

    // CRITICAL: Always show results - NO MORE BLOCKING
    // We guarantee at least 3 results from the analysis function

    hideAllScreens();

    document.getElementById('resultPlayerRating').textContent = playerRating;

    const container = document.getElementById('resultsContainer');

    // Intro message based on compatibility
    if (hasLowCompatibility) {
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1)); border-radius: 10px; border: 1px solid rgba(255, 152, 0, 0.3);">
                <h3 style="color: #ffc107; margin: 0 0 10px 0; font-size: 1.2rem;">💡 Tu estilo es único</h3>
                <p style="color: #a0a5b9; margin: 0; font-size: 0.95rem;">
                    Aunque tus preferencias son muy específicas, estos son los clubes donde mejor podrías adaptarte.
                    <br><strong>La perfección requiere adaptación mutua.</strong>
                </p>
            </div>
            <div id="resultsCards"></div>
        `;
    } else {
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #667eea; margin: 0; font-size: 1.3rem;">🎯 ¡Encontramos tu equipo ideal!</h2>
            </div>
            <div id="resultsCards"></div>
        `;
    }

    const resultsContainer = document.getElementById('resultsCards');
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

        // Team logo: Use SVG file if available, fallback to CSS crest with initials
        const teamLogoPath = getTeamLogoPath(team.name, team.league);
        const teamInitials = team.team_initials || getTeamInitials(team.name);

        const teamLogoHtml = teamLogoPath
            ? `<div class="team-logo-wrapper">
                <img src="${teamLogoPath}" alt="${team.name}" class="team-logo-img" style="width:50px;height:50px;object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="team-logo-circular" style="display:none;">${teamInitials}</div>
            </div>`
            : `<div class="team-logo-circular">${teamInitials}</div>`;

        // Dynamic analysis
        const dynamicAnalysis = generateDynamicAnalysis(result, playerRating);

        // Get tactical stats for radar chart
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

        // Generate radar chart
        const radarChart = createTacticalRadar(userTacticalStats, teamTacticalStats);

        // Get tactical challenge
        const challenge = getTacticalChallenge(userTacticalStats, teamTacticalStats);
        const showTacticalChallenge = challenge.diff > 15;

        // Get stadium atmosphere
        const stadiumInfo = STADIUM_ATMOSPHERE[team.name.toLowerCase().trim()];
        const stadiumHtml = stadiumInfo ? `
            <div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 0.85rem; line-height: 1.5;">
                <div style="color: #a0a5b9; margin-bottom: 4px;">🏟️ <strong>${stadiumInfo.city}</strong> - ${stadiumInfo.weather}</div>
                <div style="color: #667eea; font-style: italic;">"${stadiumInfo.atmosphere}"</div>
            </div>
        ` : '';

        // Get manager advice
        const managerAdvice = getManagerAdvice(team, result.tacticalMatch);

        // Check formation sync
        const userFormation = answers.formation || '4-3-3';
        const formationSync = checkFormationSync(userFormation, team);
        const formationBadge = formationSync.hasSync ? `
            <div style="margin-top: 8px; text-align: center;">
                <span style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: #000; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;">
                    ${formationSync.label}
                </span>
            </div>
        ` : '';

        // Get team colors for dynamic glow
        const teamColors = getTeamColors(team.name);
        const cardStyle = `
            --team-primary: ${teamColors.primary};
            --team-glow: ${teamColors.glow};
            --team-secondary: ${teamColors.secondary};
        `;

        html += `
            <div class="result-card ${statusClass} ${eliteClass} cascade-entry" style="animation-delay: ${index * 0.15}s; ${cardStyle}" data-team-color="${teamColors.primary}">
                <!-- Team glow effect -->
                <div class="team-glow-effect"></div>

                <div class="result-header">
                    <span class="result-rank cascade-element" data-delay="0">${medal}</span>
                    ${teamLogoHtml}
                    <div class="result-team-info">
                        <div class="result-team-name cascade-element" data-delay="1">${team.name}</div>
                        <div class="result-league cascade-element" data-delay="2">${leagueLogoHtml} ${team.league}</div>
                    </div>
                    <div class="team-rating-badge ${isElite ? 'elite-rating' : ''} cascade-element" data-delay="3">
                        ${team.overall_level}
                    </div>
                </div>

                <div class="result-score cascade-element" data-delay="4">
                    <div class="result-score-value" data-animate-score="${result.finalScore.toFixed(0)}">0</div>
                    <div class="result-score-label">Score de compatibilidad</div>
                    <!-- Animated Progress Bar -->
                    <div class="compatibility-progress-bar">
                        <div class="compatibility-progress-fill" data-progress="${result.finalScore.toFixed(0)}">
                            <span class="compatibility-progress-text">${result.finalScore.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                ${formationBadge}

                ${difficultyWarning}
                ${generationalBonusText}

                <!-- TACTICAL RADAR CHART -->
                <div class="glassmorphism-card cascade-element" data-delay="5">
                    <h4 style="margin: 0 0 10px 0; color: #667eea; font-size: 0.9rem; text-align: center;">📊 Radar Táctico</h4>
                    ${radarChart}
                </div>

                ${showTacticalChallenge ? `
                <!-- TACTICAL CHALLENGE -->
                <div class="glassmorphism-card tactical-challenge cascade-element" data-delay="6">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 1.1rem;">${challenge.icon}</span>
                        <strong style="color: #ffc107; font-size: 0.85rem;">DESAFÍO TÁCTICO</strong>
                    </div>
                    <div style="color: #a0a5b9; font-size: 0.85rem; line-height: 1.4;">
                        Tu ${challenge.label} difiere del equipo. <br>
                        <span style="color: #667eea;">${challenge.advice}</span>
                    </div>
                </div>
                ` : ''}

                <!-- MANAGER ADVICE -->
                <div class="glassmorphism-card manager-advice cascade-element" data-delay="7">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span>🗣️</span>
                        <strong style="color: #667eea; font-size: 0.8rem;">CONSEJO DEL MISTER</strong>
                    </div>
                    <div style="color: #a0a5b9; font-size: 0.8rem; font-style: italic; line-height: 1.4;">
                        ${managerAdvice}
                    </div>
                </div>

                <div class="result-analysis cascade-element" data-delay="8">
                    ${dynamicAnalysis}
                </div>

                ${stadiumHtml}

                <div class="result-details cascade-element" data-delay="9">
                    <div class="result-detail-row">
                        <span class="result-detail-label">${getStatIcon('position')} Posición ideal:</span>
                        <span class="result-detail-value">${positionLabels[result.bestPosition.position] || result.bestPosition.position}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">${getStatIcon('competition')} Competencia directa:</span>
                        <span class="result-detail-value">${result.bestPosition.currentPlayer} (${result.bestPosition.currentRating})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">${getStatIcon('rating')} Tu media:</span>
                        <span class="result-detail-value">${playerRating} (${ratingDiffText})</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">${getStatIcon('status')} Estado:</span>
                        <span class="result-detail-value">${statusText}</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-detail-label">Potencial de crecimiento:</span>
                        <span class="result-detail-value">+${result.growthPotential.toFixed(1)} puntos</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-label">${getStatIcon('growth')} Potencial de crecimiento:</span>
                        <span class="result-detail-value">+${result.growthPotential.toFixed(1)} puntos</span>
                    </div>
                    <div class="result-detail-row">
                        <span class="result-label">${getStatIcon('tactical')} Estilo del equipo:</span>
                        <span class="result-detail-value">${result.styleMatch.toFixed(0)}% compatible</span>
                    </div>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;

    document.getElementById('resultsScreen').classList.add('active');

    // Animate compatibility scores and progress bars
    results.forEach((result, index) => {
        setTimeout(() => {
            // Animate score counter
            const scoreElement = document.querySelector(`[data-animate-score="${result.finalScore.toFixed(0)}"]`);
            if (scoreElement) {
                animateCounter(scoreElement, result.finalScore);
            }

            // Animate progress bar
            const progressElement = document.querySelector(`[data-progress="${result.finalScore.toFixed(0)}"]`);
            if (progressElement) {
                setTimeout(() => {
                    progressElement.style.width = `${result.finalScore}%`;
                }, 100);
            }

            // Trigger cascade animations for this card
            const card = resultsContainer.children[index];
            if (card) {
                const cascadeElements = card.querySelectorAll('.cascade-element');
                cascadeElements.forEach(el => {
                    const delay = parseInt(el.dataset.delay) || 0;
                    setTimeout(() => {
                        el.classList.add('cascade-visible');
                    }, delay * 100);
                });
            }
        }, index * 150 + 300);
    });

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

/**
 * Generate PROFESSIONAL SCOUT VERDICT using TEAM_TACTICS_DB
 * Simulates a real scout analyzing the player-team fit
 * @param {Object} result - Analysis result with tactical data
 * @returns {string} Professional scout verdict
 */
function generateScoutVerdict(result) {
    const team = result.team;
    const tacticalMatch = result.tacticalMatch || 50;
    const manager = MANAGER_STYLES[team.name.toLowerCase().trim()];

    let verdict = `📋 VEREDICTO DEL OJEADOR:\n\n`;

    // 1. Tactical Match Analysis with REAL stats
    verdict += `🎯 AJUSTE TACTICO:\n`;
    if (tacticalMatch >= 85) {
        verdict += `   ✅ EXCELENTE - Tu estilo natural encaja a la perfeccion con el sistema de ${team.name}.\n`;
        verdict += `   Los ${TEAM_TACTICS_DB[team.name.toLowerCase()]?.possession || 50}% de posesion y el estilo ${manager?.style || 'del equipo'} son ideales para tu perfil.\n\n`;
    } else if (tacticalMatch >= 70) {
        verdict += `   ⭐ MUY BUENO - Tu estilo se alinea bien con la filosofia de ${manager?.name || 'el DT'}.\n`;
        verdict += `   El ${manager?.style || 'sistema del equipo'} requiere jugadores como tu - buena proyeccion.\n\n`;
    } else if (tacticalMatch >= 50) {
        verdict += `   ⚠️ ACEPTABLE - Hay margen de adaptacion al ${manager?.style || 'sistema del equipo'}.\n`;
        verdict += `   Necesitas ajustarte a las demandas tacticas de ${manager?.name || 'el DT'}. No es imposible, pero requiere trabajo.\n\n`;
    } else {
        verdict += `   ❌ DIFICIL - Tu estilo es muy diferente al ${manager?.style || 'sistema del equipo'}.\n`;
        verdict += `   ${manager?.keyPhrase || 'Reconsidera opciones - este equipo no maximiza tu talento natural.'}\n\n`;
    }

    // 2. Competition Analysis with STAR PLAYER
    const competitor = result.competition?.competitor;
    if (competitor) {
        verdict += `⚔️ COMPETENCIA:\n`;
        if (competitor.is_star) {
            verdict += `   ⭐ Te enfrentas al crack: ${competitor.player} (${competitor.rating} OVR).\n`;
            verdict += `   ${result.competition.competitionText}\n\n`;
        } else {
            verdict += `   Competes contra: ${competitor.player} (${competitor.rating} OVR).\n`;
            verdict += `   ${result.competition.competitionText}\n\n`;
        }
    }

    // 3. Manager's Style Integration
    if (manager) {
        verdict += `🗣️ LO QUE DICE EL DT (${manager.name}):\n`;
        verdict += `   "${manager.keyPhrase}"\n`;
        verdict += `   ${manager.philosophy}\n\n`;
    }

    // 4. Final Recommendation
    verdict += `📊 RECOMENDACION FINAL:\n`;
    if (result.finalScore >= 75) {
        verdict += `   🔥 APROVECHA - Este equipo maximiza tu potencial actual.\n`;
        verdict += `   Score ${result.finalScore.toFixed(0)}/100: ${manager?.style || 'El sistema'} te va a sacar el provecho.\n`;
    } else if (result.finalScore >= 60) {
        verdict += `   ✅ OPCION SOLIDA - Buen equilibrio entre desarrollo y minutos.\n`;
        verdict += `   Score ${result.finalScore.toFixed(0)}/100: ${manager?.name || 'El DT'} te dara oportunidades si te adaptas.\n`;
    } else {
        verdict += `   ⚠️ PIENSALO - Revisa si estas listo para este nivel.\n`;
        verdict += `   Score ${result.finalScore.toFixed(0)}/100: Considera opciones donde seas titular primero.\n`;
    }

    return verdict;
}

/**
 * Display professional scout verdict
 * @param {Object} result - Analysis result
 * @param {HTMLElement} container - Container element
 */
function displayScoutVerdict(result, container) {
    const verdictSection = document.createElement('div');
    verdictSection.className = 'scout-verdict';
    verdictSection.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    `;

    const verdict = generateScoutVerdict(result);

    verdictSection.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: white; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
            <span>📋</span>
            <span>VEREDICTO DEL OJEADOR</span>
        </h3>
        <div style="white-space: pre-line; line-height: 1.7; color: #e0e7ff; font-size: 0.95rem;">
            ${verdict}
        </div>
        <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.75rem; color: rgba(255,255,255,0.8); font-style: italic;">
            💭 *Este veredicto se basa en datos reales de la temporada 2025/26*
        </div>
    `;

    container.appendChild(verdictSection);
}

