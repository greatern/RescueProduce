import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	HasMany,
	HasOne,
	Model,
	PrimaryKey,
	Table,
	Unique,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user";
import { Report } from "./report";
import { Appeal } from "./appeal";

@Table({
	tableName: "admins",
	indexes: [
		{
			name: "admin_user_id_index",
			fields: ["id"],
		},
	],
})
export class Admin extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@Column({ type: DataType.STRING })
	public permissions_level!: string;

	@Column({ type: DataType.DATE })
	public date_appointed!: Date;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// These are connections to other tables

	// Forms a connection to the _ table {1-*}
	@BelongsTo(() => User, "id")
	user!: User;

	@HasMany(() => Report)
	reports!: Report[];

	// Forms a connection to the _ table {1-*}
	@HasMany(() => Appeal)
	appeals!: Appeal[];
}
