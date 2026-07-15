"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Reports", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			reporter_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			reported_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			admin_assigned_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "Admins",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			report_type: {
				type: Sequelize.ENUM(
					"spam",
					"inappropriate_behavior",
					"fraud",
					"safety_concern",
					"fake_listing",
					"other"
				),
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false,
				set(value) {
					// Basic sanitization
					const sanitized = value.replace(/<[^>]*>?/gm, "");
					this.setDataValue("description", sanitized);
				},
			},
			status: {
				type: Sequelize.ENUM(
					"pending",
					"under_review",
					"resolved",
					"dismissed",
					"escalated"
				),
				allowNull: false,
				defaultValue: "pending",
			},
			resolution_notes: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			evidence_urls: {
				type: Sequelize.JSON,
				allowNull: true,
				defaultValue: [],
			},
			severity: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 2, // 1=Low, 5=Critical
				validate: { min: 1, max: 5 },
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
			resolved_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		});

		// Add indexes
		await queryInterface.addIndex("Reports", ["reporter_id"]);
		await queryInterface.addIndex("Reports", ["reported_id"]);
		await queryInterface.addIndex("Reports", ["admin_assigned_id"]);
		await queryInterface.addIndex("Reports", ["status"]);
		await queryInterface.addIndex("Reports", ["report_type"]);
		await queryInterface.addIndex("Reports", ["severity"]);
		await queryInterface.addIndex("Reports", ["created_at"]);
		await queryInterface.addIndex("Reports", ["status", "severity"]);

		// Add trigger for resolved_at timestamp
		await queryInterface.sequelize.query(`
      CREATE TRIGGER set_resolved_timestamp
      BEFORE UPDATE ON Reports
      FOR EACH ROW
      BEGIN
        IF NEW.status IN ('resolved', 'dismissed') 
        AND OLD.status NOT IN ('resolved', 'dismissed') THEN
          SET NEW.resolved_at = NOW();
        END IF;
      END
    `);
	},

	down: async (queryInterface, Sequelize) => {
		// Remove trigger first
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_resolved_timestamp
    `);

		// Drop table
		await queryInterface.dropTable("Reports");
	},
};
