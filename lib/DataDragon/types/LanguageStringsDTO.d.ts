import {ListDTO} from './ListDTO';

/** keys =  string to be translated */
export interface LanguageStringsListDTO extends ListDTO<string>{
	tree: {
		searchKeyIgnore: string
		searchKeyRemap: Array<{
			k: string
			v: string
		}>
	}
}