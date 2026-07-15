"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Appeals", {
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
			block_id: {
				type: Sequelize.UUID,
				allowNull: false,
				unique: true,
				references: {
					model: "Blocklists",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			admin_reviewer_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Admins", // Corrected to consistent syntax
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			appeal_reason: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			submission_date: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			status: {
				type: Sequelize.ENUM(
					"PENDING",
					"UNDER_REVIEW",
					"APPROVED",
					"REJECTED",
					"WITHDRAWN"
				),
				defaultValue: "PENDING",
			},
			priority: {
				type: Sequelize.INTEGER,
				defaultValue: 3,
				allowNull: false, // Should not be nullable
			},
			decision_date: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			decision_notes: {
				type: Sequelize.TEXT,
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
				// Removed ON UPDATE for MySQL compatibility
			},
		});

		// Add indexes
		await queryInterface.addIndex("Appeals", ["user_id"]);
		await queryInterface.addIndex("Appeals", ["block_id"], { unique: true });
		await queryInterface.addIndex("Appeals", ["admin_reviewer_id"]);
		await queryInterface.addIndex("Appeals", ["status"]);
		await queryInterface.addIndex("Appeals", ["submission_date"]);
	},

	down: async (queryInterface) => {
		// Simplified down migration
		await queryInterface.dropTable("Appeals");
	},
};
