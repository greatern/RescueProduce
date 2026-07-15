import { useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import type { UserProfile } from "./profile";

interface DeactivatePageProps {
	profile: UserProfile;
	onDeactivate: () => void;
}

const DeactivatePage = ({ profile, onDeactivate }: DeactivatePageProps) => {
	const [showDeactivateModal, setShowDeactivateModal] = useState(false);

	return (
		<>
			<div className="bg-white shadow overflow-hidden sm:rounded-lg">
				<div className="px-4 py-5 sm:px-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						Deactivate Account
					</h3>
					<p className="mt-1 max-w-2xl text-sm text-gray-500">
						This will disable your account and remove your personal
						information from public view.
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
									<p>Deactivating your account will:</p>
									<ul className="list-disc pl-5 space-y-1 mt-2">
										<li>
											Remove your profile from search
											results
										</li>
										<li>Cancel any pending assignments</li>
										<li>Prevent you from logging in</li>
										{profile.role === "volunteer" && (
											<li>
												Affect your volunteer reputation
												score
											</li>
										)}
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

			{/* Deactivation Confirmation Modal */}
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
											Are you sure you want to deactivate
											your account? This action cannot be
											undone.
										</p>
									</div>
								</div>
							</div>
							<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
								<button
									type="button"
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
									onClick={onDeactivate}>
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
		</>
	);
};

export default DeactivatePage;
