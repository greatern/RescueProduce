import { useEffect, useState } from "react";
import type { Donation } from "../../components/donor/missedTable";
import { useAuth } from "../../contexts/AuthProvider";
import DonationItem, {
	FoodStatus,
} from "../../components/donor/donationHistoryCard";
import { donorApi } from "../../services/donor_service";
import { AlertCircle, ArrowLeft, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export const normalizeStatus = (status: string): string => {
	switch (status) {
		case "unclaimed":
			return FoodStatus.AVAILABLE;
		case "claimed":
			return FoodStatus.CLAIMED;
		case "partially_claimed":
			return FoodStatus.PARTIALLY_CLAIMED;
		case "failed":
			return FoodStatus.EXPIRED;
		default:
			return status;
	}
};

export const isActiveStatus = (status: string): boolean => {
	const normalized = normalizeStatus(status);
	return (
		normalized === FoodStatus.AVAILABLE ||
		normalized === FoodStatus.CLAIMED ||
		normalized === FoodStatus.PARTIALLY_CLAIMED
	);
};

export const getStatusCounts = (donations: Donation[]) => {
	return {
		available: donations.filter(
			(d) => normalizeStatus(d.status) === FoodStatus.AVAILABLE
		).length,
		claimed: donations.filter(
			(d) => normalizeStatus(d.status) === FoodStatus.CLAIMED
		).length,
		partialClaimed: donations.filter(
			(d) => normalizeStatus(d.status) === FoodStatus.PARTIALLY_CLAIMED
		).length,
	};
};

const ActiveDonations = () => {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<Partial<Donation>>({});
	const { user } = useAuth();

	const fetchActiveDonations = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await donorApi.getActiveDonations(user?.id!);
			if (response.status === "success") {
				console.log("All donations:", response.data);

				const activeDonations = response.data.filter(
					(donation: Donation) => {
						const status = normalizeStatus(donation.status);
						return (
							status === FoodStatus.AVAILABLE ||
							status === FoodStatus.CLAIMED ||
							status === FoodStatus.PARTIALLY_CLAIMED
						);
					}
				);
				setDonations(activeDonations);
				console.log("Active Donations: ", activeDonations);
			}
		} catch (error) {
			setError(
				"Failed to fetch active donations. Please try again later."
			);
			console.error("Error fetching active donations:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchActiveDonations();
	}, []);

	const handleRefresh = () => {
		setRefreshing(true);
		fetchActiveDonations();
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditForm({});
	};

	const handleDelete = async (donationId: string) => {
		try {
			const response = await donorApi.deleteDonation(donationId);
			if (response.status === "success") {
				setDonations(donations.filter((d) => d.id !== donationId));
			} else {
				setError("Failed to delete donation");
			}
		} catch (err) {
			setError("Failed to delete donation. Please try again.");
			console.error("Error deleting donation:", err);
		}
	};

	const statusCounts = getStatusCounts(donations);

	if (loading && !refreshing) {
		return (
			<div className="flex min-h-screen bg-[#f8f5f0] font-sans text-[#5a4a42] items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#165e2a] mx-auto"></div>
					<p className="mt-4 text-[#5a4a42]">
						Loading your active donations...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen bg-[#f8f5f0] font-sans text-[#5a4a42] items-center justify-center">
				<div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0d6cc]">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-xl font-medium text-[#5a4a42] mb-2">
						Error Loading Data
					</h3>
					<p className="text-[#8a7869] mb-4">{error}</p>
					<button
						onClick={fetchActiveDonations}
						className="px-4 py-2 bg-[#165e2a] text-white rounded-lg hover:bg-[#124b23] flex items-center mx-auto">
						<RefreshCw className="h-4 w-4 mr-2" />
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[#f8f5f0] font-sans text-[#5a4a42]">
			<div className="main-content flex-grow p-6 md:p-10">
				<div className="dashboard-header flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<div>
						<h1 className="dashboard-title text-2xl md:text-3xl font-bold text-[#5a4a42]">
							Active Donations
						</h1>
						<p className="text-[#8a7869]">
							Monitor and manage your ongoing food donations
						</p>
					</div>
					<div className="flex gap-3 w-full md:w-auto">
						<button
							onClick={handleRefresh}
							disabled={refreshing}
							className="btn btn-secondary flex items-center px-4 py-2 bg-white text-[#5a4a42] hover:bg-gray-50 rounded-lg transition-colors duration-200 shadow-sm border border-[#d1c4b5]">
							<RefreshCw
								className={`h-5 w-5 mr-2 ${
									refreshing ? "animate-spin" : ""
								}`}
							/>
							Refresh
						</button>
						<Link
							to="/donor"
							className="btn btn-secondary flex items-center px-4 py-2 bg-[#165e2a] text-white hover:bg-[#124b23] rounded-lg transition-colors duration-200 shadow-sm">
							<ArrowLeft className="h-5 w-5 mr-2" /> Back
						</Link>
					</div>
				</div>

				{/* Status Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-[#8a7869]">
									Available
								</p>
								<p className="text-2xl font-bold text-green-600">
									{statusCounts.available}
								</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
								<span className="text-xl">🟢</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-[#8a7869]">
									Claimed
								</p>
								<p className="text-2xl font-bold text-blue-600">
									{statusCounts.claimed}
								</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
								<span className="text-xl">📋</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-[#8a7869]">
									Partial
								</p>
								<p className="text-2xl font-bold text-amber-600">
									{statusCounts.partialClaimed}
								</p>
							</div>
							<div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
								<span className="text-xl">⏳</span>
							</div>
						</div>
					</div>
				</div>

				{/* Active Donations List */}
				<div className="card bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6 mb-8">
					<div className="card-header mb-6">
						<h2 className="text-xl md:text-2xl font-semibold text-[#5a4a42]">
							Your Active Donations
						</h2>
						<p className="text-[#8a7869] mt-2">
							As of{" "}
							{new Date().toLocaleString("en-ZA", {
								timeZone: "Africa/Johannesburg",
							})}
						</p>
					</div>

					<div className="donation-list space-y-4">
						{donations.length > 0 ? (
							donations.map((donation) => (
								<div
									key={donation.id}
									className="bg-gray-50 rounded-lg p-4 border border-[#e0d6cc]">
									{editingId === donation.id + " " ? (
										// Edit Form
										<div className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-[#5a4a42] mb-1">
														Food Category
													</label>
													<input
														type="text"
														value={
															editForm.food_category ||
															""
														}
														onChange={(e) =>
															setEditForm({
																...editForm,
																food_category:
																	e.target
																		.value,
															})
														}
														className="w-full p-2 border border-[#d1c4b5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165e2a]"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-[#5a4a42] mb-1">
														Quantity
													</label>
													<input
														type="number"
														value={
															editForm.posted_quantity ||
															""
														}
														onChange={(e) =>
															setEditForm({
																...editForm,
																posted_quantity:
																	e.target
																		.value,
															})
														}
														className="w-full p-2 border border-[#d1c4b5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165e2a]"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-[#5a4a42] mb-1">
														Expiry Date
													</label>
													<input
														type="date"
														value={
															editForm.expiry
																? new Date(
																		editForm.expiry
																  )
																		.toISOString()
																		.split(
																			"T"
																		)[0]
																: ""
														}
														onChange={(e) =>
															setEditForm({
																...editForm,
																expiry: e.target
																	.value,
															})
														}
														className="w-full p-2 border border-[#d1c4b5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165e2a]"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-[#5a4a42] mb-1">
														Pickup Time
													</label>
													<input
														type="time"
														value={
															editForm.cutoff_pickup_time ||
															""
														}
														onChange={(e) =>
															setEditForm({
																...editForm,
																cutoff_pickup_time:
																	e.target
																		.value,
															})
														}
														className="w-full p-2 border border-[#d1c4b5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165e2a]"
													/>
												</div>
											</div>
											<div className="flex gap-2 justify-end">
												<button
													onClick={() => {}}
													className="flex items-center px-4 py-2 bg-[#165e2a] text-white rounded-lg hover:bg-[#124b23] transition-colors">
													<Eye className="h-4 w-4 mr-2" />
													Save
												</button>
												<button
													onClick={handleCancelEdit}
													className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
													<ArrowLeft className="h-4 w-4 mr-2" />
													Cancel
												</button>
											</div>
										</div>
									) : (
										// Display Mode
										<div className="flex justify-between items-start">
											<div className="flex-grow">
												<DonationItem
													donation={donation}
													showActions={true}
													onDelete={handleDelete}
												/>
											</div>
										</div>
									)}
								</div>
							))
						) : (
							<div className="text-center py-10">
								<Eye className="h   -12 w-12 mx-auto text-[#d1c4b5]" />
								<h3 className="text-lg font-medium text-[#5a4a42] mt-4">
									No Active Donations
								</h3>
								<p className="text-[#8a7869] mt-1">
									You don't have any active donations at the
									moment.
								</p>
								<Link
									to="/donor/log-food"
									className="mt-4 inline-flex items-center px-4 py-2 bg-[#165e2a] text-white rounded-lg hover:bg-[#124b23]">
									Log New Donation
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6">
					<h3 className="text-xl font-semibold text-[#5a4a42] mb-4">
						Quick Actions
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Link
							to="/donor/log-food"
							className="p-4 bg-[#165e2a] hover:bg-[#124b23] text-white rounded-lg transition-colors flex items-center justify-center text-center shadow-sm">
							<span>Log New Donation</span>
						</Link>
						<Link
							to="/donor/history"
							className="p-4 bg-[#165e2a] hover:bg-[#124b23] text-white rounded-lg transition-colors flex items-center justify-center text-center shadow-sm">
							<span>View All History</span>
						</Link>
						<Link
							to="/donor/pickups"
							className="p-4 bg-[#165e2a] hover:bg-[#124b23] text-white rounded-lg transition-colors flex items-center justify-center text-center shadow-sm">
							<span>Track Pickups</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ActiveDonations;
