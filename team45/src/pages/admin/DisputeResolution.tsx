import { useEffect, useState } from "react";
import { PushNotificationSetup } from "../../components/PushNotificationSetup";
import { useAuth } from "../../contexts/AuthProvider";

interface User {
	id: string;
	name: string;
	email: string;
	phone?: string;
	user_type: string;
}

interface FraudCase {
	id: string;
	task_id: string;
	claim_id: string;
	reporter_id: string;
	description: string;
	issue_type: string;
	evidence_files: string[];
	status:
		| "open"
		| "under_investigation"
		| "resolved"
		| "dismissed"
		| "reopened";
	severity_level: "low" | "medium" | "high";
	resolution_details?: string;
	date_reported: string;
	date_resolved?: string;
	date_reopened?: string;
	created_at: string;
	updated_at: string;
	reporter?: User;
	task?: {
		id: string;
		title: string;
		status: string;
		due_date: string;
		assigned_volunteer?: User;
		volunteer?: { user?: User };
	};
	claim?: {
		id: string;
		food_listing?: {
			donor?: { id: string; user?: User };
			donor_user?: User;
		};
	};
}

interface ResolutionAction {
	type:
		| "warning"
		| "penalty"
		| "temporarily_block"
		| "apply_penalty"
		| "dismiss"
		| "resolve";
	target_user_id?: string;
	target_role?: "volunteer" | "donor" | "reporter";
	severity: "low" | "medium" | "high";
	message: string;
	reason?: string;
	duration?: number;
	points?: number;
	penalty_type?: string;
}

interface Analytics {
	totalCases: number;
	openCases: number;
	highSeverityCases: number;
	resolutionRate: string;
}

const DisputeResolution = () => {
	const { user } = useAuth();
	const [fraudCases, setFraudCases] = useState<FraudCase[]>([]);
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
	const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

	const [filters, setFilters] = useState({
		status: "",
		severity: "",
		search: "",
	});
	const [pagination, setPagination] = useState({
		limit: 20,
		offset: 0,
		total: 0,
	});
	const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
	const [resolutionDetails, setResolutionDetails] = useState("");
	const [selectedAction, setSelectedAction] = useState<ResolutionAction>({
		type: "resolve",
		target_user_id: "",
		target_role: undefined,
		severity: "low",
		message: "",
	});
	const [resolving, setResolving] = useState(false);
	const [showEvidenceModal, setShowEvidenceModal] = useState(false);
	const [currentEvidence, setCurrentEvidence] = useState<string[]>([]);
	const [showResolutionModal, setShowResolutionModal] = useState(false);

	const fetchFraudCases = async () => {
		try {
			setLoading(true);
			const queryParams = new URLSearchParams({
				limit: pagination.limit.toString(),
				offset: pagination.offset.toString(),
				...(filters.status && { status: filters.status }),
				...(filters.severity && { severity: filters.severity }),
			});
			const res = await fetch(`${apiUrl}/api/fraudcases?${queryParams}`);
			if (!res.ok) throw new Error(await res.text());
			const response = await res.json();
			setFraudCases(response.data.reports || []);
			setAnalytics(response.data.analytics || null);
			setPagination((prev) => ({
				...prev,
				total:
					response.data.pagination?.total ||
					response.data.reports?.length ||
					0,
			}));
			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to fetch fraud cases");
			setFraudCases([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFraudCases();
	}, [filters.status, filters.severity, pagination.offset]);

	const getInvolvedParties = (fraudCase: FraudCase): User[] => {
		const parties: User[] = [];
		if (fraudCase.reporter)
			parties.push({
				...fraudCase.reporter,
				user_type: "reporter",
				name: fraudCase.reporter.name || "Unknown Reporter",
			});
		if (fraudCase.task?.assigned_volunteer)
			parties.push({
				...fraudCase.task.assigned_volunteer,
				user_type: "volunteer",
				name:
					fraudCase.task.assigned_volunteer.name ||
					"Unknown Volunteer",
			});
		if (fraudCase.task?.volunteer?.user)
			parties.push({
				...fraudCase.task.volunteer.user,
				user_type: "volunteer",
				name: fraudCase.task.volunteer.user.name || "Unknown Volunteer",
			});
		if (fraudCase.claim?.food_listing?.donor_user)
			parties.push({
				...fraudCase.claim.food_listing.donor_user,
				user_type: "donor",
				name:
					fraudCase.claim.food_listing.donor_user.name ||
					"Unknown Donor",
			});
		if (fraudCase.claim?.food_listing?.donor?.user)
			parties.push({
				...fraudCase.claim.food_listing.donor.user,
				user_type: "donor",
				name:
					fraudCase.claim.food_listing.donor.user.name ||
					"Unknown Donor",
			});
		return parties.filter(
			(party, index, self) =>
				index === self.findIndex((p) => p.id === party.id)
		);
	};

	const resolveFraudCase = async (
		caseId: string,
		action: ResolutionAction,
		details: string
	) => {
		setResolving(true);
		try {
			console.log("=== RESOLVING FRAUD CASE ===");
			console.log("Case ID:", caseId);
			console.log("Current User:", user);
			console.log("Action:", action);
			console.log("Details:", details);

			// Validate required fields
			if (!user?.id) {
				throw new Error("User not authenticated");
			}

			if (
				(action.type === "temporarily_block" ||
					action.type === "apply_penalty") &&
				!action.target_user_id
			) {
				throw new Error("Please select a user to apply this action to");
			}

			// Build the request payload with proper mapping
			const payload: any = {
				resolution_details: details,
				status: action.type === "dismiss" ? "dismissed" : "resolved",
				admin_id: user.id, // CRITICAL: Add admin_id
			};

			// Only include action_taken if it's not a simple resolve/dismiss
			if (action.type !== "resolve" && action.type !== "dismiss") {
				payload.action_taken = {
					type: action.type, // Use the mapped type directly
					target_user_id: action.target_user_id,
					reason: action.message || details,
					duration: action.duration || 7, // Default to 7 days if not specified
					points: action.points || 10, // Default to 10 points if not specified
					penalty_type:
						action.type === "apply_penalty" ? "warning" : undefined,
				};

				// Remove undefined fields
				if (action.type !== "temporarily_block") {
					delete payload.action_taken.duration;
				}
				if (action.type !== "apply_penalty") {
					delete payload.action_taken.points;
					delete payload.action_taken.penalty_type;
				}
			}

			console.log("Sending payload:", JSON.stringify(payload, null, 2));

			const res = await fetch(
				`${apiUrl}/api/fraudcases/${caseId}/resolve`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);

			const responseData = await res.json();
			console.log("Response:", responseData);

			if (!res.ok) {
				throw new Error(responseData.message || "Error resolving case");
			}

			alert(
				"Case resolved successfully! Notifications will be sent to involved parties."
			);
			setShowResolutionModal(false);
			setSelectedCase(null);
			setResolutionDetails("");
			setSelectedAction({
				type: "resolve",
				target_user_id: "",
				target_role: undefined,
				severity: "low",
				message: "",
			});
			await fetchFraudCases();
		} catch (err: any) {
			console.error("Error resolving case:", err);
			alert(`Failed to resolve case: ${err.message}`);
		} finally {
			setResolving(false);
		}
	};

	const reopenCase = async (caseId: string, reason: string) => {
		try {
			const res = await fetch(
				`${apiUrl}/api/fraudcases/${caseId}/reopen`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ reason }),
				}
			);
			if (!res.ok) throw new Error("Error reopening case");
			alert("Case reopened successfully!");
			await fetchFraudCases();
		} catch (err: any) {
			alert(`Failed to reopen case: ${err.message}`);
		}
	};

	const filteredCases = fraudCases.filter((caseItem) => {
		if (!filters.search) return true;
		const searchTerm = filters.search.toLowerCase();
		return (
			(caseItem.description || "").toLowerCase().includes(searchTerm) ||
			(caseItem.reporter?.name || "")
				.toLowerCase()
				.includes(searchTerm) ||
			(caseItem.reporter?.email || "")
				.toLowerCase()
				.includes(searchTerm) ||
			(caseItem.id || "").toLowerCase().includes(searchTerm)
		);
	});

	if (loading)
		return (
			<div className="flex justify-center items-center min-h-[60vh] text-lg text-gray-600">
				Loading fraud cases...
			</div>
		);

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-6">
			{user && vapidPublicKey && (
				<PushNotificationSetup
					userId={user.id}
					vapidPublicKey={vapidPublicKey}
				/>
			)}

			<header className="text-center">
				<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
					Fraud Case Management
				</h1>
				<p className="text-gray-500">
					Admin dashboard for reviewing and resolving all reported
					fraud cases
				</p>
			</header>

			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white p-4 rounded-lg shadow border">
						<h3 className="text-lg font-semibold text-gray-700">
							Total Cases
						</h3>
						<p className="text-2xl font-bold text-blue-600">
							{analytics.totalCases}
						</p>
					</div>
					<div className="bg-white p-4 rounded-lg shadow border">
						<h3 className="text-lg font-semibold text-gray-700">
							Open Cases
						</h3>
						<p className="text-2xl font-bold text-yellow-600">
							{analytics.openCases}
						</p>
					</div>
					<div className="bg-white p-4 rounded-lg shadow border">
						<h3 className="text-lg font-semibold text-gray-700">
							High Severity
						</h3>
						<p className="text-2xl font-bold text-red-600">
							{analytics.highSeverityCases}
						</p>
					</div>
					<div className="bg-white p-4 rounded-lg shadow border">
						<h3 className="text-lg font-semibold text-gray-700">
							Resolution Rate
						</h3>
						<p className="text-2xl font-bold text-green-600">
							{analytics.resolutionRate}%
						</p>
					</div>
				</div>
			)}

			<div className="bg-white p-4 rounded-lg shadow border">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							value={filters.status}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									status: e.target.value,
								}))
							}
							className="w-full border rounded-lg p-2">
							<option value="">All Statuses</option>
							<option value="open">Open</option>
							<option value="under_investigation">
								Under Investigation
							</option>
							<option value="resolved">Resolved</option>
							<option value="dismissed">Dismissed</option>
							<option value="reopened">Reopened</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Severity
						</label>
						<select
							value={filters.severity}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									severity: e.target.value,
								}))
							}
							className="w-full border rounded-lg p-2">
							<option value="">All Severities</option>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Search
						</label>
						<input
							type="text"
							value={filters.search}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									search: e.target.value,
								}))
							}
							placeholder="Search cases..."
							className="w-full border rounded-lg p-2"
						/>
					</div>
					<div className="flex items-end">
						<button
							onClick={fetchFraudCases}
							className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
							Refresh Cases
						</button>
					</div>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
					<span>{error}</span>
					<button
						onClick={fetchFraudCases}
						className="ml-4 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
						Retry
					</button>
				</div>
			)}

			{filteredCases.length === 0 ? (
				<div className="text-center text-gray-500 py-10 bg-white rounded-lg">
					No fraud cases found matching your criteria.
				</div>
			) : (
				<div className="space-y-6">
					{filteredCases.map((caseItem) => (
						<div
							key={caseItem.id}
							className="bg-white rounded-lg shadow border p-6">
							<div className="flex justify-between items-start flex-wrap gap-3 mb-4">
								<div>
									<h3 className="text-xl font-bold text-gray-800">
										Case #
										{caseItem.id.slice(-8).toUpperCase()}
									</h3>
									<div className="flex items-center gap-2 mt-2 flex-wrap">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												caseItem.status === "open"
													? "bg-yellow-100 text-yellow-800"
													: caseItem.status ===
													  "under_investigation"
													? "bg-blue-100 text-blue-800"
													: caseItem.status ===
													  "reopened"
													? "bg-orange-100 text-orange-800"
													: "bg-green-100 text-green-800"
											}`}>
											{caseItem.status
												.replace("_", " ")
												.toUpperCase()}
										</span>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												caseItem.severity_level ===
												"high"
													? "bg-red-100 text-red-800"
													: caseItem.severity_level ===
													  "medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-green-100 text-green-800"
											}`}>
											{caseItem.severity_level.toUpperCase()}{" "}
											SEVERITY
										</span>
										<span className="text-gray-500 text-sm">
											{new Date(
												caseItem.date_reported
											).toLocaleDateString()}
										</span>
									</div>
								</div>
								{caseItem.status !== "resolved" &&
									caseItem.status !== "dismissed" && (
										<button
											onClick={() => {
												setSelectedCase(caseItem);
												setShowResolutionModal(true);
											}}
											className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
											Resolve Case
										</button>
									)}
								{(caseItem.status === "resolved" ||
									caseItem.status === "dismissed") && (
									<button
										onClick={() => {
											const reason = prompt(
												"Reason for reopening:"
											);
											if (reason)
												reopenCase(caseItem.id, reason);
										}}
										className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
										Reopen Case
									</button>
								)}
							</div>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-gray-700 mb-1">
											Description
										</h4>
										<p className="text-gray-600">
											{caseItem.description}
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-gray-700 mb-1">
											Reporter
										</h4>
										<p className="text-gray-600">
											{caseItem.reporter?.name ||
												"Unknown"}{" "}
											({caseItem.reporter?.email || "N/A"}
											)
											<span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
												{caseItem.reporter?.user_type ||
													"N/A"}
											</span>
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-gray-700 mb-1">
											Issue Type
										</h4>
										<p className="text-gray-600 capitalize">
											{caseItem.issue_type.replace(
												"_",
												" "
											)}
										</p>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-gray-700 mb-1">
											Evidence
										</h4>
										{caseItem.evidence_files.length > 0 ? (
											<div className="flex flex-wrap gap-2">
												{caseItem.evidence_files
													.slice(0, 3)
													.map((file, i) => (
														<img
															key={i}
															src={`${apiUrl}/uploads/${file}`}
															alt="Evidence"
															className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition"
															onClick={() => {
																setCurrentEvidence(
																	caseItem.evidence_files
																);
																setShowEvidenceModal(
																	true
																);
															}}
														/>
													))}
												{caseItem.evidence_files
													.length > 3 && (
													<span className="text-gray-500 text-sm mt-2">
														+
														{caseItem.evidence_files
															.length - 3}{" "}
														more
													</span>
												)}
											</div>
										) : (
											<p className="text-gray-500 text-sm">
												No evidence uploaded
											</p>
										)}
									</div>
									<div>
										<h4 className="font-semibold text-gray-700 mb-1">
											Involved Parties
										</h4>
										<div className="flex flex-wrap gap-2">
											{getInvolvedParties(caseItem).map(
												(p) => (
													<span
														key={p.id}
														className="px-2 py-1 bg-gray-100 rounded text-sm">
														{p.name} ({p.user_type})
													</span>
												)
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{pagination.total > pagination.limit && (
				<div className="flex justify-center items-center space-x-4">
					<button
						onClick={() =>
							setPagination((prev) => ({
								...prev,
								offset: Math.max(0, prev.offset - prev.limit),
							}))
						}
						disabled={pagination.offset === 0}
						className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300">
						Previous
					</button>
					<span className="text-gray-600">
						Page{" "}
						{Math.floor(pagination.offset / pagination.limit) + 1}{" "}
						of {Math.ceil(pagination.total / pagination.limit)}
					</span>
					<button
						onClick={() =>
							setPagination((prev) => ({
								...prev,
								offset: prev.offset + prev.limit,
							}))
						}
						disabled={
							pagination.offset + pagination.limit >=
							pagination.total
						}
						className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300">
						Next
					</button>
				</div>
			)}

			{showResolutionModal && selectedCase && (
				<div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
					<div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto p-6">
						<h2 className="text-xl font-bold text-gray-800">
							Resolve Case #
							{selectedCase.id.slice(-8).toUpperCase()}
						</h2>
						<div className="space-y-4 mt-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Resolution Action
								</label>
								<select
									value={selectedAction.type}
									onChange={(e) => {
										const actionType = e.target
											.value as ResolutionAction["type"];
										setSelectedAction((prev) => ({
											...prev,
											type: actionType,
											// Clear target if dismiss or resolve
											target_user_id:
												actionType === "dismiss" ||
												actionType === "resolve"
													? ""
													: prev.target_user_id,
										}));
									}}
									className="w-full border rounded-lg p-2">
									<option value="resolve">
										Resolve (No Action)
									</option>
									<option value="warning">
										Issue Warning
									</option>
									<option value="apply_penalty">
										Apply Penalty
									</option>
									<option value="temporarily_block">
										Temporary Block
									</option>
									<option value="dismiss">
										Dismiss Case
									</option>
								</select>
							</div>

							{(selectedAction.type === "warning" ||
								selectedAction.type === "apply_penalty" ||
								selectedAction.type ===
									"temporarily_block") && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Apply To *
									</label>
									<select
										value={selectedAction.target_user_id}
										onChange={(e) => {
											const selectedValue =
												e.target.value;
											if (selectedValue) {
												const [userId, userType] =
													selectedValue.split("|");
												setSelectedAction((prev) => ({
													...prev,
													target_user_id: userId,
													target_role:
														userType as ResolutionAction["target_role"],
												}));
											} else {
												setSelectedAction((prev) => ({
													...prev,
													target_user_id: "",
													target_role: undefined,
												}));
											}
										}}
										className="w-full border rounded-lg p-2"
										required>
										<option value="">Select User</option>
										{getInvolvedParties(selectedCase).map(
											(party) => (
												<option
													key={party.id}
													value={`${party.id}|${party.user_type}`}>
													{party.name ||
														"Unknown User"}{" "}
													({party.user_type})
												</option>
											)
										)}
									</select>
									{selectedAction.target_user_id && (
										<p className="text-sm text-green-600 mt-1">
											Selected:{" "}
											{getInvolvedParties(
												selectedCase
											).find(
												(p) =>
													p.id ===
													selectedAction.target_user_id
											)?.name || "Unknown User"}
										</p>
									)}
									{!selectedAction.target_user_id && (
										<p className="text-sm text-red-600 mt-1">
											* Required: Please select a user to
											apply this action to
										</p>
									)}
								</div>
							)}

							{selectedAction.type === "apply_penalty" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Penalty Points
									</label>
									<input
										type="number"
										value={selectedAction.points || 10}
										onChange={(e) =>
											setSelectedAction((prev) => ({
												...prev,
												points:
													parseInt(e.target.value) ||
													10,
											}))
										}
										className="w-full border rounded-lg p-2"
										min="1"
										max="100"
									/>
								</div>
							)}

							{selectedAction.type === "temporarily_block" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Block Duration (days)
									</label>
									<input
										type="number"
										value={selectedAction.duration || 7}
										onChange={(e) =>
											setSelectedAction((prev) => ({
												...prev,
												duration:
													parseInt(e.target.value) ||
													7,
											}))
										}
										className="w-full border rounded-lg p-2"
										min="1"
										max="365"
									/>
								</div>
							)}

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Action Message
								</label>
								<input
									type="text"
									value={selectedAction.message}
									onChange={(e) =>
										setSelectedAction((prev) => ({
											...prev,
											message: e.target.value,
										}))
									}
									placeholder="Explain the action taken..."
									className="w-full border rounded-lg p-2"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Resolution Details *
								</label>
								<textarea
									value={resolutionDetails}
									onChange={(e) =>
										setResolutionDetails(e.target.value)
									}
									placeholder="Describe the resolution..."
									className="w-full border rounded-lg p-3 min-h-[100px]"
									required
								/>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button
									onClick={() => {
										setShowResolutionModal(false);
										setSelectedCase(null);
										setSelectedAction({
											type: "resolve",
											target_user_id: "",
											target_role: undefined,
											severity: "low",
											message: "",
										});
									}}
									className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
									disabled={resolving}>
									Cancel
								</button>
								<button
									onClick={() =>
										resolveFraudCase(
											selectedCase.id,
											selectedAction,
											resolutionDetails
										)
									}
									disabled={
										!resolutionDetails.trim() ||
										resolving ||
										((selectedAction.type === "warning" ||
											selectedAction.type ===
												"apply_penalty" ||
											selectedAction.type ===
												"temporarily_block") &&
											!selectedAction.target_user_id)
									}
									className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
									{resolving
										? "Processing..."
										: "Submit Resolution"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showEvidenceModal && (
				<div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
					<div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-800">
								Evidence Files
							</h2>
							<button
								onClick={() => setShowEvidenceModal(false)}
								className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
								Close
							</button>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{currentEvidence.map((file, index) => (
								<div key={index} className="text-center">
									<img
										src={`${apiUrl}/uploads/${file}`}
										alt={`Evidence ${index + 1}`}
										className="w-full h-48 object-cover rounded-lg border hover:scale-105 transition cursor-pointer"
										onClick={() =>
											window.open(
												`${apiUrl}/uploads/${file}`
											)
										}
									/>
									<p className="mt-2 text-sm text-gray-600">
										Evidence {index + 1}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DisputeResolution;
