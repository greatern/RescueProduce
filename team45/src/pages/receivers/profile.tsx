import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, AlertTriangle, LogOut } from "lucide-react";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: "NGO" | "Volunteer" | "Donor" | "Admin";
	organization?: string;
	address?: string;
	lastActive: string;
}

const ProfileManagement: React.FC = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<
		"profile" | "password" | "deactivate"
	>("profile");
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [showDeactivateModal, setShowDeactivateModal] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		organization: "",
		address: "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	useEffect(() => {
		// Get actual user data from localStorage
		let userId = "receiver123";
		let userName = "Community Kitchen";
		let userEmail = "contact@communitykitchen.org";

		try {
			const userData = localStorage.getItem("user_data");
			if (userData) {
				const parsedUser = JSON.parse(userData);
				userId = parsedUser.id || userId;
				userName = parsedUser.name || userName;
				userEmail = parsedUser.email || userEmail;
			}
		} catch (error) {
			console.error("Error parsing user data from localStorage:", error);
		}

		if (userId) {
			// TODO: Replace with actual API call in production
			// fetchUserProfile(userId);

			// Use stored data with fallbacks
			const mockProfile: UserProfile = {
				id: userId,
				name: userName,
				email: userEmail,
				phone: "+27 123 456 789",
				role: "NGO",
				organization: userName + " Organization",
				address: "123 Community St, Cape Town",
				lastActive: "2025-09-25",
			};

			setProfile(mockProfile);
			setFormData({
				name: mockProfile.name,
				email: mockProfile.email,
				phone: mockProfile.phone,
				organization: mockProfile.organization || "",
				address: mockProfile.address || "",
			});
		}
	}, []);

	const handleProfileUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Add API call to update profile
		if (profile) {
			const updatedProfile = {
				...profile,
				...formData,
			};
			setProfile(updatedProfile);
			setIsEditing(false);

			alert("Profile updated successfully!");
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("New passwords don't match!");
			return;
		}

		try {
			const response = await fetch(`http://localhost:5001/api/users/${profile?.id}/change-password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					current_password: passwordData.currentPassword,
					new_password: passwordData.newPassword,
					confirm_password: passwordData.confirmPassword,
				}),
			});

			if (response.ok) {
				await response.json();
				alert("Password changed successfully!");
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
			} else {
				// Try to parse error response, but handle cases where it's not JSON
				let errorMessage = "Failed to change password";
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch (parseError) {
					errorMessage = response.statusText || errorMessage;
				}
				alert(errorMessage);
			}
		} catch (error) {
			console.error("Error changing password:", error);
			alert("Failed to change password. Please try again.");
		}
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

				{/* Nav */}
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

				{/* Profile Tab */}
				{activeTab === "profile" && (
					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Profile Information
								</h3>
								{!isEditing ? (
									<button
										onClick={() => setIsEditing(true)}
										className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
										Edit Profile
									</button>
								) : (
									<button
										onClick={() => setIsEditing(false)}
										className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
										Cancel
									</button>
								)}
							</div>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								Personal details and organization information.
							</p>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
							{isEditing ? (
								<form onSubmit={handleProfileUpdate}>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<div className="text-sm font-medium text-gray-500">
											Organization name
										</div>
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<input
												type="text"
												className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
												value={formData.name}
												onChange={(e) =>
													setFormData({
														...formData,
														name: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<div className="text-sm font-medium text-gray-500">
											Email address
										</div>
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<input
												type="email"
												className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
												value={formData.email}
												onChange={(e) =>
													setFormData({
														...formData,
														email: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<div className="text-sm font-medium text-gray-500">
											Phone number
										</div>
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<input
												type="tel"
												className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
												value={formData.phone}
												onChange={(e) =>
													setFormData({
														...formData,
														phone: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<div className="text-sm font-medium text-gray-500">
											Organization type
										</div>
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<input
												type="text"
												className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
												value={formData.organization}
												onChange={(e) =>
													setFormData({
														...formData,
														organization: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<div className="text-sm font-medium text-gray-500">
											Address
										</div>
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<input
												type="text"
												className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
												value={formData.address}
												onChange={(e) =>
													setFormData({
														...formData,
														address: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
										<button
											type="submit"
											className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
											Save Changes
										</button>
									</div>
								</form>
							) : (
								<dl>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<dt className="text-sm font-medium text-gray-500">
											Organization name
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.name}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<dt className="text-sm font-medium text-gray-500">
											Email address
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.email}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<dt className="text-sm font-medium text-gray-500">
											Phone number
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.phone}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<dt className="text-sm font-medium text-gray-500">
											Organization type
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.organization}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<dt className="text-sm font-medium text-gray-500">
											Address
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.address}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
										<dt className="text-sm font-medium text-gray-500">
											Last Active
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{profile.lastActive}
										</dd>
									</div>
								</dl>
							)}
						</div>
					</div>
				)}

				{/* Password Tab */}
				{activeTab === "password" && (
					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Change Password
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								Update your account password
							</p>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
							<form onSubmit={handlePasswordChange}>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<label
										htmlFor="currentPassword"
										className="block text-sm font-medium text-gray-500">
										Current Password
									</label>
									<div className="mt-1 sm:mt-0 sm:col-span-2">
										<input
											type="password"
											id="currentPassword"
											className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
											value={passwordData.currentPassword}
											onChange={(e) =>
												setPasswordData({
													...passwordData,
													currentPassword:
														e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<label
										htmlFor="newPassword"
										className="block text-sm font-medium text-gray-500">
										New Password
									</label>
									<div className="mt-1 sm:mt-0 sm:col-span-2">
										<input
											type="password"
											id="newPassword"
											className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
											value={passwordData.newPassword}
											onChange={(e) =>
												setPasswordData({
													...passwordData,
													newPassword: e.target.value,
												})
											}
											required
											minLength={8}
										/>
										<p className="mt-2 text-sm text-gray-500">
											Password must be at least 8 characters long and contain uppercase, lowercase, and number
										</p>
									</div>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-500">
										Confirm New Password
									</label>
									<div className="mt-1 sm:mt-0 sm:col-span-2">
										<input
											type="password"
											id="confirmPassword"
											className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
											value={passwordData.confirmPassword}
											onChange={(e) =>
												setPasswordData({
													...passwordData,
													confirmPassword:
														e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
									<button
										type="submit"
										className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
										Change Password
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Deactivate Account Tab */}
				{activeTab === "deactivate" && (
					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Deactivate Account
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								This will disable your account and remove your
								personal information from public view.
							</p>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:px-6">
							<div className="rounded-md bg-red-50 p-4">
								<div className="flex">
									<div className="flex-shrink-0">
										<AlertTriangle
											className="h-5 w-5 text-red-400"
											aria-hidden="true"
										/>
									</div>
									<div className="ml-3">
										<h3 className="text-sm font-medium text-red-800">
											Warning
										</h3>
										<div className="mt-2 text-sm text-red-700">
											<p>
												Deactivating your account will:
											</p>
											<ul className="list-disc pl-5 space-y-1 mt-2">
												<li>
													Remove your profile from
													search results
												</li>
												<li>
													Cancel any pending food requests
												</li>
												<li>
													Prevent you from logging in
												</li>
												<li>
													Affect your organization's ability to receive donations
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							<div className="mt-5">
								<button
									onClick={() => setShowDeactivateModal(true)}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
									<LogOut className="h-4 w-4 mr-2" />
									Deactivate Account
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Deactivate Modal */}
				{showDeactivateModal && (
					<div className="fixed z-10 inset-0 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
							<div
								className="fixed inset-0 transition-opacity"
								aria-hidden="true">
								<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
							</div>
							<span
								className="hidden sm:inline-block sm:align-middle sm:h-screen"
								aria-hidden="true">
								&#8203;
							</span>
							<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
								<div>
									<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
										<AlertTriangle className="h-6 w-6 text-red-600" />
									</div>
									<div className="mt-3 text-center sm:mt-5">
										<h3 className="text-lg leading-6 font-medium text-gray-900">
											Confirm Account Deactivation
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Are you sure you want to
												deactivate your account? This
												action cannot be undone.
											</p>
										</div>
									</div>
								</div>
								<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
									<button
										type="button"
										className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
										onClick={handleDeactivateAccount}>
										Deactivate Account
									</button>
									<button
										type="button"
										className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:col-start-1 sm:text-sm"
										onClick={() =>
											setShowDeactivateModal(false)
										}>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfileManagement;