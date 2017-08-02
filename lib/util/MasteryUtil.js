class MasteryUtil {

	/**
	 *
	 * @param masteryTrees tree property received from MasteryListDto
	 * @param masteryData data property received from MasteryListDto
	 * @return {{string: MasteryDto[]}} object with master tree names as key and Keystone MasteryDtos as values
	 */
	static getKeystonesByTree(masteryTrees, masteryData) {
		let keystonesByTree = {};
		const treeKeys = Object.keys(masteryTrees);

		treeKeys.map(key => {
			keystonesByTree[key] = masteryTrees[key][masteryTrees[key].length - 1].masteryTreeItems;
		});
		if (masteryData) {
			treeKeys.map(key => {
				keystonesByTree[key] = keystonesByTree[key].map(masteryTreeItem => masteryData[masteryTreeItem.masteryId]);
			});
		}
		return keystonesByTree;
	}
}

module.exports = MasteryUtil;