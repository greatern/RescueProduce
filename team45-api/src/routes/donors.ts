import { Router } from "express";
import { validateBody } from "../validator/validateBody";
import { DonorDto } from "../dtos/donorDto";
import {
	getDonations,
	donateFood,
	getDonorStats,
	getDonationHistory,
	getActiveDonations,
	getRecentDonations,
	getImpactData,
	getDashboard,
	getDonationAnalytics,
	getTaxRecords,
	getNotifications,
	getPickups,
	deleteDonation,
} from "../handlers/donors";

const router = Router();

router.get("/:donorId/stats", getDonorStats);
router.get("/:donorId/donations/active", getActiveDonations);
router.get("/:donorId/donations/recent", getRecentDonations);
router.get("/:donorId/notifications", getNotifications);
router.get("/:donorId/donations", getDonationHistory);
router.get("/:donorId/impact", getImpactData);
router.get("/:donorId/analytics", getDonationAnalytics);
router.get("/:donorId/tax-records", getTaxRecords);
//router.get('/:id/donations-old', getDonations); // Renamed to avoid conflict
router.post("/donate", donateFood);
router.get("/dashboard/:id", getDashboard);
router.get("/donations/:id", getDonations);
router.get("/pickups/:id", getPickups);
router.delete("/donation/:id", deleteDonation);
// Note: donateFood should be in /api/food_listings router, not here
// Move this line to your food_listings router:
// router.post('/', donateFood);

export default router;
