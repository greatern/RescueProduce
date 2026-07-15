import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Donation {
  id: string;
  title: string;
  donor: string;
  foodType: string;
  totalQuantity: number;
  availableQuantity: number;
  expiry: string;
  address: string;
  storageRequirements: string;
  distance: string;
  postedTime: string;
  urgency: 'high' | 'medium' | 'low';
}

const DonationDetails: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimStep, setClaimStep] = useState<'quantity' | 'pickup' | 'address' | 'confirm'>('quantity');
  const [claimQuantity, setClaimQuantity] = useState<number>(1);
  const [pickupOption, setPickupOption] = useState<'volunteer' | 'self' | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [filters, setFilters] = useState({
    foodType: '',
    distance: '',
    urgency: ''
  });

  const donations: Donation[] = [
    {
      id: 'don123',
      title: 'Fresh Vegetables & Fruits',
      donor: 'GreenGrocer Supermarket',
      foodType: 'Vegetables',
      totalQuantity: 50,
      availableQuantity: 35,
      expiry: '2023-11-20',
      address: '123 Market St, Johannesburg, 2001',
      storageRequirements: 'Refrigerated',
      distance: '2.5 km',
      postedTime: '2 hours ago',
      urgency: 'high'
    },
    {
      id: 'don456',
      title: 'Bakery Items',
      donor: 'Metro Foods',
      foodType: 'Bread',
      totalQuantity: 30,
      availableQuantity: 30,
      expiry: '2023-11-18',
      address: '789 Commerce Rd, Johannesburg, 2001',
      storageRequirements: 'Room Temperature',
      distance: '5.1 km',
      postedTime: '1 day ago',
      urgency: 'medium'
    },
    {
      id: 'don789',
      title: 'Canned Goods',
      donor: 'City Pantry',
      foodType: 'Non-perishable',
      totalQuantity: 100,
      availableQuantity: 80,
      expiry: '2024-05-15',
      address: '456 Central Ave, Johannesburg, 2001',
      storageRequirements: 'Dry Storage',
      distance: '3.7 km',
      postedTime: '3 hours ago',
      urgency: 'low'
    }
  ];

  const filteredDonations = donations.filter(donation => {
    return (
      (filters.foodType === '' || donation.foodType.toLowerCase().includes(filters.foodType.toLowerCase())) &&
      (filters.distance === '' || parseFloat(donation.distance) <= parseFloat(filters.distance)) &&
      (filters.urgency === '' || donation.urgency === filters.urgency)
    );
  });

  const handleClaimClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setClaimQuantity(Math.min(5, donation.availableQuantity));
    setShowClaimModal(true);
    setClaimStep('quantity');
  };

  const handleNextStep = () => {
    if (claimStep === 'quantity') setClaimStep('pickup');
    else if (claimStep === 'pickup') setClaimStep('address');
    else if (claimStep === 'address') setClaimStep('confirm');
  };

  const handlePrevStep = () => {
    if (claimStep === 'pickup') setClaimStep('quantity');
    else if (claimStep === 'address') setClaimStep('pickup');
    else if (claimStep === 'confirm') setClaimStep('address');
  };

  const handleConfirmClaim = () => {
   //api
    setShowClaimModal(false);
    navigate('/ClaimHistory', { 
      state: { 
        newClaim: { 
          ...selectedDonation,
          claimedQuantity: claimQuantity,
          pickupOption,
          deliveryAddress: pickupOption === 'volunteer' ? deliveryAddress : selectedDonation?.address,
          status: 'claimed',
          otp: Math.floor(1000 + Math.random() * 9000).toString()
        } 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Donations</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select
                value={filters.foodType}
                onChange={(e) => setFilters({...filters, foodType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="vegetables">Vegetables</option>
                <option value="bread">Bread</option>
                <option value="non-perishable">Non-perishable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Any Distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters({...filters, urgency: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Urgency</option>
                <option value="high">High (expiring soon)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Urgency Indicator */}
                <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                  donation.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  donation.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {donation.urgency === 'high' ? 'Urgent' : donation.urgency === 'medium' ? 'Moderate' : 'Low'}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">{donation.title}</h2>
                <p className="text-gray-600 mb-4">From: {donation.donor}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{donation.availableQuantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{donation.expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{donation.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium">{donation.postedTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaimClick(donation)}
                  className="w-full bg-[#165e2a] hover:bg-[#124b22] text-white py-2 px-4 rounded-md"
                >
                  Claim Donation
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No donations found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more options</p>
          </div>
        )}

        {/* Claim Modal */}
        {showClaimModal && selectedDonation && (
          <div className="fixed inset-0 bg-[#f8f5f0]/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[#165e2a]" >
              {/* Mod Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Claim {selectedDonation.title}
                </h2>
                <button 
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Modal Content - Steps */}
              <div className="p-6">
                {/* Progress Steps */}
                <div className="flex justify-between mb-6 relative">
                  <div className={`flex flex-col items-center ${claimStep === 'quantity' ? 'text-[#165e2a]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      claimStep === 'quantity' ? 'bg-[#165e2a] text-white' : 'bg-gray-100'
                    }`}>
                      1
                    </div>
                    <span className="text-xs">Quantity</span>
                  </div>
                  <div className={`flex flex-col items-center ${claimStep === 'pickup' ? 'text-[#165e2a]' : claimStep === 'address' || claimStep === 'confirm' ? 'text-[#165e2a]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      claimStep === 'pickup' ? 'bg-[#165e2a] text-white' : 
                      claimStep === 'address' || claimStep === 'confirm' ? 'bg-[#165e2a] text-white' : 'bg-gray-100'
                    }`}>
                      2
                    </div>
                    <span className="text-xs">Pickup</span>
                  </div>
                  <div className={`flex flex-col items-center ${claimStep === 'address' ? 'text-[#165e2a]' : claimStep === 'confirm' ? 'text-[#165e2a]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      claimStep === 'address' ? 'bg-[#165e2a] text-white' : 
                      claimStep === 'confirm' ? 'bg-[#165e2a] text-white' : 'bg-gray-100'
                    }`}>
                      3
                    </div>
                    <span className="text-xs">Address</span>
                  </div>
                  <div className={`flex flex-col items-center ${claimStep === 'confirm' ? 'text-[#165e2a]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      claimStep === 'confirm' ? 'bg-[#165e2a] text-white' : 'bg-gray-100'
                    }`}>
                      4
                    </div>
                    <span className="text-xs">Confirm</span>
                  </div>
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div className={`h-full bg-[#165e2a] transition-all duration-300 ${
                      claimStep === 'quantity' ? 'w-1/4' :
                      claimStep === 'pickup' ? 'w-1/2' :
                      claimStep === 'address' ? 'w-3/4' :
                      'w-full'
                    }`}></div>
                  </div>
                </div>

              
                {claimStep === 'quantity' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">How much would you like to claim?</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max={selectedDonation.availableQuantity}
                        value={claimQuantity}
                        onChange={(e) => setClaimQuantity(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-lg font-medium min-w-[50px]">{claimQuantity} kg</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Available: {selectedDonation.availableQuantity} kg (you're claiming {Math.round((claimQuantity/selectedDonation.availableQuantity)*100)}%)
                    </p>
                  </div>
                )}

               
                {claimStep === 'pickup' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Select Pickup Method</h3>
                    <div className="space-y-3">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          pickupOption === 'volunteer' 
                            ? 'border-[#165e2a] bg-[#f0f7f2]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPickupOption('volunteer')}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                            pickupOption === 'volunteer' 
                              ? 'border-[#165e2a] bg-[#165e2a] text-white' 
                              : 'border-gray-400'
                          }`}>
                            {pickupOption === 'volunteer' && <i className="fas fa-check text-xs"></i>}
                          </div>
                          <h3 className="font-medium">Volunteer Delivery</h3>
                        </div>
                        <p className="text-gray-600 mt-2 ml-8">
                          A volunteer will pick up and deliver the donation to your location
                        </p>
                      </div>

                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          pickupOption === 'self' 
                            ? 'border-[#165e2a] bg-[#f0f7f2]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPickupOption('self')}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                            pickupOption === 'self' 
                              ? 'border-[#165e2a] bg-[#165e2a] text-white' 
                              : 'border-gray-400'
                          }`}>
                            {pickupOption === 'self' && <i className="fas fa-check text-xs"></i>}
                          </div>
                          <h3 className="font-medium">Self Pickup</h3>
                        </div>
                        <p className="text-gray-600 mt-2 ml-8">
                          You will pick up the donation from the donor's location
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Delivery Address */}
                {claimStep === 'address' && pickupOption === 'volunteer' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Delivery Address</h3>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">Donor's Address:</p>
                      <p className="font-medium">{selectedDonation.address}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Your Delivery Address:</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#165e2a] focus:border-transparent"
                        rows={3}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Leave blank to use your organization's default address
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {claimStep === 'confirm' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Confirm Your Claim</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Claim Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Donation:</span>
                          <span>{selectedDonation.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span>{claimQuantity} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup Method:</span>
                          <span>{pickupOption === 'volunteer' ? 'Volunteer Delivery' : 'Self Pickup'}</span>
                        </div>
                        {pickupOption === 'volunteer' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery To:</span>
                            <span>{deliveryAddress || 'Your default address'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      By confirming, you agree to our terms of donation acceptance
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Navigation */}
              <div className="p-4 border-t border-gray-200 flex justify-between">
                {claimStep !== 'quantity' ? (
                  <button
                    onClick={handlePrevStep}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Back
                  </button>
                ) : (
                  <div></div> 
                )}

                {claimStep !== 'confirm' ? (
                  <button
                    onClick={handleNextStep}
                    disabled={
                      (claimStep === 'pickup' && !pickupOption) ||
                      (claimStep === 'address' && pickupOption === 'volunteer' && !deliveryAddress)
                    }
                    className={`px-4 py-2 rounded-md ${
                      (claimStep === 'pickup' && !pickupOption) ||
                      (claimStep === 'address' && pickupOption === 'volunteer' && !deliveryAddress)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#165e2a] hover:bg-[#124b22] text-white'
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmClaim}
                    className="px-4 py-2 bg-[#165e2a] hover:bg-[#124b22] text-white rounded-md"
                  >
                    Confirm Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationDetails;