import React, { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Edit, Trash2, X } from "lucide-react";
import {
	googleMapsService,
	type Address,
	type GooglePlacePrediction,
} from "../../../services/maps";
import { userApi } from "../../../services/user_service";
import { useAuth } from "../../../contexts/AuthProvider";

interface AddressInputProps {
	value: string;
	onChange: (value: string) => void;
	onSelectPlace: (placeDetails: any) => void;
}
const AddressInput = ({
	value,
	onChange,
	onSelectPlace,
}: AddressInputProps) => {
	const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([]);
	const [showPredictions, setShowPredictions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { address } = useAuth();

	useEffect(() => {
		if (value.length > 2) {
			const timer = setTimeout(() => {
				fetchPredictions();
			}, 500);
			return () => clearTimeout(timer);
		} else {
			setPredictions([]);
			setShowPredictions(false);
		}
	}, [value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setShowPredictions(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [wrapperRef]);

	const fetchPredictions = async () => {
		setIsLoading(true);
		try {
			const results = await googleMapsService.getPlacePredictions(value);
			setPredictions(results);
			setShowPredictions(true);
		} catch (error) {
			console.error("Error fetching predictions:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectPrediction = async (
		prediction: GooglePlacePrediction
	) => {
		onChange(prediction.description);
		setShowPredictions(false);

		try {
			const placeDetails = await googleMapsService.getPlaceDetails(
				prediction.place_id
			);
			onSelectPlace(placeDetails);
		} catch (error) {
			console.error("Error fetching place details:", error);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
		if (e.target.value.length >= 2) {
			setShowPredictions(true);
		}
	};

	return (
		<div className="relative" ref={wrapperRef}>
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					className="w-full p-3 pl-10 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
					value={value}
					onChange={handleInputChange}
					placeholder="Start typing an address..."
				/>
				<MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
				{isLoading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
					</div>
				)}
			</div>

			{showPredictions && predictions.length > 0 && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
					{predictions.map((prediction) => (
						<button
							key={prediction.place_id}
							type="button"
							className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
							onClick={() => handleSelectPrediction(prediction)}>
							<div className="flex items-center">
								<MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
								<div>
									<div className="font-medium text-gray-900">
										{
											prediction.structured_formatting
												.main_text
										}
									</div>
									<div className="text-sm text-gray-500">
										{
											prediction.structured_formatting
												.secondary_text
										}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

// Main Addresses Page Component
const AddressesPage = () => {
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [searchText, setSearchText] = useState("");
	const [formData, setFormData] = useState({
		address_line1: "",
		address_line2: "",
		city: "",
		province: "",
		postal_code: "",
		country: "",
		latitude: -29.4862,
		longitude: 26.6324,
		place_id: "",
		user_id: "",
	});

	const { user, address } = useAuth();
	/* useEffect(() => {
		const mockAddresses: Address[] = [
			{
				id: "1",
				address_line1: "123 Main Street",
				address_line2: "",
				city: "Cape Town",
				province: "Western Cape",
				postal_code: "8001",
				country: "South Africa",
				latitude: -32.924,
				longitude: 18.4241,
				isDefault: true,
			},
			{
				id: "2",
				address_line1: "456 Business Avenue",
				address_line2: "",
				city: "Johannesburg",
				province: "Gauteng",
				postal_code: "2196",
				country: "South Africa",
				latitude: -26.2041,
				longitude: 28.0473,
				isDefault: false,
			},
		];
		setAddresses(mockAddresses);
	}, []); */

	useEffect(() => {
		if (address) {
			setFormData({
				address_line1: address.address_line1 || "",
				address_line2: address.address_line2 || "",
				city: address.city || "",
				country: address.country || "",
				latitude: address.latitude ?? -29.651,
				longitude: address.longitude ?? 26.65,
				place_id: address.place_id,
				postal_code: address.postal_code,
				province: address.province,
				user_id: user?.id || "",
			});
			setAddresses([address]);
		}
	}, []);
	const resetForm = () => {
		setFormData({
			address_line1: "",
			address_line2: "",
			city: "",
			province: "",
			postal_code: "",
			country: "",
			latitude: -29.4862,
			longitude: 28.0473,
			place_id: "",
			user_id: "",
		});
		setEditingAddress(null);
		setShowAddForm(false);
	};

	const handlePlaceSelect = (placeDetails: Partial<Address> | null) => {
		if (!placeDetails) return;

		setFormData((currentData) => ({
			...currentData,
			address_line1: placeDetails.address_line1 || "",
			address_line2: placeDetails.address_line2 || "",
			city: placeDetails.city || "",
			province: placeDetails.province || "",
			postal_code: placeDetails.postal_code || "",
			country: placeDetails.country || "",
			latitude: placeDetails.latitude ?? currentData.latitude,
			longitude: placeDetails.longitude ?? currentData.longitude,
			place_id: placeDetails.place_id || "",
			user_id: user?.id || "",
		}));
		if (address) setAddresses([address]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingAddress) {
				setAddresses(
					addresses.map((addr) =>
						addr.id === editingAddress.id
							? { ...editingAddress, ...formData }
							: addr
					)
				);
			} else {
				const newAddress: Address = {
					id: Date.now().toString(),
					...formData,
				};
				const response = await userApi.addAddress(newAddress);
				if (response.status === "success") {
					setAddresses([...addresses, newAddress]);
					alert("Address added successfully!");
					resetForm();
				} else {
					alert(
						`Failed to add address: ${
							response.message || "Please try again."
						}`
					);
				}
			}
		} catch (error) {
			alert(
				"An error occurred while saving the address. Please check your connection and try again."
			);
		}

		resetForm();
	};

	const handleEdit = (address: Address) => {
		setFormData({
			address_line1: address.address_line1,
			address_line2: address.address_line2,
			city: address.city,
			province: address.province,
			postal_code: address.postal_code,
			country: address.country,
			latitude: address.latitude,
			longitude: address.longitude,
			place_id: address.place_id ?? "",
			user_id: user?.id ?? "",
		});
		setEditingAddress(address);
		console.log("Address", address);

		setShowAddForm(true);
	};

	const handleDelete = (addressId: string) => {
		if (window.confirm("Are you sure you want to delete this address?")) {
			setAddresses(addresses.filter((addr) => addr.id !== addressId));
		}
	};

	const handleSetDefault = (addressId: string) => {
		setAddresses(
			addresses.map((addr) => ({
				...addr,
				isDefault: addr.id === addressId,
			}))
		);
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<MapPin className="h-8 w-8 mr-3 text-emerald-600" />
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Addresses
								</h1>
								<p className="text-gray-600">
									Manage your saved addresses
								</p>
							</div>
						</div>
						{!address && (
							<button
								onClick={() => setShowAddForm(true)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
								<Plus className="h-4 w-4 mr-2" />
								Add Address
							</button>
						)}
					</div>
				</header>

				{showAddForm && (
					<div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									{editingAddress
										? "Edit Address"
										: "Add New Address"}
								</h3>
								<button
									onClick={resetForm}
									className="text-gray-400 hover:text-gray-600">
									<X className="h-5 w-5" />
								</button>
							</div>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:p-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
									<div className="sm:col-span-6">
										<label
											htmlFor="address-search"
											className="block text-sm font-medium text-gray-700">
											Search Address
										</label>
										<div className="mt-1">
											<AddressInput
												value={searchText}
												onChange={(value) =>
													setSearchText(value)
												}
												onSelectPlace={
													handlePlaceSelect
												}
											/>
										</div>
										<p className="mt-2 text-sm text-gray-500">
											Start typing to get address
											suggestions from Google Maps
										</p>
									</div>

									<div className="sm:col-span-3">
										<label
											htmlFor="address_line1"
											className="block text-sm font-medium text-gray-700">
											Street Name
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="city"
												className="w-full p-3 border border-[#d1c4b5] rounded-sm bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.address_line1}
												onChange={(e) =>
													setFormData({
														...formData,
														address_line1:
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="sm:col-span-3">
										<label
											htmlFor="address_line1"
											className="block text-sm font-medium text-gray-700">
											Surbub
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="address_line2"
												className="w-full p-3 border border-[#d1c4b5] rounded-sm bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.address_line2}
												onChange={(e) =>
													setFormData({
														...formData,
														address_line2:
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="sm:col-span-3">
										<label
											htmlFor="city"
											className="block text-sm font-medium text-gray-700">
											City
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="city"
												className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.city}
												onChange={(e) =>
													setFormData({
														...formData,
														city: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="sm:col-span-3">
										<label
											htmlFor="province"
											className="block text-sm font-medium text-gray-700">
											State/Province
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="province"
												className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.province}
												onChange={(e) =>
													setFormData({
														...formData,
														province:
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="sm:col-span-3">
										<label
											htmlFor="country"
											className="block text-sm font-medium text-gray-700">
											Country
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="country"
												className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.country}
												onChange={(e) =>
													setFormData({
														...formData,
														country: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="sm:col-span-2">
										<label
											htmlFor="postalCode"
											className="block text-sm font-medium text-gray-700">
											Postal Code
										</label>
										<div className="mt-1">
											<input
												type="text"
												id="postalCode"
												className="w-full p-3 border border-[#d1c4b5] rounded-lg bg-white text-[#5a4a42] focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-[#165e2a]"
												value={formData.postal_code}
												onChange={(e) =>
													setFormData({
														...formData,
														postal_code:
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
								</div>

								<div className="flex justify-end space-x-3">
									<button
										type="button"
										onClick={resetForm}
										className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
										Cancel
									</button>
									<button
										type="submit"
										className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
										{editingAddress
											? "Update Address"
											: "Save Address"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				<div className="space-y-4">
					{addresses.length === 0 ? (
						<div className="text-center py-12">
							<MapPin className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No addresses saved
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Get started by adding your first address.
							</p>
						</div>
					) : (
						addresses.map((address) => (
							<div
								key={address.id}
								className="bg-white shadow overflow-hidden sm:rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<div className="flex items-center justify-between">
										<div className="flex space-x-2">
											{/* {!address.isDefault && (
												<button
													onClick={() =>
														handleSetDefault(
															address.id
														)
													}
													className="text-gray-400 hover:text-yellow-500"
													title="Set as default">
													<Star className="h-5 w-5" />
												</button>
											)} */}
											<button
												onClick={() =>
													handleEdit(address)
												}
												className="text-gray-400 hover:text-emerald-600"
												title="Edit address">
												<Edit className="h-5 w-5" />
											</button>
											<button
												onClick={() =>
													handleDelete(address.id)
												}
												className="text-gray-400 hover:text-red-600"
												title="Delete address">
												<Trash2 className="h-5 w-5" />
											</button>
										</div>
									</div>
									<div className="mt-4">
										<p className="text-gray-900">
											{address.address_line1}
										</p>
										<p className="text-gray-600">
											{address.city}, {address.province}{" "}
											{address.postal_code}
										</p>
										<p className="text-gray-600">
											{address.country}
										</p>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default AddressesPage;
