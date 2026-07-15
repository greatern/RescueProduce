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
import { User } from "./user";
import { Admin } from "./admin";
import { Appeal } from "./appeal";

@Table({
  tableName: "blocklists",
  indexes: [
    { name: "blocklist_user_id_index", fields: ["user_id"] },
    { name: "blocklist_admin_id_index", fields: ["admin_id"] },
  ],
})
export class Blocklist extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.UUID })
  user_id!: string;

  @BelongsTo(() => User, "user_id")
  user!: User;

  @ForeignKey(() => Admin)
  @Column({ type: DataType.UUID, allowNull: false })
  admin_id!: string;

  @Column({ type: DataType.STRING })
  reason!: string;

  @Column({ type: DataType.DATE })
  date_blocked!: Date;

  @Column({ type: DataType.INTEGER })
  block_duration!: number;

  @Column({ type: DataType.STRING })
  appeal_status: string = "none";

@Column({
  type: DataType.BOOLEAN,
  allowNull: false,
  defaultValue: true
})
is_active!: boolean;


  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  @BelongsTo(() => Admin, "admin_id")
  admin!: Admin;
  

  @HasOne(() => Appeal)
  appeal!: Appeal;
}
