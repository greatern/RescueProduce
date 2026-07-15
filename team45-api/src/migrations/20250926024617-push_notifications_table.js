"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("push_subscriptions", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			endpoint: {
				type: Sequelize.STRING(1000),
				allowNull: false,
			},
			endpoint_hash: {
				type: Sequelize.STRING(64),
				allowNull: false,
				unique: true,
			},
			p256dhKey: {
				type: Sequelize.STRING(500),
				allowNull: false,
			},
			authKey: {
				type: Sequelize.STRING(500),
				allowNull: false,
			},
			user_agent: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
			device_type: {
				type: Sequelize.STRING(50),
				allowNull: true,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			last_used: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});

		await queryInterface.addIndex("push_subscriptions", ["user_id"]);
		await queryInterface.addIndex("push_subscriptions", ["endpoint_hash"]);
		await queryInterface.addIndex("push_subscriptions", ["isActive"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("push_subscriptions");
	},
};
