import express, { Request, response, Response } from "express";
import { claimFoodListing } from "../handlers/claims";
import { getAvailableTasks, acceptTask } from "../handlers/volunteer.handler";
import { updateProfile, getUserProfile } from "../handlers/users";
import { Task } from "../models/task";
import otpRouter from "./otp";
import notificationRouter from "./notifications";

const router = express.Router();

// OTP routes
router.use("/otp", otpRouter);

// Notification routes
router.use("/notifications", notificationRouter);

// Claims routes
router.post("/claims", claimFoodListing);

// Volunteer task routes
//router.get("/volunteers/:volunteer_id/tasks", getVolunteerTasks);
//router.post("/tasks/accept", acceptTask);

router.post(
	"/volunteers/:volunteer_id/tasks/:task_id/response",
	async (req: Request, res: Response) => {
		try {
			const { volunteer_id, task_id } = req.params;
			const { status } = req.body;
			console.log(
				`Volunteer ${volunteer_id} responding to task ${task_id} with status: ${status}`
			);

			if (status !== "accepted" && status !== "declined") {
				res.status(400).json({
					error: "Invalid status. Must be 'accepted' or 'declined'",
				});
				return;
			}

			if (status === "accepted") {
				// Directly modify the request body to match acceptTask expectations
				req.body = {
					task_id,
					volunteer_id,
				};

				acceptTask(req, res);
				return;
			} else {
				// Handle declined tasks
				res.status(200).json({
					message: "Task declined successfully",
				});
				return;
			}
		} catch (error) {
			console.error("Error responding to task:", error);
			res.status(500).json({
				error: "Failed to respond to task",
			});
		}
	}
);

// User profile routes
router.get("/users/:user_id/profile", getUserProfile);
router.put("/users/:user_id/profile", updateProfile);

// Task status updates
router.put("/tasks/:task_id/status", async (req: Request, res: Response) => {
	try {
		const { task_id } = req.params;
		const { status } = req.body;

		const task = await Task.findByPk(task_id);
		if (!task) {
			res.status(404).json({ error: "Task not found" });
			return;
		}

		await task.update({ status });

		res.json({
			success: true,
			task,
			message: "Task status updated successfully",
		});
	} catch (error) {
		console.error("Task status update error:", error);
		res.status(500).json({ error: "Failed to update task status" });
	}
});

export default router;
