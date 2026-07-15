import {
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
import { Rewards } from "./reward";

@Table({
	tableName: "userRewards",
	indexes: [
		{ name: "user_reward_user_id_index", fields: ["user_id"] },
		{ name: "reward_id_index", fields: ["reward_id"] },
	],
})
export class UserReward extends Model {
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

	@ForeignKey(() => Rewards)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	reward_id!: string;

	@Column({ type: DataType.DATE })
	date_earned!: Date;

	@Column({ type: DataType.STRING })
	status: string = "active";

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
