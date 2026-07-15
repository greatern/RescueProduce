import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface VerificationStatus {
  id?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'incomplete' | 'resubmission_required';
  feedback?: string;
  reviewed_at?: string;
  documents?: any[];
}

const VerificationSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    registration_number: '',
    organization_type: '',
    mission_statement: '',
    phone_number: '',
    address: ''
  });

  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    registration_certificate: null,
    proof_of_address: null,
  });

  // const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Check if user already has a verification request
        checkVerificationStatus(parsedUser.id);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/login');
    }
  }, [navigate]);

  const checkVerificationStatus = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/ngo-verification/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.data);
      }
    } catch (error) {
      console.log("No existing verification found or error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: e.target.files![0]
      }));
    }
  };

  const submitVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First, submit the verification request
      const verificationResponse = await fetch('http://localhost:5001/api/ngo-verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: user.id,
          ...formData
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to submit verification request');
      }

      const verificationData = await verificationResponse.json();
      const verificationId = verificationData.data.verification.id;

      // Then, upload documents if any are selected
      const uploadedFiles = Object.entries(documents).filter(([_, file]) => file !== null);

      if (uploadedFiles.length > 0) {
        const formDataUpload = new FormData();

        uploadedFiles.forEach(([documentType, file]) => {
          if (file) {
            formDataUpload.append('documents', file);
            formDataUpload.append(`document_type_${file.name}`, documentType);
            formDataUpload.append(`is_required_${file.name}`, 'true');
          }
        });

        const uploadResponse = await fetch(`http://localhost:5001/api/ngo-verification/${verificationId}/documents`, {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          console.error('Failed to upload some documents');
        }
      }

      alert('Verification request submitted successfully! You will be notified of the status via push notification.');
      checkVerificationStatus(user.id);

    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'incomplete': return 'text-yellow-600 bg-yellow-100';
      case 'resubmission_required': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <X className="h-5 w-5" />;
      case 'under_review': return <Clock className="h-5 w-5" />;
      case 'incomplete': return <AlertCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  // If user already has verification status
  if (verificationStatus) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold">NGO Verification Status</h1>
            </div>

            <div className={`flex items-center p-4 rounded-lg mb-6 ${getStatusColor(verificationStatus.status)}`}>
              {getStatusIcon(verificationStatus.status)}
              <div className="ml-3">
                <h3 className="font-semibold capitalize">
                  {verificationStatus.status.replace('_', ' ')}
                </h3>
                {verificationStatus.feedback && (
                  <p className="text-sm mt-1">{verificationStatus.feedback}</p>
                )}
              </div>
            </div>

            {verificationStatus.status === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    🎉 Congratulations! Your organization is now verified.
                  </span>
                </div>
              </div>
            )}

            {(verificationStatus.status === 'rejected' ||
              verificationStatus.status === 'incomplete' ||
              verificationStatus.status === 'resubmission_required') && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setVerificationStatus(null);
                    setFormData({
                      registration_number: '',
                      organization_type: '',
                      mission_statement: '',
                      phone_number: '',
                      address: ''
                    });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Submit New Verification Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Receiver Verification</h1>
              <p className="text-gray-600">Submit your details for verification to receive donations</p>
            </div>
          </div>

          <form onSubmit={submitVerificationRequest} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="+27 123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="organization_type"
                    value={formData.organization_type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Individual">Individual</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Your full address"
                />
              </div>

              {formData.organization_type === 'Organization' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={formData.organization_type === 'Organization'}
                    placeholder="NPO/PBO/Company registration number"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.organization_type === 'Individual' ? 'Why do you need food assistance?' : 'Organization Description'} *
                </label>
                <textarea
                  name="mission_statement"
                  value={formData.mission_statement}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    formData.organization_type === 'Individual'
                      ? "Briefly explain your situation and why you need food assistance..."
                      : "What does your organization do and who do you help?"
                  }
                  required
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>

              {formData.organization_type === 'Individual' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>For Individuals:</strong> Only Proof of Address is required. Other documents are optional.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.organization_type === 'Individual' ? (
                  // For Individuals: Only proof of address
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proof of Address *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'proof_of_address')}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                    {documents.proof_of_address && (
                      <p className="text-sm text-green-600 mt-1">
                        📄 {documents.proof_of_address.name}
                      </p>
                    )}
                  </div>
                ) : formData.organization_type === 'Organization' ? (
                  // For Organizations: Only 2 documents
                  <>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Certificate *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'registration_certificate')}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      {documents.registration_certificate && (
                        <p className="text-sm text-green-600 mt-1">
                          📄 {documents.registration_certificate.name}
                        </p>
                      )}
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof of Address *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'proof_of_address')}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      {documents.proof_of_address && (
                        <p className="text-sm text-green-600 mt-1">
                          📄 {documents.proof_of_address.name}
                        </p>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                * Required documents. Accepted formats: PDF, JPEG, PNG. Max size: 10MB per file.
                <br />
                {formData.organization_type === 'Individual' ? (
                  <span><strong>For Individuals:</strong> Proof of Address can be a utility bill, bank statement, or any government document showing your address.</span>
                ) : formData.organization_type === 'Organization' ? (
                  <span><strong>For Organizations:</strong> Registration Certificate (NPO/PBO/Company registration) and Proof of Address are required.</span>
                ) : (
                  <span>Please select Individual or Organization above to see document requirements.</span>
                )}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/receiver')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationSubmission;