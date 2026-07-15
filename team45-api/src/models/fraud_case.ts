import {
  BelongsTo,
  HasOne,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user";
import { Task } from "./task";
import { Claim } from "./claim";
import { Blocklist } from "./blocklist";


export enum FraudIssueType {
  FOOD_QUALITY = "food_quality",
  MISSING_ITEMS = "missing_items",
  QUANTITY_MISMATCH = "quantity_mismatch",
  DELIVERY_ISSUE = "delivery_issue",
  VOLUNTEER_BEHAVIOR = "volunteer_behavior",
  FRAUDULENT_CLAIM = "fraudulent_claim",
  OTHER = "other",
}

export enum FraudSeverityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum FraudStatus {
  OPEN = "open",
  UNDER_INVESTIGATION = "under_investigation",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
  ESCALATED = "escalated",
  REOPENED = "reopened", 
}

@Table({
  tableName: "fraud_cases",
  indexes: [
    { name: "fraud_cases_reporter_id_index", fields: ["reporter_id"] },
    { name: "fraud_cases_task_id_index", fields: ["task_id"] },
    { name: "fraud_cases_claim_id_index", fields: ["claim_id"] },
    { name: "fraud_cases_status_index", fields: ["status"] },
    { name: "fraud_cases_issue_type_index", fields: ["issue_type"] },
    { name: "fraud_cases_severity_index", fields: ["severity_level"] },
  ],
})
export class FraudCase extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  reporter_id!: string;

  @BelongsTo(() => User, "reporter_id")
  reporter!: User;

  @ForeignKey(() => Task)
  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  task_id!: string;

  @BelongsTo(() => Task, "task_id")
  task!: Task;

  @ForeignKey(() => Claim)
  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  claim_id!: string;

  @BelongsTo(() => Claim, "claim_id")
  claim!: Claim;

  @Column({ 
    type: DataType.TEXT,
    allowNull: false 
  })
  description!: string;

  @Column({ 
    type: DataType.ENUM(...Object.values(FraudIssueType)),
    allowNull: false 
  })
  issue_type!: FraudIssueType;

  @Column({ 
    type: DataType.TEXT,
    allowNull: true 
  })
  specific_issue?: string;

  // Evidence management
  @Column({ 
    type: DataType.JSON,
    defaultValue: [] 
  })
  evidence_files!: string[];

  @Column({ 
    type: DataType.TEXT,
    allowNull: true 
  })
  additional_evidence?: string;

  // Severity and status
  @Column({ 
    type: DataType.ENUM(...Object.values(FraudSeverityLevel)),
    defaultValue: FraudSeverityLevel.MEDIUM 
  })
  severity_level!: FraudSeverityLevel;

  @Column({ 
    type: DataType.ENUM(...Object.values(FraudStatus)),
    defaultValue: FraudStatus.OPEN 
  })
  status!: FraudStatus;

  // Dates
  @Column({ 
    type: DataType.DATE,
    defaultValue: DataType.NOW 
  })
  date_reported!: Date;

  @Column({ type: DataType.DATE })
  date_investigation_started?: Date;

  @Column({ type: DataType.DATE })
  date_resolved?: Date;

  @Column({ type: DataType.DATE })
  date_reopened?: Date; 

  @Column({ type: DataType.TEXT })
  resolution_details?: string;

  @Column({ type: DataType.TEXT })
  investigation_notes?: string;

  @Column({ type: DataType.TEXT })
  reopened_reason?: string;

  @Column({ 
    type: DataType.UUID,
    allowNull: true 
  })
  resolved_by?: string; 

  @Column({ 
    type: DataType.ENUM('reporter', 'volunteer', 'donor', 'system', 'unknown'),
    allowNull: true 
  })
  reported_party?: string;

  @Column({ 
    type: DataType.BOOLEAN,
    defaultValue: false 
  })
  requires_follow_up!: boolean;

  @Column({ 
    type: DataType.TEXT,
    allowNull: true 
  })
  follow_up_actions?: string;

  @Column({ 
    type: DataType.INTEGER,
    allowNull: true 
  })
  estimated_financial_impact?: number;

  @Column({ 
    type: DataType.BOOLEAN,
    defaultValue: false 
  })
  affects_multiple_parties!: boolean;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

@HasOne(() => Blocklist, { foreignKey: 'user_id' })
blocklist?: Blocklist;

}