import { Transform, Type } from "class-transformer";
import {
	IsString,
	IsEmail,
	IsEnum,
	isObject,
	ValidateNested,
	IsNotEmpty,
} from "class-validator";
import { DonorDto } from "./donorDto";
import { ReceiverDto } from "./receiverDto";

export enum TYPE {
	ADMIN = "admin",
	DONOR = "donor",
	RECEIVER = "receiver",
	VOLUNTEER = "volunteer",
}

export class UserDto {
	@IsString()
	name!: string;

	@IsEmail()
	email!: string;

	@IsString()
	password!: string;

	@IsString()
	phone!: string;

	@IsEnum(TYPE)
	@Transform(({ value }) => value.toLowerCase())
	role!: TYPE;

	@ValidateNested()
	@IsNotEmpty()
	@Type(() => Object)
	user_type!: DonorDto | ReceiverDto;
}
