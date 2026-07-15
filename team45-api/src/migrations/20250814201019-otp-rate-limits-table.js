"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("otp_rate_limits", {
			id: {
				type: Sequelize.DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			identifier: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
			limit_type: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
			request_count: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			window_start: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
			window_duration: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 3600,
			},
			created_at: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
			},
		});

		await queryInterface.addIndex("otp_rate_limits", [
			"identifier",
			"limit_type",
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("otp_rate_limits");
	},
};
