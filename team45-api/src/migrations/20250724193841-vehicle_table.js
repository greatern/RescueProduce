"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Vehicles", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			make: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			model: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			vin_number: {
				type: Sequelize.STRING(17),
				allowNull: false,
				unique: true,
			},
			cargo_capacity: {
				type: Sequelize.FLOAT,
				allowNull: false,
				validate: { min: 0 },
			},
			refrigeration: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM(
					"ACTIVE",
					"INACTIVE",
					"UNDER_MAINTENANCE",
					"RETIRED"
				),
				allowNull: false,
				defaultValue: "ACTIVE",
			},
			organization_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "VolunteerOrganisations",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
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

		// Add indexes
		await queryInterface.addIndex("Vehicles", ["make", "model"]);
		await queryInterface.addIndex("Vehicles", ["cargo_capacity"]);
		await queryInterface.addIndex("Vehicles", ["refrigeration"]);
		await queryInterface.addIndex("Vehicles", ["status"]);
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("Vehicles");
	},
};
