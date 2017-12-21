const ErrorUtil = require('./ErrorUtil');

class MatchUtil {
	/**
	 *
	 * @param {string} gameVersion Versioning string from MatchDto.gameVersion
	 * @param {string[]} versions Array with valid ddragon version {@link StaticDataEndpoint.gettingVersions}
	 * @return {string} The data dragon version correlating to the gameVersion
	 */
	static getVersionForGameVersion(gameVersion, versions) {
		let gameVersionMajorMinor = MatchUtil.getPatchFromGameVersion(gameVersion);

		let ddVersion = versions.find(version => {
			return version.indexOf(gameVersionMajorMinor + '.') === 0;
		});

		if (!ddVersion) {
			const sortedVersions = versions.slice().sort(MatchUtil.sortVersionsDescending);

			ddVersion = sortedVersions[0];
			// TODO: add global debug mode
			// console.log('MatchUtil#getVersionForGameVersion: Version could not be matched, using latest version ' + ddVersion);

		}
		// TODO: add global debug mode
		// console.log(`MatchUtil#getVersionForGameVersion: version is resolved: ${ddVersion} gameVersion: ${gameVersion} majorMinor: ${gameVersionMajorMinor}`);
		return ddVersion;
	}

	/**
	 *
	 * @param {string} gameVersion Versioning string from MatchDto.gameVersion
	 * @return {string} The major.minor versioning string
	 */
	static getPatchFromGameVersion(gameVersion) {
		const numbers = gameVersion.match(/\d+/g).map(s => parseInt(s));
		return `${numbers[0]}.${numbers[1]}`;
	}

	/**
	 * @param {Object} param
	 * @param {MatchDto} param.matchDto
	 * @param {number} param.accountId
	 * @param [param.useCurrentOnly = true] if false, currentAccountId and accountId will be used for comparisson.
	 * Useful if the player is likely to have transfered between regions recently.
	 * @return {ParticipantIdentityDto | undefined} undefined if participant could not be found
	 */
	static getParticipantIdentityByAccountId({matchDto, accountId, useCurrentOnly = true}) {
		// since accountId is only unique per region, we default to the safe comparisson of currentAccountId

		const participants = matchDto.participantIdentities.map(identity => identity.player);
		return participants.find(participant => {
			const isEqualOnCurrentInfo = participant.currentAccountId === accountId;
			return isEqualOnCurrentInfo || useCurrentOnly ? isEqualOnCurrentInfo : participant.accountId === accountId;
		});
	}

	/**
	 * @param {Object} param
	 * @param param.accountId
	 * @param param.platformId
	 * @param param.matchDto
	 * @return {ParticipantIdentityDto | undefined} undefined if participant could not be found
	 */
	static getParticipantIdentityByAccountAndPlatformId({matchDto, accountId, platformId}) {
		ErrorUtil.throwIfNotObject(matchDto, 'matchDto');
		ErrorUtil.throwIfNotNumerical(accountId, 'accountId');
		ErrorUtil.throwIfNotString(platformId, 'platformId');
		const participantIdentityDto = matchDto.participantIdentities.find(({player}) => {
			const isEqualOnCurrentInfo =
				player.currentAccountId === accountId && player.currentPlatformId === platformId.toUpperCase();
			// since accountId is unique per region, we can always compare current and old information safely
			return isEqualOnCurrentInfo ? isEqualOnCurrentInfo : player.accountId === accountId;
		});
		return participantIdentityDto;
	}

	/**
	 * @param {MatchDto} matchDto
	 * @param {number} championId
	 * @returns {ParticipantDto[] || CurrentGameParticipant[] }
	 * Array with ParticipantDto if the given match is from match endpoint,
	 * CurrentGameParticipant if it's from spectator endpoint.
	 * For ranked matches the array will contain only a single element,
	 * for non-ranked matches there can be more then one Players with the given champion.
	 */
	static getParticipantsByChampion(matchDto, championId) {
		const participants = matchDto.participants;
		return participants.filter(participant => {
			return participant.championId === championId;
		});
	}

	/**
	 * Sorting function to sort version strings by using major.minor.patch.
	 * Version numbers with more divisions can be passed, but only the first three will be used.
	 *
	 * Only versioning up to patch level is accounted for, all remaining versioning
	 * divisions are ignored for the comparisson
	 *
	 * @param a string in format [major].[minor].[patch][....]
	 * @param b string in format [major].[minor].[patch][....]
	 * @return {number}
	 * result is < 0 if the first given version is BIGGER,
	 * > 0 if first version is LOWER,
	 * 0 if they are equal (up to patch level)
	 */
	static sortVersionsDescending(a, b) {
		let [major1, minor1, patch1] = a.match(/\d+/g).map(s => parseInt(s));
		let [major2, minor2, patch2] = b.match(/\d+/g).map(s => parseInt(s));

		patch1 = patch1 || 0;
		patch2 = patch2 || 0;
		minor1 = minor1 || 0;
		minor2 = minor2 || 0;
		major1 = major1 || 0;
		major2 = major2 || 0;

		// sorting by version number
		if (major1 !== major2) {
			return major2 - major1;
		} else if (minor1 !== minor2) {
			return minor2 - minor1;
		} else {
			return patch2 - patch1;
		}
	}

}

module.exports = MatchUtil;