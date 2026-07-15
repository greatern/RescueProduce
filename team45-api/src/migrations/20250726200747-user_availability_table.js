"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Create table
		await queryInterface.createTable("UserAvailabilities", {
			id: {
				type: Sequelize.UUID,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
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
			day_of_week: {
				type: Sequelize.ENUM(
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday",
					"Sunday"
				),
				allowNull: false,
			},
			start_time: {
				type: Sequelize.TIME,
				allowNull: false,
			},
			end_time: {
				type: Sequelize.TIME,
				allowNull: false,
			},
			timezone: {
				type: Sequelize.STRING(50),
				allowNull: false,
				defaultValue: "UTC",
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

		// Add indexes after table creation
		await queryInterface.addIndex("UserAvailabilities", ["user_id"], {
			name: "idx_user_availabilities_user",
		});

		await queryInterface.addIndex(
			"UserAvailabilities",
			["user_id", "day_of_week"],
			{
				unique: true,
				name: "idx_user_availabilities_day_unique",
			}
		);

		// Add time validation trigger
		await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_validate_avail_times
      BEFORE INSERT ON UserAvailabilities
      FOR EACH ROW
      BEGIN
        IF NEW.end_time <= NEW.start_time THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'End time must be after start time';
        END IF;
      END;
    `);
	},

	down: async (queryInterface) => {
		// Drop trigger
		await queryInterface.sequelize
			.query(
				`
      DROP TRIGGER IF EXISTS trg_validate_avail_times
    `
			)
			.catch(() => {});

		// Drop table - indexes will be automatically dropped with the table
		await queryInterface.dropTable("UserAvailabilities");
	},
};
