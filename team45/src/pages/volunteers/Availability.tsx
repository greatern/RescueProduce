import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";

interface AvailabilitySlot {
    day_of_week: string;
    start_time: string;
    end_time: string;
}

interface AvailabilityResponse {
    availability: AvailabilitySlot | AvailabilitySlot[];
    message?: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Availability: React.FC = () => {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
        day_of_week: "",
        start_time: "",
        end_time: "",
    });

    const volunteerId = localStorage.getItem("userId") || "demo-volunteer-id";

    const fetchAvailability = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<AvailabilityResponse>(`/volunteers/${volunteerId}/availability`);
            if (response && response.availability) {
                setAvailability(Array.isArray(response.availability) ? response.availability : [response.availability]);
            } else {
                setAvailability([]);
            }
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                setAvailability([]);
                setError(null);
            } else {
                setError(err.response?.data?.message || "Failed to load availability.");
                setAvailability([]);
            }
        } finally {
            setLoading(false);
        }
    }, [volunteerId]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const handleNewSlotChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSlot((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) {
            alert("Please fill all fields.");
            return;
        }

        if (newSlot.start_time >= newSlot.end_time) {
            alert("Start time must be before end time.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post<AvailabilityResponse>(`/volunteers/${volunteerId}/availability`, newSlot);
            alert(response.message || "Slot added!");
            fetchAvailability();
            setNewSlot({ day_of_week: "", start_time: "", end_time: "" });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add slot.");
            alert("Failed to add slot - this is expected in demo mode");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotToDelete: AvailabilitySlot) => {
        if (!confirm(`Are you sure you want to delete your availability for ${slotToDelete.day_of_week}?`)) return;
        
        setLoading(true);
        try {
            await api.delete(`/volunteers/${volunteerId}/availability`, { data: slotToDelete });
            alert("Slot deleted!");
            fetchAvailability();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete slot.");
            alert("Failed to delete slot - this is expected in demo mode");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const groupAvailabilityByDay = () => {
        const grouped: { [key: string]: AvailabilitySlot[] } = {};
        availability.forEach(slot => {
            if (!grouped[slot.day_of_week]) {
                grouped[slot.day_of_week] = [];
            }
            grouped[slot.day_of_week].push(slot);
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className="main-content p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading availability...</p>
            </div>
        );
    }

    const groupedAvailability = groupAvailabilityByDay();

    return (
        <div className="main-content p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900">Manage Your Availability</h2>
                <p className="text-gray-600">Set your available times to receive task assignments that fit your schedule.</p>
            </div>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-700">Demo Mode: API calls may fail, but you can still test the interface.</p>
                </div>
            )}

            {/* Add New Availability Slot */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
                <div className="flex items-center mb-4">
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Add New Availability Slot</h3>
                </div>
                
                <form onSubmit={handleAddSlot} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-2">
                                Day of Week
                            </label>
                            <select
                                id="day_of_week"
                                name="day_of_week"
                                value={newSlot.day_of_week}
                                onChange={handleNewSlotChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select a day</option>
                                {daysOfWeek.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                            </label>
                            <input
                                type="time"
                                id="start_time"
                                name="start_time"
                                value={newSlot.start_time}
                                onChange={handleNewSlotChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                            </label>
                            <input
                                type="time"
                                id="end_time"
                                name="end_time"
                                value={newSlot.end_time}
                                onChange={handleNewSlotChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {loading ? "Adding..." : "Add Availability Slot"}
                    </button>
                </form>
            </div>

            {/* Current Availability */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Your Current Availability</h3>
                </div>
                
                {Object.keys(groupedAvailability).length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No availability slots set</p>
                        <p className="text-gray-400 mt-2">Add your first availability slot above to start receiving task assignments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                    {day}
                                </h4>
                                
                                {groupedAvailability[day] ? (
                                    <div className="space-y-2">
                                        {groupedAvailability[day].map((slot, index) => (
                                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSlot(slot)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Delete this time slot"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No availability set</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-3">💡 Quick Tips</h4>
                <ul className="text-blue-800 text-sm space-y-2">
                    <li>• Set multiple time slots for the same day if you have breaks in your schedule</li>
                    <li>• Keep your availability updated to receive relevant task assignments</li>
                    <li>• You can modify your availability anytime by deleting and adding new slots</li>
                    <li>• Task assignments will only be sent during your available hours</li>
                </ul>
            </div>
        </div>
    );
};

export default Availability;