"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"Penalties",
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
						model: "Users",
						key: "id",
					},
					onDelete: "CASCADE",
					onUpdate: "CASCADE",
				},
				reason: {
					type: Sequelize.STRING(255),
					allowNull: false,
				},
				severity: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				points_deducted: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				effective_until: {
					type: Sequelize.DATE,
					allowNull: false,
				},
				issued_by_id: {
					type: Sequelize.UUID,
					allowNull: false,
					references: {
						model: "Users",
						key: "id",
					},
					onDelete: "CASCADE",
					onUpdate: "CASCADE",
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
			},
			{
				engine: "InnoDB",
				charset: "utf8mb4",
				collate: "utf8mb4_unicode_ci",
			}
		);

		// Add indexes
		await queryInterface.addIndex("Penalties", ["user_id"]);
		await queryInterface.addIndex("Penalties", ["issued_by_id"]);
		await queryInterface.addIndex("Penalties", ["effective_until"]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Penalties");
	},
};
