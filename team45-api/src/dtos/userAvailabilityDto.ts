import { IsDateString, IsEnum, IsNotEmpty, IsString } from "class-validator";

// Define valid days of the week to ensure strict validation
export enum DayOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday",
}

export class UserAvailabilityDto {
    @IsEnum(DayOfWeek, { message: "day_of_week must be a valid day (e.g., monday, tuesday)" })
    @IsNotEmpty({ message: "day_of_week is required" })
    day_of_week!: DayOfWeek;

    @IsDateString({}, { message: "start_time must be a valid ISO 8601 date string" })
    @IsNotEmpty({ message: "start_time is required" })
    start_time!: string; // Will be parsed to Date by Sequelize

    @IsDateString({}, { message: "end_time must be a valid ISO 8601 date string" })
    @IsNotEmpty({ message: "end_time is required" })
    end_time!: string; // Will be parsed to Date by Sequelize
}