import {ImageDTO} from './ImageDTO';
import {ListDTO} from './ListDTO';

export interface MapDTO {
	MapName: string,
	/** numerical */
	MapId: string,
	image: ImageDTO
}

export interface MapListDTO extends ListDTO<MapDTO> {

}