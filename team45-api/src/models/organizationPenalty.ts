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
import { Volunteer } from "./volunteer";
import { Delivery } from "./delivery";
import { VolunteerOrganisation } from "./volunteer_organisation";

enum PenaltyType {
	NO_SHOW = "no_show",
	LATE_DELIVERY = "late_delivery",
	POOR_SERVICE = "poor_service",
	SAFETY_VIOLATION = "safety_violation",
	DOCUMENTATION_MISSING = "documentation_missing",
	OTHER = "other",
}

enum PenaltyStatus {
	ACTIVE = "active",
	DISPUTED = "disputed",
	RESOLVED = "resolved",
	WAIVED = "waived",
}

@Table({
	tableName: "organizationPenalties",
	timestamps: false,
})
export class OrganizationPenalty extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
		allowNull: false,
	})
	id!: string;

	@ForeignKey(() => VolunteerOrganisation)
	@Column({ type: DataType.UUID, allowNull: false })
	organization_id!: string;

	@ForeignKey(() => Volunteer)
	@Column({ type: DataType.UUID, allowNull: true })
	volunteer_id?: string;

	@ForeignKey(() => Delivery)
	@Column({ type: DataType.UUID, allowNull: true })
	delivery_id?: string;

	@Column({
		type: DataType.ENUM(...Object.values(PenaltyType)),
		allowNull: false,
	})
	penalty_type!: PenaltyType;

	@Column({ type: DataType.INTEGER, allowNull: false })
	penalty_points!: number;

	@Column({ type: DataType.TEXT, allowNull: false })
	description!: string;

	@Column({
		type: DataType.ENUM(...Object.values(PenaltyStatus)),
		defaultValue: PenaltyStatus.ACTIVE,
	})
	status!: PenaltyStatus;

	@Column({ type: DataType.TEXT })
	dispute_reason?: string;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID })
	resolved_by?: string;

	@Column({ type: DataType.DATE })
	resolved_at?: Date;

	@Column({ type: DataType.DATE })
	expires_at?: Date;

	@Column({
		type: DataType.DATE,
		allowNull: false,
		defaultValue: DataType.NOW,
	})
	createdAt!: Date;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID, allowNull: false })
	created_by!: string;

	// Associations
	@BelongsTo(() => VolunteerOrganisation)
	organization?: VolunteerOrganisation;

	@BelongsTo(() => Volunteer)
	volunteer?: Volunteer;

	@BelongsTo(() => Delivery)
	delivery?: Delivery;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID }) // CHANGED: Use UUID to match users table
	verified_by?: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;
}
