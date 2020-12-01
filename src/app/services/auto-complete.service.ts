import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IsMeaningfulValue } from '../constants/functions';
import { NutrientMetadataList } from '../constants/nutrient-metadata';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { OptGroup } from '../constants/types/select-options';
import { StdUnitInfo } from '../constants/types/std-unit-info';
import { UnitFacadeService } from './util/unit-facade.service';
import { UnitService } from './util/unit.service';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor(
    private unitService: UnitService,
    private unitFacadeService: UnitFacadeService
  ) { }

  optionsForConversionRatioUnit(constituentType: ConstituentType): OptGroup[] {
    return [
      {
        groupLabel: 'Mass',
        groupOptions: UnitService.MetricMassUnits.concat(UnitService.ImperialMassUnits)
          .map(unit => this.mapUnitToAutoCompleteOptions(unit, constituentType))
      },
      {
        groupLabel: 'Volume',
        groupOptions: UnitService.MetricVolumeUnits.concat(UnitService.ImperialVolumeUnits)
          .map(unit => this.mapUnitToAutoCompleteOptions(unit, constituentType))
      },
      {
        groupLabel: 'Reference',
        groupOptions: UnitService.ReferenceMeasureUnits
          .map(unit => this.mapUnitToAutoCompleteOptions(unit, constituentType))
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

  private mapUnitToAutoCompleteOptions(unit: StdUnitInfo, constituentType: ConstituentType): any {
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
}
