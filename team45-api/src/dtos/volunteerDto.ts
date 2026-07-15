import { IsString, IsDate, IsDecimal } from "class-validator";

export class Volunteer {
	@IsString()
	license_number!: string;

	@IsDate()
	license_expiry_date!: Date;

	@IsDecimal()
	service_area_km!: number;
}
