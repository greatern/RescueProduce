import React, { useState } from "react";
 import { receiverApi, Donation } from "../../service/receiver";
import { useAuth } from "../../contexts/AuthProvider";
//import { useAuth } from "../../../contexts/AuthContext";

interface ClaimProp {
  donation: Donation;
  onBack?: () => void;
  onClaimSuccess?: () => void;
}

export const formatDate = (date?: Date) => {
  if (!date) return "N/A";
  return new Date(date).toISOString().split("T")[0];
};

const getFoodImage = (category: string) => {
  const images: Record<string, string> = {
    vegetables: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    fruits: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba",
    meat: "https://media.istockphoto.com/id/505207430/photo/fresh-raw-beef-steak.jpg",
    dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    prepared: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    other: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  };
  return images[category.toLowerCase()] || images.other;
};

const ClaimScreen: React.FC<ClaimProp> = ({ donation, onBack, onClaimSuccess }) => {
  const { user } = useAuth();
  const [claimAmount, setClaimAmount] = useState("");
  const [procurementMethod, setProcurementMethod] = useState<"pickup" | "delivery" | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    //if (!address) {
    //  alert("Please add your address in Profile → Edit Address first.");
   //   return;
   // }
    if (!claimAmount || !procurementMethod) return;

    const confirm = window.confirm(
      `Claim ${claimAmount} box(es) ≈ ${
        parseInt(claimAmount) * donation.weight_per_unit
      } kg via ${procurementMethod}?`
    );
    if (!confirm) return;

    setIsClaiming(true);
    try {
      const res = await receiverApi.claim({
        listing_id: donation.id,
        receiver_id: user?.id!,
        claimed_quantity: parseInt(claimAmount),
        procurement_type: procurementMethod,
        distance: donation.distance_km ?? 0,
      });
      if (res.status === "success") {
        alert("Claim successful! Please wait for further instructions.");
        onClaimSuccess?.();
        onBack?.();
      } else {
        alert("Error claiming: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error while claiming.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow">
        <button
          onClick={onBack}
          className="flex items-center text-green-600 hover:text-green-800"
        >
          ← Back
        </button>
      </div>

      {/* Image */}
      <img
        src={getFoodImage(donation.food_category)}
        alt="food"
        className="w-full h-64 object-cover"
      />

      <div className="p-6 space-y-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-semibold text-green-700">
          {donation.food_category[0].toUpperCase() +
            donation.food_category.slice(1)}
        </h1>

        <div className="space-y-1 text-gray-700">
          <p><strong>Donor:</strong> {donation.donor_name}</p>
          <p><strong>Description:</strong> {donation.description}</p>
          <p><strong>Expiry:</strong> {formatDate(donation.expiry)}</p>
          <p><strong>Distance:</strong> {donation.distance_km ?? "N/A"} km</p>
        </div>

        {/* Claim Amount */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-1">Claim Amount</h2>
          <p className="text-sm text-gray-600">
            {donation.available_quantity} boxes (1 ={" "}
            {Math.ceil(donation.weight_per_unit)} kg)
          </p>
          <input
            type="number"
            min="1"
            max={donation.available_quantity}
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
            className="border rounded px-3 py-2 mt-2 w-full"
            placeholder="Enter number of boxes"
          />
        </div>

        {/* Procurement Method */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Procurement Method</h2>
          <div className="flex gap-4">
            {["pickup", "delivery"].map((method) => (
              <button
                key={method}
                onClick={() => setProcurementMethod(method as "pickup" | "delivery")}
                className={`flex-1 border rounded p-3 text-center capitalize
                  ${procurementMethod === method
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300"}
                `}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={!claimAmount || !procurementMethod || isClaiming}
          className={`w-full py-3 rounded text-white font-semibold
            ${!claimAmount || !procurementMethod || isClaiming
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"}
          `}
        >
          {isClaiming ? "Processing..." : "Confirm Claim"}
        </button>
      </div>
    </div>
  );
};

export default ClaimScreen;
