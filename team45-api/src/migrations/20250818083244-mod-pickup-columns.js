"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.renameColumn(
			"pickups",
			"schechuled_pickup_time",
			"scheduled_pickup_time"
		);
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.renameColumn(
			"pickups",
			"scheduled_pickup_time",
			"schechuled_pickup_time"
		);
	},
};
