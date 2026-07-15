// src/seeders/fraudCaseTestData.ts
import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

async function seedFraudCaseTestData() {
  let sequelize: Sequelize;

  try {
    console.log('🌱 Starting fraud case test data seeding...');

    // First, create a connection without database to check/create it
    const adminSequelize = new Sequelize({
      dialect: "mysql",
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      logging: false,
    });

    // Check if database exists, create if it doesn't
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error("DB_NAME environment variable is not set");
    }

    const [results] = await adminSequelize.query(`SHOW DATABASES LIKE '${dbName}'`);
    if ((results as any[]).length === 0) {
      console.log(`📁 Creating database: ${dbName}`);
      await adminSequelize.query(`CREATE DATABASE \`${dbName}\``);
      console.log(`✅ Database ${dbName} created`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

    await adminSequelize.close();

    // Now connect with the database
    const { sequelize: dbSequelize } = await import("../config/sequelize");
    sequelize = dbSequelize;

    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database (create tables if they don't exist)
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synced');

    // Now import models after database is ready
    const { User } = await import("../models/user");
    const { Donor } = await import("../models/donor");
    const { Receiver } = await import("../models/receiver");
    const { Volunteer } = await import("../models/volunteer");
    const { FoodListing, FoodStatus, QuantityUnit } = await import("../models/food_listing");
    const { Claim } = await import("../models/claim");
    const { Task, TaskType, Status } = await import("../models/task");
    const { FraudCase, FraudIssueType, FraudSeverityLevel, FraudStatus } = await import("../models/fraud_case");

    const timestamp = Date.now();

    // ==================== CREATE USERS ====================
    
    // Donor User
    const donorUserId = uuidv4();
    const donorUser = await User.create({
      id: donorUserId,
      name: "Fresh Foods Market",
      email: `freshfoods${timestamp}@test.com`,
      phone: "555-0101",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "donor",
      status: "active"
    });

    const donor = await Donor.create({
      id: donorUser.id,
      tax_number: `TAX-DONOR-${timestamp}`,
      health_certification_url: "https://example.com/health-cert.pdf"
    });
    console.log('✅ Donor created:', donorUser.email);

    // Receiver User
    const receiverUserId = uuidv4();
    const receiverUser = await User.create({
      id: receiverUserId,
      name: "Community Shelter",
      email: `shelter${timestamp}@test.com`,
      phone: "555-0102",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "receiver",
      status: "active"
    });

    const receiver = await Receiver.create({
      id: receiverUser.id,
      is_backup: false,
      registration_number: `NPO-SHELTER-${timestamp}`,
      storage_capacity: 5000
    });
    console.log('✅ Receiver created:', receiverUser.email);

    // Volunteer User
    const volunteerUserId = uuidv4();
    const volunteerUser = await User.create({
      id: volunteerUserId,
      name: "John Volunteer",
      email: `volunteer${timestamp}@test.com`,
      phone: "555-0103",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "volunteer",
      status: "active"
    });

    const volunteer = await Volunteer.create({
      id: volunteerUser.id,
      license_number: `LIC-${timestamp}`,
      license_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      reputation_score: 95
    });
    console.log('✅ Volunteer created:', volunteerUser.email);

    // Reporter User
    const reporterUserId = uuidv4();
    const reporterUser = await User.create({
      id: reporterUserId,
      name: "Sarah Reporter",
      email: `reporter${timestamp}@test.com`,
      phone: "555-0104",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "receiver",
      status: "active"
    });

    const reporterReceiver = await Receiver.create({
      id: reporterUser.id,
      is_backup: false,
      registration_number: `NPO-REPORTER-${timestamp}`,
      storage_capacity: 3000
    });
    console.log('✅ Reporter created:', reporterUser.email);

    // ==================== CREATE FOOD LISTING ====================
    
    const foodListingId = uuidv4();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const foodListing = await FoodListing.create({
      id: foodListingId,
      donor_id: donor.id,
      food_category: "vegetables",
      posted_quantity: 100,
      weight_per_unit: 2.5,
      claimed_quantity: 0,
      quantity_type: QuantityUnit.BOXES,
      cutoff_pickup_date: tomorrow,
      expiry: nextWeek,
      cutoff_pickup_time: "18:00:00",
      storage_requirements: "Keep refrigerated",
      status: FoodStatus.AVAILABLE,
      requires_refrigeration: true,
      contains_allergens: false,
      description: "Fresh organic vegetables including carrots, potatoes, and onions",
      posted_at: new Date()
    });
    console.log('✅ Food listing created:', foodListing.id);

    // ==================== CREATE CLAIM ====================
    
    const claimId = uuidv4();
    const claimedQuantity = 50;
    const claimedAmountKg = claimedQuantity * foodListing.weight_per_unit;

    const claim = await Claim.create({
      id: claimId,
      listing_id: foodListing.id,
      receiver_id: receiver.id,
      claimed_quantity: claimedQuantity,
      claimed_amount_kg: claimedAmountKg
    });
    console.log('✅ Claim created:', claim.id);

    // Update food listing claimed quantity
    await foodListing.update({ claimed_quantity: claimedQuantity });

    // ==================== CREATE TASK WITH VOLUNTEER ====================
    
    const taskId = uuidv4();
    const taskDueDate = new Date();
    taskDueDate.setDate(taskDueDate.getDate() + 2);

    const task = await Task.create({
      id: taskId,
      title: "Vegetable Delivery - Community Shelter",
      description: "Deliver fresh vegetables from Fresh Foods Market to Community Shelter",
      task_type: TaskType.DELIVERY,
      status: Status.CONFIRMED,
      due_date: taskDueDate,
      claim_id: claim.id,
      assigned_receiver_id: receiver.id,
      assigned_volunteer_id: volunteer.id
    });
    console.log('✅ Task created with volunteer:', task.id);

    // ==================== CREATE FRAUD CASES ====================

    // Case 1: High Severity - Fraudulent Claim (target: volunteer)
    const fraudCase1Id = uuidv4();
    const fraudCase1 = await FraudCase.create({
      id: fraudCase1Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "Volunteer never delivered the food items. GPS tracking shows they went to a different location and kept the food for personal use.",
      issue_type: FraudIssueType.FRAUDULENT_CLAIM,
      specific_issue: "Food diversion and theft",
      evidence_files: ["evidence1.jpg", "gps_track.png"],
      severity_level: FraudSeverityLevel.HIGH,
      status: FraudStatus.OPEN,
      date_reported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reported_party: "volunteer", // CORRECT ENUM VALUE
      requires_follow_up: true,
      estimated_financial_impact: 125,
      affects_multiple_parties: true
    });
    console.log('✅ High severity fraud case created');

    // Case 2: Medium Severity - Food Quality Issue (target: donor)
    const fraudCase2Id = uuidv4();
    const fraudCase2 = await FraudCase.create({
      id: fraudCase2Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "Received vegetables were spoiled and moldy. Donor claimed they were fresh but they were clearly past expiration.",
      issue_type: FraudIssueType.FOOD_QUALITY,
      specific_issue: "Expired food provided",
      evidence_files: ["spoiled_food1.jpg", "spoiled_food2.jpg"],
      severity_level: FraudSeverityLevel.MEDIUM,
      status: FraudStatus.UNDER_INVESTIGATION,
      date_reported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      date_investigation_started: new Date(),
      reported_party: "donor", // CORRECT ENUM VALUE
      requires_follow_up: true,
      estimated_financial_impact: 75
    });
    console.log('✅ Medium severity fraud case created');

    // Case 3: Low Severity - Missing Items (target: volunteer)
    const fraudCase3Id = uuidv4();
    const fraudCase3 = await FraudCase.create({
      id: fraudCase3Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "Only received 45 boxes instead of the promised 50. Volunteer said some boxes were damaged during transport.",
      issue_type: FraudIssueType.MISSING_ITEMS,
      specific_issue: "Quantity mismatch - missing 5 boxes",
      evidence_files: ["delivery_receipt.jpg"],
      severity_level: FraudSeverityLevel.LOW,
      status: FraudStatus.RESOLVED,
      date_reported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      date_resolved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      resolution_details: "Volunteer provided documentation of damaged goods. Donor will provide credit for missing items.",
      reported_party: "volunteer", // CORRECT ENUM VALUE
      estimated_financial_impact: 25
    });
    console.log('✅ Low severity fraud case created');

    // Case 4: Critical Severity - Volunteer Behavior (target: volunteer)
    const fraudCase4Id = uuidv4();
    const fraudCase4 = await FraudCase.create({
      id: fraudCase4Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "Volunteer was aggressive and threatening during delivery. Made inappropriate comments and refused to follow safety protocols.",
      issue_type: FraudIssueType.VOLUNTEER_BEHAVIOR,
      specific_issue: "Aggressive and unsafe behavior",
      evidence_files: ["security_footage.mp4", "witness_statement.pdf"],
      severity_level: FraudSeverityLevel.CRITICAL,
      status: FraudStatus.UNDER_INVESTIGATION,
      date_reported: new Date(),
      date_investigation_started: new Date(),
      reported_party: "volunteer", // CORRECT ENUM VALUE
      requires_follow_up: true,
      affects_multiple_parties: true
    });
    console.log('✅ Critical severity fraud case created');

    // Case 5: Dismissed Case (target: volunteer)
    const fraudCase5Id = uuidv4();
    const fraudCase5 = await FraudCase.create({
      id: fraudCase5Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "Complaint about late delivery, but volunteer provided valid reason (traffic accident). No malicious intent found.",
      issue_type: FraudIssueType.DELIVERY_ISSUE,
      specific_issue: "Late delivery complaint",
      evidence_files: [],
      severity_level: FraudSeverityLevel.LOW,
      status: FraudStatus.DISMISSED,
      date_reported: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      date_resolved: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      resolution_details: "Case dismissed after investigation confirmed legitimate delay. No fraudulent activity detected.",
      reported_party: "volunteer", // CORRECT ENUM VALUE
    });
    console.log('✅ Dismissed fraud case created');

    // Case 6: Reporter issue (target: reporter)
    const fraudCase6Id = uuidv4();
    const fraudCase6 = await FraudCase.create({
      id: fraudCase6Id,
      task_id: task.id,
      claim_id: claim.id,
      reporter_id: reporterUser.id,
      description: "False reporting detected. Reporter has made multiple unsubstantiated claims against different volunteers.",
      issue_type: FraudIssueType.OTHER,
      specific_issue: "False reporting pattern",
      evidence_files: ["report_history.pdf"],
      severity_level: FraudSeverityLevel.MEDIUM,
      status: FraudStatus.OPEN,
      date_reported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reported_party: "reporter", // CORRECT ENUM VALUE
      requires_follow_up: true,
      affects_multiple_parties: true
    });
    console.log('✅ Reporter fraud case created');

    console.log('\n🎉 Fraud case test data seeded successfully!');
    console.log('==============================================');
    console.log('Test Users Created:');
    console.log('  Donor:', donorUser.email);
    console.log('  Receiver:', receiverUser.email);
    console.log('  Volunteer:', volunteerUser.email);
    console.log('  Reporter:', reporterUser.email);
    console.log('  Password for all: password123');
    console.log('\nFraud Cases Created:');
    console.log('  High Severity (Open) - Volunteer:', fraudCase1.id);
    console.log('  Medium Severity (Under Investigation) - Donor:', fraudCase2.id);
    console.log('  Low Severity (Resolved) - Volunteer:', fraudCase3.id);
    console.log('  Critical Severity (Under Investigation) - Volunteer:', fraudCase4.id);
    console.log('  Low Severity (Dismissed) - Volunteer:', fraudCase5.id);
    console.log('  Medium Severity (Open) - Reporter:', fraudCase6.id);
    console.log('\nYou can now test:');
    console.log('  - Different target users (volunteer, donor, reporter)');
    console.log('  - All severity levels (low, medium, high, critical)');
    console.log('  - Different statuses (open, under_investigation, resolved, dismissed)');
    console.log('==============================================\n');

  } catch (error: any) {
    console.error('❌ Error seeding fraud case test data:', error.message);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.log('  -', err.path, ':', err.message);
      });
    }
    if (error.parent) {
      console.error('Database error:', error.parent.sqlMessage);
    }
    throw error;
  }
}

export { seedFraudCaseTestData };

// Run if called directly
if (require.main === module) {
  seedFraudCaseTestData()
    .then(() => {
      console.log('✅ Fraud case seeder completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fraud case seeder failed:', error);
      process.exit(1);
    });
}