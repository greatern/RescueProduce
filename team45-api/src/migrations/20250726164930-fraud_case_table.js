"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("FraudCases", {
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
				onDelete: "RESTRICT",
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
			evidence_details: {
				type: Sequelize.TEXT,
				allowNull: false,
				set(value) {
					// Basic sanitization
					const sanitized = value.replace(/<[^>]*>?/gm, "");
					this.setDataValue("evidence_details", sanitized);
				},
			},
			status: {
				type: Sequelize.ENUM(
					"reported",
					"under_investigation",
					"confirmed",
					"dismissed",
					"resolved"
				),
				allowNull: false,
				defaultValue: "reported",
			},
			severity_level: {
				type: Sequelize.ENUM("low", "medium", "high", "critical"),
				allowNull: false,
				defaultValue: "medium",
			},
			date_reported: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			date_resolved: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			resolution_details: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			investigation_notes: {
				type: Sequelize.JSON,
				allowNull: true,
				defaultValue: [],
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

		// Add indexes
		await queryInterface.addIndex("FraudCases", ["user_id"], {
			name: "fraud_cases_user_idx",
		});

		await queryInterface.addIndex("FraudCases", ["reporter_id"], {
			name: "fraud_cases_reporter_idx",
		});

		await queryInterface.addIndex("FraudCases", ["status"], {
			name: "fraud_cases_status_idx",
		});

		await queryInterface.addIndex("FraudCases", ["severity_level"], {
			name: "fraud_cases_severity_idx",
		});

		await queryInterface.addIndex("FraudCases", ["date_reported"], {
			name: "fraud_cases_reported_date_idx",
		});

		// Add full-text search for evidence
		await queryInterface.sequelize.query(`
      ALTER TABLE FraudCases
      ADD COLUMN searchable_evidence TEXT GENERATED ALWAYS AS (
        CONCAT_WS(' ',
          evidence_details,
          COALESCE(resolution_details, '')
        )
      ) STORED
    `);

		await queryInterface.addIndex("FraudCases", ["searchable_evidence"], {
			type: "FULLTEXT",
			name: "fraud_cases_evidence_search_idx",
		});

		// Add trigger for status changes
		/* await queryInterface.sequelize.query(`
      CREATE TRIGGER after_fraud_case_status_change
      AFTER UPDATE ON FraudCases
      FOR EACH ROW
      BEGIN
        IF NEW.status <> OLD.status THEN
          -- Log to audit table
          INSERT INTO audit_logs (
            user_id,
            action_type,
            entity_type,
            entity_id,
            metadata
          ) VALUES (
            NEW.reporter_id,
            'fraud_status_change',
            'FraudCase',
            NEW.id,
            JSON_OBJECT(
              'old_status', OLD.status,
              'new_status', NEW.status,
              'severity', NEW.severity_level
            )
          );
          
          -- Auto-resolve if dismissed
          IF NEW.status = 'dismissed' THEN
            UPDATE FraudCases 
            SET 
              date_resolved = NOW(),
              resolution_details = 'Automatically resolved upon dismissal'
            WHERE id = NEW.id;
          END IF;
        END IF;
      END
    `); */
	},

	down: async (queryInterface, Sequelize) => {
		// Remove trigger first
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_fraud_case_status_change
    `);

		// Drop table
		await queryInterface.dropTable("FraudCases");
	},
};
