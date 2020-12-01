import { MeasureType } from './measure-type.type';
import { UnitSystem } from './unit-system.type';

// Standardized Unit Info. The shape of the unit info object we get from the convert-units library.
export interface StdUnitInfo {
    abbr: string;
    measure: MeasureType;
    system: UnitSystem;
    singular: string;
    plural: string;
}