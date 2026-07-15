"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("UserAuthMetadata", {
			id: {
				type: Sequelize.UUID,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			last_login: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			email_verified: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			override_password: {
				type: Sequelize.STRING(64),
				allowNull: true,
				comment: "Temporarily stored password for admin override",
			},
			failed_login_attempts: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
				validate: { min: 0 },
			},
			last_failed_attempt: {
				// Added for security tracking
				type: Sequelize.DATE,
				allowNull: true,
			},
			password_changed_at: {
				// Added for security compliance
				type: Sequelize.DATE,
				allowNull: true,
			},
			mfa_enabled: {
				// Added for future MFA support
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
				defaultValue: Sequelize.literal(
					"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
				),
			},
		});

		// Add security indexes
		await queryInterface.addIndex("UserAuthMetadata", ["last_login"], {
			name: "idx_auth_last_login",
		});

		await queryInterface.addIndex(
			"UserAuthMetadata",
			["failed_login_attempts"],
			{
				name: "idx_auth_failed_attempts",
			}
		);

		await queryInterface.addIndex("UserAuthMetadata", ["last_failed_attempt"], {
			name: "idx_auth_last_failed",
		});

		// Add constraint for failed attempts
		await queryInterface.sequelize.query(`
      ALTER TABLE UserAuthMetadata
      ADD CONSTRAINT chk_failed_attempts
      CHECK (failed_login_attempts BETWEEN 0 AND 10)
    `);

		// Add password security trigger
		await queryInterface.sequelize.query(`
      CREATE TRIGGER before_auth_metadata_insert
      BEFORE INSERT ON UserAuthMetadata
      FOR EACH ROW
      BEGIN
        -- Clear override password if it exists
        SET NEW.override_password = NULL;
      END
    `);
	},

	down: async (queryInterface) => {
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS before_auth_metadata_insert
    `);

		await queryInterface.dropTable("UserAuthMetadata");
	},
};
