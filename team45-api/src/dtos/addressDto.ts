// src/dtos/addressDto.ts

import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsNumber,
	IsUUID,
	isNotEmpty,
} from "class-validator";

export class AddressDto {
	@IsNotEmpty()
	@IsUUID()
	user_id!: string;

	@IsNotEmpty()
	@IsString()
	address_line1!: string;

	@IsOptional()
	@IsString()
	address_line2?: string;

	@IsNotEmpty()
	@IsString()
	city!: string;

	@IsOptional()
	@IsString()
	province?: string;

	@IsNotEmpty()
	@IsString()
	postal_code!: string;

	@IsOptional()
	@IsString()
	country: string = "South Africa";

	@IsNotEmpty()
	@IsNumber()
	latitude?: number;

	@IsNotEmpty()
	@IsNumber()
	longitude?: number;
}
