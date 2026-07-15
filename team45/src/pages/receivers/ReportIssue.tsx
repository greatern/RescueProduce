
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthProvider";

const ReportIssue = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const claimId = location.state?.claimId;
  const taskId = location.state?.taskId;

  const [formData, setFormData] = useState({
    description: "",
    issueType: "food_quality",
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) setError("User not authenticated");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!user) {
      setError("Please log in to report an issue");
      setIsLoading(false);
      return;
    }
    if (!claimId) {
      setError("Claim ID is missing");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("claimId", claimId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("issueType", formData.issueType);
      formDataToSend.append("reporter_id", user.id);
      evidenceFiles.forEach((file) => formDataToSend.append("evidence", file));

      await axios.post("http://localhost:5001/api/fraudcases", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Issue reported successfully!");
      navigate("/receiver/claim-history");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to report issue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEvidenceFiles(Array.from(e.target.files));
  };

  // Quick reusable alert component
  const Alert = ({ type, children }: { type: "error" | "warn"; children: React.ReactNode }) => {
    const styles =
      type === "error"
        ? "bg-red-100 border-red-400 text-red-700"
        : "bg-yellow-100 border-yellow-400 text-yellow-700";
    return (
      <div className={`border px-4 py-3 rounded mb-4 ${styles}`}>
        {children}
      </div>
    );
  };

  if (error && !user) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Alert type="error">
          <strong>Error:</strong> {error}
        </Alert>
        <button
          onClick={() => navigate("/login")}
          className="w-full rounded-lg bg-green-500 hover:bg-green-600 text-white py-2 font-medium transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!claimId) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Alert type="warn">
          <strong>Warning:</strong> No claim selected. Please go back and select a claim to report.
        </Alert>
        <button
          onClick={() => navigate("/receiver/claim-history")}
          className="w-full rounded-lg bg-gray-500 hover:bg-gray-600 text-white py-2 font-medium transition"
        >
          Back to Claim History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-extrabold text-center text-green-600 mb-6">
        Report an Issue
      </h1>

      {error && (
        <Alert type="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Issue Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            placeholder="Describe the issue..."
            className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 p-3 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Issue Type *
          </label>
          <select
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            required
            className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 p-3 shadow-sm"
          >
            <option value="food_quality">Food Quality</option>
            <option value="missing_items">Missing Items</option>
            <option value="quantity_mismatch">Quantity Mismatch</option>
            <option value="delivery_issue">Delivery Issue</option>
            <option value="volunteer_behavior">Volunteer Behavior</option>
            <option value="fraudulent_claim">Fraudulent Claim</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Evidence (Photos / Documents)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="block w-full text-gray-700 rounded-lg border border-gray-300 cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-green-500 file:px-4 file:py-2 file:text-white hover:file:bg-green-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can upload multiple files (images, PDFs, documents)
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border shadow-inner">
          <h3 className="font-semibold mb-2">Report Details</h3>
          <p><span className="font-medium">Claim ID:</span> {claimId}</p>
          <p>
            <span className="font-medium">Reporter:</span> {user?.name} ({user?.email})
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg shadow-md transition disabled:bg-gray-400"
        >
          {isLoading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;

