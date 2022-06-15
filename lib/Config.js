const deepmerge = require('deepmerge');
const path = require('path');

const RequestCache = require('./RequestCache');

const util = require('./util');
const {EndpointUtil} = util;

/**
 * @typedef {leagueJSDefaultConfig}
 */
let leagueJSDefaultConfig = {
	'debug': false,
	'PLATFORM_ID': process.env.LEAGUE_API_PLATFORM_ID,
	'API_HOST': 'api.riotgames.com',
	'API_VERSION': 'v4',
	// temp solution during migration to v4 (and if endpoints differ in versions)
	// use this to set different versions per endpoint
	'apiVersionOverrides': {
		'Champion': 'v3',
		'Match': 'v5',
		'Challenges': 'v1'
	},
	'STATIC_DATA_ROOT': path.resolve(__dirname, '../', 'StaticDataDefaultRoot'),
	'caching': {
		'isEnabled': false,
		'constructor': RequestCache,
		'defaults': {
			/** the standard ttl as number in seconds for every generated cache element.
			 * (default: 0) 0 = unlimited
			 * */
			stdTTL: 0,
			/**
			 * The period in seconds, as a number, used for the automatic delete check interval.
			 * 0 = no periodic check.
			 * (default: 600) 0 = no periodic checks
			 */
			checkperiod: 600,
			/**
			 * en/disable throwing or passing an error to the callback if attempting to .get a missing or expired value.
			 * (default: false)
			 */
			errorOnMissing: false,
			/**
			 * en/disable cloning of variables. If true you'll get a copy of the cached variable.
			 * If false you'll save and get just the reference.
			 * Note: true is recommended, because it'll behave like a server-based caching.
			 * You should set false if you want to save mutable objects or other complex types
			 * with mutability involved and wanted.
			 */
			useClones: true
		}
	},
	'limits': {
		/** @deprecated */
		'per10': 10,
		/** @deprecated */
		'per600': 500,
		'allowBursts': false,
		// maximum amount of retries done when encountering 500 or 503
		'numMaxRetries': 3,
		// starting retry backoff time on RIOT service overload (not related to API key limits)
		// will be increased exponentially with every retry
		'intervalRetryMS': 1000,
		// per default, retry is enabled on all endpoints
		'retryEndpoints': EndpointUtil.getEndpointNames()
	}
};

class Config {
	constructor(optionsOverwrites){
		this.defaults = leagueJSDefaultConfig;
		this.current = optionsOverwrites? deepmerge(this.defaults, optionsOverwrites) : this.defaults;
		return this.current;
	}
}

module.exports = Config;