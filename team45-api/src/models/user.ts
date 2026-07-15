
import {
	BelongsToMany,
	Column,
	CreatedAt,
	DataType,
	HasMany, // <--- Keep HasMany
	HasOne, // <--- Remove or keep if other HasOne relationships are correct
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Address } from "./address";
import { Volunteer } from "./volunteer";
import { Rewards } from "./reward";
import { UserReward } from "./user_reward";
import { UserAvailability } from "./user_availability"; // Ensure this is imported
import { UserAuthMetadata } from "./user_auth_metadata";
import { Report } from "./report";
import { Receiver } from "./receiver";
import { Rating } from "./rating";
import { Penalty } from "./penalty";
import { Notification } from "./notification";
import { NoShowLog } from "./no_show_log";
import { Message } from "./message";
import { FraudCase } from "./fraud_case";
import { Donor } from "./donor";
import { Blocklist } from "./blocklist";
import { AuditLogs } from "./audit_logs";
import { Appeal } from "./appeal";
import { Admin } from "./admin";
import { TYPE } from "../dtos/userDto";
import { OtpCode } from "./otp_code";

@Table({
	tableName: "users",
	/*indexes: [
        {
            name: "address_id_index",
            fields: ["address_id"],
        },
    ],*/
})
export class User extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: uuidv4,
	})
	public id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public name!: string;

	@Column({
		type: DataType.STRING,
		unique: true,
		allowNull: false,
	})
	public email!: string;

	@Column({ type: DataType.STRING })
	public phone!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public password_hash!: string;

	@Column({ type: DataType.ENUM(...Object.values(TYPE)) })
	user_type!: TYPE;

	@Column({ type: DataType.DATE })
	public last_active!: Date;

	@Column({ type: DataType.INTEGER })
	public reputation_score: number = 0;

	@Column({ type: DataType.STRING })
	public status!: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	expo_push_token?: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	// These are connection to other tables

	// Forms a connection to the volunteer table {1-1}
	@HasOne(() => Volunteer, { foreignKey: "id", sourceKey: "id" })
	volunteer?: Volunteer;

	// Forms a connection to the receiver table {1-1}
	@HasOne(() => Receiver, { foreignKey: "id", sourceKey: "id" })
	receiver?: Receiver;

	// Forms a connection to the donor table {1-1}
	@HasOne(() => Donor, { foreignKey: "id", sourceKey: "id" })
	donor?: Donor;

	// Forms a connection to the admin table {1-1}
	@HasOne(() => Admin, { foreignKey: "id", sourceKey: "id" })
	admin?: Admin;

	// Forms a connection to the user_rewards which will allow
	// this enables a {*-*} relationship with the rewards table
	@BelongsToMany(() => Rewards, () => UserReward)
	rewards!: Rewards[];

	// this enables a {1-*} relationship with the address table
	@HasMany(() => Address)
	addresses!: Address[];

	/* NEW: Direct address relationship for claiming functionality
	@HasMany(() => Address, { foreignKey: 'user_id', as: 'userAddresses' })
	userAddresses!: Address[];*/

	// Forms a connection to the user_availability table {1-*}  <--- CHANGED TO HASMANY
	@HasMany(() => UserAvailability, { foreignKey: "user_id" }) // Specify foreignKey
	availability_slots?: UserAvailability[]; // <--- Changed property name for clarity (optional but good)

	// Forms a connection to the user_auth_metadata table {1-1}
	@HasOne(() => UserAuthMetadata)
	auth_metadata!: UserAuthMetadata;

	// Forms a connection to the reports table {1-*}
	@HasMany(() => Report)
	reports!: Report;

	// Forms a connection to the rating table {1-*}
	@HasMany(() => Rating)
	ratings!: Rating[];

	// Forms a connection to the penalty table {1-*}
	@HasMany(() => Penalty)
	penalties!: Penalty[];

	// Forms a connection to the notificatios table {1-*}
	@HasMany(() => Notification)
	notifications!: Notification[];

	// Forms a connection to the no_show_log table {1-*}
	@HasMany(() => NoShowLog)
	no_show_logs!: NoShowLog[];

	// Forms a connection to the message table {1-*}
	@HasMany(() => Message)
	messages!: Message[];

	// Forms a connection to the fraud_cases table {1-*}
	@HasMany(() => FraudCase)
	fraud_cases!: FraudCase[];

	// Forms a connection to the blocklist table {1-1}
	@HasOne(() => Blocklist)
	block!: Blocklist;

	// Forms a connection to the audit_logs table {1-*}
	@HasMany(() => AuditLogs)
	audit_logs!: AuditLogs[];

	// Forms a connection to the appeal table {1-*}
	@HasMany(() => Appeal)
	appeals!: Appeal[];

	// Forms a connection to the otp table
	@HasMany(() => OtpCode)
	otp_codes!: OtpCode[];

	async getDonor(): Promise<Donor | null> {
		const donor = await Donor.findOne({
			where: {
				id: this.id,
			},
		});
		if (donor) this.donor = donor;
		return donor;
	}
}
