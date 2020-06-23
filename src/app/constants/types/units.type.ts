export type BaseUnitType = 'mass' | 'volume';
export const BaseUnitTypes: BaseUnitType[] = ['mass', 'volume'];

export type MetricUnit = 'gram' | 'kilogram' | 'liter';
export const MetricUnits: MassUnit[] = ['gram', 'ounce', 'pound', 'kilogram'];

export type MassUnit = 'gram' | 'ounce' | 'pound' | 'kilogram';
export const MassUnits: MassUnit[] = ['gram', 'ounce', 'pound', 'kilogram'];

export type VolumeUnit = 'teaspoon' | 'tablespoon' | 'fluid-ounce' | 'cup' | 'pint' | 'quart' | 'liter' | 'gallon';
export const VolumeUnits: VolumeUnit[] = ['teaspoon', 'tablespoon', 'fluid-ounce', 'cup', 'pint', 'quart', 'liter', 'gallon'];