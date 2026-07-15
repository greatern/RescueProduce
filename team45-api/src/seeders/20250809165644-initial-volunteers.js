"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const users = await queryInterface.sequelize.query(
			`
        SELECT id, email FROM users WHERE user_type IN ('volunteer')
      `,
			{ type: Sequelize.QueryTypes.SELECT }
		);

		const jerryVol = users.find((u) => u.email === "jerry@email.com");
		const mildredVol = users.find((u) => u.email === "mild@email.com");
		const giftVol = users.find((u) => u.email === "gift@email.com");

		await queryInterface.bulkInsert("volunteers", [
			{
				id: jerryVol.id,
				license_number: "TH-10-DT-GP",
				license_expiry_date: new Date("2026-12-10"),
			},
			{
				id: mildredVol.id,
				license_number: "TH-10-VH-GP",
				license_expiry_date: new Date("2026-11-12"),
			},
			{
				id: giftVol.id,
				license_number: "TH-15-CD-GP",
				license_expiry_date: new Date("2026-10-12"),
			},
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("volunteers", null, {});
	},
};
