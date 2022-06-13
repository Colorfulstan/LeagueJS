// setting default platformId to be used if you don't specify it on the endpoint method
const testConfig = require('../test/testConfig');
process.env.LEAGUE_API_PLATFORM_ID = testConfig.summoner.platformId;

const LeagueJs = require('../lib/LeagueJS.js');
const api = new LeagueJs(testConfig.API_KEY);


// api.Summoner
// 	.gettingByName(testConfig.summoner.name)
// 	.then(data => {
// 		'use strict';
// 		console.log(data);
// 	})
// 	.catch(err => {
// 		'use strict';
// 		console.log(err);
// 	});

// api.Summoner
// 	.gettingByAccount(testConfig.summoner.accountIdV4, 'euw')
// 	.then(data => {
// 		'use strict';
// 		console.log(data);
// 	})
// 	.catch(err => {
// 		'use strict';
// 		console.log(err);
// 	});

// api.Challenges
// 	.gettingChallengesConfig()
// 	.then(data => {
// 		'use strict';
// 		console.log(data);
// 	})
// 	.catch(err => {
// 		'use strict';
// 		console.log(err);
// 	});

	api.Challenges.gettingLeaderboardsByLevelForChallenge("CHALLENGER", 101101).then(data => console.log(data));

