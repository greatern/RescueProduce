"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Create table
		await queryInterface.createTable("UserAddresses", {
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
			},
			address_id: {
				type: Sequelize.UUID,
				allowNull: false,
			},
			is_primary: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		});

		// Add composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE UserAddresses
      ADD CONSTRAINT pk_user_addresses
      PRIMARY KEY (user_id, address_id);
    `);

		// Add foreign keys
		await queryInterface.sequelize.query(`
      ALTER TABLE UserAddresses
      ADD CONSTRAINT fk_useraddresses_user
      FOREIGN KEY (user_id)
      REFERENCES Users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE UserAddresses
      ADD CONSTRAINT fk_useraddresses_address
      FOREIGN KEY (address_id)
      REFERENCES Addresses(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);

		// Add reverse lookup index
		await queryInterface.addIndex("UserAddresses", ["address_id"], {
			name: "idx_address_users",
		});
	},

	down: async (queryInterface) => {
		// Drop table
		await queryInterface.dropTable("UserAddresses");
	},
};
