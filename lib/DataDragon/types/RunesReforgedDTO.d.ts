export interface RunesReforgedSlotDTO {
	runes: {
		id: number
		key: string
		icon: string
		name: string
		shortDesc: string
		longDesc: string
	}
}

export interface RunesReforgedDTO {
	id: number
	key: string
	/** path on LCU client */
	icon: string
	name: string
	slots: RunesReforgedSlotDTO[]
}