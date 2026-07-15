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
import { User } from "./user";

@Table({
	tableName: "ratings",
	indexes: [
		{ name: "rating_user_id_index", fields: ["user_id"] },
		{ name: "delivery_id_index", fields: ["delivery_id"] },
	],
})
export class Rating extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	user_id!: string;

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "user_id")
	user!: User;

	@ForeignKey(() => Delivery)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	delivery_id!: string;

	// Forms a connection to the delivery table {1-1}
	@BelongsTo(() => Delivery, "delivery_id")
	delivery!: Delivery;

	@Column({ type: DataType.STRING })
	rating_for!: string;

	@Column({ type: DataType.INTEGER })
	score!: number;

	@Column({ type: DataType.STRING })
	comment!: string;
	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
