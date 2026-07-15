"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeColumn("claims", "status");
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.addColumn("claims", "status", {
			type: Sequelize.ENUM(
				"pending",
				"approved",
				"rejected",
				"fulfilled",
				"cancelled",
				"no_show"
			),
			allowNull: false,
			defaultValue: "pending",
		});
	},
};
