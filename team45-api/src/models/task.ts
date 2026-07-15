import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	HasOne,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Volunteer } from "./volunteer";
import { Receiver } from "./receiver";
import { Address } from "./address";
import { Claim } from "./claim";
import { OtpCode } from "./otp_code";
import { Pickup } from "./pickup";

// Type of task (e.g., 'delivery', 'pickup')
export enum TaskType {
	DELIVERY = "delivery",
	PICKUP = "pickup",
}

export enum Status {
	READY = "ready",
	PENDING = "pending",
	CONFIRMED = "confirmed",
	COLLECTED = "collected",
	EN_ROUTE = "en_route",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	MISSED = "missed",
}

@Table({
	tableName: "tasks",
	indexes: [
		{
			name: "assigned_volunteer_id_index",
			fields: ["assigned_volunteer_id"],
		},
		{
			name: "assigned_receiver_id_index",
			fields: ["assigned_receiver_id"],
		},
		{ name: "pickup_address_id_index", fields: ["pickup_address_id"] },
		{
			name: "destination_address_id_index",
			fields: ["destination_address_id"],
		},
		{ name: "claim_id_index", fields: ["claim_id"] },
	],
})
export class Task extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	title!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	description!: string;

	@Column({
		type: DataType.ENUM(...Object.values(TaskType)),
		allowNull: true,
	})
	task_type!: TaskType;

	@Column({
		type: DataType.ENUM(...Object.values(Status)),
		defaultValue: Status.PENDING,
		allowNull: true,
	})
	status!: Status;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	due_date!: Date;

	@Column({
		type: DataType.FLOAT,
		allowNull: true,
	})
	distance!: number;

	@ForeignKey(() => Volunteer)
	@Column({
		type: DataType.UUID,
		allowNull: true,
	})
	assigned_volunteer_id!: string;

	@ForeignKey(() => Receiver)
	@Column({
		type: DataType.UUID,
		allowNull: true,
	})
	assigned_receiver_id!: string;

	@ForeignKey(() => Address)
	@Column({
		type: DataType.UUID,
		allowNull: true,
	})
	pickup_address_id!: string;

	@ForeignKey(() => Address)
	@Column({
		type: DataType.UUID,
		allowNull: true,
	})
	destination_address_id!: string;

	@ForeignKey(() => Claim)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	claim_id!: string;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	pickup_time!: Date;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	dropoff_time!: Date;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Relationships
	@BelongsTo(() => Volunteer, "assigned_volunteer_id")
	volunteer!: Volunteer;

	@BelongsTo(() => Receiver, "assigned_receiver_id")
	receiver!: Receiver;

	@BelongsTo(() => Address, "pickup_address_id")
	pickup_address!: Address;

	@BelongsTo(() => Address, "destination_address_id")
	destination_address!: Address;

	@BelongsTo(() => Claim, "claim_id")
	claim!: Claim;

	@HasOne(() => OtpCode)
	otp_code!: OtpCode;

	@HasOne(() => Pickup)
	pickup!: Pickup;
}
