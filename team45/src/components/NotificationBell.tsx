import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { apiClient } from "../services/api";
import { useAuth } from "../contexts/AuthProvider";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

 const fetchNotifications = async () => {
    if (!user?.id) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Pass userId as query parameter
      const response = await fetch(`${apiUrl}/api/push-notifications?userId=${user?.id}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data.data && data.data.notifications) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount || 0);
      } else if (Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/api/push-notifications/notifications/${notificationId}/read`, {
        user_id: "admin-user-id",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/api/push-notifications/notifications/mark-all-read", {
        user_id: "admin-user-id",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center py-3 px-5 rounded-2xl transition-all w-full text-left ${
          location.pathname === "/notifications"
            ? "bg-green-100 text-green-700 font-semibold"
            : "text-gray-600 hover:bg-green-50 hover:text-green-700"
        }`}
      >
        <Bell className="h-5 w-5 mr-3" />
        Notifications
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] flex justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {loading && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

          {/* Panel */}
          <div className="fixed right-6 top-20 w-80 max-h-[calc(100vh-100px)] bg-white border border-green-200 shadow-xl rounded-lg z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-green-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-green-600 hover:text-green-800">
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-grow overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {loading ? "Loading notifications..." : "No notifications"}
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-green-50 hover:bg-green-100 cursor-pointer transition-colors ${
                      !n.is_read ? "bg-green-50" : "bg-white"
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{n.title}</h4>
                        {!n.is_read && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-600">{n.message}</p>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-green-100 flex-shrink-0">
              <Link
                to="/notifications"
                className="block text-center text-sm text-green-600 hover:text-green-800 py-2"
                onClick={() => setDropdownOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
