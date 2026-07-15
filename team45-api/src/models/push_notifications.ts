import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "push_subscriptions",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class PushSubscription extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,  // Must match User.id type!
    allowNull: false,
  })
  user_id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  endpoint!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  p256dhKey!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  authKey!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  user_agent?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  device_type?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  last_used!: Date;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
  
   static async findByEndpoint(endpoint: string) {
    return await PushSubscription.findOne({ where: { endpoint } });
  }
}
