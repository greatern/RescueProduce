import {
	IsNotEmpty,
	IsObject,
	IsString,
	IsDate,
	IsIn,
	IsNumber,
	ValidateNested,
	IsOptional,
} from "class-validator";
import { Type } from "class-transformer";
import { UserDto } from "./userDto";
import { AddressDto } from "./addressDto";
import { IsInt } from "class-validator";

class DonationStatsDto {
	@IsInt()
	@IsNotEmpty()
	total!: number;

	totalBoxes!: number;

	@IsInt()
	@IsNotEmpty()
	thisMonth!: number;
}

class ImpactStatsDto {
	@IsInt()
	@IsNotEmpty()
	mealsProvided!: number;

	@IsInt()
	@IsNotEmpty()
	co2Saved!: number;
}

class ActivityItemDto {
	@IsInt()
	@IsNotEmpty()
	id!: number;

	@IsString()
	@IsNotEmpty()
	text!: string;

	@IsString()
	@IsNotEmpty()
	date!: string;
}
/*
class PickupItemDto {
  @IsInt()
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;
} */

class DonorProfileDto {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsInt()
	@IsNotEmpty()
	totalDonations!: number;

	@IsString()
	@IsNotEmpty()
	joinDate!: string;
}

class CommunityStatsDto {
	@IsInt()
	@IsNotEmpty()
	rank!: number;

	@IsInt()
	@IsNotEmpty()
	totalDonors!: number;
}

class DonationGoalDto {
	@IsInt()
	@IsNotEmpty()
	current!: number;

	@IsInt()
	@IsNotEmpty()
	target!: number;
}

export class DonorDto {
	@IsString()
	tax_number!: string;

	@IsString()
	health_certification_url?: string;

	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => AddressDto)
	address?: AddressDto;
}

export class DonorDashboardDto {
	@ValidateNested()
	@Type(() => DonationStatsDto)
	donationStats!: DonationStatsDto;

	@ValidateNested()
	@Type(() => ImpactStatsDto)
	impactStats!: ImpactStatsDto;

	@ValidateNested({ each: true })
	@Type(() => ActivityItemDto)
	recentActivities!: ActivityItemDto[];

	/* @ValidateNested({ each: true })
  @Type(() => PickupItemDto)
  upcomingPickups!: PickupItemDto[]; */

	@ValidateNested()
	@Type(() => DonorProfileDto)
	donorProfile!: DonorProfileDto;

	@ValidateNested()
	@Type(() => CommunityStatsDto)
	communityStats!: CommunityStatsDto;

	@ValidateNested()
	@Type(() => DonationGoalDto)
	donationGoal!: DonationGoalDto;
}

export class DonationDto {
	@IsString()
	id!: string;

	@IsString()
	food_category!: string;

	@IsDate()
	@Type(() => Date)
	created_at!: Date;

	@IsNumber()
	posted_quantity!: number;

	@IsNumber()
	weight_per_unit!: number;

	@IsDate()
	@Type(() => Date)
	cutoff_pickup_date!: Date;

	@IsString()
	@IsIn(["pending", "completed", "cancelled"])
	status!: string;
}
