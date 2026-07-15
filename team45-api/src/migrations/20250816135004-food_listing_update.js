"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeColumn("foodListings", "original_quantity");
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_original_quantity
    `);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.addColumn("foodlistings", "original_quantity", {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0,
		});

		// MySQL trigger for original_quantity
		await queryInterface.sequelize.query(`
      CREATE TRIGGER set_original_quantity
      BEFORE INSERT ON FoodListings
      FOR EACH ROW
      SET NEW.original_quantity = 
        COALESCE(NEW.original_quantity, NEW.posted_quantity)
    `);
	},
};
