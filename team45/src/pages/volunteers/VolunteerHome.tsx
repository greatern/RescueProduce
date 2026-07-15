import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
	BarChart2,
	Award,
	Truck,
	Calendar,
	Clock,
	CheckCircle,
} from "lucide-react";
import { PushNotificationSetup } from "../../components/PushNotificationSetup";
import { useAuth } from "../../contexts/AuthProvider";

interface Task {
	id: string;
	title: string;
	description: string;
	status: string;
	due_date: string;
	pickup_location?: string;
	dropoff_location?: string;
	assigned_volunteer_id?: string | null;
	updatedAt: string;
}

interface TasksFetchResponse {
	tasks: Task[];
}

interface VolunteerStats {
	totalDeliveries: number;
	foodRescuedKg: number;
	reputationScore: number;
	hoursContributed: number;
}

const StatCard = ({
	icon: Icon,
	value,
	label,
	color,
}: {
	icon: React.ElementType;
	value: string | number;
	label: string;
	color: string;
}) => (
	<div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
		<div className={`p-3 rounded-full mr-4 ${color}`}>
			<Icon className="w-6 h-6 text-white" />
		</div>
		<div>
			<div className="text-2xl font-bold text-gray-800">{value}</div>
			<div className="text-sm text-gray-500">{label}</div>
		</div>
	</div>
);

const VolunteerHome: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
	const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
	const [stats, setStats] = useState<VolunteerStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"active" | "completed">(
		"active"
	);
    
	  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
	const volunteerId = localStorage.getItem("userId") || "demo-volunteer-id"; // Fallback for testing
	const volunteerName = localStorage.getItem("userName") || "Volunteer";

	const fetchData = useCallback(async () => {
		// Removed the redirect - just continue without checking volunteerId
		setLoading(true);
		try {
			const response = await api.get<TasksFetchResponse>("/tasks");
			const allTasks = response.tasks;

			const assigned = allTasks.filter(
				(task: Task) =>
					task.assigned_volunteer_id === volunteerId &&
					!["completed", "delivered", "cancelled", "failed"].includes(
						task.status
					)
			);

			const completed = allTasks.filter(
				(task: Task) =>
					task.assigned_volunteer_id === volunteerId &&
					["completed", "delivered"].includes(task.status)
			);

			setAssignedTasks(assigned);
			setCompletedTasks(completed);

			// Calculate stats
			const statsData: VolunteerStats = {
				totalDeliveries: completed.length,
				foodRescuedKg: completed.length * 7.5,
				reputationScore: Math.max(
					50,
					100 -
						completed.filter((t: Task) => t.status === "cancelled")
							.length *
							5
				),
				hoursContributed: completed.length * 2.5,
			};
			setStats(statsData);
		} catch (error) {
			console.error("Failed to fetch data:", error);
			// Show some demo data if API fails
			setAssignedTasks([]);
			setCompletedTasks([]);
			setStats({
				totalDeliveries: 0,
				foodRescuedKg: 0,
				reputationScore: 100,
				hoursContributed: 0,
			});
		} finally {
			setLoading(false);
		}
	}, [volunteerId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			assigned: {
				bg: "bg-blue-100",
				text: "text-blue-800",
				label: "Assigned",
			},
			en_route: {
				bg: "bg-yellow-100",
				text: "text-yellow-800",
				label: "En Route",
			},
			completed: {
				bg: "bg-green-100",
				text: "text-green-800",
				label: "Completed",
			},
			delivered: {
				bg: "bg-green-100",
				text: "text-green-800",
				label: "Delivered",
			},
			pending: {
				bg: "bg-gray-100",
				text: "text-gray-800",
				label: "Pending",
			},
		};

		const config =
			statusConfig[status as keyof typeof statusConfig] ||
			statusConfig.pending;

		return (
			<span
				className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};


return (
	<div className="main-content p-8 bg-gray-50 min-h-full">
      {user && vapidPublicKey && (
        <PushNotificationSetup
          userId={user.id}
          vapidPublicKey={vapidPublicKey}
        />
      )}

			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-800 mb-2">
					Welcome back, {volunteerName}!
				</h1>
				<p className="text-gray-500">
					Here's a summary of your impact and current tasks.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
				<StatCard
					icon={Truck}
					value={stats?.totalDeliveries ?? 0}
					label="Total Deliveries"
					color="bg-blue-500"
				/>
				<StatCard
					icon={Award}
					value={`${stats?.foodRescuedKg ?? 0} kg`}
					label="Food Rescued"
					color="bg-green-500"
				/>
				<StatCard
					icon={BarChart2}
					value={stats?.reputationScore ?? "N/A"}
					label="Reputation Score"
					color="bg-purple-500"
				/>
				<StatCard
					icon={Calendar}
					value={`${stats?.hoursContributed ?? 0} hrs`}
					label="Hours Contributed"
					color="bg-orange-500"
				/>
			</div>

			{/* Task Management Section */}
			<div className="bg-white rounded-lg shadow-md border border-gray-200">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						<button
							onClick={() => setActiveTab("active")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "active"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<Clock className="w-4 h-4 mr-2" />
								Active Tasks ({assignedTasks.length})
							</div>
						</button>
						<button
							onClick={() => setActiveTab("completed")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "completed"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Completed Tasks ({completedTasks.length})
							</div>
						</button>
					</nav>
				</div>

				<div className="p-6">
					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-4 text-gray-500">
								Loading tasks...
							</p>
						</div>
					) : (
						<>
							{activeTab === "active" && (
								<div>
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-xl font-bold text-gray-700">
											Your Active Tasks
										</h2>
										<Link
											to="/volunteer/tasks"
											className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
											Find New Tasks
										</Link>
									</div>

									{assignedTasks.length === 0 ? (
										<div className="text-center py-8">
											<Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<p className="text-gray-500 mb-4">
												You have no active tasks.
											</p>
											<Link
												to="/volunteer/tasks"
												className="text-blue-600 hover:underline font-medium">
												Browse available tasks to get
												started!
											</Link>
										</div>
									) : (
										<div className="space-y-4">
											{assignedTasks.map((task: Task) => (
												<div
													key={task.id}
													className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<h3 className="font-bold text-lg text-gray-900">
																{task.title}
															</h3>
															<p className="text-sm text-gray-600 mt-1">
																{
																	task.description
																}
															</p>
															<div className="mt-2 space-y-1">
																<p className="text-sm text-gray-500">
																	<span className="font-semibold">
																		From:
																	</span>{" "}
																	{task.pickup_location ||
																		"Not specified"}
																</p>
																<p className="text-sm text-gray-500">
																	<span className="font-semibold">
																		To:
																	</span>{" "}
																	{task.dropoff_location ||
																		"Not specified"}
																</p>
																<p className="text-sm text-gray-500">
																	<span className="font-semibold">
																		Due:
																	</span>{" "}
																	{new Date(
																		task.due_date
																	).toLocaleString()}
																</p>
															</div>
														</div>
														<div className="ml-4 flex flex-col items-end space-y-2">
															{getStatusBadge(
																task.status
															)}
															<p className="text-xs text-gray-400">
																Use mobile app
																to update status
															</p>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{activeTab === "completed" && (
								<div>
									<h2 className="text-xl font-bold text-gray-700 mb-4">
										Your Completed Tasks
									</h2>

									{completedTasks.length === 0 ? (
										<div className="text-center py-8">
											<CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<p className="text-gray-500">
												You haven't completed any tasks
												yet.
											</p>
										</div>
									) : (
										<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
											<table className="min-w-full divide-y divide-gray-300">
												<thead className="bg-gray-50">
													<tr>
														<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Task
														</th>
														<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Route
														</th>
														<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Completed
														</th>
														<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Status
														</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{completedTasks.map(
														(task: Task) => (
															<tr
																key={task.id}
																className="hover:bg-gray-50">
																<td className="px-6 py-4 whitespace-nowrap">
																	<div>
																		<div className="text-sm font-medium text-gray-900">
																			{
																				task.title
																			}
																		</div>
																		<div className="text-sm text-gray-500">
																			{
																				task.description
																			}
																		</div>
																	</div>
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	<div>
																		<div>
																			From:{" "}
																			{task.pickup_location ||
																				"N/A"}
																		</div>
																		<div>
																			To:{" "}
																			{task.dropoff_location ||
																				"N/A"}
																		</div>
																	</div>
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{new Date(
																		task.updatedAt
																	).toLocaleDateString()}
																</td>
																<td className="px-6 py-4 whitespace-nowrap">
																	{getStatusBadge(
																		task.status
																	)}
																</td>
															</tr>
														)
													)}
												</tbody>
											</table>
										</div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default VolunteerHome;
