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
import { Claim } from "./claim";
import { User } from "./user";

@Table({
	tableName: "noShowLogs",
	indexes: [
		{ name: "no_show_logs_user_id_index", fields: ["user_id"] },
		{ name: "claim_id_index", fields: ["claim_id"] },
	],
})
export class NoShowLog extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
		allowNull: false,
	})
	user_id!: string;

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "user_id")
	user!: User;

	@ForeignKey(() => Claim)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
		allowNull: false,
	})
	claim_id!: string;

	// Forms a connection to the claim table {1-*}
	@BelongsTo(() => Claim, "claim_id")
	claim!: Claim;

	@Column({ type: DataType.DATE })
	incident_date!: Date;

	@Column({ type: DataType.TEXT })
	reason?: string;

	@Column({ type: DataType.INTEGER })
	penalty_points!: number;

	@Column({ type: DataType.BOOLEAN })
	admin_reviewed: boolean = false;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
