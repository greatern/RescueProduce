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
	tableName: "userAvailabilities",
	indexes: [
		{
			name: "user_availability_user_id_index",
			fields: ["user_id"],
		},
	],
})
export class UserAvailability extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public user_id!: string;

	// Forms a connection to the user table {1-1}
	@BelongsTo(() => User, "user_id")
	user!: User;

	@Column({ type: DataType.STRING })
	public day_of_week!: string;

	@Column({
		type: DataType.TIME,
	})
	public start_time!: String;

	@Column({
		type: DataType.TIME,
	})
	public end_time!: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
