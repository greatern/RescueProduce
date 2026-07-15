import { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Check,
  AlertCircle,
  Mail,
  Clock,
  Users,
  Filter,
  ChevronDown
} from 'lucide-react';
import DocumentViewer from '../../components/DocumentViewer';

type ActorType = 'Individual' | 'Organization';
type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'incomplete' | 'under_review';

interface VerificationRequest {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  organization_type: ActorType;
  registration_number: string;
  mission_statement: string;
  phone_number: string;
  address: string;
  documents: any[];
  created_at: string;
  status: VerificationStatus;
  reviewed_at?: string;
  feedback?: string;
}

const VerificationCenter = () => {
  const [viewingDocuments, setViewingDocuments] = useState<{
    isOpen: boolean;
    documents: Record<string, string>;
  }>({ isOpen: false, documents: {} });

  const [actorTypeFilter, setActorTypeFilter] = useState<ActorType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);

  const [filteredVerifications, setFilteredVerifications] = useState<VerificationRequest[]>([]);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/ngo-verification/all?status=all');
      if (response.ok) {
        const result = await response.json();
        if ((result.success || result.status === 'success') && result.data && result.data.verifications) {
          const transformedData = result.data.verifications.map((item: any) => ({
            id: item.id,
            organization_id: item.organization_id,
            name: item.organization?.name || 'Unknown',
            email: item.organization?.email || 'Unknown',
            organization_type: item.organization_type,
            registration_number: item.registration_number || '',
            mission_statement: item.mission_statement || '',
            phone_number: item.phone_number || '',
            address: item.address || '',
            documents: item.documents || [],
            created_at: item.created_at,
            status: item.status,
            reviewed_at: item.reviewed_at,
            feedback: item.feedback
          }));
          setVerifications(transformedData);
        } else {
          console.error('Unexpected API response structure:', result);
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = verifications;

    if (actorTypeFilter !== 'all') {
      results = results.filter(v => v.organization_type === actorTypeFilter);
    }

    if (statusFilter !== 'all') {
      results = results.filter(v => v.status === statusFilter);
    }

    if (dateRange[0] && dateRange[1]) {
      results = results.filter(v => {
        const submittedDate = new Date(v.created_at);
        return submittedDate >= dateRange[0]! && submittedDate <= dateRange[1]!;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query) ||
        v.organization_id.toLowerCase().includes(query)
      );
    }

    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredVerifications(results);
  }, [verifications, actorTypeFilter, statusFilter, dateRange, searchQuery]);

  const handleVerification = async (id: string, action: 'approve' | 'reject' | 'flag' | 'request', message?: string) => {
    try {
      const adminData = localStorage.getItem('user_data');
      const admin = adminData ? JSON.parse(adminData) : null;

      if (!admin) {
        alert('Admin authentication required');
        return;
      }

      let newStatus: string;
      if (action === 'approve') {
        const reviewResponse = await fetch(`http://localhost:5001/api/ngo-verification/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'under_review',
            admin_notes: 'Moving to review',
            feedback: 'Under admin review',
            admin_id: admin.id,
          }),
        });

        if (!reviewResponse.ok) {
          throw new Error('Failed to move to under_review');
        }

        const approveResponse = await fetch(`http://localhost:5001/api/ngo-verification/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'verified',
            admin_notes: message || 'Verification approved',
            feedback: message || 'Your verification has been approved!',
            admin_id: admin.id,
          }),
        });

        if (!approveResponse.ok) {
          throw new Error('Failed to approve verification');
        }
        newStatus = 'verified';
      } else {
        newStatus = action === 'reject' ? 'rejected' : action === 'request' ? 'incomplete' : 'under_review';

        const response = await fetch(`http://localhost:5001/api/ngo-verification/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            admin_notes: message || `Status updated to ${newStatus}`,
            feedback: message || `Verification ${action}`,
            admin_id: admin.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update verification status');
        }
      }

      await fetchVerifications();
      alert(`Verification ${action} successful! Push notification sent to user.`);
    } catch (error: any) {
      console.error('Error updating verification:', error);
      alert(`Error updating verification: ${error.message}`);
    }
  };

  const getRequiredDocs = (type: ActorType) => {
    switch (type) {
      case 'Organization':
        return ['Registration Certificate', 'Proof of Address'];
      case 'Individual':
        return ['Proof of Address'];
      default:
        return [];
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Shield className="mr-2" /> Verification Center
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Actor Type</label>
            <div className="relative">
              <select
                className="w-full p-2 border rounded appearance-none"
                value={actorTypeFilter}
                onChange={(e) => setActorTypeFilter(e.target.value as ActorType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="Individual">Individuals</option>
                <option value="Organization">Organizations</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="relative">
              <select
                className="w-full p-2 border rounded appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="incomplete">Incomplete</option>
                <option value="under_review">Under Review</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setDateRange((prev) => [date, prev[1]]);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setDateRange((prev) => [prev[0], date]);
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search names or IDs..."
              className="w-full p-2 pl-10 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length > 0 ? (
          filteredVerifications.map((verification) => (
            <div key={verification.id} className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{verification.name}</h3>
                    <span className="ml-2 text-sm text-gray-600">({verification.email})</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        verification.organization_type === 'Individual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {verification.organization_type}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Submitted on {new Date(verification.created_at).toLocaleDateString()}
                    {verification.reviewed_at && (
                      <span className="ml-3">
                        Last reviewed: {new Date(verification.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      <strong>Address:</strong> {verification.address}
                    </p>
                    <p>
                      <strong>Phone:</strong> {verification.phone_number}
                    </p>
                    {verification.organization_type === 'Organization' && verification.registration_number && (
                      <p>
                        <strong>Registration Number:</strong> {verification.registration_number}
                      </p>
                    )}
                    <p>
                      <strong>Description:</strong> {verification.mission_statement}
                    </p>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Documents:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                      {getRequiredDocs(verification.organization_type).map((doc) => (
                        <li key={doc}>
                          {doc}:{' '}
                          {verification.documents.some((d: any) =>
                            (d.document_type || '')
                              .toLowerCase()
                              .includes(doc.toLowerCase().replace(/ /g, '_'))
                          ) ? (
                            <span className="text-green-600">Submitted</span>
                          ) : (
                            <span className="text-red-500">Missing</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {verification.documents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-600">
                        <FileText className="inline h-4 w-4 mr-1" />
                        {verification.documents.length} document(s) uploaded
                      </p>
                      {verification.documents.map((doc: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600 ml-5">
                          • {doc.document_type}: {doc.file_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {verification.feedback && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm">
                        <strong>Admin Feedback:</strong> {verification.feedback}
                      </p>
                    </div>
                  )}
                </div>

                {verification.status === 'pending' && (
                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    <button
                      onClick={() => handleVerification(verification.id, 'approve')}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        const missingDoc = getRequiredDocs(verification.organization_type).find(
                          (doc) =>
                            !verification.documents.some(
                              (d: any) =>
                                (d.document_type || '')
                                  .toLowerCase()
                                  .includes(doc.toLowerCase().replace(/ /g, '_'))
                            )
                        );
                        handleVerification(
                          verification.id,
                          'request',
                          `Please submit missing document: ${missingDoc || 'Additional documentation required'}`
                        );
                      }}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded flex items-center justify-center"
                    >
                      <Mail className="h-4 w-4 mr-1" /> Request More
                    </button>
                    <button
                      onClick={() => handleVerification(verification.id, 'flag')}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded flex items-center justify-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" /> Flag Issue
                    </button>
                  </div>
                )}

                {verification.status !== 'pending' && (
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      verification.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : verification.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : verification.status === 'under_review'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {verification.status === 'verified'
                      ? 'Verified'
                      : verification.status === 'rejected'
                      ? 'Rejected'
                      : verification.status === 'under_review'
                      ? 'Under Review'
                      : 'Needs Resubmission'}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto h-10 w-10 mb-2" />
            No verification requests match your filters
            <div className="mt-4 text-sm">
              {verifications.length === 0
                ? 'No data loaded from API'
                : `${verifications.length} verifications in memory but filtered out`}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Verification Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border p-3 rounded-lg">
            <div className="text-sm text-gray-500">Total Pending</div>
            <div className="text-2xl font-bold">
              {verifications.filter((v) => v.status === 'pending').length}
            </div>
          </div>
          <div className="border p-3 rounded-lg">
            <div className="text-sm text-gray-500">Individuals</div>
            <div className="text-2xl font-bold">
              {verifications.filter((v) => v.organization_type === 'Individual').length}
            </div>
          </div>
          <div className="border p-3 rounded-lg">
            <div className="text-sm text-gray-500">Organizations</div>
            <div className="text-2xl font-bold">
              {verifications.filter((v) => v.organization_type === 'Organization').length}
            </div>
          </div>
          <div className="border p-3 rounded-lg">
            <div className="text-sm text-gray-500">Verified</div>
            <div className="text-2xl font-bold">
              {verifications.filter((v) => v.status === 'verified').length}
            </div>
          </div>
        </div>
      </div>

      {viewingDocuments.isOpen && (
        <DocumentViewer
          documents={viewingDocuments.documents}
          onClose={() => setViewingDocuments({ isOpen: false, documents: {} })}
        />
      )}
    </div>
  );
};

export default VerificationCenter;
