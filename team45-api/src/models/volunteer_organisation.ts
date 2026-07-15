import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Vehicle } from "./vehicle";
//import { Volunteer } from "./volunteer";

@Table({
	tableName: "volunteer_organisation",
})
export class VolunteerOrganisation extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	org_name!: string;

	@Column({
		type: DataType.DOUBLE,
		allowNull: false,
	})
	service_area_km!: number;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	contact_email!: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	contact_phone!: string;
	// connections to other tables

	// the volunteer table {1-*}
	//@HasMany(() => Volunteer)
	//volunteers!: Volunteer[];

	// the vehicle table
	@HasMany(() => Vehicle)
	vehicles!: Vehicle[];
}
