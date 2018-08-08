import {ListDTO} from './ListDTO';
import {ImageDTO} from './ImageDTO';

export interface MasteryDTO {
	id: number,
	name: string,
	description: string[],
	image: ImageDTO,
	ranks: number,
	prereq: string
}

export interface MasteryTreeItemDTO {
	/** numerical */
	masteryId: string
	/** numerical */
	prereq: string
}

export interface MasteryTreeDTO {
	Ferocity: MasteryTreeItemDTO[]
	Cunning: MasteryTreeItemDTO[]
	Resolve:MasteryTreeItemDTO[]

}

/** keys = id */
export interface MasteryListDTO extends ListDTO<MasteryDTO>{
	tree: MasteryTreeDTO
}