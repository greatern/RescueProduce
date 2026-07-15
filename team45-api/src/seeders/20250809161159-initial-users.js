"use strict";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const hashPassword = async (password) => {
	try {
		const saltRounds = 5;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		return hashedPassword;
	} catch (error) {
		throw new Error("Error hashing password: " + error);
	}
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const freshMarketPassword = await hashPassword("pass");
		const friendlySupermarketPassword = await hashPassword("pass");
		const helpNeighbourPassword = await hashPassword("pass");
		const forTheKidsPassword = await hashPassword("pass");
		const jerryPassword = await hashPassword("pass");
		const mildredPassword = await hashPassword("pass");
		const sbusisoPassword = await hashPassword("pass");
		const adminPassword = await hashPassword("admin");

		await queryInterface.bulkInsert("users", [
			{
				id: uuidv4(),
				name: "Fresh Market",
				email: "fresh@email.com",
				phone: "0123456789",
				password_hash: freshMarketPassword,
				user_type: "donor",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Friendly Supermarket",
				email: "super@email.com",
				phone: "0321654987",
				password_hash: friendlySupermarketPassword,
				user_type: "donor",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Help Your Neighbour",
				email: "help@email.com",
				phone: "0123654789",
				password_hash: helpNeighbourPassword,
				user_type: "receiver",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "For The Kids Foundation",
				email: "kids@email.com",
				phone: "0123456987",
				password_hash: forTheKidsPassword,
				user_type: "receiver",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Jerry The First",
				email: "jerry@email.com",
				phone: "0123654987",
				password_hash: jerryPassword,
				user_type: "volunteer",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Mildred Pumpernickle",
				email: "mild@email.com",
				phone: "0987654321",
				password_hash: mildredPassword,
				user_type: "volunteer",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Sbusiso Gift",
				email: "gift@email.com",
				phone: "0789123456",
				password_hash: sbusisoPassword,
				user_type: "volunteer",
				verified: false,
			},
			{
				id: uuidv4(),
				name: "Admin",
				email: "admin@email.com",
				phone: "111111111",
				password_hash: adminPassword,
				user_type: "admin",
				verified: false,
			},
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("users", null, {});
	},
};
