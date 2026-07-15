import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import {v4 as uuidv4} from "uuid";
import {User} from "./user";

@Table({
    tableName: "messages",
    indexes: [
        {name: "sender_id_index", fields: ["sender_id"]},
        {name: "receiver_id_index", fields: ["receiver_id"]},
    ],
})
export class Message extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: uuidv4,
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    sender_id!: string;

    // Forms a connection to the user table {1-*}
    @BelongsTo(() => User, "sender_id")
    sender!: User;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    receiver_id!: string;

    // Forms a connection to the user table {1-*}
    @BelongsTo(() => User, "receiver_id")
    receiver!: User;

    @Column({type: DataType.STRING})
    subject!: string;

    @Column({type: DataType.STRING})
    body!: string;

    @Column({type: DataType.BOOLEAN})
    is_read!: boolean;
}
