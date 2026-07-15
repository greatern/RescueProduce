"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("AuditLogs", {
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
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			action_type: {
				type: Sequelize.ENUM(
					"create",
					"update",
					"delete",
					"login",
					"logout",
					"access_denied",
					"system"
				),
				allowNull: false,
			},
			entity_type: {
				type: Sequelize.STRING(50),
				allowNull: true,
			},
			entity_id: {
				type: Sequelize.STRING(36),
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("AuditLogs");
	},
};
