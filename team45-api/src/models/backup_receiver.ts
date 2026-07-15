import {
	BelongsTo,
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
import { Receiver } from "./receiver";
import { FoodListing } from "./food_listing";

@Table({
	tableName: "backupReceivers",
	indexes: [
		{ name: "receiver_id_index", fields: ["receiver_id"] },
		{ name: "listing_id_index", fields: ["listing_id"] },
	],
})
export class BackupReceiver extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@ForeignKey(() => Receiver)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	receiver_id!: string;

	@ForeignKey(() => FoodListing)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	listing_id!: string;

	@Column({ type: DataType.INTEGER })
	priority_order!: number;

	@Column({ type: DataType.BOOLEAN })
	notified: boolean = false;

	@Column({ type: DataType.STRING })
	response_status!: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Connections to other tables
	// Forms a connection to the food_listing table {1-*}
	@BelongsTo(() => FoodListing, "listing_id")
	listing!: FoodListing[];

	// Forms a connection to the receiver table {1-*}
	@BelongsTo(() => Receiver, "receiver_id")
	receiver!: Receiver;
}
