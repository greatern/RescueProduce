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
import { Delivery } from "./delivery";

type TemperatureReading = {
	timestamp: Date;
	temperature: number;
};

@Table({
	tableName: "deliveryChecks",
	indexes: [{ name: "delivery_id_index", fields: ["delivery_id"] }],
})
export class DeliveryCheck extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@ForeignKey(() => Delivery)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	public delivery_id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public pickup_photo_url!: string;

	@Column({
		type: DataType.FLOAT,
		allowNull: false,
	})
	public pickup_quantity_kg!: number;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	public pickup_otp!: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	public delivery_photo_url!: string;

	@Column({
		type: DataType.FLOAT,
		allowNull: false,
	})
	public delivery_quantity_kg!: number;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	public recipient_signature_url!: string;

	@Column({
		type: DataType.JSON,
		allowNull: true,
	})
	public temperature_readings!: TemperatureReading;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// connection to other tables

	// Forms a connection to the delivery table {1-1}
	@BelongsTo(() => Delivery, "delivery_id")
	delivery!: Delivery;
}
