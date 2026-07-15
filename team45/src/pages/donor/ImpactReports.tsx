import { useEffect, useState } from "react";
import { ArrowDownTrayIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline";

interface Report {
  filename: string;
  createdAt: string;
  type: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [userId] = useState("123"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, startDate, endDate }),
      });

      if (!res.ok) throw new Error("Failed to generate report");
      await fetchReports();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Reports Dashboard</h1>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Generate a Report</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>

          {reportType === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Available Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports available yet. Generate one above.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r, idx) => (
              <div
                key={idx}
                className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">{r.type} Report</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(`/api/reports/download/${r.filename}`, "_blank")
                  }
                  className="mt-3 flex items-center justify-center w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


