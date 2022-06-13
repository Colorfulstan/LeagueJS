'use strict';

const Config = require('./Config.js');
const RiotRateLimiter = require('riot-ratelimiter');
const RateLimiterStrategy = require('riot-ratelimiter/dist/RateLimiter').STRATEGY;

// Endpoints

const SummonerEndpoint = require('./endpoints/SummonerEndpoint');
const ChampionMasteryEndpoint = require('./endpoints/ChampionMasteryEndpoint');
const ChampionEndpoint = require('./endpoints/ChampionEndpoint');
const LeagueEndpoint = require('./endpoints/LeagueEndpoint');
const LolStatusEndpoint = require('./endpoints/LolStatusEndpoint');
const MatchEndpoint = require('./endpoints/MatchEndpoint');
const SpectatorEndpoint = require('./endpoints/SpectatorEndpoint');
// const StaticDataEndpoint = require('./endpoints/StaticDataEndpoint');
const StaticDataDDragonCompat = require('./compatibility/StaticDataDDragonCompat');
const ThirdPartyCodeEndpoint = require('./endpoints/ThirdPartyCodeEndpoint');
const ChallengesEndpoint = require('./endpoints/ChallengesEndpoint');


const util = require('./util');

const DEFAULT_PLATFORM_ID = 'na1';

/**
 * Main Class for the API Wrapper
 */
class LeagueJS {

	/**
	 * Create ApiWrapper and require API_KEY to be set
	 * @param options.API_KEY Riot API-KEY. Can also be set as env-variable "LEAGUE_API_KEY"
	 *
	 * @param options.PLATFORM_ID Default Platform ID to use for endpoints when not provided.
	 * Can also be set as env-variable "LEAGUE_API_PLATFORM_ID"
	 *
	 * @see {@link leagueJSDefaultConfig}
	 */
	constructor(apiKey, options = {}) {
		options.API_KEY = apiKey;
		/**
		 * @type {leagueJSDefaultConfig}
		 * */
		this.config = new Config(options);

		if (typeof this.config.API_KEY === 'undefined' || this.config.API_KEY === '') {
			throw new Error('The apiKey is needed. Please pass it as parameter to the LeagueJS constructor.');
		}

		if (typeof this.config.PLATFORM_ID === 'undefined' || this.config.PLATFORM_ID === '') {
			console.log(`No PLATFORM_ID given in League constructor or Node Environment. Using ${DEFAULT_PLATFORM_ID} as default`);
			this.config.PLATFORM_ID = DEFAULT_PLATFORM_ID;
		}

		let {allowBursts} = this.config.limits;
		this.rateLimiter = new RiotRateLimiter({
			strategy: allowBursts ? RateLimiterStrategy.BURST : RateLimiterStrategy.SPREAD,
			debug: this.config.debug
		});

		// setting the Endpoints explicitly for better code completion and IDE support
		// Endpoints that take a rate-limiter as constructor parameter are rate-limited.
		// Rate Limiting can be fine-tuned as Developer by using the respective request-methods within Endpoint
		// explicitly if neccessary in the future
		this.Summoner = new SummonerEndpoint(this.config, this.rateLimiter);
		this.ChampionMastery = new ChampionMasteryEndpoint(this.config, this.rateLimiter);
		this.Champion = new ChampionEndpoint(this.config, this.rateLimiter);
		this.League = new LeagueEndpoint(this.config, this.rateLimiter);
		this.Match = new MatchEndpoint(this.config, this.rateLimiter);
		this.Spectator = new SpectatorEndpoint(this.config, this.rateLimiter);
		this.LolStatus = new LolStatusEndpoint(this.config, this.rateLimiter);
		this.ThirdPartyCode = new ThirdPartyCodeEndpoint(this.config, this.rateLimiter);
		this.Challenges = new ChallengesEndpoint(this.config, this.rateLimiter);

		/** treated as endpoint even though it's technically not. */
		this.StaticData = new StaticDataDDragonCompat(this.config);

		/** Array to be able to replace cahes for all endpoints */
		this._endpoints = [
			this.Summoner,
			this.ChampionMastery,
			this.Champion,
			this.League,
			this.Match,
			this.Spectator,
			this.LolStatus,
			this.StaticData,
			this.ThirdPartyCode,
			this.ChallengesEndpoint
		];
	}

	static get util() {
		return util;
	}

	static get GAME_CONSTANTS() {
		return LeagueJS.util.GameConstantsUtil.GAME_CONSTANTS;
	}

	getConfig() {
		return this.config;
	}

	/**
	 * Sets a new Cache type or options for all endpoints.
	 * Also available per endpoint
	 * @param options
	 * @param Constructor
	 */
	setCache(options, Constructor) {
		this._endpoints.forEach(endpoint => {
			endpoint.setCache(options, Constructor);
		});
	}

	/**
	 * Flushes all caches for all endpoints.
	 * Also available per endpoint
	 */
	flushCache() {
		this._endpoints.forEach(endpoint => {
			endpoint.flushCache();
		});
	}


	/**
	 * Enables caching and can set a new Cache type or options for all endpoints.
	 * Also available per endpoint
	 * @param options
	 * @param Constructor
	 */
	enableCaching(options, Constructor) {
		this._endpoints.forEach(endpoint => {
			endpoint.enableCaching(options, Constructor);
		});
	}

	/**
	 * Disables Caching for all endpoints.
	 * Also available per endpoint
	 */
	disableCaching() {
		this._endpoints.forEach(endpoint => {
			endpoint.disableCaching();
		});
	}

	/**
	 * Update the rateLimit for all Endpoints
	 * @param per10 (deprecated) not used anymore
	 * @param per600 (deprecated) not used anymore
	 * @param allowBursts
	 * @deprecated use updateRateLimiter() instead
	 */
	setRateLimit(per10 = this.config.limits.per10, per600 = this.config.limits.per10, allowBursts = this.config.limits.allowBursts) {
		this.updateRateLimiter({allowBursts});
	}

	/** @deprecated needs update for riot-ratelimiter. Currently riot-ratelimiter (0.0.5)
	 * does not include a method to receive the rate-limits.
	 * Will return the (deprecated) default limits for now to not break too much if used */
	getRateLimits() {
		// throw new Error('Not yet implemented');
		// return this.rateLimiter.getLimits();
		return this.config.limits;
	}

	/**
	 *
	 * @param allowBursts if true, setting BURST strategy for limiter, if false setting SPREAD strategy
	 * @see {@link https://github.com/Colorfulstan/RiotRateLimiter-node#choosing-the-right-strategy}
	 */
	updateRateLimiter({allowBursts} = {}) {
		LeagueJS.util.ErrorUtil.throwIfNotBoolean(allowBursts, 'options.allowBursts');
		this.rateLimiter.setStrategy((allowBursts ? RateLimiterStrategy.BURST : RateLimiterStrategy.SPREAD));
	}
}

module.exports = LeagueJS;