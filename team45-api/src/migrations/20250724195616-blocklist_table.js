"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Blocklists", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
			},
			admin_id: {
				type: Sequelize.UUID,
				allowNull: false,
			},
			reason: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			date_blocked: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			block_duration: {
				type: Sequelize.ENUM("NONE", "PENDING", "APPROVED", "REJECTED"),
				defaultValue: "NONE",
				allowNull: false,
				validate: { min: 0 }, // Duration in days (0 = permanent)
			},
			appeal_status: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: "none",
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

		// Add foreign keys
		await queryInterface.addConstraint("Blocklists", {
			fields: ["user_id"],
			type: "foreign key",
			name: "fk_blocklist_user",
			references: {
				table: "Users",
				field: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		});

		await queryInterface.addConstraint("Blocklists", {
			fields: ["admin_id"],
			type: "foreign key",
			name: "fk_blocklist_admin",
			references: {
				table: "Admins",
				field: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "RESTRICT",
		});

		// Add indexes
		await queryInterface.addIndex("Blocklists", ["user_id"], {
			unique: true,
		});
		await queryInterface.addIndex("Blocklists", ["admin_id"]);
		await queryInterface.addIndex("Blocklists", ["date_blocked"]);
		await queryInterface.addIndex("Blocklists", ["appeal_status"]);
	},

	down: async (queryInterface, Sequelize) => {
		// Remove constraints first
		await queryInterface.removeConstraint("Blocklists", "fk_blocklist_admin");
		await queryInterface.removeConstraint("Blocklists", "fk_blocklist_user");
		await queryInterface.dropTable("Blocklists");
	},
};
