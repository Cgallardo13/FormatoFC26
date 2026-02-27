// Test script for FC26 API
async function testAPI() {
    console.log('🧪 Testing FC26 API...\n');

    const endpoints = [
        'https://api.msmc.cc/eafc/',
        'https://api.msmc.cc/eafc/teams',
        'https://api.msmc.cc/eafc/players'
    ];

    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint}`);
        try {
            const response = await fetch(endpoint);
            console.log(`  Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`  ✅ Success! Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
                console.log(`  📊 Keys: ${Object.keys(data).slice(0, 5).join(', ')}`);

                // Show sample data
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`  📝 Sample item:`, JSON.stringify(data[0], null, 2).substring(0, 200));
                } else if (data.teams && data.teams.length > 0) {
                    console.log(`  📝 Sample team:`, JSON.stringify(data.teams[0], null, 2).substring(0, 200));
                }

                return data; // Return first successful response
            }
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
        console.log('');
    }

    console.log('\n❌ All endpoints failed');
    return null;
}

// Test league filtering
function testLeagueFilter(apiData) {
    console.log('\n🔍 Testing league filter...');

    const teams = Array.isArray(apiData) ? apiData : (apiData.teams || apiData.data || []);

    const majorLeagues = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1'];

    const filtered = teams.filter(t => majorLeagues.includes(t.league));

    console.log(`  Total teams: ${teams.length}`);
    console.log(`  Major leagues: ${filtered.length}`);

    const leagues = {};
    teams.forEach(t => {
        leagues[t.league] = (leagues[t.league] || 0) + 1;
    });

    console.log('\n  Teams by league:');
    Object.entries(leagues).forEach(([league, count]) => {
        console.log(`    ${league}: ${count}`);
    });
}

// Run tests
testAPI().then(data => {
    if (data) {
        testLeagueFilter(data);
    }
    console.log('\n✅ Test complete');
});
