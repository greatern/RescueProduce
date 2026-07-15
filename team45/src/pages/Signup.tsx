import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, type ApiResponse } from "../services/api";
import AppLogo from "../assets/img/AppLogo.png";

type AuthResponse = {
  id: string;
  user_type: string;
  message?: string;
};

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("");
  const [healthCertificate, setHealthCertificate] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [addressDonor, setAddressDonor] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [storageCapacity, setStorageCapacity] = useState("");
  const [addressReceiver, setAddressReceiver] = useState("");
  const [organisationId, setOrganisationId] = useState("");
  const [licencePlateNumber, setLicencePlateNumber] = useState("");
  const [licenceExpiryDate, setLicenceExpiryDate] = useState<Date | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgRegistrationNumber, setOrgRegistrationNumber] = useState("");
  const [taxExemptStatus, setTaxExemptStatus] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactEmail, setPrimaryContactEmail] = useState("");
  const [primaryContactPhone, setPrimaryContactPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [county, setCounty] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [establishedDate, setEstablishedDate] = useState<Date | null>(null);
  const [volunteerCapacity, setVolunteerCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatDate = (date?: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !phone || !userType) {
      setError("Please fill all required fields for registration.");
      setLoading(false);
      return;
    }
    if (
      userType === "donor" &&
      (!healthCertificate || !taxNumber || !addressDonor)
    ) {
      setError(
        "Health certificate, tax number, and address are required for donors."
      );
      setLoading(false);
      return;
    }
    if (
      userType === "receiver" &&
      (!registrationNumber || !storageCapacity || !addressReceiver)
    ) {
      setError(
        "Registration number, storage capacity, and address are required for receivers."
      );
      setLoading(false);
      return;
    }
    if (
      userType === "volunteer" &&
      (!licencePlateNumber || !licenceExpiryDate)
    ) {
      setError(
        "Organisation ID, licence plate number, and licence expiry date are required for volunteers."
      );
      setLoading(false);
      return;
    }
    if (
      userType === "volunteer_organization" &&
      (!orgName ||
        !orgType ||
        !orgRegistrationNumber ||
        !taxExemptStatus ||
        !primaryContactName ||
        !primaryContactEmail ||
        !primaryContactPhone ||
        !streetAddress ||
        !city ||
        !stateProvince ||
        !postalCode ||
        !county ||
        !websiteUrl ||
        !establishedDate ||
        !volunteerCapacity)
    ) {
      setError(
        "All fields are required for volunteer organization registration."
      );
      setLoading(false);
      return;
    }
    const user_type = (userType === "donor" && {
          health_certificate: healthCertificate,
          tax_number: taxNumber,
          address: addressDonor,
        }) || (userType === "receiver" && {
          registration_number: registrationNumber,
          storage_capacity: storageCapacity,
          address: addressReceiver,
        }) || (userType === "volunteer" && {
          license_number: licencePlateNumber,
          license_expiry_date: licenceExpiryDate
            ? formatDate(licenceExpiryDate)
            : "",
        })
    try {
      const response = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", {
        name,
        email,
        password: password,
        phone,
        role: userType,
        user_type: user_type
      });
      if(response.status === 'success'){
        setSuccess(
          response.message || "Registration successful! Please log in."
        );
      }
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };


  const floatingShapes = [
    { size: "w-90 h-64", color: "bg-green-200/20", position: "top-20 left-10", animation: "animate-float-1" },
    { size: "w-48 h-48", color: "bg-yellow-200/20", position: "bottom-32 right-16", animation: "animate-float-2" },
    { size: "w-32 h-32", color: "bg-amber-200/15", position: "top-1/3 right-1/4", animation: "animate-float-3" },
    { size: "w-40 h-40", color: "bg-emerald-200/15", position: "bottom-20 left-1/4", animation: "animate-float-4" },
    { size: "w-56 h-56", color: "bg-amber-100/20", position: "top-10 right-20", animation: "animate-float-5" },
  ];

  const foodRescueImages = [
    { src: "https://plus.unsplash.com/premium_photo-1742420854807-505e50053615?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", position: "top-20 left-20", description: "Fresh vegetables" },
    { src: "https://plus.unsplash.com/premium_photo-1683121608450-08d5ee613dd8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGZvb2QlMjBkb25hdGlvbnxlbnwwfHwwfHx8MA%3D%3D?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", position: "bottom-40 left-40", description: "Prepared meals" },
    { src: "https://www.neighborsmn.org/wp-content/uploads/2023/06/Food-Rescue-PNG-e1688063968447-1024x1024.jpg?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", position: "top-1/3 right-40", description: "Community food sharing" },
    { src: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", position: "bottom-20 right-20", description: "Food donation" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 via-amber-50 to-yellow-50">

      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20 text-white fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20 text-white fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

   
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      {floatingShapes.map((shape, index) => (
        <div
          key={index}
          className={`absolute rounded-full blur-xl ${shape.size} ${shape.color} ${shape.position} ${shape.animation}`}
        />
      ))}

   
      {foodRescueImages.map((image, index) => (
        <div
          key={index}
          className={`absolute w-32 h-32 rounded-2xl overflow-hidden shadow-lg ${image.position} animate-float-${index + 1} border-2 border-white`}
        >
          <img
            src={image.src}
            alt={image.description}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-300/30 to-amber-300/30 rounded-full animate-pulse-slow blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
    
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in">
       
          <div className="text-center mb-8">
         <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-amber-200 rounded-2xl mb-4 shadow-lg p-2">

  <div className="w-full h-full bg-green-500/20 rounded-2xl flex items-center justify-center">
    <img src={AppLogo} alt="App Logo" className="h-12 w-12 object-contain" />
  </div>
</div>
            <h2 className="text-4xl font-bold bg-green-500 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-600 mt-2">Join our Rescue Produce community</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                           focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                           shadow-inner backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                           focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                           shadow-inner backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                           focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                           shadow-inner backdrop-blur-sm"
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
              </div>
            </div>

            {/* Phone Input */}
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                           focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                           shadow-inner backdrop-blur-sm"
                  placeholder="Enter your phone number"
                  required
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
              </div>
            </div>

            {/* User Type Selection */}
            <div className="relative">
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                I am a...
              </label>
              <div className="relative">
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                           focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                           shadow-inner backdrop-blur-sm"
                  required
                  disabled={loading}
                >
                  <option value="">Select Account Type</option>
                  <option value="donor">Food Donor</option>
                  <option value="receiver">Food Receiver</option>
                  <option value="volunteer">Volunteer</option>
                </select>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
              </div>
            </div>

            {/* Donor Specific Fields */}
            {userType === "donor" && (
              <>
                <div className="relative">
                  <label
                    htmlFor="healthCertificate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Health Certificate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="healthCertificate"
                      value={healthCertificate}
                      onChange={(e) => setHealthCertificate(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="taxNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tax Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="taxNumber"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="addressDonor"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="addressDonor"
                      value={addressDonor}
                      onChange={(e) => setAddressDonor(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>
              </>
            )}

            {/* Receiver Specific Fields */}
            {userType === "receiver" && (
              <>
                <div className="relative">
                  <label
                    htmlFor="registrationNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Registration Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="registrationNumber"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="storageCapacity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Storage Capacity
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="storageCapacity"
                      value={storageCapacity}
                      onChange={(e) => setStorageCapacity(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="addressReceiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="addressReceiver"
                      value={addressReceiver}
                      onChange={(e) => setAddressReceiver(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>
              </>
            )}

            {/* Volunteer Specific Fields */}
            {userType === "volunteer" && (
              <>
                <div className="relative">
                  <label
                    htmlFor="licencePlateNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Licence Plate Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="licencePlateNumber"
                      value={licencePlateNumber}
                      onChange={(e) => setLicencePlateNumber(e.target.value)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="licenceExpiryDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Licence Expiry Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="licenceExpiryDate"
                      value={licenceExpiryDate ? formatDate(licenceExpiryDate) : ""}
                      onChange={(e) => setLicenceExpiryDate(e.target.value ? new Date(e.target.value) : null)}
                      className="w-full px-5 py-4 border-0 bg-white/50 rounded-2xl text-gray-800 placeholder-gray-500 
                               focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all duration-300 
                               shadow-inner backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-amber-500/10 -z-10" />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:from-green-600 hover:to-amber-600 
                       text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-300 focus:outline-none 
                       focus:ring-4 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing Up...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent 
                         hover:from-green-700 hover:to-amber-500 transition-all duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Status Messages */}
          {success && (
            <div className="mt-6 p-4 bg-green-100/80 border border-green-200 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-100/80 border border-red-200 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 Rescue Produce. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #000000 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-3deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-15px) rotate(3deg) scale(1.03); }
          66% { transform: translateY(10px) rotate(-3deg) scale(0.98); }
        }
        
        @keyframes float5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .animate-slide-in {
          animation: slideIn 0.8s ease-out;
        }
        
        .animate-float-1 {
          animation: float1 6s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float2 8s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float3 7s ease-in-out infinite;
        }
        
        .animate-float-4 {
          animation: float4 9s ease-in-out infinite;
        }
        
        .animate-float-5 {
          animation: float5 10s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUp;