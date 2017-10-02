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

		// \u00BF-\u1FFF - unicode letter characters (idk which exactly)
		// \u2C00-\uD7FF - unicode letter characters (idk which exactly)

		// following chars are missing in the ranges above, therefore added explicitly
		// \uFB01 - ﬁ
		// \uFB02 - ﬂ
		// \u00AA - ª
		// \u00B5 - µ
		// \u00BA - º

		// regexp matches all unicode and ASCII letters and allowed other chars (space, dot and underscore)
		let invalidMatches = name.match(/[^\d\uFB01\uFB02\u00AA\u00B5\u00BA\u00BF-\u1FFF\u2C00-\uD7FF\w _\.]+/g);
		if (invalidMatches){
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