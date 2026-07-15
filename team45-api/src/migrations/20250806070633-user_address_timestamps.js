"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		await queryInterface.addColumn("UserAddresses", "created_at", {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		});

		await queryInterface.addColumn("UserAddresses", "updated_at", {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal(
				"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
			),
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("UserAddresses", "created_at");
		await queryInterface.removeColumn("UserAddresses", "updated_at");
	},
};
