// routes/testData.ts
import { Router } from "express";
import { seedTestData} from "../seeders/testDataSeeder";

const router = Router();

// Seed test data
router.post("/seed", async (req, res) => {
  try {
    const result = await seedTestData();
    res.json({ 
      message: "Test data seeded successfully",
      data: result 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to seed test data" });
  }
});


export default router;