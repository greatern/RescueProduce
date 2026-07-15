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
import { User } from "./user";
import { Address } from "./address";
import { v4 as uuidv4 } from "uuid";

@Table({
	tableName: "userAddresses",
	indexes: [
		{ name: "_user_id_index", fields: ["user_id"] },
		{ name: "address_id_index", fields: ["address_id"] },
	],
})
export class UserAddress extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	public user_id!: string;

	@PrimaryKey
	@ForeignKey(() => Address)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	public address_id!: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@BelongsTo(() => User)
	user!: User;

	@BelongsTo(() => Address)
	address!: Address;
}
