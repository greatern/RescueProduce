import { donorDonation } from "../App/screens/donor/LogFood";
import apiClient from "./api";
import axios, { AxiosError } from "axios";
import { User } from "./user";
//import { Donation } from "../App/screens/receiver/ReceiverHome";
export interface Donor {
	id: string;
	tax_number: string;
	user: User;
}

interface ApiDonationResponse {
	id: string;
	donor_id: string;
	food_category: string;
	quantity: number;
	quantity_unit: string;
	units: number;
	expiry_date: string;
	storage_req: string;
	pickup_date: string;
	pickup_time: string;
	special_instructions: string | null;
	created_at: string;
}

export interface DashboardResponse {
	donationStats: {
		total: number;
		thisMonth: number;
	};
	impactStats: {
		mealsProvided: number;
		co2Saved: number;
	};
	recentActivities: {
		id: number;
		text: string;
		date: string;
	}[];
	donorProfile: {
		name: string;
		totalDonations: number;
		joinDate: string;
	};
	communityStats: {
		rank: number;
		totalDonors: number;
	};
	donationGoal: {
		current: number;
		target: number;
	};
}

class donorApi {
	async postDonation(donation: donorDonation): Promise<boolean> {
		const response = await apiClient.post("api/donors/donate", donation);
		if (response.status === 200) {
			return true;
		} else {
			return false;
		}
	}

	async getDonations(
		userId: string,
		token: string | null
	): Promise<donorDonation[]> {
		try {
			const response = await apiClient.get(
				`/api/donors/donations/${userId}`,
				{
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}
			);
			const listings: ApiDonationResponse[] = response.data;
			return listings.map((listing) => ({
				id: listing.id,
				userId: listing.donor_id,
				foodCategory: listing.food_category || "Unknown",
				quantity: listing.quantity || 0,
				quantityUnit: listing.quantity_unit || "kg",
				units: listing.units || 1,
				expiryDate: listing.expiry_date || "",
				storageReq: listing.storage_req || "ambient",
				pickupDate: listing.pickup_date || "",
				pickupTime: listing.pickup_time || "morning",
				specialInstructions: listing.special_instructions || "",
				createdAt: listing.created_at || new Date().toISOString(),
			}));
		} catch (error) {
			console.error("Error fetching donations:", error);
			if (error instanceof AxiosError) {
				switch (error.response?.status) {
					case 404:
						throw new Error("No past donations found");
					default:
						throw new Error("Failed to fetch donations");
				}
			}
			throw new Error("Failed to fetch donations");
		}
	}

	async deleteDonation(id: string, userId: string) {
		const response = await fetch(`apiendpoin/${id}?userId=${userId}`, {
			method: "DELETE",
		});
		return response.ok;
	}

	async getDashboard(donorId: string, token: string) {
		try {
			const response = await apiClient.get(
				`/api/donor/dashboard?donorId=${donorId}`,
				{
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}
			);
			return response.data as DashboardResponse;
		} catch (error) {
			console.error("Error fetching dashboard:", error);
			if (error instanceof AxiosError) {
				switch (error.response?.status) {
					case 400:
						throw new Error("Invalid donor ID");
					case 404:
						throw new Error("Donor not found");
					default:
						throw new Error("Failed to fetch dashboard data");
				}
			}
			throw new Error("Failed to fetch dashboard data");
		}
	}
}
export default new donorApi();
