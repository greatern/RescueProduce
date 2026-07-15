// src/types/index.ts
export interface User {
  user_id: string;
  user_type: 'donor' | 'receiver' | 'volunteer' | 'admin';
  email: string;
  phone?: string;
  address_id?: string;
  password_hash?: string;
  created_at: Date;
  last_active?: Date;
  reputation_score: number;
  status: 'active' | 'deactivated' | 'suspended';
  availability?: { days_of_week: string; start_time: string; end_time: string }[];
}

export interface Delivery {
  delivery_id: string;
  claim_id?: string;
  donation_id?: string;
  volunteer_id?: string;
  supermarket_id?: string;
  pickup_address_id?: string;
  delivery_address_id?: string;
  scheduled_pickup?: Date;
  actual_pickup?: Date;
  actual_delivery?: Date;
  status: 'pending' | 'in-transit' | 'completed' | 'failed';
  carbon_saved_kg?: number;
  condition_rating?: string;
}

export interface Report {
  type: string;
  data: { dateRange?: string; region?: string; foodType?: string; generated_at: Date };
}