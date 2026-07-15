"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("VolunteerOrganisations", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			org_name: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			service_area_km: {
				type: Sequelize.DOUBLE,
				allowNull: false,
				validate: {
					min: 0.1,
				},
			},
			contact_email: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: { isEmail: true },
			},
			contact_phone: {
				type: Sequelize.STRING(20),
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

		await queryInterface.addIndex("VolunteerOrganisations", ["org_name"]);
		await queryInterface.addIndex("VolunteerOrganisations", [
			"service_area_km",
		]);
		await queryInterface.addIndex("VolunteerOrganisations", ["org_name"], {
			type: "FULLTEXT",
			name: "organisations_fulltext_idx",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("VolunteerOrganisations");
	},
};
