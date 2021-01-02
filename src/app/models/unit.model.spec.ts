import { Unit } from './unit.model';

describe('UnitModel', () => {

    beforeEach(() => { });

    it('should be created', () => {
        const unit = new Unit();
        expect(unit).toBeTruthy();
    });

    describe('equals', () => {

        it('should determine if structurally equal', () => {
            // arrange
            interface Scenario {
                a: Unit;
                b: Unit;
                expected: boolean;
            }

            const scenarios: Scenario[] = [
                {
                    a: cUnit(null, null, null, null),
                    b: cUnit(null, null, null, null),
                    expected: true
                },
                {
                    a: cUnit(null, null, null, null),
                    b: cUnit('1', null, null, null),
                    expected: false
                },
                {
                    a: cUnit(undefined, null, null, null),
                    b: cUnit(null, null, null, null),
                    expected: false
                },
                {
                    a: cUnit('1', '2', '3', '4'),
                    b: cUnit('1', '2', '3', '4'),
                    expected: true
                },
            ];

            // act
            scenarios.forEach(scen => {
                // assert
                expect(scen.a.equals(scen.b)).toBe(scen.expected);
            });
        });

    });

    describe('matches', () => {

        it('should determine if instances describe same actual real world unit', () => {
            // arrange
            interface Scenario {
                a: Unit;
                b: Unit;
                expected: boolean;
            }

            const scenarios: Scenario[] = [
                {
                    a: cUnit(null, null, null, null),
                    b: cUnit(null, null, null, null),
                    expected: true
                },
                {
                    a: cUnit(null, null, null, 'g'),
                    b: cUnit(null, null, null, 'g'),
                    expected: true
                },
                {
                    a: cUnit(null, null, null, null),
                    b: cUnit(null, null, null, 'g'),
                    expected: false
                },
                {
                    a: cUnit('1', null, null, 'g'),
                    b: cUnit('2', null, null, 'g'),
                    expected: true
                },
                {
                    a: cUnit(null, null, null, null),
                    b: null,
                    expected: false
                },
                {
                    a: cUnit(null, null, null, null),
                    b: undefined,
                    expected: false
                }
            ];

            // act
            scenarios.forEach(scen => {
                // assert
                expect(scen.a.matches(scen.b)).toBe(scen.expected);
            });
        });

    });
});

function cUnit(id: string, singular: string, plural: string, abbreviation: string) {
    const unit = new Unit();
    unit.id = id;
    unit.singular = singular;
    unit.plural = plural;
    unit.abbreviation = abbreviation;
    return unit;
};
