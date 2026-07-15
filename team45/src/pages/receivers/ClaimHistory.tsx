
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ClaimedDonation {
  id: string;
  claimId: string;
  food_listing_id: string;
  status: "claimed" | "collected" | "delivered" | "cancelled" | "completed" | "pending";
  donorName?: string;
  procurementMethod?: string;
  location?: string;
  taskId?: string;
  title?: string;
  description?: string;
  due_date?: string;
}

const ReceiverHistory = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimedDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const fetchClaimHistory = async () => {
      try {
          const response = await axios.get(`http://localhost:5001/api/receivers/claims-history/${user.id}`);
        if (response.data && response.data.data) {
              const transformedClaims = response.data.data.map((task: any) => ({
            id: task.id,
            claimId: task.claim_id || task.id, 
            food_listing_id: task.title || "Donation",
            status: mapTaskStatusToClaimStatus(task.status),
            donorName: extractDonorName(task.title) || "Unknown Donor",
            procurementMethod: task.task_type === "delivery" ? "Delivery" : "Pickup",
            location: "Location not specified",
            taskId: task.id,
            title: task.title,
            description: task.description,
            due_date: task.due_date
          }));
          
          setClaims(transformedClaims);
        } else {
          setClaims([]);
        }
      } catch (err) {
        console.error("Error fetching claim history", err);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimHistory();
  }, [user?.id]);

  const mapTaskStatusToClaimStatus = (taskStatus: string): ClaimedDonation["status"] => {
    switch (taskStatus?.toLowerCase()) {
      case "completed":
        return "delivered";
      case "cancelled":
        return "cancelled";
      case "pending":
      case "ready":
        return "claimed";
      case "confirmed":
      case "collected":
        return "collected";
      default:
        return "claimed";
    }
  };

  const extractDonorName = (title: string): string => {
    if (!title) return "Unknown Donor";
    const match = title.match(/from (.+?)$/);
    return match ? match[1] : "Unknown Donor";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading donation history...</p>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No donation history found.</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-12 px-4">
  
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-200 rotate-45 mix-blend-multiply filter blur-3xl opacity-40"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10"
        >
          My Donation History
        </motion.h1>

        <div className="grid gap-6">
          {claims.map((claim, index) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <p className="text-lg font-semibold text-green-700 mb-2">
                Donation:{" "}
                <span className="text-gray-800">{claim.title || claim.food_listing_id}</span>
              </p>
              <p className="text-gray-700">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    claim.status === "delivered" || claim.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : claim.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {claim.status}
                </span>
              </p>

              {claim.donorName && (
                <p className="text-gray-700">
                  <strong>Donor:</strong> {claim.donorName}
                </p>
              )}
              {claim.procurementMethod && (
                <p className="text-gray-700">
                  <strong>Procurement:</strong> {claim.procurementMethod}
                </p>
              )}
              {claim.due_date && (
                <p className="text-gray-700">
                  <strong>Due Date:</strong> {new Date(claim.due_date).toLocaleDateString()}
                </p>
              )}
     {(claim.status === "claimed" || claim.status === "collected" || claim.status === "pending") && (
                <button
                  onClick={() =>
                    navigate("/receiver/report-issue", {
                      state: { 
                        claimId: claim.claimId,
                        taskId: claim.taskId 
                      },
                    })
                  }
                  className="mt-4 w-full md:w-auto px-5 py-2 bg-red-500 text-white rounded-xl font-semibold shadow hover:bg-red-600 transition"
                >
                  Report Issue
                </button>
              )}
       {(claim.status === "delivered" || claim.status === "completed") && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 rounded text-sm">
                  ✓ This donation has been successfully delivered
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReceiverHistory;