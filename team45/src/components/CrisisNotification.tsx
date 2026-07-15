import React, { useState, useEffect } from 'react';
import { Alert, Button, Modal, notification } from 'antd';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface CrisisAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  message: string;
  title: string;
  timestamp: Date;
}

interface CrisisNotificationProps {
  userId?: string;
  userType?: 'donor' | 'receiver' | 'volunteer' | 'admin';
}

const CrisisNotification: React.FC<CrisisNotificationProps> = ({
  userId,
  userType = 'donor'
}) => {
  const [activeAlerts, setActiveAlerts] = useState<CrisisAlert[]>([]);
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [lockdownMessage, setLockdownMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  void Alert;
  void socket;

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:5001', {
      path: '/crisis-socket/',
    });

    newSocket.on('connect', () => {
      console.log('Connected to crisis notification system');

      // Join appropriate room based on user type
      if (userType === 'admin') {
        newSocket.emit('join-admin-room', { adminId: userId, role: 'admin' });
      } else if (userType === 'volunteer') {
        newSocket.emit('join-volunteer-room', { volunteerId: userId });
      } else {
        newSocket.emit('join-user-room', { userId });
      }
    });

    // Listen for crisis alerts
    newSocket.on('crisis-alert', (data: any) => {
      const alert: CrisisAlert = {
        id: data.crisisId,
        severity: data.severity,
        message: data.message,
        title: data.title || 'Emergency Alert',
        timestamp: new Date(data.timestamp),
      };

      setActiveAlerts(prev => [...prev, alert]);
      showNotification(alert);
    });

    // Listen for emergency alerts
    newSocket.on('emergency-alert', (data: any) => {
      const alert: CrisisAlert = {
        id: data.crisisId,
        severity: data.severity,
        message: data.message,
        title: data.title,
        timestamp: new Date(data.timestamp),
      };

      setActiveAlerts(prev => [...prev, alert]);
      showEmergencyModal(alert);
    });

    // Listen for crisis resolution
    newSocket.on('crisis-resolved', (data: any) => {
      setIsLockdownActive(false);
      setActiveAlerts(prev => prev.filter(alert => alert.id !== data.crisisId));

      notification.success({
        message: 'Crisis Resolved',
        description: data.message,
        duration: 10,
      });
    });

    // Listen for delivery cancellations (for volunteers)
    if (userType === 'volunteer') {
      newSocket.on('delivery-cancelled', (data: any) => {
        notification.warning({
          message: 'Delivery Cancelled',
          description: `Your delivery has been cancelled due to an emergency situation. Reason: ${data.reason}`,
          duration: 15,
        });
      });

      newSocket.on('task-cancelled', (data: any) => {
        notification.warning({
          message: 'Task Cancelled',
          description: `Your task has been cancelled due to an emergency situation. Reason: ${data.reason}`,
          duration: 15,
        });
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, userType]);

  const showNotification = (alert: CrisisAlert) => {
    const type = getSeverityNotificationType(alert.severity);

    notification[type]({
      message: alert.title,
      description: alert.message,
      duration: alert.severity === 'emergency' ? 0 : 15, 
      placement: 'topRight',
    });

    
    if (['critical', 'emergency'].includes(alert.severity)) {
      setIsLockdownActive(true);
      setLockdownMessage(alert.message);
    }
  };

  const showEmergencyModal = (alert: CrisisAlert) => {
    Modal.error({
      title: '🚨 EMERGENCY ALERT',
      content: (
        <div className="space-y-3">
          <div className="text-lg font-semibold text-red-600">
            {alert.title}
          </div>
          <div className="text-base">
            {alert.message}
          </div>
          <div className="text-sm text-gray-500">
            Issued: {alert.timestamp.toLocaleString()}
          </div>
        </div>
      ),
      okText: 'Acknowledged',
      width: 500,
    });

    setIsLockdownActive(true);
    setLockdownMessage(alert.message);
  };

  const getSeverityNotificationType = (severity: string) => {
    switch (severity) {
      case 'emergency':
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'success';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-600';
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      default:
        return 'bg-blue-500';
    }
  };

  const dismissAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));

    
    const remainingCriticalAlerts = activeAlerts.filter(
      alert => alert.id !== alertId && ['critical', 'emergency'].includes(alert.severity)
    );

    if (remainingCriticalAlerts.length === 0) {
      setIsLockdownActive(false);
    }
  };

  const dismissLockdown = () => {
    setIsLockdownActive(false);
    
  };

  return (
    <>
      {/* Lockdown Banner */}
      <AnimatePresence>
        {isLockdownActive && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  <div>
                    <div className="font-bold">🚨 EMERGENCY SITUATION</div>
                    <div className="text-sm">{lockdownMessage}</div>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  className="text-white hover:text-gray-200"
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={dismissLockdown}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Alert Cards */}
      <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
        <AnimatePresence>
          {activeAlerts.slice(0, 3).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`${getSeverityColor(alert.severity)} text-white rounded-lg shadow-lg p-4`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {alert.title}
                  </div>
                  <div className="text-xs opacity-90 mb-2">
                    {alert.message}
                  </div>
                  <div className="text-xs opacity-75">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  className="text-white hover:text-gray-200 ml-2"
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={() => dismissAlert(alert.id)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Alert Counter */}
      {activeAlerts.length > 3 && (
        <div className="fixed top-20 right-4 z-41 mt-2">
          <div className="bg-gray-800 text-white rounded-full px-3 py-1 text-xs">
            +{activeAlerts.length - 3} more alerts
          </div>
        </div>
      )}
    </>
  );
};

export default CrisisNotification;
