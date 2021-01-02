import { TestBed } from '@angular/core/testing';
import { ProductReducer } from '../constants/functions';
import { ContradictionSet } from '../constants/types/contradiction-set.type';
import { PathLink } from '../constants/types/path-link.type';
import { PathResults } from '../constants/types/path-results.type';
import { Path } from '../constants/types/path.type';
import { RefUnit } from '../constants/types/reference-unit.type';
import { ConversionRatio } from '../models/conversion-ratio.model';
import { Unit } from '../models/unit.model';
import { NewConversionRatioService } from './new-conversion-ratio.service';
import { StandardizedUnitService } from './util/standardized-unit.service';




describe('NewConversionRatioService', () => {
  let service: NewConversionRatioService;
  let standardizedUnitService: StandardizedUnitService

  interface TestCase {
    cr: ConversionRatio[]; // conversion ratios
    ap: Path[]; // all paths
    ac: ContradictionSet[]; // all contradictions
    cp: Path; // current path
    expP: Path[]; // expected paths
    skipAssertingPaths?: boolean;
    expC: ContradictionSet[]; // expected contradictions
    msg?: string;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NewConversionRatioService,
        StandardizedUnitService
      ]
    });
    service = TestBed.inject(NewConversionRatioService);
    standardizedUnitService = TestBed.inject(StandardizedUnitService) as StandardizedUnitService;
    standardizedUnitService.standardizedFoodAmountUnits = [
      standardizedUnitService.stdUnitInfoFor('mg'),
      standardizedUnitService.stdUnitInfoFor('g'),
      standardizedUnitService.stdUnitInfoFor('ml'),
      standardizedUnitService.stdUnitInfoFor('l'),
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('conversionRatioIncludesUnit()', () => {
    it('should return false if cvRat or unit is falsy', () => {
      expect(service.conversionRatioIncludesUnit(new ConversionRatio(), null)).toBeFalse();
      expect(service.conversionRatioIncludesUnit(null, new Unit())).toBeFalse();
      expect(service.conversionRatioIncludesUnit(new ConversionRatio(), undefined)).toBeFalse();
      expect(service.conversionRatioIncludesUnit(undefined, new Unit())).toBeFalse();
    });

    it('should return false if neither cvRat unit matches the other unit', () => {
      expect(service.conversionRatioIncludesUnit(cCvRat(new Unit(), 0, new Unit(), 0), cUnit('g'))).toBeFalse();
    });

    it('should return true if either cvRat unit matches the other unit', () => {
      expect(service.conversionRatioIncludesUnit(cCvRat(cUnit('g'), 0, new Unit(), 0), cUnit('g'))).toBeTrue();
      expect(service.conversionRatioIncludesUnit(cCvRat(new Unit(), 0, cUnit('g'), 0), cUnit('g'))).toBeTrue();
    });
  });

  describe('isFilledOut()', () => {
    it('should return false if conversionRatio is falsy', () => {
      expect(service.isFilledOut(null)).toBe(false);
      expect(service.isFilledOut(undefined)).toBe(false);
    });

    it('should return false if either of the units are falsy', () => {
      // null
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, null, 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(null, 1, cUnit('g'), 1))).toBe(false);
      // undefined
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, undefined, 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(undefined, 1, cUnit('g'), 1))).toBe(false);
    });

    it('should return false if either unit has a falsy value for it\'s abbreviation', () => {
      // null
      expect(service.isFilledOut(cCvRat(cUnit(null), 1, cUnit('g'), 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit(null), 1))).toBe(false);
      // undefined
      expect(service.isFilledOut(cCvRat(cUnit(undefined), 1, cUnit('g'), 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit(undefined), 1))).toBe(false);
      // empty string
      expect(service.isFilledOut(cCvRat(cUnit(''), 1, cUnit('g'), 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit(''), 1))).toBe(false);
    });

    it('should return false if units either amount is null or undefined', () => {
      // null
      expect(service.isFilledOut(cCvRat(cUnit('g'), null, cUnit('g'), 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit('g'), null))).toBe(false);
      // undefined
      expect(service.isFilledOut(cCvRat(cUnit('g'), undefined, cUnit('g'), 1))).toBe(false);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit('g'), undefined))).toBe(false);
    });

    it('should return true if units and amounts are filled out', () => {
      expect(service.isFilledOut(cCvRat(cUnit('g'), 1, cUnit('g'), 1))).toBe(true);
      expect(service.isFilledOut(cCvRat(cUnit('g'), 0, cUnit('g'), 0))).toBe(true);
    });
  });

  describe('sideUsesFreeFormValue()', () => {
    it('should return true if side uses free form value', () => {
      expect(service.sideUsesFreeFormValue(cFFV('1 GRAM', null), 'a')).toBe(true);
      expect(service.sideUsesFreeFormValue(cFFV(null, '1 GRAM'), 'b')).toBe(true);
    });

    it('should return false if cvRat is null or undefined', () => {
      expect(service.sideUsesFreeFormValue(null, 'a')).toBe(false);
      expect(service.sideUsesFreeFormValue(undefined, 'b')).toBe(false);
    });

    it('should return false if free form value is not meaningful', () => {
      expect(service.sideUsesFreeFormValue(cFFV(null, '1 GRAM'), 'a')).toBe(false);
      expect(service.sideUsesFreeFormValue(cFFV(undefined, '1 GRAM'), 'a')).toBe(false);
      expect(service.sideUsesFreeFormValue(cFFV('', '1 GRAM'), 'a')).toBe(false);

      expect(service.sideUsesFreeFormValue(cFFV('1 GRAM', null), 'b')).toBe(false);
      expect(service.sideUsesFreeFormValue(cFFV('1 GRAM', undefined), 'b')).toBe(false);
      expect(service.sideUsesFreeFormValue(cFFV('1 GRAM', ''), 'b')).toBe(false);
    });
  });

  describe('usesFreeFormValue()', () => {
    it('should return true if either side uses free form value', () => {
      expect(service.usesFreeFormValue(cFFV('1 GRAM', null))).toBe(true);
      expect(service.usesFreeFormValue(cFFV(null, '1 GRAM'))).toBe(true);
    });

    it('should return false if neither side uses free form value', () => {
      expect(service.usesFreeFormValue(cFFV(null, undefined))).toBe(false);
    });

    it('should return false if cvRat is null or undefined', () => {
      expect(service.usesFreeFormValue(null)).toBe(false);
      expect(service.usesFreeFormValue(undefined)).toBe(false);
    });
  });

  describe('condensedPath()', () => {
    it('should return condensed path', () => {
      const path = [cpl(cUnit('a'), 1, cUnit('b'), 1), cpl(cUnit('b'), 1, cUnit('c'), 2)];
      const expected = '1 a = 2 c (conversion path: a -> b -> c)';
      expect(service.condencedPath(path)).toBe(expected);
    });
  });

  describe('getAllUnits()', () => {
    it('should return a list of all units that are the starting source of a path', () => {
      const cvRats = [
        cCvRat(cUnit('a'), 1, cUnit('b'), 1),
        cCvRat(cUnit('c'), 1, cUnit('b'), 1)
      ];
      const result = service.getAllUnits(cvRats);
      expect(result.length).toBe(3, 'result length should match expected length');
      ['a', 'b', 'c'].forEach((abbr) => {
        expect(result.filter(unit => unit.abbreviation === abbr).length).toBe(1, `the unit "${abbr}" should appear exactly once in result`);
      });
    });
  });

  describe('getAllPathsForUnit()', () => {
    it('should return the list of paths that start with the specified source', () => {
      const cvRats = [
        cCvRat(cUnit('a'), 1, cUnit('b'), 1),
        cCvRat(cUnit('a'), 1, cUnit('c'), 1),
        cCvRat(cUnit('d'), 1, cUnit('e'), 1)
      ];
      const result: Path[] = service.getPathsForUnit(cvRats, cUnit('a'));
      expect(result.length).toBe(2, 'number or returned paths should path expected number');
      expect(result.some(path => path[0].source.abbreviation !== 'a')).toBe(false, 'all paths should start with specified unit');
    });
  });

  describe('getPathProduct()', () => {
    it('should return the path product', () => {
      expect(service.getPathProduct([
        cpl(cUnit('a'), 1, cUnit('b'), 4),
        cpl(cUnit('b'), 1, cUnit('c'), 1),
        cpl(cUnit('c'), 1, cUnit('d'), .5)
      ])).toBe(2, 'path product of 1 * 4 * .5 should be 2');
    });
    it('should return undefined when path is falsy', () => {
      expect(service.getPathProduct(null)).toBe(undefined);
      expect(service.getPathProduct(undefined)).toBe(undefined);
    });
  });

  describe('getAllPathsRecursive()', () => {

    describe('should handle exceptional input value correctly', () => {
      const NULL_____ = null;
      const testCases: TestCase[] = [
        { cr: NULL_____, ap: NULL_____, ac: NULL_____, cp: NULL_____, expP: [], expC: [] },
        { cr: NULL_____, ap: NULL_____, ac: NULL_____, cp: undefined, expP: [], expC: [] },
        { cr: NULL_____, ap: NULL_____, ac: undefined, cp: NULL_____, expP: [], expC: [] },
        { cr: NULL_____, ap: NULL_____, ac: undefined, cp: undefined, expP: [], expC: [] },
        { cr: NULL_____, ap: undefined, ac: NULL_____, cp: NULL_____, expP: [], expC: [] },
        { cr: NULL_____, ap: undefined, ac: NULL_____, cp: undefined, expP: [], expC: [] },
        { cr: NULL_____, ap: undefined, ac: undefined, cp: NULL_____, expP: [], expC: [] },
        { cr: NULL_____, ap: undefined, ac: undefined, cp: undefined, expP: [], expC: [] },
        { cr: undefined, ap: NULL_____, ac: NULL_____, cp: NULL_____, expP: [], expC: [] },
        { cr: undefined, ap: NULL_____, ac: NULL_____, cp: undefined, expP: [], expC: [] },
        { cr: undefined, ap: NULL_____, ac: undefined, cp: NULL_____, expP: [], expC: [] },
        { cr: undefined, ap: NULL_____, ac: undefined, cp: undefined, expP: [], expC: [] },
        { cr: undefined, ap: undefined, ac: NULL_____, cp: NULL_____, expP: [], expC: [] },
        { cr: undefined, ap: undefined, ac: NULL_____, cp: undefined, expP: [], expC: [] },
        { cr: undefined, ap: undefined, ac: undefined, cp: NULL_____, expP: [], expC: [] },
        { cr: undefined, ap: undefined, ac: undefined, cp: undefined, expP: [], expC: [] },
      ];

      // coalesce undefined values into string value
      const coUnd = (val: any): any => {
        return val === undefined ? 'undefined' : val;
      };

      testCases.forEach(tc => {
        it(`for ${JSON.stringify({ conversionRatios: coUnd(tc.cr), allPaths: coUnd(tc.ap), allContradictions: coUnd(tc.ac), currentPath: coUnd(tc.cp) })}`, () => {
          const results = service.getAllPathsRecursive(tc.cr, tc.ap, tc.ac, tc.cp);
          doCommonResultsAssertions(results);
          expect(results.paths).toEqual(tc.expP);
          expect(results.contradictions).toEqual(tc.expC);
        });
      });
    });

    describe('should handle normal input values correctly', () => {
      const testCases: TestCase[] = [
        {
          msg: 'should have both forward and inverse paths',
          cr: [cCvRat(cUnit('g'), 1, cUnit(RefUnit.SERVING), 1)],
          ap: null,
          ac: null,
          cp: null,
          expP: [
            [cpl(cUnit('g'), 1, cUnit(RefUnit.SERVING), 1)],
            [cpl(cUnit(RefUnit.SERVING), 1, cUnit('g'), 1)],
            [cpl(cUnit(RefUnit.SERVING), 1, cUnit('g'), 1), cpl(cUnit('g'), 1, cUnit('mg'), 1000)]
          ],
          expC: []
        },
        {
          msg: 'should detect contradictions',
          cr: [
            // has conversion ratios linking serving size to both g and mg - which are linked already.
            cCvRat(cUnit('g'), 1, cUnit(RefUnit.SERVING), 1),
            cCvRat(cUnit('mg'), 1, cUnit(RefUnit.SERVING), 1)
          ],
          ap: null,
          ac: null,
          cp: null,
          expP: null,
          skipAssertingPaths: true,
          expC: [
            [
              [cpl(cUnit(RefUnit.SERVING), 1, cUnit('g'), 1), cpl(cUnit('g'), 1, cUnit('mg'), 1000)],
              [cpl(cUnit(RefUnit.SERVING), 1, cUnit('mg'), 1)]
            ]
          ]
        },
        {
          msg: 'should prevent stack overflow (not throw error)',
          cr: [
            cCvRat(cUnit('g'), 1, cUnit('g'), 1)
          ],
          ap: null,
          ac: null,
          cp: null,
          expP: [],
          expC: []
        },
        {
          msg: 'ignore conversion ratios that use free form values',
          cr: [
            cCvRat(cUnit('g'), 1, cUnit(RefUnit.SERVING), 1),
            (() => {
              const cvRat = cCvRat(cUnit('g'), 1, cUnit(RefUnit.CONSTITUENTS), 1);
              cvRat.freeFormValueA = "2 TBSP";
              return cvRat;
            })()
          ],
          ap: null,
          ac: null,
          cp: null,
          expP: [
            [cpl(cUnit('g'), 1, cUnit(RefUnit.SERVING), 1)],
            [cpl(cUnit(RefUnit.SERVING), 1, cUnit('g'), 1)],
            [cpl(cUnit(RefUnit.SERVING), 1, cUnit('g'), 1), cpl(cUnit('g'), 1, cUnit('mg'), 1000)]
          ],
          expC: []
        }
      ];

      testCases.forEach(tc => {
        it(tc.msg, () => {
          const results = service.getAllPathsRecursive(tc.cr, tc.ap, tc.ac, tc.cp);
          logResults(results);
          doCommonResultsAssertions(results);

          // assert expected paths match well enough  
          if (!tc.skipAssertingPaths) {
            expect(results.paths.length).toBe(tc.expP.length, 'results.path.length and expected paths length should be equal');
            tc.expP.forEach((expectedPath, idx) => {
              const resultPath = results.paths[idx];
              assertPathsMatch(expectedPath, resultPath);
            });
          }

          // TODO: assert expected contradictions match well enough
          expect(results.contradictions.length).toBe(tc.expC.length, 'results.contradictions.length and expected contradictions length should be equal');
          tc.expC.forEach((expectedContSet, idx) => {
            const resultContSet = results.contradictions[idx];
            expect(expectedContSet.length).toBe(resultContSet.length, 'result contradictions set length should equal expected contradictions set length');
            expectedContSet.forEach((expectedCont, idx) => {
              const resultCont = resultContSet[idx];
              assertPathsMatch(expectedCont, resultCont);
            });
          });
        });
      });
    });
  });
});

/**
 * ----------------------------------------------------------------------------------------
 * Assertions
 * ----------------------------------------------------------------------------------------
 */

function doCommonResultsAssertions(results: PathResults): void {
  expect(results).not.toBeNull();
  expect(results).not.toBeUndefined();
  expect(results.paths).toBeTruthy('results.paths should not be null or undefined');
  expect(results.contradictions).toBeTruthy('results.contradictions should not be null or undefined');
}

function assertPathsMatch(path1: Path, path2: Path): void {
  expect(path1.length).toBe(path2.length);
  path1.forEach((pl, plIdx) => {
    const pl2 = path2[plIdx];
    expect(pl.source.matches(pl2.source)).toBe(true, 'PathLink sources should match');
    expect(pl.sourceAmount).toEqual(pl2.sourceAmount, 'PathLink sourceAmounts should be equal');
    expect(pl.target.matches(pl2.target)).toBe(true, 'PathLink targets should match');
    expect(pl.targetAmount).toEqual(pl2.targetAmount, 'PathLink targetAmounts shoudlbe equal');
    expect(pl.ratio).toEqual(pl2.ratio, 'PathLink ratios should be equal');
  });
}

/**
 * ----------------------------------------------------------------------------------------
 * Creational Helpers
 * ----------------------------------------------------------------------------------------
 */

function cUnit(abbreviation: string) {
  const unit = new Unit();
  unit.abbreviation = abbreviation;
  return unit;
}

function cCvRat(unitA: Unit, amountA: number, unitB: Unit, amountB: number): ConversionRatio {
  const cvRat = new ConversionRatio();
  cvRat.amountA = amountA;
  cvRat.unitA = unitA;
  cvRat.amountB = amountB;
  cvRat.unitB = unitB;
  return cvRat;
}

// creaes conversion ratio with free form value
function cFFV(valueA: string, valueB: string) {
  const cvRat = new ConversionRatio();
  cvRat.unitA = cUnit(RefUnit.SERVING)
  cvRat.amountA = 1;
  cvRat.freeFormValueA = valueA;
  cvRat.freeFormValueB = valueB;
  return cvRat;
}

// convenience alias for PathLink constructor
function cpl(source: Unit, sourceAmount: number, target: Unit, targetAmount: number): PathLink {
  return new PathLink(source, sourceAmount, target, targetAmount);
}

/**
 * ----------------------------------------------------------------------------------------
 * LOGGING
 * ----------------------------------------------------------------------------------------
 */


function logResults(results: PathResults): void {
  console.log('results:');
  console.table(results.paths.map(path => [pCond(path)].concat(path.map(pl => plSmry(pl)))));

  console.log('contradictions:');
  const logTableRows = [];
  results.contradictions.forEach((contradictionSet, idx) => {
    contradictionSet.forEach((path, pathIdx) => {
      if (pathIdx === 0 && idx > 0) {
        logTableRows.push(['--------------------']);
      }

      logTableRows.push([pCond(path)].concat(path.map(pl => plSmry(pl))));
    });
  });
  console.table(logTableRows);
}

function plSmry(pl: PathLink): string {
  return `(${pl.sourceAmount} ${pl.source.abbreviation} -> ${pl.targetAmount} ${pl.target.abbreviation})`;
}

function pSmry(path: Path): string {
  return path.map(pl => plSmry(pl)).join('');
}

// path condensed
function pCond(path: Path): string {
  const src = path[0].source.abbreviation;
  const tgt = path[path.length - 1].target.abbreviation;
  const amt = path.map(pl => pl.ratio).reduce(ProductReducer);
  return `1 ${src} = ${amt} ${tgt}`;
}