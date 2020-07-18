import { NutrientCalculationService } from '../services/util/nutrient-calculation.service';
import { MacroAmtPipe } from './macro-amt.pipe';

describe('MacroPctgPipe', () => {
  let nutrientCalculationService: NutrientCalculationService;
  let pipe: MacroAmtPipe;

  beforeEach(() => {
    nutrientCalculationService = jasmine.createSpyObj(['pctgCalsInFoodForMacro']);
    pipe = new MacroAmtPipe(nutrientCalculationService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
