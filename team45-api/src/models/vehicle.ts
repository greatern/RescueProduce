import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	HasOne,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Volunteer } from "./volunteer";
import { VolunteerOrganisation } from "./volunteer_organisation"; // Import the new model

enum STATUS {
	AVAILABLE = "available",
	OFD = "OFD", // out for delivery
	UNAVAILABLE = "unavailable",
}

@Table({
	tableName: "vehicles",
})
export class Vehicle extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@Column({ type: DataType.STRING })
	make!: string;

	@Column({ type: DataType.STRING })
	model!: string;

	@Column({ type: DataType.STRING })
	vin_number!: string;

	@Column({ type: DataType.FLOAT })
	cargo_capacity!: number;

	@Column({ type: DataType.BOOLEAN })
	refrigeration!: boolean;

	@Column({ type: DataType.ENUM(...Object.values(STATUS)) })
	status!: STATUS;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Associations to other tables

	@ForeignKey(() => VolunteerOrganisation)
	@Column({ type: DataType.UUID, allowNull: true })
	organization_id?: string;

	@BelongsTo(() => VolunteerOrganisation)
	organization?: VolunteerOrganisation; // Forms a connection with the volunteer table {1-*}

	@HasOne(() => Volunteer)
	volunteer!: Volunteer;
}
