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
		await queryInterface.sequelize.query(`
      ALTER TABLE Claims 
      MODIFY COLUMN status ENUM(
        'pending',
        'picked_up',
        'fulfilled',
        'cancelled',
        'no_show',
        'rejected'
      ) NOT NULL DEFAULT 'pending';
      `);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.sequelize.query(`
      ALTER TABLE CLAIMS 
      MODIFY COLUMN status ENUM(
        'pending',
        'approved',
        'rejected',
        'fulfilled',
        'cancelled',
        'no_show'
      ) NOT NULL DEFAULT 'pending';
      `);
	},
};
