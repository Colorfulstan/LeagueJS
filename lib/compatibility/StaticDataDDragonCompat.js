'use strict';

const Bluebird = require('bluebird');

const Cacheable = require('../Cacheable');

const util = require('../util/index');
const {ErrorUtil, ParameterUtil, RegionAndPlatformUtil} = util;

const DataDragonHelper = require('../DataDragon/DataDragonHelper');

function getMapById(dataMap) {
	return Object.keys(dataMap).reduce((result, key) => {
		if (dataMap[key] && dataMap[key].id) {
			result[dataMap[key].id] = dataMap[key];
		}
		return result;
	}, {});
}


/***
 * Endpoint to receive Data from the Data dragon service
 */
class StaticDataDDragonCompat extends Cacheable {

	// TODO: use caching or remove Cacheable

	constructor(config) {
		super(config);
		this.name = 'StaticData';
		if (config.STATIC_DATA_ROOT) {
			DataDragonHelper.storageRoot = config.STATIC_DATA_ROOT;
		}
	}

	getConfig() {
		return this.config;
	}

	get ddragonHelper() {
		return DataDragonHelper;
	}

	isDebugging() {
		return this.config.debug;
	}

	/** enables usage of DataDragonHelper (StaticDataReplacement) */
	setup(downloadPath, enableConsoleLogging) {
		if (typeof downloadPath === 'undefined' || typeof downloadPath === 'boolean') {
			throw new Error('No Download Path was provided for DataDragonHelper');
		}
		if (enableConsoleLogging) {
			this.ddragonHelper.events.on(this.ddragonHelper.eventIds.LOG_DEBUG, console.debug.bind(console));
			this.ddragonHelper.events.on(this.ddragonHelper.eventIds.LOG_INFO, console.info.bind(console));
			this.ddragonHelper.events.on(this.ddragonHelper.eventIds.LOG_ERROR, console.error.bind(console));
		}
		this.ddragonHelper.storageRoot = downloadPath;
		return DataDragonHelper;
	}

	/**
	 * Retrieves champion list.
	 *
	 * IMPLEMENTATION NOTES
	 * Data returned varies between using tags: 'all' and not using tags.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest available version is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Tags to return additional data.
	 *
	 * <p>Properties included without specifying tags:
	 *    <ul>
	 *        <li>id</li>
	 *        <li>key</li>
	 *        <li>name</li>
	 *        <li>title</li>
	 *        <li>blurb</li>
	 *        <li>info</li>
	 *        <li>image</li>
	 *        <li>tags</li>
	 *        <li>partype</li>
	 *        <li>stats</li>
	 * </ul>
	 *
	 * <p><b>To return all additional data, use the tag 'all'.</b></p>
	 *
	 * @param {boolean} options.dataById
	 * <p>If specified as true, the returned data map will use the champions' IDs as the keys.</p>
	 * <p> If not specified or specified as false, the returned data map will use the champions' keys instead.</p>
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ChampionListDTO<ChampionDTO>> | Bluebird<ChampionListDTO<ChampionFullDTO>>}
	 */
	gettingChampions(platformIdOrRegion, options = {}) {
		let dataById;
		return Bluebird.resolve(ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				dataById = _options.dataById;

				if (!_options.tags) {
					return DataDragonHelper.gettingChampionsList(_options.version, _options.locale);
				}

				// because previously, extra properties could be requested, we might need to send the championFull.json
				// to devs who need one of the properties not included in champion.json (smaller version)
				// 'all' is included in this workaround

				const tagsStandard = [
					'id',
					'key',
					'name',
					'title',
					'blurb',
					'info',
					'image',
					'tags',
					'partype',
					'stats',
				];
				const tagsIncludeNonStandardTag = _options.tags === 'all' || (Array.isArray(_options.tags) && !!_options.tags.find((tag) => {
					return !tagsStandard.includes(tag);
				}));

				if (tagsIncludeNonStandardTag) {
					return DataDragonHelper.gettingFullChampionsList(_options.version, _options.locale);
				}
			})
			.then(championsMap => {
				if (dataById) {
					championsMap.data = getMapById(championsMap.data);
				}
				return championsMap;
			});
	}


	/**
	 *
	 * Retrieves champion by ID.
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
	 * @param {string | string[]} options.tags Tags to return additional data. @see {@link gettingChampions} for more information.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ChampionDTO>}
	 */
	gettingChampionById(championId, platformIdOrRegion, options = {}) {

		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(championId, 'championId'))
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				_options.dataById = true;
				return this.gettingChampions(_platformId, _options);
			}).then(championsMap => {
				return championsMap.data[championId];
			});
	}


	/**
	 * Retrieves item list.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ItemListDTO>}
	 */
	gettingItems(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				return DataDragonHelper.gettingItemList(_options.version, _options.locale);
			});
	}

	/**
	 * Retrieves item by ID.
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
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ItemDTO>}
	 */
	gettingItemById(itemId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(itemId, 'itemId'))
			.then(() => this.gettingItems(platformIdOrRegion, options))
			.then(({data}) => {
				return data[itemId];
			});
	}


	/**
	 * Retrieve language strings data
	 * This means Language parts as in stats for example.
	 * Useful for example to generate stat-string as in
	 *    "rFlatMPRegenModPerLevel": "Mana Regen / 5 at level 18"
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<LanguageStringsListDTO>}
	 */
	gettingLanguageStrings(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				return DataDragonHelper.gettingLanguageStrings(_options.version, _options.locale);
			});
	}

	/**
	 * Retrieve supported languages data.
	 *
	 * @return {Bluebird<string[]>}
	 */
	gettingLanguages() {
		return DataDragonHelper.gettingLanguages();
	}

	/**
	 * Retrieve map data.
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 *
	 * @return {Bluebird<MapListDTO>}
	 */
	gettingMaps(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				return DataDragonHelper.gettingMaps(_options.version, _options.locale);
			});
	}


	/**
	 * Retrieves masteries list.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<MasteryListDTO>}
	 */
	gettingMasteries(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				return DataDragonHelper.gettingMasteryList(_options.version, _options.locale);
			});
	}


	/**
	 * Retrieves masteriy.
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
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.

	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param {string} platformIdOrRegion
	 * @return {Bluebird<MasteryDTO>}
	 */
	gettingMasteryById(masteryId, platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(masteryId))
			.then(() => this.gettingMasteries(platformIdOrRegion, options))
			.then(masteriesMap => {
				return masteriesMap.data[masteryId];
			});
	}


	/**
	 * Retrieve profile icons.
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ProfileIconDataDTO>}
	 */
	gettingProfileIcons(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => DataDragonHelper.gettingProfileiconList(_options.version, _options.locale));
	}


	/**
	 * Retrieve realm data.
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<RealmDTO>}
	 */
	gettingRealms(platformIdOrRegion = this.config.PLATFORM_ID) {
		return DataDragonHelper.gettingRealmInfo(RegionAndPlatformUtil.getRegionFromPlatformIdOrRegion(platformIdOrRegion));
	}


	/**
	 * Retrieves rune list.
	 *
	 * @param options
	 *
	 * @param {string} options.version  Data dragon version for returned data.
	 * <p>If not specified, the latest version for the region is used.</p>
	 * <p>List of valid versions can be obtained from the {@link StaticDataEndpoint.gettingVersions} endpoint.</p>
	 * <p>Data dragon version for a specific {@link MatchDto.gameVersion} received from MatchEndpoint
	 * can be obtained from {@link MatchUtil#getVersionForGameVersion}</p>
	 *
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<RuneListDTO>}
	 */
	gettingRunes(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => DataDragonHelper.gettingRuneList(_options.version, _options.locale));
	}


	/**
	 * Retrieves rune by ID.
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
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<RuneDTO>}
	 */
	gettingRunesById(runeId, platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(runeId))
			.then(() => this.gettingRunes(platformIdOrRegion, options))
			.then(runesMap => runesMap.data[runeId]);
	}


	/**
	 * Retrieves full reforged runes list.
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ReforgedRunePathDto[]>}
	 */
	gettingReforgedRunesPaths(platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => DataDragonHelper.gettingReforgedRunesList(_options.version, _options.locale));
	}


	/**
	 * Retrieves reforged rune
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ReforgedRunePathDto>}
	 */
	gettingReforgedRunesPathById(pathId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(pathId, 'pathId'))
			.then(() => this.gettingReforgedRunesPaths(platformIdOrRegion, options))
			.then(runePaths => runePaths.find(path => path.id === pathId));
	}

	/**
	 * Retrieves runesReforged list with only the runes.
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ReforgedRuneDetails[]>}
	 */
	gettingReforgedRunes(platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => DataDragonHelper.gettingReforgedRunesList(_options.version, _options.locale))
			.then(runePathsList => {
				// getting runes from all paths
				let runes = [];
				runePathsList.forEach(runesPath => {
					const runesInAllSlots = runesPath.slots.reduce((runesInSlot, slot) => {
						slot.runes.forEach(rune => {
							rune.runePathName = runesPath.name;
							rune.runePathId = runesPath.id;
						});
						return runesInSlot.concat(slot.runes);
					}, []);

					runes = runes.concat(runesInAllSlots);
				});
				return runes;
			});
	}

	/**
	 * Retrieves rune list.
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
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<ReforgedRuneDetails>}
	 */
	gettingReforgedRuneById(runeId, platformIdOrRegion, options = {}) {
		return Bluebird.resolve()
			.then(() => ErrorUtil.throwIfNotNumerical(runeId, 'runeId'))
			.then(() => this.gettingReforgedRunes(platformIdOrRegion, options))
			.then(runes => runes.find(rune => rune.id === runeId));
	}

	/**
	 * Retrieves Summoner Spells list.
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
	 * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<SummonerSpellListDTO>}
	 */
	gettingSummonerSpells(platformIdOrRegion, options = {}) {
		let dataById;
		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				dataById = _options.dataById;

				return DataDragonHelper.gettingSummonerSpellsList(_options.version, _options.locale);
			})
			.then(spellList => {
				if (dataById) {
					spellList.data = getMapById(spellList.data);
				}
				return spellList;
			});
	}

	/**
	 * Retrieves Summoner Spells list.
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
	 *     * @param {string | string[]} options.tags Deprecated: Removed with StaticDataDeprecation. All Properties are returned now.
	 *
	 * @param {string} options.locale
	 * <p>Locale code for returned data (e.g., en_US, es_ES).
	 * If not specified, the default locale for the region is used.</p>
	 *
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<SummonerSpellDTO>}
	 */
	gettingSummonerSpellsById(summonerSpellId, platformIdOrRegion, options = {}) {
		console.warn('LeagueJS.StaticDataEndpoint: StaticData Endpoints are removed as of august 27th 2018. ' +
			'You can use LeagueJS.DataDragonHelper instead for now. (https://github.com/Colorfulstan/LeagueJS/issues/11)');

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => {
				_options.dataById = true;
				return this.gettingSummonerSpells(_platformId, _options);
			}).then(spellMap => {
				return spellMap.data[summonerSpellId];
			});
	}

	/**
	 * Retrieve tarball link for the given patch (or latest)
	 * @param options
	 * @param options.version Patch version for returned data. If not specified, the latest version is used. List of valid versions can be obtained from the /versions endpoint.
	 * @param [platformIdOrRegion] Deprecated: usage removed with StaticData Endpoint deprecation
	 * @return {Bluebird<string[]>}
	 */
	gettingTarballLinks(platformIdOrRegion = this.config.PLATFORM_ID, options = {}) {

		return Bluebird.resolve()
			.then(() => ParameterUtil.extractPlatformIdAndOptions(platformIdOrRegion, options))
			.then(({_platformId, _options}) => DataDragonHelper.gettingTarballLink(_options.version));
	}

	/**
	 * Retrieve version data.
	 * Contains all valid data dragon version strings
	 * @return {Bluebird<string>}
	 */
	gettingVersions() {
		return DataDragonHelper.gettingVersions();
	}
}

module.exports = StaticDataDDragonCompat;