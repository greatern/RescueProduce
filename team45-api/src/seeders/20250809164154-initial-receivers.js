"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const users = await queryInterface.sequelize.query(
			`
        SELECT id, email FROM users WHERE user_type IN ('receiver')
      `,
			{ type: Sequelize.QueryTypes.SELECT }
		);

		const helpReceiver = users.find((u) => u.email === "help@email.com");
		const kidsReceiver = users.find((u) => u.email === "kids@email.com");

		await queryInterface.bulkInsert("receivers", [
			{
				id: helpReceiver.id,
				registration_number: "000-224 NPO",
				storage_capacity: 10000,
			},
			{
				id: kidsReceiver.id,
				registration_number: "000-225 NPO",
				storage_capacity: 10000,
			},
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("receivers", null, {});
	},
};
