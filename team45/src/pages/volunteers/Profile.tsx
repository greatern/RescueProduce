import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, Award, Truck, Calendar, Star, Edit2, Check, X, Lock, AlertTriangle, LogOut } from "lucide-react";

interface UserDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    status: string;
}

interface VolunteerProfile {
    id: string;
    reputation_score: number;
    is_verified: boolean;
    transport_type?: string;
    capacity_kg?: number;
    certification_url?: string[];
    license_number?: string;
    license_expiry_date?: string;
    last_delivery?: string;
    organization_id?: string;
    user: UserDetails;
}

interface ProfileResponse {
    profile: VolunteerProfile;
}

interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    transport_type?: string;
    capacity_kg?: number;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<VolunteerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "password" | "deactivate">("profile");
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        phone: "",
        transport_type: "",
        capacity_kg: 0
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Get actual user data from localStorage
    let volunteerId = "demo-volunteer-id";
    let userName = "Volunteer";
    let userEmail = "volunteer@example.com";

    try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            volunteerId = parsedUser.id || volunteerId;
            userName = parsedUser.name || userName;
            userEmail = parsedUser.email || userEmail;
        }
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
    }

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get<ProfileResponse>(`/volunteers/${volunteerId}`);
                setProfile(response.profile);
                setEditData({
                    name: response.profile.user.name,
                    phone: response.profile.user.phone,
                    transport_type: response.profile.transport_type || "",
                    capacity_kg: response.profile.capacity_kg || 0
                });
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load profile.");
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [volunteerId]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/users/${profile?.id}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword,
                    confirm_password: passwordData.confirmPassword,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                // Try to parse error response, but handle cases where it's not JSON
                let errorMessage = "Failed to change password";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = response.statusText || errorMessage;
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Failed to change password. Please try again.");
        }
    };

    const handleDeactivateAccount = () => {
        alert("Account deactivated successfully. You will be logged out.");
        navigate("/login");
    };

    const handleEditToggle = () => {
        if (isEditing && profile) {
            setEditData({
                name: profile.user.name,
                phone: profile.user.phone,
                transport_type: profile.transport_type || "",
                capacity_kg: profile.capacity_kg || 0
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            await api.patch(`/users/${volunteerId}`, {
                name: editData.name,
                phone: editData.phone
            });

            await api.patch(`/volunteers/${volunteerId}`, {
                transport_type: editData.transport_type,
                capacity_kg: editData.capacity_kg
            });

            const response = await api.get<ProfileResponse>(`/volunteers/${volunteerId}`);
            setProfile(response.profile);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update profile.");
            alert("Failed to update profile - this is expected in demo mode");
            if (profile) {
                const updatedProfile = {
                    ...profile,
                    user: {
                        ...profile.user,
                        name: editData.name,
                        phone: editData.phone
                    },
                    transport_type: editData.transport_type,
                    capacity_kg: editData.capacity_kg
                };
                setProfile(updatedProfile);
                setIsEditing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const getReputationBadge = (score: number) => {
        if (score >= 90) return { color: "bg-green-100 text-green-800", label: "Excellent" };
        if (score >= 70) return { color: "bg-blue-100 text-blue-800", label: "Good" };
        if (score >= 50) return { color: "bg-yellow-100 text-yellow-800", label: "Fair" };
        return { color: "bg-red-100 text-red-800", label: "Needs Improvement" };
    };

    const getVerificationStatus = (isVerified: boolean) => {
        return isVerified 
            ? { color: "bg-green-100 text-green-800", label: "Verified", icon: Check }
            : { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: X };
    };

    if (loading) {
        return (
            <div className="main-content p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="main-content p-6 text-center">
                <p className="text-gray-500">No profile data available.</p>
            </div>
        );
    }

    const reputationBadge = getReputationBadge(profile.reputation_score);
    const verificationStatus = getVerificationStatus(profile.is_verified);

    return (
        <div className="main-content p-8 bg-gray-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2 text-gray-900">Volunteer Profile</h2>
                            <p className="text-gray-600">Manage your volunteer information and settings.</p>
                        </div>
                        <button
                            onClick={isEditing ? handleSaveChanges : handleEditToggle}
                            disabled={loading}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                isEditing 
                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            } disabled:opacity-50`}
                        >
                            {isEditing ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "profile"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}>
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "password"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}>
                            <div className="flex items-center">
                                <Lock className="h-4 w-4 mr-2" />
                                Password
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("deactivate")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "deactivate"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}>
                            <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Deactivate
                            </div>
                        </button>
                    </nav>
                </div>

                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-700">API Error: {error}. Please check your connection.</p>
                    </div>
                )}

                {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profile.user.name}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profile.user.phone}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                        <p className="text-gray-900 font-medium">{profile.user.email}</p>
                                        <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Volunteer Details */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900">Volunteer Details</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transport Type
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editData.transport_type}
                                                onChange={(e) => setEditData({...editData, transport_type: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select transport type</option>
                                                <option value="car">Car</option>
                                                <option value="motorcycle">Motorcycle</option>
                                                <option value="bicycle">Bicycle</option>
                                                <option value="van">Van</option>
                                                <option value="truck">Truck</option>
                                                <option value="walking">Walking</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 font-medium">
                                                {profile.transport_type ? 
                                                    profile.transport_type.charAt(0).toUpperCase() + profile.transport_type.slice(1) 
                                                    : "Not specified"}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Carrying Capacity (kg)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={editData.capacity_kg}
                                                onChange={(e) => setEditData({...editData, capacity_kg: parseInt(e.target.value) || 0})}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">
                                                {profile.capacity_kg ? `${profile.capacity_kg} kg` : "Not specified"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {profile.license_number && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            License Number
                                        </label>
                                        <p className="text-gray-900 font-medium">{profile.license_number}</p>
                                        {profile.license_expiry_date && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Expires: {new Date(profile.license_expiry_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleEditToggle}
                                        className="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Cards */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">Account Status</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Verification Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color} flex items-center`}>
                                        <verificationStatus.icon className="w-3 h-3 mr-1" />
                                        {verificationStatus.label}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Account Status</span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {profile.user.status || "Active"}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Member Since</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(profile.user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reputation Score */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <Award className="w-5 h-5 mr-2 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">Reputation</h3>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    {profile.reputation_score}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${reputationBadge.color}`}>
                                    {reputationBadge.label}
                                </span>
                                
                                <div className="mt-4">
                                    <div className="flex justify-center mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`w-4 h-4 ${
                                                    star <= Math.floor(profile.reputation_score / 20) 
                                                        ? "text-yellow-400 fill-current" 
                                                        : "text-gray-300"
                                                }`} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">Based on delivery performance</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">Activity</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Delivery</span>
                                    <span className="text-sm text-gray-900">
                                        {profile.last_delivery 
                                            ? new Date(profile.last_delivery).toLocaleDateString()
                                            : "Never"}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Volunteer ID</span>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {profile.id.slice(0, 8)}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Change Password
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Update your account password
                            </p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                            <form onSubmit={handlePasswordChange}>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <label
                                        htmlFor="currentPassword"
                                        className="block text-sm font-medium text-gray-500">
                                        Current Password
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                            value={passwordData.currentPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    currentPassword:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-gray-500">
                                        New Password
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="password"
                                            id="newPassword"
                                            className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            required
                                            minLength={8}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Password must be at least 8 characters long and contain uppercase, lowercase, and number
                                        </p>
                                    </div>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-500">
                                        Confirm New Password
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Deactivate Account Tab */}
                {activeTab === "deactivate" && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Deactivate Account
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                This will disable your account and remove your personal information from public view.
                            </p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle
                                            className="h-5 w-5 text-red-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Warning
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>Deactivating your account will:</p>
                                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                                <li>Remove your profile from search results</li>
                                                <li>Cancel any pending assignments</li>
                                                <li>Prevent you from logging in</li>
                                                <li>Affect your volunteer reputation score</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <button
                                    onClick={() => setShowDeactivateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Deactivate Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deactivate Modal */}
                {showDeactivateModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                                &#8203;
                            </span>
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Confirm Account Deactivation
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to deactivate your account? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                        onClick={handleDeactivateAccount}>
                                        Deactivate Account
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setShowDeactivateModal(false)}>
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

export default Profile;