import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../../assets/images/AppLogo.png";
import AvatarImage from "../../assets/images/Donate Food - Food Bank for the Heartland.jpeg";

interface Donation {
	id: number;
	date: string;
	foodType: string;
	quantity: string;
	status: "completed" | "pending" | "expired";
	recipient: string;
	value: string;
}

const NavSection: React.FC = () => (
	<aside className="fixed top-0 left-0 w-sidebar h-screen bg-primary-color text-white shadow-[2px_0_10px_rgba(0,0,0,0.1)] z-50">
		<div className="p-5 border-b border-[rgba(255,255,255,0.1)] flex items-center">
			<img
				src={AppLogo}
				alt="RescueProduce Icon"
				className="h-[30px] mr-2"
			/>
			<h3 className="text-lg font-semibold">RescueProduce</h3>
		</div>
		<div className="p-5 border-b border-[rgba(255,255,255,0.1)] flex items-center">
			<div className="avatar">
				<div className="w-[50px] h-[50px] rounded-full border-2 border-[rgba(255,255,255,0.2)]">
					<img src={AvatarImage} alt="Supermarket Avatar" />
				</div>
			</div>
			<div>
				<h4 className="text-base font-medium">
					Woolworths Supermarket
				</h4>
				<p className="text-sm opacity-80">Food Donor</p>
			</div>
		</div>
		<nav className="p-2">
			<ul className="menu">
				<li>
					<Link
						to="/donor-dashboard"
						className="text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border-l-4 border-transparent hover:border-accent-color py-3 px-5">
						<i className="fas fa-home mr-3 text-lg"></i> Dashboard
					</Link>
				</li>
				<li>
					<Link
						to="/log-food"
						className="text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border-l-4 border-transparent hover:border-accent-color py-3 px-5">
						<i className="fas fa-utensils mr-3 text-lg"></i> Log
						Donation
					</Link>
				</li>
				<li>
					<Link
						to="/donation-history"
						className="text-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.1)] border-l-4 border-accent-color py-3 px-5">
						<i className="fas fa-history mr-3 text-lg"></i> Donation
						History
					</Link>
				</li>
				<li>
					<Link
						to="/impact-reports"
						className="text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border-l-4 border-transparent hover:border-accent-color py-3 px-5">
						<i className="fas fa-chart-line mr-3 text-lg"></i>{" "}
						Impact Reports
					</Link>
				</li>
				<li>
					<Link
						to="/tax-reports"
						className="text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border-l-4 border-transparent hover:border-accent-color py-3 px-5">
						<i className="fas fa-file-invoice-dollar mr-3 text-lg"></i>{" "}
						Tax Reports
					</Link>
				</li>
				<li>
					<Link
						to="/profile"
						className="text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white border-l-4 border-transparent hover:border-accent-color py-3 px-5">
						<i className="fas fa-user-cog mr-3 text-lg"></i> Profile
						Settings
					</Link>
				</li>
			</ul>
		</nav>
		<div className="absolute bottom-0 w-full p-4 border-t border-[rgba(255,255,255,0.1)]">
			<Link
				to="/help"
				className="flex items-center text-[rgba(255,255,255,0.8)] hover:text-white text-sm py-2">
				<i className="fas fa-question-circle mr-2"></i> Help & Support
			</Link>
			<Link
				to="/logout"
				className="flex items-center text-[rgba(255,255,255,0.8)] hover:text-white text-sm py-2">
				<i className="fas fa-sign-out-alt mr-2"></i> Log Out
			</Link>
		</div>
	</aside>
);

const DonationHistory: React.FC = () => {
	const [donations] = useState<Donation[]>([
		{
			id: 1,
			date: "2025-04-15",
			foodType: "Fresh Vegetables",
			quantity: "25 kg",
			status: "completed",
			recipient: "Hope Community Kitchen",
			value: "R375.00",
		},
		{
			id: 2,
			date: "2025-04-12",
			foodType: "Canned Goods",
			quantity: "50 kg",
			status: "completed",
			recipient: "Feed the Nation",
			value: "R850.00",
		},
		{
			id: 3,
			date: "2025-04-10",
			foodType: "Bakery Items",
			quantity: "15 kg",
			status: "expired",
			recipient: "-",
			value: "R225.00",
		},
		{
			id: 4,
			date: "2025-04-08",
			foodType: "Dairy Products",
			quantity: "30 kg",
			status: "completed",
			recipient: "Children's Shelter",
			value: "R600.00",
		},
		{
			id: 5,
			date: "2025-04-05",
			foodType: "Dry Goods",
			quantity: "40 kg",
			status: "completed",
			recipient: "Elderly Care Center",
			value: "R560.00",
		},
	]);

	const [searchTerm, setSearchTerm] = useState("");
	const [timeFilter, setTimeFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const donationsPerPage = 5;

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setTimeFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleExport = () => {
		console.log("Exporting donations as CSV");
		alert("Donations exported as CSV");
	};

	const handleViewDetails = (id: number) => {
		console.log("Viewing details for donation ID:", id);
		alert(`Viewing details for donation ID: ${id}`);
	};

	const handleDownloadReceipt = (id: number) => {
		console.log("Downloading receipt for donation ID:", id);
		alert(`Downloading receipt for donation ID: ${id}`);
	};

	const filteredDonations = donations.filter(
		(donation) =>
			donation.foodType
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			donation.recipient.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const totalPages = Math.ceil(filteredDonations.length / donationsPerPage);
	const paginatedDonations = filteredDonations.slice(
		(currentPage - 1) * donationsPerPage,
		currentPage * donationsPerPage
	);

	return (
		<>
			{/* <NavSection /> */}
			<div className="ml-[280px] max-w-[calc(100%-280px)] p-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-semibold text-primary-dark">
						Donation History
					</h1>
					<div className="flex gap-4">
						<select
							value={timeFilter}
							onChange={handleFilterChange}
							className="select select-bordered">
							<option value="all">All Time</option>
							<option value="month">This Month</option>
							<option value="week">This Week</option>
							<option value="today">Today</option>
						</select>
						<button
							className="btn btn-secondary"
							onClick={handleExport}>
							<i className="fas fa-file-export mr-2"></i> Export
						</button>
					</div>
				</div>

				<div className="card bg-card-bg rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold text-primary-dark">
							Your Donations
						</h2>
						<div className="relative">
							<i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-light"></i>
							<input
								type="text"
								placeholder="Search donations..."
								value={searchTerm}
								onChange={handleSearch}
								className="input input-bordered pl-10 w-[250px]"
							/>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="table w-full">
							<thead>
								<tr>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Date
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Food Type
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Quantity
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Status
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Recipient
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Value
									</th>
									<th className="bg-[#f9f9f9] text-text-light font-semibold">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{paginatedDonations.map((donation) => (
									<tr
										key={donation.id}
										className="hover:bg-[rgba(46,125,50,0.03)]">
										<td>{donation.date}</td>
										<td>{donation.foodType}</td>
										<td>{donation.quantity}</td>
										<td>
											<span
												className={`badge ${
													donation.status ===
													"completed"
														? "bg-[rgba(67,160,71,0.1)] text-success-color"
														: donation.status ===
														  "pending"
														? "bg-[rgba(255,160,0,0.1)] text-warning-color"
														: "bg-[rgba(229,57,53,0.1)] text-error-color"
												}`}>
												{donation.status
													.charAt(0)
													.toUpperCase() +
													donation.status.slice(1)}
											</span>
										</td>
										<td>{donation.recipient}</td>
										<td>{donation.value}</td>
										<td>
											<button
												className="btn btn-ghost btn-sm"
												title="View Details"
												onClick={() =>
													handleViewDetails(
														donation.id
													)
												}>
												<i className="fas fa-eye text-text-light"></i>
											</button>
											{donation.status ===
												"completed" && (
												<button
													className="btn btn-ghost btn-sm"
													title="Download Receipt"
													onClick={() =>
														handleDownloadReceipt(
															donation.id
														)
													}>
													<i className="fas fa-receipt text-text-light"></i>
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color">
						<div className="text-text-light text-sm">
							Showing {(currentPage - 1) * donationsPerPage + 1}-
							{Math.min(
								currentPage * donationsPerPage,
								filteredDonations.length
							)}{" "}
							of {filteredDonations.length} donations
						</div>
						<div className="flex gap-2">
							<button
								className="btn btn-circle btn-sm border-border-color"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(currentPage - 1)}>
								<i className="fas fa-chevron-left"></i>
							</button>
							<span className="btn btn-circle btn-sm bg-primary-color text-white border-primary-color">
								{currentPage}
							</span>
							<button
								className="btn btn-circle btn-sm border-border-color"
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(currentPage + 1)}>
								<i className="fas fa-chevron-right"></i>
							</button>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
					<div className="card bg-card-bg rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 text-center hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition">
						<div className="text-3xl font-bold text-primary-color">
							1,245 kg
						</div>
						<div className="text-text-light text-sm">
							Total Donated
						</div>
					</div>
					<div className="card bg-card-bg rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 text-center hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition">
						<div className="text-3xl font-bold text-primary-color">
							R12,450
						</div>
						<div className="text-text-light text-sm">
							Total Value
						</div>
					</div>
					<div className="card bg-card-bg rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 text-center hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition">
						<div className="text-3xl font-bold text-primary-color">
							89%
						</div>
						<div className="text-text-light text-sm">
							Utilization Rate
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DonationHistory;
