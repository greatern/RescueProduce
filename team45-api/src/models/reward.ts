import {
	AllowNull,
	BelongsToMany,
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
import { UserReward } from "./user_reward";

@Table({ tableName: "rewards" })
export class Rewards extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@Column({ type: DataType.STRING })
	public reward_name!: string;

	@Column({ type: DataType.STRING })
	public description!: string;

	@Column({ type: DataType.INTEGER })
	public points_acquired!: number;

	@Column({ type: DataType.BOOLEAN })
	public active: boolean = true;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Forms a connection to the user table
	// this enable a {*-*} to the user table
	@BelongsToMany(() => User, () => UserReward)
	users!: User[];
}
