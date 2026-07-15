// src/dtos/receiverDto.ts

import {
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsString,
	ValidateNested,
	IsOptional,
} from "class-validator"; // Added IsOptional
import { UserDto } from "./userDto";
import { Type } from "class-transformer";
import { AddressDto } from "./addressDto";

export class ReceiverDto {
	@IsString()
	registration_number!: string;

	@IsNumber()
	storage_capacity!: number;

	@IsOptional() // Address might be optional during initial registration
	@IsObject()
	@ValidateNested()
	@Type(() => AddressDto)
	address?: AddressDto;
}
