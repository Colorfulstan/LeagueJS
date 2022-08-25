const ParameterError = require('../errors/ParameterError');

class RegionAndPlatformUtil {

	static validatePlatformId(_platformId) {
		let isValid = false;
		if (_platformId && typeof _platformId === 'string') {
			isValid = RegionAndPlatformUtil.getPlatformIds().indexOf(_platformId.toLowerCase()) !== -1;
		}
		return isValid;
	}
	static validateRegion(_region) {
		let isValid = false;
		if (_region && typeof _region === 'string') {
			isValid = RegionAndPlatformUtil.getRegions().indexOf(_region.toLowerCase()) !== -1;
		}
		return isValid;
	}


	static getMappingRegionToPlatformId() {
		return {
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
			'ru': 'ru'
		};
	}
	static getMappingRegionToContinentRegion() {
		return {
			'br': 'americas',
			'eune': 'europe',
			'euw': 'europe',
			'jp': 'asia',
			'kr': 'asia',
			'lan': 'americas',
			'las': 'americas',
			'na': 'americas',
			'oce': 'sea',
			'tr': 'europe',
			'ru': 'europe'
		};
	}

	static getMappingPlatformIdToContinentRegion() {
		return {
			'br1': 'americas',
			'eun1': 'europe',
			'euw1': 'europe',
			'jp1': 'asia',
			'kr': 'asia',
			'la1': 'americas',
			'la2': 'americas',
			'na1': 'americas',
			'oc1': 'sea',
			'tr1': 'europe',
			'ru': 'europe'
		};
	}
	static getPlatformIds() {
		const mapping = RegionAndPlatformUtil.getMappingRegionToPlatformId();
		return Object.keys(mapping).map(region => {
			return mapping[region];
		});
	}


	static getPlatformIdForRegion(region) {
		const mapping = RegionAndPlatformUtil.getMappingRegionToPlatformId();
		if (!region || typeof region !== 'string') {
			throw new ParameterError('region is missing');
		}
		const regionLower = region.toLowerCase();
		const platformId = mapping[regionLower];

		if (!platformId) {
			throw new Error(`No platformId available for given region "${region}"`);
		} else {
			return platformId;
		}
	}
	/**
	 * @throws Error if given argument is neither a valid platformId nor a valid region
	 * @param [platformIdOrRegion] case-insensitive.
	 * @return {string} platformId in lowercase
	 */
	static getPlatformIdFromPlatformIdOrRegion(platformIdOrRegion) {
		return RegionAndPlatformUtil.validatePlatformId(platformIdOrRegion) ? platformIdOrRegion.toLowerCase() : RegionAndPlatformUtil.getPlatformIdForRegion(platformIdOrRegion);
	}
	/**
	 * @throws Error if given argument is neither a valid region nor a valid platformId
	 * @param [platformIdOrRegion] case-insensitive.
	 * @return {string} region in lowercase
	 */
	static getRegionFromPlatformIdOrRegion(platformIdOrRegion) {
		return RegionAndPlatformUtil.validateRegion(platformIdOrRegion) ? platformIdOrRegion.toLowerCase() : RegionAndPlatformUtil.getRegionForPlatformId(platformIdOrRegion);
	}
	static getRegionForPlatformId(platformId) {
		const mapping = RegionAndPlatformUtil.getMappingRegionToPlatformId();
		if (!platformId || typeof platformId !== 'string') {
			throw new ParameterError('platformId is missing');
		}
		const platformIdLower = platformId.toLowerCase();
		const region = Object.keys(mapping).find(region => {
			return mapping[region] === platformIdLower;
		});

		if (!region) {
			throw new Error(`No region available for given platformId "${platformId}"`);
		} else {
			return region;
		}
	}
	static getContinentRegionFromPlatformIdOrRegion(platformIdOrRegion){

		if (!platformIdOrRegion || typeof platformIdOrRegion !== 'string') {
			throw new ParameterError('platformIdOrRegion is missing');
		}
		const platformIdLower = platformIdOrRegion.toLowerCase();
		const platformId = this.getPlatformIdFromPlatformIdOrRegion(platformIdLower);

		const mapping = this.getMappingPlatformIdToContinentRegion();

		const continent = mapping[platformId]

		if (!continent) {
			throw new Error(`No region available for given platformIdOrRegion "${platformIdOrRegion}"`);
		} else {
			return continent;
		}
	}
	static getRegions() {
		return Object.keys(RegionAndPlatformUtil.getMappingRegionToPlatformId());
	}
}
module.exports = RegionAndPlatformUtil;
