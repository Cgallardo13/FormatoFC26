// ============================================
// TEAM FORMATION INTELLIGENCE
// Evaluates formation compatibility based on team squad
// ============================================

/**
 * Team formation preferences (based on real-world data)
 * Maps team names to their preferred formations
 */
const TEAM_FORMATION_PREFERENCES = {
    // La Liga
    'real madrid': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'fc barcelona': { preferred: ['4-3-3', '3-4-3'], style: 'possession' },
    'atletico madrid': { preferred: ['5-3-2', '3-5-2'], style: 'counter_attack' },
    'athletic club': { preferred: ['4-3-3', '4-2-3-1'], style: 'aerial' },
    'real betis': { preferred: ['4-2-3-1', '4-3-3'], style: 'possession' },
    'real sociedad': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'villarreal': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'valencia': { preferred: ['4-3-3', '4-2-3-1'], style: 'balanced' },
    'sevilla': { preferred: ['4-3-3', '4-2-3-1'], style: 'balanced' },

    // Premier League
    'manchester city': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'arsenal': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'liverpool': { preferred: ['4-3-3', '4-2-3-1'], style: 'counter_attack' },
    'manchester united': { preferred: ['4-2-3-1', '4-3-3'], style: 'counter_attack' },
    'chelsea': { preferred: ['3-4-3', '4-3-3'], style: 'possession' },
    'tottenham': { preferred: ['4-3-3', '3-4-3'], style: 'counter_attack' },
    'newcastle': { preferred: ['4-3-3', '4-2-3-1'], style: 'counter_attack' },
    'aston villa': { preferred: ['4-2-3-1', '4-3-3'], style: 'counter_attack' },

    // Bundesliga
    'bayern munich': { preferred: ['4-2-3-1', '4-3-3'], style: 'possession' },
    'borussia dortmund': { preferred: ['4-3-3', '4-2-3-1'], style: 'counter_attack' },
    'bayer leverkusen': { preferred: ['3-4-3', '4-2-3-1'], style: 'possession' },
    'rb leipzig': { preferred: ['4-2-3-1', '4-3-3'], style: 'counter_attack' },
    'eintracht frankfurt': { preferred: ['3-4-2-1', '4-2-3-1'], style: 'counter_attack' },
    'vfl wolfsburg': { preferred: ['4-2-3-1', '4-3-3'], style: 'counter_attack' },
    'union berlin': { preferred: ['5-3-2', '3-5-2'], style: 'counter_attack' },

    // Serie A
    'inter milan': { preferred: ['3-5-2', '5-3-2'], style: 'counter_attack' },
    'ac milan': { preferred: ['4-2-3-1', '4-3-3'], style: 'possession' },
    'juventus': { preferred: ['3-5-2', '4-3-3'], style: 'balanced' },
    'napoli': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'atalanta': { preferred: ['3-4-2-1', '3-5-2'], style: 'counter_attack' },
    'lazio': { preferred: ['3-5-2', '4-2-3-1'], style: 'counter_attack' },
    'roma': { preferred: ['3-4-3', '4-2-3-1'], style: 'possession' },

    // Ligue 1
    'psg': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'as monaco': { preferred: ['4-3-3', '4-2-3-1'], style: 'counter_attack' },
    'olympique marseille': { preferred: ['4-3-3', '4-2-3-1'], style: 'balanced' },
    'olympique lyon': { preferred: ['4-3-3', '4-2-3-1'], style: 'possession' },
    'losc lille': { preferred: ['4-3-3', '4-2-3-1'], style: 'counter_attack' },
    'nice': { preferred: ['4-2-3-1', '4-3-3'], style: 'balanced' }
};

/**
 * Analyze team squad structure from CSV data
 * Returns key metrics about the team's player distribution
 */
function analyzeTeamSquadStructure(team) {
    if (!team.squad_gaps || team.squad_gaps.length === 0) {
        return {
            defenders: 0,
            midfielders: 0,
            forwards: 0,
            wingers: 0,
            wingBacks: 0,
            strongDefenders: 0,
            strongWingers: 0
        };
    }

    const structure = {
        defenders: 0,
        midfielders: 0,
        forwards: 0,
        wingers: 0,
        wingBacks: 0,
        strongDefenders: 0, // DEF > 80
        strongWingers: 0,   // LW/RW with PAC > 80
        avgDefense: 0,
        avgAttack: 0
    };

    let totalDef = 0, totalAtt = 0, defCount = 0, attCount = 0;

    team.squad_gaps.forEach(player => {
        // Position counting
        if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position)) {
            structure.defenders++;
        }
        if (['CDM', 'CM', 'CAM'].includes(player.position)) {
            structure.midfielders++;
        }
        if (['ST', 'CF'].includes(player.position)) {
            structure.forwards++;
        }
        if (['LW', 'RW'].includes(player.position)) {
            structure.wingers++;
        }
        if (['LWB', 'RWB'].includes(player.position)) {
            structure.wingBacks++;
        }

        // Strong players counting
        if (player.rating >= 80) {
            if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position)) {
                structure.strongDefenders++;
            }
            if (['LW', 'RW'].includes(player.position)) {
                const pac = player.pac || player.rating || 75;
                if (pac >= 80) structure.strongWingers++;
            }
        }

        // Average stats
        if (player.def || player.DEF) {
            totalDef += (player.def || player.DEF);
            defCount++;
        }
        if (player.att || player.sho || player.SHO) {
            totalAtt += (player.att || player.sho || player.SHO);
            attCount++;
        }
    });

    structure.avgDefense = defCount > 0 ? totalDef / defCount : 75;
    structure.avgAttack = attCount > 0 ? totalAtt / attCount : 75;

    return structure;
}

/**
 * Calculate formation compatibility score (INTELLIGENT)
 * Takes into account:
 * 1. Team's preferred formations
 * 2. Squad structure (defenders, midfielders, wingers)
 * 3. User's formation requirements
 */
function calculateFormationCompatibility(userFormation, team) {
    // Normalize user formation (4_3_3 -> 4-3-3)
    const userFormationNormal = userFormation.replace(/_/g, '-');

    // Check if team has preferred formation that matches
    const teamName = team.name.toLowerCase().trim();
    const teamPrefs = TEAM_FORMATION_PREFERENCES[teamName];

    let compatibilityScore = 50; // Base score

    // FACTOR 1: Preferred formation match (40 points max)
    if (teamPrefs) {
        const exactMatch = teamPrefs.preferred.some(f => f === userFormationNormal);
        if (exactMatch) {
            compatibilityScore += 40; // Perfect match
            console.log(`✅ ${team.name} prefers ${userFormationNormal}: +40 points`);
        } else {
            // Check if similar (e.g., 4-3-3 vs 4-2-3-1)
            const userParts = userFormationNormal.split('-').map(Number);
            const hasSimilar = teamPrefs.preferred.some(pref => {
                const prefParts = pref.split('-').map(Number);
                return userParts.every((part, i) => Math.abs(part - (prefParts[i] || 0)) <= 1);
            });
            if (hasSimilar) {
                compatibilityScore += 20; // Similar formation
                console.log(`⭐ ${team.name} has similar formation: +20 points`);
            }
        }
    }

    // FACTOR 2: Squad structure analysis (30 points max)
    const squadStructure = analyzeTeamSquadStructure(team);
    const userParts = userFormationNormal.split('-').map(Number);

    // Count requirements
    const defRequired = userParts[0] || 4; // First number = defenders
    const midRequired = userParts[1] || 3; // Second number = midfielders
    const fwdRequired = userParts[userParts.length - 1] || 1; // Last = forwards

    // Check if squad has enough players for each position
    const defScore = Math.min(15, (squadStructure.defenders / defRequired) * 15);
    const midScore = Math.min(10, (squadStructure.midfielders / midRequired) * 10);
    const fwdScore = Math.min(5, (squadStructure.forwards / fwdRequired) * 5);

    compatibilityScore += (defScore + midScore + fwdScore);
    console.log(`📊 ${team.name} squad structure: +${(defScore + midScore + fwdScore).toFixed(0)} points`);

    // FACTOR 3: Special formation requirements (30 points max)

    // 3-4-2-1, 3-4-3: Requires good wing-backs
    if (userFormationNormal.startsWith('3-4')) {
        if (squadStructure.wingBacks >= 2 && squadStructure.strongDefenders >= 3) {
            compatibilityScore += 30;
            console.log(`🎯 ${team.name} has great wing-backs for 3-4-x: +30 points`);
        } else if (squadStructure.wingBacks >= 1) {
            compatibilityScore += 15;
            console.log(`⚠️ ${team.name} has some wing-backs: +15 points`);
        }
    }

    // 4-2-3-1: Requires strong CDM pivot
    if (userFormationNormal === '4-2-3-1') {
        const cdms = team.squad_gaps.filter(p => p.position === 'CDM' && p.rating >= 80);
        if (cdms.length >= 2) {
            compatibilityScore += 25;
            console.log(`🛡️ ${team.name} has strong CDM pivot: +25 points`);
        } else if (cdms.length >= 1) {
            compatibilityScore += 12;
            console.log(`⚠️ ${team.name} has 1 good CDM: +12 points`);
        }
    }

    // 4-3-3: Requires balanced midfield
    if (userFormationNormal === '4-3-3') {
        const mids = team.squad_gaps.filter(p => ['CM', 'CAM', 'CDM'].includes(p.position) && p.rating >= 80);
        if (mids.length >= 3) {
            compatibilityScore += 20;
            console.log(`⚙️ ${team.name} has strong midfield trio: +20 points`);
        }
    }

    // 5-3-2, 5-4-1: Requires strong defense
    if (userFormationNormal.startsWith('5-')) {
        if (squadStructure.strongDefenders >= 4) {
            compatibilityScore += 25;
            console.log(`🧱 ${team.name} has fortress defense: +25 points`);
        } else if (squadStructure.strongDefenders >= 3) {
            compatibilityScore += 15;
            console.log(`🧱 ${team.name} has good defense: +15 points`);
        }
    }

    // 4-4-2: Requires strong wingers
    if (userFormationNormal === '4-4-2' || userFormationNormal === '4-4-1-1') {
        if (squadStructure.strongWingers >= 2) {
            compatibilityScore += 20;
            console.log(`🏃 ${team.name} has explosive wingers: +20 points`);
        } else if (squadStructure.wingers >= 2) {
            compatibilityScore += 10;
            console.log(`⚠️ ${team.name} has wingers: +10 points`);
        }
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, compatibilityScore));

    console.log(`📈 Final formation compatibility for ${team.name}: ${finalScore.toFixed(0)}/100`);
    return finalScore;
}

/**
 * Calculate TACTICAL compatibility using TEAM_TACTICS_DB
 * Compares user's slider answers with team's actual tactical stats
 */
function calculateTacticalCompatibility(team) {
    const teamName = team.name.toLowerCase().trim();
    const teamTactics = TEAM_TACTICS_DB[teamName];

    if (!teamTactics) {
        console.log(`⚠️ No tactics data for ${team.name}`);
        return 50; // Neutral score if no data
    }

    // Get user's slider values (from answers object)
    const userStyle = {
        wing_play: answers.wing_play || 50,
        possession: answers.possession || 50,
        counter_attack: answers.counter_attack || 50,
        aerial_balls: answers.aerial_balls || 50,
        high_press: answers.high_press || 50
    };

    let totalScore = 0;
    let maxScore = 0;

    // Calculate difference for each metric (lower difference = better match)
    const metrics = ['wing_play', 'possession', 'counter_attack', 'aerial_balls', 'high_press'];

    metrics.forEach(metric => {
        const userValue = userStyle[metric];
        const teamValue = teamTactics[metric];

        // Calculate similarity score (0-100)
        // Perfect match = 100 points, opposite = 0 points
        const difference = Math.abs(userValue - teamValue);
        const similarityScore = Math.max(0, 100 - difference);

        totalScore += similarityScore;
        maxScore += 100;

        console.log(`  ${metric}: User=${userValue}, Team=${teamValue}, Match=${similarityScore.toFixed(0)}/100`);
    });

    // Calculate final percentage
    const compatibilityScore = (totalScore / maxScore) * 100;

    console.log(`🎯 Tactical compatibility for ${team.name}: ${compatibilityScore.toFixed(1)}/100`);
    console.log(`   Team stats: P${teamTactics.possession}% | CA:${teamTactics.counter_attack} | Wings:${teamTactics.wing_play}`);
    console.log(`   Team scored ${teamTactics.goals_scored} goals this season`);

    return compatibilityScore;
}

/**
 * Get formation style match bonus
 * Rewards teams that play similarly to user's preferred style
 */
function getFormationStyleBonus(userFormation, team) {
    const userFormationNormal = userFormation.replace(/_/g, '-');
    const teamName = team.name.toLowerCase().trim();
    const teamPrefs = TEAM_FORMATION_PREFERENCES[teamName];

    if (!teamPrefs) return 0;

    // If team's preferred formation matches user's formation
    const matches = teamPrefs.preferred.some(f => f === userFormationNormal);
    if (matches) {
        // Bonus based on style alignment
        const userStyle = {
            possession: answers.possession || 50,
            counter_attack: answers.counter_attack || 50
        };

        if (teamPrefs.style === 'possession' && userStyle.possession >= 70) {
            return 15; // Bonus for possession teams
        }
        if (teamPrefs.style === 'counter_attack' && userStyle.counter_attack >= 70) {
            return 15; // Bonus for counter-attack teams
        }
        if (teamPrefs.style === 'aerial' && answers.aerial_balls >= 70) {
            return 10; // Bonus for aerial teams
        }
    }

    return 0;
}
