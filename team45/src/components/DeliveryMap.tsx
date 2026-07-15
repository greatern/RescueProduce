import React, { useEffect, useRef, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface DeliveryMapProps {
  currentLocation?: Location;
  pickupLocation?: Location;
  destinationLocation?: Location;
  locationHistory?: Location[];
  className?: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  currentLocation,
  pickupLocation,
  destinationLocation,
  locationHistory = [],
  className = "w-full h-64"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapBounds, setMapBounds] = useState({
    minLat: -35,
    maxLat: -25,
    minLng: 15,
    maxLng: 35
  });

  // Calculate map bounds based on locations
  useEffect(() => {
    const allLocations = [
      currentLocation,
      pickupLocation,
      destinationLocation,
      ...locationHistory
    ].filter(Boolean) as Location[];

    if (allLocations.length > 0) {
      const lats = allLocations.map(loc => loc.lat);
      const lngs = allLocations.map(loc => loc.lng);

      const minLat = Math.min(...lats) - 0.01;
      const maxLat = Math.max(...lats) + 0.01;
      const minLng = Math.min(...lngs) - 0.01;
      const maxLng = Math.max(...lngs) + 0.01;

      setMapBounds({ minLat, maxLat, minLng, maxLng });
    }
  }, [currentLocation, pickupLocation, destinationLocation, locationHistory]);

  // Draw simple map visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { minLat, maxLat, minLng, maxLng } = mapBounds;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Convert lat/lng to canvas coordinates
    const toCanvasCoords = (lat: number, lng: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * width;
      const y = ((maxLat - lat) / (maxLat - minLat)) * height;
      return { x, y };
    };

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw location history path
    if (locationHistory.length > 1) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const firstCoord = toCanvasCoords(locationHistory[0].lat, locationHistory[0].lng);
      ctx.moveTo(firstCoord.x, firstCoord.y);

      for (let i = 1; i < locationHistory.length; i++) {
        const coord = toCanvasCoords(locationHistory[i].lat, locationHistory[i].lng);
        ctx.lineTo(coord.x, coord.y);
      }
      ctx.stroke();

      // Draw history points
      locationHistory.forEach((loc, index) => {
        const coord = toCanvasCoords(loc.lat, loc.lng);
        ctx.fillStyle = index === locationHistory.length - 1 ? '#2563eb' : '#93c5fd';
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw pickup location
    if (pickupLocation) {
      const coord = toCanvasCoords(pickupLocation.lat, pickupLocation.lng);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('P', coord.x, coord.y + 4);
    }

    // Draw destination location
    if (destinationLocation) {
      const coord = toCanvasCoords(destinationLocation.lat, destinationLocation.lng);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('D', coord.x, coord.y + 4);
    }

    // Draw current location (animated)
    if (currentLocation) {
      const coord = toCanvasCoords(currentLocation.lat, currentLocation.lng);

      // Pulsing circle animation
      const pulseRadius = 15 + Math.sin(Date.now() / 500) * 5;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, pulseRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Main location dot
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

  }, [currentLocation, pickupLocation, destinationLocation, locationHistory, mapBounds]);

  // Animation loop for pulsing current location
  useEffect(() => {
    if (!currentLocation) return;

    const animate = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Trigger re-render by updating a dummy state
        const ctx = canvas.getContext('2d');
        if (ctx && currentLocation) {
          // Just redraw the current location part
          const { minLat, maxLat, minLng, maxLng } = mapBounds;
          const { width, height } = canvas;
          const toCanvasCoords = (lat: number, lng: number) => {
            const x = ((lng - minLng) / (maxLng - minLng)) * width;
            const y = ((maxLat - lat) / (maxLat - minLat)) * height;
            return { x, y };
          };

          const coord = toCanvasCoords(currentLocation.lat, currentLocation.lng);

          // Clear area around current location
          ctx.clearRect(coord.x - 25, coord.y - 25, 50, 50);

          // Redraw background in cleared area
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(coord.x - 25, coord.y - 25, 50, 50);

          // Redraw grid in cleared area
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            const y = (i / 10) * height;

            if (x >= coord.x - 25 && x <= coord.x + 25) {
              ctx.beginPath();
              ctx.moveTo(x, Math.max(0, coord.y - 25));
              ctx.lineTo(x, Math.min(height, coord.y + 25));
              ctx.stroke();
            }

            if (y >= coord.y - 25 && y <= coord.y + 25) {
              ctx.beginPath();
              ctx.moveTo(Math.max(0, coord.x - 25), y);
              ctx.lineTo(Math.min(width, coord.x + 25), y);
              ctx.stroke();
            }
          }

          // Redraw pulsing current location
          const pulseRadius = 15 + Math.sin(Date.now() / 500) * 5;
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, pulseRadius, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 6, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [currentLocation, mapBounds]);

  return (
    <div className={`${className} border rounded-lg overflow-hidden bg-gray-50`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={256}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded p-2 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Pickup</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;