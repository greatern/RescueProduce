import { Route, Routes, useNavigate } from "react-router-dom";
import Layout from "../../components/layout";
import { NotFoundPage } from "../../App";
import DonationDetails from "./donation_detail";
import ClaimHistory from "./ClaimHistory";
import ReportIssue from "./ReportIssue";
import ReceiverDashboard from "./Dashboard";
import ReceiverProfile from "./profile";
import VerificationSubmission from "./VerificationSubmission";
import { useAuth } from "../../contexts/AuthProvider";
import { useEffect } from "react";

const Receiver = () => {
	const { user, isAuthenticated } = useAuth();
	const nav = useNavigate();

	const receiverOptions = [
		{ path: "/receiver", name: "Dashboard" },
		{ path: "/receiver/verification", name: "Verification" },
		{ path: "/receiver/donation-details", name: "View Donations" },
		{ path: "/receiver/claim-history", name: "Claim History" },
		{ path: "/receiver/report-issue", name: "Report Issue" },
		{ path: "/receiver/profile", name: "Profile" },
	];
	useEffect(() => {
		if (isAuthenticated === false) {
			console.log("Please login in");
			nav("/login");
		}

		if (user && !(user.role === "receiver")) {
			nav("/");
		}
	});

	return (
		<Routes>
			<Route element={<Layout options={receiverOptions} />}>
				<Route index element={<ReceiverDashboard />} />
				<Route path="verification" element={<VerificationSubmission />} />
				<Route path="profile" element={<ReceiverProfile />} />
				<Route path="donation-details" element={<DonationDetails />} />
				<Route path="claim-history" element={<ClaimHistory />} />
				<Route path="report-issue" element={<ReportIssue />} />
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

export default Receiver;
