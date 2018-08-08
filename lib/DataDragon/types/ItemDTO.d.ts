import {ImageDTO} from './ImageDTO';
import {ListDTO} from './ListDTO';

export interface ItemGroupDTO {
	/** textual id */
	id: string
	/** numeric string */
	MaxGroupOwnable: string
}
export interface ItemCostDTO {
	base: number
	purchasable: boolean
	total: number
	sell: number
}

export interface ItemStatsDTO {
	FlatHPPoolMod?: number
	rFlatHPModPerLevel?: number
	FlatMPPoolMod?: number
	rFlatMPModPerLevel?: number
	PercentHPPoolMod?: number
	PercentMPPoolMod?: number
	FlatHPRegenMod?: number
	rFlatHPRegenModPerLevel?: number
	PercentHPRegenMod?: number
	FlatMPRegenMod?: number
	rFlatMPRegenModPerLevel?: number
	PercentMPRegenMod?: number
	FlatArmorMod?: number
	rFlatArmorModPerLevel?: number
	PercentArmorMod?: number
	rFlatArmorPenetrationMod?: number
	rFlatArmorPenetrationModPerLevel?: number
	rPercentArmorPenetrationMod?: number
	rPercentArmorPenetrationModPerLevel?: number
	FlatPhysicalDamageMod?: number
	rFlatPhysicalDamageModPerLevel?: number
	PercentPhysicalDamageMod?: number
	FlatMagicDamageMod?: number
	rFlatMagicDamageModPerLevel?: number
	PercentMagicDamageMod?: number
	FlatMovementSpeedMod?: number
	rFlatMovementSpeedModPerLevel?: number
	PercentMovementSpeedMod?: number
	rPercentMovementSpeedModPerLevel?: number
	FlatAttackSpeedMod?: number
	PercentAttackSpeedMod?: number
	rPercentAttackSpeedModPerLevel?: number
	rFlatDodgeMod?: number
	rFlatDodgeModPerLevel?: number
	PercentDodgeMod?: number
	FlatCritChanceMod?: number
	rFlatCritChanceModPerLevel?: number
	PercentCritChanceMod?: number
	FlatCritDamageMod?: number
	rFlatCritDamageModPerLevel?: number
	PercentCritDamageMod?: number
	FlatBlockMod?: number
	PercentBlockMod?: number
	FlatSpellBlockMod?: number
	rFlatSpellBlockModPerLevel?: number
	PercentSpellBlockMod?: number
	FlatEXPBonus?: number
	PercentEXPBonus?: number
	rPercentCooldownMod?: number
	rPercentCooldownModPerLevel?: number
	rFlatTimeDeadMod?: number
	rFlatTimeDeadModPerLevel?: number
	rPercentTimeDeadMod?: number
	rPercentTimeDeadModPerLevel?: number
	rFlatGoldPer10Mod?: number
	rFlatMagicPenetrationMod?: number
	rFlatMagicPenetrationModPerLevel?: number
	rPercentMagicPenetrationMod?: number
	rPercentMagicPenetrationModPerLevel?: number
	FlatEnergyRegenMod?: number
	rFlatEnergyRegenModPerLevel?: number
	FlatEnergyPoolMod?: number
	rFlatEnergyModPerLevel?: number
	PercentLifeStealMod?: number
	PercentSpellVampMod?: number
}

export interface ItemDTO {
	name: string
	description: string
	colloq: string
	plaintext: string
	into: number[]
	image: ImageDTO
	gold: ItemCostDTO
	tags: string[]
	maps: { [mapId: string]: boolean }
	stats: ItemStatsDTO,
	id: number
}

/** data key = itemId */
export interface ItemListDTO extends ListDTO<ItemDTO> {
	basic:ItemDTO
	groups: ItemGroupDTO[]
	tree: Array<{
		header: string
		tags: string[]
	}>
}