import {
	BelongsTo, // ADD THIS
	BelongsToMany,
	Column,
	CreatedAt,
	DataType,
	ForeignKey, // ADD THIS
	HasMany,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user";
import { Delivery } from "./delivery";

@Table({
	tableName: "addresses",
})
export class Address extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	user_id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public address_line1!: string;

	@Column({ type: DataType.STRING })
	public address_line2!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public city!: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	public province!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public postal_code!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public country!: string;

	@Column({ type: DataType.DECIMAL })
	public latitude!: number;

	@Column({ type: DataType.DECIMAL })
	public longitude!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@BelongsTo(() => User)
	user!: User;
	// Forms a connection to the delivery table {1-*}
	@HasMany(() => Delivery)
	deliveries!: Delivery[];
}
