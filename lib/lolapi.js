/*global require*/
/*global module*/
/*global console*/
/*jslint nomen: true*/

(function () {

    'use strict';

    var League = {},
        util = require('./util'),
        authKey,
        region = 'na', // TODO: refactor to platform
		platformIdDefault = 'na1',
        /** @deprecated use apiUrl methods or API_BASE_URL instead */
        endpoint = 'api.pvp.net/api/lol',
		// TODO: refactor to endpoints object
		/** @deprecated migrate to {@link apiUrl.status} methods */
        statusEndpoint = 'status.leagueoflegends.com',
		/** @deprecated migrate to {@link apiUrl.tournament} methods */
		tournamentEndpoint = 'api.pvp.net/tournament/public/v1',
		/** @deprecated migrate to {@link apiUrl.championMastery} methods */
		championMasteryEndpoint = 'api.pvp.net/championmastery',
		/** @deprecated migrate to {@link apiUrl.champion} methods */
		championUrl = '/v1.2/champion',
		/** @deprecated migrate to {@link apiUrl.match.recentByAccount} */
		gameUrl = '/v1.3/game/by-summoner',
		/** @deprecated migrate to {@link apiUrl.league} methods */
		leagueUrl = {
			/** @deprecated migrate to {@link apiUrl.league} methods */
			summoner: '/v2.5/league/by-summoner',
			/** @deprecated removed from RIOT API */
			team: '/v2.5/league/by-team'
        },
		/** @deprecated removed from RIOT API*/
		statsUrl = '/v1.3/stats/by-summoner',
		/** @deprecated migrate to {@link apiUrl.summoner} methods */
		summonerUrl = '/v1.4/summoner',
		/** @deprecated migrate to {@link apiUrl.match} methods */
		matchUrl = '/v2.2/match',
		/** @deprecated migrate to {@link apiUrl.match} methods */
		matchHistoryUrl = '/v2.2/matchlist/by-summoner',
		/** @deprecated migrate to {@link apiUrl.spectator} methods */
		observerUrl = 'api.pvp.net/observer-mode/rest',
		/** @deprecated migrate to {@link apiUrl.staticData} methods */
		staticUrl = '/static-data';

    const API_VERSION = 'v3',
		API_BASE_URL = 'api.riotgames.com';

	let apiUrl = {};
	apiUrl.host = (platformId) => `https://${platformId}.${API_BASE_URL}`;
	apiUrl.championMastery = {
		bySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/champion-mastery/${API_VERSION}/champion-masteries/by-summoner/${summonerId}`,
		bySummonerAndChampion: (platformId, summonerId, championId) => `${apiUrl.host(platformId)}/lol/champion-mastery/${API_VERSION}/champion-masteries/by-summoner/${summonerId}/by-champion/${championId}`,
		scores: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/champion-mastery/${API_VERSION}/scores/by-summoner/${summonerId}`
	};
	apiUrl.champion = {
        /***/
		list: (platformId) => `${apiUrl.host(platformId)}/lol/platform/${API_VERSION}/champions`,
		byId: (platformId, championId) => `${apiUrl.host(platformId)}/lol/platform/${API_VERSION}/champions/${championId}`
	};
	apiUrl.league = {
		bySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/league/${API_VERSION}/by-summoner/${summonerId}`,
		positionsBySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/league/${API_VERSION}/positions/by-summoner/${summonerId}`,
		/**
		 * @param platformId
		 * @param rankedQueue {RankedQueue}
		 * @since 2017-05-02 */
		challengerByQueue: (platformId, rankedQueue) => `${apiUrl.host(platformId)}/lol/league/${API_VERSION}/challengerleagues/by-queue/${rankedQueue}`,
		/**
		 * @param platformId
		 * @param rankedQueue {RankedQueue}
		 * @since 2017-05-02 */
		masterByQueue: (platformId, rankedQueue) => `${apiUrl.host(platformId)}/lol/league/${API_VERSION}/masterleagues/by-queue/${rankedQueue}`
	};
	apiUrl.status = {
		list: (platformId) => `${apiUrl.host(platformId)}/lol/status/${API_VERSION}/shard-data`
	};
	apiUrl.masteries = {
		bySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/platform/${API_VERSION}/masteries/by-summoner/${summonerId}`
	};
	apiUrl.match = {
		details: (platformId, matchId) => `${apiUrl.host(platformId)}/lol/match/${API_VERSION}/matches/${matchId}`,
		byAccount: (platformId, accountId) => `${apiUrl.host(platformId)}/lol/match/${API_VERSION}/matchlists/by-account/${accountId}`,
		recentByAccount: (platformId, accountId) => `${apiUrl.host(platformId)}/lol/match/${API_VERSION}/matchlists/by-account/${accountId}/recent`,
		timelines: (platformId, matchId) => `${apiUrl.host(platformId)}/lol/match/${API_VERSION}/timelines/by-match/${matchId}`
	};
	apiUrl.runes = {
		bySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/platform/${API_VERSION}/runes/by-summoner/${summonerId}`
	};
	apiUrl.spectator = {
		bySummoner: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/spectator/${API_VERSION}/active-games/by-summoner/${summonerId}`,
		featuredGames: (platformId) => `${apiUrl.host(platformId)}/lol/spectator/${API_VERSION}/featured-games`
	};
	apiUrl.staticData = {
		championsList: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/champions`,
		championsById: (platformId, id) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/champions/${id}`,
		itemsList: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/items`,
		itemsById: (platformId, id) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/items/${id}`,
		languageStrings: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/language-strings`,
		languages: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/languages`,
		maps: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/maps`,
		masteriesList: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/masteries`,
		masteriesById: (platformId, id) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/masteries/${id}`,
		profileIcons: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/profile-icons`,
		realms: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/realms`,
		runesList: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/runes`,
		runesById: (platformId, id) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/runes/${id}`,
		summonerSpellsList: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/summoner-spells`,
		summonerSpellsById: (platformId, id) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/summoner-spells/${id}`,
		versions: (platformId) => `${apiUrl.host(platformId)}/lol/static-data/${API_VERSION}/versions`,
	};
	apiUrl.summoner = {
		byAccount: (platformId, accountId) => `${apiUrl.host(platformId)}/lol/summoner/${API_VERSION}/summoners/by-account/${accountId}`,
		byName: (platformId, summonerName) => `${apiUrl.host(platformId)}/lol/summoner/${API_VERSION}/summoners/by-name/${summonerName}`,
		byId: (platformId, summonerId) => `${apiUrl.host(platformId)}/lol/summoner/${API_VERSION}/summoners/${summonerId}`,
	};
	apiUrl.tournament = {
		/** POST */
		createCode: (platformId) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/codes`,
		/** POST */
		createProvider: (platformId) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/providers`,
		/** POST */
		createTournament: (platformId) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/tournaments`,
		/** PUT */
		update: (platformId, tournamentCode) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/codes/${tournamentCode}`,
		/** GET */
		getCode: (platformId, tournamentCode) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/codes/${tournamentCode}`,
		/** GET */
		getLobbyEvents: (platformId, tournamentCode) => `${apiUrl.host(platformId)}/lol/tournament/${API_VERSION}/lobby-events/by-code/${tournamentCode}`,
	};


    League.Stats = {};

    League.Summoner = {};

    League.Static = {};

    League.Tournament = {};

    League.ChampionMastery = {};

	League.init = function (key, regionTag) {
		authKey = key;
		if (regionTag) {
			region = regionTag;
			League.getPlatformId(region).then(_platformId => {
				platformId = _platformId;
			});
		}
	};

    League.getRegions = function (callback) { // TODO: add missing regions
        var regions = {
            'na': 'North America',
            'euw': 'Europe West',
            'eune': 'Europe Nordic and East'
        };
        return util.makeStaticRequest(error, regions);
    };

    League.getPlatformId = function (region, callback) {
        let platforms = {
				'br': 'br1',
				'eune': 'eun1',
				'euw': 'euw1',
				'jp': 'jp1',
				'kr': 'kr',
                'lan': 'la1',
                'las': 'la2',
				'na': 'na1',
                'oce': 'oc1',
                'tr': 'tr1',
                'ru': 'ru',
				'pbe': 'pbe1',
				'global': 'global'
            },
            platformId,
            error;
        platformId = platforms[region.toLowerCase()];
        error = platformId ? null : 'Invalid region';
        return util.makeStaticRequest(error, platformId, callback);
    };

    League.getQueues = function (callback) { // TODO: update https://developer.riotgames.com/game-constants.html
        var queues = {
            2: 'Normal 5v5 Blind Pick',
            4: 'Ranked Solo 5v5',
            7: 'Coop vs AI 5v5',
            8: 'Normal 3v3',
            14: 'Normal 5v5 Draft Pick',
            16: 'Dominion 5v5 Blind Pick',
            17: 'Dominion 5v5 Draft Pick',
            25: 'Dominion Coop vs AI',
            41: 'Ranked Team 3v3',
            42: 'Ranked Team 5v5',
            52: 'Twisted Treeline Coop vs AI',
            65: 'ARAM',
            67: 'ARAM Coop vs AI'
        };
        return util.makeStaticRequest(null, queues);
    };

    League.getMapNames = function (callback) { // TODO: update https://developer.riotgames.com/game-constants.html
        var maps ={
            1: 'Summoner\'s Rift Summer Variant ',
            2: 'Summoner\'s Rift Autumn Variant',
            3: 'The Proving Grounds',
            4: 'Twisted Treeline Original Version',
            8: 'The Crystal Scar',
            10: 'Twisted Treeline Current Version',
            12: 'Howling Abyss'
        };
        return util.makeStaticRequest(null, maps);
    };

    /** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.getShards = function(callback) { // TODO: migrate to v3
        var shards = '/shards',
            url = util.craftStatusUrl(statusEndpoint, shards, '');

        return util.makeRequest(url, 'Error getting shards: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.getShardByRegion = function(regionOrFunction, callback) { // TODO: migrate to v3
        var shards = '/shards',
            regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftStatusUrl(statusEndpoint, shards,  '/' + regionAndFunc.region);
        return util.makeRequest(url, 'Error getting shards by region ', null, callback);
    };
    // TODO: add getShardByPlatform

	League.getMatch = (matchId, platformId = platformIdDefault, callback = undefined) => {
		const url = util.craftUrlV3(apiUrl.match.details(platformId, matchId), authKey);
		return util.makeRequest(url, 'Error getting match: ', null, callback);
	};

	League.getMatchTimeLine = (matchId, platformId = platformIdDefault, callback = undefined) => {
		const url = util.craftUrlV3(apiUrl.match.timelines(platformId, matchId), authKey);
		return util.makeRequest(url, 'Error getting match: ', null, callback);
	};

	League.getMatchHistory = (accountId, {beginTime, endTime, beginIndex, endIndex, season, championIds, queue}, platformId = platformIdDefault, callback = undefined) => {
		let queryString = '';

		if (beginTime) {
			queryString += '&beginTime=' + beginTime;
		}
		if (endTime) {
			queryString += '&endTime=' + endTime;
		}
		if (beginIndex) {
			queryString += '&beginIndex=' + beginIndex;
		}
		if (endIndex) {
			queryString += '&endIndex=' + endIndex;
		}
		if (season){
			let seasonData = [].concat(season);
			queryString += '&season=' + seasonData.join();
		}
		if (championIds) {
			let championIdsData = [].concat(championIds);
			queryString += '&champion=' + championIdsData.join();
		}
		if (queue) {
			let queueData = [].concat(queue);
			queryString += '&queue=' + queueData.join();
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3( apiUrl.match.byAccount(platformId, accountId), authKey, queryString);
		return util.makeRequest(url, 'Error getting match history: ', null, callback);
	};

	League.getRecentGames = function (accountId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.match.recentByAccount(platformId,accountId), authKey);
		return util.makeRequest(url, 'Error getting recent games: ', 'matches', callback);
	};

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.getMatchForTournament = function(matchId, tournamentCode, includeTimelineOrFunction, regionOrFunction, callback) { // TODO: migrate to v3
        var url,
            regionAndFunc;
        if (typeof(includeTimelineOrFunction) === 'function'){
            regionAndFunc = util.getCallbackAndRegion(includeTimelineOrFunction, region, callback);
        } else {
            regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback);
        }
        if (includeTimelineOrFunction) {
            includeTimelineOrFunction = 'includeTimeline=true&';
        } else {
            includeTimelineOrFunction = '';
        }
        url = util.craftUrl(endpoint, regionAndFunc.region, matchUrl + '/for-tournament/' +
            matchId + '?' + includeTimelineOrFunction + 'tournamentCode=' + tournamentCode + '&', authKey);
        return util.makeRequest(url, 'Error getting tournament match: ', null, regionAndFunc.callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.getMatchIdsByTournament = function(tournamentCode, regionOrFunction, callback) { // TODO: migrate to v3
        var url,
            regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback);

        url = util.craftUrl(endpoint, regionAndFunc.region, matchUrl + '/by-tournament/' +
            tournamentCode + '/ids?', authKey);
        return util.makeRequest(url, 'Error getting tournament match ids: ', null, regionAndFunc.callback);
    };

    League.getCurrentGame = function(summonerId, platformId = platformIdDefault, callback = undefined) {
        const url = util.craftUrlV3(apiUrl.spectator.bySummoner(platformId, summonerId), authKey);
        return util.makeRequest(url, 'Error getting current game for summoner:', null, callback)
    };
	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
	League.getFeaturedGames = function(regionOrFunction, callback) { // TODO: migrate to v3
        var featuredUrl = '/featured',
            regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftObserverUrl(observerUrl, regionAndFunc.region, featuredUrl + '?', authKey);
        return util.makeRequest(url, 'Error getting current game: ', null, regionAndFunc.callback);
    };
	League.getChampions = function (freeToPlay, platformId = platformIdDefault, callback = undefined) {
        let freetoPlayQuery = '';

        if (freeToPlay === null || typeof (freeToPlay) !== 'boolean') {
            console.log('Invalid query parameter for freeToPlay: ' + freeToPlay);
        }

        if (freeToPlay) {
            freetoPlayQuery = 'freeToPlay=true&';
        }
        const url = util.craftUrlV3(apiUrl.champion.list(platformId), authKey, freetoPlayQuery);
        return util.makeRequest(url, 'Error getting champions: ', 'champions', callback);
    };

	// TODO: add getChampionById


	/** @deprecated will stop working on 2017-06-24 use League.Summoner.getLeagues instead */
    League.getLeagueData = function (summonerId, regionOrFunction, callback) {
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftUrl(endpoint, regionAndFunc.region, leagueUrl.summoner + '/' + summonerId + '?', authKey);

        return util.makeRequest(url, 'Error getting league data: ', null, regionAndFunc.callback);
    };

	/** @deprecated will stop working on 2017-06-24 use League.Summoner.getLeaguePositions instead */
	League.getLeagueEntryData = function (summonerId, regionOrFunction, callback) {
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftUrl(endpoint, regionAndFunc.region, leagueUrl.summoner + '/' + summonerId + '/entry?', authKey);

        return util.makeRequest(url, 'Error getting league data: ', null, regionAndFunc.callback);
    };

	League.Summoner.getLeagues = function (summonerId, platformId = platformIdDefault, callback = undefined ) {
		const url = util.craftUrlV3(apiUrl.league.bySummoner(platformId,summonerId), authKey);
		return util.makeRequest(url, 'Error getting leagues for summoner: ', null, callback);
	};

	League.Summoner.getLeaguePositions = function (summonerId, platformId = platformIdDefault, callback = undefined ) {
		const url = util.craftUrlV3(apiUrl.league.positionsBySummoner(platformId,summonerId), authKey);
		return util.makeRequest(url, 'Error getting league positions for summoner: ', null, callback);
	};
	// TODO: add masters league
	// TODO: add challenger league

	/** @deprecated will be removed without replacement on 2017-06-24 */
	League.Stats.getPlayerSummary = function (summonerId, season, regionOrFunction, callback) { // TODO: migrate to v3
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            seasonURL = '',
            url;

        if (util.getValidSeasonParam(season)) {
            if (season) {
                seasonURL = 'season=SEASON' + season + '&';
            }
        } else {
            console.log('Invalid query parameter for season: ' + season);
        }

        url = util.craftUrl(endpoint, regionAndFunc.region,
            statsUrl + '/' + summonerId + '/summary?' + seasonURL, authKey);
        return util.makeRequest(url, 'Error getting summary data: ', 'playerStatSummaries', regionAndFunc.callback);
    };

	/** @deprecated will be removed without replacement on 2017-06-24 */
    League.Stats.getRanked = function (summonerId, season, regionOrFunction, callback) { // TODO: migrate to v3
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            seasonURL = '',
            url;

        if (util.getValidSeasonParam(season)) {
            if (season) {
                seasonURL = 'season=SEASON' + season + '&';
            }
        } else {
            console.log('Invalid query parameter for season: ' + season);
        }

        url = util.craftUrl(endpoint, regionAndFunc.region,
            statsUrl + '/' + summonerId + '/ranked?' + seasonURL, authKey);
        return util.makeRequest(url, 'Error getting ranked data: ', 'champions', regionAndFunc.callback);
    };

    League.Summoner.getMasteries = function (summonerId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.masteries.bySummoner(platformId,summonerId), authKey);
		return util.makeRequest(url, 'Error getting mastery data: ', null, callback);
    };

    League.Summoner.getRunes = function (summonerId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.runes.bySummoner(platformId,summonerId), authKey);
        return util.makeRequest(url, 'Error getting rune data: ', null, callback);
    };

    League.Summoner.getByName = function (name, platformId = platformIdDefault, callback = undefined) {
        name = encodeURIComponent(name.split(' ').join(''));
        const url = util.craftUrlV3(apiUrl.summoner.byName(platformId,name), authKey);
        return util.makeRequest(url, 'Error getting summoner data using name: ', null, callback);
    };

	/** @deprecated will be removed without replacement on 2017-06-24
	 * batch calls will not be supported anymore with v3 of RIOT API */
    League.Summoner.listSummonerDataByNames = function (names, regionOrFunction, callback) { // TODO: migrate to v3 by batching this internally!?
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url;

        names = names.map(function (name) {
            return encodeURIComponent(name.split(' ').join(''))
        })
        url = util.craftUrl(endpoint, regionAndFunc.region, summonerUrl + '/by-name/' + names.toString() + '?', authKey);

        return util.makeRequest(url, 'Error getting summoner data using names: ', null, regionAndFunc.callback);
    };

    League.Summoner.getByID = function (summonerId, platformId = platformIdDefault, callback = undefined) {
    	const url = util.craftUrlV3(apiUrl.summoner.byId(platformId, summonerId), authKey);
        return util.makeRequest(url, 'Error getting summoner data: ', null, callback);
    };

	League.Summoner.getByAccount = function (accountId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.summoner.byAccount(platformId, accountId), authKey);
		return util.makeRequest(url, 'Error getting summoner data: ', null, callback);
	};

	/** @deprecated will be removed without replacement on 2017-06-24
	 * batch calls will not be supported anymore with v3 of RIOT API */
    League.Summoner.listNamesByIDs = function (ids, regionOrFunction, callback) { // TODO: migrate to v3 by batching this internally!?
        if(Array.isArray(ids)){
            ids = ids.join();
        }
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftUrl(endpoint, regionAndFunc.region, summonerUrl + '/' + ids + '/name?', authKey);

        return util.makeRequest(url, 'Error getting summoner names using list of ids: ', null, regionAndFunc.callback);
    };

	/** @deprecated will be removed without replacement on 2017-06-24
	 * batch calls will not be supported anymore with v3 of RIOT API */
    League.Summoner.listSummonerDataByIDs = function (ids, regionOrFunction, callback) { // TODO: migrate to v3 by batching this internally!?

        if(Array.isArray(ids)){
            ids = ids.join();
        }
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftUrl(endpoint, regionAndFunc.region, summonerUrl + '/' + ids + '?', authKey);
        return util.makeRequest(url, 'Error getting summoner data using list of ids: ', null, regionAndFunc.callback);
    };

    League.setRateLimit  = function (limitPer10s, limitPer10min) {
        util.setRateLimit(limitPer10s, limitPer10min);
    };

    /** @deprecated will be removed without replacement in future releases.
	 * // TODO: review if really redundant (Colorfulstan)
	 * */
    League.setEndpoint = function (newEndpoint) {
        endpoint = newEndpoint;
    };

	/** @deprecated will be removed without replacement in future releases.
	 * // TODO: review if really redundant (Colorfulstan)
	 * */
    League.setSummonerUrl = function (newPath) {
        summonerUrl = newPath;
    };

	/** @deprecated will be removed without replacement in future releases.
	 * // TODO: review if really redundant (Colorfulstan)
	 * */
    League.getSummonerUrl = function (newPath) {
        return summonerUrl;
    };

	/** @deprecated will be removed without replacement in future releases.
	 * // TODO: review if really redundant (Colorfulstan)
	 * */
    League.getEndpoint = function () {
        return endpoint;
    };
    League.Static.getChampionList = function({version, champData, dataById, locale} = {}, platformId = platformIdDefault, callback = undefined) {

    	let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (champData) {
			let champDataArray = [].concat(champData);
			queryString += '&champListData=' + champDataArray.join();
		}
		if (dataById) {
			queryString += '&dataById=true';
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.championsList(platformId),  authKey, queryString);
        return util.makeRequest(url, 'Error getting static champion list: ', null, callback);
    };

	League.Static.getChampionById = function(id, {version, champData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (champData) {
			let champDataArray = [].concat(champData);
			queryString += '&champListData=' + champDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.championsById(platformId, id), authKey, queryString);
		return util.makeRequest(url, 'Error getting static champion: ', null, callback);
	};

	League.Static.getItemList = function({version, itemListData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (itemListData) {
			let itemListDataArray = [].concat(itemListData);
			queryString += '&itemListData=' + itemListDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.itemsList(platformId), authKey, queryString);
		return util.makeRequest(url, 'Error getting static item list: ', null, callback);
	};

	League.Static.getItemById = function(id, {version, itemData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (itemData) {
			let itemDataArray = [].concat(itemData);
			queryString += '&itemData=' + itemDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.itemsById(platformId, id), authKey, queryString);
		return util.makeRequest(url, 'Error getting static item: ', null, callback);
	};

	// TODO: add getLanguageStrings
	// TODO: add getLanguages
	// TODO: add getMaps

	League.Static.getMasteryList = function({version, masteryListData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (masteryListData) {
			let masteryListDataArray = [].concat(masteryListData);
			queryString += '&masteryListData=' + masteryListDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.masteriesList(platformId), authKey, queryString);
		return util.makeRequest(url, 'Error getting mastery list  ', null, callback);
	};

	League.Static.getMasteryById = function(id, {version, masteryData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (masteryData) {
			let masteryDataArray = [].concat(masteryData);
			queryString += '&masteryData=' + masteryDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.masteriesById(platformId, id), authKey, queryString);
		return util.makeRequest(url, 'Error getting mastery by id: ', null, callback);
	};

	// TODO: add getProfileIcons

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Static.getRealm = function(regionOrFunction, callback) { // TODO: migrate to v3
        var realmUrl = '/v1.2/realm?', // TODO: replace with definition of urls on top of file
            regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback),
            url = util.craftStaticUrl(endpoint + staticUrl, regionAndFunc.region, realmUrl, authKey);
        return util.makeRequest(url, 'Error getting realm: ', null, regionAndFunc.callback);
    };

	League.Static.getRuneList = function({version, runeListData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (runeListData) {
			let runeListDataArray = [].concat(runeListData);
			queryString += '&runeListData=' + runeListDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.runesList(platformId), authKey, queryString);
		return util.makeRequest(url, 'Error getting runes list  ', null, callback);
	};

	League.Static.getRuneById = function(id, {version, runeData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (runeData) {
			let runeDataArray = [].concat(runeData);
			queryString += '&runeData=' + runeDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.runesById(platformId, id), authKey, queryString);
		return util.makeRequest(url, 'Error getting rune by id: ', null, callback);
	};
	League.Static.getSummonerSpellList = function({version, spellData, dataById, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (spellData) {
			let spellDataArray = [].concat(spellData);
			queryString += '&spellListData=' + spellDataArray.join();
		}
		if (dataById) {
			queryString += '&dataById=true';
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.summonerSpellsList(platformId), authKey, queryString);
		return util.makeRequest(url, 'Error getting summoner spell list: ', null, callback);
	};

	League.Static.getSummonerSpellById = function(id, {version, spellData, locale} = {}, platformId = platformIdDefault, callback = undefined) {

		let queryString = '';

		if (version) {
			queryString += '&version=' + version;
		}
		if (spellData) {
			let spellDataArray = [].concat(spellData);
			queryString += '&spellData=' + spellDataArray.join();
		}
		if (locale) {
			queryString += '&locale=' + locale;
		}
		queryString = '?' + queryString.substr(1); // remove first "&" and add '?'

		const url = util.craftUrlV3(apiUrl.staticData.summonerSpellsById(platformId, id), authKey, queryString);
		return util.makeRequest(url, 'Error getting summoner spell by id: ', null, callback);
	};

    League.Static.getVersions = function(platformId = platformIdDefault, callback = undefined) {
        const url = util.craftUrlV3(apiUrl.staticData.versions(platformId), authKey);
        return util.makeRequest(url, 'Error getting versions: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
	League.Tournament.createProvider = function(region, callbackUrl, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'provider?', authKey);
        return util.makeCustomRequest(url, 'POST', {
            region: region,
            url: callbackUrl
        }, 'Error creating tournament provider: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Tournament.createTournament = function(name, providerId, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'tournament?', authKey);
        return util.makeCustomRequest(url, 'POST', {
            name: name,
            providerId: providerId
        }, 'Error creating tournament: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Tournament.createCode = function(tournamentId, count, options, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'code?tournamentId=' + tournamentId +
            '&count=' + count + '&', authKey);

        var bodyData = {};
        if (typeof options.teamSize != 'undefined') bodyData.teamSize = options.teamSize;
        if (typeof options.allowedSummonerIds != 'undefined')
            bodyData.allowedSummonerIds = {participants: options.allowedSummonerIds};
        if (typeof options.spectatorType != 'undefined') bodyData.spectatorType = options.spectatorType;
        if (typeof options.pickType != 'undefined') bodyData.pickType = options.pickType;
        if (typeof options.mapType != 'undefined') bodyData.mapType = options.mapType;
        if (typeof options.metadata != 'undefined') bodyData.metadata = options.metadata;

        return util.makeCustomRequest(url, 'POST', bodyData, 'Error creating tournament code: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Tournament.updateCode = function(tournamentCode, options, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'code/' + tournamentCode + '?', authKey);

        var bodyData = {};
        if (typeof options.allowedParticipants != 'undefined')
            bodyData.allowedParticipants = options.allowedParticipants.join(',');
        if (typeof options.spectatorType != 'undefined') bodyData.spectatorType = options.spectatorType;
        if (typeof options.pickType != 'undefined') bodyData.pickType = options.pickType;
        if (typeof options.mapType != 'undefined') bodyData.mapType = options.mapType;

        return util.makeCustomRequest(url, 'PUT', bodyData, 'Error updating tournament code: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Tournament.getCode = function(tournamentCode, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'code/' + tournamentCode + '?', authKey);

        return util.makeRequest(url, 'Error getting tournament code: ', null, callback);
    };

	/** @deprecated will stop workin on 2017-06-24 if not migrated to v3 */
    League.Tournament.getLobbyEventsByCode = function(tournamentCode, callback) {
        var url = util.craftTournamentUrl(tournamentEndpoint, 'lobby/events/by-code/' + tournamentCode + '?', authKey);

        return util.makeRequest(url, 'Error getting lobby events: ', null, callback);
    };

    League.ChampionMastery.getChampions = function(summonerId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.championMastery.bySummoner(platformId, summonerId), authKey);
		return util.makeRequest(url, 'Error getting champion mastery champions: ', null, callback);
    };

    League.ChampionMastery.getChampion = function(summonerId, championId, platformId = platformIdDefault, callback = undefined) {
		const url = util.craftUrlV3(apiUrl.championMastery.bySummonerAndChampion(platformId, summonerId, championId), authKey);
		return util.makeRequest(url, 'Error getting champion mastery champions: ', null, callback);
    };

    League.ChampionMastery.getScore = function(summonerId, platformId = platformIdDefault, callback = undefined) {
    	const url = util.craftUrlV3(apiUrl.championMastery.scores(platformId, summonerId), authKey);
		return util.makeRequest(url, 'Error getting champion mastery champions: ', null, callback);
    };

    /** @deprecated will be removed without replacement on 2017-06-24
	 * use {@link League.ChampionMastery.getChampions } instead*/
    League.ChampionMastery.getTopChampions = function(playerId, count, regionOrFunction, callback) {
        var regionAndFunc = util.getCallbackAndRegion(regionOrFunction, region, callback);
        var countParameter = count ? 'count=' + count + '&' : '';

        return League.getPlatformId(regionAndFunc.region)
            .then(function(platformId) {
                var url = util.craftChampionMasteryUrl(championMasteryEndpoint, regionAndFunc.region, platformId, '/player/' + playerId + '/topchampions?' + countParameter, authKey);

                return util.makeRequest(url, 'Error getting champion mastery champions: ', null, regionAndFunc.callback);
            });
    };

    module.exports = League;
}());


/**
 * @typedef {string} RankedQueue
 * ranked Queue as string. "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT"
 * */