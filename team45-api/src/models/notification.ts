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

export enum NOTIF_TYPE {
	SYSTEM = "system",
	DONATION = "donation",
	DELIVERY = "delivery",
	ALLOCATION = "allocation",
	ACCOUNT = "account",
	INFO = "info",
	ALERT = "alert",
	WARNING = 'warning',
    PENALTY = 'penalty',
    BLOCK = 'block',
    FRAUD_CASE_UPDATE = 'fraud_case_update',
}

@Table({
	tableName: "notifications",
	indexes: [
		{
			name: "notifications_user_id_index",
			fields: ["user_id"],
		},
	],
})
export class Notification extends Model {
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

	@Column({ type: DataType.STRING })
	public title!: string;

	@Column({
		type: DataType.TEXT,
		allowNull: false,
	})
	public message!: string;

	@Column({
		type: DataType.ENUM(...Object.values(NOTIF_TYPE)),
		allowNull: false,
	})
	public notification_type!: NOTIF_TYPE;

	@Column({ type: DataType.STRING })
	public related_entity_type!: string;

	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	public related_entity_id!: string;

	@Column({ type: DataType.BOOLEAN })
	public is_read: boolean = false;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "user_id")
	user!: User;
}
