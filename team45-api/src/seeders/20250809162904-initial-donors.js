"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const users = await queryInterface.sequelize.query(
			`
        SELECT id, email FROM users WHERE user_type IN ('donor')
      `,
			{ type: Sequelize.QueryTypes.SELECT }
		);

		const freshDonor = users.find((u) => u.email === "fresh@email.com");
		const friendDonor = users.find((u) => u.email === "super@email.com");

		await queryInterface.bulkInsert("donors", [
			{
				id: freshDonor.id,
				tax_number: "9998 765 431",
			},
			{
				id: friendDonor.id,
				tax_number: "9998 765 432",
			},
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("donors", null, {});
	},
};
