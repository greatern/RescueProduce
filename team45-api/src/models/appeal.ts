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
import { Blocklist } from "./blocklist";
import { Admin } from "./admin";

@Table({
  tableName: "appeals",
  indexes: [
    { name: "appeals_user_id_index", fields: ["user_id"] },
    { name: "block_id_index", fields: ["block_id"] },
    { name: "admin_reviewer_id_index", fields: ["admin_reviewer_id"] },
  ],
})
export class Appeal extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  public id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  public user_id!: string;

  @BelongsTo(() => User, "user_id")
  user!: User;

  @ForeignKey(() => Blocklist)
  @Column({ type: DataType.UUID })
  public block_id!: string;

  @BelongsTo(() => Blocklist, "block_id")
  block!: Blocklist;

  @ForeignKey(() => Admin)
  @Column({ type: DataType.UUID, allowNull: true }) // optional until reviewed
  public admin_reviewer_id!: string;

  @BelongsTo(() => Admin, "admin_reviewer_id")
  admin!: Admin;

  @Column({ type: DataType.TEXT, allowNull: true })
  public appeal_reason!: string;

  @Column({ type: DataType.JSON, allowNull: true })
  public evidence_files!: string[]; // store uploaded file paths

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  public submission_date!: Date;

  @Column({ type: DataType.ENUM("pending", "approved", "rejected"), defaultValue: "pending" })
  public status!: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  public priority!: number;

  @Column({ type: DataType.DATE, allowNull: true })
  public decision_date!: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  public decision_notes!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
