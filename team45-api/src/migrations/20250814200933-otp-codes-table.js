"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("otp_codes", {
			id: {
				type: Sequelize.DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.DataTypes.UUID,
				allowNull: true,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			task_id: {
				type: Sequelize.DataTypes.UUID,
				allowNull: true,
				references: {
					model: "tasks",
					key: "id",
				},
				onDelete: "SET NULL",
				onUpdate: "CASCADE",
			},
			otp_code: {
				type: Sequelize.DataTypes.STRING(6),
				allowNull: false,
			},
			otp_hash: {
				type: Sequelize.DataTypes.STRING(64),
				allowNull: false,
			},
			expires_at: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
			},
			ip_address: {
				type: Sequelize.DataTypes.STRING(45),
				allowNull: true,
			},
			used: {
				type: Sequelize.DataTypes.BOOLEAN,
				defaultValue: false,
			},
			attempts: {
				type: Sequelize.DataTypes.INTEGER,
				defaultValue: 0,
			},
			max_attempts: {
				type: Sequelize.DataTypes.INTEGER,
				defaultValue: 3,
			},
			created_at: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DataTypes.DATE,
				allowNull: false,
			},
		});

		await queryInterface.addIndex("otp_codes", ["task_id", "used"]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("otp_codes");
	},
};
