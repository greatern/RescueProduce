"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("FoodListings", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			donor_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Donors",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			food_category: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			item_name: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			posted_quantity: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			weight_per_unit: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			claimed_quantity: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0,
			},
			original_quantity: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			quantity_type: {
				type: Sequelize.ENUM("kg", "g", "l", "units", "boxes"),
				allowNull: false,
			},
			cutoff_pickup_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			expiry: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			storage_requirements: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM(
					"available",
					"claimed",
					"picked_up",
					"expired",
					"partially_claimed"
				),
				allowNull: false,
				defaultValue: "available",
			},
			requires_refrigeration: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			contains_allergens: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			posted_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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
		await queryInterface.addIndex("FoodListings", ["expiry", "status"], {
			name: "foodlistings_expiry_status_idx",
		});

		await queryInterface.addIndex(
			"FoodListings",
			["donor_id", "cutoff_pickup_date"],
			{
				name: "foodlistings_donor_pickup_idx",
			}
		);

		await queryInterface.addIndex("FoodListings", ["status"], {
			name: "foodlistings_status_idx",
		});

		await queryInterface.addIndex("FoodListings", ["food_category"], {
			name: "foodlistings_category_idx",
		});

		// Add full-text index (MySQL syntax)
		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings
      ADD FULLTEXT food_search_idx (item_name, food_category, description)
    `);

		// Add constraints
		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings
      ADD CONSTRAINT chk_posted_quantity CHECK (posted_quantity >= 0.01)
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings
      ADD CONSTRAINT chk_weight_per_unit CHECK (weight_per_unit >= 0.01)
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings
      ADD CONSTRAINT chk_claimed_quantity CHECK (claimed_quantity >= 0)
    `);

		// MySQL trigger for original_quantity
		await queryInterface.sequelize.query(`
      CREATE TRIGGER set_original_quantity
      BEFORE INSERT ON FoodListings
      FOR EACH ROW
      SET NEW.original_quantity = 
        COALESCE(NEW.original_quantity, NEW.posted_quantity)
    `);

		// MySQL trigger for status updates
		await queryInterface.sequelize.query(`
      CREATE TRIGGER update_food_status
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
		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_original_quantity
    `);

		await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_food_status
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings DROP CONSTRAINT chk_posted_quantity
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings DROP CONSTRAINT chk_weight_per_unit
    `);

		await queryInterface.sequelize.query(`
      ALTER TABLE FoodListings DROP CONSTRAINT chk_claimed_quantity
    `);

		await queryInterface.dropTable("FoodListings");
	},
};
