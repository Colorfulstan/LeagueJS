const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const {ErrorUtil} = util;

/***
 * Endpoint to receive ranked information about leagues by queue or for specific summoners
 */
class LeagueEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('League', config, rateLimiter);
		this.apiUrl += `/league/${this.apiVersion}`;
	}

	/**
	 * gets the Challenger league for the given ranked queue and platformIdOrRegion
	 * @param {'RANKED_SOLO_5x5' | 'RANKED_FLEX_TT' | 'RANKED_FLEX_SR' } rankedQueueConfigId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<LeagueListDTO>}
	 */
	gettingChallengerLeague(rankedQueueConfigId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfRankedQueueConfigIdInvalid(rankedQueueConfigId))
			.then(() => this.executingRequest(`/challengerleagues/by-queue/${rankedQueueConfigId}`, platformIdOrRegion));
	}

	/**
	 * gets the Master league for the given ranked queue and platformIdOrRegion
	 * @param {'RANKED_SOLO_5x5' | 'RANKED_FLEX_TT' | 'RANKED_FLEX_SR' } rankedQueueConfigId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<LeagueListDTO>}
	 */
	gettingMasterLeague(rankedQueueConfigId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfRankedQueueConfigIdInvalid(rankedQueueConfigId))
			.then(() => this.executingRequest(`/masterleagues/by-queue/${rankedQueueConfigId}`, platformIdOrRegion));
	}

	/**
	 * gets the GrandMaster league for the given ranked queue and platformIdOrRegion
	 * @param {'RANKED_SOLO_5x5' | 'RANKED_FLEX_TT' | 'RANKED_FLEX_SR' } rankedQueueConfigId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<LeagueListDTO>}
	 */
	gettingGrandMasterLeague(rankedQueueConfigId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfRankedQueueConfigIdInvalid(rankedQueueConfigId))
			.then(() => this.executingRequest(`/grandmasterleagues/by-queue/${rankedQueueConfigId}`, platformIdOrRegion));
	}

	/**
	 * gets a league by its league id
	 * @param {String} leagueId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<LeagueListDTO>}
	 */
	gettingLeagueById(leagueId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotString(leagueId, 'leagueId'))
			.then(() => this.executingRequest(`/leagues/${leagueId}`, platformIdOrRegion));
	}

	/**
	 * gets information about the league entries for the summoner in all queues he is ranked in
	 * @return {Bluebird<LeagueEntryDTO[]>}
	 */
	gettingEntriesForSummonerId(summonerId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.checkSummonerId(summonerId, this.apiVersion))
			.then(() => this.executingRequest(`/entries/by-summoner/${summonerId}`, platformIdOrRegion));
	}

	/**
	 * gets league entries in all queues for a given summoner ID
	 * @return {Bluebird<LeagueEntryDTO[]>}
	 */
	gettingLeagueEntriesForSummonerId(summonerId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return this.gettingEntriesForSummonerId(summonerId, platformIdOrRegion);
	}

	/**
	 * gets entries for the specified queue, division and tier
	 * @return {Bluebird<LeagueEntryDTO[]>}
	 * @param {string} [queueName = 'RANKED_SOLO_5x5'] valid queue value (e.g. RANKED_SOLO_5x5, RANKED_FLEX_SR, RANKED_FLEX_TT)
	 * @param {string} [tierName = 'DIAMOND'] e.g. DIAMOND, IRON, ...
	 * @param {string} [divisionName = 'I'] e.g. I, II, III, IV
	 * @param {string} [platformIdOrRegion]
	 * @param {{page:number}} options
	 */
	gettingEntries({
					   queueName = 'RANKED_SOLO_5x5',
					   tierName = 'DIAMOND',
					   divisionName = 'I',
					   platformIdOrRegion = this.config.PLATFORM_ID
				   }, options) {
		return this.executingRequest(`/entries/${queueName}/${tierName}/${divisionName}`, platformIdOrRegion, options);
	}

}

module.exports = LeagueEndpoint;