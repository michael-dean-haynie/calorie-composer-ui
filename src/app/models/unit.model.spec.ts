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

            const createUnit = (id: string, singular: string, plural: string, abbreviation: string) => {
                const unit = new Unit();
                unit.id = id;
                unit.singular = singular;
                unit.plural = plural;
                unit.abbreviation = abbreviation;
                return unit;
            };

            const scenarios: Scenario[] = [
                {
                    a: createUnit(null, null, null, null),
                    b: createUnit(null, null, null, null),
                    expected: true
                },
                {
                    a: createUnit(null, null, null, null),
                    b: createUnit('1', null, null, null),
                    expected: false
                },
                {
                    a: createUnit(undefined, null, null, null),
                    b: createUnit(null, null, null, null),
                    expected: false
                },
                {
                    a: createUnit('1', '2', '3', '4'),
                    b: createUnit('1', '2', '3', '4'),
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
});
