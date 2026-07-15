import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient, type ApiResponse } from "../../services/api";
import {
	ArrowLeft,
	Info,
	Truck,
	Send,
	Save,
	Package,
	Box,
	Droplets,
	ShoppingBasket,
	AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthProvider";

export const formatDate = (date?: Date): string => {
	if (!date) return "N/A";
	return date.toISOString().split("T")[0];
};

const LogFood = () => {
	const [formData, setFormData] = useState({
		foodCategory: "",
		quantity: "",
		weightPerUnit: 0,
		quantityUnit: "boxes",
		expiryDate: new Date(),
		pickupDate: new Date(),
		pickupTime: "",
		specialInstructions: "",
	});
	const [error, setError] = useState<string>("");
	const { user, address } = useAuth();

	const navigate = useNavigate();

	useEffect(() => {
		if (
			formData.quantityUnit === "liters" ||
			formData.quantityUnit === "select"
		) {
			setFormData((prev) => ({ ...prev, weightPerUnit: 1 }));
		}
	}, [formData.quantityUnit]);

	useEffect(() => {
		if (formData.expiryDate.getTime() < formData.pickupDate.getTime()) {
			setError("Pickup must be scheduled before the expiry date");
		} else {
			setError("");
		}
	}, [formData.expiryDate, formData.pickupDate]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!address) {
			alert(
				"Address not found, please go under Profile/Address on your dashboard to set your address"
			);
			return;
		}

		if (formData.expiryDate.getTime() < formData.pickupDate.getTime()) {
			alert("Please schedule pickup before the product expires");
			return;
		}

		try {
			const form = {
				donor_id: user?.id,
				food_category: formData.foodCategory,
				posted_quantity: parseFloat(formData.quantity),
				weight_per_unit: formData.weightPerUnit,
				quantity_type: formData.quantityUnit,
				cutoff_pickup_date: formData.pickupDate,
				cutoff_pickup_time: formData.pickupTime,
				expiry: formData.expiryDate,
				available_quantity: 0,
			};
			console.log("Form", form);

			form.available_quantity =
				form.posted_quantity * form.weight_per_unit;

			const response = await apiClient.post<ApiResponse>(
				"/api/donors/donate",
				form
			);

			if (response.data.status === "success") {
				alert("Donation successfully logged!");
				handleCancel();
				navigate("/donor/");
			} else {
				alert("Failed to log donation. Please try again.");
			}
		} catch (error) {
			console.error("Donation error:", error);
			alert("An error occurred while submitting the donation");
		}
	};

	const foodCategories = [
		{
			value: "fresh_produce",
			label: "Fresh Produce",
			icon: <ShoppingBasket className="h-4 w-4 mr-2" />,
		},
		{
			value: "dairy",
			label: "Dairy Products",
			icon: <Droplets className="h-4 w-4 mr-2" />,
		},
		{
			value: "meat",
			label: "Meat & Poultry",
			icon: <Package className="h-4 w-4 mr-2" />,
		},
		{
			value: "bakery",
			label: "Bakery Items",
			icon: <Box className="h-4 w-4 mr-2" />,
		},
		{
			value: "canned",
			label: "Canned Goods",
			icon: <Package className="h-4 w-4 mr-2" />,
		},
		{
			value: "dry_goods",
			label: "Dry Goods",
			icon: <Box className="h-4 w-4 mr-2" />,
		},
		{
			value: "prepared",
			label: "Prepared Foods",
			icon: <ShoppingBasket className="h-4 w-4 mr-2" />,
		},
		{
			value: "other",
			label: "Other",
			icon: <Package className="h-4 w-4 mr-2" />,
		},
	];

	const handleCancel = () => {
		setFormData({
			foodCategory: "",
			quantity: "",
			quantityUnit: "kg",
			weightPerUnit: 0,
			expiryDate: new Date(),
			pickupDate: new Date(),
			pickupTime: "",
			specialInstructions: "",
		});
	};

	return (
		<div className="flex min-h-screen bg-[#f8f5f0] font-sans text-[#5a4a42]">
			<div className="main-content flex-grow p-8">
				<div className="dashboard-header flex justify-between items-center mb-8">
					<div>
						<h1 className="dashboard-title text-3xl font-bold text-[#5a4a42]">
							Log Food Donation
						</h1>
						<p className="text-[#8a7869]">
							List your surplus food for donation to help reduce
							waste and feed those in need
						</p>
					</div>
					<Link
						to="/donor-dashboard"
						className="flex items-center px-4 py-2 bg-[#165e2a] text-white hover:bg-[#124b23] rounded-lg transition-colors duration-200">
						<ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
					</Link>
				</div>

				<div className="card bg-white rounded-xl shadow-sm border border-[#e0d6cc] p-8 mb-8">
					<div className="card-header mb-6">
						<h2 className="text-2xl font-semibold text-[#5a4a42]">
							Donation Details
						</h2>
						<p className="text-[#8a7869]">
							As of{" "}
							{new Date().toLocaleString("en-ZA", {
								timeZone: "Africa/Johannesburg",
							})}
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="form-section">
							<h3 className="text-xl font-medium mb-6 flex items-center text-[#165e2a]">
								<Info className="h-5 w-5 mr-2" /> Food
								Information
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="form-group">
									<label
										htmlFor="foodCategory"
										className="block mb-2 font-medium text-[#5a4a42]">
										Food Category*
									</label>
									<select
										id="foodCategory"
										name="foodCategory"
										className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
										value={formData.foodCategory}
										onChange={handleChange}
										required>
										<option value="">
											Select category
										</option>
										{foodCategories.map((category) => (
											<option
												key={category.value}
												value={category.value}>
												{category.label}
											</option>
										))}
									</select>
								</div>
								<div className="form-group">
									<label
										htmlFor="quantity"
										className="block mb-2 font-medium text-[#5a4a42]">
										Number of Boxes*
									</label>
									<input
										type="number"
										id="quantity"
										name="quantity"
										className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
										min="0.1"
										step="0.1"
										value={formData.quantity}
										onChange={handleChange}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								<div className="form-group">
									<label
										htmlFor="weightPerUnit"
										className="block mb-2 font-medium text-[#5a4a42]">
										Weight Per box (kg)*
									</label>
									<input
										type="number"
										id="weightPerUnit"
										name="weightPerUnit"
										className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
										min="0.1"
										step="0.1"
										value={formData.weightPerUnit}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-group">
									<label
										htmlFor="expiryDate"
										className="block mb-2 font-medium text-[#5a4a42]">
										Expiry Date*
									</label>
									<div className="relative">
										<input
											type="date"
											id="expiryDate"
											name="expiryDate"
											className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
											value={formatDate(
												formData.expiryDate
											)}
											onChange={handleDateChange}
											required
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="form-section mt-8">
							<h3 className="text-xl font-medium mb-6 flex items-center text-[#165e2a]">
								<Truck className="h-5 w-5 mr-2" /> Collection
								Details
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="form-group">
									<label
										htmlFor="pickupDate"
										className="block mb-2 font-medium text-[#5a4a42]">
										Cutoff Pickup Date*
									</label>
									<div className="relative">
										<input
											type="date"
											id="pickupDate"
											name="pickupDate"
											className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
											value={formatDate(
												formData.pickupDate
											)}
											onChange={handleDateChange}
											required
										/>
									</div>
								</div>

								<div className="form-group">
									<label
										htmlFor="pickupTime"
										className="block mb-2 font-medium text-[#5a4a42]">
										Cutoff Pickup Time*
									</label>
									<div className="relative">
										<input
											type="time"
											id="pickupTime"
											name="pickupTime"
											className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
											value={formData.pickupTime}
											onChange={handleChange}
											required
										/>
									</div>
								</div>
							</div>
						</div>

						{error && (
							<div className="mt-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
								<AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="form-actions mt-8 flex flex-col sm:flex-row gap-4">
							<button
								type="submit"
								className="flex-1 flex items-center justify-center px-6 py-3 bg-[#165e2a] text-white rounded-lg hover:bg-[#124b23] transition-colors duration-200">
								<Send className="h-5 w-5 mr-2" /> Submit
								Donation
							</button>
							<button
								type="button"
								className="flex-1 flex items-center justify-center px-6 py-3 bg-white text-[#5a4a42] border-2 border-[#d1c4b5] rounded-lg hover:bg-[#f5f1eb] transition-colors duration-200"
								onClick={handleCancel}>
								<Save className="h-5 w-5 mr-2" /> Reset Form
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LogFood;
