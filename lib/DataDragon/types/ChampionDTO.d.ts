import {ListDTO} from './ListDTO';
import {ImageDTO} from './ImageDTO';

export interface ChampionStatsDTO {
	hp: number
	hpperlevel: number
	mp: number
	mpperlevel: number
	movespeed: number
	armor: number
	armorperlevel: number
	spellblock: number
	spellblockperlevel: number
	attackrange: number
	hpregen: number
	hpregenperlevel: number
	mpregen: number
	mpregenperlevel: number
	crit: number
	critperlevel: number
	attackdamage: number
	attackdamageperlevel: number
	attackspeedoffset: number
	attackspeedperlevel: number
}

export interface ChampionSpellDTO {
	id: string
	name: string
	description: string
	tooltip: string
	leveltip: {
		label: string[]
		effect: string[]
	}
	maxrank: number
	cooldown: number[]
	cooldownBurn: string
	cost: number[]
	costBurn: string
	datavalues: any // TODO: typing
	effect: Array<number[]>
	effectBurn: string[]
	vars: Array<{ link: string, coeff: number, key: string }>
	costType: string
	/** numeric string */
	maxammo: string
	range: number[]
	/** numeric string */
	rangeBurn: string
	resource: string
}

export interface RecommendedItemBlockDTO {
	type: string
	recMath: boolean
	recSteps: boolean
	minSummonerLevel: number
	maxSummonerLevel: number
	showIfSummonerSpell: string
	hideIfSummonerSpell: string
	appendAfterSection: string
	visibleWithAllOf: string[]
	hiddenWithAnyOf: string[]
	items: Array<{
		id: string
		count: number
		hideCount: boolean
	}>
}

export interface ChampionRecommendedItemsDTO {
	champion: string
	title: string
	map: string
	mode: string
	/** riot || ? */
	type: string
	customTag: string
	sortrank: number
	extensionPage: boolean
	customPanel: any // TODO: typing
	blocks: RecommendedItemBlockDTO[]
}

export interface ChampionSkinDTO {
	id: number
	num: number
	name: string
	chromas: boolean
}

export interface ChampionInfoDTO {
	attack: number
	defense: number
	magic: number
	difficulty: number
}

export interface ChampionDTO {
	version: string
	id: number
	key: string
	name: string
	title: string
	blurb: string
	info: ChampionInfoDTO
	image: ImageDTO
	tags: string[]
	partype: string
	stats: ChampionStatsDTO
}

export interface ChampionFullDTO extends ChampionDTO {
	skins: ChampionSkinDTO[]
	lore: string
	allytips: string[]
	enemytips: string[]
	spells: ChampionSpellDTO[]
	passive: {name:string, description: string, image: ImageDTO}
	recommended: ChampionRecommendedItemsDTO[]
}

/** keys = key */
export interface ChampionListDTO<T extends ChampionDTO> extends ListDTO<T> {
	keys: { [championId: string]: string }
	format: 'full' | 'standAloneComplex'
}