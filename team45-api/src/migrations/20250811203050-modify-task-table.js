"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn("Tasks", "status", {
			type: Sequelize.STRING,
			allowNull: false,
		});

		await queryInterface.sequelize.query(`
            UPDATE Tasks SET status = 'confirmed' WHERE status = 'available';
        `);
		await queryInterface.sequelize.query(`
            UPDATE Tasks SET status = 'ready' WHERE status = 'assigned';
        `);

		await queryInterface.changeColumn("Tasks", "status", {
			type: Sequelize.ENUM(
				"pending",
				"confirmed",
				"ready",
				"en_route",
				"collected",
				"completed",
				"cancelled",
				"missed"
			),
			allowNull: false,
			defaultValue: "pending",
		});

		await queryInterface.addColumn("tasks", "distance", {
			type: Sequelize.FLOAT,
			allowNull: true,
		});

		// MySQl trigger for status updates
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_task_status
			BEFORE UPDATE ON Tasks
			FOR EACH ROW
			BEGIN
				DECLARE now_date DATETIME;
				SET now_date = NOW();

				-- Check if due date is passed
				IF now_date > NEW.due_date AND NEW.status <> 'completed' THEN
					SET NEW.status = 'missed';
				END IF;
			END
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn("Tasks", "status", {
			type: Sequelize.ENUM(
				"pending",
				"available",
				"assigned",
				"en_route",
				"completed",
				"cancelled"
			),
			allowNull: false,
			defaultValue: "pending",
		});

		await queryInterface.removeColumn("tasks", "distance");

		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_task_status
			`);
	},
};
