"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Create Deliveries table
		await queryInterface.createTable("Deliveries", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			claim_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Claims",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			food_listing_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "FoodListings",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			volunteer_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Volunteers",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			receiver_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Receivers",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			donor_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Donors",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			pickup_address_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Addresses",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			delivery_address_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Addresses",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			scheduled_pickup: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			actual_pickup: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			actual_delivery: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM(
					"scheduled",
					"en_route",
					"delivered",
					"cancelled",
					"failed"
				),
				allowNull: false,
				defaultValue: "scheduled",
			},
			carbon_saved_kg: {
				type: Sequelize.FLOAT(10, 2),
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
		await queryInterface.addIndex("Deliveries", ["status"]);
		await queryInterface.addIndex("Deliveries", ["scheduled_pickup"]);
		await queryInterface.addIndex("Deliveries", ["volunteer_id", "status"]);
		await queryInterface.addIndex("Deliveries", ["food_listing_id"], {
			unique: true,
			where: { status: ["scheduled", "en_route"] },
		});

		// Add triggers
		await queryInterface.sequelize.query(`
      CREATE TRIGGER before_delivery_insert
      BEFORE INSERT ON Deliveries
      FOR EACH ROW
      BEGIN
        DECLARE listing_status VARCHAR(20);
        
        -- Verify food listing is claimable
        SELECT status INTO listing_status 
        FROM FoodListings 
        WHERE id = NEW.food_listing_id;
        
        IF listing_status NOT IN ('claimed', 'partially_claimed') THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cannot create delivery for unclaimed food listing';
        END IF;
      END
    `);

		await queryInterface.sequelize.query(`
      CREATE TRIGGER after_delivery_status_update
      AFTER UPDATE ON Deliveries
      FOR EACH ROW
      BEGIN
        IF NEW.status <> OLD.status THEN
          -- Update claim status when delivery is completed
          IF NEW.status = 'delivered' THEN
            UPDATE Claims SET status = 'fulfilled'
            WHERE id = NEW.claim_id;
            
            UPDATE FoodListings SET status = 'picked_up'
            WHERE id = NEW.food_listing_id;
            
          END IF;
          
          -- Log status changes
          INSERT INTO delivery_status_logs 
          (delivery_id, old_status, new_status, changed_at)
          VALUES (NEW.id, OLD.status, NEW.status, NOW());
        END IF;
      END
    `);
	},

	down: async (queryInterface, Sequelize) => {
		// Remove triggers
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS before_delivery_insert
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_delivery_status_update
    `);

		// Drop table
		await queryInterface.dropTable("Deliveries");
	},
};
