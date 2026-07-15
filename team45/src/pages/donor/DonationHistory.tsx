import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Box, Utensils, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";
//import donorApi from "../../../service/donor";
import { useAuth } from "../../contexts/AuthProvider";
import { donorApi } from "../../services/donor_service";
import DonationItem from "../../components/donor/donationHistoryCard";
import type { Donation } from "../../components/donor/missedTable";

export enum FoodStatus {
	AVAILABLE = "available",
	CLAIMED = "claimed",
	PICKED_UP = "picked_up",
	EXPIRED = "expired",
	PARTIALLY_CLAIMED = "partially_claimed",
}

const DonationHistory: React.FC = () => {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const { user } = useAuth();

	const fetchDonations = async () => {
		try {
			setLoading(true);
			setError(null);

			const dResponse = await donorApi.getDonationHistory(user?.id!);
			if (dResponse.status === "success") {
				console.log("History:", dResponse.data);

				setDonations(dResponse.data);
			}
			console.log(dResponse);
		} catch (err) {
			setError("Failed to fetch donations. Please try again later.");
			console.error("Error fetching donations:", err);

			if (axios.isAxiosError(err) && err.response) {
				console.error("Response data:", err.response.data);
				console.error("Response status:", err.response.status);
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await donorApi.deleteDonation(id);
			if (response.status === "success") {
				setDonations(donations.filter((d) => d.id !== id));
			} else {
				setError("Failed to delete donation");
			}
		} catch (err) {
			setError("Failed to delete donation. Please try again.");
			console.error("Error deleting donation:", err);
		}
	};

	useEffect(() => {
		fetchDonations();
	}, []);

	const handleRefresh = () => {
		setRefreshing(true);
		fetchDonations();
	};

	const filteredDonations =
		filterStatus === "all"
			? donations
			: donations.filter((donation) => donation.status === filterStatus);

	const getStatusLabel = (status: string) => {
		switch (status) {
			case FoodStatus.AVAILABLE:
				return "Available";
			case FoodStatus.CLAIMED:
				return "Claimed";
			case FoodStatus.PICKED_UP:
				return "Picked Up";
			case FoodStatus.EXPIRED:
				return "Expired";
			case FoodStatus.PARTIALLY_CLAIMED:
				return "Partially Claimed";
			default:
				return status.charAt(0).toUpperCase() + status.slice(1);
		}
	};

	if (loading && !refreshing) {
		return (
			<div className="flex min-h-screen bg-[#f8f5f0] font-sans text-[#5a4a42] items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#165e2a] mx-auto"></div>
					<p className="mt-4 text-[#5a4a42]">
						Loading your donation history...
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
						onClick={fetchDonations}
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
							Donation History
						</h1>
						<p className="text-[#8a7869]">
							Track and manage your food donations
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
							to="/donor-dashboard"
							className="btn btn-secondary flex items-center px-4 py-2 bg-[#165e2a] text-white hover:bg-[#124b23] rounded-lg transition-colors duration-200 shadow-sm">
							<ArrowLeft className="h-5 w-5 mr-2" /> Back
						</Link>
					</div>
				</div>

				<div className="card bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6 mb-8">
					<div className="card-header mb-6">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<h2 className="text-xl md:text-2xl font-semibold text-[#5a4a42]">
								Your Food Donations
							</h2>
							<select
								value={filterStatus}
								onChange={(e) =>
									setFilterStatus(e.target.value)
								}
								className="p-3 rounded-lg bg-white text-[#5a4a42] border border-[#d1c4b5] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a] w-full md:w-auto">
								<option value="all">All Statuses</option>
								<option value={FoodStatus.AVAILABLE}>
									{getStatusLabel(FoodStatus.AVAILABLE)}
								</option>
								<option value={FoodStatus.CLAIMED}>
									{getStatusLabel(FoodStatus.CLAIMED)}
								</option>
								<option value={FoodStatus.PICKED_UP}>
									{getStatusLabel(FoodStatus.PICKED_UP)}
								</option>
								<option value={FoodStatus.EXPIRED}>
									{getStatusLabel(FoodStatus.EXPIRED)}
								</option>
								<option value={FoodStatus.PARTIALLY_CLAIMED}>
									{getStatusLabel(
										FoodStatus.PARTIALLY_CLAIMED
									)}
								</option>
							</select>
						</div>
						<p className="text-[#8a7869] mt-2">
							As of{" "}
							{new Date().toLocaleString("en-ZA", {
								timeZone: "Africa/Johannesburg",
							})}
						</p>
					</div>

					<div className="donation-list space-y-4">
						{filteredDonations.length > 0 ? (
							filteredDonations.map((donation) => (
								<DonationItem
									key={donation.id}
									donation={donation}
									onDelete={() => {}}
								/>
							))
						) : (
							<div className="text-center py-10">
								<Box className="h-12 w-12 mx-auto text-[#d1c4b5]" />
								<h3 className="text-lg font-medium text-[#5a4a42] mt-4">
									No donations found
								</h3>
								<p className="text-[#8a7869] mt-1">
									{filterStatus === "all"
										? "You haven't made any donations yet"
										: `You don't have any ${getStatusLabel(
												filterStatus
										  )} donations`}
								</p>
								<Link
									to="/log-food"
									className="mt-4 inline-flex items-center px-4 py-2 bg-[#165e2a] text-white rounded-lg hover:bg-[#124b23]">
									<Utensils className="h-4 w-4 mr-2" />
									Make your first donation
								</Link>
							</div>
						)}
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-6">
					<h3 className="text-xl font-semibold text-[#5a4a42] mb-4">
						Quick Actions
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link
							to="/donor/log-food"
							className="p-4 bg-[#165e2a] hover:bg-[#124b23] text-white rounded-lg transition-colors flex items-center justify-center text-center shadow-sm">
							<Utensils className="h-5 w-5 mr-3" />
							<span>Log New Donation</span>
						</Link>
						<Link
							to="/donor/"
							className="p-4 bg-[#165e2a] hover:bg-[#124b23] text-white rounded-lg transition-colors flex items-center justify-center text-center shadow-sm">
							<ArrowLeft className="h-5 w-5 mr-3" />
							<span>Back to Dashboard</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DonationHistory;
