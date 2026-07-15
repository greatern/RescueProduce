import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Package, Filter, RefreshCw, CheckCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  pickup_location?: string;
  dropoff_location?: string;
  assigned_volunteer_id?: string | null;
  // Added: Enhanced task details
  weight_kg?: number;
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
  pickup_deadline?: string;
  estimated_duration_minutes?: number;
  bonus_points?: number;
  distance?: number;
}

interface TasksFetchResponse {
    tasks: Task[];
}

interface TaskAcceptResponse {
    message: string;
    task: Task;
}

const Tasks: React.FC = () => {
    const navigate = useNavigate();
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortBy, setSortBy] = useState<'due_date' | 'title' | 'location'>('due_date');
    const [showFilters, setShowFilters] = useState(false);
    
    const volunteerId = localStorage.getItem("userId");

    const fetchAvailableTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<TasksFetchResponse>("/tasks");
            const filtered = response.tasks.filter((task: Task) => 
                !task.assigned_volunteer_id &&
                ['pending', 'available', 'needs_delivery_volunteer'].includes(task.status)
            );
            setAvailableTasks(filtered);
        } catch (error) {
            console.error("Failed to fetch available tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvailableTasks();
    }, [fetchAvailableTasks]);

    // Filter and sort tasks
    useEffect(() => {
        let filtered = availableTasks.filter((task: Task) => {
            const matchesSearch = 
                task.title?.toLowerCase().includes(filter.toLowerCase()) ||
                task.description?.toLowerCase().includes(filter.toLowerCase());
            
            const matchesLocation = 
                !locationFilter ||
                task.pickup_location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
                task.dropoff_location?.toLowerCase().includes(locationFilter.toLowerCase());
            
            return matchesSearch && matchesLocation;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'due_date':
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'location':
                    return (a.pickup_location || '').localeCompare(b.pickup_location || '');
                default:
                    return 0;
            }
        });

        setFilteredTasks(filtered);
    }, [availableTasks, filter, locationFilter, sortBy]);

    const handleAcceptTask = async (taskId: string) => {
        if (!volunteerId) {
            alert("Please log in to accept tasks.");
            navigate("/login");
            return;
        }
        
        setAcceptingTaskId(taskId);
        try {
            await api.patch<TaskAcceptResponse>(`/tasks/${taskId}`, { 
                assigned_volunteer_id: volunteerId, 
                status: "assigned" 
            });
            alert('Task accepted successfully!');
            fetchAvailableTasks(); // Refresh the list
        } catch (error) {
            alert('Failed to accept task. It may have already been taken.');
        } finally {
            setAcceptingTaskId(null);
        }
    };

    // Added: Enhanced urgency detection
    const getUrgencyInfo = (task: Task) => {
        const due = new Date(task.due_date);
        const now = new Date();
        const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Use task urgency_level if available, otherwise calculate
        const urgencyLevel = task.urgency_level || 
            (hoursUntilDue <= 2 ? 'critical' :
             hoursUntilDue <= 6 ? 'high' :
             hoursUntilDue <= 24 ? 'medium' : 'low');
        
        return {
            level: urgencyLevel,
            isUrgent: hoursUntilDue <= 4,
            hoursUntilDue: Math.max(0, hoursUntilDue)
        };
    };

    const getUrgencyColor = (urgencyLevel: string) => {
        switch (urgencyLevel) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const isUrgent = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDue <= 4; // Urgent if due within 4 hours
    };

    const formatTimeLeft = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diffInHours = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 0) return "Overdue";
        if (diffInHours < 1) return "Due soon";
        if (diffInHours < 24) return `${diffInHours}h left`;
        
        const days = Math.floor(diffInHours / 24);
        return `${days}d ${diffInHours % 24}h left`;
    };

    return (
        <div className="main-content p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tasks</h1>
                            <p className="text-gray-600">Find opportunities to make an impact in your community.</p>
                        </div>
                        <button
                            onClick={fetchAvailableTasks}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Package className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{availableTasks.length}</div>
                                    <div className="text-sm text-gray-500">Total Available</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {availableTasks.filter(task => isUrgent(task.due_date)).length}
                                    </div>
                                    <div className="text-sm text-gray-500">Urgent Tasks</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
                                    <div className="text-sm text-gray-500">Matching Filters</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="text"
                                    placeholder="Search by title or description..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input 
                                            type="text"
                                            placeholder="Filter by pickup or dropoff location..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={locationFilter}
                                            onChange={e => setLocationFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value as 'due_date' | 'title' | 'location')}
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="due_date">Due Date (Earliest First)</option>
                                        <option value="title">Task Title (A-Z)</option>
                                        <option value="location">Pickup Location (A-Z)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tasks List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading available tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500 mb-4">
                            {availableTasks.length === 0 
                                ? "There are no available tasks at the moment."
                                : "No tasks match your current search criteria."}
                        </p>
                        {availableTasks.length > 0 && (
                            <button
                                onClick={() => {
                                    setFilter('');
                                    setLocationFilter('');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task: Task) => {
                            const urgencyInfo = getUrgencyInfo(task);
                            const isAccepting = acceptingTaskId === task.id;
                            
                            return (
                                <div 
                                    key={task.id} 
                                    className={`bg-white p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${
                                        urgencyInfo.isUrgent ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-xl text-gray-900">{task.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(urgencyInfo.level)}`}>
                                                        {urgencyInfo.level.toUpperCase()}
                                                    </span>
                                                    {task.bonus_points && task.bonus_points > 100 && (
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                            +{task.bonus_points - 100} Bonus
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-600 mb-3">{task.description}</p>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                                                    <span className="font-semibold">From:</span>
                                                    <span className="ml-1">{task.pickup_location || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-2 text-red-600" />
                                                    <span className="font-semibold">To:</span>
                                                    <span className="ml-1">{task.dropoff_location || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                                    <span className="font-semibold">Due:</span>
                                                    <span className="ml-1">{new Date(task.due_date).toLocaleString()}</span>
                                                    <span className={`ml-2 text-xs font-medium ${
                                                        urgencyInfo.isUrgent ? 'text-orange-600' : 'text-gray-500'
                                                    }`}>
                                                        ({formatTimeLeft(task.due_date)})
                                                    </span>
                                                </div>
                                                
                                                {/* Added: Enhanced task details */}
                                                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                                                    {task.weight_kg && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Package className="w-4 h-4 mr-2 text-purple-600" />
                                                            <span className="font-semibold">Weight:</span>
                                                            <span className="ml-1">{task.weight_kg} kg</span>
                                                        </div>
                                                    )}
                                                    {task.estimated_duration_minutes && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                                            <span className="font-semibold">Duration:</span>
                                                            <span className="ml-1">{task.estimated_duration_minutes} min</span>
                                                        </div>
                                                    )}
                                                    {task.distance && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                                                            <span className="font-semibold">Distance:</span>
                                                            <span className="ml-1">{task.distance.toFixed(1)} km</span>
                                                        </div>
                                                    )}
                                                    {task.pickup_deadline && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Clock className="w-4 h-4 mr-2 text-amber-600" />
                                                            <span className="font-semibold">Pickup by:</span>
                                                            <span className="ml-1">{new Date(task.pickup_deadline).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-shrink-0">
                                            <button 
                                                onClick={() => handleAcceptTask(task.id)}
                                                disabled={isAccepting}
                                                className={`w-full lg:w-auto px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
                                                    urgencyInfo.level === 'critical' 
                                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                        : urgencyInfo.level === 'high'
                                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isAccepting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Accepting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Accept Task
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;