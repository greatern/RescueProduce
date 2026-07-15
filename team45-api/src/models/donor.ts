import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user";
import { Delivery } from "./delivery";
import { FoodListing } from "./food_listing";
import { Address } from "./address"; // NEW: Import Address model
import { Pickup, PickupStatus } from "./pickup";

@Table({
	tableName: "donors",
	indexes: [
		{
			name: "donors_user_id_index",
			fields: ["id"],
		},
	],
})
export class Donor extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@Column({ type: DataType.STRING })
	public tax_number!: string;

	@Column({ type: DataType.STRING })
	public health_certification_url!: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// These are connections to other tables

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "id")
	user!: User;

	// Forms a connection to the delivery table {1-*}
	@HasMany(() => Delivery)
	deliveries!: Delivery[];

	// Forms a connection to the _ table {1-*}
	@HasMany(() => FoodListing)
	food_listings!: FoodListing[];

	// Forms a connection to the _ table {1-*}
	@HasMany(() => Pickup)
	pickups!: Pickup[];
}
