import * as deepEqual from 'deep-equal';

export class Unit {
    id?: string;
    isDraft?: boolean;
    singular?: string;
    plural?: string;
    abbreviation?: string;
    draft?: Unit;

    /**
     * Checks structural equality
     */
    equals(unit: Unit): boolean {
        return deepEqual(this, unit, { strict: true });
    }

    /**
     * Checks that units represent the same real world actual unit.
     * For this to be true, only the abbreviations have to match.
     */
    matches(unit: Unit): boolean {
        return !!unit && (this.abbreviation === unit.abbreviation);
    }
}