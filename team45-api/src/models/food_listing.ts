import {
	BeforeCreate,
	BeforeUpdate,
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
import { Delivery } from "./delivery";
import { Donor } from "./donor";
import { Claim } from "./claim";
import { BackupReceiver } from "./backup_receiver";

export enum QuantityUnit {
	BOXES = "boxes",
}

export enum FoodStatus {
	AVAILABLE = "available",
	CLAIMED = "claimed",
	PICKED_UP = "picked_up",
	EXPIRED = "expired",
	PARTIALLY_CLAIMED = "partially_claimed",
}

@Table({
	tableName: "foodListings",
	indexes: [
		{
			name: "donor_id_index",
			fields: ["donor_id"],
		},
	],
})
export class FoodListing extends Model {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
	id!: string;

	@ForeignKey(() => Donor)
	@Column({ type: DataType.UUID, allowNull: false })
	donor_id!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	food_category!: string;

	@Column({
		type: DataType.FLOAT,
		allowNull: false,
		validate: { min: 0.01 },
	})
	posted_quantity!: number;

	@Column({
		type: DataType.FLOAT,
		allowNull: false,
		validate: { min: 0.01 },
	})
	weight_per_unit!: number;

	@Column({
		type: DataType.FLOAT,
		allowNull: false,
		defaultValue: 0,
		validate: { min: 0 },
	})
	claimed_quantity!: number;

	@Column({
		type: DataType.ENUM(...Object.values(QuantityUnit)),
		allowNull: false,
	})
	quantity_type!: QuantityUnit;

	@Column({ type: DataType.DATE, allowNull: false })
	cutoff_pickup_date!: Date;

	@Column({ type: DataType.DATE, allowNull: false })
	expiry!: Date;

	@Column({ type: DataType.TIME, allowNull: false })
	cutoff_pickup_time!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	storage_requirements!: string;

	@Column({
		type: DataType.ENUM(...Object.values(FoodStatus)),
		defaultValue: FoodStatus.AVAILABLE,
	})
	status!: FoodStatus;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	requires_refrigeration!: boolean;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	contains_allergens!: boolean;

	@Column({ type: DataType.TEXT, allowNull: true })
	description!: string;

	@Column({ type: DataType.DATE })
	posted_at!: Date;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Virtual fields
	@Column({
		type: DataType.VIRTUAL,
		get() {
			const self = this as FoodListing;
			return self.posted_quantity - self.claimed_quantity;
		},
	})
	available_quantity!: number;

	@Column({
		type: DataType.VIRTUAL,
		get() {
			const self = this as FoodListing;
			return self.weight_per_unit * self.posted_quantity;
		},
	})
	quantity_kg!: number;

	@Column({
		type: DataType.VIRTUAL,
	
	get() {
			const self = this as FoodListing;
			if (!self.expiry_days_left) {
				return "unknown";
			}
			return self.expiry_days_left <= 1
				? "critical"
				: self.expiry_days_left <= 3
				? "high"
				: "normal";
		},
	})
	expiry_status!: string;

	@Column({
		type: DataType.VIRTUAL,
		get() {
			const self = this as FoodListing;
			if (!self.expiry) {
				return null;
			}
			return Math.ceil(
				(self.expiry.getTime() - Date.now()) / (1000 * 3600 * 24)
			);
		},
	})
	expiry_days_left!: number;

	// Associations
	@BelongsTo(() => Donor)
	donor!: Donor;

	@HasMany(() => Delivery)
	deliveries!: Delivery[];

	@HasMany(() => Claim)
	claims!: Claim[];

	@HasMany(() => BackupReceiver)
	backup_receivers!: BackupReceiver[];

	@BeforeCreate
	@BeforeUpdate
	static updateStatus(instance: FoodListing) {
		// Check quantity claimed
		if (instance.claimed_quantity >= instance.posted_quantity) {
			instance.status = FoodStatus.CLAIMED;
		} else if (instance.claimed_quantity > 0) {
			instance.status = FoodStatus.PARTIALLY_CLAIMED;
		}

		// Check expiration
		const now = new Date();
		if (instance.expiry && now > instance.expiry) {
			instance.status = FoodStatus.EXPIRED;
		}

		// Check pickup deadline
		if (
			now > instance.cutoff_pickup_date &&
			instance.status !== FoodStatus.EXPIRED
		) {
			instance.status = FoodStatus.EXPIRED;
		}
	}
}