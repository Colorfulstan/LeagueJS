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
}
module.exports = MatchUtil;