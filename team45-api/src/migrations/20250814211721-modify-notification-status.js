"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn(
			"notifications",
			"notification_type",
			{
				type: Sequelize.STRING,
				allowNull: false,
			}
		);

		await queryInterface.changeColumn(
			"notifications",
			"notification_type",
			{
				type: Sequelize.ENUM(
					"system",
					"donation",
					"delivery",
					"allocation",
					"account",
					"info",
					"alert"
				),
				allowNull: false,
			}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn(
			"notifications",
			"notification_type",
			{
				type: Sequelize.STRING,
				allowNull: false,
			}
		);

		await queryInterface.changeColumn(
			"notifications",
			"notification_type",
			{
				type: Sequelize.ENUM("info", "alert", "system"),
				allowNull: false,
			}
		);
	},
};
