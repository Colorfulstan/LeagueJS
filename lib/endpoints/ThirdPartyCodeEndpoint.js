const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');
const ErrorUtil = require('../util/ErrorUtil');

/***
 * Endpoint to receive 3rd party verification string from the client
 */
class ThirdPartyCodeEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('ThirdPartyCode', config, rateLimiter);
		this.apiUrl += `/platform/${this.apiVersion}`;
	}

	/**
	 * @param {number} summonerId
	 * @param {string} platformIdOrRegion case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<string>} The string that the user entered in settings->about->verification
	 */
	gettingBySummoner(summonerId, platformIdOrRegion) {
		return Bluebird.resolve()
			.then(() => {
				ErrorUtil.checkSummonerId(summonerId, this.apiVersion);
			})
			.then(() => this.executingRequest(`/third-party-code/by-summoner/${summonerId}`, platformIdOrRegion));
	}

	/**
	 *
	 * @param {string} verificationCode the code
	 * @param {number} summonerId
	 * @param {string} platformIdOrRegion
	 * @return {Bluebird<boolean>} resolves to true, if verification codes match
	 */
	verifying(verificationCode, summonerId, platformIdOrRegion) {
		return Bluebird.resolve()
			.then(() => {
				ErrorUtil.throwIfNotString(verificationCode, 'verificationCode');
				ErrorUtil.checkSummonerId(summonerId, this.apiVersion);
			})
			.then(() => this.executingRequest(`/third-party-code/by-summoner/${summonerId}`, platformIdOrRegion))
			.then((codeFromAPI) => verificationCode === codeFromAPI);
	}
}

module.exports = ThirdPartyCodeEndpoint;