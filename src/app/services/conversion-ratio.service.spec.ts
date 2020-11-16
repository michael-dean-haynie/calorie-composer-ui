import { TestBed } from '@angular/core/testing';
import { PathLink } from '../constants/types/path-link.type';
import { Path } from '../constants/types/path.type';
import { Unit } from '../models/unit.model';
import { UnitPipe } from '../pipes/unit.pipe';
import { ConversionRatioService } from './conversion-ratio.service';
import { UnitService } from './util/unit.service';


describe('ConversionRatioService', () => {
  let service: ConversionRatioService;

  beforeEach(() => {
    TestBed.configureTestingModule(
      {
        providers: [
          UnitPipe,
          UnitService,
        ]
      }
    );
    service = TestBed.inject(ConversionRatioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPathSource', () => {
    // const path = createPath();
    // const expected = path[0].source;
    // const actual = service.getPathSource(path);
    // expect(expected).toBe(actual);
  });

  describe('getAllPathsRecursive', () => {

  });

});

function createGramUnit(): Unit {
  const unit = new Unit();
  unit.id = '1';
  unit.singular = 'gram';
  unit.plural = 'grams';
  unit.abbreviation = 'g';
  return unit;
}

function createMLUnit(): Unit {
  const unit = new Unit();
  unit.id = '2';
  unit.singular = 'milliliter';
  unit.plural = 'milliliters';
  unit.abbreviation = 'ml';
  return unit;
}

function createPath(): Path {
  return [
    new PathLink(
      createGramUnit(),
      1,
      createMLUnit(),
      2
    )
  ];
}
