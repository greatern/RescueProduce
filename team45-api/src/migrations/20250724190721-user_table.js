"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Users", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			password_hash: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			user_type: {
				type: Sequelize.ENUM("volunteer", "receiver", "donor", "admin"),
			},
			last_active: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			verified: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			reputation_score: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			status: {
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

		await queryInterface.addIndex("Users", ["email"], { unique: true });
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Users");
	},
};
