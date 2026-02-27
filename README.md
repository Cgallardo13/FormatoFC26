# ⚽ FC26 Team Finder

Web app que te ayuda a encontrar el equipo perfecto para tu jugador en FC26 basándose en tu estilo de juego.

## 🎯 Características

- **Análisis inteligente**: Evalúa tu estilo de juego y lo compara con 43 equipos de las 5 mejores ligas europeas
- **5 ligas incluidas**: La Liga, Premier League, Bundesliga, Serie A, Ligue 1
- **Análisis de huecos**: Identifica posiciones donde tu jugador puede ser titular
- **Potencial de crecimiento**: Estima cuánto puede mejorar tu jugador en cada equipo
- **Optimizado para móvil**: Diseño responsive que funciona perfecto en iPhone

## 📁 Estructura del proyecto

```
FormatoFC26/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos mobile-first
├── js/
│   ├── data.js         # Base de datos de 43 equipos
│   ├── questions.js    # Lógica de la entrevista
│   ├── analyzer.js     # Algoritmo de matching
│   └── ui.js           # Manejo de interfaz
└── README.md           # Este archivo
```

## 🚀 Cómo usarlo

### Opción 1: Abrir localmente
1. Simplemente abre el archivo `index.html` en tu navegador
2. ¡Listo! No necesitas servidor ni instalar nada

### Opción 2: Deploy en Netlify (Recomendado para iPhone)
1. Ve a [Netlify Drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `FormatoFC26` completa
3. En segundos tendrás un link funcional para compartir

### Opción 3: Deploy en GitHub Pages
1. Crea un nuevo repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings > Pages
4. Activa GitHub Pages desde la rama main

## 🎮 Cómo funciona el análisis

1. **Ingresa tu media**: Tu jugador tiene un rating (50-99)
2. **Selecciona liga(s)**: Elige tus ligas preferidas
3. **Elige formación**: Tu formación favorita
4. **Estilo de juego**:
   - ¿Juegas por bandas o por centro?
   - ¿Posesión o contraataque?
   - ¿Pelotas altas o juego rasos?
   - ¿Presión alta o esperar atrás?

5. **El algoritmo analiza**:
   - Compatibilidad de estilo (40% del score)
   - Oportunidad de ser titular (35% del score)
   - Potencial de crecimiento (25% del score)

6. **Resultado**: 3 mejores equipos ordenados de mejor a peor

## 📊 Base de datos

Incluye **43 equipos** con:
- Estadísticas de estilo de juego (posesión, contraataque, bandas, etc.)
- Nivel general del equipo (50-99)
- Plantilla con ratings de jugadores por posición
- Identificación de jugadores estrella vs huecos en el equipo

## 🔧 Personalización

### Agregar más equipos

Edita `js/data.js` y agrega equipos following el formato:

```javascript
{
    id: "team_id",
    name: "Team Name",
    league: "League Name",
    league_flag: "🇫🇷",
    formation: "4-3-3",
    overall_level: 85,
    style: {
        possession: 70,
        counter_attack: 60,
        wing_play: 80,
        through_balls: 75,
        aerial_balls: 65,
        high_press: 70
    },
    squad_gaps: {
        "ST": { rating: 85, player: "Player Name", is_star: true },
        "LW": { rating: 80, player: "Player Name", is_star: false }
        // ... más posiciones
    }
}
```

### Ajustar el algoritmo

Edita `js/analyzer.js`:
- `calculateStyleCompatibility()`: Ajusta weights y scoring
- `calculateGrowthPotential()`: Modifica cómo se calcula el crecimiento
- Final score weights: Cambia la importancia de cada factor

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura
- **CSS3**: Estilos con gradientes y animaciones
- **JavaScript (Vanilla)**: Toda la lógica sin frameworks

## 📱 Compatible con

- ✅ iPhone (Safari, Chrome)
- ✅ Android (Chrome)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)

## 🎨 Características del diseño

- Gradientes modernos
- Animaciones suaves
- Interfaz intuitiva
- Optimizado para touch
- Soporte para gestos (swipe)
- Teclado (flechas) en desktop

## 🚀 Próximas mejororas

- [ ] Más ligas (Portugal, Holanda, etc.)
- [ ] Análisis por posición específica
- [ ] Comparar múltiples jugadores
- [ ] Exportar resultados a PDF
- [ ] Modo "Carrera" con evolución

## 📝 Notas

- Los datos de equipos y jugadores son aproximaciones basadas en FC26
- Los ratings son ficticios y para fines de entretenimiento
- El algoritmo está diseñado para dar recomendaciones, no predicciones exactas

---

**Hecho con ❤️ para los jugadores de FC26**

¡Disfruta encontrando tu equipo perfecto! ⚽🎮
