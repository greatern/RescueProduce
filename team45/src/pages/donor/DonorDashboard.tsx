import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import {
	User,
	Trophy,
	CheckCircle,
	Edit,
	Clock,
	Package,
	Leaf,
	Users,
	ArrowRight,
	TrendingUp,
	Calendar,
} from "lucide-react";
import { donorApi } from "../../services/donor_service";
import { PushNotificationSetup } from "../../components/PushNotificationSetup";

interface DashboardResponse {
	donationStats: { total: number; totalBoxes: number; thisMonth: number };
	impactStats: { mealsProvided: number; co2Saved: number };
	recentActivities: { id: number; text: string; date: string }[];
	donorProfile: { name: string; totalDonations: number; joinDate: string };
	communityStats: { rank: number; totalDonors: number };
	donationGoal: { current: number; target: number };
}

const DonorDashboard: React.FC = () => {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
  
	const fetchDashboardData = async (id: string) => {
		try {
			const response = await donorApi.getDashboard(id);
			console.log("Response dash", response.data);
			if (response.status === "success") {
				setData(response.data.data);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			setData({
				donationStats: { total: 0, totalBoxes: 0, thisMonth: 0 },
				impactStats: { mealsProvided: 0, co2Saved: 0 },
				recentActivities: [],
				donorProfile: {
					name: user?.name || "Guest",
					totalDonations: 0,
					joinDate: new Date().toISOString(),
				},
				communityStats: { rank: 0, totalDonors: 0 },
				donationGoal: { current: 0, target: 100 },
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		console.log("user", user);
		user && fetchDashboardData(user?.id);
	}, [user]);

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-50">
				<div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
					<h3 className="text-lg font-medium text-red-500 mb-2">
						Error loading dashboard
					</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const donationStats = data?.donationStats || {
		total: 0,
		totalBoxes: 0,
		thisMonth: 0,
	};
	const impactStats = data?.impactStats || { mealsProvided: 0, co2Saved: 0 };
	const communityStats = data?.communityStats || { rank: 0, totalDonors: 0 };
	const donationGoal = data?.donationGoal || { current: 0, target: 100 };
	const donorProfile = data?.donorProfile || {
		name: "Guest",
		totalDonations: 0,
		joinDate: new Date().toISOString(),
	};
	const recentActivities = data?.recentActivities || [];

	return (
		<div className="min-h-screen bg-gray-50 p-6 font-sans">
			
				  {user && vapidPublicKey && (
					<PushNotificationSetup
					  userId={user.id}
					  vapidPublicKey={vapidPublicKey}
					/>
				  )}
			
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					Donor Dashboard
				</h1>
				<p className="text-gray-500">
					Welcome back! Here's your impact summary.
				</p>
			</header>

			<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
					<div className="flex items-center justify-between">
						<div className="rounded-lg bg-emerald-100 p-3">
							<Package className="h-6 w-6 text-emerald-600" />
						</div>
						<TrendingUp className="h-5 w-5 text-emerald-600" />
					</div>
					<div className="mt-4">
						<h3 className="text-sm font-medium text-gray-500">
							Total Donations
						</h3>
						<p className="mt-1 text-2xl font-semibold text-gray-900">
							{donationStats.total}{" "}
							{donationStats.total > 1 ? "donations" : "donation"}
						</p>
						<p className="mt-1 font-medium text-gray-900">
							{donationStats.totalBoxes} boxes
						</p>
						<p className="mt-1 font-semibold text-gray-900"></p>
					</div>
				</div>

				<div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
					<div className="flex items-center justify-between">
						<div className="rounded-lg bg-blue-100 p-3">
							<Calendar className="h-6 w-6 text-blue-600" />
						</div>
						<TrendingUp className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-4">
						<h3 className="text-sm font-medium text-gray-500">
							This Month
						</h3>
						<p className="mt-1 text-2xl font-semibold text-gray-900">
							{donationStats.thisMonth} donations
						</p>
						<p className="mt-2 flex items-center text-sm text-blue-600">
							<span>
								{Math.floor(donationStats.thisMonth / 10)}%
								increase
							</span>
						</p>
					</div>
				</div>

				<div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
					<div className="flex items-center justify-between">
						<div className="rounded-lg bg-amber-100 p-3">
							<Users className="h-6 w-6 text-amber-600" />
						</div>
						<TrendingUp className="h-5 w-5 text-amber-600" />
					</div>
					<div className="mt-4">
						<h3 className="text-sm font-medium text-gray-500">
							Meals Provided
						</h3>
						<p className="mt-1 text-2xl font-semibold text-gray-900">
							{impactStats.mealsProvided}
						</p>
						<p className="mt-2 flex items-center text-sm text-amber-600">
							<span>
								{Math.floor(impactStats.mealsProvided / 100)}%
								increase
							</span>
						</p>
					</div>
				</div>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Profile and Goal Column */}
				<div className="space-y-6">
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900">
								Your Profile
							</h2>
							<Link
								to="/donor/profile"
								className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium">
								<Edit className="h-4 w-4 mr-1" /> Edit
							</Link>
						</div>
						<div className="flex items-center">
							<div className="bg-emerald-100 p-3 rounded-full mr-4">
								<User className="h-8 w-8 text-emerald-600" />
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-800">
									{donorProfile.name}
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Member since{" "}
									{formatDate(donorProfile.joinDate)}
								</p>
								<p className="text-gray-600 text-sm mt-1">
									{donorProfile.totalDonations} total
									donations
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-xl bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Donation Goal
						</h2>
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-800 font-medium">
								{donationGoal.current} / {donationGoal.target}{" "}
								kg
							</span>
							<span className="text-emerald-600 font-bold">
								{Math.round(
									(donationGoal.current /
										donationGoal.target) *
										100
								)}
								%
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2.5">
							<div
								className="bg-emerald-600 h-2.5 rounded-full"
								style={{
									width: `${Math.min(
										(donationGoal.current /
											donationGoal.target) *
											100,
										100
									)}%`,
								}}></div>
						</div>
						<p className="text-gray-500 text-xs mt-2">
							{donationGoal.target - donationGoal.current > 0
								? `${
										donationGoal.target -
										donationGoal.current
								  } kg remaining`
								: "Goal achieved! Thank you!"}
						</p>
					</div>
				</div>

				<div className="lg:col-span-2">
					<div className="rounded-xl bg-white p-6 shadow-sm h-full">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900">
								Recent Activity
							</h2>
							<Link
								to="/donor/history"
								className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
								<Clock className="h-4 w-4 mr-1" /> View History
							</Link>
						</div>

						{recentActivities.length > 0 ? (
							<div className="space-y-3">
								{recentActivities.map((activity) => (
									<div
										key={activity.id}
										className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
										<div className="bg-emerald-100 p-1.5 rounded-full mr-3 mt-0.5">
											<CheckCircle className="h-4 w-4 text-emerald-600" />
										</div>
										<div>
											<p className="text-gray-800">
												{activity.text}
											</p>
											<p className="text-gray-500 text-xs mt-1">
												{new Date(
													activity.date
												).toLocaleString("en-US", {
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-gray-500">
									No recent activity yet
								</p>
								<Link
									to="/donor/log-food"
									className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 inline-block">
									Make your first donation
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Impact and Community Section */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Impact Summary */}
				<div className="rounded-xl bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Your Impact
					</h2>
					<div className="space-y-4">
						<div className="flex items-start">
							<div className="bg-emerald-100 p-2 rounded-lg mr-4">
								<Package className="h-5 w-5 text-emerald-600" />
							</div>
							<div>
								<h3 className="font-medium text-gray-800">
									Food Waste Reduced
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Your donations have reduced food waste by{" "}
									{Math.min(
										Math.floor(donationStats.total / 50),
										45
									)}
									%
								</p>
							</div>
						</div>
						<div className="flex items-start">
							<div className="bg-blue-100 p-2 rounded-lg mr-4">
								<Users className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<h3 className="font-medium text-gray-800">
									Community Support
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Your donations have provided meals for{" "}
									{Math.floor(impactStats.mealsProvided / 3)}{" "}
									families
								</p>
							</div>
						</div>
						<div className="flex items-start">
							<div className="bg-amber-100 p-2 rounded-lg mr-4">
								<Leaf className="h-5 w-5 text-amber-600" />
							</div>
							<div>
								<h3 className="font-medium text-gray-800">
									Environmental Impact
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Equivalent to planting{" "}
									{Math.floor(impactStats.co2Saved / 20)}{" "}
									trees
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Community Card */}
				<div className="rounded-xl bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Community Ranking
					</h2>
					<div className="flex items-center">
						<div className="bg-violet-100 p-3 rounded-full mr-4">
							<Trophy className="h-8 w-8 text-violet-600" />
						</div>
						<div>
							<p className="text-2xl font-bold text-gray-800">
								#{communityStats.rank}
							</p>
							<p className="text-gray-600">
								out of {communityStats.totalDonors} donors
							</p>
							<p className="text-gray-500 text-sm mt-2">
								You're in the top{" "}
								{Math.round(
									(communityStats.rank /
										communityStats.totalDonors) *
										100
								)}
								% of donors!
							</p>
						</div>
					</div>
					<button className="mt-6 w-full flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
						View Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default DonorDashboard;
