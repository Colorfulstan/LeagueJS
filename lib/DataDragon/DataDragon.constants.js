const constants = {
	realmToLocaleMap: { // updated // 2018 07 13 141529
		'br': 'pt_BR',
		'eune': 'en_GB',
		'euw': 'en_GB',
		'garena': '',
		'jp': 'ja_JP',
		'kr': 'ko_KR',
		'lan': 'es_MX',
		'las': 'es_AR',
		'na': 'en_US',
		'oce': 'en_AU',
		'pbe': 'en_US',
		'ru': 'ru_RU',
		'tencent': 'zh_CN',
		'tr': 'tr_TR',
		'tw': 'zh_TW'
	},
	languages: [ // updated // 2018 07 13 141529
		'en_US', 'cs_CZ', 'de_DE', 'el_GR', 'en_AU',
		'en_GB', 'en_PH', 'en_SG', 'es_AR', 'es_ES',
		'es_MX', 'fr_FR', 'hu_HU', 'id_ID', 'it_IT',
		'ja_JP', 'ko_KR', 'ms_MY', 'pl_PL', 'pt_BR',
		'ro_RO', 'ru_RU', 'th_TH', 'tr_TR', 'vn_VN',
		'zh_CN', 'zh_MY', 'zh_TW'
	]
};

constants.localesUsedForRealms = Object.keys(constants.realmToLocaleMap).map(realmKey => constants.realmToLocaleMap[realmKey]);
module.exports = constants;