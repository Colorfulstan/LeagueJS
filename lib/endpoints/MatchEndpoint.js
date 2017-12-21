const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const {ErrorUtil, ParameterUtil, RegionAndPlatformUtil, MatchUtil} = util;
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
     * Get match by match ID
     * @param gameId
     * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
     * @param options
     * @param options.forAccountId If provided, used to identify the desired participant If Provided forPlatformId is also required.
     * @param options.forPlatformId If provided, used to identify the desired participant. If Provided forAccountId is also required.
     * @return {Bluebird<MatchDto>}
     */
    gettingById(gameId, platformIdOrRegion = this.config.PLATFORM_ID, options = {}) {
        const {forAccountId, forPlatformId} = options;
        return Bluebird.resolve()
            .then(() => {
                ErrorUtil.throwIfNotNumerical(gameId, 'gameId');
				if (forAccountId && !forPlatformId){
                    throw new ParameterError('"forPlatformId" has to be provided if "forAccountId" is used');
                }
				if (forPlatformId && !forAccountId){
                    throw new ParameterError('"forAccountId" has to be provided if "forPlatformId" is used');
                }
				if (forAccountId && forPlatformId){
                    ErrorUtil.throwIfNotNumerical(forAccountId, 'forAccountId');
					if (!RegionAndPlatformUtil.validatePlatformId(forPlatformId)){
                        throw new ParameterError(`"forPlatformId" is not a valid platformId. Received: ${forPlatformId}`);
                    }
                }
            })
            .then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
            .then(({_platformId, _options}) => this.executingRequest(`/matches/${gameId}`, _platformId, _options))
            .then(matchDto => {
				if (forAccountId && forPlatformId){
					const participantIdentityDto = MatchUtil.getParticipantIdentityByAccountAndPlatformId({matchDto, accountId: forAccountId, platformId: forPlatformId});
                    matchDto.participantIdentities = participantIdentityDto ? [participantIdentityDto] : [];
                }
                return matchDto;
            });
    }

    /**
     * Get match timeline by match ID
     * @param gameId
     * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
     * @return {Bluebird<MatchTimelineDto>}
     */
    gettingTimelineById(gameId, platformIdOrRegion = this.config.PLATFORM_ID) {
        return Bluebird.resolve()
            .then(() => ErrorUtil.throwIfNotNumerical(gameId, 'gameId'))
            .then(() => this.executingRequest(`/timelines/by-match/${gameId}`, platformIdOrRegion));
    }

    /**
     * Get matchlist for games played on given account ID and platform ID
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
     * @param {number} accountId
     * @param {string} [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
     *
     * @param {object} options
     * @param {number[]} options.queue <strong>Set of queue IDs for which to filtering matchlist.</strong>
     * @param {number[]} options.season <strong>Set of season IDs for which to filtering matchlist.</strong>
     * @param {number[]} options.champion <strong>Set of champion IDs for which to filtering matchlist.</strong>
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
     *
     * @return {Bluebird<MatchlistDto>}
     */
    gettingListByAccount(accountId, platformIdOrRegion, options = {}) {
        return Bluebird.resolve()
            .then(() => ErrorUtil.throwIfNotNumerical(accountId, 'accountId'))
            .then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
            .then(({_platformId, _options}) => this.executingRequest(`/matchlists/by-account/${accountId}`, _platformId, _options));
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
     */
    gettingListByAccountWithoutPagination(accountId, platformIdOrRegion, options = {}) {

		// NOTE: this needs to be changed if RIOT decides to change the pagination results size
		const maxResultsFromRIOTPerPage = 100;

		const internalOptions = Object.assign({}, options);
        internalOptions.beginIndex = !options.beginIndex ? 0 : options.beginIndex;
        internalOptions.endIndex = undefined; // will only be used for the very last call

        let matches = [];
        let _matchListDTO;


        const loop = (index, matchListLength) => {
        	if (this.isDebugging()){
				console.log('MatchEndpoint#gettingListByAccountWithoutPagination current beginIndex: ' + index, matchListLength);
				console.log('MatchEndpoint#gettingListByAccountWithoutPagination requesting ' + matchListLength + ' entries');
			}
            if (matchListLength === maxResultsFromRIOTPerPage && (options.endIndex && index < options.endIndex)) {

            	// only use endIndex if it's neccessary
				// a) if more then the valid amount of results would be requested => ignore it
				// b) if less then the valid amount of results would be requested => lower it acchordingly
				if (options.endIndex && index + maxResultsFromRIOTPerPage >= options.endIndex){
					internalOptions.endIndex = options.endIndex;
					if (this.isDebugging()){
						console.log('MatchEndpoint#gettingListByAccountWithoutPagination: Setting final endIndex');
					}
				}

                return this.gettingListByAccount(accountId, platformIdOrRegion, internalOptions).then((matchListDto) => {
                    internalOptions.beginIndex += 100;

					if(!_matchListDTO){ _matchListDTO = matchListDto;}

					matches = matches.concat(matchListDto.matches);
					if (this.isDebugging()) {
						console.log('MatchEndpoint#gettingListByAccountWithoutPagination Matches from last call: ' + matchListDto.matches.length);
						console.log('MatchEndpoint#gettingListByAccountWithoutPagination Matches so far: ' + matches.length, matches[matches.length - 1].gameId, matchListDto.matches[matchListDto.matches.length - 1].gameId);
					}
                    return loop(internalOptions.beginIndex, matchListDto.matches.length);
                });
            } else {
				_matchListDTO.matches = matches;
                return Promise.resolve(_matchListDTO);
            }
        };

        return loop(internalOptions.beginIndex, 100).then((result) => {
        	if (this.isDebugging()){
				console.log('MatchEndpoint#gettingListByAccountWithoutPagination Done. Got ' + result.matches.length + ' matchlist Entries');
			}
            return result;
        });


    }

    /**
     * Get matchlist for last 20 matches played on given account ID and platform ID.
     * @param accountId
     * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
     * @return {Bluebird<MatchlistDto>}
     * @deprecated Will be removed in next major release, use gettingListByAccount instead.
     * {@link https://discussion.developer.riotgames.com/articles/3241/update-on-matchlist-and-recent-endpoints.html}
     */
    gettingRecentListByAccount(accountId, platformIdOrRegion = this.config.PLATFORM_ID) {
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