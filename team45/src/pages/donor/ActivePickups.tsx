import { useEffect, useState } from "react";
import { donorApi } from "../../services/donor_service.ts";
import { useAuth } from "../../contexts/AuthProvider.tsx";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
	Button,
	Card,
	DatePicker,
	Input,
	Space,
	Table,
	Tag,
	Tooltip,
} from "antd";
import { CheckSquareOutlined } from "@ant-design/icons";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";

enum PickupStatus {
	SCHEDULED = "scheduled",
	CONFIRMED = "confirmed",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	MISSED = "missed",
	CANCELLED = "cancelled",
}

export interface Pickup {
	id: string;
	donor_id: string;
	task_id: string;
	pickup_status: PickupStatus;
	scheduled_pickup_time: Date;
	actual_pickup_time: Date;
	confirmation_code: string;
}

const { RangePicker } = DatePicker;

const ActivePickup = () => {
	const [pickups, setPickups] = useState<Pickup[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchText, setSearchText] = useState("");

	const { user } = useAuth();

	useEffect(() => {
		fetchPickup();
	}, []);

	const fetchPickup = async () => {
		setIsLoading(true);
		try {
			const response = await donorApi.getActiveTasks(user?.id!);
			console.log("Pickup response", response);

			if (response.status === "success") {
				setPickups(response.data);
			}
		} catch (error) {
			console.error("Error", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getPickupStatus = (
		scheduled: Date,
		actual: Date,
		status?: string
	) => {
		const now = new Date();
		const scheduled_time = new Date(scheduled);
		const actual_time = new Date(actual);

		if (status === "") {
			return { status: "Completed", color: "green" };
		}

		if (
			actual_time > scheduled_time &&
			actual_time.getTime() !== scheduled_time.getTime()
		) {
			return { status: "Completed", color: "green" };
		} else if (now > scheduled_time) {
			return { status: "Overdue", color: "red" };
		} else {
			return { status: "Scheduled", color: "blue" };
		}
	};

	const columns: ColumnsType<Pickup> = [
		{
			title: "Task ID",
			dataIndex: "task_id",
			key: "task_id",
			width: 60,
			render: (value: string) => (
				<span>{value.toUpperCase().slice(0, 6)}</span>
			),
			sorter: (a, b) => a.donor_id.localeCompare(b.donor_id),
		},
		{
			title: "Scheduled Time",
			dataIndex: "scheduled_pickup_time",
			key: "scheduled_pickup_time",
			width: 60,
			render: (date: Date) => dayjs(date).format("MMM DD, YYYY"),
			sorter: (a, b) =>
				new Date(a.scheduled_pickup_time).getTime() -
				new Date(b.scheduled_pickup_time).getTime(),
		},
		{
			title: "Actual Pickup Time",
			dataIndex: "actual_pickup_time",
			key: "actual_pickup_time",
			width: 95,
			render: (date: Date, record: Pickup) => {
				const actualTime = dayjs(date);
				const scheduledTime = dayjs(record.scheduled_pickup_time);

				if (
					actualTime.isAfter(scheduledTime) &&
					!actualTime.isSame(scheduledTime)
				) {
					return (
						<span className="text-green-600">
							{actualTime.format("MMM DD, YYYY")}
						</span>
					);
				}
				return <span className="text-gray-400">Pending</span>;
			},
			sorter: (a, b) =>
				new Date(a.actual_pickup_time).getTime() -
				new Date(b.actual_pickup_time).getTime(),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 50,
			render: (_, record: Pickup) => {
				const { status, color } = getPickupStatus(
					record.scheduled_pickup_time,
					record.actual_pickup_time
				);
				return <Tag color={color}>{status}</Tag>;
			},
			filters: [
				{ text: "Scheduled", value: "Scheduled" },
				{ text: "Completed", value: "Completed" },
				{ text: "Overdue", value: "Overdue" },
			],
			onFilter: (value, record) => {
				const { status } = getPickupStatus(
					record.scheduled_pickup_time,
					record.actual_pickup_time
				);
				return status === value;
			},
		},
		{
			title: "Confirmation Code",
			dataIndex: "confirmation_code",
			key: "confirmation_code",
			width: 40,
			render: (code: string) => (
				<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
					{code}
				</code>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			width: 50,
			render: (_) => (
				<Space size="middle">
					<Tooltip title="Mark Complete">
						<Button
							type="primary"
							ghost
							icon={<CheckSquareOutlined />}
							size="small"
							onClick={() => {
								fetchPickup();
							}}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	const filteredPickups = pickups.filter(
		(pickup) =>
			pickup.task_id.toLowerCase().includes(searchText.toLowerCase()) ||
			pickup.confirmation_code
				.toLowerCase()
				.includes(searchText.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gray-50 p-6 font-sans">
			<Card className="shadow-sm">
				<div className="mb-6">
					<div className="mb-6">
						<div className="flex justify-between items-center mb-4">
							<div>
								<h1 className="text-2xl font-bold text-gray-800 mb-2">
									Active Pickups
								</h1>
								<p className="text-gray-600">
									Manage and monitor all active pickup
									requests
								</p>
							</div>
							<Button
								type="primary"
								icon={<ReloadOutlined />}
								onClick={() => {}}
								loading={isLoading}>
								Refresh
							</Button>
						</div>

						{/* Search and Filter Controls */}
						<div className="flex flex-col md:flex-row gap-4 mb-4">
							<Input
								placeholder="Search by Task ID"
								prefix={<SearchOutlined />}
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								className="md:w-1/3"
								allowClear
							/>
							<RangePicker
								className="md:w-1/3"
								placeholder={["Start Date", "End Date"]}
								format="MMM DD, YYYY"
							/>
						</div>
					</div>

					{/* Summary Statistics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<Card size="small" className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{filteredPickups.length}
							</div>
							<div className="text-gray-600">Total Pickups</div>
						</Card>
						<Card size="small" className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{
									filteredPickups.filter((p) => {
										const { status } = getPickupStatus(
											p.scheduled_pickup_time,
											p.actual_pickup_time
										);
										return status === "Completed";
									}).length
								}
							</div>
							<div className="text-gray-600">Completed</div>
						</Card>
						<Card size="small" className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{
									filteredPickups.filter((p) => {
										const { status } = getPickupStatus(
											p.scheduled_pickup_time,
											p.actual_pickup_time
										);
										return status === "Scheduled";
									}).length
								}
							</div>
							<div className="text-gray-600">Scheduled</div>
						</Card>
						<Card size="small" className="text-center">
							<div className="text-2xl font-bold text-red-600">
								{
									filteredPickups.filter((p) => {
										const { status } = getPickupStatus(
											p.scheduled_pickup_time,
											p.actual_pickup_time
										);
										return status === "Overdue";
									}).length
								}
							</div>
							<div className="text-gray-600">Overdue</div>
						</Card>
					</div>
				</div>
				{/* Pickups Table */}
				<div className="">
					<Table
						columns={columns}
						dataSource={filteredPickups}
						rowKey="id"
						loading={isLoading}
						pagination={{
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} pickups`,
							pageSizeOptions: ["10", "25", "50", "100"],
							defaultPageSize: 25,
						}}
						scroll={{ x: 1000 }}
						className="bg-white"
						rowClassName={(record) => {
							const { status } = getPickupStatus(
								record.scheduled_pickup_time,
								record.actual_pickup_time
							);
							return status === "Overdue" ? "bg-red-50" : "";
						}}
					/>
				</div>
			</Card>
		</div>
	);
};

export default ActivePickup;
