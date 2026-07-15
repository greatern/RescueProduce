import { Request, Response } from "express";
import { Task } from "../models/task";
import { User } from "../models/user";
import { Volunteer } from "../models/volunteer";
import { Receiver } from "../models/receiver";
import { Address } from "../models/address";

class TaskHandler {
	
	public async createTask(req: Request, res: Response): Promise<void> {
		try {
			const {
				description,
				status,
				due_date,
				title,
				task_type,
				pickup_address_id,
				destination_address_id,
				claim_id,
				assigned_volunteer_id,
				assigned_receiver_id,
			} = req.body;

			if (!description || !status || !due_date) {
				res.status(400).json({
					message: "Missing required task fields (description, status, due_date).",
				});
				return;
			}

			const newTask = await Task.create({
				description,
				status,
				due_date: new Date(due_date),
				title: title || "No Title",
				task_type: task_type || "delivery",
				pickup_address_id,
				destination_address_id,
				claim_id,
				assigned_volunteer_id,
				assigned_receiver_id,
			});

			res.status(201).json({ 
				message: "Task created successfully", 
				task: newTask 
			});
		} catch (error: any) {
			console.error("Error creating task:", error);
			res.status(500).json({ 
				message: "Error creating task", 
				error: error.message 
			});
		}
	}

	public async getAllTasks(req: Request, res: Response): Promise<void> {
		try {
			const tasks = await Task.findAll({
				include: [
					{ 
						model: Volunteer, 
						as: "volunteer",
						required: false 
					},
					{ 
						model: Receiver, 
						as: "receiver",   
						required: false 
					},
					{
						model: Address,
						as: "pickup_address",
						required: false
					},
					{
						model: Address,
						as: "destination_address", 
						required: false
					}
				],
				order: [['created_at', 'DESC']]
			});
			
			res.status(200).json({ 
				message: "Tasks retrieved successfully", 
				tasks 
			});
		} catch (error: any) {
			console.error("Error fetching all tasks:", error);
			res.status(500).json({ 
				message: "Error fetching tasks", 
				error: error.message 
			});
		}
	}


	public async getTaskById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const task = await Task.findByPk(id, {
				include: [
					{ 
						model: Volunteer, 
						as: "volunteer",
						required: false 
					},
					{ 
						model: Receiver, 
						as: "receiver",
						required: false 
					},
					{
						model: Address,
						as: "pickup_address",
						required: false
					},
					{
						model: Address,
						as: "destination_address",
						required: false
					}
				],
			});

			if (task) {
				res.status(200).json({ 
					message: "Task retrieved successfully", 
					task 
				});
			} else {
				res.status(404).json({ message: "Task not found" });
			}
		} catch (error: any) {
			console.error(`Error fetching task with ID ${req.params.id}:`, error);
			res.status(500).json({ 
				message: "Error fetching task", 
				error: error.message 
			});
		}
	}

	public async updateTask(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const updateData = req.body;

			const task = await Task.findByPk(id);

			if (!task) {
				res.status(404).json({ message: "Task not found" });
				return;
			}

			// Update the task with the provided data
			await task.update(updateData);

			// Fetch the updated task with associated data to send back
			const updatedTask = await Task.findByPk(id, {
				include: [
					{ 
						model: Volunteer, 
						as: "volunteer",
						required: false 
					},
					{ 
						model: Receiver, 
						as: "receiver",
						required: false 
					},
					{
						model: Address,
						as: "pickup_address",
						required: false
					},
					{
						model: Address,
						as: "destination_address",
						required: false
					}
				],
			});

			res.status(200).json({ 
				message: "Task updated successfully", 
				task: updatedTask 
			});
		} catch (error: any) {
			console.error(`Error updating task with ID ${req.params.id}:`, error);
			res.status(500).json({ 
				message: "Error updating task", 
				error: error.message 
			});
		}
	}

	public async getAvailableTasks(req: Request, res: Response): Promise<void> {
		try {
			const availableTasks = await Task.findAll({
				where: {
					status: 'available',
					assigned_volunteer_id: null
				},
				include: [
					{
						model: Address,
						as: "pickup_address",
						required: false
					},
					{
						model: Address,
						as: "destination_address",
						required: false
					}
				],
				order: [['due_date', 'ASC']]
			});

			res.status(200).json({
				message: "Available tasks retrieved successfully",
				tasks: availableTasks
			});
		} catch (error: any) {
			console.error("Error fetching available tasks:", error);
			res.status(500).json({
				message: "Error fetching available tasks",
				error: error.message
			});
		}
	}

	public async getRecentTasks(req: Request, res: Response): Promise<void> {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      res.status(400).json({ message: "receiverId is required" });
      return;
    }

    const tasks = await Task.findAll({
      where: {
        assigned_receiver_id: receiverId,
        status: ["completed", "confirmed"], 
      },
      include: [
        { model: Volunteer, as: "volunteer", required: false },
        { model: Receiver, as: "receiver", required: false },
        { model: Address, as: "pickup_address", required: false },
        { model: Address, as: "destination_address", required: false },
      ],
      order: [["created_at", "DESC"]],
      limit: 3, 
    });

    res.status(200).json({
      success: true,
      message: "Recent tasks retrieved successfully",
      tasks,
    });
  } catch (error: any) {
    console.error("Error fetching recent tasks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent tasks",
      error: error.message,
    });
  }
}
}



export default new TaskHandler();