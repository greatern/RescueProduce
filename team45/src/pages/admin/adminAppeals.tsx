import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
}

interface Blocklist {
  id: string;
  user_id: string;
  reason: string;
  date_blocked: string;
  block_duration: number;
  is_active: boolean;
  user?: User;
}

interface FraudCase {
  id: string;
  case_number: string;
  description: string;
  issue_type: string;
  severity_level: string;
  status: string;
  date_reported: string;
  resolution_details?: string;
}

interface Appeal {
  id: string;
  user_id: string;
  block_id: string;
  appeal_reason: string;
  evidence_files: string[];
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  priority?: string;
  decision_notes?: string;
  decision_date?: string;
  admin_reviewer_id?: string;
  user?: User;
  block?: Blocklist;
  fraud_case?: FraudCase;
}

interface Analytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: string;
}

const AppealsManagement = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const adminId = "temp-admin-id"; // Replace with actual admin ID from your auth

  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<string[]>([]);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      console.log('Fetching appeals...');
      
      const queryParams = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority })
      });

      const url = `${apiUrl}/api/fraudcases/appeals?${queryParams}`;
      console.log('Request URL:', url);

      const res = await fetch(url);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to fetch appeals');
      }
      
      const response = await res.json();
      console.log('Appeals response:', response);
      
      setAppeals(response.data?.appeals || response.appeals || []);
      setAnalytics(response.data?.analytics || null);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0
      }));
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to fetch appeals");
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [filters.status, filters.priority, pagination.offset]);

  const decideAppeal = async (appealId: string, decision: 'approved' | 'rejected', notes: string) => {
    setProcessing(true);
    try {
      console.log('Deciding appeal:', { appealId, decision, notes });
      
      const res = await fetch(`${apiUrl}/api/fraudcases/appeals/${appealId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          decision, 
          decision_notes: notes,
          admin_id: adminId 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error processing appeal");
      }

      alert(`Appeal ${decision} successfully!`);
      setShowDecisionModal(false);
      setSelectedAppeal(null);
      setDecisionNotes('');
      await fetchAppeals();
    } catch (err: any) {
      console.error('Decision error:', err);
      alert(`Failed to process appeal: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredAppeals = appeals.filter(appeal => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      (appeal.appeal_reason || "").toLowerCase().includes(searchTerm) ||
      (appeal.user?.name || "").toLowerCase().includes(searchTerm) ||
      (appeal.user?.email || "").toLowerCase().includes(searchTerm) ||
      (appeal.fraud_case?.case_number || "").toLowerCase().includes(searchTerm) ||
      (appeal.id || "").toLowerCase().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading appeals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Appeals Management</h1>
        <p className="text-gray-500">Review and process user appeals for blocks and penalties</p>
      </header>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Total Appeals</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{analytics.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{analytics.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{analytics.rejected}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-700">Approval Rate</h3>
            <p className="text-2xl font-bold text-purple-600">{analytics.approvalRate}%</p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full border rounded-lg p-2">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={filters.priority} onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))} className="w-full border rounded-lg p-2">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" value={filters.search} onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Search appeals..." className="w-full border rounded-lg p-2"/>
          </div>
          <div className="flex items-end">
            <button onClick={fetchAppeals} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">Refresh Appeals</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <span>{error}</span>
          <button onClick={fetchAppeals} className="ml-4 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Retry</button>
        </div>
      )}

      {filteredAppeals.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg">
          {error ? 'Failed to load appeals. Please try again.' : 'No appeals found matching your criteria.'}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAppeals.map((appeal) => (
            <div key={appeal.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Appeal #{appeal.id.slice(-8).toUpperCase()}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appeal.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                      appeal.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>{appeal.status.replace('_', ' ').toUpperCase()}</span>
                    {appeal.fraud_case && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {appeal.fraud_case.case_number}
                      </span>
                    )}
                    <span className="text-gray-500 text-sm">{new Date(appeal.submission_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {appeal.status === 'pending' && (
                  <button onClick={() => { setSelectedAppeal(appeal); setShowDecisionModal(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Review Appeal</button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Appellant</h4>
                    <p className="text-gray-600">{appeal.user?.name || 'Unknown'} ({appeal.user?.email || 'N/A'})</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{appeal.user?.user_type || 'N/A'}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Appeal Reason</h4>
                    <p className="text-gray-600">{appeal.appeal_reason}</p>
                  </div>
                  {appeal.fraud_case && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Related Fraud Case</h4>
                      <p className="text-sm text-gray-600"><strong>Case:</strong> {appeal.fraud_case.case_number}</p>
                      <p className="text-sm text-gray-600"><strong>Type:</strong> {appeal.fraud_case.issue_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600"><strong>Severity:</strong> {appeal.fraud_case.severity_level}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Block Details</h4>
                    {appeal.block ? (
                      <>
                        <p className="text-sm text-gray-600"><strong>Reason:</strong> {appeal.block.reason}</p>
                        <p className="text-sm text-gray-600"><strong>Duration:</strong> {appeal.block.block_duration} days</p>
                        <p className="text-sm text-gray-600"><strong>Status:</strong> {appeal.block.is_active ? 'Active' : 'Inactive'}</p>
                        <p className="text-sm text-gray-600"><strong>Blocked:</strong> {new Date(appeal.block.date_blocked).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No block details available</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Evidence</h4>
                    {appeal.evidence_files && appeal.evidence_files.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {appeal.evidence_files.slice(0, 3).map((file, i) => (
                          <img key={i} src={`${apiUrl}/uploads/${file}`} alt="Evidence" className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition" onClick={() => { setCurrentEvidence(appeal.evidence_files); setShowEvidenceModal(true); }} />
                        ))}
                        {appeal.evidence_files.length > 3 && <span className="text-gray-500 text-sm mt-2">+{appeal.evidence_files.length - 3} more</span>}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No evidence uploaded</p>
                    )}
                  </div>
                  
                  {appeal.decision_notes && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Decision Notes</h4>
                      <p className="text-sm text-gray-600">{appeal.decision_notes}</p>
                      {appeal.decision_date && (
                        <p className="text-xs text-gray-400 mt-1">Decided on {new Date(appeal.decision_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDecisionModal && selectedAppeal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-800">Review Appeal #{selectedAppeal.id.slice(-8).toUpperCase()}</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                <select value={decision} onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected')} className="w-full border rounded-lg p-2">
                  <option value="approved">Approve Appeal (Unblock User)</option>
                  <option value="rejected">Reject Appeal (Keep Block)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision Notes *</label>
                <textarea value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} placeholder="Explain your decision..." className="w-full border rounded-lg p-3 min-h-[100px]" required />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowDecisionModal(false); setSelectedAppeal(null); setDecisionNotes(''); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={processing}>Cancel</button>
                <button onClick={() => decideAppeal(selectedAppeal.id, decision, decisionNotes)} disabled={!decisionNotes.trim() || processing} className={`px-4 py-2 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed ${decision === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {processing ? "Processing..." : `${decision === 'approved' ? 'Approve' : 'Reject'} Appeal`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Evidence Files</h2>
              <button onClick={() => setShowEvidenceModal(false)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Close</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentEvidence.map((file, index) => (
                <div key={index} className="text-center">
                  <img src={`${apiUrl}/uploads/${file}`} alt={`Evidence ${index + 1}`} className="w-full h-48 object-cover rounded-lg border hover:scale-105 transition cursor-pointer" onClick={() => window.open(`${apiUrl}/uploads/${file}`)} />
                  <p className="mt-2 text-sm text-gray-600">Evidence {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealsManagement;