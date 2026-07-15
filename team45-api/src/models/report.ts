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
import { Admin } from "./admin";

@Table({
	tableName: "reports",
	indexes: [
		{ name: "reporter_id_index", fields: ["reporter_id"] },
		{ name: "reported_id_index", fields: ["reported_id"] },
		{ name: "admin_assigned_id_index", fields: ["admin_assigned_id"] },
	],
})
export class Report extends Model {
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
	reporter_id!: string;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataType.UUID,
	})
	reported_id!: string;

	@ForeignKey(() => Admin)
	@Column({
		type: DataType.UUID,
	})
	admin_assigned_id?: string;

	@Column({ type: DataType.STRING })
	report_type!: string;

	@Column({ type: DataType.STRING })
	description!: string;

	@Column({ type: DataType.STRING })
	status!: string;

	@Column({ type: DataType.STRING })
	resolution_notes?: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// connections to other tables

	// Forms a connection to the user table {1-*} {we will need a corresponding connection in the User class}
	@BelongsTo(() => User, "reporter_id")
	reporter!: User;

	// Forms a connection to the admin table
	@BelongsTo(() => Admin, "admin_assigned_id")
	admin!: Admin;

	// Forms a connection to the user table {1-*}
	@BelongsTo(() => User, "reported_id")
	reported!: User;
}
