const GAME_CONSTANTS = require('../GameConstants.json');
class GameConstantsUtil {

	static get GAME_CONSTANTS(){return GAME_CONSTANTS;}

	/** @return {number[]} */
	static queueIds(){
		return Object.keys(GAME_CONSTANTS.matchMakingQueues).map(key => GAME_CONSTANTS.matchMakingQueues[key].queueType);
	}
	/** @return {number[]} */
	static rankedQueueIds(){
		return GameConstantsUtil._rankedMatchMakingQueuesKeys().map(key => GAME_CONSTANTS.matchMakingQueues[key].queueType);
	}
	/** @return {string[]} */
	static rankedQueueNames(){
		return GameConstantsUtil._rankedMatchMakingQueuesKeys().map(key => GAME_CONSTANTS.matchMakingQueues[key].name);
	}
	/** @return {string[]} */
	static _rankedMatchMakingQueuesKeys(){
		// looking just for RANKED would include keys containing UNRANKED, so we need a more explicit check
		return Object.keys(GAME_CONSTANTS.matchMakingQueues).filter(key => key.startsWith('RANKED') || key.includes('_RANKED'));
	}

	/** @return {number[]} */
	static seasonIds(){
		const validSeasons = GAME_CONSTANTS.seasons;
		return Object.keys(validSeasons).map(seasonKey => {
			return validSeasons[seasonKey];
		});
	}
	/** @return {number[]} */
	static mostRecentSeasonIds(numOfSeasons = GAME_CONSTANTS.seasons.length){
		// using last n seasons (including pre-season as a season)
		return GameConstantsUtil.seasonIds().reverse().slice(0, numOfSeasons);
	}
}
module.exports = GameConstantsUtil;