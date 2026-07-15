import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Check,
  X,
  Clock,
  AlertCircle,
  User
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'NGO' | 'Volunteer' | 'Donor' | 'Admin';
  status: 'Active' | 'Pending' | 'Suspended' | 'Anonymized';
  lastActive: string;
  reputationScore?: number;
  verificationStatus?: 'Verified' | 'Unverified' | 'Pending';
}

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userType: 'NGO' | 'Volunteer';
  documents: string[];
  submittedAt: string;
}

interface Appeal {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [activeVerificationTab, setActiveVerificationTab] = useState<'NGO' | 'Volunteer'>('NGO');
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [expandedAppeal, setExpandedAppeal] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showAnonymizeModal, setShowAnonymizeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'FoodBank SA',
        email: 'contact@foodbanksa.org',
        role: 'NGO',
        status: 'Active',
        lastActive: '2025-04-10',
        verificationStatus: 'Verified'
      },
      {
        id: '2',
        name: 'John Volunteer',
        email: 'john@example.com',
        role: 'Volunteer',
        status: 'Pending',
        lastActive: '2025-04-08',
        reputationScore: 45
      },
      {
        id: '3',
        name: 'Shoprite Cape Town',
        email: 'manager@shoprite.co.za',
        role: 'Donor',
        status: 'Active',
        lastActive: '2025-04-11'
      },
      {
        id: '4',
        name: 'ANON_7X9F3',
        email: 'anon@rescueproduce.org',
        role: 'Volunteer',
        status: 'Anonymized',
        lastActive: '2023-06-15'
      }
    ];

    const mockVerifications: VerificationRequest[] = [
      {
        id: 'v1',
        userId: '5',
        userName: 'Hope Foundation',
        userType: 'NGO',
        documents: ['registration.pdf', 'address_proof.jpg'],
        submittedAt: '2025-04-09'
      },
      {
        id: 'v2',
        userId: '6',
        userName: 'Sarah Johnson',
        userType: 'Volunteer',
        documents: ['certificate.pdf'],
        submittedAt: '2025-04-10'
      }
    ];

    const mockAppeals: Appeal[] = [
      {
        id: 'a1',
        userId: '7',
        userName: 'Mike Peterson',
        reason: 'Account was suspended due to alleged fraudulent activity, but this was a misunderstanding with the supermarket staff.',
        submittedAt: '2025-04-08',
        status: 'Pending'
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setVerificationRequests(mockVerifications);
    setAppeals(mockAppeals);
  }, []);

  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'All') {
      result = result.filter(user => user.role === selectedRole);
    }
    
    if (selectedStatus !== 'All') {
      result = result.filter(user => user.status === selectedStatus);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const handleVerify = (requestId: string, status: 'Approved' | 'Rejected') => {
    setVerificationRequests(prev => prev.filter(req => req.id !== requestId));
    
    if (status === 'Approved') {
      const request = verificationRequests.find(req => req.id === requestId);
      if (request) {
        setUsers(prev => prev.map(user => 
          user.id === request.userId 
            ? { ...user, verificationStatus: 'Verified', status: 'Active' } 
            : user
        ));
      }
    }
  };

  const handleUserStatusChange = (userId: string, action: 'suspend' | 'activate' | 'anonymize') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: action === 'activate' ? 'Active' : 
                  action === 'suspend' ? 'Suspended' : 'Anonymized'
        };
      }
      return user;
    }));
    
    setShowSuspendModal(false);
    setShowAnonymizeModal(false);
    setSelectedUser(null);
  };

  const handleAppealResolution = (appealId: string, decision: 'Approved' | 'Rejected') => {
    setAppeals(prev => prev.map(appeal => 
      appeal.id === appealId 
        ? { ...appeal, status: decision } 
        : appeal
    ));
    
    if (decision === 'Approved') {
      const appeal = appeals.find(a => a.id === appealId);
      if (appeal) {
        setUsers(prev => prev.map(user => 
          user.id === appeal.userId 
            ? { ...user, status: 'Active' } 
            : user
        ));
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users, verifications, and appeals</p>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button className="py-4 px-1 border-b-2 font-medium text-sm border-emerald-500 text-emerald-600">
              User Directory
            </button>
            <button className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Verification Requests
            </button>
            <button className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Appeals
            </button>
          </nav>
        </div>

        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="NGO">NGOs</option>
                <option value="Volunteer">Volunteers</option>
                <option value="Donor">Donors</option>
                <option value="Admin">Admins</option>
              </select>
              
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Anonymized">Anonymized</option>
              </select>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'NGO' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Volunteer' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'Donor' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                            user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.verificationStatus ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                              user.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {user.verificationStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {user.status === 'Active' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </button>
                          )}
                          {user.status === 'Suspended' && (
                            <button
                              onClick={() => handleUserStatusChange(user.id, 'activate')}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </button>
                          )}
                          {user.status !== 'Anonymized' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAnonymizeModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                              <ShieldAlert className="h-4 w-4 mr-1" />
                              Anonymize
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Requests</h2>
          
          <div className="mb-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveVerificationTab('NGO')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeVerificationTab === 'NGO' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                NGO Verifications
              </button>
              <button
                onClick={() => setActiveVerificationTab('Volunteer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeVerificationTab === 'Volunteer' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Volunteer Certifications
              </button>
            </nav>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {verificationRequests.filter(req => req.userType === activeVerificationTab).length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {verificationRequests
                  .filter(req => req.userType === activeVerificationTab)
                  .map((request) => (
                    <li key={request.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                              <div className="text-sm text-gray-500">
                                {request.userType === 'NGO' ? 'NGO Registration' : 'Volunteer Certification'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVerify(request.id, 'Rejected')}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleVerify(request.id, 'Approved')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <div className="mr-6 flex items-center text-sm text-gray-500">
                              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              Submitted on {request.submittedAt}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <span className="mr-2">Documents:</span>
                            {request.documents.map((doc, idx) => (
                              <a
                                key={idx}
                                href="#"
                                className="text-emerald-600 hover:text-emerald-900 mr-2"
                              >
                                {doc}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <FileText className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No pending verifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All {activeVerificationTab === 'NGO' ? 'NGO' : 'Volunteer'} verification requests have been processed.
                </p>
              </div>
            )}
          </div>
        </section>

       
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Appeals</h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {appeals.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {appeals.map((appeal) => (
                  <li key={appeal.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{appeal.userName}</div>
                            <div className="text-sm text-gray-500">Appeal submitted on {appeal.submittedAt}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setExpandedAppeal(expandedAppeal === appeal.id ? null : appeal.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            {expandedAppeal === appeal.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                View
                              </>
                            )}
                          </button>
                          {appeal.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleAppealResolution(appeal.id, 'Rejected')}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleAppealResolution(appeal.id, 'Approved')}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {expandedAppeal === appeal.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Appeal Reason</h4>
                          <p className="text-sm text-gray-700">{appeal.reason}</p>
                          {appeal.status !== 'Pending' && (
                            <div className="mt-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${appeal.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {appeal.status}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <Check className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No pending appeals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All user appeals have been processed.
                </p>
              </div>
            )}
          </div>
        </section>

        {showSuspendModal && selectedUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Suspend User Account</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to suspend {selectedUser.name}'s account? This will prevent them from accessing the platform.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                    onClick={() => handleUserStatusChange(selectedUser.id, 'suspend')}
                  >
                    Suspend Account
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowSuspendModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAnonymizeModal && selectedUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                    <ShieldAlert className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Anonymize User Data</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This will permanently anonymize {selectedUser.name}'s personal data while preserving their activity records. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:col-start-2 sm:text-sm"
                    onClick={() => handleUserStatusChange(selectedUser.id, 'anonymize')}
                  >
                    Anonymize Data
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowAnonymizeModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;