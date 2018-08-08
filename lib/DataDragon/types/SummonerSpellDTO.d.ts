import {ImageDTO} from './ImageDTO';

export interface SummonerSpellDTO {
	id: number,
	name: string,
	description: string,
	tooltip: string,
	maxrank: number,
	cooldown: number[],
	cooldownBurn: string,
	cost: number[],
	costBurn: string,
	datavalues: any, // TODO: typing
	effect: Array<number[]>,
	effectBurn: string[],
	vars: any[], // TODO: typing
	key: string,
	summonerLevel: number,
	modes: string[],
	costType: string,
	/** numerical string */
	maxammo: string,
	range: number[],
	rangeBurn: string,
	image: ImageDTO,
	resource: string
}