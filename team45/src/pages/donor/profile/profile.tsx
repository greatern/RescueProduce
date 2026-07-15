import React, { useState, useEffect } from "react";

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: "receiver" | "volunteer" | "donor" | "admin";
	organization?: string;
	address?: string;
	vehicleType?: string;
	capacity?: string;
	lastActive: string;
}

interface ProfilePageProps {
	profile: UserProfile;
	onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const ProfilePage = ({ profile, onProfileUpdate }: ProfilePageProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: profile.name,
		email: profile.email,
		phone: profile.phone,
		organization: profile.organization || "",
		address: profile.address || "",
		vehicleType: profile.vehicleType || "",
		capacity: profile.capacity || "",
	});

	useEffect(() => {
		setFormData({
			name: profile.name,
			email: profile.email,
			phone: profile.phone,
			organization: profile.organization || "",
			address: profile.address || "",
			vehicleType: profile.vehicleType || "",
			capacity: profile.capacity || "",
		});
	}, [profile]);

	const handleProfileUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		const updatedProfile = {
			...profile,
			...formData,
		};
		onProfileUpdate(updatedProfile);
		setIsEditing(false);
		alert("Profile updated successfully!");
	};

	return (
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
					Personal details and contact information.
				</p>
			</div>
			<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
				{isEditing ? (
					<form onSubmit={handleProfileUpdate}>
						<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<div className="text-sm font-medium text-gray-500">
								Full name
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
						{profile.role === "volunteer" && (
							<>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<div className="text-sm font-medium text-gray-500">
										Vehicle Type
									</div>
									<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										<input
											type="text"
											className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
											value={formData.vehicleType}
											onChange={(e) =>
												setFormData({
													...formData,
													vehicleType: e.target.value,
												})
											}
										/>
									</div>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<div className="text-sm font-medium text-gray-500">
										Capacity
									</div>
									<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										<input
											type="text"
											className="block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
											value={formData.capacity}
											onChange={(e) =>
												setFormData({
													...formData,
													capacity: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</>
						)}
						{profile.role === "receiver" && (
							<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
								<div className="text-sm font-medium text-gray-500">
									Organization
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
						)}
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
								Full name
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
								Role
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{profile.role}
							</dd>
						</div>
						{profile.role === "volunteer" && (
							<>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<dt className="text-sm font-medium text-gray-500">
										Vehicle Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{profile.vehicleType}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
									<dt className="text-sm font-medium text-gray-500">
										Capacity
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{profile.capacity}
									</dd>
								</div>
							</>
						)}
						{profile.role === "receiver" && (
							<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
								<dt className="text-sm font-medium text-gray-500">
									Organization
								</dt>
								<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{profile.organization}
								</dd>
							</div>
						)}
						{profile.address && (
							<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
								<dt className="text-sm font-medium text-gray-500">
									Address
								</dt>
								<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{profile.address}
								</dd>
							</div>
						)}
						{profile.lastActive && (
							<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
								<dt className="text-sm font-medium text-gray-500">
									Last Active
								</dt>
								<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{profile.lastActive}
								</dd>
							</div>
						)}
					</dl>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
