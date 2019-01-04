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
	 * @return {Bluebird<ChampionInfo>}
	 */
	gettingRotations(platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion))
			.then(({_platformId, _options}) => this.executingRequest(`/champion-rotations`, _platformId, _options));
	}

}

module.exports = ChampionEndpoint;