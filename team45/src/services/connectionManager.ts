

import { io, Socket as SocketIOSocket } from 'socket.io-client';

export type ConnectionMode = 'websocket' | 'polling' | 'simulation';
export type ConnectionStatus = 'connected' | 'connecting' | 'failed' | 'offline';

interface ConnectionConfig {
  websocketUrl: string;
  pollingUrl: string;
  pollingInterval: number;
  heartbeatInterval: number;
  maxRetries: number;
  retryDelay: number;
}

interface ConnectionEvent {
  type: 'location_update' | 'inactivity_alert' | 'analytics_update' | 'status_change';
  data: any;
  timestamp: string;
  source: ConnectionMode;
}

class ConnectionManager {
  private mode: ConnectionMode = 'websocket';
  private status: ConnectionStatus = 'offline';
  private socket: SocketIOSocket | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private isDemoMode = false;
  private listeners: ((event: ConnectionEvent) => void)[] = [];
  private statusListeners: ((mode: ConnectionMode, status: ConnectionStatus) => void)[] = [];

  private config: ConnectionConfig = {
    websocketUrl: 'http://localhost:5001',
    pollingUrl: 'http://localhost:5001/api/tracking',
    pollingInterval: 5000,
    heartbeatInterval: 30000,
    maxRetries: 3,
    retryDelay: 2000
  };

  constructor(config?: Partial<ConnectionConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.log('ConnectionManager initialized');
  }

  // Public API
  connect(): void {
    this.log('Starting connection process');
    
    this.setStatus('offline');
    this.log('Connection manager disabled - using static data only');
  }

  disconnect(): void {
    this.log('Disconnecting all connections');
    this.cleanup();
    this.setStatus('offline');
  }

  enableDemoMode(): void {
    this.log('🎭 Demo Mode ENABLED - Switching to simulation');
    this.isDemoMode = true;
    this.cleanup();
    this.startSimulation();
  }

  disableDemoMode(): void {
    this.log('🎭 Demo Mode DISABLED - Resuming normal connection');
    this.isDemoMode = false;
    this.cleanup();
    this.connect();
  }

  getMode(): ConnectionMode {
    return this.mode;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isDemoModeActive(): boolean {
    return this.isDemoMode;
  }

  onData(callback: (event: ConnectionEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  onStatusChange(callback: (mode: ConnectionMode, status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  // Connection Methods
  private async tryWebSocket(): Promise<void> {
    if (this.isDemoMode) return;

    this.log('🔗 Attempting Socket.IO connection...');
    this.setMode('websocket');
    this.setStatus('connecting');

    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('userToken');

      this.socket = io(this.config.websocketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: false,
        auth: {
          token: token
        },
        extraHeaders: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const connectTimeout = setTimeout(() => {
        this.log('❌ Socket.IO connection timeout');
        this.socket?.disconnect();
        this.fallbackToPolling();
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(connectTimeout);
        this.log('✅ Socket.IO connected successfully');
        this.setStatus('connected');
        this.retryCount = 0;
        this.startHeartbeat();
      });

      // Listen for tracking events
      this.socket.on('location_update', (data) => {
        try {
          this.emit({
            type: 'location_update',
            data: data,
            timestamp: new Date().toISOString(),
            source: 'websocket'
          });
        } catch (error) {
          this.log('❌ Socket.IO message parse error:', error);
        }
      });

      this.socket.on('inactivity_alert', (data) => {
        try {
          this.emit({
            type: 'inactivity_alert',
            data: data,
            timestamp: new Date().toISOString(),
            source: 'websocket'
          });
        } catch (error) {
          this.log('❌ Socket.IO message parse error:', error);
        }
      });

      this.socket.on('analytics_update', (data) => {
        try {
          this.emit({
            type: 'analytics_update',
            data: data,
            timestamp: new Date().toISOString(),
            source: 'websocket'
          });
        } catch (error) {
          this.log('❌ Socket.IO message parse error:', error);
        }
      });

      this.socket.on('disconnect', () => {
        clearTimeout(connectTimeout);
        this.log('❌ Socket.IO connection closed');
        this.cleanup();
        if (!this.isDemoMode) {
          this.fallbackToPolling();
        }
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout);
        this.log('❌ Socket.IO error:', error);
        this.fallbackToPolling();
      });

    } catch (error) {
      this.log('❌ WebSocket connection failed:', error);
      this.fallbackToPolling();
    }
  }

  private async tryPolling(): Promise<void> {
    if (this.isDemoMode) return;

    this.log('🔄 Starting HTTP polling...');
    this.setMode('polling');
    this.setStatus('connecting');

    const poll = async () => {
      try {
        const response = await fetch(`${this.config.pollingUrl}/deliveries/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
          }
        });

        if (response.ok) {
          if (this.status !== 'connected') {
            this.log('✅ Polling connected successfully');
            this.setStatus('connected');
            this.retryCount = 0;
          }

          const data = await response.json();
          this.emit({
            type: 'analytics_update',
            data: data.data,
            timestamp: new Date().toISOString(),
            source: 'polling'
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        this.log('❌ Polling request failed:', error);
        this.retryCount++;

        if (this.retryCount >= this.config.maxRetries) {
          this.log('❌ Max polling retries reached, falling back to simulation');
          this.fallbackToSimulation();
        } else {
          this.setStatus('failed');
        }
      }
    };

    // Initial poll
    await poll();

    // Set up polling interval
    if (this.status === 'connected') {
      this.pollingInterval = setInterval(poll, this.config.pollingInterval);
    }
  }

  private startSimulation(): void {
    this.log('🎮 Starting simulation mode');
    this.setMode('simulation');
    this.setStatus('connected');

    // Mock deliveries for simulation
    const mockDeliveries = [
      {
        id: 'sim-del-1',
        volunteer: 'Alex Thompson',
        route: 'Sandton → Soweto',
        currentLocation: { lat: -26.1076, lng: 28.0567 },
        speed: 45, // km/h
        heading: 180, // degrees
        lastAlert: null,
        alertProbability: 0.02 // 2% chance per update
      },
      {
        id: 'sim-del-2',
        volunteer: 'Maria Santos',
        route: 'Cape Town CBD → Khayelitsha',
        currentLocation: { lat: -33.9249, lng: 18.4241 },
        speed: 35,
        heading: 120,
        lastAlert: null,
        alertProbability: 0.015
      },
      {
        id: 'sim-del-3',
        volunteer: 'John Ndlovu',
        route: 'Pretoria → Mamelodi',
        currentLocation: { lat: -25.7479, lng: 28.2293 },
        speed: 50,
        heading: 90,
        lastAlert: null,
        alertProbability: 0.025
      }
    ];

    let tickCount = 0;

    const simulateUpdate = () => {
      tickCount++;

      mockDeliveries.forEach(delivery => {
        // Simulate realistic movement
        const speedKmH = delivery.speed + (Math.random() - 0.5) * 10; // Speed variation
        const speedMs = speedKmH / 3.6; // Convert to m/s
        const distanceM = speedMs * 3; // 3 seconds between updates

        // Convert distance to lat/lng (rough approximation for South Africa)
        const deltaLat = (distanceM * Math.cos(delivery.heading * Math.PI / 180)) / 111000;
        const deltaLng = (distanceM * Math.sin(delivery.heading * Math.PI / 180)) / (111000 * Math.cos(delivery.currentLocation.lat * Math.PI / 180));

        delivery.currentLocation.lat += deltaLat;
        delivery.currentLocation.lng += deltaLng;

        // Occasionally change direction
        if (Math.random() < 0.1) {
          delivery.heading += (Math.random() - 0.5) * 30;
          delivery.heading = (delivery.heading + 360) % 360;
        }

        // Emit location update
        this.emit({
          type: 'location_update',
          data: {
            deliveryId: delivery.id,
            latitude: delivery.currentLocation.lat,
            longitude: delivery.currentLocation.lng,
            speed: speedKmH,
            heading: delivery.heading,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          source: 'simulation'
        });

        // Random inactivity alerts for drama 
        if (Math.random() < delivery.alertProbability && !delivery.lastAlert) {
          delivery.lastAlert = Date.now() as any;
          this.log(`🚨 DEMO: Triggering inactivity alert for ${delivery.volunteer}`);

          this.emit({
            type: 'inactivity_alert',
            data: {
              deliveryId: delivery.id,
              volunteer: delivery.volunteer,
              severity: Math.random() > 0.7 ? 'high' : 'medium',
              location: delivery.currentLocation,
              lastMovement: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 min ago
            },
            timestamp: new Date().toISOString(),
            source: 'simulation'
          });
        }

        // Resolve alerts after some time
        if (delivery.lastAlert && Date.now() - delivery.lastAlert > 45000) {
          delivery.lastAlert = null;
          this.log(`✅ DEMO: Auto-resolving alert for ${delivery.volunteer}`);
        }
      });

      // Emit analytics updates every 10 ticks
      if (tickCount % 10 === 0) {
        this.emit({
          type: 'analytics_update',
          data: {
            totalDeliveries: 156 + Math.floor(tickCount / 10),
            activeDeliveries: mockDeliveries.length,
            completedToday: 8 + Math.floor(tickCount / 20),
            averageRating: 4.6 + (Math.random() - 0.5) * 0.2,
            onTimeDeliveries: 94 + Math.floor(Math.random() * 3),
            inactivityAlerts: mockDeliveries.filter(d => d.lastAlert).length
          },
          timestamp: new Date().toISOString(),
          source: 'simulation'
        });
      }
    };

    // Start simulation loop
    this.simulationInterval = setInterval(simulateUpdate, 3000); // Every 3 seconds
    this.log('🎮 Simulation started with realistic movement and events');
  }

  // Fallback chain
  private fallbackToPolling(): void {
    this.log('🔄 Polling disabled for production');
    this.setStatus('failed');
    return;
  }

  private fallbackToSimulation(): void {
    this.log('🎮 Simulation disabled for production');
    this.setStatus('failed');
    return;
  }

  // Utility methods
  private setMode(mode: ConnectionMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.notifyStatusChange();
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusChange();
    }
  }

  private notifyStatusChange(): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(this.mode, this.status);
      } catch (error) {
        this.log('Error in status listener:', error);
      }
    });
  }

  private emit(event: ConnectionEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.log('Error in event listener:', error);
      }
    });
  }

  private startHeartbeat(): void {
    if (this.mode !== 'websocket') return;

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, this.config.heartbeatInterval);
  }

  private cleanup(): void {
    // Socket.IO cleanup
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Clear all intervals
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private log(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    const modeFlag = this.isDemoMode ? '🎭' : '';
    console.log(`[${timestamp}] ${modeFlag}[ConnectionManager:${this.mode}] ${message}`, ...args);
  }
}

export const connectionManager = new ConnectionManager();
export default connectionManager;