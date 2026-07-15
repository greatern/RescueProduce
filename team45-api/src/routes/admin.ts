import { Request, Response, Router } from "express";
import { getAdminDashboard } from "../handlers/adminDashboard";
import {
	getBackupUsers,
	getCancelledDeliveries,
	getCancelledPickups,
	getMissedTasks,
	getUnclaimedFood,
} from "../handlers/admin";
const router = Router();

//router.get("/cancelled_tasks", getCancelledPickups);
router.get("/unclaimed", getUnclaimedFood);
router.get("/active_tasks", () => {});
router.get("/backup_users", getBackupUsers);
router.get("/missed_tasks", getMissedTasks);
router.get("/cancelled_tasks", getCancelledDeliveries);
router.post("/reassign_receiver", () => {});
router.post("/reassign_volunteer", () => {});
router.get("/dashboard", getAdminDashboard);

router.get("/active_deliveries", (req: Request, res: Response) => {
	res.send("Active deliveries");
});
router.post("/reassign_volunteer", (req: Request, res: Response) => {
	res.send("Volunteer reassigned");
});
router.post("/reassign_receiver", (req: Request, res: Response) => {
	res.send("Receiver reassigned");
});
router.get("/dashboard", getAdminDashboard);

export default router;
