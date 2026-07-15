"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Ratings", {
			id: {
				type: Sequelize.UUID,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			delivery_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Deliveries",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			rating_for: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			score: {
				type: Sequelize.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
					max: 5,
				},
			},
			comment: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("Ratings", ["user_id"]);
		await queryInterface.addIndex("Ratings", ["delivery_id"]);
		await queryInterface.addIndex("Ratings", ["rating_for"]);
		await queryInterface.addIndex("Ratings", ["score"]);

		// Add unique constraint for one rating per user per delivery
		await queryInterface.addConstraint("Ratings", {
			fields: ["user_id", "delivery_id"],
			type: "unique",
			name: "unique_rating_per_delivery",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Ratings");
	},
};
