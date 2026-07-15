import { Route, Routes } from "react-router-dom";
import Dashboard from "./DonorDashboard";
import Log from "./LogFood";
import History from "./DonationHistory";
import Layout from "../../components/layout";
import Reports from "./TaxReports";
import { NotFoundPage } from "../../App";
import ActivePickups from "./ActivePickups";
import ActiveDonations from "./ActiveDonations";
import ProfileManagement from "./profile/index";

const Donor = () => {
	const donorOptions = [
		{ path: "/donor/", name: "Dashboard" },
		{ path: "/donor/active", name: "Active" },
		{ path: "/donor/pickups", name: "Pickups" },
		{ path: "/donor/log-food", name: "Log Food" },
		{ path: "/donor/history", name: "Donation History" },
		{ path: "/donor/profile", name: "Profile" },
		{ path: "/donor/reports", name: "Tax Reports" },
	];

	return (
		<Routes>
			<Route element={<Layout options={donorOptions} />}>
				<Route index element={<Dashboard />} />
				<Route path="/active" element={<ActiveDonations />} />
				<Route path="/pickups" element={<ActivePickups />} />
				<Route path="/log-food" element={<Log />} />
				<Route path="/history" element={<History />} />
				<Route path="/reports" element={<Reports />} />
				{/* <Route path="/profile" element={<ProfileManagement />} /> */}
				<Route path="/profile" element={<ProfileManagement />} />
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

export default Donor;
