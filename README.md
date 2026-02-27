# ⚽ FC26 Team Finder

Web app 100% local que te ayuda a encontrar el equipo perfecto para tu jugador en FC26 basándose en tu estilo de juego y estadísticas reales de 18,000+ jugadores.

## 🎯 Características

- **Análisis inteligente 100% local**: Algoritmo basado en datos reales del CSV de FC26 (18,000+ jugadores)
- **5 ligas incluidas**: La Liga, Premier League, Bundesliga, Serie A, Ligue 1
- **Sistema de logos automático**: 100+ equipos con logos usando CDNs públicos (sin APIs)
- **Análisis de competencia real**: Encuentra al jugador más fuerte en tu posición dentro del equipo
- **Lógica de élite**: Si eres crack (86+), te recomienda equipos de élite (85+)
- **5 plantillas dinámicas**: Análisis único basado en stats reales (PAC, SHO, POS)
- **Optimizado para móvil**: Diseño responsive que funciona perfecto en iPhone

## 📁 Estructura del proyecto

```
FormatoFC26/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos mobile-first Ultimate Team
├── js/
│   ├── data.js             # Carga CSV + Sistema de logos
│   ├── questions.js        # Lógica de la entrevista
│   ├── analyzer.js         # Algoritmo de análisis local inteligente
│   └── ui.js               # Manejo de interfaz
├── EAFC26-Men.csv          # Base de datos con 18,000+ jugadores
├── teams.json              # Backup local de equipos
└── README.md               # Este archivo
```

### Archivos clave:

- **js/data.js**: Carga CSV con 18K jugadores + sistema multi-fallback de logos
- **js/analyzer.js**: Análisis local inteligente sin APIs (élite → equipos élite)
- **EAFC26-Men.csv**: CSV oficial con todos los jugadores de FC26

## 🚀 Cómo usarlo

### Opción 1: Abrir localmente (Recomendado)
1. Simplemente abre el archivo `index.html` en tu navegador
2. ¡Listo! No necesitas servidor, APIs ni instalar nada
3. 100% funcional y offline

### Opción 2: Deploy en GitHub Pages / Netlify / Vercel
1. Sube todos los archivos a tu repositorio
2. Activa GitHub Pages o arrastra a Netlify Drop
3. Asegúrate de incluir `EAFC26-Men.csv` en la carpeta raíz

**Nota**: No requiere configuración de APIs ni environment variables. Todo corre localmente.

## 🎮 Cómo funciona el análisis

1. **Ingresa tu media**: Tu jugador tiene un rating (50-99)
2. **Selecciona liga(s)**: Elige tus ligas preferidas
3. **Elige formación**: Tu formación favorita
4. **Estilo de juego**:
   - ¿Juegas por bandas o por centro?
   - ¿Posesión o contraataque?
   - ¿Pelotas altas o juego rasos?
   - ¿Presión alta o esperar atrás?

5. **El algoritmo analiza (100% local)**:
   - Lee datos reales de 18,000+ jugadores del CSV
   - Encuentra competidores directos en tu posición
   - Genera análisis único con 5 plantillas dinámicas
   - Si eres élite (86+), prioriza equipos de élite (85+)

6. **Resultado**: 3 mejores equipos con análisis real de competencia

## 📊 Base de datos

### EAFC26-Men.csv (18,000+ jugadores)
- Datos reales de FC26
- Ratings, posición, edad, stats (PAC, SHO, PAS, etc.)
- Actualizable: Solo reemplaza el archivo con un CSV nuevo

### Sistema de Logos Automático
- 100+ equipos mapeados con logos reales
- 6 niveles de fallback:
  1. Mapa directo (TEAM_LOGO_MAP)
  2. Football-Data.org CDN
  3. Wikipedia CDN
  4. Pattern matching por nombre
  5. Placeholder personalizado
  6. Logo genérico por liga

## 🔧 Personalización

### Agregar más equipos

Edita `teams.json` con el formato:

```javascript
{
    "id": "team_id",
    "name": "Team Name",
    "league": "La Liga",
    "formation": "4-3-3",
    "overall_level": 85,
    "style": {
        "possession": 70,
        "counter_attack": 60,
        "wing_play": 80,
        "through_balls": 75,
        "aerial_balls": 65,
        "high_press": 70
    },
    "squad_gaps": [
        {
            "position": "ST",
            "rating": 85,
            "player": "Player Name",
            "age": 26,
            "is_star": true
        }
    ]
}
```

### Ajustar el algoritmo

Edita `js/analyzer.js`:
- `filterTeamsByPlayerTier()`: Cambia umbrales de élite (86+ → 85+ teams)
- `analyzeRealCompetition()`: Ajusta lógica de competencia
- `generateDynamicAnalysis()`: Modifica plantillas de análisis

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura
- **CSS3**: Estilos Ultimate Team con gradientes
- **JavaScript (Vanilla)**: Toda la lógica sin frameworks ni APIs
- **CSV Parser**: Lectura de 18,000+ jugadores localmente
- **Multi-CDN**: Football-Data.org + Wikipedia para logos

## 📱 Compatible con

- ✅ iPhone (Safari, Chrome)
- ✅ Android (Chrome)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ 100% Offline (una vez cargado el CSV)

## 🔧 Troubleshooting

### Problema: Los logos no cargan

**Síntoma**: Algunos equipos muestran placeholder o medallas

**Solución**:
- ✅ El sistema tiene 6 niveles de fallback automático
- ✅ Puedes agregar más equipos a `TEAM_LOGO_MAP` en `js/data.js`
- ✅ Verifica que tengas conexión a internet la primera vez

### Problema: El CSV no carga

**Síntoma**: "Database load failed" en consola

**Solución**:
1. Verifica que `EAFC26-Men.csv` esté en la carpeta raíz
2. El archivo debe tener encabezados: `name, rating, position, ...`
3. Fallback automático a `teams.json` si CSV falla

### Testear Sistema

1. Abre la app
2. Haz clic en **"🔧 Test CSV"** (abajo del todo)
3. Revisa el reporte:
   - ✅ CSV: Debe decir "✅ OK (18,000+ players)"
   - ✅ Team Logos: Debe mostrar "✅ OK (X/10 working)"
   - ✅ League Logos: Debe mostrar "✅ OK (3/3 working)"

## 🎨 Características del diseño

- Gradientes Ultimate Team (oro/diamante)
- Animaciones suaves
- Interfaz intuitiva
- Optimizado para touch
- Soporte para gestos (swipe)
- Teclado (flechas) en desktop

## 📊 Algoritmo de análisis local

### Lógica de Élite
```javascript
if (playerRating >= 86) {
    // Solo mostrar equipos 85+
    // Real Madrid, Bayern, Man City, etc.
} else {
    // Mostrar todos los equipos ordenados por nivel
}
```

### Análisis de Competencia Real
```javascript
// Buscar jugador más fuerte en mi posición
const strongest = team.squad_gaps
    .filter(p => p.position === userPosition)
    .sort((a, b) => b.rating - a.rating)[0];

if (myRating > strongest.rating + 5) {
    return "Serías la ESTRELLA 💫";
} else if (myRating >= strongest.rating - 2) {
    return "Llegarías a PELEAR el puesto ⚔️";
}
```

## 📝 Notas

- Los datos de jugadores vienen de `EAFC26-Men.csv`
- Los ratings corresponden a FC26
- El algoritmo usa datos reales del CSV (sin APIs)
- Los logos se cargan desde CDNs públicos gratuitos

---

**Hecho con ❤️ para los gamers de FC26**

¡Disfruta encontrando tu equipo perfecto! ⚽🎮
