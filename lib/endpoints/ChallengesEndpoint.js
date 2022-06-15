const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const { buildQueryStringFromOptions } = require('../util/EndpointUtil');
const {ParameterUtil, ErrorUtil} = util;

/***
 * Endpoint to receive client information about challenges on the league platform
 * For game data about champions use static-data instead
 */
class ChallengesEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('Challenges', config, rateLimiter);
		this.apiUrl += `/challenges/${this.apiVersion}`;
	}

	/**
	 * Return top players for each level of a specific challenge.
	 * @param [level] level for which data is requested. Must be MASTER, GRANDMASTER or CHALLENGER
     * @param [challengeId] ID of the challenge
	 * @param [platformIdOrRegion] default will be used if omitted
	 * @return {Bluebird<ApexPlayerInfoDto[]>}
	 */
	gettingLeaderboardsByLevelForChallenge(level, challengeId, options = {}, platformIdOrRegion = this.config.PLATFORM_ID) {
        var { limit } = options;
		return Bluebird.resolve()
            .then(() => {
                if (limit) {
                    ErrorUtil.throwIfNotNumerical(limit, 'limit');
                }
            })
			.then(() => Bluebird.all([ErrorUtil.checkChallengeId(challengeId), ErrorUtil.throwIfApexLevelIsInvalid(level)]))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/challenges/${challengeId}/leaderboards/by-level/${level}`, _platformId, _options))
	}

    /**
     * Return all challenges and their config
     * @param [platformIdOrRegion] default will be used if omitted
     * @return {Bluebird<ChallengeConfigInfoDto[]}
     */
    gettingChallengesConfig(platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
            .then(() => this.executingRequest(`/challenges/config`, platformIdOrRegion));
    }

    /**
     * Get the configuration for a specific challenge
     * @param challengeId
     * @param [platformIdOrRegion] default will be used if omitted
     * @return {Bluebird<ChallengeConfigInfoDto>} 
     */
    gettingChallengeConfigById(challengeId, platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
			.then(() => ErrorUtil.checkChallengeId(challengeId))
			.then(() => this.executingRequest(`/challenges/${challengeId}/config`, platformIdOrRegion));
    }

    /**
     * Gets all challenges and their respective percentiles of players who have obtained each level.
     * 
     * Level - 0 NONE, 1 IRON, 2 BRONZE, 3 SILVER, 4 GOLD, 5 PLATINUM, 6 DIAMOND, 7 MASTER, 8 GRANDMASTER, 9 CHALLENGER
     * @param [platformIdOrRegion] default will be used if omitted
     * @return {Bluebird<Map[Long, Map[Integer, Map[Level, Double]]]>}
     */
    gettingChallengesPercentiles(platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
			.then(() => this.executingRequest(`/challenges/percentiles`, platformIdOrRegion));
    }

    /**
     * Gets the percentiles of players for each level for a specific challenge
     * 
     * Level - 0 NONE, 1 IRON, 2 BRONZE, 3 SILVER, 4 GOLD, 5 PLATINUM, 6 DIAMOND, 7 MASTER, 8 GRANDMASTER, 9 CHALLENGER
     * @param challengeId
     * @param [platformIdOrRegion] default will be used if omitted
     * @return {Bluebird<Map[Level, double]>} 
     */
    gettingChallengePercentilesById(challengeId, platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
			.then(() => ErrorUtil.checkChallengeId(challengeId))
			.then(() => this.executingRequest(`/challenges/${challengeId}/percentiles`, platformIdOrRegion));
    }

    /**
     * Gets all challenge data for a specific player
     * 
     * @param [platformIdOrRegion] default will be used if omitted
     * @return {Bluebird<PlayerInfoDto>}
     */
    gettingChallengesPlayerData(puuid, platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
			.then(() => ErrorUtil.checkPuuid(puuid))
			.then(() => this.executingRequest(`/player-data/${puuid}`, platformIdOrRegion));
    }
}

module.exports = ChallengesEndpoint;