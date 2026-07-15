import {
	AllowNull,
	BelongsTo,
	Model,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	PrimaryKey,
	UpdatedAt,
	Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Donor } from "./donor";
import { Task } from "./task";
import { table } from "pdfkit";

export enum PickupStatus {
	SCHEDULED = "scheduled",
	CONFIRMED = "confirmed",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	MISSED = "missed",
	CANCELLED = "cancelled",
}

@Table({
	tableName: "pickups",
})
export class Pickup extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
		allowNull: false,
	})
	id!: string;

	@ForeignKey(() => Donor)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	donor_id!: string;

	@ForeignKey(() => Task)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	task_id!: string;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	scheduled_pickup_time!: Date;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	actual_pickup_time?: Date;

	@Column({
		type: DataType.ENUM(...Object.values(PickupStatus)),
		defaultValue: PickupStatus.SCHEDULED,
		allowNull: false,
	})
	pickup_status!: PickupStatus;

	@Column({
		type: DataType.STRING(10),
		allowNull: true,
	})
	confirmation_code?: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Connections to other tables
	@BelongsTo(() => Donor)
	donor!: Donor;

	@BelongsTo(() => Task)
	task!: Task;
}
