export interface Delivery {
	id: string;
	claim_id: string;
	food_listing_id: string;
	volunteer_id: string | null;
	receiver_id: string;
	donor_id: string;
	pickup_address_id: string;
	delivery_address_id: string;
	scheduled_pickup: string;
	status: string;
}

export interface VolunteerProfile {
	id: string;
	user_id: string;
	reputation_score: number;
	is_verified: boolean;
	user: {
		name: string;
		email: string;
		phone: string;
	};
	transport_type?: string;
	capacity_kg?: number;
}

export interface AvailabilitySlot {
	id: string;
	user_id: string;
	day_of_week: string;
	start_time: string;
	end_time: string;
}

export interface FraudReportPayload {
	reporterId: string;
	reportedEntityId: string;
	reportedEntityType: string;
	description: string;
}
