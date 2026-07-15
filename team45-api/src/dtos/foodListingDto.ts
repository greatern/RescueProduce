import {
	IsInt,
	isNotEmpty,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsDecimal,
	IsString,
	ValidateNested,
} from "class-validator";

export class FoodListingDto {
	@IsString()
	donor_id!: string;

	@IsString()
	food_category!: string;

	@IsDecimal()
	posted_quantity!: string;

	@IsNumber()
	available_quanity!: number;
}
