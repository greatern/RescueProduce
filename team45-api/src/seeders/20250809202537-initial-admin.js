"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const users = await queryInterface.sequelize.query(
			`
        SELECT id, email FROM users WHERE user_type IN ('admin')
      `,
			{ type: Sequelize.QueryTypes.SELECT }
		);
		const admin = users.find((u) => u.email === "admin@email.com");

		await queryInterface.bulkInsert("admins", [
			{
				id: admin.id,
				permissions_level: "",
				date_appointed: new Date(),
			},
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("admins", null, {});
	},
};
