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
import { User } from "./user";

@Table({
	tableName: "Proximities",
	underscored: true,
})
export class Proximity extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	user_a_id!: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	user_b_id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	user_a_type!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	user_b_type!: string;

	@Column({
		type: DataType.FLOAT,
		allowNull: true,
	})
	distance!: number;

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	duration!: number;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Association references
	@BelongsTo(() => User, "user_a_id")
	userA!: User;

	@BelongsTo(() => User, "user_b_id")
	userB!: User;
}
