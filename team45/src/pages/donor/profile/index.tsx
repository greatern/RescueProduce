import { useEffect, useState } from "react";
import type { UserProfile } from "./profile";
import { useNavigate } from "react-router-dom";
import PasswordPage from "./password";
import AvailabilityPage from "./availability";
import DeactivatePage from "./deactivate";
import ProfilePage from "./profile";
import { AlertTriangle, Calendar, Lock, MapPin, User } from "lucide-react";
import AddressesPage from "./address";
import { useAuth } from "../../../contexts/AuthProvider";

const ProfileManagement = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<
		"profile" | "password" | "availability" | "deactivate" | "address"
	>("profile");
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const { user } = useAuth();

	useEffect(() => {
		setProfile({
			id: user?.id ?? "",
			email: user?.email ?? "",
			name: user?.name ?? "",
			phone: "",
			role: user?.role ?? "admin",
			lastActive: "",
		});
	}, []);

	const handleProfileUpdate = (updatedProfile: UserProfile) => {
		setProfile(updatedProfile);
	};

	const handleDeactivateAccount = () => {
		alert("Account deactivated successfully. You will be logged out.");
		navigate("/login");
	};

	if (!profile) {
		return <div className="p-6">Loading profile...</div>;
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900">
						Profile Management
					</h1>
					<p className="text-gray-600">
						Manage your account settings and preferences
					</p>
				</header>

				{/* Navigation Tabs */}
				<div className="mb-6 border-b border-gray-200">
					<nav className="flex space-x-8">
						<button
							onClick={() => setActiveTab("profile")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "profile"
									? "border-emerald-500 text-emerald-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<User className="h-4 w-4 mr-2" />
								Profile
							</div>
						</button>
						<button
							onClick={() => setActiveTab("address")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "address"
									? "border-emerald-500 text-emerald-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<MapPin className="h-4 w-4 mr-2" />
								Addresses
							</div>
						</button>
						<button
							onClick={() => setActiveTab("password")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "password"
									? "border-emerald-500 text-emerald-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<Lock className="h-4 w-4 mr-2" />
								Password
							</div>
						</button>
						{profile.role === "volunteer" && (
							<button
								onClick={() => setActiveTab("availability")}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === "availability"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}>
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									Availability
								</div>
							</button>
						)}
						<button
							onClick={() => setActiveTab("deactivate")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "deactivate"
									? "border-emerald-500 text-emerald-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
							<div className="flex items-center">
								<AlertTriangle className="h-4 w-4 mr-2" />
								Deactivate
							</div>
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				{activeTab === "profile" && (
					<ProfilePage
						profile={profile}
						onProfileUpdate={handleProfileUpdate}
					/>
				)}

				{activeTab === "password" && <PasswordPage />}

				{activeTab === "availability" &&
					profile.role === "volunteer" && <AvailabilityPage />}

				{activeTab === "deactivate" && (
					<DeactivatePage
						profile={profile}
						onDeactivate={handleDeactivateAccount}
					/>
				)}

				{activeTab === "address" && <AddressesPage />}
			</div>
		</div>
	);
};

export default ProfileManagement;
