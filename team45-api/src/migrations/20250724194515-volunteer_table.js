"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Volunteers", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "Users", // Consistent syntax
					key: "id", // Consistent syntax
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			organization_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "VolunteerOrganisations", // Corrected model name
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			vehicle_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Vehicles", // Consistent syntax
					key: "id", // Consistent syntax
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			license_number: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true, // MySQL handles NULLs differently
			},
			license_expiry_date: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			reputation_score: {
				type: Sequelize.INTEGER,
				defaultValue: 100,
				allowNull: false, // Should not be null
			},
			last_delivery: {
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
				defaultValue: Sequelize.literal(
					"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
				),
			},
		});

		// MySQL-compatible indexes
		await queryInterface.addIndex("Volunteers", ["license_expiry_date"]);
		await queryInterface.addIndex("Volunteers", ["reputation_score"]);
		await queryInterface.addIndex("Volunteers", ["last_delivery"]);
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("Volunteers");
	},
};
