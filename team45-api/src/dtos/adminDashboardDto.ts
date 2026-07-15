import {
	IsInt,
	IsNotEmpty,
	IsArray,
	ValidateNested,
	IsNumber,
	IsString,
} from "class-validator";
import { Type } from "class-transformer";

class WasteDataPoint {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsInt()
	@IsNotEmpty()
	total!: number;
}

class UserDistribution {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsInt()
	@IsNotEmpty()
	value!: number;
}

class TopDonor {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsNumber()
	@IsNotEmpty()
	quantity!: number;
}

class TopVolunteer {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsInt()
	@IsNotEmpty()
	completedTasks!: number;
}

export class AdminDashboardDto {
	@IsNotEmpty()
	stats!: {
		users: number;
		donations: number;
		accumulation: number;
		deliveries: number;
		deliveriesFailed: number;
		deliverySuccessRate: string;
	};

	@IsNotEmpty()
	wasteTrend!: {
		currentMonth: number;
		lastMonth: number;
	};

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => WasteDataPoint)
	wasteData!: WasteDataPoint[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserDistribution)
	userDistribution!: UserDistribution[];

	@IsNotEmpty()
	impactMetrics!: {
		mealsProvided: number;
		co2Saved: number;
		peopleFed: number;
		wasteDiverted: number;
	};

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TopDonor)
	topDonors!: TopDonor[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TopVolunteer)
	topVolunteers!: TopVolunteer[];
}
