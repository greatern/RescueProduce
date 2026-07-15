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
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user";
import { Delivery } from "./delivery";
import { Vehicle } from "./vehicle";
import { VolunteerOrganisation } from "./volunteer_organisation";

@Table({
	tableName: "volunteers",
})
export class Volunteer extends Model {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
		allowNull: false,
	})
	id!: string;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: true,
		defaultValue: false,
	})
	is_backup!: boolean;

	@ForeignKey(() => VolunteerOrganisation)
	@Column({
		type: DataType.UUID,
		allowNull: true,
	})
	organization_id?: string;

	@ForeignKey(() => Vehicle)
	@Column({
		type: DataType.UUID,
		allowNull: true,
		unique: true,
	})
	vehicle_id?: string;
	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	license_number!: string;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	license_expiry_date!: Date;

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
		defaultValue: 100,
	})
	reputation_score?: number;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	last_delivery?: Date;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// Availability will be moved to a separate table to consider the fact
	// that we care about the availability of other users besides the volunteer
	/*@Column({
        type: DataType.JSON,
        allowNull: true,
        defaultValue: {},
    })
    availability_schedule?: object; // This will be the days of the week*/

	// These are for connections to other tables

	// Forms a connection to the user table {1-1}
	@BelongsTo(() => User, "id")
	user!: User;

	@BelongsTo(() => VolunteerOrganisation, "organization_id")
	organization!: VolunteerOrganisation;

	// Forms a connection to the volunteer table {1-1}
	@BelongsTo(() => Vehicle)
	vehicles?: Vehicle;

	// Forms a connection to the delivery table {1-*}
	@HasMany(() => Delivery)
	deliveries?: Delivery[];
}
