import { Router } from "express";
import {
	acceptTask,
	confirmPickup,
	getActiveTasks,
	getAvailableTasks,
	updateTaskStatus,
	submitAppeal
} from "../handlers/volunteer.handler";
import ReceiverHandler from "../handlers/receiver";
import MapsHandler from "../handlers/maps";
import { upload } from "../middleware/upload";


const mapHandler = MapsHandler;

const router = Router();

// Simple placeholder routes to avoid constructor errors
router.get("/tasks/", getAvailableTasks);

router.get("/tasks/:id", getActiveTasks);

router.post("/tasks/accept", acceptTask);

router.patch("/tasks/:id/:status", updateTaskStatus);

router.post("/tasks/confirm", confirmPickup);

router.get("/closest-task", MapsHandler.getClosestTask);

router.put("/:id", (req, res) => {
	res.status(501).json({ message: "Update volunteer not implemented" });
});

router.delete("/:id", (req, res) => {
	res.status(501).json({ message: "Delete volunteer not implemented" });
});

router.post("/appeals/:blockId", upload.array("evidence_files", 5), submitAppeal);

export default router;
