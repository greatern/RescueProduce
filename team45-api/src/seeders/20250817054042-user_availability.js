"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const usersResult = await queryInterface.sequelize.query(
			`SELECT id FROM Users`
		);
		const users = usersResult[0];

		const days_of_week = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			for (let n = 0; n < days_of_week.length; n++) {
				const day = days_of_week[n];
				await queryInterface.bulkInsert("userAvailabilities", [
					{
						user_id: user.id,
						day_of_week: day,
						start_time: "09:00:00",
						end_time: "17:00:00",
					},
				]);
			}
		}
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("userAvailabilities", null, {});
	},
};
