import { api } from "./api";

interface DashboardData {
  stats: {
    users: number;
    donations: number;
    deliveries: number;
    deliveriesFailed: number;
    deliverySuccessRate: string;
  };
  wasteTrend: {
    currentMonth: number;
    lastMonth: number;
  };
  wasteData: { name: string; total: number }[];
  userDistribution: { name: string; value: number }[];
  impactMetrics: {
    mealsProvided: number;
    co2Saved: number;
    peopleFed: number;
    wasteDiverted: number;
  };
  topDonors: { name: string; quantity: number }[];
  topVolunteers: { name: string; completedTasks: number }[];
}

export const dashboardService = {
  getDashboardData: () => api.get<DashboardData>("api/admin/dashboard"),
};
