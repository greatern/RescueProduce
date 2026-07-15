import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	HasMany,
	HasOne,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { FoodListing } from "./food_listing";
import { Receiver } from "./receiver";
import { Delivery } from "./delivery";
import { NoShowLog } from "./no_show_log";
import { v4 as uuidv4 } from "uuid";
import { Task } from "./task";

/* enum ClaimStatus {
	PENDING = "pending",
	PICKED_UP = "picked_up",
	FULFILLED = "fulfilled",
	CANCELLED = "cancelled",
	NO_SHOW = "no_show",
} */

@Table({
	tableName: "claims",
	createdAt: "created_at",
	updatedAt: "updated_at",
	indexes: [
		{ name: "listing_id_index", fields: ["listing_id"] },
		{ name: "receiver_id_index", fields: ["receiver_id"] },
	],
})
export class Claim extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		allowNull: false,
		defaultValue: uuidv4,
	})
	id!: string;

	@ForeignKey(() => FoodListing)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	listing_id!: string;

	@ForeignKey(() => Receiver)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	receiver_id!: string;

	@Column({ type: DataType.INTEGER })
	claimed_quantity!: number;

	@Column({ type: DataType.FLOAT })
	claimed_amount_kg!: number;

	@CreatedAt
	created_at!: Date;
	// These are connections to other tables

	// Forms a connection to the delivery table {1-1}
	@HasOne(() => Delivery)
	delivery!: Delivery;

	// For a connection to the claim table
	@HasOne(() => Task)
	task!: Task;

	// Forms a connection to the no_show_log table {1-*}
	@HasMany(() => NoShowLog)
	no_show_logs!: NoShowLog[];

	// Forms a connection to the food_listing table {1-*}
	@BelongsTo(() => FoodListing, "listing_id")
	food_listing!: FoodListing;

	// Forms a connection to the _ table {1-*}
	@BelongsTo(() => Receiver, "receiver_id")
	receiver!: Receiver;
}
