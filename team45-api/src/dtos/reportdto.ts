import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsDateString,
  IsEmail,
  IsUUID,
  IsEnum
} from "class-validator";
import { Type } from "class-transformer";

export enum ReportType {
  TAX = 'tax',
  IMPACT = 'impact',
  CSR = 'csr',
  MONTHLY_SUMMARY = 'monthly-summary'
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ReportResultDto {
  fileName?: string;
  downloadUrl?: string;
  metrics?: {
    totalDonations: number;
    totalKg: number;
    estimatedValue: number;
    co2Saved: number;
    mealsProvided: number;
  };
}