import { NutrientCalculationService } from '../services/util/nutrient-calculation.service';
import { MacroAmtPipe } from './macro-amt.pipe';

describe('MacroAmtPipe', () => {
  let nutrientCalculationService: NutrientCalculationService;
  let pipe: MacroAmtPipe;

  beforeEach(() => {
    nutrientCalculationService = jasmine.createSpyObj(['nutrientAmtInFood']);
    pipe = new MacroAmtPipe(nutrientCalculationService);
  });


  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
