const Bluebird = require('bluebird');

const ApiRequest = require('./ApiRequest');
const Cacheable = require('./Cacheable');

const util = require('./util');
const {EndpointUtil, ErrorUtil, RegionAndPlatformUtil} = util;

const ParameterError = require('./errors/ParameterError');

/**
 * Riot API Endpoint
 */
class Endpoint extends Cacheable {

	/**
	 * Create new Endpoint based on Config
	 */
	constructor(name, config, rateLimiter) {
		super(config);
		if (arguments.length < 3) {
			throw new ParameterError('Endpoint expects 3 mandatory Parameter: ' +
				'mandatory: (name: string, config: JSON, rateLimiter: RiotRateLimiter)');
		}
		this.name = name;

		if (config.apiVersionOverrides[name] === 'v4') {
			Endpoint.apiVersionDeprecationWarning(name, 'v4');
		}

		// cloning config to have independent Options per Endpoint!
		// this.config = Object.assign({}, config);

		ErrorUtil.throwIfNotRateLimiter(rateLimiter, 'rateLimiter');
		this.rateLimiter = rateLimiter;

		// TODO: remove check for config.useV4 in 2.0
		if (config.useV4) {
			this.apiVersion = this.config.apiVersionOverrides[name] || this.config.API_VERSION;
		} else {
			this.apiVersion = this.config.API_VERSION;
		}
		// NOTE: will be amended by implementing Endpoints
		this.apiUrl = `https://{platformId}.${this.config.API_HOST}/lol`;
		this.requestOptions = {token: this.config.API_KEY, rateLimiter: this.rateLimiter};
		if (this.config.limits.retryEndpoints.indexOf(this.name) !== -1) {
			this.requestOptions.numRetriesLeft = this.config.limits.numMaxRetries;
			this.requestOptions.intervalRetryMS = this.config.limits.intervalRetryMS;
		}
	}

	getConfig() {
		return this.config;
	}

	isDebugging() {
		return this.config.debug;
	}

	/**
	 *
	 * @private
	 * @param endpointUrl the alternating url component for the respective endpoint
	 * @param platformId
	 * @param {object} options options to be included as query-string
	 * @returns {string} request url
	 */
	_buildURL(endpointUrl, platformId = this.config.PLATFORM_ID, options = {}) {
		const query = EndpointUtil.buildQueryStringFromOptions(options);
		return `${this.apiUrl.replace(/{platformId}/, platformId)}${endpointUrl}?${query}`;
	}

	/**
	 * Execute a APIRequest based on the Config of this Endpoint
	 * This request will be rate limited IF a ratelimiter is set for this endpoint.
	 * if there is a Cached version of the request it will be used instead of making a request against the server
	 *
	 */
	executingRequest(endpointUrl, platformIdOrRegion = this.config.PLATFORM_ID, options = {}) {
		return Bluebird.resolve()
			.then(() => {
				const platformId = RegionAndPlatformUtil.getPlatformIdFromPlatformIdOrRegion(platformIdOrRegion);

				const requestUrl = this._buildURL(endpointUrl, platformId, options);
				const cacheValue = this.cache ? this.cache.get(requestUrl) : null;

				if (cacheValue) {
					return cacheValue;
				} else {
					if (this.isDebugging()) {
						console.log('Endpoint#executingRequest requestUrl: ' + requestUrl);
					}
					return ApiRequest.executing(requestUrl, this.requestOptions)
						.then(response => {
							if (this.cache) {
								this.cache.set(requestUrl, response);
							}
							return response;
						});
				}
			});
	}

	// TODO: remove usage in 2.0
	static apiVersionDeprecationWarning(name) {
		console.warn(`[LeagueJS - ${name}] With january 28th 2019, this endpoint will be forced to use v4. 
Please make sure you migrate your code for the neccessary changes.
See https://www.riotgames.com/en/DevRel/player-universally-unique-identifiers-and-a-new-security-layer for details.`);
	}
}

module.exports = Endpoint;