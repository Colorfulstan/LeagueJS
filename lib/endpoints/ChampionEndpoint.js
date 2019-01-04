const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const {ParameterUtil, ErrorUtil} = util;

/***
 * Endpoint to receive client information about champions on the league platform
 * For game data about champions use static-data instead
 */
class ChampionEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('Champion', config, rateLimiter);
		this.apiUrl += `/platform/${this.apiVersion}`;
	}

	/**
	 * Gets basic platform information about all champions.
	 * @param freeToPlay
	 * @param [platformIdOrRegion] default will be used if omitted
	 * @return {Bluebird<ChampionListDto>}
	 * @deprecated use gettingRotations instead
	 */
	gettingList(platformIdOrRegion, {freeToPlay = false} = {}) {
		// TODO: remove in 2.0
		console.warn('[LeagueJS - ChampionEndpoint.gettingList] This method was removed - use gettingRotations instead');
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotBoolean(freeToPlay, 'freeToPlay'))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, {freeToPlay}))
			.then(({_platformId, _options}) => this.executingRequest(`/champions`, _platformId, _options));
	}

	/**
	 * Gets the basic platform information about a specific champion
	 * @param championId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ChampionDto>}
	 * @deprecated use gettingRotation instead
	 */
	gettingById(championId, platformIdOrRegion = this.config.PLATFORM_ID) {
		// TODO: remove in 2.0
		console.warn('[LeagueJS - ChampionEndpoint.gettingList] This method was removed - use gettingRotations instead');
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(championId, 'championId'))
			.then(() => this.executingRequest(`/champions/${championId}`, platformIdOrRegion));
	}


	/**
	 * Gets basic platform information about all champions.
	 * @param freeToPlay
	 * @param [platformIdOrRegion] default will be used if omitted
	 * @return {Bluebird<ChampionInfo>}
	 */
	gettingRotations(platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion))
			.then(({_platformId, _options}) => this.executingRequest(`/champion-rotations`, _platformId, _options));
	}

}

module.exports = ChampionEndpoint;