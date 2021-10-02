const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const {ErrorUtil, ParameterUtil, RegionAndPlatformUtil, MatchUtil, EndpointUtil} = util;
const ParameterError = require('../errors/ParameterError');

/***
 * Endpoint to receive information about finished Match
 */
class MatchEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('Match', config, rateLimiter);
		this.apiUrl += `/match/${this.apiVersion}`;
	}

	/**
	 * overwriting because the url is build differently usig regions instead of platformIds
	 * see
	 *
	 * @private
	 * @param endpointUrl the alternating url component for the respective endpoint
	 * @param platformId
	 * @param {object} options options to be included as query-string
	 * @returns {string} request url
	 */
	_buildURL(endpointUrl, platformId = this.config.PLATFORM_ID, options = {}) {
		const query = EndpointUtil.buildQueryStringFromOptions(options);
		return `${this.apiUrl.replace(/{platformId}/, RegionAndPlatformUtil.getContinentRegionFromPlatformIdOrRegion(platformId))}${endpointUrl}?${query}`;
	}

	/**
	 * Get match by match ID
	 * @param matchId {string} EUW1_5468515346
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @param options
	 * @param options.forPuuid If provided, used to identify the desired participant If Provided forPlatformId is also required.
	 * @return {Bluebird<MatchDto>}
	 */
	gettingById(matchId, platformIdOrRegion = this.config.PLATFORM_ID, options = {}) {
		const {forPuuid, forPlatformId} = options;
		return Bluebird.resolve()
			.then(() => {
				ErrorUtil.throwIfNotString(matchId, 'matchId');
				if (forPuuid && !forPlatformId) {
					throw new ParameterError('"forPlatformId" has to be provided if "forPuuid" is used');
				}
				if (forPlatformId && !forPuuid) {
					throw new ParameterError('"forPuuid" has to be provided if "forPlatformId" is used');
				}
				if (forPuuid && forPlatformId) {
					ErrorUtil.checkPuuid(forPuuid, this.apiVersion);
					if (!RegionAndPlatformUtil.validatePlatformId(forPlatformId)) {
						throw new ParameterError(`"forPlatformId" is not a valid platformId. Received: ${forPlatformId}`);
					}
				}
			})
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/matches/${matchId}`, _platformId, _options))
			.then(matchDto => {
				if (forPuuid) {
					const participantIdentityDto = MatchUtil.getParticipantByPuuid({
						matchInfoDto: matchDto.info,
						puuid: forPuuid
					});
					matchDto.info.participants = participantIdentityDto ? [participantIdentityDto] : [];
				}
				return matchDto;
			});
	}

	/**
	 * Get match timeline by match ID
	 * @param matchId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<MatchTimelineDto>}
	 */
	gettingTimelineById(matchId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotString(matchId, 'matchId'))
			.then(() => this.executingRequest(`/matches/${matchId}/timeline`, platformIdOrRegion));
	}

	/**
	 * Get matchlist for games played on given puuid ID and platform ID
	 * and filtered using given filter parameters, if any.
	 *
	 * Implementation Notes:
	 * A number of optional parameters are provided for filtering.<br>
	 * It is up to the caller to ensure that the combination of filter parameters provided is valid
	 * for the requested account, otherwise, no matches may be returned.<br>
	 * <ul>
	 *         <li>If beginIndex is specified, but not endIndex, then endIndex defaults to beginIndex+100.</li>
	 *         <li>If endIndex is specified, but not beginIndex, then beginIndex defaults to 0.</li>
	 *         <li>If both are specified, then endIndex must be greater than beginIndex.</li>
	 *         <li>The maximum range allowed is 100, otherwise a 400 error code is returned.</li>
	 *         <li>If beginTime is specified, but not endTime, then these parameters are ignored.</li>
	 *         <li>If endTime is specified, but not beginTime, then beginTime defaults to the start of the account's match history.</li>
	 *         <li>If both are specified, then endTime should be greater than beginTime.</li>
	 *         <li>The maximum time range allowed is one week, otherwise a 400 error code is returned.</li>
	 * </ul>
	 *
	 * @param {number} puuid
	 * @param {string} [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 *
	 * @param {object} options
	 * @param {number[]} options.queue <strong>Set of queue IDs for which to filtering matchlist.</strong>
	 *
	 * @param {number} options.beginTime <strong>The begin time to use for filtering matchlist specified as epoch milliseconds.</strong><br>
	 * If beginTime is specified, but not endTime, then these parameters are ignored.
	 * If endTime is specified, but not beginTime, then beginTime defaults to the start of the account's match history.
	 * If both are specified, then endTime should be greater than beginTime. The maximum time range allowed is one week,
	 * otherwise a 400 error code is returned.
	 *
	 * @param {number} options.endTime <strong>The end time to use for filtering matchlist specified as epoch milliseconds.</strong><br>
	 * If beginTime is specified, but not endTime, then these parameters are ignored. If endTime is specified,
	 * but not beginTime, then beginTime defaults to the start of the account's match history. If both are specified,
	 * then endTime should be greater than beginTime. The maximum time range allowed is one week,
	 * otherwise a 400 error code is returned.
	 *
	 * @param {number} options.beginIndex <strong>The begin index to use for filtering matchlist.</strong><br>
	 * If beginIndex is specified, but not endIndex, then endIndex defaults to beginIndex+100.
	 * If endIndex is specified, but not beginIndex, then beginIndex defaults to 0.
	 * If both are specified, then endIndex must be greater than beginIndex.
	 * The maximum range allowed is 100, otherwise a 400 error code is returned.
	 *
	 * @param {number} options.endIndex <strong>The end index to use for filtering matchlist.</strong><br>
	 * If beginIndex is specified, but not endIndex,
	 * then endIndex defaults to beginIndex+100. If endIndex is specified, but not beginIndex,
	 * then beginIndex defaults to 0. If both are specified, then endIndex must be greater than beginIndex.
	 * The maximum range allowed is 100, otherwise a 400 error code is returned.
	 *
	 * @param options.type Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.
	 *
	 * @return {Bluebird<MatchlistDto>}
	 */
	gettingListByAccount(puuid, platformIdOrRegion, options = {}) {
		let numExpectedMatches = 100;
		if (options.endIndex && options.beginIndex){
			numExpectedMatches = options.endIndex - options.beginIndex;
		} else if(options.endIndex){
			numExpectedMatches = options.endIndex + 1;
		}
		const numBatches = Math.ceil(numExpectedMatches/100);
		const lastBatchNumMatches = numExpectedMatches%100;
		let optionsForMatchIds = { queue:options.queue, type: options.type, start:options.beginIndex, startTime:options.beginTime, endTime:options.endTime};

		const idPromises = [];
		if ( numExpectedMatches > 100){
			console.warn('You can not request more than 100 matchIds in one call, we will need to make ' + numBatches);

			for (let i = 1; i <= numBatches; i++) {
				optionsForMatchIds.count = i === numBatches ? lastBatchNumMatches : 100;
				idPromises.push(this.gettingMatchIdsByPuuid(puuid, platformIdOrRegion, optionsForMatchIds));
			}
		} else {
			if (numExpectedMatches){
				optionsForMatchIds.count = numExpectedMatches;
			}
			idPromises.push(this.gettingMatchIdsByPuuid(puuid, platformIdOrRegion, optionsForMatchIds));
		}

		return Bluebird.all(idPromises).then(idArrays => {
			return idArrays.reduce((result, ids) => {
				return result.concat(ids);
			}, []);
		}).then(ids => {
			return Bluebird.all(
				Bluebird.map(ids, (id)=>{
					return this.gettingById(id, platformIdOrRegion).catch(e => {
						if (e.status === 404){
							console.warn('Match could not be found ' + id + ' ' + platformIdOrRegion);
						}
					});
				}, {concurrency: 1})
			).then(matches => ({matches:matches.filter(match => !!match)}));
		});
	}

	/**
	 *
	 * @param puuid
	 * @param platformIdOrRegion
	 * @param options
	 * @param options.startTime Epoch timestamp in seconds. The matchlist started storing timestamps on June 16th, 2021. Any matches played before June 16th, 2021 won't be included in the results if the startTime filter is set.
	 * @param options.endTime Epoch timestamp in seconds.
	 * @param options.queue Filter the list of match ids by a specific queue id. This filter is mutually inclusive of the type filter meaning any match ids returned must match both the queue and type filters.
	 * @param options.type Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.
	 * @param options.start - Defaults to 0. Start index.
	 * @param options.count - Defaults to 20. Valid values: 0 to 100. Number of match ids to return.
	 *
	 *
	 * @return {PromiseLike<{_options: *, _platformId: string}>}
	 */
	gettingMatchIdsByPuuid(puuid, platformIdOrRegion, options = {}) {
		if(options.count && options.count > 100){
			console.warn('RIOT only supports count up to 100');
		}
		return Bluebird.resolve()
			.then(() => ErrorUtil.checkPuuid(puuid))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/matches/by-puuid/${puuid}/ids`, _platformId, _options));
	}

	/**
	 * Get matchlist for ranked games played on given account ID and platform ID
	 *
	 * The gab between end / startIndex can be bigger then the default 100.
	 * If no index is given, all pages available will be requested and returned.
	 * If only startIndex is given, all subsequent matchlist entries will be requested and returned.
	 * If only endIndex is given, beginIndex will start with 0
	 *
	 * All collected Matchlist Entries will be returned in the matches property within the MatchlistDto as expected
	 *
	 * // TODO: change to use "totalGames" property when fixed to execute requests in parallel (see Issues)
	 * NOTE: using this method will be slower then maybe expected until "totalGames" property in the MatchlostDto
	 * from RIOT will be fixed (see Issues),
	 * so every page will be requested in series to stop asap when no more matches are available
	 *
	 * @see {@link gettingListByAccount}
	 * @return {Bluebird<MatchlistDto>}
	 *
	 * @deprecated feature included in gettingListByAccount
	 */
	gettingListByAccountWithoutPagination(accountId, platformIdOrRegion, options = {}) {
		return this.gettingListByAccount(accountId, platformIdOrRegion, options);
	}

	/**
	 * Get matchlist for last 20 matches played on given account ID and platform ID.
	 * @param accountId
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<MatchlistDto>}
	 * @deprecated  use gettingListByAccount instead.
	 * {@link https://discussion.developer.riotgames.com/articles/3241/update-on-matchlist-and-recent-endpoints.html}
	 */
	gettingRecentListByAccount(accountId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return this.gettingListByAccount(accountId, platformIdOrRegion, {beginIndex: 0, endIndex: 20});
	}
	gettingRecentListByAccountV5(accountId, platformIdOrRegion = this.config.PLATFORM_ID) {
		return this.gettingListByAccount(accountId, platformIdOrRegion, {beginIndex: 0, endIndex: 20});
	}

	/**
	 * Get match IDs by tournament code.
	 * NOTE: API-key needs to be a tournament API-KEY
	 * @param tournamentCode
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<number[]>}
	 */
	gettingIdsByTournament(tournamentCode, platformIdOrRegion = this.config.PLATFORM_ID) { // TODO: unit tests!?
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotString(tournamentCode, 'tournamentCode'))
			.then(() => this.executingRequest(`/matches/by-tournament-code/${tournamentCode}`, platformIdOrRegion));
	}

	/**
	 * Get match by match ID and tournament code.
	 * @param gameId
	 * @param tournamentCode
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<MatchDto>}
	 */
	gettingByIdForTournament(gameId, tournamentCode, platformIdOrRegion = this.config.PLATFORM_ID) { // TODO: unit tests!?
		return Bluebird.resolve()
			.then(() => Bluebird.all([ErrorUtil.throwIfNotNumerical(gameId, 'gameId'), ErrorUtil.throwIfNotString(tournamentCode, 'tournamentCode')]))
			.then(() => this.executingRequest(`/matches/${gameId}/by-tournament-code/${tournamentCode}`, platformIdOrRegion));
	}
}

module.exports = MatchEndpoint;