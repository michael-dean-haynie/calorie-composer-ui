import { Injectable } from '@angular/core';
import { IsMeaningfulValue } from '../constants/functions';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { ContradictionsError } from '../constants/types/contradictions-error.error';
import { ContradictionsResult } from '../constants/types/contradictions-result.type';
import { ConversionRatioSide } from '../constants/types/conversion-ratio-side.type';
import { PathLink } from '../constants/types/path-link.type';
import { Path } from '../constants/types/path.type';
import { ConversionRatio } from '../models/conversion-ratio.model';
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
    const unit = side === 'a' ? cvRat.unitA : cvRat.unitB;

    return `${amount} ${this.unitPipe.transform(unit, constituentType)}`;
  }

  private getAllPathsRecursive(
    cvRats: ConversionRatio[],
    allPaths: Path[],
    currentPath: Path,
    checkForContradictions: boolean,
    constituentType: ConstituentType
  ): void {

    // console.group(`getAllPaths() cp: ${this.pSmry(currentPath)}`);
    // for first level call
    if (!currentPath.length) {
      cvRats.forEach(cvRat => {
        // add root path
        let newPath = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return path[0].source === newPath[0].source && path[path.length - 1].target === newPath[newPath.length - 1].target;
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        // console.log(`%cAdded to allPaths: ${this.pSmry(allPaths[allPaths.length - 1])}`, 'color: green');
        let pathStart = [new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)];

        // fillout from root path
        this.getAllPathsRecursive(cvRats, allPaths, pathStart, checkForContradictions, constituentType);

        // add inverse root path
        newPath = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)]
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return path[0].source === newPath[0].source && path[path.length - 1].target === newPath[newPath.length - 1].target;
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        // console.log(`%cAdded to allPaths: ${this.pSmry(allPaths[allPaths.length - 1])}`, 'color: green');
        pathStart = [new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA)];

        // fillout from inverse root path
        this.getAllPathsRecursive(cvRats, allPaths, pathStart, checkForContradictions, constituentType);
      });


      // for nth level calls
    } else {
      const latestTarget = currentPath[currentPath.length - 1].target;
      const otherUnitsInCurrentPath = currentPath
        .map(pathLink => {
          return [pathLink.source, pathLink.target];
        })
        .reduce((accumulator, currentValue) => {
          // add values that don't already exist
          return accumulator.concat(currentValue.filter(newVal => !accumulator.includes(newVal)));
        }, [])
        .filter(unit => unit !== latestTarget);
      // // console.log('units in path so far besides latest target:', otherUnitsInCurrentPath);


      /**
       * find all the conversion ratios that include the latest target, but not any other unit in the current path
       */
      const persuableCvRats = cvRats
        .filter(cvRat => this.conversionRatioIncludesUnit(cvRat, latestTarget))
        .filter(cvRat => {
          return !otherUnitsInCurrentPath.some(unit => this.conversionRatioIncludesUnit(cvRat, unit));
        });
      // console.log('persuable conversion ratios', this.cvRatsSmry(persuableCvRats));

      persuableCvRats.forEach(cvRat => {
        const newPath = currentPath.concat(this.getPathLinkFromCvRat(cvRat, latestTarget));
        if (checkForContradictions) {
          // if there's already a path that has the same source/target, throw contradiction exception
          const contadictions = allPaths.filter(path => {
            return path[0].source === newPath[0].source && path[path.length - 1].target === newPath[newPath.length - 1].target;
          });
          if (contadictions.length) {
            throw new ContradictionsError(
              new ContradictionsResult(true, [newPath, ...contadictions].map(path => this.conversionChain(path, constituentType)))
            );
          }
        }
        allPaths.push(newPath);
        // console.log(`%cAdded to allPaths: ${this.pSmry(allPaths[allPaths.length - 1])}`, 'color: green');
        const newCurrentPath = currentPath.concat([this.getPathLinkFromCvRat(cvRat, latestTarget)]);
        this.getAllPathsRecursive(cvRats, allPaths, newCurrentPath, checkForContradictions, constituentType);
      });


      /**
       * find all standardized ratios that have a target that isn't in the current path ...
       * ... and haven't already been reached by another path starting with the same unit as current path
       */
      const persuableStandardizedUnits = this.unitService.getStandardizedConversions(latestTarget)
        .filter(unit => !otherUnitsInCurrentPath.concat([latestTarget]).includes(unit))
        .filter(unit => !this.targetUnitPreviouslyReached(unit, allPaths, currentPath));
      // console.log(`persuable standardized units: ${persuableStandardizedUnits.join(', ')}`);

      for (const unit of persuableStandardizedUnits) {
        // check previous iterations haven't made this one un-persuable
        if (!this.targetUnitPreviouslyReached(unit, allPaths, currentPath)) {
          allPaths.push(currentPath.concat(new PathLink(latestTarget, 1, unit, UnitService.CONVERT(1).from(latestTarget).to(unit))));
          // console.log(`%cAdded to allPaths: ${this.pSmry(allPaths[allPaths.length - 1])}`, 'color: green');
          const newCurrentPath = currentPath.concat(
            new PathLink(latestTarget, 1, unit, UnitService.CONVERT(1).from(latestTarget).to(unit)));
          this.getAllPathsRecursive(cvRats, allPaths, newCurrentPath, checkForContradictions, constituentType);
        }
      }


    }
    // console.groupEnd();
  }

  private targetUnitPreviouslyReached(targetUnit: string, allPaths: Path[], currentPath: Path): boolean {
    return allPaths.some(path => {
      return path[0].source === currentPath[0].source
        && path[path.length - 1].target === targetUnit;
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
      return text + `(${pl.sourceAmount} ${this.unitPipe.transform(pl.source, ct)} = ${pl.targetAmount} ${this.unitPipe.transform(pl.target, ct)})`;
    }).join('');
  }

  private getPathLinkFromCvRat(cvRat: ConversionRatio, source: string) {
    return source === cvRat.unitA
      ? new PathLink(cvRat.unitA, cvRat.amountA, cvRat.unitB, cvRat.amountB)
      : new PathLink(cvRat.unitB, cvRat.amountB, cvRat.unitA, cvRat.amountA);
  }

  private conversionRatioIncludesUnit(cvRat: ConversionRatio, unit: string): boolean {
    return cvRat.unitA === unit || cvRat.unitB === unit;
  }
}