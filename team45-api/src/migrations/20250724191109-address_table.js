"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Addresses", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			address_line1: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			address_line2: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			city: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			province: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			postal_code: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			country: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			latitude: {
				type: Sequelize.DECIMAL(10, 8),
				allowNull: true,
			},
			longitude: {
				type: Sequelize.DECIMAL(11, 8),
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

		// Recommended indexes
		await queryInterface.addIndex("Addresses", ["postal_code"]);
		await queryInterface.addIndex("Addresses", ["country"]);
		await queryInterface.addIndex("Addresses", ["city"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Addresses");
	},
};
