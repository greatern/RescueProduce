"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("foodlistings", "cutoff_pickup_time", {
			type: Sequelize.TIME,
			allowNull: false,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("foodlistings", "cutoff_pickup_time");
	},
};
