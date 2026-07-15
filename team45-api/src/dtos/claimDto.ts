import {
	IsNotEmpty,
	IsObject,
	IsString,
	ValidateNested,
	IsOptional,
	IsUUID,
	IsNumber,
	Min,
	IsIn,
} from "class-validator";
export class ClaimDto {
	@IsNotEmpty()
	@IsUUID()
	listing_id!: string;

	@IsNotEmpty()
	@IsUUID()
	receiver_id!: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1, { message: "claimed_quantity must be at least 1" })
	claimed_quantity!: number;

	@IsString()
	@IsIn(["delivery", "pickup"], {
		message: "procurement_type must be 'delivery or 'pickup'",
	})
	procurement_type!: "delivery" | "pickup";

	@IsNumber()
	@IsOptional()
	distance?: number;
}
