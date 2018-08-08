import {ImageDTO} from './ImageDTO';

export interface MapDTO {
	MapName: string,
	/** numerical */
	MapId: string,
	image: ImageDTO
}