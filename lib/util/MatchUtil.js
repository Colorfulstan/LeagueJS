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
			console.log('Version could not be matched, using latest version ' + versions[0]);
			ddVersion = versions[0];
		}
		console.log(`MatchUtil.getVersionForGameVersion() version is resolved: ${ddVersion} gameVersion: ${gameVersion} majorMinor: ${gameVersionMajorMinor}`);
		return ddVersion;
	}

	/**
	 *
	 * @param {string} gameVersion Versioning string from MatchDto.gameVersion
	 * @return {string} The major.minor versioning string
	 */
	static getPatchFromGameVersion(gameVersion) {
		const numDots = (gameVersion.match(/\./g) || []).length;

		if (numDots === 1){
			// already major.minor
			return gameVersion;
		} else {
			let indexFirstDot = gameVersion.indexOf('.');
			let indexSecondDot = gameVersion.substr(indexFirstDot + 1).indexOf('.') + indexFirstDot + 1;
			return gameVersion.substr(0, indexSecondDot);
		}
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
	static getParticipantIdentityByAccountAndPlatformId({ matchDto, accountId, platformId}){
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
	static getParticipantsByChampion (matchDto, championId) {
		const participants = matchDto.participants;
		return participants.filter(participant => {
			return participant.championId === championId;
		});
	}

}
module.exports = MatchUtil;