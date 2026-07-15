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
import { Task } from "./task";
import { User } from "./user";

@Table({
	tableName: "otp_codes",
})
export class OtpCode extends Model {
	@PrimaryKey
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
	})
	id!: string;

	@ForeignKey(() => Task)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	task_id!: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	user_id!: string;

	@Column({
		type: DataType.STRING(6),
		allowNull: false,
	})
	otp_code!: string;

	@Column({
		type: DataType.STRING(4),
		allowNull: false,
	})
	otp_hash!: string;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	expires_at!: Date;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	ip_address?: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	used!: boolean;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	attempts!: number;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 3,
	})
	max_attempts!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Relationships
	@BelongsTo(() => User, "user_id")
	user!: User;

	@BelongsTo(() => Task, "task_id")
	task!: Task;
}
