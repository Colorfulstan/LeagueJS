const ParameterError = require('../errors/ParameterError');
const SummonerUtil = require('./SummonerUtil');
const RegionAndPlatformUtil = require('./RegionAndPlatformUtil');

const RiotRateLimiter = require('riot-ratelimiter');

class ErrorUtil {
	static throwIfNotString(param, paramName) {
		if (typeof param !== 'string') {
			throw new TypeError(`${paramName} can not be an Array. Received: ${param}`);
		}
	}

	static throwIfIsArray(param, paramName) {
		if (param instanceof Array) {
			throw new TypeError(`${paramName} can not be an Array. Received: ${param}`);
		}
	}

	static throwIfNotNumerical(param, paramName) {
		if (isNaN(parseInt(param))) {
			throw new TypeError(`${paramName} has to be a number or numerical string. Received: ${param}`);
		}
	}

	static throwIfInvalidPlatformId(platformId) {
		if (!RegionAndPlatformUtil.validatePlatformId(platformId)) {
			throw new ParameterError(`${platformId} is not a valid platformId`);
		}
	}

	static throwIfNotBoolean(param, paramName) {
		const isBooleanString = typeof param === 'string' && (param === 'true' || param === 'false');
		const isBoolean = param === true || param === false;
		if (!(isBoolean || isBooleanString)) {
			throw new TypeError(`${paramName} has to be a boolean or booleanlike string (true,false,'true','false'). Received: ${param}`);
		}
	}

	static throwIfNameIsInvalid(name) {
		if (!SummonerUtil.validateSummonerNameInputLength(name)) {
			throw new ParameterError(`Summoner name "${name}" is too long (16 characters max, found ${name.length})`);
		}
		const invalidCharactersMatch = SummonerUtil.validateSummonerNameInputCharacters(name);
		if (invalidCharactersMatch) {
			throw new ParameterError(`Summoner name "${name}" contains invalid characters: ${invalidCharactersMatch.join(' | ')}`);
		}
	}

	static throwIfRankedQueueConfigIdInvalid(rankedQueueConfigId) {
		const validRankedQueueConfigIds = ['RANKED_SOLO_5x5', 'RANKED_FLEX_TT', 'RANKED_FLEX_SR'];
		if (validRankedQueueConfigIds.indexOf(rankedQueueConfigId) === -1) {
			throw new ParameterError(`rankedQueueConfigId has to be one of ${validRankedQueueConfigIds}. Received: ${rankedQueueConfigId}`);
		}
	}

	static throwIfNotObject(param, paramName) {
		if (typeof param === 'function' || typeof param !== 'object') {
			throw new TypeError(`${paramName} needs to be an object. Received: ${param}`);
		}
	}

	static throwIfNotRateLimiter(param, name) {
		if (!(param instanceof RiotRateLimiter)) {
			throw new TypeError(`${name} needs to be instanceof RiotRateLimiter. Received: ${param}`);
		}
	}

	static throwIfApexLevelIsInvalid(level) {
		const validLevels = ["CHALLENGER", "MASTER", "GRANDMASTER"];
		if (validLevels.indexOf(level) === -1) {
			throw new ParameterError(`level has to be one of ${validLevels}. Received: ${level}`);
		}
	}

	static checkSummonerId(summonerId, apiVersion){
		if (apiVersion === 'v3') {
			return ErrorUtil.throwIfNotNumerical(summonerId, 'summonerId');
		} else {
			return ErrorUtil.throwIfNotString(summonerId, 'summonerId');
		}
	}

	static checkAccountId(accountId, apiVersion){
		if (apiVersion === 'v3') {
			return ErrorUtil.throwIfNotNumerical(accountId, 'accountId');
		} else {
			return ErrorUtil.throwIfNotString(accountId, 'accountId');
		}
	}

	static checkForAccountId(accountId, apiVersion){
		if (apiVersion === 'v3') {
			return ErrorUtil.throwIfNotNumerical(accountId, 'forAccountId');
		} else {
			return ErrorUtil.throwIfNotString(accountId, 'forAccountId');
		}
	}

	static checkPuuid(puuid) {
		return ErrorUtil.throwIfNotString(puuid, 'puuid');
	}
	
	static checkChallengeId(challengeId) {
		return ErrorUtil.throwIfNotNumerical(challengeId, 'challengeId')
	}
}
module.exports = ErrorUtil;