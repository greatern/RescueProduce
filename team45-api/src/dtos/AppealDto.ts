
import { IsNotEmpty, IsUUID, IsString, IsDate, IsEnum, IsOptional, IsInt } from 'class-validator';

export class AppealDto {
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  block_id!: string;

  @IsUUID()
  @IsNotEmpty()
  admin_reviewer_id!: string;

  @IsString()
  @IsNotEmpty()
  appeal_reason!: string;

  @IsDate()
  @IsNotEmpty()
  submission_date!: Date;

  @IsString()
  @IsNotEmpty()
  status!: 'pending' | 'approved' | 'rejected'; // Adjust based on your status enum if different

  @IsInt()
  @IsNotEmpty()
  priority!: number;

  @IsDate()
  @IsOptional()
  decision_date?: Date;

  @IsString()
  @IsOptional()
  decision_notes?: string;
}