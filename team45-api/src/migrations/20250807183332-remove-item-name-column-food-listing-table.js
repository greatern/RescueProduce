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
		await queryInterface.removeColumn("foodListings", "item_name");
		await queryInterface.sequelize.query(`
        ALTER TABLE FoodListings
        MODIFY COLUMN quantity_type ENUM('boxes')
      `);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.addColumn("foodListings", "item_name", {
			type: Sequelize.STRING(255),
			allowNull: false,
		});
		await queryInterface.sequelize.query(`
        ALTER TABLE FoodListings
        MODIFY COLUMN quantity_type ENUM('kg', 'g', 'l', 'units', 'boxes')
      `);
	},
};
