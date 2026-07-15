import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Package, Users, Utensils, Heart, Recycle } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardData {
  stats: {
    users: number;
    donations: number;
    accumulation: number;
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

const COLORS = ["#fae934ff", "#b0d964ff", "#a3e635"]; // soft pastel gradient colors

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/admin/dashboard");
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-100 to-green-100">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gradient-to-b from-yellow-100 to-green-100">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-100 to-green-100">
        No data available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-green-100 p-6 space-y-8 font-sans">
      {/* Header */}
      <motion.header
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-gray-800">Rescue Produce Dashboard</h1>
        <p className="text-gray-700 mt-2">Real-time food recovery analytics</p>
      </motion.header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Donations" value={`${data.stats.donations} boxes`} icon={<Package className="h-6 w-6 text-emerald-600" />} />
        <StatCard title="Completed Deliveries" value={`${data.stats.deliveries}`} icon={<Users className="h-6 w-6 text-amber-600" />} extra={`Failed: ${data.stats.deliveriesFailed}`} trend={`${data.stats.deliverySuccessRate}%`} />
        <StatCard title="Total Users" value={`${data.stats.users}`} icon={<Users className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Accumulation" value={`${data.stats.accumulation}`} icon={<Package className="h-6 w-6 text-green-600" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Analytics */}
        <motion.div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Waste Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.wasteData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fef9c3" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d9f99d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "#374151" }} />
              <YAxis tick={{ fill: "#374151" }} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="total" stroke="#a3e635" fill="url(#colorTotal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Distribution Pie */}
        <motion.div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.userDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactCard title="Meals Provided" value={data.impactMetrics.mealsProvided} icon={<Utensils className="h-6 w-6 text-amber-600" />} />
        <ImpactCard title="People Fed" value={data.impactMetrics.peopleFed} icon={<Heart className="h-6 w-6 text-blue-600" />} />
        <ImpactCard title="Waste Diverted" value={data.impactMetrics.wasteDiverted} icon={<Recycle className="h-6 w-6 text-violet-600" />} unit="kg" />
        <ImpactCard title="CO2 Saved" value={data.impactMetrics.co2Saved} icon={<Recycle className="h-6 w-6 text-green-600" />} unit="kg" />
      </div>

      {/* Top Donors & Volunteers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardList title="Top Donors" items={data.topDonors.map(d => ({ label: d.name, value: `${d.quantity} kg` }))} />
        <CardList title="Top Volunteers" items={data.topVolunteers.map(v => ({ label: v.name, value: `${v.completedTasks} tasks` }))} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; extra?: string; trend?: string }> = ({ title, value, icon, extra, trend }) => (
  <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:scale-105 transition-transform">
    <div className="flex items-center justify-between">
      <div className="rounded-lg bg-white/20 p-3">{icon}</div>
      {trend && <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-gray-800">{trend}</span>}
    </div>
    <h3 className="mt-4 text-gray-800 font-semibold">{title}</h3>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    {extra && <p className="mt-2 text-gray-700">{extra}</p>}
  </div>
);

const ImpactCard: React.FC<{ title: string; value: number; icon: React.ReactNode; unit?: string }> = ({ title, value, icon, unit }) => (
  <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:scale-105 transition-transform">
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()} {unit || ""}</p>
      </div>
    </div>
  </div>
);

const CardList: React.FC<{ title: string; items: { label: string; value: string }[] }> = ({ title, items }) => (
  <div className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex justify-between border-b border-white/20 py-2">
          <span>{item.label}</span>
          <span>{item.value}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Dashboard;

