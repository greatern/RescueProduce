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
import { Address } from "./address";
import { Claim } from "./claim";
import { FoodListing } from "./food_listing";
import { Volunteer } from "./volunteer";
import { Receiver } from "./receiver";
import { Donor } from "./donor";
import { Rating } from "./rating";
import { DeliveryCheck } from "./delivery_check";

enum DeliveryStatus {
	SCHEDULED = "scheduled",
	ENROUTE = "en_route",
	DELIVERED = "delivered",
	CANCELED = "cancelled",
	FAILED = "failed",
}

@Table({
	tableName: "deliveries",
	indexes: [
		{ name: "claim_id_index", fields: ["claim_id"] },
		{ name: "food_listing_id_index", fields: ["food_listing_id"] },
		{ name: "receiver_id_index", fields: ["receiver_id"] },
		{ name: "donor_id_index", fields: ["donor_id"] },
		{ name: "pickup_address_id_index", fields: ["pickup_address_id"] },
		{ name: "delivery_address_id_index", fields: ["delivery_address_id"] },
	],
})
export class Delivery extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@ForeignKey(() => Claim)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public claim_id!: string;

	@ForeignKey(() => FoodListing)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public food_listing_id!: string;

	@ForeignKey(() => Volunteer)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public volunteer_id!: string;

	@ForeignKey(() => Receiver)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public receiver_id!: string;

	@ForeignKey(() => Donor)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public donor_id!: string;

	@ForeignKey(() => Address)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public pickup_address_id!: string;

	@ForeignKey(() => Address)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public delivery_address_id!: string;

	@Column({ type: DataType.DATE })
	public scheduled_pickup!: Date;

	@Column({ type: DataType.DATE })
	public actual_pickup!: Date;

	@Column({ type: DataType.DATE })
	public actual_delivery!: Date;

	@Column({ type: DataType.ENUM(...Object.values(DeliveryStatus)) })
	public status!: DeliveryStatus;

	@Column({ type: DataType.FLOAT })
	public carbon_saved_kg!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// These are connections to other tables

	// Forms a connection to the volunteer table {1-*}
	@BelongsTo(() => Volunteer, "volunteer_id")
	volunteer!: Volunteer;

	// Forms a connection to the receiver table {1-*}
	@BelongsTo(() => Receiver, "receiver_id")
	receiver!: Receiver;

	// Forms a connection to the donor table {1-*}
	@BelongsTo(() => Donor, "donor_id")
	donor!: Donor;

	// Forms a connection to the claim table {1-1}
	@BelongsTo(() => Claim, "claim_id")
	claim!: Claim;

	// Forms a connection to the food_listing table {1-*}
	@BelongsTo(() => FoodListing, "food_listing_id")
	food_listing!: FoodListing;

	// Forms a connection to the rating table {1-1}
	@HasOne(() => Rating)
	rating!: Rating;

	// Forms a connection to the delivery_check table {1-*}
	@HasOne(() => DeliveryCheck)
	delivery_check!: DeliveryCheck;

	// Forms a connection to the _ table {1-*}
	@BelongsTo(() => Address, "pickup_address_id")
	pickup_address!: Address;

	// Forms a connection to the address table {1-*}
	@BelongsTo(() => Address, "delivery_address_id")
	delivery_address!: Address;
}
