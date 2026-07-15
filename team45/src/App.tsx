import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Layout from "./components/layout";




// Volunteer pages
import VolunteerHome from "./pages/volunteers/VolunteerHome";
import VolunteerTasks from "./pages/volunteers/Tasks";
import VolunteerAvailability from "./pages/volunteers/Availability";
import VolunteerProfile from "./pages/volunteers/Profile";

// Donor pages
import DonorHome from "./pages/donor/DonorHome";
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorLogFood from "./pages/donor/LogFood";
import DonorDonationHistory from "./pages/donor/DonationHistory";
import DonorImpactReports from "./pages/donor/ImpactReports";
import DonorTaxReports from "./pages/donor/TaxReports";

// Receiver pages
import ReceiverHome from "./pages/receivers/home";
import ReceiverDonations from "./pages/receivers/ClaimHistory";
import ReceiverDetail from "./pages/receivers/donation_detail";
import ReceiverProfile from "./pages/receivers/profile";
import VerificationSubmission from "./pages/receivers/VerificationSubmission";
import TestVerification from "./pages/receivers/TestVerification";
// Admin pages

import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import VerificationCenter from "./pages/admin/VerificationCenter";

// Authorization pages
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
//general
import Home from "./pages/home";
import { AuthProvider } from "./contexts/AuthProvider";
import Volunteer from "./pages/volunteers";
import Donor from "./pages/donor";
import Receiver from "./pages/receivers";
import Admin from "./pages/admin";
import NotificationsPage from "./pages/NotificationsPage";

// ReceiverProfile component is now imported from the actual profile page
const ReceiverRequestItem = () => (
	<div className="main-content min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
		<h3 className="text-2xl font-bold">Request Item Page (Placeholder)</h3>
	</div>
);
const ReceiverViewRequests = () => (
	<div className="main-content min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
		<h3 className="text-2xl font-bold">
			View My Requests Page (Placeholder)
		</h3>
	</div>
);

const volunteerOptions = [
	{ path: "home", name: "Dashboard" },
	{ path: "tasks", name: "Tasks" },
	{ path: "availability", name: "Availability" },
	{ path: "confirm-delivery", name: "Confirm Delivery" },
	{ path: "report-fraud", name: "Report Fraud" },
	{ path: "profile", name: "Profile" },
];

const donorOptions = [
	{ path: "home", name: "Home" },
	{ path: "log-food", name: "Log Food" },
	{ path: "dashboard", name: "Dashboard" },
	{ path: "history", name: "Donation History" },
	{ path: "tax-reports", name: "Tax Reports" },
	{ path: "impact-reports", name: "Impact Reports" },
];

const receiverOptions = [
	{ path: "home", name: "Dashboard" },
	{ path: "verification", name: "Verification" },
	{ path: "request-item", name: "Request Item" },
	{ path: "donations", name: "View Donations" },
	{ path: "profile", name: "Profile" },
];

const adminOptions = [
	{ path: "dashboard", name: "Dashboard" },
	{ path: "Verifications", name: "Verification Center" },
	{ path: "user-management", name: "User Management" },
	{ path: "reports", name: "Reports" },
];

interface ProtectedRouteProps {
	allowedRoles: string[];
	options: { path: string; name: string }[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	allowedRoles,
	options,
}) => {
	// Get user data from the correct localStorage key
	let userRole: string | null = null;
	let userId: string | null = null;

	try {
		const userData = localStorage.getItem("user_data");
		if (userData) {
			const parsedUser = JSON.parse(userData);
			userRole = parsedUser?.role || null;
			userId = parsedUser?.id || null;
		}
	} catch (error) {
		console.error("Error parsing user data in ProtectedRoute:", error);
	}

	if (!userId || !userRole) {
		return <Navigate to="/login" replace />;
	}

	if (!allowedRoles.includes(userRole)) {
		switch (userRole) {
			case "volunteer":
				return <Navigate to="/volunteer/home" replace />;
			case "donor":
				return <Navigate to="/donor/home" replace />;
			case "receiver":
				return <Navigate to="/receiver/home" replace />;
			case "admin":
				return <Navigate to="/admin/dashboard" replace />;
			default:
				return <Navigate to="/login" replace />;
		}
	}

	return <Layout options={options} />;
};

export const NotFoundPage: React.FC<{
	isAuthenticated?: boolean;
	userRole?: string | null;
}> = ({ isAuthenticated, userRole }) => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex-col">
			<h2 className="text-3xl font-extrabold">404 - Page Not Found</h2>
			<button
				onClick={() =>
					navigate(
						isAuthenticated && userRole
							? `/${userRole}/home`
							: "/login"
					)
				}
				className="mt-4 btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
				{isAuthenticated ? "Go to Dashboard" : "Go to Login"}
			</button>
		</div>
	);
};

const AppContent: React.FC = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userRole, setUserRole] = useState<string | null>(null);

	useEffect(() => {
		// Check for user data in the correct localStorage key
		const checkAuthState = () => {
			try {
				const userData = localStorage.getItem("user_data");
				if (userData) {
					const parsedUser = JSON.parse(userData);
					if (parsedUser && parsedUser.id && parsedUser.role) {
						setIsAuthenticated(true);
						setUserRole(parsedUser.role);
						return;
					}
				}
			} catch (error) {
				console.error("Error parsing user data:", error);
			}

			setIsAuthenticated(false);
			setUserRole(null);
		};

		checkAuthState();

		const handleStorageChange = () => {
			checkAuthState();
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	return (
		<>
			<Header />
			<Routes>
				<Route path="/login" element={<SignIn />} />
				<Route path="/register" element={<SignUp />} />
				{/* 
				<Route path="/debug-auth" element={<DebugAuth />} /> */}
				<Route path="/home" element={<Home />} />
				<Route
					path="/"
					element={
						isAuthenticated ? (
							userRole === "volunteer" ? (
								<Navigate to="/volunteer/home" replace />
							) : userRole === "donor" ? (
								<Navigate to="/donor/home" replace />
							) : userRole === "receiver" ? (
								<Navigate to="/receiver/home" replace />
							) : userRole === "admin" ? (
								<Navigate to="/admin/dashboard" replace />
							) : (
								<Navigate to="/login" replace />
							)
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>
				<Route
					path="/volunteer"
					element={
						<ProtectedRoute
							allowedRoles={["volunteer"]}
							options={volunteerOptions}
						/>
					}>
					<Route index element={<VolunteerHome />} />
					<Route path="home" element={<VolunteerHome />} />
					<Route path="tasks" element={<VolunteerTasks />} />
					<Route
						path="availability"
						element={<VolunteerAvailability />}
					/>
					<Route path="profile" element={<VolunteerProfile />} />
				</Route>
				<Route
					path="/donor"
					element={
						<ProtectedRoute
							allowedRoles={["donor"]}
							options={donorOptions}
						/>
					}>
					<Route index element={<DonorHome />} />
					<Route path="home" element={<DonorHome />} />
					<Route path="dashboard" element={<DonorDashboard />} />
					<Route path="log-food" element={<DonorLogFood />} />
					<Route path="history" element={<DonorDonationHistory />} />
					<Route
						path="impact-reports"
						element={<DonorImpactReports />}
					/>
					<Route path="tax-reports" element={<DonorTaxReports />} />
				</Route>
				<Route
					path="/receiver"
					element={
						<ProtectedRoute
							allowedRoles={["receiver"]}
							options={receiverOptions}
						/>
					}>
					<Route index element={<ReceiverHome />} />
					<Route path="home" element={<ReceiverHome />} />
					<Route
						path="verification"
						element={<VerificationSubmission />}
					/>
					<Route
						path="test-verification"
						element={<TestVerification />}
					/>
					<Route path="donations" element={<ReceiverDonations />} />
					<Route path="detail" element={<ReceiverDetail />} />
					<Route path="profile" element={<ReceiverProfile />} />
					<Route
						path="request-item"
						element={<ReceiverRequestItem />}
					/>
					<Route
						path="view-requests"
						element={<ReceiverViewRequests />}
					/>
				</Route>
				<Route
					path="/admin"
					element={
						<ProtectedRoute
							allowedRoles={["admin"]}
							options={adminOptions}
						/>
					}>
					<Route index element={<Dashboard />} />
					<Route path="dashboard" element={<Dashboard />} />
					<Route
						path="VerificationCenter"
						element={<VerificationCenter />}
					/>
					<Route
						path="user-management"
						element={<UserManagement />}
					/>
					<Route path="reports" element={<Reports />} />
				</Route>
				<Route
					path="*"
					element={
						<NotFoundPage
							isAuthenticated={isAuthenticated}
							userRole={userRole}
						/>
					}
				/>
			</Routes>
		</>
	);
};

const App = () => {
	return (
		<Routes>
			<Route element={<AuthProvider />}>
				<Route index element={<Home />} />
				<Route path="/login" element={<SignIn />} />
				<Route path="/register" element={<SignUp />} />
				<Route path="/notifications" element={<NotificationsPage />} />
				<Route path="/volunteer/*" element={<Volunteer />} />
				<Route path="/donor/*" element={<Donor />} />
				<Route path="/admin/*" element={<Admin />} />
				<Route path="/receiver/*" element={<Receiver />} />
				<Route
					path="*"
					element={
						<NotFoundPage isAuthenticated={false} userRole={""} />
					}
				/>
			</Route>
		</Routes>
	);
};

export default App;
