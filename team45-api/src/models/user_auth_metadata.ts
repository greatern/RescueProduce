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
	tableName: "userAuthMetadata",
	indexes: [
		{
			name: "user_auth_metadata_user_id_index",
			fields: ["id"],
		},
	],
})
export class UserAuthMetadata extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({ type: DataType.UUID })
	public id!: string;

	// Forms a connection to the user table
	@BelongsTo(() => User, "id")
	user!: User;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	public last_login!: Date;

	@Column({ type: DataType.BOOLEAN })
	public email_verified!: boolean;

	@Column({ type: DataType.STRING })
	public override_password!: string;

	@Column({ type: DataType.INTEGER })
	public failed_login_attempts!: number;

	@Column({ type: DataType.DATE })
	last_failed_attempt!: Date;

	@Column({ type: DataType.DATE })
	password_changed_at!: Date;

	@Column({ type: DataType.BOOLEAN })
	mfa_enabled!: boolean;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
