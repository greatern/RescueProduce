import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import UserManagement from "./UserManagement";
import Layout from "../../components/layout";
import { NotFoundPage } from "../../App";
import VerificationCenter from "./VerificationCenter";
import DisputeResolution from "./DisputeResolution";
import DonationOversight from "./DonationOversight";
import SystemSettings from "./SystemSettings";
import AppealsManagement from "./adminAppeals";



const Admin = () => {
	const adminOptions = [
		{ path: "/admin/", name: "Dashboard" },
		{ path: "/admin/verification", name: " Verification Center" },
		{ path: "/admin/dispute-resolution", name: "Dispute Resolution" },
		{ path: "/admin/donation-oversight", name: "Donation Oversight" },
		{ path: "/admin/user-management", name: "User Management" },
		{ path: "/admin/reports", name: "Reports" },
		{ path: "/admin/system-settings", name: "Settings" },
	];
	return (
		<Routes>
			<Route element={<Layout options={adminOptions} />}>
				<Route index element={<Dashboard />} />
				<Route path="/verification" element={< VerificationCenter/>} />
				<Route path= "/dispute=resolution" element= {<DisputeResolution/>}/>
				<Route path="/donation-oversight" element={<DonationOversight />} />
				<Route path= "/Appeals" element= {<AppealsManagement/>}/>
				<Route path="/user-management" element={<UserManagement />} />
				<Route path="/reports" element={<Reports />} />
				<Route path="/system-settings" element={<SystemSettings />} />
			</Route>
			<Route
				path="*"
				element={<NotFoundPage isAuthenticated={false} userRole={""} />}
			/>
		</Routes>
	);
};

export default Admin;
