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

enum ActionType {
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	LOGIN = "login",
	LOGOUT = "logout",
	ACCESSDENIED = "access_denied",
	SYSTEM = "system",
}

@Table({
	tableName: "auditlogs",
	indexes: [
		{
			name: "audit_logs_user_id_index",
			fields: ["user_id"],
		},
	],
})
export class AuditLogs extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	user_id!: string;

	@BelongsTo(() => User)
	user!: User;

	@Column({
		type: DataType.ENUM(...Object.values(ActionType)),
		allowNull: false,
	})
	action_type!: ActionType;

	@Column({
		type: DataType.STRING(50),
		allowNull: true,
	})
	entity_type!: string | null;

	@Column({
		type: DataType.STRING(36),
		allowNull: true,
	})
	entity_id!: string | null;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Virtual field for formatted output
	@Column({
		type: DataType.VIRTUAL,
		get() {
			const self = this as AuditLogs;
			return `${self.action_type.toUpperCase()} ${
				self.entity_type || "system"
			}`;
		},
	})
	event_description!: string;
}
