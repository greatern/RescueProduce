import {
	BelongsTo,
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
import { Delivery } from "./delivery";
import { BackupReceiver } from "./backup_receiver";
import { Claim } from "./claim";
import { Address } from "./address"; // NEW: Import Address model

@Table({
	tableName: "receivers",
	indexes: [
		{
			name: "receivers_user_id_index",
			fields: ["id"],
		},
	],
})
export class Receiver extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: true,
		defaultValue: false,
	})
	is_backup!: boolean;

	@Column({ type: DataType.STRING })
	public registration_number!: string;

	@Column({ type: DataType.FLOAT })
	public storage_capacity!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// These are connections to other tables

	// Forms a connection to the user table {1-1}
	@BelongsTo(() => User)
	user!: User;

	// Forms a connection to the delivery table {1-*}
	@HasMany(() => Delivery)
	delivery!: Delivery[];

	// Forms a connection to the claim table {1-*}
	@HasMany(() => Claim)
	food_claims!: Claim[];

	// Forms a connection to the backup_receiver table {1-*}
	@HasMany(() => BackupReceiver)
	backups!: BackupReceiver[];
}
