"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Donors", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
				allowNull: false,
			},
			tax_number: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			health_certification_url: {
				type: Sequelize.STRING,
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

		// Add indexes
		await queryInterface.addIndex("Donors", ["tax_number"], {
			unique: true,
			where: { tax_number: { [Sequelize.Op.ne]: null } },
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Donors");
	},
};
