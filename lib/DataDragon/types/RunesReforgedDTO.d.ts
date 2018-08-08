export interface RunesReforgedPathDTO {
	id: number
	key: string
	/** path on LCU client */
	icon: string
	name: string
	slots: ReforgedRuneSlot[]
}


interface ReforgedRunesPathDetails {
	slots: ReforgedRuneSlot[]
	icon: string
	id: number
	key: string
	name: string
}


interface ReforgedRuneSlot {
	runes: ReforgedRuneDetails[]
}

interface ReforgedRuneDTO {
	id: number
	name: string
	/** @deprecated only using until official API data is available! */
	iconPath: string
	shortDesc: string
	longDesc: string
}

interface ReforgedRuneDetails extends ReforgedRuneDTO {
	runePathName: string
	runePathId: string
}