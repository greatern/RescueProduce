import React, { useState, useEffect } from 'react';
import { BarChart3, Download, AlertCircle, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

interface ReportType {
  type: string;
  name: string;
  description: string;
}

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  region?: string;
  foodType?: string;
  status?: string;
  volunteerId?: string;
  donorId?: string;
  receiverId?: string;
  urgencyLevel?: string;
}

interface ReportData {
  title: string;
  type: string;
  generatedAt: string;
  filters: ReportFilters;
  data: any;
  summary: {
    totalRecords: number;
    dateRange: string;
    [key: string]: any;
  };
}

const Reports: React.FC = () => {
  const [availableReports, setAvailableReports] = useState<ReportType[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Generate report filters
  const [filters] = useState<ReportFilters>({});

  // Fetch available report types
  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reports/types');
      if (!response.ok) throw new Error('Failed to fetch report types');

      const result = await response.json();
      if (result.status === 'success' && result.data.reportTypes) {
        setAvailableReports(result.data.reportTypes);
      }
    } catch (err) {
      setError('Failed to load available reports');
      console.error('Error fetching report types:', err);
    }
  };

  const viewReport = async (reportType: string) => {
    if (!reportType) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `http://localhost:5001/api/reports/view/${reportType}?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();

      if (result.status === 'success') {
        setCurrentReport(result.data);
        setMessage('Report loaded successfully');
      } else {
        throw new Error(result.message || 'Failed to generate report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
      setCurrentReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomReport = async () => {
    if (!selectedReportType) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5001/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReportType,
          filters: filters
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();

      if (result.status === 'success') {
        // Download the PDF
        if (result.download_url) {
          const link = document.createElement('a');
          link.href = `http://localhost:5001${result.download_url}`;
          link.download = '';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Show success message
        const summary = result.report_summary;
        const reportMessage = `${summary.title} Generated Successfully!\n\nReport Type: ${summary.report_type}\nGenerated: ${new Date(summary.generated_at).toLocaleString()}\n\nYour PDF report has been downloaded automatically.`;

        setMessage(reportMessage);

        // Also update current report for display
        setCurrentReport({
          title: summary.title,
          type: summary.report_type,
          generatedAt: summary.generated_at,
          filters: filters,
          data: { message: 'Report generated and downloaded as PDF' },
          summary: { totalRecords: 1, dateRange: 'Current period' }
        });
      } else {
        throw new Error(result.message || 'Failed to generate report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      setCurrentReport(null);
    } finally {
      setLoading(false);
    }
  };


  const renderReportData = (report: ReportData) => {
    const { data, summary } = report;

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
              <p className="text-sm text-gray-600">
                Generated on {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => generateCustomReport()}
              disabled={!selectedReportType || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Export PDF</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.completionRate !== undefined && summary.completionRate !== null && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {summary.activeVolunteers !== undefined && summary.activeVolunteers !== null && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-900">Active Volunteers</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.activeVolunteers}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Report Details</h3>

          {/* Food Donations Report */}
          {report.type === 'food_donations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">By Category</h4>
                  <div className="space-y-2">
                    {data.byCategory.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{item.category}</span>
                        <div className="text-right">
                          <span className="text-blue-600 font-bold">{item.count}</span>
                          <span className="text-gray-500 text-sm ml-2">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Donors</h4>
                  <div className="space-y-2">
                    {data.topDonors.slice(0, 5).map((donor: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{donor.donorName}</span>
                        <span className="text-green-600 font-bold">{donor.donationCount} donations</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Activity Report */}
          {report.type === 'user_activity' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activity Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.roleBreakdown && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Active Donors</p>
                        <p className="text-3xl font-bold text-blue-600">{data.roleBreakdown.donors?.activeLast7Days || 0}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Active Volunteers</p>
                        <p className="text-3xl font-bold text-green-600">{data.roleBreakdown.volunteers?.activeLast7Days || 0}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">New Registrations</p>
                        <p className="text-3xl font-bold text-purple-600">{summary.newRegistrationsLast30Days || 0}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {data.byEngagementStatus && data.byEngagementStatus.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Engagement Status</h4>
                  <div className="space-y-2">
                    {data.byEngagementStatus.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium capitalize">{item.status.replace('_', ' ')}</span>
                        <div className="text-right">
                          <span className="text-blue-600 font-bold">{item.count}</span>
                          <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Operations Report */}
          {report.type === 'delivery' && data.operationalMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-900">Total Active</p>
                  <p className="text-3xl font-bold text-blue-600">{data.operationalMetrics.totalActive || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-red-900">High Risk</p>
                  <p className="text-3xl font-bold text-red-600">{data.operationalMetrics.highRisk || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-yellow-900">Unassigned</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.operationalMetrics.unassigned || 0}</p>
                </div>
              </div>

              {summary.averageDeliveryTime && summary.averageDeliveryTime !== 'N/A' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Average Delivery Time</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.averageDeliveryTime}</p>
                </div>
              )}

              {data.criticalAlerts && data.criticalAlerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Critical Alerts</h4>
                  <div className="space-y-2">
                    {data.criticalAlerts.map((alert: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
                      }`}>
                        <div className="font-medium text-gray-900">{alert.message}</div>
                        <div className="text-sm text-gray-600 mt-1">{alert.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collections Report */}
          {report.type === 'collections' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-900">Total Collections</p>
                  <p className="text-3xl font-bold text-blue-600">{data.totalCollections}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-900">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{data.completedCollections}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-yellow-900">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.pendingCollections}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">By Urgency Level</h4>
                <div className="space-y-2">
                  {data.byUrgencyLevel.map((urgency: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{urgency.urgency}</span>
                      <span className="text-red-600 font-bold">{urgency.count} collections</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Food Waste Impact Report */}
          {report.type === 'food_waste' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-900">Total Donated</p>
                  <p className="text-3xl font-bold text-blue-600">{summary.totalDonatedKg || '0.0'} kg</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-900">Total Rescued</p>
                  <p className="text-3xl font-bold text-green-600">{summary.totalRescuedKg || '0.0'} kg</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-purple-900">Meals Provided</p>
                  <p className="text-3xl font-bold text-purple-600">{summary.mealsProvided || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-orange-900">CO₂ Avoided</p>
                  <p className="text-3xl font-bold text-orange-600">{summary.co2Avoided || '0.0 kg'}</p>
                </div>
              </div>

              {summary.estimatedValue && summary.estimatedValue !== 'R0.00' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Estimated Value of Rescued Food</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.estimatedValue}</p>
                </div>
              )}

              {summary.conversionFactors && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Conversion Factors (Assumptions)</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>• Meals per kg: {summary.conversionFactors.mealsPerKg}</div>
                    <div>• CO₂e per kg: {summary.conversionFactors.kgCO2ePerKg} kg</div>
                    <div>• Average price per kg: R{summary.conversionFactors.avgPricePerKg}</div>
                  </div>
                </div>
              )}

              {data.byCategory && data.byCategory.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Food Categories Rescued</h4>
                  <div className="space-y-2">
                    {data.byCategory.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{item.category}</span>
                        <div className="text-right">
                          <span className="text-green-600 font-bold">{item.kg} kg</span>
                          <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {summary.dataStatus && summary.dataStatus !== 'OK' && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-yellow-800 font-medium">Data Status: {summary.dataStatus}</p>
                </div>
              )}
            </div>
          )}


          {/* Recommendations Section */}
          {data.insights && data.insights.length > 0 && (
            <div className="mt-6 bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recommendations
              </h4>
              <div className="space-y-3">
                {data.insights.map((insight: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{insight.metric}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        insight.status === 'good' || insight.status === 'normal' ? 'bg-green-100 text-green-800' :
                        insight.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {insight.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-2">Generate and view comprehensive reports on platform activity</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Report Selection */}
        <div className="space-y-6">
          {/* Available Report Types */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Available Reports
            </h3>
            <div className="space-y-2">
              {availableReports.map((report) => (
                <button
                  key={report.type}
                  onClick={() => {
                    setSelectedReportType(report.type);
                    viewReport(report.type);
                  }}
                  className={`w-full text-left p-3 border rounded-lg transition-all ${
                    selectedReportType === report.type
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Report Display */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <Clock className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating report...</p>
            </div>
          ) : currentReport ? (
            renderReportData(currentReport)
          ) : (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
              <p className="text-gray-600">Select a report type and click "View Report" or "Generate Report" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;