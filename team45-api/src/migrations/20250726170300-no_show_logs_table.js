"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"NoShowLogs",
			{
				id: {
					type: Sequelize.UUID,
					primaryKey: true,
					defaultValue: Sequelize.UUIDV4,
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
				claim_id: {
					type: Sequelize.UUID,
					allowNull: false,
					references: {
						model: "claims",
						key: "id",
					},
					onUpdate: "CASCADE",
					onDelete: "CASCADE",
				},
				incident_date: {
					type: Sequelize.DATE,
					allowNull: false,
				},
				reason: {
					type: Sequelize.TEXT,
					allowNull: true,
				},
				penalty_points: {
					type: Sequelize.INTEGER,
					allowNull: false,
				},
				admin_reviewed: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: false,
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
			},
			{
				engine: "InnoDB",
				charset: "utf8mb4",
				collate: "utf8mb4_unicode_ci",
			}
		);

		// Add indexes for foreign keys
		await queryInterface.addIndex("NoShowLogs", ["user_id"]);
		await queryInterface.addIndex("NoShowLogs", ["claim_id"]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("NoShowLogs");
	},
};
