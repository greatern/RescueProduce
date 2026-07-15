// oversight
import { useEffect, useState } from "react";
import {
	Package,
	Clock,
	AlertTriangle,
	Users,
	Home,
	RefreshCw,
	X,
} from "lucide-react";
import { adminApi } from "../../services/admin";
import TasksTable, { type Donation } from "../../components/donor/missedTable";

interface BackupOption {
	id: string;
	name: string;
	type: "volunteer" | "ngo";
	availability: "immediate" | "within-1h" | "within-2h";
	distance: string;
	rating?: number; // for volunteers
	capacity?: string; //  for receivers
}

export interface Task {
	id: string;
	food_category: string;
	assigned_to: string;
	donor_name: string;
	quantity: string;
	due_date: string;
	procurement_method: string;
	status: string;
}

interface BackupProps {
	task: Task;
	backups: BackupOption[];
	onAssign: (option: BackupOption) => void;
	onClose: () => void;
}

// Backup modal
const BackupModal = ({ task, onAssign, backups, onClose }: BackupProps) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl font-semibold">
						Assign Backup{" "}
						{task.procurement_method === "delivery"
							? "Volunteer"
							: "NGO"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700">
						<X size={20} />
					</button>
				</div>
				<div className="mb-4 p-4 bg-gray-50 rounded-lg">
					<h3 className="font-medium">{task.donor_name}</h3>
					<div className="text-sm text-gray-600 mt-1">
						{task.procurement_method} • {task.quantity} • {null}
					</div>
					<div className="mt-2 text-sm">
						<span className="inline-flex items-center text-red-600">
							<AlertTriangle className="h-4 w-4 mr-1" />
							{task.due_date}
						</span>
					</div>
				</div>
				<div className="space-y-3">
					<h3 className="font-medium">
						Available{" "}
						{task.procurement_method === "delivery"
							? "Volunteers"
							: "NGOs"}
						:
					</h3>
					{backups.map((option) => (
						<div
							key={option.id}
							className="border rounded-lg p-3 flex justify-between items-center">
							<div>
								<div className="font-medium">{option.name}</div>
								<div className="text-sm text-gray-600 mt-1">
									{option.type === "volunteer" ? (
										<>
											<span className="inline-flex items-center mr-3">
												<Users className="h-3 w-3 mr-1" />{" "}
												{option.rating}/5
											</span>
										</>
									) : (
										<>
											<span className="inline-flex items-center mr-3">
												<Home className="h-3 w-3 mr-1" />{" "}
												{option.capacity} capacity
											</span>
										</>
									)}
									<span className="inline-flex items-center mr-3">
										<Clock className="h-3 w-3 mr-1" />{" "}
										{option.availability.replace("-", " ")}
									</span>
									<span className="inline-flex items-center">
										<RefreshCw className="h-3 w-3 mr-1" />{" "}
										{option.distance}
									</span>
								</div>
							</div>
							<button
								onClick={() => onAssign(option)}
								className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">
								Assign
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const DonationOversight = () => {
	const [donations, setDonations] = useState<Donation[]>([]);

	const [missedTasks, setMissedTasks] = useState<Task[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [backupOptions, setBackupOptions] = useState<BackupOption[]>([]);
	const [forceAssignMode, setForceAssignMode] = useState(false);

	const getBackupOptions = (task: Task) => {
		console.log("procure", task.procurement_method);

		if (task.procurement_method === "delivery") {
			return [
				{
					id: "vol1",
					name: "Sarah M.",
					type: "volunteer" as const,
					availability: "immediate" as const,
					distance: "0.5km",
					rating: 4.8,
					capacity: "50kg",
				},
				{
					id: "vol2",
					name: "James K.",
					type: "volunteer" as const,
					availability: "within-1h" as const,
					distance: "1.2km",
					rating: 4.5,
					capacity: "30kg",
				},
				{
					id: "vol3",
					name: "Lebo P.",
					type: "volunteer" as const,
					availability: "within-2h" as const,
					distance: "2.5km",
					rating: 4.9,
					capacity: "75kg",
				},
			];
		} else if (task.procurement_method === "pickup") {
			return [
				{
					id: "ngo1",
					name: "Food Rescue SA",
					type: "ngo" as const,
					availability: "immediate" as const,
					distance: "1.0km",
					capacity: "100kg",
				},
				{
					id: "ngo2",
					name: "Hope Foundation",
					type: "ngo" as const,
					availability: "within-1h" as const,
					distance: "1.8km",
					capacity: "60kg",
				},
				{
					id: "ngo3",
					name: "Community Care",
					type: "ngo" as const,
					availability: "within-2h" as const,
					distance: "3.2km",
					capacity: "80kg",
				},
			];
		} else {
			return [];
		}
	};

	const handleForceAssign = (task: Task) => {
		console.log("Donation", task);

		setBackupOptions(getBackupOptions(task));
		setSelectedTask(task);
		setForceAssignMode(true);
	};

	const handleAssignBackup = (option: BackupOption) => {
		if (!selectedTask) return;

		const updatedDonations = donations.map((d) => {
			if (d.id === selectedTask.id) {
				return {
					...d,
					status: "claimed" as const,
					assignedTo: option.name,
				};
			}
			return d;
		});

		setDonations(updatedDonations);
		setForceAssignMode(false);
		setSelectedTask(null);
	};

	const handleMarkAsFailed = (donationId: string) => {
		const updatedDonations = donations.map((d) => {
			if (d.id === donationId) {
				return {
					...d,
					status: "failed" as const,
				};
			}
			return d;
		});
		setDonations(updatedDonations);
	};

	const handleDonationReassign = () => {};

	const fetch = async () => {
		try {
			const taskResponse = await adminApi.getMissedTasks();
			if (taskResponse.status === "success") {
				setMissedTasks(taskResponse.data);
			}

			const donationResponse = await adminApi.getUnclaimedFood();
			if (donationResponse.status === "success") {
				setDonations(donationResponse.data);
			}
		} catch (error) {
			setMissedTasks([]);
			setDonations([]);
		}
	};

	useEffect(() => {
		fetch();
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">
				<Package className="inline mr-2" />
				Donation Oversight
			</h1>

			{/* The modal */}
			{forceAssignMode && selectedTask && (
				<BackupModal
					backups={backupOptions}
					onAssign={handleAssignBackup}
					onClose={() => setForceAssignMode(false)}
					task={selectedTask}
				/>
			)}

			<div className="mb-6 bg-white rounded-lg shadow p-4">
				<h2 className="font-semibold mb-3">Urgent Action Needed</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{donations
						.filter(
							(d) =>
								d.status === "unclaimed" ||
								d.status === "failed"
						)
						.map((donation) => (
							<div
								key={donation.id}
								className="border rounded-lg p-3">
								<div className="flex justify-between">
									<h3 className="font-medium">
										{donation.donor_name}
									</h3>
									<span
										className={`text-xs px-2 py-1 rounded ${
											donation.status === "unclaimed"
												? "bg-amber-100 text-amber-800"
												: "bg-red-100 text-red-800"
										}`}>
										{donation.status === "unclaimed"
											? "Unclaimed"
											: "Pickup Failed"}
									</span>
								</div>
								<div className="text-sm text-gray-500 mt-1">
									{donation.food_category} •{" "}
									{donation.posted_quantity} •{" "}
									{donation.location}
								</div>
								<div className="mt-2 flex space-x-2">
									<button
										onClick={() =>
											//handleForceAssign(donation)
											{}
										}
										className="flex-1 bg-emerald-600 text-white py-1 rounded text-sm hover:bg-emerald-700">
										Assign Backup
									</button>
									{donation.status === "failed" && (
										<button
											onClick={() =>
												handleMarkAsFailed(donation.id)
											}
											className="bg-gray-200 text-gray-800 py-1 px-2 rounded text-sm hover:bg-gray-300">
											<X className="h-4 w-4" />
										</button>
									)}
								</div>
							</div>
						))}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<TasksTable
					missedTasks={missedTasks}
					donations={donations}
					onTaskReassign={handleForceAssign}
					onDonationReassign={handleDonationReassign}
				/>
			</div>
		</div>
	);
};

export default DonationOversight;
