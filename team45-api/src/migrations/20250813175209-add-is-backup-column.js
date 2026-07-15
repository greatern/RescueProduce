"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("receivers", "is_backup", {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		});

		await queryInterface.addColumn("volunteers", "is_backup", {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("receivers", "is_backup");
		await queryInterface.removeColumn("volunteers", "is_backup");
	},
};
