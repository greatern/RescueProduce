"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Receivers", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			registration_number: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true, // MySQL handles NULLs differently
			},
			storage_capacity: {
				type: Sequelize.FLOAT,
				allowNull: true,
			},
			verified: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
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

		// MySQL-compatible index approach
		await queryInterface.addIndex("Receivers", ["verified"]);
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("Receivers");
	},
};
