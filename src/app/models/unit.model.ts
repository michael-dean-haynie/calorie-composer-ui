import * as deepEqual from 'deep-equal';

export class Unit {
    id?: string;
    isDraft?: boolean;
    singular?: string;
    plural?: string;
    abbreviation?: string;
    draft?: Unit;

    equals(unit: Unit): boolean {
        return deepEqual(this, unit, { strict: true });
    }
}