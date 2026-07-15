
import { sequelize } from "../config/sequelize";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');

    const { User } = await import("../models/user");
    const { Donor } = await import("../models/donor");
    const { Receiver } = await import("../models/receiver");
    const { FoodListing, FoodStatus, QuantityUnit } = await import("../models/food_listing");
    const { Claim } = await import("../models/claim");
    const { Task, TaskType, Status } = await import("../models/task");


    const donorUserId = uuidv4();
    const receiverUserId = uuidv4();
    const foodListingId = uuidv4();
    const claimId = uuidv4();
    const taskId = uuidv4();

    const timestamp = Date.now();

    const donorUser = await User.create({
      id: donorUserId,
      name: "Test Donor Business",
      email: `donor${timestamp}@test.com`,
      phone: "123-456-7890",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "donor",
      status: "active"
    });

    const donor = await Donor.create({
      id: donorUser.id,
      tax_number: `TAX-${timestamp}`,
      health_certification_url: "https://example.com/health-cert.pdf"
    });

    console.log('✅ Donor created:', donorUser.email);


    const receiverUser = await User.create({
      id: receiverUserId,
      name: "Test Receiver Organization",
      email: `receiver${timestamp}@test.com`,
      phone: "098-765-4321",
      password_hash: await bcrypt.hash("password123", 10),
      user_type: "receiver",
      status: "active"
    });

    const receiver = await Receiver.create({
      id: receiverUser.id,
      is_backup: false,
      registration_number: `NPO-${timestamp}`,
      storage_capacity: 10000
    });

    console.log('✅ Receiver created:', receiverUser.email);

  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const foodListing = await FoodListing.create({
      id: foodListingId,
      donor_id: donor.id,
      food_category: "vegetables",
      posted_quantity: 50,
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

    // Create a claim
    const claimedQuantity = 25;
    const claimedAmountKg = claimedQuantity * foodListing.weight_per_unit;

    const claim = await Claim.create({
      id: claimId,
      listing_id: foodListing.id,
      receiver_id: receiver.id,
      claimed_quantity: claimedQuantity,
      claimed_amount_kg: claimedAmountKg
    });

    console.log('✅ Claim created:', claim.id);
    console.log('   Claimed quantity:', claimedQuantity);
    console.log('   Claimed amount (kg):', claimedAmountKg);

    // Update food listing claimed quantity
    await foodListing.update({ claimed_quantity: claimedQuantity });

    // Create a task for the claim
    const taskDueDate = new Date();
    taskDueDate.setDate(taskDueDate.getDate() + 2);

    const task = await Task.create({
      id: taskId,
      title: "Vegetable Delivery - Test Donation",
      description: "Deliver fresh vegetables from Test Donor Business to Test Receiver Organization",
      task_type: TaskType.DELIVERY,
      status: Status.PENDING,
      due_date: taskDueDate,
      claim_id: claim.id,
      assigned_receiver_id: receiver.id
    });

    console.log('✅ Task created:', task.id);

    console.log('\n🎉 Test data seeded successfully!');
    console.log('==================================');
    console.log('Receiver email:', receiverUser.email);
    console.log('Password: password123');
    console.log('Claim ID:', claim.id);
    console.log('Task ID:', task.id);
    console.log('==================================\n');

    return {
      receiverEmail: receiverUser.email,
      claimId: claim.id,
      taskId: task.id
    };

  } catch (error: any) {
    console.error('❌ Error seeding test data:', error.message);
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

export { seedTestData };


if (require.main === module) {

  import("../config/sequelize").then(async ({ sequelize }) => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      await seedTestData();
      console.log('✅ Seeder completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    }
  });
}