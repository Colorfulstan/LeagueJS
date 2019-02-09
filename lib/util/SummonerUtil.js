const XRegExp = require('xregexp');

class SummonerUtil {
	static normalizeSummonerName(name) {
		return name.toLowerCase().replace(/ /g, '');
	}

	/**
	 * Checks the given string for invalid characters.
	 * @return null if the name is valid, otherwise an Array with all the matched characters */
	static validateSummonerNameInputCharacters(name) {
		//  https://developer.riotgames.com/getting-started.html
		// translation of the suggested regex ^[0-9\p{L} ]+$ into JS neccessary
		// because JS does not support unicode shortcuts ( \p{L} )
		// UPDATE: now using xregexp, which seems to work fine

		let invalidMatches = name.match(new XRegExp('[^0-9\\p{L} _\\.]+', 'g'))
		if (invalidMatches) {
			invalidMatches = invalidMatches
				.map(matchesString => matchesString.split(''))
				.reduce((result, singleMatchArray) => result.concat(singleMatchArray), []);
		}
		return invalidMatches;
	}

	static validateSummonerNameInputLength(name) {
		return name.length <= 16;
	}
}

module.exports = SummonerUtil;