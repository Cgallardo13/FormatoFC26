# 🌐 FC26 Team Finder - API Integration

## 🎯 Sistema Híbrido Inteligente

La app tiene **dos fuentes de datos** con fallback automático:

```
1. API Oficial (Primary)     →  https://api.msmc.cc/eafc/
   ↓ (si falla)
2. teams.json (Backup)       →  Datos locales actualizados
```

## 🚀 Flujo de Carga

```javascript
// Al iniciar la app
loadDatabase()
  ├── try: fetch('https://api.msmc.cc/eafc/')
  │     ├── Success → Filtrar 5 ligas principales
  │     └── Error → Fallback a teams.json
  └── return fc26Database
```

## 📊 Filtros Automáticos

Solo se cargan equipos de las **5 grandes ligas**:

| Liga | Equipos |
|------|---------|
| La Liga | 20 |
| Premier League | 20 |
| Bundesliga | 18 |
| Serie A | 20 |
| Ligue 1 | 18 |

**Total: ~96 equipos**

## 🔧 Estructura de Datos

### Formato Esperado de la API

```json
{
  "teams": [
    {
      "name": "Real Madrid",
      "league": "La Liga",
      "formation": "4-3-3",
      "overall": 92,
      "possession": 85,
      "counter_attack": 40,
      "squad": [
        {
          "name": "Mbappé",
          "position": "ST",
          "rating": 91,
          "is_star": true,
          "age": 26
        }
      ]
    }
  ]
}
```

### Transformación Automática

La app transforma automáticamente:

```javascript
API Response → filterMajorLeagues() → transformTeamData()
                                        ↓
                              fc26Database.teams[]
```

## ⚡ Ventajas del Sistema Híbrido

| API Local | Con API Híbrida |
|-----------|-----------------|
| ❌ Datos estáticos | ✅ **Siempre actualizados** |
| ❌ Manual updates | ✅ **Automático** |
| ❌ Se desactualiza | ✅ **Tiempo real** |
| ✅ Funciona offline | ✅ **Backup automático** |

## 🔍 Debugging

### Ver logs en consola:

```javascript
// API funcionando
🌐 Fetching from API: https://api.msmc.cc/eafc/
✅ Loaded from API: 96 teams from major leagues
✅ Database ready: 96 teams

// API caída (usa backup)
🌐 Fetching from API: https://api.msmc.cc/eafc/
⚠️  API load failed: error code: 522
🔄 Falling back to local data...
📁 Loading from local teams.json
✅ Loaded from local: 96 teams
✅ Database ready: 96 teams
```

## 🛠️ Personalización

### Cambiar endpoint de la API

```javascript
// En js/data.js
const response = await fetch('TU_NUEVA_API/aquí');
```

### Agregar más ligas

```javascript
// En js/data.js
const MAJOR_LEAGUES = [
    'La Liga',
    'Premier League',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Eredivisie',     // ← Nueva liga
    'Primeira Liga'   // ← Nueva liga
];
```

### Modificar transformación de datos

```javascript
// En js/data.js → transformTeamData()
return {
    id: apiTeam.id,
    name: apiTeam.name,
    // ... ajusta según tu API
};
```

## 📦 Deploy

**Netlify / Vercel / GitHub Pages:**
- Solo sube el código
- La API se consume desde el navegador
- teams.json sirve como backup

## ⚠️ Importante

1. **CORS**: La API debe permitir requests desde tu dominio
2. **Rate Limit**: Respeta los límites de la API
3. **Fallback**: Siempre hay backup local por si la API falla

## 🔄 Actualización de Datos

### Con API (Automático)
```bash
# Nada que hacer, se actualiza solo
```

### Sin API (Manual)
```bash
# Actualiza teams.json
node update_local_data.js
```

---

**Hecho para escalar 💪**
