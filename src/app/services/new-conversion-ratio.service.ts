import { Injectable } from '@angular/core';
import { IsMeaningfulValue, isNOU, ProductReducer } from '../constants/functions';
import { ContradictionSet } from '../constants/types/contradiction-set.type';
import { ConversionRatioSide } from '../constants/types/conversion-ratio-side.type';
import { PathLink } from '../constants/types/path-link.type';
import { PathResults } from '../constants/types/path-results.type';
import { Path } from '../constants/types/path.type';
import { ConversionRatio } from '../models/conversion-ratio.model';
import { Unit } from '../models/unit.model';
import { StandardizedUnitService } from './util/standardized-unit.service';

@Injectable({
  providedIn: 'root'
})
export class NewConversionRatioService {

  constructor(
    private standardizedUnitService: StandardizedUnitService
  ) { }

  getPathSource(path: Path): Unit {
    return path[0].source;
  }

  getPathTarget(path: Path): Unit {
    return path[path.length - 1].target;
  }

  conversionRatioIncludesUnit(cvRat: ConversionRatio, unit: Unit): boolean {
    return (!!cvRat && !!cvRat.unitA && cvRat.unitA.matches(unit))
      || (!!cvRat && !!cvRat.unitB && cvRat.unitB.matches(unit));
  }

  isFilledOut(cvRat: ConversionRatio): boolean {
    if (!cvRat || !cvRat.unitA || !cvRat.unitA.abbreviation || !cvRat.unitB || !cvRat.unitB.abbreviation) {
      return false;
    }
    if (isNOU(cvRat.amountA) || isNOU(cvRat.amountB)) {
      return false;
    }
    return true;
  }

  sideUsesFreeFormValue(cvRat: ConversionRatio, side: ConversionRatioSide): boolean {
    if (!cvRat) {
      return false;
    }
    return IsMeaningfulValue(this.getFreeFormValueForSide(cvRat, side));
  }

  usesFreeFormValue(cvRat: ConversionRatio): boolean {
    return this.sideUsesFreeFormValue(cvRat, 'a') || this.sideUsesFreeFormValue(cvRat, 'b');
  }

  condencedPath(path: Path): string {
    const src = this.getPathSource(path).abbreviation;
    const tgt = this.getPathTarget(path).abbreviation;
    const amt = path.map(pl => pl.ratio).reduce(ProductReducer);
    const pathCpy = [].concat(path);
    const conversionPath = [src].concat(pathCpy.map(pl => pl.target.abbreviation));
    return `1 ${src} = ${amt} ${tgt} (conversion path: ${conversionPath.join(' -> ')})`;
  }

  getAllUnits(cvRats: ConversionRatio[]): Unit[] {
    // use path source because results should have inverse paths too.
    const srcUnits = this.getAllPaths(cvRats).paths.map(path => this.getPathSource(path));
    const noDuplicates = [];
    srcUnits.forEach(unit => {
      if (!noDuplicates.find(u => u.matches(unit))) {
        noDuplicates.push(unit);
      }
    });
    return noDuplicates;
  }

  getPathsForUnit(cvRats: ConversionRatio[], source: Unit): Path[] {
    return this.getAllPaths(cvRats).paths.filter(path => {
      return this.getPathSource(path).matches(source);
    });
  }

  getAllPaths(conversionRatios: ConversionRatio[]): PathResults {
    return this.getAllPathsRecursive(conversionRatios, null, null, null);
  }

  getPathProduct(path: Path): number {
    if (!path) {
      return undefined;
    }
    return path.map(pl => pl.ratio).reduce(ProductReducer);
  }

  getAllPathsRecursive(
    conversionRatios: ConversionRatio[],
    allPaths: Path[],
    allContradictions: ContradictionSet[],
    currentPath: Path
  ): PathResults {

    // default inputs
    conversionRatios = conversionRatios || [];
    allPaths = allPaths || [];
    allContradictions = allContradictions || [];
    currentPath = currentPath || [];

    // default result
    const results: PathResults = {
      paths: allPaths,
      contradictions: allContradictions
    };

    /**
     * -----------------------------
     * First level call
     * -----------------------------
     */
    if (!currentPath.length) {

      // prevent stack overflow from cvRat with 2 of the same unit.
      conversionRatios = conversionRatios.filter(cvRat => !!cvRat.unitA && !!cvRat.unitB && !cvRat.unitA.matches(cvRat.unitB));

      // ignore conversion ratios that use free form values
      conversionRatios = conversionRatios.filter(cvRat => !this.usesFreeFormValue(cvRat));

      conversionRatios.forEach(cvRat => {
        // 1. add root path
        let newPath: Path = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];

        // check for contradictions
        let contradictionSet = this.getContradictionsForPath(newPath, allPaths);
        if (contradictionSet) {
          allContradictions.push(contradictionSet);
        }

        allPaths.push(newPath);
        let pathStart = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];

        // fillout from root path
        this.getAllPathsRecursive(conversionRatios, allPaths, allContradictions, pathStart);

        // 2. add inverse root path
        newPath = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)];

        // check for contradictions
        contradictionSet = this.getContradictionsForPath(newPath, allPaths);
        if (contradictionSet) {
          allContradictions.push(contradictionSet);
        }

        allPaths.push(newPath);
        pathStart = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)];

        // fillout from inverse root path
        this.getAllPathsRecursive(conversionRatios, allPaths, allContradictions, pathStart);
      });
    }

    /**
     * -----------------------------
     * Nth level calls
     * -----------------------------
     */
    else { // currentPath.length is truthy
      const latestTarget: Unit = this.getPathTarget(currentPath);
      const otherUnitsInCurrentPath = currentPath
        .map(pathLink => {
          return [pathLink.source, pathLink.target];
        })
        .reduce((accumulator, currentValue) => {
          // add values that don't already exist
          return accumulator.concat(currentValue.filter(newVal => {
            return !accumulator.find(accElm => accElm.matches(newVal));
          }));
        }, [])
        .filter(unit => !unit.matches(latestTarget));

      /**
       * find all the conversion ratios that include the latest target, but not any other unit in the current path
       */
      const persuableCvRats = conversionRatios
        .filter(cvRat => this.conversionRatioIncludesUnit(cvRat, latestTarget))
        .filter(cvRat => {
          return !otherUnitsInCurrentPath.some(unit => this.conversionRatioIncludesUnit(cvRat, unit));
        });

      persuableCvRats.forEach(cvRat => {
        const newPath = currentPath.concat(this.getPathLinkFromCvRat(cvRat, latestTarget));

        // check for contradictions
        let contradictionSet = this.getContradictionsForPath(newPath, allPaths);
        if (contradictionSet) {
          allContradictions.push(contradictionSet);
        }

        allPaths.push(newPath);
        const newCurrentPath = currentPath.concat([this.getPathLinkFromCvRat(cvRat, latestTarget)]);
        this.getAllPathsRecursive(conversionRatios, allPaths, allContradictions, newCurrentPath);
      });


      /**
       * find all standardized ratios that have a target that isn't in the current path ...
       * ... and haven't already been reached by another path starting with the same unit as current path
       */
      if (this.standardizedUnitService.matchesStandardizedUnit(latestTarget.abbreviation)) {

        const standardizedUnits = this.standardizedUnitService.standardizedFoodAmountUnits
          .filter(stdUnit => stdUnit.measure === this.standardizedUnitService.stdUnitInfoFor(latestTarget.abbreviation).measure);

        const persuableStandardizedUnits = standardizedUnits
          .map(stdUnit => this.standardizedUnitService.stdUnitInfoToModel(stdUnit))
          .filter(unit => !otherUnitsInCurrentPath.concat([latestTarget]).find(othUnt => othUnt.matches(unit)))
          .filter(unit => !this.targetUnitPreviouslyReached(unit, allPaths, currentPath));

        for (const unit of persuableStandardizedUnits) {
          // check previous iterations haven't made this one un-persuable
          if (!this.targetUnitPreviouslyReached(unit, allPaths, currentPath)) {
            allPaths.push(
              currentPath.concat(
                new PathLink(
                  latestTarget, 1, unit, this.standardizedUnitService.CONVERT(1).from(latestTarget.abbreviation).to(unit.abbreviation))));
            const newCurrentPath = currentPath.concat(
              new PathLink(latestTarget, 1, unit, this.standardizedUnitService.CONVERT(1).from(latestTarget.abbreviation).to(unit.abbreviation)));
            this.getAllPathsRecursive(conversionRatios, allPaths, allContradictions, newCurrentPath);
          }
        }
      }
    }

    // only really matters what the top level returns
    results.paths = allPaths;
    results.contradictions = allContradictions;
    return results;
  }

  private getPathLinkFromCvRat(cvRat: ConversionRatio, source: Unit) {
    return source.matches(cvRat.unitA)
      ? new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)
      : new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA);
  }

  private targetUnitPreviouslyReached(targetUnit: Unit, allPaths: Path[], currentPath: Path): boolean {
    return allPaths.some(path => {
      return this.getPathSource(path).matches(this.getPathSource(currentPath))
        && this.getPathTarget(path).matches(targetUnit);
    });
  }

  private getContradictionsForPath(path: Path, allPaths: Path[]): null | ContradictionSet {

    const contradictingPaths = allPaths.filter(exPath => {
      return this.getPathSource(exPath).matches(this.getPathSource(path))
        && this.getPathTarget(exPath).matches(this.getPathTarget(path));
    });

    if (contradictingPaths.length) {
      contradictingPaths.push(path);
      return contradictingPaths;
    }
    else {
      return null;
    }
  }

  private getFreeFormValueForSide(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    const map = new Map<ConversionRatioSide, string>([['a', cvRat.freeFormValueA], ['b', cvRat.freeFormValueB]]);
    return map.get(side);
  }

  /**
   * ----------------------------------------------------------------------------------------
   * LOGGING
   * ----------------------------------------------------------------------------------------
   */

  private plSmry(pl: PathLink): string {
    return `(${pl.sourceAmount} ${pl.source.abbreviation} -> ${pl.targetAmount} ${pl.target.abbreviation})`;
  }

  private pSmry(path: Path): string {
    return path.map(pl => this.plSmry(pl)).join('');
  }
}