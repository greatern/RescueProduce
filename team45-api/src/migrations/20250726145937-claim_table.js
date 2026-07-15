"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Create Claims table
		await queryInterface.createTable("Claims", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			listing_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "FoodListings",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			receiver_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Receivers",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			claimed_quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
				validate: { min: 1 },
			},
			claimed_amount_kg: {
				type: Sequelize.DECIMAL(10, 2), // More precise than FLOAT
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM(
					"pending",
					"approved",
					"rejected",
					"fulfilled",
					"cancelled",
					"no_show"
				),
				allowNull: false,
				defaultValue: "pending",
			},
			claimed_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});

		// Add indexes
		await queryInterface.addIndex("Claims", ["status"], {
			name: "claims_status_idx",
		});

		await queryInterface.addIndex("Claims", ["claimed_at"], {
			name: "claims_created_idx",
		});

		await queryInterface.addIndex("Claims", ["listing_id", "status"], {
			name: "claims_listing_status_idx",
		});

		await queryInterface.addIndex("Claims", ["receiver_id", "claimed_at"], {
			name: "claims_receiver_created_idx",
		});

		// ===== TRIGGER 1: Calculate claimed_amount_kg on insert =====
		await queryInterface.sequelize.query(`
      CREATE TRIGGER before_claim_insert
      BEFORE INSERT ON Claims
      FOR EACH ROW
      BEGIN
        DECLARE unit_weight DECIMAL(10,2);
        
        -- Get current weight_per_unit from food listing
        SELECT weight_per_unit INTO unit_weight
        FROM FoodListings
        WHERE id = NEW.listing_id;
        
        -- Calculate claimed weight in kg
        SET NEW.claimed_amount_kg = unit_weight * NEW.claimed_quantity;
      END
    `);

		// ===== TRIGGER 2: Update food listing on claim insert =====
		await queryInterface.sequelize.query(`
      CREATE TRIGGER after_claim_insert
      AFTER INSERT ON Claims
      FOR EACH ROW
      BEGIN
        -- Update food listing's claimed quantity
        UPDATE FoodListings
        SET claimed_quantity = claimed_quantity + NEW.claimed_quantity
        WHERE id = NEW.listing_id;
      END
    `);

		// ===== TRIGGER 3: Handle claim updates =====
		await queryInterface.sequelize.query(`
      CREATE TRIGGER before_claim_update
      BEFORE UPDATE ON Claims
      FOR EACH ROW
      BEGIN
        DECLARE unit_weight DECIMAL(10,2);
        
        -- Only recalculate if quantity changes
        IF OLD.claimed_quantity <> NEW.claimed_quantity THEN
          -- Get current weight_per_unit from food listing
          SELECT weight_per_unit INTO unit_weight
          FROM FoodListings
          WHERE id = NEW.listing_id;
          
          -- Recalculate claimed weight in kg
          SET NEW.claimed_amount_kg = unit_weight * NEW.claimed_quantity;
        END IF;
      END
    `);

		// ===== TRIGGER 4: Update food listing on claim update =====
		await queryInterface.sequelize.query(`
      CREATE TRIGGER after_claim_update
      AFTER UPDATE ON Claims
      FOR EACH ROW
      BEGIN
        -- Only update if quantity changes
        IF OLD.claimed_quantity <> NEW.claimed_quantity THEN
          -- Adjust food listing's claimed quantity
          UPDATE FoodListings
          SET claimed_quantity = claimed_quantity - OLD.claimed_quantity + NEW.claimed_quantity
          WHERE id = NEW.listing_id;
        END IF;
      END
    `);

		// ===== TRIGGER 5: Handle claim deletion =====
		await queryInterface.sequelize.query(`
      CREATE TRIGGER after_claim_delete
      AFTER DELETE ON Claims
      FOR EACH ROW
      BEGIN
        -- Revert food listing's claimed quantity
        UPDATE FoodListings
        SET claimed_quantity = claimed_quantity - OLD.claimed_quantity
        WHERE id = OLD.listing_id;
      END
    `);

		// ===== UPDATE FOODLISTING TRIGGER (with unique name) =====
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_food_status;  -- Remove existing trigger
    `);

		await queryInterface.sequelize.query(`
      CREATE TRIGGER update_food_status_from_claims
      BEFORE UPDATE ON FoodListings
      FOR EACH ROW
      BEGIN
        DECLARE now_date DATETIME;
        SET now_date = NOW();
        
        -- Check quantity claimed
        IF NEW.claimed_quantity >= NEW.posted_quantity THEN
          SET NEW.status = 'claimed';
        ELSEIF NEW.claimed_quantity > 0 THEN
          SET NEW.status = 'partially_claimed';
        ELSE
          SET NEW.status = 'available';
        END IF;
        
        -- Check expiration
        IF now_date > NEW.expiry THEN
          SET NEW.status = 'expired';
        END IF;
        
        -- Check pickup deadline
        IF now_date > NEW.cutoff_pickup_date AND NEW.status <> 'expired' THEN
          SET NEW.status = 'expired';
        END IF;
      END
    `);
	},

	down: async (queryInterface) => {
		// Remove triggers
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS before_claim_insert
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_claim_insert
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS before_claim_update
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_claim_update
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_claim_delete
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_food_status_from_claims
    `);

		// Drop table
		await queryInterface.dropTable("Claims");
	},
};
