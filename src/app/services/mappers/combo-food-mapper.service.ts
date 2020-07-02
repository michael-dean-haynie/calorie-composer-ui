import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ComboFoodDTO } from 'src/app/contracts/combo-food-dto';
import { ComboFood } from 'src/app/models/combo-food.model';
import { PortionService } from '../util/portion.service';
import { UnitService } from '../util/unit.service';
import { ComboFoodFoodAmountMapperService } from './combo-food-food-amount-mapper.service';
import { ComboFoodPortionMapperService } from './combo-food-portion-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodMapperService {

  constructor(
    private comboFoodFoodAmountMapperService: ComboFoodFoodAmountMapperService,
    private comboFoodPortionMapperService: ComboFoodPortionMapperService,
    private fb: FormBuilder,
    private portionService: PortionService,
    private unitService: UnitService
  ) { }

  dtoToModel(comboFoodDTO: ComboFoodDTO): ComboFood {
    const comboFood = new ComboFood();
    comboFood.id = comboFoodDTO.id;
    comboFood.isDraft = comboFoodDTO.isDraft;
    comboFood.description = comboFoodDTO.description;
    comboFood.foodAmounts = comboFoodDTO.foodAmounts.map(foodAmountDTO => this.comboFoodFoodAmountMapperService.dtoToModel(foodAmountDTO));
    comboFood.portions = comboFoodDTO.portions.map(portionDTO => this.comboFoodPortionMapperService.dtoToModel(portionDTO));
    return comboFood;
  }

  modelToDTO(comboFood: ComboFood): ComboFoodDTO {
    return comboFood;
  }

  modelToFormGroup(comboFood: ComboFood): FormGroup {
    const ssp = this.portionService.getServingSize(comboFood.portions) ?? this.comboFoodPortionMapperService.defaultSSModel();
    const otherPortions = this.portionService.getNonSSPortions(comboFood.portions);

    return this.fb.group({
      description: [comboFood.description, Validators.required],
      servingSizePortion: this.comboFoodPortionMapperService.modelToFormGroup(ssp),
      otherPortions: this.fb.array(otherPortions.map(portion => this.comboFoodPortionMapperService.modelToFormGroup(portion))),
      foodAmounts: this.fb.array(
        comboFood.foodAmounts.map(foodAmount => this.comboFoodFoodAmountMapperService.modelToFormGroup(foodAmount))
      )
    }, { validators: [this.foodAmountRefPortionRequired, this.oneFoodAmountRefPortionPerUnitType] });
  }

  // Must have at least one portion flagged as a food amount reference portion
  private foodAmountRefPortionRequired: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const servingSizePortion = control.get('servingSizePortion') as FormControl;
    const otherPortions = control.get('otherPortions') as FormArray;
    const allPortions = [servingSizePortion].concat(otherPortions.controls as FormControl[]);

    return allPortions.some(portion => !!portion.get('isFoodAmountRefPortion').value) ? null : { foodAmountRefPortionRequired: true };
  }

  // No more than one nutrient reference portion per unit type (mass / volume)
  private oneFoodAmountRefPortionPerUnitType: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const servingSizePortion = control.get('servingSizePortion') as FormControl;
    const otherPortions = control.get('otherPortions') as FormArray;
    const allPortions = [servingSizePortion].concat(otherPortions.controls as FormControl[]);

    const allMeasures = allPortions
      // only concerned about portions marked as food amount ref portion
      .filter(portion => portion.get('isFoodAmountRefPortion').value)
      // map to unit type and remove falsey results
      .map(portion => this.unitService.getUnitMeasure(portion.get('metricUnit')?.value))
      .filter(measure => measure);

    // check for duplicates and return error if existing
    return (new Set(allMeasures).size === allMeasures.length)
      ? null
      : { oneFoodAmountRefPortionPerUnitType: true };

  }
}
