import { FoodDTO } from '../contracts/FoodDTO';
import { Nutrient } from './Nutrient';

export class Food {
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: Nutrient[];

    constructor(foodDTO: FoodDTO) {
        this.description = foodDTO.description;
        this.brandOwner = foodDTO.brandOwner;
        this.ingredients = foodDTO.ingredients;
        this.servingSize = foodDTO.servingSize;
        this.servingSizeUnit = foodDTO.servingSizeUnit;
        this.nutrients = foodDTO.nutrients.map(nutrientDTO => new Nutrient(nutrientDTO));
    }
}