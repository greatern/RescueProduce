import React, { useState, useEffect } from "react";
import { Download, FileText, Calendar, TrendingUp, Award, DollarSign, Users, Target } from "lucide-react";
import { useAuth } from "../../contexts/AuthProvider";

interface DonationSummary {
  month: string;
  donations: number;
  totalKg: number;
  estimatedValue: number;
  impactScore: number;
}

interface TaxBenefit {
  category: string;
  description: string;
  estimatedSaving: number;
  eligibility: string;
}

interface ImpactMetrics {
  totalDonations: number;
  totalWeight: number;
  totalValue: number;
  co2Saved: number;
  treesEquivalent: number;
}

const TaxReports: React.FC = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [loading, setLoading] = useState(false);
  const [donationData, setDonationData] = useState<DonationSummary[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null);


  const calculateTaxBenefits = (): TaxBenefit[] => {
    if (!impactMetrics) return [];

    const section18ADeduction = Math.round(impactMetrics.totalValue * 0.1);
    const wasteDisposalSavings = Math.round(impactMetrics.totalWeight * 5);

    return [
      {
        category: "Section 18A Tax Deduction",
        description: "Up to 10% of taxable income for donations to approved organizations",
        estimatedSaving: section18ADeduction,
        eligibility: "All taxpayers (SARS approved)"
      },
      {
        category: "Corporate Social Responsibility",
        description: "Enhanced company reputation and stakeholder relations",
        estimatedSaving: 0,
        eligibility: "All corporate donors"
      },
      {
        category: "Waste Disposal Savings",
        description: "Reduced commercial waste management and disposal costs",
        estimatedSaving: wasteDisposalSavings,
        eligibility: "All donors"
      }
    ];
  };

  const taxBenefits = calculateTaxBenefits();

  useEffect(() => {
    if (user?.id) {
      fetchTaxReportData();
    }
  }, [selectedYear, user?.id]);

  const fetchTaxReportData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch donation summary data
      const donationResponse = await fetch(
        `http://localhost:5001/api/donors/${user.id}/tax-records?year=${selectedYear}`
      );

      if (donationResponse.ok) {
        const donationData = await donationResponse.json();
        setDonationData(donationData.monthlyData || []);
        setImpactMetrics(donationData.impactMetrics || null);
      } else {
        console.error('Failed to fetch tax report data');
        setDonationData([]);
        setImpactMetrics(null);
      }
    } catch (error) {
      console.error('Error fetching tax report data:', error);
      setDonationData([]);
      setImpactMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/donors/${user.id}/generate-tax-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            year: selectedYear,
            report_type: 'tax_benefits'
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Download the PDF
        if (data.download_url) {
          const link = document.createElement('a');
          link.href = `http://localhost:5001${data.download_url}`;
          link.download = ''; 
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        const summary = data.report_summary;
        const reportMessage = `Tax Benefits Report Generated Successfully!

Donor: ${summary.donor_name}
Year: ${summary.year}
Total Donations: ${summary.total_donations}
Total Value: R{summary.total_value.toLocaleString()}
Estimated Savings: R{summary.estimated_savings.toLocaleString()}

Your PDF report has been downloaded automatically.`;

        alert(reportMessage);
      } else {
        alert("Failed to generate tax report. Please try again.");
      }
    } catch (error) {
      console.error('Error generating tax report:', error);
      alert("An error occurred while generating the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalEstimatedSavings = taxBenefits.reduce((sum, benefit) => sum + benefit.estimatedSaving, 0);

  return (
    <div className="min-h-screen bg-[#f8f5f0] p-6 font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <FileText className="mr-3 h-8 w-8" />
              Tax Benefits & Impact Report
            </h1>
            <p className="text-gray-600 mt-2">
              Track your donations, impact, and potential tax benefits
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <button
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {impactMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value Donated</p>
                <p className="text-2xl font-bold text-green-600">R{impactMetrics.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-blue-600">92/100</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weight Donated</p>
                <p className="text-2xl font-bold text-purple-600">{impactMetrics.totalWeight} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-orange-600">R{totalEstimatedSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Donation Trend */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Monthly Donation Summary - {selectedYear}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-600">Loading donation data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationData.map((data, index) => (
                  <tr key={data.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.donations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.totalKg}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R{data.estimatedValue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        data.impactScore >= 95 ? 'bg-green-100 text-green-800' :
                        data.impactScore >= 90 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.impactScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tax Benefits Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Potential Tax Benefits & Savings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {taxBenefits.map((benefit, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">{benefit.category}</h3>
                {benefit.estimatedSaving > 0 && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                    R{benefit.estimatedSaving.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{benefit.description}</p>
              <p className="text-xs text-gray-500">
                <strong>Eligibility:</strong> {benefit.eligibility}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">
              Total Estimated Annual Savings: R{totalEstimatedSavings.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-2">
            These are estimated benefits. Consult your tax advisor for specific deduction calculations.
          </p>
        </div>
      </div>

      {/* Environmental Impact */}
      {impactMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-green-800">Environmental Impact</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="font-medium text-gray-900">Food Rescued</h3>
              <p className="text-2xl font-bold text-blue-600">{impactMetrics.totalWeight} kg</p>
              <p className="text-sm text-gray-500">Total weight of food donations</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-medium text-gray-900">CO₂ Saved</h3>
              <p className="text-2xl font-bold text-green-600">{impactMetrics.co2Saved} kg</p>
              <p className="text-sm text-gray-500">Carbon footprint reduction</p>
            </div>

            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌳</span>
              </div>
              <h3 className="font-medium text-gray-900">Trees Equivalent</h3>
              <p className="text-2xl font-bold text-amber-600">{impactMetrics.treesEquivalent}</p>
              <p className="text-sm text-gray-500">Environmental benefit equivalent</p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Your Impact This Year</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">{impactMetrics.totalWeight} kg</p>
                <p className="text-xs text-gray-600">Food Rescued</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{impactMetrics.totalDonations}</p>
                <p className="text-xs text-gray-600">Total Donations</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">{impactMetrics.totalDonations}</p>
                <p className="text-xs text-gray-600">Total Donations</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">R{impactMetrics.totalValue.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Value Contributed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxReports;