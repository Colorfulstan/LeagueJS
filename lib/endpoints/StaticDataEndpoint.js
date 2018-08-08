const Bluebird = require('bluebird');

const Endpoint = require('../Endpoint');

const util = require('../util');
const {ErrorUtil, ParameterUtil} = util;

// const ParameterError = require('../errors/ParameterError');

/***
 * Endpoint to receive Data from the Data dragon service
 */
class StaticDataEndpoint extends Endpoint {

	constructor(config, rateLimiter) {
		super('StaticData', config, rateLimiter);
		this.apiUrl += `/static-data/${this.apiVersion}`;
	}


	/**
	 * @deprecated StaticData Endpoints are removed as of august 27th 2018.
	 * You can use StaticDataDdragonCompat instead.
	 *
	 * Retrieves champion list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, key, name, and title are returned by default
	 * if this parameter isn't specified.</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>allytips</li>
	 *     <li>blurb</li>
	 *     <li>enemytips</li>
	 *     <li>format</li>
	 *     <li>image</li>
	 *     <li>info</li>
	 *     <li>keys</li>
	 *     <li>lore</li>
	 *     <li>partype</li>
	 *     <li>passive</li>
	 *     <li>recommended</li>
	 *     <li>skins</li>
	 *     <li>spells</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 * </ul>
	 *
	 * @param {boolean} options.dataById
	 * <p>If specified as true, the returned data map will use the champions' IDs as the keys.</p>
	 * <p> If not specified or specified as false, the returned data map will use the champions' keys instead.</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ChampionListDto>}
	 */
	gettingChampions(platformIdOrRegion, options = {}) {
		console.warn('StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/champions`, _platformId, _options));
	}

	/**
	 * Retrieves champion by ID.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param championId
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only id, key, name, and title are returned by default
	 * if this parameter isn't specified.</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>allytips</li>
	 *     <li>blurb</li>
	 *     <li>enemytips</li>
	 *     <li>format</li>
	 *     <li>image</li>
	 *     <li>info</li>
	 *     <li>keys</li>
	 *     <li>lore</li>
	 *     <li>partype</li>
	 *     <li>passive</li>
	 *     <li>recommended</li>
	 *     <li>skins</li>
	 *     <li>spells</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ChampionDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingChampionById(championId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(championId, 'championId'))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/champions/${championId}`, _platformId, _options));
	}

	/**
	 * Retrieves item list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, name, plaintext, and description are returned by default
	 * if this parameter isn't specified.</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>colloq</li>
	 *     <li>consumeOnFull</li>
	 *     <li>consumed</li>
	 *     <li>depth</li>
	 *     <li>effect</li>
	 *     <li>from</li>
	 *     <li>gold</li>
	 *     <li>groups</li>
	 *     <li>hideFromAll</li>
	 *     <li>image</li>
	 *     <li>inStore</li>
	 *     <li>into</li>
	 *     <li>maps</li>
	 *     <li>requiredChampion</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>specialRecipe</li>
	 *     <li>stacks</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 *     <li>tree</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ItemListDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingItems(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/items`, _platformId, _options));
	}

	/**
	 * Retrieves item by ID.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 *
	 * @param {number} itemId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, name, description, plaintext, and ~group~ are returned by default
	 * if this parameter isn't specified</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>colloq</li>
	 *     <li>consumeOnFull</li>
	 *     <li>consumed</li>
	 *     <li>depth</li>
	 *     <li>effect</li>
	 *     <li>from</li>
	 *     <li>gold</li>
	 *     <li>groups</li>
	 *     <li>hideFromAll</li>
	 *     <li>image</li>
	 *     <li>inStore</li>
	 *     <li>into</li>
	 *     <li>maps</li>
	 *     <li>requiredChampion</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>specialRecipe</li>
	 *     <li>stacks</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 *     <li>tree</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ItemDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingItemById(itemId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(itemId, 'itemId'))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/items/${itemId}`, _platformId, _options));
	}

	/**
	 * Retrieve language strings data
	 * This means Language parts as in stats for example.
	 * Useful for example to generate stat-string as in
	 *    "rFlatMPRegenModPerLevel": "Mana Regen / 5 at level 18"
	 *
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param options
	 * @param {string} options.version Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<LanguageStringsDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingLanguageStrings(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/language-strings`, _platformId, _options));
	}

	/**
	 * Retrieve supported languages data.
	 * (locale-strings supported for the given region)
	 *
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<string[]>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingLanguages(platformIdOrRegion = this.config.PLATFORM_ID) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return this.executingRequest(`/languages`, platformIdOrRegion);
	}

	/**
	 * Retrieve map data.
	 *
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param options
	 * @param {string} options.version Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 *
	 * @return {Bluebird<MapDataDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingMaps(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/maps`, _platformId, _options));
	}


	/**
	 * Retrieves champion list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, key, name, and title are returned by default
	 * if this parameter isn't specified.</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>image</li>
	 *     <li>masteryTree</li>
	 *     <li>prereq</li>
	 *     <li>ranks</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>tree</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<MasteryListDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingMasteries(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/masteries`, _platformId, _options));
	}


	/**
	 * Retrieves champion list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param {number} masteryId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only id, key, name, and title are returned by default
	 * if this parameter isn't specified.</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>image</li>
	 *     <li>masteryTree</li>
	 *     <li>prereq</li>
	 *     <li>ranks</li>
	 *     <li>sanitizedDescription</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param {string} platformIdOrRegion
	 * @return {Bluebird<MasteryDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingMasteryById(masteryId, platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/masteries/${masteryId}`, _platformId, _options));
	}

	/**
	 * Retrieve profile icons.
	 *
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param options
	 * @param {string} options.version Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ProfileIconDataDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingProfileIcons(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/profile-icons`, _platformId, _options));
	}


	/**
	 * Retrieve realm data.
	 *
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ProfileIconDataDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingRealms(platformIdOrRegion = this.config.PLATFORM_ID) {
		return this.executingRequest(`/realms`, platformIdOrRegion);
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, name, rune, and description
	 * are returned by default if this parameter isn't specified</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>image</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<RuneListDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingRunes(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/runes`, _platformId, _options));
	}

	/**
	 * Retrieves rune by ID.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param runeId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only id, name, rune, and description
	 * are returned by default if this parameter isn't specified</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values:
	 * <ul>
	 *     <li>all</li>
	 *     <li>image</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>stats</li>
	 *     <li>tags</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<RuneDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingRunesById(runeId, platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(runeId))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/runes/${runeId}`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ReforgedRunePathDto[]>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingReforgedRunesPaths(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/reforged-rune-paths`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param pathId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ReforgedRunePathDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingReforgedRunesPathById(pathId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/reforged-rune-paths/${pathId}`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ReforgedRuneDto[]>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingReforgedRunes(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/reforged-runes`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 *
	 * @param runeId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<ReforgedRunePathDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingReforgedRuneById(runeId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/reforged-runes/${runeId}`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param options
	 *
	 * @param options.dataById <p>If specified as true, the returned data map will use the spells' IDs as the keys.
	 * If not specified or specified as false, the returned data map will use the spells' keys instead.</p>
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only type, version, data, id, key, name, description, and summonerLevel
	 * are returned by default if this parameter isn't specified</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values: // TODO: 2017/06/02 check again on reference page if something changed here (tags were not populated)
	 * <ul>
	 *     <li>all</li>
	 *     <li>cooldown</li>
	 *     <li>cooldownBurn</li>
	 *     <li>cost</li>
	 *     <li>costBurn</li>
	 *     <li>costType</li>
	 *     <li>effect</li>
	 *     <li>effectBurn</li>
	 *     <li>image</li>
	 *     <li>key</li>
	 *     <li>leveltip</li>
	 *     <li>maxrank</li>
	 *     <li>modes</li>
	 *     <li>range</li>
	 *     <li>rangeBurn</li>
	 *     <li>resource</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>sanitizedTooltip</li>
	 *     <li>tooltip</li>
	 *     <li>vars</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<SummonerSpellListDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingSummonerSpells(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/summoner-spells`, _platformId, _options));
	}

	/**
	 * Retrieves rune list.
	 * RATE LIMIT NOTES
	 * Requests to this API are not counted against the application Rate Limits.
	 * Method Rate Limits still might apply!
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned is dependent on given options. See options params for details.
	 *
	 * @param summonerSpellId
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Only id, key, name, description, and summonerLevel
	 * are returned by default if this parameter isn't specified</p>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 * valid values: // TODO: 2017/06/02 check again on reference page if something changed here (tags were not populated)
	 * <ul>
	 *     <li>all</li>
	 *     <li>cooldown</li>
	 *     <li>cooldownBurn</li>
	 *     <li>cost</li>
	 *     <li>costBurn</li>
	 *     <li>costType</li>
	 *     <li>effect</li>
	 *     <li>effectBurn</li>
	 *     <li>image</li>
	 *     <li>key</li>
	 *     <li>leveltip</li>
	 *     <li>maxrank</li>
	 *     <li>modes</li>
	 *     <li>range</li>
	 *     <li>rangeBurn</li>
	 *     <li>resource</li>
	 *     <li>sanitizedDescription</li>
	 *     <li>sanitizedTooltip</li>
	 *     <li>tooltip</li>
	 *     <li>vars</li>
	 * </ul>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<SummonerSpellDto>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingSummonerSpellsById(summonerSpellId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/summoner-spells/${summonerSpellId}`, _platformId, _options));
	}

	/**
	 * Retrieve version data.
	 * Contains all valid data dragon version strings
	 * @param options
	 * @param options.version Patch version for returned data. If not specified, the latest version is used. List of valid versions can be obtained from the /versions endpoint.
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<string[]>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingTarballLinks(platformIdOrRegion = this.config.PLATFORM_ID, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => this.executingRequest(`/tarball-links`, _platformId, _options));
	}

	/**
	 * Retrieve version data.
	 * Contains all valid data dragon version strings
	 * @param [platformIdOrRegion] case-insensitive. defaults to PLATFORM_ID set at instantiation of LeagueJs or from default-config.
	 * @return {Bluebird<string>}
	 * @deprecated StaticData Endpoints are removed as of august 2nd 2018 - Please use StaticDataDdragonCompat instead
	 */
	gettingVersions(platformIdOrRegion = this.config.PLATFORM_ID) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return this.executingRequest(`/versions`, platformIdOrRegion);
	}
}

module.exports = StaticDataEndpoint;