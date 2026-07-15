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
import { User } from "./user";

@Table({
	tableName: "penalty",
	indexes: [
		{ name: "penalty_user_id_index", fields: ["user_id"] },
		{ name: "issued_by_id_index", fields: ["issued_by_id"] },
	],
})
export class Penalty extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	// this is the user the pen is being applied to
	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	user_id!: string;

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "user_id")
	user!: User;

	@Column({ type: DataType.STRING })
	reason!: string;

	@Column({ type: DataType.STRING })
	severity!: string;

	@Column({ type: DataType.INTEGER })
	points_deducted!: string;

	@Column({ type: DataType.DATE })
	effective_until!: Date;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// this the user that requested(?) the pen
	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	issued_by_id!: string;
	// Forms a connection to the _ table {1-*}
	@BelongsTo(() => User, "issued_by_id")
	issued_by!: User;
}
