# 🔧 API Format Adapter Guide

## 🎯 When the API comes online...

Once `https://api.msmc.cc/eafc/` is active, follow these steps to adapt the format.

## 📝 Step 1: Test the API Response

Open the app in a browser and run in the console:

```javascript
checkAPIFormat()
```

This will show you:
- ✅ The raw API response structure
- ✅ Sample team data
- ✅ Sample player data
- ✅ Total number of items

## 🔍 Step 2: Review the Logged Data

Look for these fields in the console output:

### Expected Team Structure:
```javascript
{
  id: "real_madrid",           // or team_id, slug, short_name
  name: "Real Madrid",         // or team_name, full_name, club_name
  league: "La Liga",           // or league_name, competition
  formation: "4-3-3",          // or default_formation, lineup
  overall: 92,                 // or rating, team_rating, strength
  possession: 85,              // 0-100
  counter_attack: 40,          // 0-100
  wing_play: 90,                // 0-100
  through_balls: 70,           // 0-100
  aerial_balls: 60,            // 0-100
  high_press: 75,               // 0-100
  squad: [...],                 // or players, players_array, squad_list
}
```

### Expected Player Structure:
```javascript
{
  position: "ST",              // or pos, role, best_position
  rating: 91,                  // or overall, score, potential
  name: "Mbappé",              // or player_name, full_name, short_name
  age: 26,                     // or player_age, years
  is_star: true,               // or star, key_player, starter
  is_young: false,             // or young, prospect
}
```

## ⚙️ Step 3: Update Field Mappings (If Needed)

If the API uses different field names, **only edit these two functions** in `js/data.js`:

### Option A: Team Fields Different
```javascript
// In transformTeamData(), update the field lists:
id: getStringField(apiTeam, ['id', 'team_id', 'slug', 'NEW_FIELD_HERE']),
name: getStringField(apiTeam, ['name', 'team_name', 'full_name', 'NEW_FIELD_HERE']),
// ... etc
```

### Option B: Player Fields Different
```javascript
// In transformSquadData(), update the field lists:
position: getStringField(player, ['position', 'pos', 'role', 'NEW_FIELD_HERE']),
rating: getNumberField(player, ['rating', 'overall', 'score', 'NEW_FIELD_HERE']),
// ... etc
```

## 🚀 Step 4: Test Again

After updating mappings, test with:

```javascript
// Reload the app
window.location.reload();

// Check the console for:
// ✅ Loaded from API: X teams
// ✅ Each team with correct player counts
```

## 📋 Common API Field Variations

### Team Identifiers:
- `id` | `team_id` | `slug` | `short_name` | `code`

### Team Names:
- `name` | `team_name` | `full_name` | `club_name` | `club`

### League Names:
- `league` | `league_name` | `competition` | `championship`

### Team Strength:
- `overall` | `rating` | `team_rating` | `strength` | `level`

### Player Position:
- `position` | `pos` | `role` | `best_position` | `position_id`

### Player Rating:
- `rating` | `overall` | `score` | `potential` | `ability`

### Player Name:
- `name` | `player_name` | `full_name` | `short_name` | `display_name`

### Player Age:
- `age` | `player_age` | `years` | `dob` (date of birth)

### Boolean Fields:
- `is_star` | `star` | `key_player` | `starter` | `is_important`
- `is_young` | `young` | `prospect` | `youth`

## 🛠️ Helper Functions Available

The code has **smart fallbacks** built-in:

```javascript
// String field (tries multiple keys, falls back to default)
getStringField(obj, ['id', 'team_id'], 'Unknown')

// Number field (tries multiple keys, parses strings, falls back to default)
getNumberField(obj, ['rating', 'overall'], 75)

// Boolean field (handles multiple representations)
getBooleanField(obj, ['is_star', 'star'], false)
```

## 🎯 Example Scenario

### API Returns:
```json
{
  "team_id": "rm",
  "club": "Real Madrid",
  "competition": "La Liga",
  "lineup": "4-3-3",
  "strength": 92,
  "possession_style": 85,
  "players_array": [
    {
      "pos": "ST",
      "overall": 91,
      "full_name": "Mbappé",
      "player_age": 26,
      "key_player": true
    }
  ]
}
```

### What You Need to Edit:

```javascript
// In transformTeamData(), add these keys to the lists:
id: getStringField(apiTeam, ['id', 'team_id', 'slug', 'short_name']),
                                  // ↑ ADD 'team_id' here
name: getStringField(apiTeam, ['name', 'team_name', 'full_name', 'club_name', 'club']),
                                  // ↑ ADD 'club' here
league: getStringField(apiTeam, ['league', 'league_name', 'competition']),
                                  // ↑ ADD 'competition' here
formation: getStringField(apiTeam, ['formation', 'default_formation', 'lineup'], '4-3-3'),
                                  // ↑ ADD 'lineup' here
overall_level: getNumberField(apiTeam, ['overall', 'rating', 'team_rating', 'strength'], 75),
                                        // ↑ ADD 'strength' here
style: {
    possession: getNumberField(apiTeam, ['possession', 'possession_style', 'possession_rate'], 50),
                                   // ↑ ADD 'possession_style' here
    // ... other styles
},
squad_gaps: transformSquadData(apiTeam.squad || apiTeam.players || apiTeam.players_array || apiTeam.squad_list)
                                                                                              // ↑ ADD 'players_array' here
}

// In transformSquadData():
position: getStringField(player, ['position', 'pos', 'role', 'best_position'], 'ST'),
                           // ↑ ADD 'role' here
rating: getNumberField(player, ['rating', 'overall', 'score'], 75),
                         // ↑ ADD 'score' here
player: getStringField(player, ['name', 'player_name', 'full_name', 'short_name'], 'Unknown'),
                       // ↑ ADD 'full_name' here
age: getNumberField(player, ['age', 'player_age', 'years'], 25),
    // ↑ ADD 'player_age' and 'years' here
is_star: getBooleanField(player, ['is_star', 'star', 'key_player', 'starter'], false),
        // ↑ ADD 'key_player' and 'starter' here
```

## ✅ Verification Checklist

After updating field mappings:

- [ ] Console shows "✅ Loaded from API: X teams"
- [ ] Team names display correctly
- [ ] League flags show correct emojis
- [ ] Each team has 10+ players
- [ ] Player ages are numbers (not undefined)
- [ ] Status badge shows green "🌐 API"
- [ ] Test with a real analysis - results display correctly

## 🚨 Troubleshooting

### If teams = 0:
```javascript
// Check console for raw API structure
testAPIEndpoint()
// Manually compare with field lists in transformTeamData()
```

### If players = 0 per team:
```javascript
// Check if squad array name differs
// Common alternatives: squad, players, players_array, roster, team
```

### If style stats = 50 (default):
```javascript
// Check if style field names differ
// Common alternatives: possession_style, possession_rate, etc.
```

## 📞 Quick Reference

**Need help?** Check these:

1. Console logs show raw data structure
2. Helper functions auto-try common field name variations
3. Just add new field names to the lists in order of priority
4. First matching field wins

---

**Remember:** You ONLY edit `transformTeamData()` and `transformSquadData()` in `js/data.js`. Everything else adapts automatically! 🎉
