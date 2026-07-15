import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLogo from "../assets/img/AppLogo.png";
import { useAuth } from "../contexts/AuthProvider";
//import AppLogo1 from "../assets/img/AppLogo1.png";
const Header: React.FC = () => {
	const navigate = useNavigate();
	const [userRole, setUserRole] = useState<
		"donor" | "volunteer" | "receiver" | null
	>(null);

	const { logout, user, isAuthenticated } = useAuth();

	useEffect(() => {
		if (user) {
			setUserRole(user.role);
		} else {
			setUserRole(null);
		}
	}, [user, isAuthenticated]);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header className="backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 shadow-lg">
			<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-amber-300 flex items-center justify-center shadow-md">
						<img
							src={AppLogo}
							alt="App Logo"
							className="h-6 w-6 object-contain"
						/>
					</div>
					<Link
						to={
							isAuthenticated && userRole
								? `/${userRole}/home`
								: "/login"
						}
						className="text-2xl font-extrabold bg-green-600  bg-clip-text text-transparent hover:scale-105 transition-transform">
						RescueProduce
					</Link>
				</div>

				<nav className="hidden lg:flex items-center space-x-8">
					<Link
						to="/home"
						className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
						Home
					</Link>
					<Link
						to="#"
						className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
						How It Works
					</Link>
					<Link
						to="/About"
						className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
						About Us
					</Link>
				</nav>

				<div className="flex items-center space-x-3">
					{isAuthenticated ? (
						<>
							<span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
								Logged in as:{" "}
								<span className="font-semibold capitalize text-green-600 dark:text-green-400">
									{userRole}
								</span>
							</span>
							<button
								onClick={handleLogout}
								className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all">
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="px-4 py-2 rounded-xl border border-green-600 text-green-700 hover:bg-green-50 transition-all dark:text-green-400 dark:border-green-400 dark:hover:bg-gray-800">
								Login
							</Link>
							<Link
								to="/register"
								className="px-4 py-2 rounded-xl bg-green-500  text-white shadow-md hover:shadow-lg hover:scale-105 transition-all">
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
