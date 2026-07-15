"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("pickups", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			donor_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "donors",
					key: "id",
				},
			},
			task_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "tasks",
					key: "id",
				},
			},
			schechuled_pickup_time: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			actual_pickup_time: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			pickup_status: {
				type: Sequelize.ENUM(
					"scheduled",
					"confirmed",
					"in_progress",
					"completed",
					"missed",
					"cancelled"
				),
				defaultValue: "scheduled",
				allowNull: false,
			},
			confirmation_code: {
				type: Sequelize.STRING(10),
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal(
					"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
				),
			},
		});

		await queryInterface.addIndex("pickups", ["donor_id"]);
		await queryInterface.addIndex("pickups", ["task_id"]);
		await queryInterface.addIndex("pickups", ["pickup_status"]);
		await queryInterface.addIndex("pickups", ["schechuled_pickup_time"]);

		await queryInterface.addIndex("pickups", ["donor_id", "task_id"], {
			unique: true,
			name: "unique_donor_task_pickup",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("pickups");
	},
};
