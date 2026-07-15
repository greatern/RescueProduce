import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../contexts/AuthProvider";
import { motion } from "framer-motion";
import { PushNotificationSetup } from "../../components/PushNotificationSetup";


interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
}

interface KgHistory {
  month: string;
  kg: number;
}

interface ReceiverDashboardData {
  totalKgSaved: number;
  activeListings: number;
  nearExpiryClaims: number;
  activeTasks: Task[];
  fraudCases: number;
  totalKgSavedHistory: KgHistory[];
}

const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ReceiverDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
 
  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/receivers/dashboard/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const result: ReceiverDashboardData = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.id]);

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
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-b from-yellow-100 to-green-100">
     {user && vapidPublicKey && <PushNotificationSetup userId={user.id} vapidPublicKey={vapidPublicKey} />}

      {/* Logo or header */}
      <motion.div
        className="text-center text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
         Dashboard
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {[
          { title: "Total Kg Saved", value: data.totalKgSaved },
          { title: "Active Listings", value: data.activeListings },
          { title: "Near Expiry Claims", value: data.nearExpiryClaims },
          { title: "Fraud Cases", value: data.fraudCases },
        ].map((card) => (
          <div
            key={card.title}
            className="p-6 bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-md flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <h3 className="text-gray-700 text-lg font-semibold">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Kg Claimed History */}
      <motion.div
        className="bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Kg Claimed History (Last 12 Months)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.totalKgSavedHistory}>
            <XAxis dataKey="month" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Area type="monotone" dataKey="kg" stroke="#a3e635" fill="#d9f99d" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Active Tasks */}
      <motion.div
        className="bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Active Tasks</h2>
        {data.activeTasks.length === 0 ? (
          <p className="text-gray-700">No active tasks</p>
        ) : (
          <ul className="space-y-4">
            {data.activeTasks.map((task) => (
              <li
                key={task.id}
                className="p-4 rounded-2xl border border-white/30 backdrop-blur-md shadow hover:scale-105 transition-transform"
              >
                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                <p className="text-gray-700">{task.description}</p>
                <p className="text-gray-600">
                  Status: <span className="font-medium">{task.status}</span>
                </p>
                <p className="text-gray-600">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default ReceiverDashboard;


