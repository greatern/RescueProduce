import { Route, Routes, useNavigate } from "react-router-dom";
import Layout from "../../components/layout";
import VolunteerHome from "./VolunteerHome";
import Tasks from "./Tasks";
import Availability from "./Availability";
import Profile from "./Profile";
import { NotFoundPage } from "../../App";
import { useAuth } from "../../contexts/AuthProvider";
import { useEffect } from "react";
import AppealPage from "./AppealPage";

const Volunteer = () => {
	const { user, isAuthenticated } = useAuth();
	const nav = useNavigate();

	const volunteerOptions = [
		{ path: "/volunteer/home", name: "Dashboard" },
		{ path: "/volunteer/tasks", name: "Available Tasks" },
		{ path: "/volunteer/availability", name: "My Availability" },
		{ path: "/volunteer/appeal", name: "Appeals" },
		{ path: "/volunteer/profile", name: "Profile" },
	];

	useEffect(() => {
		if (isAuthenticated === false) {
			console.log("Please login in");
			nav("/login");
		}

		if (user && !(user.role === "volunteer")) {
			console.log("heelo");

			nav("/");
		}
	}, []);

	return (
		<Routes>
			<Route element={<Layout options={volunteerOptions} />}>
				<Route index element={<VolunteerHome />} />
				<Route path="home" element={<VolunteerHome />} />
				<Route path="tasks" element={<Tasks />} />
				<Route path="availability" element={<Availability />} />
				<Route path="appeal" element={<AppealPage />} />
				<Route path="profile" element={<Profile />} />

			    <Route path="appeal/:caseId" element={<AppealPage />} />

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

export default Volunteer;
