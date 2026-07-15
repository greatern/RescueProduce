
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface LocationData {
  id: string;
  deliveryId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface DeliveryTrackingData {
  id: string;
  taskId: string;
  volunteerId: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  eta?: {
    estimated_arrival: string;
    confidence: number;
    distance_remaining: number;
  };
  inactivityAlert?: {
    id: string;
    triggered_at: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
  };
  conditionRating?: {
    id: string;
    overall_rating: number;
    freshness_rating: number;
    packaging_rating: number;
    photos?: string[];
    comments?: string;
  };
  weightVerification?: {
    id: string;
    expected_weight: number;
    actual_weight: number;
    verification_method: string;
    verified_at: string;
    photos?: string[];
  };
  digitalSignature?: {
    id: string;
    signature_data: string;
    signer_name: string;
    signed_at: string;
    device_info: object;
  };
}

export interface DeliveryAnalytics {
  totalDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  averageRating: number;
  onTimePercentage: number;
  inactivityAlerts: number;
  averageDeliveryTime: number;
  topPerformingVolunteers: Array<{
    id: string;
    name: string;
    completedDeliveries: number;
    averageRating: number;
  }>;
}

class DeliveryTrackingService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  constructor() {
    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all active deliveries with tracking data
  async getActiveDeliveries(): Promise<DeliveryTrackingData[]> {
    try {
      const response = await this.apiClient.get('/api/tracking/deliveries/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      throw error;
    }
  }

  // Get tracking data for a specific delivery
  async getDeliveryTracking(deliveryId: string): Promise<DeliveryTrackingData> {
    try {
      const response = await this.apiClient.get(`/api/tracking/deliveries/${deliveryId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching delivery tracking:', error);
      throw error;
    }
  }

  // Get location history for a delivery
  async getLocationHistory(deliveryId: string): Promise<LocationData[]> {
    try {
      const response = await this.apiClient.get(`/api/tracking/deliveries/${deliveryId}/locations`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
  }

  // Get delivery analytics
  async getAnalytics(): Promise<DeliveryAnalytics> {
    try {
      const response = await this.apiClient.get('/api/admin/analytics/delivery');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get inactivity alerts
  async getInactivityAlerts(): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/api/tracking/alerts/inactivity');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inactivity alerts:', error);
      throw error;
    }
  }

  // Resolve inactivity alert
  async resolveInactivityAlert(alertId: string): Promise<void> {
    try {
      await this.apiClient.put(`/api/tracking/alerts/inactivity/${alertId}/resolve`);
    } catch (error) {
      console.error('Error resolving inactivity alert:', error);
      throw error;
    }
  }

  // Contact volunteer
  async contactVolunteer(volunteerId: string, message: string, urgency: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    try {
      await this.apiClient.post('/api/tracking/volunteer/contact', {
        volunteerId,
        message,
        urgency,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error contacting volunteer:', error);
      throw error;
    }
  }

  // Manual delivery assignment
  async assignDelivery(taskId: string, volunteerId: string): Promise<void> {
    try {
      await this.apiClient.post('/api/tracking/deliveries/assign', {
        taskId,
        volunteerId
      });
    } catch (error) {
      console.error('Error assigning delivery:', error);
      throw error;
    }
  }

  // Emergency delivery suspension
  async suspendDelivery(deliveryId: string, reason: string): Promise<void> {
    try {
      await this.apiClient.post(`/api/tracking/deliveries/${deliveryId}/suspend`, {
        reason,
        suspended_by: 'admin',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error suspending delivery:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time updates
  private ws: WebSocket | null = null;

  connectToRealTimeUpdates(onUpdate: (data: any) => void): void {
    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/tracking';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to real-time tracking updates');
        // Send admin authentication
        const token = localStorage.getItem('adminToken');
        if (token) {
          this.ws?.send(JSON.stringify({
            type: 'auth',
            token,
            role: 'admin'
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from real-time tracking updates');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectToRealTimeUpdates(onUpdate), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnectFromRealTimeUpdates(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Export delivery data for reporting
  async exportDeliveryData(startDate: string, endDate: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await this.apiClient.get('/api/tracking/export', {
        params: { startDate, endDate, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting delivery data:', error);
      throw error;
    }
  }

  // Get volunteer performance metrics
  async getVolunteerMetrics(volunteerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/api/tracking/volunteers/${volunteerId}/metrics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching volunteer metrics:', error);
      throw error;
    }
  }
}

export const deliveryTrackingService = new DeliveryTrackingService();
export default deliveryTrackingService;