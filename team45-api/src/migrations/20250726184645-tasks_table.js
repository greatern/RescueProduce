"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("tasks", {
			id: {
				type: Sequelize.UUID,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			task_type: {
				type: Sequelize.ENUM("delivery", "pickup"),
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM(
					"pending",
					"available",
					"assigned",
					"en_route",
					"completed",
					"cancelled"
				),
				allowNull: false,
			},
			due_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			assigned_volunteer_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Volunteers",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			assigned_receiver_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Receivers",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			title: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			pickup_address_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Addresses",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			destination_address_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Addresses",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			pickup_time: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			dropoff_time: {
				type: Sequelize.DATE,
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
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add foreign key indexes
		await queryInterface.addIndex("tasks", ["assigned_volunteer_id"]);
		await queryInterface.addIndex("tasks", ["assigned_receiver_id"]);
		await queryInterface.addIndex("tasks", ["pickup_address_id"]);
		await queryInterface.addIndex("tasks", ["destination_address_id"]);
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("tasks");
	},
};
