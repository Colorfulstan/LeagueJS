'use strict';
const fs = require('fs');
const path = require('path');
const request = require('request');
const EventEmitter = require('events');

const Bluebird = require('bluebird');
const mkdirsSync = require('node-mkdirs');
const NodeCache = require('node-cache');

const {MatchUtil} = require('../util');

/** only the languages that are actually used by realms.
 * languages contains extra locales, which are not available on dataDragon */
const localesUsedForRealms = require('./DataDragon.constants').localesUsedForRealms;
const languages = require('./DataDragon.constants').languages;
const realmToLocaleMap = require('./DataDragon.constants').realmToLocaleMap;

/**
 * Holds downloadPromises for each locale + for the download all task
 * The respective Promises will be resolved (or rejected) once the downloading process finished.
 * If a respective Promise for a locale / version is null, no download is active.
 *
 * If "all" is being used, the same promise will be set for every locale and the respective version.
 *
 * Format: {
 * 		<locale or "all"> : {
 * 				<ddragonVersion> : Promise<void> | null
 * 			}
 * 		}
 * @type {Object.<string, Object.<string, ?Bluebird>>}
 * */
let downloadPromises;
let downloadUpdatePromise;
let storageRoot = __dirname;

const cache = new NodeCache({ // TODO: replace with settable cache? (see endpoint caches or rather use StaticDataEndpoint cache)
	stdTTL: 4 * 60 * 60, // 4h
	checkperiod: 5 * 60, // 1h
	errorOnMissing: false,
	useClones: true
});

const events = new EventEmitter();

const eventIds = {
	/** emitted whenever a file was downloaded.
	 * listener will receive
	 * a message and info about the downloaded file
	 * {locale, version, path }*/
	DOWNLOAD: 'download',
	/** Should be used for regular errors an application might be interested in.
	 * Errors that MUST be noted should use emitErrorCritical() instead */
	ERROR: 'error',
	/** Should be emitted when a breaking error occhurs */
	ERROR_CRITICAL: 'error-critical',
	/** Will be emitted for any log type, that does not have any listeners attached. */
	LOG: 'log',
	LOG_ERROR: 'log-error',
	LOG_INFO: 'log-info',
	LOG_DEBUG: 'log-debug'
};

// TODO(refactor): move events to own module
function emitDownload(locale, version, destination) {
	events.emit(eventIds.DOWNLOAD, {locale, version, path: destination});
}

function emitError(err) {
	if (events.listenerCount(eventIds.ERROR) !== 0) {
		events.emit(eventIds.ERROR, err);
	} else {
		console.error(err);
		// throw err;
	}
}

function emitErrorCritical(err) {
	if (events.listenerCount(eventIds.ERROR_CRITICAL) !== 0) {
		events.emit(eventIds.ERROR_CRITICAL, err);
	} else {
		emitError(err);
		// throw err;
	}
}

function emitLog(text, ...args) {
	events.emit(eventIds.LOG, text, ...args);
}

function emitLogError(text, ...args) {
	events.emit(eventIds.LOG_ERROR, text, ...args);
	if (events.listenerCount('log-error') === 0) {
		emitLog(text, ...args);
	}
}

function emitLogInfo(text, ...args) {
	events.emit(eventIds.LOG_INFO, text, ...args);
	if (events.listenerCount('log-info') === 0) {
		emitLog(text, ...args);
	}
}

function emitLogDebug(text, ...args) {
	events.emit(eventIds.LOG_DEBUG, text, ...args);
	if (events.listenerCount('log-debug') === 0) {
		emitLog(text, ...args);
	}
}


function reset() {
	downloadPromises = {all: {}};
	languages.forEach(locale => {
		downloadPromises[locale] = {};
	});

	downloadUpdatePromise = null;
	storageRoot = __dirname;

	cache.flushAll();

	events.removeAllListeners();
}

reset();

class DataDragonHelper {
	static get events() {
		return events;
	}

	static get eventIds() {
		return eventIds;
	}

	static get realmToLocaleMap() {
		return realmToLocaleMap;
	}

	static get languages() {
		return languages;
	}

	static get localesForRealms() {
		return localesUsedForRealms;
	}

	static get storageRoot() {
		return storageRoot;
	}

	static set storageRoot(pathSegmentsArrayOrPathString) {
		if (Array.isArray(pathSegmentsArrayOrPathString)) {
			storageRoot = path.resolve(...pathSegmentsArrayOrPathString);
		} else {
			storageRoot = path.resolve(pathSegmentsArrayOrPathString);
		}
		emitLogInfo('setting storageRoot to ' + storageRoot);
		console.log('setting storageRoot to ' + storageRoot);
		ensureDirectoryExistence(storageRoot);
	}

	static reset() {
		reset();
	}

	static buildStoragePath({version, locale}) {
		if (!version) {
			return emitError(new Error('buildStoragePath: no version provided'));
		}
		if (!locale) {
			return emitError(new Error('buildStoragePath: no locale provided'));
		}
		return path.resolve(DataDragonHelper.storageRoot, version, locale);
	}

	static get URL_DDRAGON_CDN() {
		return 'http://ddragon.leagueoflegends.com/cdn';
	}

	static get URL_CDRAGON_PERKS() {
		return 'http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json';
	}

	// TODO: download and extract TAR??
	// link: http://ddragon.leagueoflegends.com/cdn/dragontail-7.20.3.tgz

	static get URL_DDRAGON_VERSIONS() {
		return 'http://ddragon.leagueoflegends.com/api/versions.json';
	}

	static get URL_DDRAGON_REALMS() {
		return 'http://ddragon.leagueoflegends.com/api/realms.json';
	}

	static get URL_DDRAGON_LANGUAGES() {
		return 'http://ddragon.leagueoflegends.com/cdn/languages.json';
	}

	static getTarballLink(version) {
		return DataDragonHelper.URL_DDRAGON_CDN + `/dragontail-${version}.tgz`;
	}

	static getPerkImageUrl(perkId) {
		// cdragon url
		return `http://stelar7.no/cdragon/latest/perks/${perkId}.png`;
	}

	static getDDragonRealmUrl(realm) {
		return `http://ddragon.leagueoflegends.com/realms/${realm}.json`;
	}

	static getDdragonImgUrl({type, version, name}) {
		return `${DataDragonHelper.URL_DDRAGON_CDN}/${version}/img/${type}/${name}`;
	}

	static gettingVersions() {
		return requestingCached(DataDragonHelper.URL_DDRAGON_VERSIONS, 'versions');
	}

	static gettingRealms() {
		return requestingCached(DataDragonHelper.URL_DDRAGON_REALMS, 'realms');
	}

	static gettingRealmInfo(realm) {
		return requestingCached(DataDragonHelper.getDDragonRealmUrl(realm), 'realm/' + realm);
	}

	static gettingLanguages() {
		return requestingCached(DataDragonHelper.URL_DDRAGON_LANGUAGES, 'languages');
	}

	static downloadingStaticDataByVersion({version, locales} = {}) {
		locales = locales || ['en_US'];
		if (!version) {
			return emitError(new Error('downloadingStaticDataByVersion: version is invalid, received: ' + version));
		}
		return Bluebird.map(locales, (locale) => {
			const isAlreadyLoaded = fs.existsSync(path.resolve(DataDragonHelper.buildStoragePath({
				version,
				locale
			})));
			if (isAlreadyLoaded) {
				return true;
			} else {
				return downloadingStaticDataFiles(locale, version).then(() => {
					console.log('New Static Data assets were downloaded for: ' + locale + ' ' + version);

					emitDownload(locale, version, DataDragonHelper.buildStoragePath({locale, version}));
					return {version, locale};
				});
			}
		}, {concurrency: 1});
	}

	static downloadingStaticDataByLocale(locale, versions = [], minimumMajorVersion = 10) {
		const versionsToLoad = getMissingVersionsFromDownloads(versions, minimumMajorVersion, locale);
		if (versionsToLoad.length === 0) {
			return Bluebird.resolve([]);
		}

		return Bluebird.map(versionsToLoad, (version) => {
			if (downloadPromises.all[version]) {
				return downloadPromises.all[version];
			}
			if (downloadPromises[locale][version]) {
				return downloadPromises[locale][version];
			}
			return downloadingStaticDataFiles(locale, version)
				.then(() => {
					console.log('New Static Data assets were downloaded for: ' + locale + ' ' + version);

					emitDownload(locale, version, DataDragonHelper.buildStoragePath({locale, version}));

					return versionsToLoad;
				})
				.finally(() => {
					delete downloadPromises[locale][version];
				});

		}, {concurrency: 1});
	}

	/**
	 * Downloads static data for given locale and ALL versions
	 * */
	static downloadingStaticData(locale) { // TODO(refactor): rename to updating or something
		if (downloadUpdatePromise !== null) {
			return downloadUpdatePromise;
		}

		downloadUpdatePromise = DataDragonHelper.gettingVersions()
			.then(versions => {
				return DataDragonHelper.downloadingStaticDataByLocale(locale, versions);
			}).catch((err) => {
				console.warn('Error while downloading static-data', err);

				emitErrorCritical(err);

			}).finally(() => {
				downloadUpdatePromise = null;
			});

		return downloadUpdatePromise;
	}

	static gettingLatestVersionFromDownloads(locale) {
		// TODO(fix): latest from Downloads might not be downloaded for locale yet, or new version might be available
		// currently it's safest to regularly check for new versions and download the needed locales independently

		return DataDragonHelper.gettingVersionsFromDownloads().then(versions => {
			return versions.sort(MatchUtil.sortVersionsDescending);
		}).then(versionsDescending => {
			if (versionsDescending.length === 0) {
				emitError(new Error('no downloaded versions available'));
				throw new Error('no downloaded versions available');
			}
			if (!locale) {
				return versionsDescending[0];
			} else {
				return findingDownloadedVersionOfLocale(DataDragonHelper.storageRoot, versionsDescending, 0, locale);
			}
		}).then((ddV) => {
			emitLogDebug(`Latest ddv in downloads${locale ? ' for ' + locale : ''}:`, ddV);
			return ddV;
		});
	}

	static gettingVersionsFromDownloads() { // TODO(feat): add locale support
		return new Bluebird((resolve, reject) => {
			fs.readdir(DataDragonHelper.storageRoot, (err, files) => {
				if (err) {
					return reject(err);
				}

				resolve(files.filter(filename => {
					return !filename.includes('.js');
				}));
			});
		});
	}

	/**
	 * @see https://developer.riotgames.com/api-methods/#lol-static-data-v3/GET_getItemList
	 * @param ddV
	 * @param locale
	 * @return {ItemListDTO}
	 */
	static gettingItemList(ddV, locale) {
		return /** @type ItemListDTO */ gettingLocalList(ddV, 'item', locale);
	}

	/**
	 * @see https://developer.riotgames.com/api-methods/#lol-static-data-v3/GET_getItemList
	 * @param ddV
	 * @param locale
	 * @return {RunesReforgedPathDTO[]}
	 */
	static gettingReforgedRunesList(ddV, locale) { // TODO(refactor): rename to perks!?
		// make sure 8.1 is used for patches that have perks enabled, but no ddragon data available
		if (ddV) {
			if (ddV.indexOf('7.23') >= 0) {
				ddV = '8.1.1';
			}
		}

		return gettingLocalList(ddV, 'runesReforged', locale).catch((err) => {
			emitLogError('Error in RiotAppiHelper.gettingRunesList()', {locale, ddV, err});
			return emitError(err);
		});
	}

	/**
	 * Gets the 'championFull' file.
	 * @param ddV
	 * @param locale
	 * @return {ChampionListDTO<ChampionFullDTO>}
	 */
	static gettingFullChampionsList(ddV, locale) {
		return /** @type ChampionListDTO<ChampionFullDTO>*/ gettingLocalList(ddV, 'championFull', locale);
	}

	/**
	 * Gets all champions (summary file).
	 * Use gettingFullChampionsList for the complete data.
	 * Champion data contains:
	 * - version
	 * - id
	 * - key
	 * - name
	 * - title
	 * - blurb
	 * - info
	 * - image
	 * - tags
	 * - partype
	 * - stats
	 *
	 * For additional data use {@see #gettingFullChampionsList()}
	 * @param ddV
	 * @param locale
	 * @return {ChampionListDTO<ChampionDTO>}
	 */
	static gettingChampionsList(ddV, locale) { // TODO: remove platform and options?!)
		emitLogDebug('gettingChampionsList() for region %s', ddV, locale);
		return /** @type ChampionListDTO<ChampionDTO> */ Promise.all([
			// TODO: implement more eficient method to add the keys to champion.json
			// just write them while downloading, or store them separately?

			gettingLocalList(ddV, 'champion', locale),
			gettingLocalList(ddV, 'championFull', locale)
		]).then(([championsList, championsFullList]) => {
			championsList.keys = championsFullList.keys;
			return championsList;
		}).catch((err) => {
			emitLogError('Error in gettingChampionsList()', {ddV, locale, err});
			return emitError(err);
		});
	}

	/**
	 * @param ddV
	 * @param locale
	 * @returns {SummonerSpellListDTO}
	 */
	static gettingSummonerSpellsList(ddV, locale) { // TODO: remove platform and options?!
		emitLogDebug('getAllSummonerSpells() for region %s', locale, ddV);

		return gettingLocalList(ddV, 'summoner', locale).catch((err) => {
			emitLogError('Error in getAllSummonerSpells()', {locale, ddV, err});
			return emitError(err);
		});
	}

	/**
	 *
	 * @param ddV
	 * @param locale
	 * @returns {MasteryListDTO}
	 */
	static gettingMasteryList(ddV, locale) {
		if (!ddV || ddV.indexOf('7.24.') >= 0) {
			ddV = '7.23.1'; // latest version with runes/masteries
		}
		return /** @type MasteryListDTO */ gettingLocalList(ddV, 'mastery', locale);
	}

	/**
	 *
	 * @param ddV
	 * @param locale
	 * @returns {RuneListDTO}
	 */
	static gettingRuneList(ddV, locale) {
		if (!ddV || ddV.indexOf('7.24.') >= 0) {
			ddV = '7.23.1'; // latest version with runes/masteries
		}
		return /** @type RuneListDTO */ gettingLocalList(ddV, 'rune', locale);
	}

	/**
	 *
	 * @param ddV
	 * @param locale
	 * @returns {ListDTO<ProfileIconDataDTO>} keys = id
	 */
	static gettingProfileiconList(ddV, locale) {
		return /** @type ListDTO<ProfileIconDataDTO> */ gettingLocalList(ddV, 'profileicon', locale);
	}

	/**
	 *
	 * @param ddV
	 * @param locale
	 * @returns {LanguageStringsListDTO}
	 */
	static gettingLanguageStrings(ddV, locale) {
		return /** @type LanguageStringsListDTO */ gettingLocalList(ddV, 'language', locale);
	}

	/**
	 * This endpoint is only supported for patch version 5.5.3 and later.
	 * Also, map data was not generated for patch versions 5.15.1, 5.16.1, and 5.17.1.
	 * @returns {MapListDTO}
	 * */
	static gettingMaps(ddV, locale) {
		let versionPromise;

		if (ddV) {
			versionPromise = Bluebird.resolve(ddV);
		} else {
			versionPromise = DataDragonHelper.gettingLatestVersion();
		}

		return versionPromise.then(version => {
			const [major, minor, patch] = version.match(/\d+/g).map(s => parseInt(s));
			if (major < 5 || (major === 5 && (minor < 5 || (minor === 5 && patch < 3)))) {
				return emitError(new Error('gettingMaps can not be used with versions earlier than 5.5.3'));
			}
			if (major === 5 && (minor === 15 || minor === 16 || minor === 17)) {
				return emitError(new Error('gettingMaps can not be used for versions 5.15.1, 5.16.1 and 5.17.1'));
			}
			return /** @type MapListDTO */ gettingLocalList(version, 'map', locale);
		});
	}

	static gettingLatestVersion() {
		return DataDragonHelper.gettingVersions().then(versions => versions.sort(MatchUtil.sortVersionsDescending)[0]);
	}

	static gettingTarballLink(version) {
		let versionPromise;
		if (!version) {
			versionPromise = DataDragonHelper.gettingLatestVersion();
		} else {
			versionPromise = Promise.resolve(version);
		}
		return versionPromise.then(ddV => {
			return DataDragonHelper.getTarballLink(ddV);
		});
	}
}

/**
 *    Returns the list-object.
 *Generally, just the "data" object is returned (omitting 'version' and 'type').
 * In case of 'mastery' however, the return value will consist of {data, tree}. // TODO: normalize to send the whole object as is? + fixing the runesReforged ones?
 * @param version
 * @param type {string} "champion" | "item" | "mastery" | "profileicon" | "rune" | "summoner" | "language"
 * @param locale language to get the data for
 */
function gettingLocalList(version, type, locale = 'en_US', skipLatestVersionFallback = false) {
	if (!type) {
		return emitError(new Error('gettingLocalList: type is invalid. Expecting string, received: ' + type));
	}
	let versionPromise;

	if (version) {
		versionPromise = Bluebird.resolve(version);
	} else {
		versionPromise = DataDragonHelper.gettingLatestVersion();
	}

	return versionPromise
		.then((ddV) => {
			// trying to download files if neccessary
			return DataDragonHelper
				.downloadingStaticDataByVersion({version: ddV, locales: [locale]})
				.then(() => ddV);
		})
		.then((ddV) => {
			return new Promise((resolve, reject) => {
				const filePath = path.join(DataDragonHelper.buildStoragePath({
					version: ddV,
					locale
				}), '/', type + '.json');

				fs.readFile(filePath, 'utf8', (err, fileContent) => {
					if (!err) {
						resolve(JSON.parse(fileContent));
					} else {
						reject(err);
					}
				});
			});
		})
		.catch(err => {
			if (skipLatestVersionFallback) {
				// file not found expected, anything else needs to be reported
				return emitError(err);
			}

			// try once more with the version before and if that
			// also fails, give up (propably won't work
			// with additional tries.
			return DataDragonHelper.gettingVersions().then((versions) => {
				// Every version, that is not in versions-array,
				// will default to the latest one
				// contained (i.e. index 0)
				const indexFallbackVersion = versions.indexOf(version) + 1;

				if (skipLatestVersionFallback) {
					throw new Error('Could not receive data for ' + locale + ' ' + type + 'version: ' + version + ' fallback: ' + versions[indexFallbackVersion]);
				} else {
					return gettingLocalList(versions[indexFallbackVersion], type, locale, true);
				}
			});
		});
}

function ensureDirectoryExistence(filePath) {
	const dirname = !!path.extname(filePath) ? path.dirname(filePath) : filePath;
	if (fs.existsSync(dirname)) {
		return true;
	}
	mkdirsSync(dirname);
}

function requestingCached(url, cacheKey) {
	return new Bluebird((resolve, reject) => {
		const cachedValue = cache.get(cacheKey);
		if (cachedValue) {
			resolve(cachedValue);
		} else {
			request.get(url, (err, httpResponse, body) => {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					cache.set(cacheKey, JSON.parse(body));
					resolve(JSON.parse(body));
				}
			});
		}
	});
}

function writeJsonAndResolve(json, dest, resolve) {
	const content = JSON.stringify(json);

	ensureDirectoryExistence(dest);
	fs.writeFile(dest, content, 'utf8', () => {
		resolve();
	});
	return content;
}

function fixPropertiesKeyAndId(json) {
	Object.keys(json.data).forEach(dataKey => {
		const obj = json.data[dataKey];

		if (typeof obj !== 'object') {
			return;
		}

		if (obj.key && parseInt(obj.key) >= 0) {
			// if the key is numerical, this means key and id needs to be switched.
			// safety measure in case they fix this at any point
			const id = parseInt(obj.key);
			const key = obj.id;
			json.data[dataKey].id = id;
			json.data[dataKey].key = key;
		}
		if (!obj.id && parseInt(dataKey) >= 0) {
			// data items ids are used as key on the object and they might not have an id property
			json.data[dataKey].id = parseInt(dataKey);
		} else {
			json.data[dataKey].id = parseInt(json.data[dataKey].id);
		}
	});
}

function getMissingVersionsFromDownloads(versions, minimumMajorVersion, locale) {
	return versions.filter(version => {
		return parseInt(version) >= minimumMajorVersion;
	}).filter(version => {
		// version not already downloaded
		return !fs.existsSync(path.resolve(DataDragonHelper.buildStoragePath({version, locale})));
	});
}

function downloadingStaticDataFiles(locale, version) {
	if (!locale || !version) {
		emitError(new Error('locale or version is invalid, received locale: ' + locale + ' version: ' + version));
		return Promise.reject(new Error('locale or version is invalid, received locale: ' + locale + ' version: ' + version));
	}

	// NOTE: locale not relevant for
	// profileicon
	//

	if (downloadPromises[locale][version]) {
		return downloadPromises[locale][version];
	}

	const baseUrl = `${DataDragonHelper.URL_DDRAGON_CDN}/${version}/data/${locale}`;

	const profileIconUri = `${baseUrl}/profileicon.json`;
	const championUri = `${baseUrl}/champion.json`;
	const championFullUri = `${baseUrl}/championFull.json`;
	const itemUri = `${baseUrl}/item.json`;
	const summonerUri = `${baseUrl}/summoner.json`;
	const languageUri = `${baseUrl}/language.json`;
	const mapUri = `${baseUrl}/map.json`;

	/** removed with 7.24     */
	const runesUri = `${baseUrl}/rune.json`;
	const masteriesUri = `${baseUrl}/mastery.json`;

	/** added with 7.24 */
	const runesReforgedUri = `${baseUrl}/runesReforged.json`;

	const uriArray = [
		profileIconUri,
		championUri,
		championFullUri,
		itemUri,
		summonerUri,
		languageUri,
		mapUri
	];

	const urisExcludedFromIdKeySwitch = [
		languageUri,
		runesReforgedUri
	];

	const [major, minor, patch] = version.match(/\d+/g).map(s => parseInt(s));
	// account for removal of runes and masteries with 7.24
	// 7.24 was the last version within 7.x.y
	// and the first with runes/masteries removed
	if (major >= 8 || (major === 7 && minor === 24)) {
		uriArray.push(runesReforgedUri);
	} else {
		uriArray.push(runesUri, masteriesUri);
	}

	const downloadPromisesTemp = uriArray.map(uri => {
		return new Bluebird((resolve, reject) => {
			const filename = uri.substr(uri.lastIndexOf('/') + 1);
			const dest = path.resolve(DataDragonHelper.buildStoragePath({
				version,
				locale
			}) + '/' + filename);
			console.log('requestPath: ' + uri);
			console.log('downloadPath: ' + dest);
			request(uri, (err, httpResponse, body) => {
				if (err) {
					reject(err);
					return;
				}

				let json;
				try {
					json = JSON.parse(body);
				} catch (e) {
					console.error(e, locale, version, uri, dest);
					return reject(new Error('Error while parsing response for locale: ' + locale + ' version: ' + version + 'URI: ' + uri));
				}

				if (!urisExcludedFromIdKeySwitch.includes(uri)) {
					fixPropertiesKeyAndId(json);
					return writeJsonAndResolve(json, dest, resolve);
				} else {
					// In Ddragon files before 8.9.1 perks desc and longDesc contains Client placeholders for values,
					// which we can replace from the cdragon files
					// for later versions, we don't need to do that
					// TODO: should we simply use cdragon files anyways?
					if (major !== 8 || minor >= 8) { // 8.<9.y
						return writeJsonAndResolve(json, dest, resolve);
					}

					request(DataDragonHelper.URL_CDRAGON_PERKS, (errRunesCdragon, httpResponseRunesCdragon, bodyRunesCdragon) => {
						if (errRunesCdragon) {
							reject(errRunesCdragon);
							return;
						}

						try {
							let jsonCdragon = JSON.parse(bodyRunesCdragon);

							json.forEach(item => {
								item.slots.forEach(slot => {
									slot.runes.forEach(rune => {
										const runeCDragon = jsonCdragon.find(item => {
											return item.id === rune.id;
										});
										if (!runeCDragon) {
											const message = 'CDragon is missing rune: ' + rune.id + '\r\n' + 'Not updating description within ddragon version: ' + version;
											emitLogError(message);
										} else {
											rune.shortDesc = runeCDragon.shortDesc;
											rune.longDesc = runeCDragon.longDesc;
										}
									});
								});
							});
						} catch (e) {
							e.msg = 'Error during Rune-description processing - ' + e.msg;
							emitLogError(e);
						}

						return writeJsonAndResolve(json, dest, resolve);
					});
				}
			});
		});
	});

	downloadPromises[locale][version] = Bluebird.all(downloadPromisesTemp).finally(() => {
		delete downloadPromises[locale][version];
	});
	return downloadPromises[locale][version];
}

function findingDownloadedVersionOfLocale(rootPath, versionsDescending, i, locale) {
	return new Bluebird((resolve, reject) => {
		fs.readdir(path.join(rootPath, '/', versionsDescending[i]), (err, files) => {
			if (!err && files && files.includes(locale)) {
				return resolve(versionsDescending[i]);
			}

			i++;
			if (i === versionsDescending.length) {
				return reject(new Error('No downloaded version available for given locale: ' + locale));
			}
			return resolve(findingDownloadedVersionOfLocale(rootPath, versionsDescending, i, locale));
		});
	});
}

module.exports = DataDragonHelper;