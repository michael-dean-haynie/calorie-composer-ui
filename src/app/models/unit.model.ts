import * as deepEqual from 'deep-equal';

export class Unit {
    id?: string;
    singular?: string;
    plural?: string;
    abbreviation?: string;

    equals(unit: Unit): boolean {
        return deepEqual(this, unit, { strict: true });
    }
}