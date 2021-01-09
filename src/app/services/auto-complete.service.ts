import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IsMeaningfulValue } from '../constants/functions';
import { NutrientMetadataList } from '../constants/nutrient-metadata';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { Opt, OptGroup } from '../constants/types/select-options';
import { StdUnitInfo } from '../constants/types/std-unit-info';
import { Unit } from '../models/unit.model';
import { StandardizedUnitService } from './util/standardized-unit.service';
import { SupplementalUnitService } from './util/supplemental-unit.service';
import { UnitFacadeService } from './util/unit-facade.service';
import { UnitService } from './util/unit.service';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor(
    private unitService: UnitService,
    private unitFacadeService: UnitFacadeService,
    private standardizedUnitService: StandardizedUnitService,
    private supplementalUnitService: SupplementalUnitService
  ) { }

  optionsForConversionRatioUnit(constituentType: ConstituentType): OptGroup[] {
    return [
      {
        groupLabel: 'Mass',
        groupOptions: UnitService.MetricMassUnits.concat(UnitService.ImperialMassUnits)
          .map(unit => this.mapStdUnitInfoToAutoCompleteOption(unit, constituentType))
      },
      {
        groupLabel: 'Volume',
        groupOptions: UnitService.MetricVolumeUnits.concat(UnitService.ImperialVolumeUnits)
          .map(unit => this.mapStdUnitInfoToAutoCompleteOption(unit, constituentType))
      },
      {
        groupLabel: 'Reference',
        groupOptions: UnitService.ReferenceMeasureUnits
          .map(unit => this.mapStdUnitInfoToAutoCompleteOption(unit, constituentType))
      }
    ];
  }

  optionsForNutrientUnit(): OptGroup[] {
    return [
      {
        groupLabel: 'All',
        groupOptions: this.unitFacadeService.nutrientUnits.map(desc =>
          ({ label: `${desc.singular} (${desc.abbreviation})`, value: desc.abbreviation })
        )
      }
    ];
  }

  optionsForNutrientName(): OptGroup[] {
    return [
      {
        groupLabel: 'All',
        groupOptions: NutrientMetadataList.map(meta => ({ label: meta.displayName, value: meta.displayName }))
      }
    ];
  }

  filteredOptions(optionGroups: OptGroup[], control: FormControl): Observable<OptGroup[]> {
    return control.valueChanges.pipe(
      startWith(''), // so AC pops up initially
      map(inputVal => {

        if (!IsMeaningfulValue(inputVal)) {
          return optionGroups;
        }

        return optionGroups.map(group => {
          // remove options in group that don't match filter value
          // also - don't dork with original list.
          const shallowGroupClone = { ...group };
          shallowGroupClone.groupOptions = group.groupOptions.filter(opt => {
            return opt.label.toLowerCase().includes(inputVal.toLowerCase());
          });
          return shallowGroupClone;
        })
          // remove groups that are empty
          .filter(group => group.groupOptions.length > 0);
      })
    );
  }

  private mapStdUnitInfoToAutoCompleteOption(unit: StdUnitInfo, constituentType: ConstituentType): Opt {
    const isReferenceUnit = UnitService.ReferenceMeasureUnits.some(desc => desc.abbr === unit.abbr);
    if (isReferenceUnit) {
      return {
        label: this.unitService.ppReferenceUnit(unit.abbr, constituentType),
        value: unit.abbr
      };
    }

    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

  mapUnitToAutoCompleteOption(unit: Unit, constituentType: ConstituentType): Opt {
    // first check if we can swap out unit for standardized or supplemental one that has more meta data
    if (this.standardizedUnitService.matchesStandardizedUnit(unit.abbreviation)) {
      unit = this.standardizedUnitService.abbrToModel(unit.abbreviation);
    } else if (this.supplementalUnitService.matchesSupplementalUnit(unit.abbreviation)) {
      unit = this.supplementalUnitService.abbrToModel(unit.abbreviation);
    }

    // handle if it's a refernce unit
    const isReferenceUnit = UnitService.ReferenceMeasureUnits.some(desc => desc.abbr === unit.abbreviation);
    if (isReferenceUnit) {
      return {
        label: this.unitService.ppReferenceUnit(unit.abbreviation, constituentType),
        value: unit.abbreviation
      };
    }

    // otherwise ...
    const usePlural = IsMeaningfulValue(unit.plural);
    const useSingular = !usePlural && IsMeaningfulValue(unit.singular);
    const justAbbr = !usePlural && !useSingular;

    let label = '';
    if (usePlural) {
      label = `${unit.plural} (${unit.abbreviation})`;
    } else if (useSingular) {
      label = `${unit.singular} (${unit.abbreviation})`;
    } else if (justAbbr) {
      label = unit.abbreviation
    }

    return {
      label: label,
      value: unit.abbreviation
    };
  }
}
