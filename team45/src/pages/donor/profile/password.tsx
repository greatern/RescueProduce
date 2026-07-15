import React, { useState } from "react";
import { Lock } from "lucide-react";

const PasswordPage: React.FC = () => {
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handlePasswordChange = (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("New passwords don't match!");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			alert("Password must be at least 8 characters long!");
			return;
		}

		// API call would go here
		alert("Password updated successfully!");

		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<div className="flex items-center">
						<Lock className="h-8 w-8 mr-3 text-emerald-600" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Password
							</h1>
							<p className="text-gray-600">
								Update your account password
							</p>
						</div>
					</div>
				</header>

				<div className="bg-white shadow overflow-hidden sm:rounded-lg">
					<div className="px-4 py-5 sm:px-6">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Change Password
						</h3>
						<p className="mt-1 max-w-2xl text-sm text-gray-500">
							Update your account password for security
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
												currentPassword: e.target.value,
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
										Password must be at least 8 characters
										long
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
												confirmPassword: e.target.value,
											})
										}
										required
									/>
									{passwordData.newPassword &&
										passwordData.confirmPassword &&
										passwordData.newPassword !==
											passwordData.confirmPassword && (
											<p className="mt-2 text-sm text-red-600">
												Passwords do not match
											</p>
										)}
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

				{/* Security Tips */}
				<div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
					<div className="px-4 py-5 sm:px-6">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Password Security Tips
						</h3>
					</div>
					<div className="border-t border-gray-200 px-4 py-5 sm:px-6">
						<ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
							<li>
								Use at least 8 characters with a mix of letters,
								numbers, and symbols
							</li>
							<li>
								Avoid common words, phrases, or personal
								information
							</li>
							<li>Don't reuse passwords from other accounts</li>
							<li>Consider using a password manager</li>
							<li>
								Change your password regularly, especially if
								you suspect it's been compromised
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PasswordPage;
