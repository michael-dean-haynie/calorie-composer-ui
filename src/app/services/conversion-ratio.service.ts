import { Injectable } from '@angular/core';
import { IsMeaningfulValue, ProductReducer } from '../constants/functions';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { ContradictionsError } from '../constants/types/contradictions-error.error';
import { ContradictionsResult } from '../constants/types/contradictions-result.type';
import { ConversionRatioSide } from '../constants/types/conversion-ratio-side.type';
import { PathLink } from '../constants/types/path-link.type';
import { Path } from '../constants/types/path.type';
import { ConversionRatio } from '../models/conversion-ratio.model';
import { Unit } from '../models/unit.model';
import { UnitPipe } from '../pipes/unit.pipe';
import { UnitService } from './util/unit.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioService {

  constructor(
    private unitPipe: UnitPipe,
    private unitService: UnitService
  ) { }

  sideUsesFreeFormValue(cvRat: ConversionRatio, side: ConversionRatioSide): boolean {
    return IsMeaningfulValue(this.getFreeFormValueForSide(cvRat, side));
  }

  usesFreeFormValue(cvRat: ConversionRatio): boolean {
    return this.sideUsesFreeFormValue(cvRat, 'a') || this.sideUsesFreeFormValue(cvRat, 'b');
  }

  sideDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide, constituentType: ConstituentType): string {
    if (this.sideUsesFreeFormValue(cvRat, side)) {
      return this.getFreeFormValueForSide(cvRat, side);
    } else {
      return this.getStructuredDisplayValue(cvRat, side, constituentType);
    }
  }

  sideReadyToConvertFromFreeform(cvRat: ConversionRatio, side: ConversionRatioSide): boolean {
    if (side === 'a') {
      return IsMeaningfulValue(cvRat.amountA) && IsMeaningfulValue(cvRat.unitA) && IsMeaningfulValue(cvRat.freeFormValueA);
    } else {
      return IsMeaningfulValue(cvRat.amountB) && IsMeaningfulValue(cvRat.unitB) && IsMeaningfulValue(cvRat.freeFormValueB);
    }
  }

  isFilledOut(cvRat: ConversionRatio): boolean {
    return IsMeaningfulValue(cvRat.unitA)
      && IsMeaningfulValue(cvRat.amountA)
      && IsMeaningfulValue(cvRat.unitB)
      && IsMeaningfulValue(cvRat.amountB);
  }

  getPathSource(path: Path): Unit {
    return path[0].source;
  }

  getPathTarget(path: Path): Unit {
    return path[path.length - 1].target;
  }

  getPathProduct(path: Path): number {
    if (!path) {
      return undefined;
    }
    return path.map(pl => pl.ratio).reduce(ProductReducer);
  }

  getAllUnits(cvRats: ConversionRatio[]): Unit[] {
    return [...new Set(this.getAllPaths(cvRats).map(path => this.getPathSource(path)))];
  }

  getPathsForUnit(cvRats: ConversionRatio[], source: Unit): Path[] {
    return this.getAllPaths(cvRats).filter(path => {
      return this.getPathSource(path).equals(source);
    });
  }

  getAllPaths(cvRats: ConversionRatio[]): Path[] {
    const allPaths: Path[] = [];
    const currentPath: Path = [];
    this.getAllPathsRecursive(cvRats, allPaths, currentPath, false, null);
    // console.table(allPaths.map(path => path.map(pl => this.plSmry(pl))));
    return allPaths;
  }

  checkForContradictions(cvRats: ConversionRatio[], constituentType: ConstituentType): ContradictionsResult {
    const allPaths: Path[] = [];
    const currentPath: Path = [];
    try {
      this.getAllPathsRecursive(cvRats, allPaths, currentPath, true, constituentType);
    } catch (e) {
      if (e instanceof ContradictionsError) {
        return e.result;
      }
    }
    return { contradictionsExist: false };
  }

  private getFreeFormValueForSide(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    const map = new Map<ConversionRatioSide, string>([['a', cvRat.freeFormValueA], ['b', cvRat.freeFormValueB]]);
    return map.get(side);
  }

  private getStructuredDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide, constituentType: ConstituentType): string {
    const amount = side === 'a' ? cvRat.amountA : cvRat.amountB;
    const unit = side === 'a' ? cvRat.unitA.abbreviation : cvRat.unitB.abbreviation;

    return `${amount} ${this.unitPipe.transform(unit, constituentType)}`;
  }

  private getAllPathsRecursive(
    cvRats: ConversionRatio[],
    allPaths: Path[],
    currentPath: Path,
    checkForContradictions: boolean,
    constituentType: ConstituentType
  ): void {
    if (!cvRats.length) {
      return;
    }

    cvRats = cvRats.filter(cvr => this.isFilledOut(cvr));

    // for first level call
    if (!currentPath.length) {
      cvRats.forEach(cvRat => {
        // add root path
        let newPath = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return this.getPathSource(path).equals(this.getPathSource(newPath))
              && this.getPathTarget(path).equals(this.getPathTarget(newPath));
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        let pathStart = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];

        // fillout from root path
        this.getAllPathsRecursive(cvRats, allPaths, pathStart, checkForContradictions, constituentType);

        // add inverse root path
        newPath = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)];
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return this.getPathSource(path).equals(this.getPathSource(newPath))
              && this.getPathTarget(path).equals(this.getPathTarget(newPath));
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        pathStart = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)];

        // fillout from inverse root path
        this.getAllPathsRecursive(cvRats, allPaths, pathStart, checkForContradictions, constituentType);
      });


      // for nth level calls
    } else {
      const latestTarget: Unit = this.getPathTarget(currentPath);
      const otherUnitsInCurrentPath = currentPath
        .map(pathLink => {
          return [pathLink.source, pathLink.target];
        })
        .reduce((accumulator, currentValue) => {
          // add values that don't already exist
          return accumulator.concat(currentValue.filter(newVal => {
            return !accumulator.find(accElm => accElm.equals(newVal));
          }));
        }, [])
        .filter(unit => !unit.equals(latestTarget));


      /**
       * find all the conversion ratios that include the latest target, but not any other unit in the current path
       */
      const persuableCvRats = cvRats
        .filter(cvRat => this.conversionRatioIncludesUnit(cvRat, latestTarget))
        .filter(cvRat => {
          return !otherUnitsInCurrentPath.some(unit => this.conversionRatioIncludesUnit(cvRat, unit));
        })
        .filter(cvRat => this.isFilledOut(cvRat));

      persuableCvRats.forEach(cvRat => {
        const newPath = currentPath.concat(this.getPathLinkFromCvRat(cvRat, latestTarget));
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return this.getPathSource(path).equals(this.getPathSource(newPath))
              && this.getPathTarget(path).equals(this.getPathTarget(newPath));
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        const newCurrentPath = currentPath.concat([this.getPathLinkFromCvRat(cvRat, latestTarget)]);
        this.getAllPathsRecursive(cvRats, allPaths, newCurrentPath, checkForContradictions, constituentType);
      });


      /**
       * find all standardized ratios that have a target that isn't in the current path ...
       * ... and haven't already been reached by another path starting with the same unit as current path
       */
      const persuableStandardizedUnits = this.unitService.getStandardizedConversions(latestTarget)
        .filter(unit => !otherUnitsInCurrentPath.concat([latestTarget]).find(othUnt => othUnt.equals(unit)))
        .filter(unit => !this.targetUnitPreviouslyReached(unit, allPaths, currentPath));

      for (const unit of persuableStandardizedUnits) {
        // check previous iterations haven't made this one un-persuable
        if (!this.targetUnitPreviouslyReached(unit, allPaths, currentPath)) {
          allPaths.push(
            currentPath.concat(new PathLink(latestTarget, 1, unit, UnitService.CONVERT(1).from(latestTarget.abbreviation).to(unit))));
          const newCurrentPath = currentPath.concat(
            new PathLink(latestTarget, 1, unit, UnitService.CONVERT(1).from(latestTarget.abbreviation).to(unit)));
          this.getAllPathsRecursive(cvRats, allPaths, newCurrentPath, checkForContradictions, constituentType);
        }
      }


    }
  }

  private targetUnitPreviouslyReached(targetUnit: Unit, allPaths: Path[], currentPath: Path): boolean {
    return allPaths.some(path => {
      return this.getPathSource(path).equals(this.getPathSource(currentPath))
        && this.getPathTarget(path).equals(targetUnit);
    });
  }

  private cvRatSmry(cvRat: ConversionRatio): string {
    return `(${cvRat.amountA} ${cvRat.unitA} : ${cvRat.amountB} ${cvRat.unitB})`;
  }

  private cvRatsSmry(cvRats: ConversionRatio[]): string[] {
    return cvRats.map(cvRat => this.cvRatSmry(cvRat));
  }

  private plSmry(pl: PathLink) {
    return `(${pl.sourceAmount} ${pl.source} -> ${pl.targetAmount} ${pl.target})`;
  }

  private pSmry(path: Path) {
    return path.map(pl => this.plSmry(pl)).join('');
  }

  private pEnds(path: Path) {
    return `(${path[0].source} -> ${path[path.length - 1].target})`;
  }

  private conversionChain(path: Path, ct: ConstituentType): string {
    return path.map((pl, index) => {
      let text = '';
      if (index > 0) {
        text += ' -> ';
      }
      return text + `(${pl.sourceAmount} ${this.unitPipe.transform(pl.source.abbreviation, ct)}`
        + ` = ${pl.targetAmount} ${this.unitPipe.transform(pl.target.abbreviation, ct)})`;
    }).join('');
  }


  private getPathLinkFromCvRat(cvRat: ConversionRatio, source: Unit) {
    return source.equals(cvRat.unitA)
      ? new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)
      : new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA);
  }

  private conversionRatioIncludesUnit(cvRat: ConversionRatio, unit: Unit): boolean {
    return cvRat.unitA.equals(unit) || cvRat.unitB.equals(unit);
  }
}