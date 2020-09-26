import { MeasureType } from './measure-type.type';
import { UnitSystem } from './unit-system.type';

export interface UnitDescription {
    abbr: string;
    measure: MeasureType;
    system: UnitSystem;
    singular: string;
    plural: string;
}