import {
	Column,
	CreatedAt,
	DataType,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";

@Table({
	tableName: "otp_rate_limits",
})
export class OtpRateLimit extends Model {
	@PrimaryKey
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
	})
	id!: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	identifier!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	limit_type!: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
		defaultValue: 1,
	})
	request_count!: number;

	@Column({
		type: DataType.DATE,
		allowNull: false,
		defaultValue: DataType.NOW,
	})
	public window_start!: Date;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
		defaultValue: 3600, // 1 hour in seconds
	})
	public window_duration!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
