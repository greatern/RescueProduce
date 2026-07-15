import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthProvider"; // Import your auth context

const AppealPage = () => {
  const { user } = useAuth(); 
  const [caseId, setCaseId] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!user?.id) {
        throw new Error("You must be logged in to submit an appeal");
      }

      const formData = new FormData();
      formData.append("caseId", caseId);
      formData.append("reason", reason);
      formData.append("user_id", user.id); // ADD USER ID
      
      // Append files with correct field name
      files.forEach((file) => formData.append("evidenceFiles", file));

      console.log("Submitting appeal:", { caseId, reason, userId: user.id, filesCount: files.length });

      // FIX: Remove caseId from URL
      const response = await axios.post(`${apiUrl}/api/fraudcases/appeals`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Appeal response:", response.data);

      alert("Appeal submitted successfully! An administrator will review it shortly.");
      setCaseId("");
      setReason("");
      setFiles([]);
    } catch (err: any) {
      console.error("Appeal error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit appeal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
        <p className="text-center text-gray-600">Please log in to submit an appeal</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
      <h1 className="text-3xl font-extrabold text-center text-green-600 mb-6">
        Submit an Appeal
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Block ID * <span className="text-xs text-gray-500">(This is your block case ID, not fraud case ID)</span>
          </label>
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            required
            placeholder="Enter your block ID"
            className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 p-3 shadow-sm border"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Appeal Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="Explain why you believe this block is unfair..."
            className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 p-3 shadow-sm border"
          />
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
          {files.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Submitting..." : "Submit Appeal"}
        </button>
      </form>
    </div>
  );
};

export default AppealPage;
