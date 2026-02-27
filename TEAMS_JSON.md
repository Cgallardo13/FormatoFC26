# 📊 Estructura de Base de Datos - teams.json

## 🎯 ¿Qué es teams.json?

Es un archivo JSON independiente que contiene TODOS los datos de los 96 equipos y 825+ jugadores. Está separado del código para que sea fácil de actualizar.

## 📁 Nueva Estructura

```
FormatoFC26/
├── teams.json          ← DATOS (96 equipos, 825 jugadores)
├── index.html          ← Interfaz
├── css/
│   └── styles.css      ← Estilos
└── js/
    ├── data.js         ← Carga el JSON (muy corto ahora)
    ├── questions.js    ← Lógica de preguntas
    ├── analyzer.js     ← Algoritmo de matching
    └── ui.js           ← Interfaz de usuario
```

## 🔄 ¿Cómo actualizar un jugador?

### Antes (❌ Mala práctica)
```javascript
// Tenías que buscar en 2,700 líneas de código JavaScript
// y editar con cuidado de no romper nada
```

### Ahora (✅ Buena práctica)
```json
// Abres teams.json y buscas el jugador
{
  "teams": [
    {
      "id": "real_madrid",
      "squad_gaps": [
        { "position": "CM", "rating": 87, "player": "Camavinga", ... }
      ]
    }
  ]
}
```

## 🛠️ Formato de un Jugador

```json
{
  "position": "ST",        // Posición: ST, LW, RW, CAM, CM, CDM, LB, RB, CB, GK
  "rating": 91,            // Media (50-99)
  "player": "Mbappé",      // Nombre del jugador
  "is_star": true,         // ¿Es estrella del equipo?
  "is_young": true         // ¿Es joven potencial? (≤21 años)
}
```

## 📋 Campos de un Equipo

```json
{
  "id": "real_madrid",              // ID único
  "name": "Real Madrid",            // Nombre mostrado
  "league": "La Liga",              // Liga
  "league_flag": "🇪🇸",              // Emoji de bandera
  "formation": "4-3-3",              // Formación habitual
  "overall_level": 92,              // Nivel general del equipo (50-99)
  "style": {                        // Estilo de juego (0-100)
    "possession": 85,
    "counter_attack": 40,
    "wing_play": 90,
    "through_balls": 70,
    "aerial_balls": 60,
    "high_press": 75
  },
  "squad_gaps": [ ... ]             // Array de jugadores
}
```

## ✅ Ventajas

| Antes | Ahora |
|-------|-------|
| 2,700 líneas en JS | 1 archivo JSON limpio |
| Diffícil de actualizar | Editor de texto normal |
| Riesgo de romper código | Solo editas datos |
| Érase y reescribía | Sobrescribe y listo |

## 🚀 Cómo hacer cambios

### 1. Transferencia de jugador
```json
// Mbappé se va del PSG al Real Madrid
// PSG (antes):
{ "position": "ST", "rating": 91, "player": "Mbappé", ... }

// PSG (después):
{ "position": "ST", "rating": 90, "player": "Barcola", ... }

// Real Madrid (agregar):
{ "position": "ST", "rating": 91, "player": "Mbappé", ... }
```

### 2. Actualizar media
```json
// Lamine Yamal mejora de 87 a 89
{ "position": "LW", "rating": 89, "player": "Lamine Yamal", ... }
```

### 3. Nuevo jugador
```json
// Obed Vargas se une al Atlético
{
  "position": "CM",
  "rating": 79,
  "player": "Obed Vargas",
  "is_star": false,
  "is_young": true
}
```

## ⚠️ Reglas Importantes

1. **Sin comas duplicadas** - JSON es estricto
2. **Todas las strings entre comillas dobles**
3. **Booleanos como `true`/`false` (no comillas)**
4. **Números sin comillas**
5. **Siempre array `[]` para squad_gaps**

## 🔧 Validación

```bash
# Verificar que teams.json es válido
node -e "console.log(require('./teams.json').teams.length + ' teams')"
```

## 📦 Deploy

Cuando subas a Netlify/Vercel, solo asegúrate de subir **teams.json** junto con los demás archivos.

---

**Hecho para desarrolladores, por desarrolladores 💻**
