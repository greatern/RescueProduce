import { IsUUID, IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsNumber, IsDateString, IsDate } from 'class-validator';
import { FraudIssueType, FraudStatus, FraudSeverityLevel } from '../models/fraud_case';

export class FraudCaseDto {
  @IsUUID()
  task_id!: string;

  @IsUUID()
  claim_id!: string;

  @IsUUID()
  reporter_id!: string;

  @IsString()
  description!: string;

  @IsEnum(FraudIssueType)
  issue_type!: FraudIssueType;

  @IsString()
  @IsOptional()
  specific_issue?: string;

  @IsEnum(FraudSeverityLevel)
  @IsOptional()
  severity_level?: FraudSeverityLevel;

  @IsEnum(FraudStatus)
  @IsOptional()
  status?: FraudStatus;

  @IsArray()
  @IsOptional()
  evidence_files?: string[];

  @IsString()
  @IsOptional()
  additional_evidence?: string;

  @IsString()
  @IsOptional()
  resolution_details?: string;

  @IsString()
  @IsOptional()
  investigation_notes?: string;

  @IsString()
  @IsOptional()
  reopened_reason?: string;

  @IsString()
  @IsOptional()
  reported_party?: string;

  @IsBoolean()
  @IsOptional()
  requires_follow_up?: boolean;

  @IsString()
  @IsOptional()
  follow_up_actions?: string;

  @IsNumber()
  @IsOptional()
  estimated_financial_impact?: number;

  @IsBoolean()
  @IsOptional()
  affects_multiple_parties?: boolean;
;

  @IsDateString()
  @IsOptional()
  date_investigation_started?: string;

  @IsDateString()
  @IsOptional()
  date_resolved?: string;

  @IsDateString()
  @IsOptional()
  date_reopened?: string;
}

export class UpdateFraudCaseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FraudIssueType)
  @IsOptional()
  issue_type?: FraudIssueType;

  @IsEnum(FraudSeverityLevel)
  @IsOptional()
  severity_level?: FraudSeverityLevel;

  @IsEnum(FraudStatus)
  @IsOptional()
  status?: FraudStatus;

  @IsArray()
  @IsOptional()
  evidence_files?: string[];

  @IsString()
  @IsOptional()
  resolution_details?: string;

  @IsString()
  @IsOptional()
  investigation_notes?: string;

  @IsString()
  @IsOptional()
  reopened_reason?: string;

  @IsBoolean()
  @IsOptional()
  requires_follow_up?: boolean;

  @IsString()
  @IsOptional()
  follow_up_actions?: string;

  @IsNumber()
  @IsOptional()
  estimated_financial_impact?: number;

  @IsBoolean()
  @IsOptional()
  affects_multiple_parties?: boolean;

  @IsDateString()
  @IsOptional()
  date_investigation_started?: string;

  @IsDateString()
  @IsOptional()
  date_resolved?: string;

  @IsDateString()
  @IsOptional()
  date_reopened?: string;
}