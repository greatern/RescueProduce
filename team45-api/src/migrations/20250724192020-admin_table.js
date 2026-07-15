"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Admins", {
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
			permissions_level: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			date_appointed: {
				type: Sequelize.DATE,
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
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		await queryInterface.addIndex("Admins", ["permissions_level"]);
		await queryInterface.addIndex("Admins", ["date_appointed"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Admins");
	},
};
