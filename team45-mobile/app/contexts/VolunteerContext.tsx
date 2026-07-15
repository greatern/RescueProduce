import React, {
	createContext,
	useState,
	useContext,
	ReactNode,
	useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import * as volunteerService from "../service/volunteer";
import { Task } from "../service/receiver";

interface VolunteerContextType {
	availableTasks: Task[];
	myTasks: Task[];
	loading: boolean;
	volunteerId: string | undefined; // Added this for easier access
	fetchTasks: () => Promise<void>;
	acceptTask: (taskId: string) => Promise<boolean>;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(
	undefined
);

export const VolunteerProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth();
	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);

	const availableTasks = allTasks.filter(
		(task) =>
			!task.assigned_volunteer_id &&
			["pending", "available", "needs_delivery_volunteer"].includes(
				task.status
			)
	);

	const myTasks = allTasks.filter(
		(task) => task.assigned_volunteer_id === user?.id
	);

	const fetchTasks = useCallback(async () => {
		try {
			setLoading(true);
			const response = await volunteerService.getAllTasks();
			console.log("Response data", response);
			if (response.status === "success") {
				setAllTasks(response.data!);
			} else {
				setAllTasks([]);
			}
		} catch (error) {
			//console.error("Failed to fetch tasks:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const acceptTask = useCallback(
		async (taskId: string) => {
			if (!user?.id) {
				console.error("No volunteer ID found to accept task.");
				return false;
			}
			try {
				await volunteerService.respondToTask(
					user.id,
					taskId,
					"accepted"
				);
				await fetchTasks();
				return true;
			} catch (error) {
				console.error("Failed to accept task:", error);
				return false;
			}
		},
		[user, fetchTasks]
	);

	return (
		<VolunteerContext.Provider
			value={{
				availableTasks,
				myTasks,
				loading,
				volunteerId: user?.id, // Added this
				fetchTasks,
				acceptTask,
			}}>
			{children}
		</VolunteerContext.Provider>
	);
};

export const useVolunteer = () => {
	const context = useContext(VolunteerContext);
	if (context === undefined) {
		throw new Error("useVolunteer must be used within a VolunteerProvider");
	}
	return context;
};
