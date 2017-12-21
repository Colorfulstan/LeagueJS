const Config = require('../lib/Config');
const RiotRateLimiter = require('riot-ratelimiter');
const STRATEGY = require('riot-ratelimiter/dist/RateLimiter').STRATEGY;

class TestUtil {
	static getTestConfig() {
		const testConfig = require('./testConfig.json');
		const mergedConfig = new Config(testConfig);

		// NOTE: add your dev-api key to the config.json before running
		if (typeof mergedConfig.API_KEY === 'undefined' || mergedConfig.API_KEY === '') {
			throw new Error("The API_KEY is needed. Please add it to /test/config.json or as process.env.LEAGUE_API_KEY");
		}
		if (typeof mergedConfig.debug === 'undefined'){
			console.warn('LeagueJS: Setting debug:true for test execution');
			mergedConfig.debug = true;
		}
		return mergedConfig;
	}

	static createRateLimiter(per10, per600, allowBursts){
		return new RiotRateLimiter({strategy: allowBursts? STRATEGY.BURST : STRATEGY.SPREAD, debug: true});
	}

	static get mocks() {
		let summoners = {
			Colorfulstan: {
				name: 'Colorfulstan',
				summonerId: 19115840,
				accountId: 21777671,
				platformId: 'euw1',
				gameId: 3164960478
			}
		};
		return {
			summoners,
			invalidData: {
				summonerName: 'n$ame12!§3'
			},
			leagueId: {id: "1a3cc7ff-9b40-3927-b646-8d777e97148a", platformId: 'NA1' },
			champions: {Akali: {id: 84}},
			items: {IonianBoots: {id: 3158}},
			summonerSpells: {Flash: {"name": "Flash","key": "SummonerFlash", "summonerLevel": 8, "id": 4}}
		};
	}
}

module.exports = TestUtil;