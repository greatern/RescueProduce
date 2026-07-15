"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"Notifications",
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
				title: {
					type: Sequelize.STRING(255),
					allowNull: false,
				},
				message: {
					type: Sequelize.TEXT,
					allowNull: false,
				},
				notification_type: {
					type: Sequelize.ENUM("info", "alert", "system"),
					allowNull: false,
				},
				related_entity_type: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				related_entity_id: {
					type: Sequelize.UUID,
					allowNull: false,
				},
				is_read: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: false,
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
				charset: "utf8mb4",
				collate: "utf8mb4_unicode_ci",
			}
		);

		// Add indexes (using your preferred casing)
		await queryInterface.addIndex("Notifications", ["user_id"]);
		await queryInterface.addIndex("Notifications", ["is_read"]);
		await queryInterface.addIndex("Notifications", ["created_at"]);
		await queryInterface.addIndex(
			"Notifications",
			["related_entity_type", "related_entity_id"],
			{
				name: "notifications_entity_composite_idx",
			}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Notifications");
	},
};
