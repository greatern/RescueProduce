import { useState, useEffect } from 'react';
import { Truck, AlertCircle, ShieldOff, Shield, RotateCw, MapPin, Clock, AlertTriangle, Eye, Navigation, Users, Star, TrendingUp, Activity } from 'lucide-react';
import DeliveryMap from '../../components/DeliveryMap';
import { deliveryTrackingService } from '../../services/deliveryTrackingService';

interface Zone {
  id: string;
  name: string;
  status: 'active' | 'suspended';
  reason?: string;
  suspendedAt?: string;
  coordinates?: string;
}

interface Delivery {
  id: string;
  donor: string;
  recipient: string;
  volunteer?: string;
  items: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  pickupTime: string;
  zone: string;
  // Enhanced tracking fields
  currentLocation?: { lat: number; lng: number };
  eta?: string;
  lastUpdate?: string;
  conditionRating?: number;
  weightVerified?: boolean;
  signatureCaptured?: boolean;
  inactivityAlert?: boolean;
  distance?: number;
}


interface DeliveryAnalytics {
  totalDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  averageRating: number;
  onTimeDeliveries: number;
  inactivityAlerts: number;
}

const DeliveryManagement = () => {

  const [zones, setZones] = useState<Zone[]>([]);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const [analytics, setAnalytics] = useState<DeliveryAnalytics>({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedToday: 0,
    averageRating: 0,
    onTimeDeliveries: 0,
    inactivityAlerts: 0
  });

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const [emergencyPassword, setEmergencyPassword] = useState('');
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const suspendZone = async (zoneId: string) => {
    if (emergencyPassword !== 'RESCUEPROTECT') {
      alert('Invalid emergency password');
      return;
    }

    const suspendedZone = zones.find(z => z.id === zoneId);
    if (!suspendedZone) return;

    try {
      // Call API to suspend zone and cancel deliveries
      const response = await fetch('http://localhost:5001/api/admin/zones/suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneId,
          reason: 'Emergency suspension',
          password: emergencyPassword
        })
      });

      if (response.ok) {
        // Update local state
        setZones(zones.map(z =>
          z.id === zoneId
            ? {
                ...z,
                status: 'suspended',
                reason: 'Emergency suspension',
                suspendedAt: new Date().toISOString()
              }
            : z
        ));

        // Refresh deliveries to show cancelled ones
        fetchDeliveries();

        alert('Zone suspended successfully');
      } else {
        alert('Failed to suspend zone');
      }
    } catch (error) {
      console.error('Error suspending zone:', error);
      alert('Error suspending zone');
    }

    // Clear password field
    setEmergencyPassword('');
  };

  const reactivateZone = async (zoneId: string) => {
    try {
      // Call API to reactivate zone
      const response = await fetch('http://localhost:5001/api/admin/zones/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zoneId })
      });

      if (response.ok) {
        // Update local state
        setZones(zones.map(z =>
          z.id === zoneId
            ? { ...z, status: 'active', reason: undefined, suspendedAt: undefined }
            : z
        ));

        alert('Zone reactivated successfully');
      } else {
        alert('Failed to reactivate zone');
      }
    } catch (error) {
      console.error('Error reactivating zone:', error);
      alert('Error reactivating zone');
    }

    setShowReactivateModal(false);
    setSelectedZone(null);
  };

  const getDeliveryStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openTrackingModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowTrackingModal(true);
  };

  const assignVolunteer = async (deliveryId: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/deliveries/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryId })
      });

      if (response.ok) {
        alert('Volunteer assignment request sent');
        // Refresh deliveries to show updated status
        fetchDeliveries();
      } else {
        alert('Failed to assign volunteer');
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      alert('Error assigning volunteer');
    }
  };

  const contactVolunteer = async (deliveryId: string, message: string, priority: 'low' | 'medium' | 'high') => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/contact-volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryId,
          message,
          priority
        })
      });

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error contacting volunteer:', error);
      return false;
    }
  };


  const formatLastUpdate = (timestamp: string) => {
    const now = Date.now();
    const updateTime = new Date(timestamp).getTime();
    const minutesAgo = Math.floor((now - updateTime) / (1000 * 60));

    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ${minutesAgo % 60}m ago`;
  };


  // API functions for fetching real data
  const fetchDeliveries = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/tracking/deliveries/active');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.deliveries) {
          const transformedDeliveries = result.deliveries.map((delivery: any) => ({
            id: delivery.id,
            donor: delivery.donorName || 'Unknown Donor',
            recipient: delivery.receiverName || 'Unknown Recipient',
            volunteer: delivery.volunteerName || 'Unassigned',
            items: delivery.items || delivery.description || 'Food items',
            status: delivery.status === 'confirmed' ? 'pending' :
                   delivery.status === 'collected' || delivery.status === 'en_route' ? 'in-progress' :
                   delivery.status === 'completed' ? 'completed' : 'pending',
            pickupTime: delivery.pickup_time || delivery.created_at,
            zone: 'zone1', // Default zone until zones API is implemented
            currentLocation: delivery.currentLocation ? {
              lat: delivery.currentLocation.latitude,
              lng: delivery.currentLocation.longitude
            } : undefined,
            eta: delivery.eta?.estimated_arrival || undefined,
            lastUpdate: delivery.lastUpdate || new Date().toISOString(),
            inactivityAlert: delivery.activeAlerts > 0,
            distance: delivery.distance || 0,
            conditionRating: delivery.conditionRating,
            weightVerified: delivery.weightVerified || false,
            signatureCaptured: delivery.signatureCaptured || false
          }));
          setDeliveries(transformedDeliveries);
        }
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch delivery analytics
      const response = await fetch('http://localhost:5001/api/admin/analytics/delivery');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.analytics) {
          setAnalytics({
            totalDeliveries: result.analytics.totalDeliveries || 0,
            activeDeliveries: result.analytics.activeDeliveries || 0,
            completedToday: result.analytics.completedToday || 0,
            averageRating: result.analytics.averageRating || 0,
            onTimeDeliveries: result.analytics.onTimeDeliveries || 0,
            inactivityAlerts: result.analytics.inactivityAlerts || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Keep default values if API fails
    }
  };

  const fetchZones = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/zones');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.zones) {
          setZones(result.zones);
        } else {
          console.error('Failed to fetch zones:', result);
        }
      } else {
        console.error('API response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchDeliveries();
    fetchAnalytics();
    fetchZones();

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDeliveries();
      fetchAnalytics();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
          <Truck className="mr-2" /> Delivery Management
        </h1>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalDeliveries}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-green-600">{analytics.activeDeliveries}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.completedToday}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.averageRating}/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Time %</p>
              <p className="text-2xl font-bold text-green-600">{analytics.onTimeDeliveries}%</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-red-600">{analytics.inactivityAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Emergency Zone Management */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          Emergency Zone Management
        </h2>
        
        <div className="space-y-3">
          {zones.map(zone => (
            <div key={zone.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg">
              <div className="mb-2 md:mb-0">
                <div className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {zone.name}
                </div>
                {zone.status === 'suspended' && (
                  <div className="text-sm text-red-600 mt-1">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {zone.reason} • Suspended on {new Date(zone.suspendedAt || '').toLocaleString()}
                    </div>
                  </div>
                )}
                {zone.coordinates && (
                  <div className="text-xs text-gray-500 mt-1">
                    Coordinates: {zone.coordinates}
                  </div>
                )}
              </div>
              
              {zone.status === 'active' ? (
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="password"
                    placeholder="Emergency password"
                    className="border rounded px-2 py-1 text-sm w-full md:w-auto"
                    value={emergencyPassword}
                    onChange={(e) => setEmergencyPassword(e.target.value)}
                  />
                  <button 
                    onClick={() => suspendZone(zone.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center justify-center text-sm"
                  >
                    <ShieldOff className="h-4 w-4 mr-1" /> Suspend Zone
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs flex items-center">
                    <ShieldOff className="h-3 w-3 mr-1" /> Suspended
                  </span>
                  <button
                    onClick={() => {
                      setSelectedZone(zone);
                      setShowReactivateModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded flex items-center text-sm"
                  >
                    <RotateCw className="h-4 w-4 mr-1" /> Reactivate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          <p className="font-medium">Zone suspension will automatically:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Cancel all pending pickups in the zone</li>
            <li>Notify affected volunteers and NGOs via SMS/email</li>
            <li>Display warning banners on all dashboards</li>
            <li>Require admin authentication to reactivate</li>
            <li>Log the action in the audit trail with timestamp</li>
          </ul>
        </div>
      </div>

      {/* Active Deliveries with Enhanced Tracking */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3 flex items-center justify-between">
          <span>Active Deliveries</span>
          <span className="text-sm text-gray-500">
            {deliveries.filter(d => d.status === 'in-progress').length} active • {deliveries.filter(d => d.inactivityAlert).length} alerts
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.map(delivery => (
            <div key={delivery.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${delivery.inactivityAlert ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{delivery.donor} → {delivery.recipient}</h3>
                  {delivery.volunteer && (
                    <p className="text-sm text-gray-600 mt-1">Volunteer: {delivery.volunteer}</p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded text-xs ${getDeliveryStatusColor(delivery.status)}`}>
                    {delivery.status.replace('-', ' ')}
                  </span>
                  {delivery.inactivityAlert && (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 text-sm space-y-2">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Pickup: {new Date(delivery.pickupTime).toLocaleString()}
                </div>

                {delivery.eta && (
                  <div className="flex items-center text-blue-600">
                    <Navigation className="h-4 w-4 mr-1" />
                    ETA: {delivery.eta} ({delivery.distance}km)
                  </div>
                )}

                {delivery.lastUpdate && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Last update: {formatLastUpdate(delivery.lastUpdate)}
                  </div>
                )}

                <div className="mt-2">
                  <p className="font-medium text-sm">Items:</p>
                  <p className="text-sm text-gray-700">{delivery.items}</p>
                </div>

                {/* Progress indicators */}
                {delivery.status === 'in-progress' && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded ${delivery.weightVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Weight {delivery.weightVerified ? '✓' : '○'}
                    </span>
                    <span className={`px-2 py-1 rounded ${delivery.conditionRating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Rating {delivery.conditionRating ? `${delivery.conditionRating}★` : '○'}
                    </span>
                    <span className={`px-2 py-1 rounded ${delivery.signatureCaptured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Signature {delivery.signatureCaptured ? '✓' : '○'}
                    </span>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Zone: {zones.find(z => z.id === delivery.zone)?.name || 'Unknown'}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {delivery.status === 'pending' && (
                  <button
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center hover:bg-blue-200"
                    onClick={() => assignVolunteer(delivery.id)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Assign Volunteer
                  </button>
                )}
                {delivery.status === 'in-progress' && (
                  <button
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center hover:bg-green-200"
                    onClick={() => openTrackingModal(delivery)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Live Tracking
                  </button>
                )}
                <button
                  className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
                  onClick={() => {
                    // Could navigate to detailed view
                    alert(`View details for delivery ${delivery.id}`);
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reactivate Zone  */}
      {showReactivateModal && selectedZone && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Reactivate Zone</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to reactivate the {selectedZone.name} zone? This will:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-500 text-left mt-2 space-y-1">
                      <li>Allow new pickups to be scheduled</li>
                      <li>Remove warning banners</li>
                      <li>Notify previously affected users</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:col-start-2 sm:text-sm"
                  onClick={() => reactivateZone(selectedZone.id)}
                >
                  Reactivate Zone
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowReactivateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {showTrackingModal && selectedDelivery && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Live Tracking: {selectedDelivery.volunteer}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedDelivery.donor} → {selectedDelivery.recipient}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GPS Tracking Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">GPS Tracking</h4>
                    <div className="relative">
                      <DeliveryMap
                        currentLocation={selectedDelivery.currentLocation ? {
                          lat: selectedDelivery.currentLocation.lat,
                          lng: selectedDelivery.currentLocation.lng,
                          timestamp: selectedDelivery.lastUpdate
                        } : undefined}
                        pickupLocation={{
                          lat: zones.find(z => z.id === selectedDelivery.zone)?.coordinates ?
                            parseFloat(zones.find(z => z.id === selectedDelivery.zone)?.coordinates?.split(', ')[0] || '0') :
                            -26.2041,
                          lng: zones.find(z => z.id === selectedDelivery.zone)?.coordinates ?
                            parseFloat(zones.find(z => z.id === selectedDelivery.zone)?.coordinates?.split(', ')[1] || '0') :
                            28.0473
                        }}
                        destinationLocation={{
                          lat: selectedDelivery.currentLocation ? selectedDelivery.currentLocation.lat + 0.01 : -26.19,
                          lng: selectedDelivery.currentLocation ? selectedDelivery.currentLocation.lng + 0.01 : 28.06
                        }}
                        className="h-64"
                      />
                      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded p-2 text-xs">
                        <p className="text-gray-600">
                          Current: {selectedDelivery.currentLocation ?
                            `${selectedDelivery.currentLocation.lat.toFixed(4)}, ${selectedDelivery.currentLocation.lng.toFixed(4)}` :
                            'Location unavailable'
                          }
                        </p>
                        <p className="text-gray-500 mt-1">
                          Updated: {selectedDelivery.lastUpdate ? formatLastUpdate(selectedDelivery.lastUpdate) : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900">ETA</p>
                        <p className="text-lg font-bold text-blue-600">{selectedDelivery.eta || 'Calculating...'}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-900">Distance</p>
                        <p className="text-lg font-bold text-green-600">{selectedDelivery.distance || 0} km</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Progress Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Delivery Progress</h4>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${selectedDelivery.weightVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">Weight Verification</span>
                        {selectedDelivery.weightVerified && <span className="text-xs text-green-600">✓ Completed</span>}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${selectedDelivery.conditionRating ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">Condition Rating</span>
                        {selectedDelivery.conditionRating && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-green-600">✓</span>
                            <span className="text-xs text-yellow-600">{selectedDelivery.conditionRating}★</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${selectedDelivery.signatureCaptured ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">Digital Signature</span>
                        {selectedDelivery.signatureCaptured && <span className="text-xs text-green-600">✓ Captured</span>}
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-900">Activity Status</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        {selectedDelivery.inactivityAlert ?
                          'Inactivity detected - No movement for >15 minutes' :
                          'Active - Regular movement detected'
                        }
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Delivery Details</h5>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Items:</strong> {selectedDelivery.items}</p>
                        <p><strong>Pickup Time:</strong> {new Date(selectedDelivery.pickupTime).toLocaleString()}</p>
                        <p><strong>Zone:</strong> {zones.find(z => z.id === selectedDelivery.zone)?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={async () => {
                    const message = selectedDelivery.inactivityAlert
                      ? "We noticed no movement on your delivery. Please respond to confirm you're okay and provide an update."
                      : "Please provide an update on your delivery status.";

                    const success = await contactVolunteer(
                      selectedDelivery.id,
                      message,
                      selectedDelivery.inactivityAlert ? 'high' : 'medium'
                    );

                    if (success) {
                      alert('Volunteer contacted successfully');
                    } else {
                      alert('Failed to contact volunteer');
                    }
                  }}
                >
                  Contact Volunteer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowTrackingModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;